import { Request, Response, NextFunction } from 'express';
import ErrorResponse from '../utils/error.util';
import { arrayIncludes, asyncHandler } from '@btffamily/xpcommon';
import { CacheKeys, computeKey } from '../utils/cache.util'
import { validateMatch, IAddMatch, getDateTimeStamp, formatTime, IMatchStats } from '../services/match.sv'
import { sendMatchReminder } from '../crontab/match.cron'

import Fixture from '../models/Fixture.model';
import Team from '../models/Team.model';
import Match from '../models/Match.model';
import League from '../models/League.model';
import { generate } from '../utils/random.util';

import dayjs, { Dayjs } from 'dayjs'
import customparse from 'dayjs/plugin/customParseFormat';
import Country from '../models/Country.model';
import redis from '../middleware/redis.mw';
dayjs.extend(customparse);

// @desc    Get All Matches
// @route   GET /api/v1/matches
// access   Public
export const getMatches = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
	res.status(200).json(res.advancedResults);
})

// @desc    Get A Match
// @route   GET /api/v1/matches/:id
// access   Public
export const getMatch = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
	
	const match = await Match.findById(req.params.id).populate([
        { path: 'score.team' },
        { path: 'lineups.team' },
        { path: 'stats.team' },
        { path: 'homeTeam' },
        { path: 'country' },
        { path: 'teams' },
        { path: 'fixture' },
    ])

    if(!match){
        return next(new ErrorResponse('Error', 404, ['match does not exist']))
    }

    res.status(200).json({
        error: false,
        errors: [],
        data: match,
        message: 'successful',
        status: 200
    })

})

// @desc    Add A Match
// @route   POST /api/v1/matches
// access   Public
export const addMatch = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {

    const user = req.user;

    const gen = generate(8, false); // generate match ID

    const { round, type, season, stage, date, startTime, stadium, homeTeam, awayTeam, countryId, leagueId }: IAddMatch = req.body;

    const validate = await validateMatch({ round, type, season, stage, date, startTime, stadium, homeTeam, awayTeam, countryId, leagueId });

    if(validate.error === true){
        return next (new ErrorResponse('Error', 400, [`${validate.message}`]));
    }

    const league = await League.findOne({ _id: leagueId });

    if(!league){
        return next (new ErrorResponse('Error', 404, ['league does not exist']));
    }

    const country = await Country.findOne({ _id: countryId });

    if(!country){
        return next (new ErrorResponse('Error', 404, ['country does not exist']));
    }

    const teamHome = await Team.findOne({ _id: homeTeam });

    if(!teamHome){
        return next (new ErrorResponse('Error', 404, ['home team does not exist']));
    }

    const teamAway = await Team.findOne({ _id: awayTeam });

    if(!teamAway){
        return next (new ErrorResponse('Error', 404, ['away team does not exist']));
    }

    const dateData = await getDateTimeStamp(date);

    if(dateData.error === true){
        return next (new ErrorResponse('Error', 400, [`${dateData.message}`]));
    }

    const timeData = formatTime(startTime);

    if(timeData.error === true){
        return next (new ErrorResponse('Error', 400, [`${timeData.message}`]));
    }

    const dayTime = dayjs(`${timeData.hour}:${timeData.minutes}:${timeData.seconds}`);
    const ninety = dayTime.add(90, 'minute') // add 90 minutes to the start time

    // create match
    const match = await Match.create({
        round,
        matchType: type,
        matchID: gen.toString(),
        season: season,
        dateOfPlay: dateData.date,
        startTime: dayTime,
        endTime: ninety,
        stadium: stadium,
        homeTeam: teamHome._id,
        country: country._id,
        league: league._id
    })

    match.teams.push(teamHome._id);
    match.teams.push(teamAway._id);

    match.score.push({ team: teamHome._id, type: 'ft', count: 0 });
    match.score.push({ team: teamAway._id, type: 'ft', count: 0 });

    match.lineups.push({ team: teamHome._id,  players: []})
    match.lineups.push({ team: teamAway._id,  players: []});

    match.stats.push({
        team: teamHome._id,
        details: {
            shots: 0,
            passes: 0,
            passAccuracy: 0,
            shotOnTarget: 0,
            fouls: 0,
            redCards: 0,
            yellowCards: 0,
            corner: 0,
            cross: 0,
            possession: 0,
            offsides: 0
        }
    })

    match.stats.push({
        team: teamAway._id,
        details: {
            shots: 0,
            passes: 0,
            passAccuracy: 0,
            shotOnTarget: 0,
            fouls: 0,
            redCards: 0,
            yellowCards: 0,
            corner: 0,
            cross: 0,
            possession: 0,
            offsides: 0
        }
    });

    await match.save();

    // save relationships
    league.matches.push(match._id);
    await league.save();

    teamHome.matches.push({ league: league._id, playedAt: dateData.date }); 
    await teamHome.save();
    teamAway.matches.push({ league: league._id, playedAt: dateData.date });
    await teamAway.save();

    await redis.deleteData(CacheKeys.Matches);

    // send match reminders: run every seconds of every minute of every hour of every day of month of every month of every day of week
    const cron: string = `${timeData.seconds} */${timeData.minutes} */${timeData.hour} ${dateData.date.date()} ${(parseInt(dateData.date.month()) + 1 )} ${dateData.date.day()}`;
    await sendMatchReminder(cron, dayTime, match._id, user?.email);
	
    res.status(200).json({
        error: false,
        errors: [],
        data: match,
        message: 'successful',
        status: 200
    })

})

// @desc    Update A Match
// @route   PUT /api/v1/matches/:id
// access   Public
export const updateMatch = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
	
    const { type, season, stage, date, startTime, stadium, countryId, leagueId }: IAddMatch = req.body;

    const match = await Match.findOne({ _id: req.params.id });

    if(!match){
        return next (new ErrorResponse('Error', 404, ["match does not exist"]));
    }

    if(countryId){

        const country = await Country.findOne({ _id: countryId });

        if(!country){
            return next (new ErrorResponse('Error', 404, ['country does not exist']));
        }

        match.country = country._id;

    }

    if(leagueId){

        const league = await League.findOne({ _id: leagueId });

        if(!league){
            return next (new ErrorResponse('Error', 404, ['league does not exist']));
        }

        if(!arrayIncludes(league.matches, match._id.toString())){
            match.league = league._id;
        }
        
    }

    match.matchType = type ? type : match.matchType;
    match.season = season ? season : match.season;
    match.stage = stage ? stage : match.stage;
    match.stadium = stadium ? stadium : match.stadium;

    if(date){

        const dateData = await getDateTimeStamp(date);

        if(dateData.error === true){
            return next (new ErrorResponse('Error', 400, [`${dateData.message}`]));
        }

        match.dateOfPlay = dateData.date;
    }

    if(startTime){

        const timeData = formatTime(startTime);

        if(timeData.error === true){
            return next (new ErrorResponse('Error', 400, [`${timeData.message}`]));
        }

        const dayTime = dayjs(`${timeData.hour}:${timeData.minutes}:${timeData.seconds}`);
        const ninety = dayTime.add(90, 'minute') // add 90 minutes to the start time

        match.startTime = dayTime;
        match.endTime = ninety;

    }

    await match.save();

    await redis.deleteData(CacheKeys.Matches);

    res.status(200).json({
        error: false,
        errors: [],
        data: match,
        message: 'successful',
        status: 200
    })

})

// @desc    Update A Match Score
// @route   PUT /api/v1/matches/update-score/:id
// access   Public
export const updateScore = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
	
    const { teamId, score, type } = req.body;

    if(!teamId){
        return next (new ErrorResponse('Error', 400, ["team id is required"]));
    }

    if(!score){
        return next (new ErrorResponse('Error', 400, ["score is required"]));
    }

    if(!type){
        return next (new ErrorResponse('Error', 400, ["score type is required"]));
    }

    const match = await Match.findOne({ _id: req.params.id }).populate([
        { path: 'score.team' }
    ]);

    if(!match){
        return next (new ErrorResponse('Error', 404, ["match does not exist"]));
    }

    const team = await Team.findOne({ _id: teamId });

    if(!team){
        return next (new ErrorResponse('Error', 404, ["team does not exist"]));
    }

    if(!arrayIncludes(match.teams, team._id.toString())){
        return next (new ErrorResponse('Error', 500, ["match does not include team"]));
    }

    for(let i = 0; i < match.score.length; i++){

        if(match.score[i].team._id === team._id){

            match.score[i].type = type ? type : 'ft';
            match.score[i].count = parseInt(score); 
            await match.save();

        }

    }

    await redis.deleteData(CacheKeys.Matches);

    res.status(200).json({
        error: false,
        errors: [],
        data: match.score,
        message: 'successful',
        status: 200
    })

})

// @desc    Update A Match Score
// @route   PUT /api/v1/matches/update-stats/:id
// access   Public
export const updateStats = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
	
    const { teamId  } = req.body;
    const stats: Partial<IMatchStats> = req.body;

    const match = await Match.findOne({ _id: req.params.id });

    if(!match){
        return next (new ErrorResponse('Error', 404, ["match does not exist"]));
    }

    const team = await Team.findOne({ _id: teamId });

    if(!team){
        return next (new ErrorResponse('Error', 404, ["team does not exist"]));
    }

    if(!arrayIncludes(match.teams, team._id.toString())){
        return next (new ErrorResponse('Error', 500, ["match does not include team"]));
    }

    const index = match.stats.findIndex((st) => st.team === team._id);
    const existing = match.stats.find((st) => st.team === team._id);

    if(existing){

        existing.details.shots = stats.shots ? stats.shots : existing.details.shots;
        existing.details.passes = stats.passes ? stats.passes : existing.details.passes;
        existing.details.passAccuracy = stats.passAccuracy ? stats.passAccuracy : existing.details.passAccuracy;
        existing.details.shotOnTarget = stats.shotOnTarget ? stats.shotOnTarget : existing.details.shotOnTarget;
        existing.details.fouls = stats.fouls ? stats.fouls : existing.details.fouls;
        existing.details.redCards = stats.redCards ? stats.redCards : existing.details.redCards;
        existing.details.yellowCards = stats.yellowCards ? stats.yellowCards : existing.details.yellowCards;
        existing.details.corner = stats.corner ? stats.corner : existing.details.corner;
        existing.details.cross = stats.cross ? stats.cross : existing.details.cross;
        existing.details.possession = stats.possession ? stats.possession : existing.details.possession;
        existing.details.offsides = stats.offsides ? stats.offsides : existing.details.offsides;

        match.stats.splice(index, 1, existing);
        await match.save();
    }

    await redis.deleteData(CacheKeys.Matches);

    res.status(200).json({
        error: false,
        errors: [],
        data: match.stats,
        message: 'successful',
        status: 200
    })

})


// @desc    Add a league to a team
// @route   PUT /api/v1/matches/update-league/:id
// access   Public
export const updateLeague = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {

	const { code } = req.body;

    const match = await Fixture.findOne({ _id: req.params.id });

    if(!match){
        return next(new ErrorResponse('Error', 404, ['match does not exist']));
    }

    const league = await League.findOne({ code: code });

    if(!league){
        return next(new ErrorResponse('Error', 404, ['league does not exist']));
    }

    if(arrayIncludes(league.matches, match._id.toString())){
        return next(new ErrorResponse('Error', 404, ['match is already attached to league']));
    }

    match.league = league._id;
    await match.save();

    league.matches.push(league._id);
    await league.save();

    await redis.deleteData(CacheKeys.Matches);

    res.status(200).json({
        error: false,
        errors: [],
        data: match,
        message: 'successful',
        status: 200
    })

})



/** 
 * snippet
 * **/ 

// @desc        Login user (with verification)
// @route       POST /api/identity/v1/auth/login
// @access      Public
// export const funcd = asyncHandler(async (req: Request, res:Response, next: NextFunction) => {

// })
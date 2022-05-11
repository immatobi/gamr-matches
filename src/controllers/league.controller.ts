import { Request, Response, NextFunction } from 'express';
import ErrorResponse from '../utils/error.util';
import { arrayIncludes, asyncHandler } from '@btffamily/xpcommon';
import { CacheKeys, computeKey } from '../utils/cache.util'
import redis from '../middleware/redis.mw'

import League from '../models/League.model';
import Team from '../models/Team.model';
import Match from '../models/Match.model';
import Fixture from '../models/Fixture.model';

// @desc    Get All Leagues
// @route   GET /api/v1/leagues
// access   Public
export const getLeagues = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
	res.status(200).json(res.advancedResults);
})

// @desc    Get A League
// @route   GET /api/v1/leagues/:id
// access   Public
export const getLeague = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
	
	const league = await League.findById(req.params.id).populate([
        { path: 'fixtures', populate: [
            { path: 'matches' }
        ] },
        { path: 'matches', populate: [
            { path: 'teams' }
        ] },
        { path: 'teams' }
    ])

    if(!league){
        return next(new ErrorResponse('Error', 404, ['league does not exist']))
    }

    res.status(200).json({
        error: false,
        errors: [],
        data: league,
        message: 'successful',
        status: 200
    })

})

// @desc    Add A League
// @route   POST /api/v1/leagues
// access   Public
export const addLeague = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
	
    let _genCode: string = '';

	const { name, description, code } = req.body;

    const league = await League.create({
        name,
        description
    });

    if(!code){
        const spt = name.split(' ');
        _genCode = spt[0] + spt[1] + spt[3];
        league.code = _genCode.toUpperCase()
        await league.save();
    }else{
        league.code = code;
        await league.save();
    }

    await redis.deleteData(CacheKeys.Leagues);

    res.status(200).json({
        error: false,
        errors: [],
        data: league,
        message: 'successful',
        status: 200
    })

})

// @desc    Update A League
// @route   PUT /api/v1/leagues/:id
// access   Public
export const updateLeague = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
	
    let _genCode: string = '';

	const { name, description, code } = req.body;

    const league = await League.findOne({ _id: req.params.id });

    if(!league){
        return next(new ErrorResponse('Error', 404, ['league does not exist']));
    }

    league.name = name ? name : league.name;
    league.description = description ? description : league.description;
    await league.save();

    if(!code && name){
        _genCode = name.charAt(0) + name.charAt(1) + name.charAt(2);
        league.code = _genCode.toUpperCase()
        await league.save();
    }else{
        league.code = code
        await league.save();
    }

    await redis.deleteData(CacheKeys.Leagues);

    res.status(200).json({
        error: false,
        errors: [],
        data: league,
        message: 'successful',
        status: 200
    })

})

// @desc    Add a team to a league
// @route   PUT /api/v1/leagues/add-team/:id
// access   Public
export const addTeam = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {

	const { code } = req.body;

    const league = await League.findOne({ _id: req.params.id });

    if(!league){
        return next(new ErrorResponse('Error', 404, ['league does not exist']));
    }

    const team = await Team.findOne({ code: code });

    if(!team){
        return next(new ErrorResponse('Error', 404, ['team does not exist']));
    }

    if(arrayIncludes(league.teams, team._id.toString())){
        return next(new ErrorResponse('Error', 500, ['league already contains team']));
    }

    league.teams.push(team._id);
    await league.save();

    team.leagues.push(league._id);
    await team.save();

    await redis.deleteData(CacheKeys.Leagues);

    res.status(200).json({
        error: false,
        errors: [],
        data: league,
        message: 'successful',
        status: 200
    })

})

// @desc    Add a match to a league
// @route   PUT /api/v1/leagues/add-match/:id
// access   Public
export const addMatch = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {

	const { matchId } = req.body;

    const league = await League.findOne({ _id: req.params.id });

    if(!league){
        return next(new ErrorResponse('Error', 404, ['league does not exist']));
    }

    const match = await Match.findOne({ _id: matchId });

    if(!match){
        return next(new ErrorResponse('Error', 404, ['match does not exist']));
    }

    if(arrayIncludes(league.matches, match._id.toString())){
        return next(new ErrorResponse('Error', 500, ['league already contains match']));
    }

    league.matches.push(match._id);
    await league.save();

    await redis.deleteData(CacheKeys.Leagues);

    res.status(200).json({
        error: false,
        errors: [],
        data: league,
        message: 'successful',
        status: 200
    })

})

// @desc    Add a fixture to a league
// @route   PUT /api/v1/leagues/add-fixture/:id
// access   Public
export const addFixture = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {

	const { fixtureId } = req.body;

    const league = await League.findOne({ _id: req.params.id });

    if(!league){
        return next(new ErrorResponse('Error', 404, ['league does not exist']));
    }

    const fixture = await Fixture.findOne({ _id: fixtureId });

    if(!fixture){
        return next(new ErrorResponse('Error', 404, ['fixture does not exist']));
    }

    if(arrayIncludes(league.fixtures, fixture._id.toString())){
        return next(new ErrorResponse('Error', 500, ['league already contains fixture']));
    }

    league.fixtures.push(fixture._id);
    await league.save();

    fixture.league = league._id;
    await fixture.save();

    await redis.deleteData(CacheKeys.Leagues);

    res.status(200).json({
        error: false,
        errors: [],
        data: league,
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
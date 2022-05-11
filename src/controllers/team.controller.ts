import { Request, Response, NextFunction } from 'express';
import ErrorResponse from '../utils/error.util';
import { arrayIncludes, asyncHandler } from '@btffamily/xpcommon';
import { CacheKeys, computeKey } from '../utils/cache.util'
import redis from '../middleware/redis.mw'

import Team from '../models/Team.model';
import League from '../models/League.model';

// @desc    Get All Teams
// @route   GET /api/v1/teams
// access   Public
export const getTeams = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
	res.status(200).json(res.advancedResults);
})

// @desc    Get A Team
// @route   GET /api/v1/teams/:id
// access   Public
export const getTeam = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
	
	const team = await Team.findOne({ _id: req.params.id }).populate([
        { path: 'leagues' },
        { path: 'matches.league' }
    ])

    if(!team){
        return next(new ErrorResponse('Error', 404, ['team does not exist']))
    }

    res.status(200).json({
        error: false,
        errors: [],
        data: team,
        message: 'successful',
        status: 200
    })

})

// @desc    Add A Team
// @route   POST /api/v1/teams
// access   Public
export const addTeam = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {

    let _genCode: string;

	const { name, description, code, leagueId } = req.body;

    const league = await League.findOne({ _id: leagueId });

    if(!league){
        return next(new ErrorResponse('Error', 404, ['league does not exist']));
    }

    const team = await Team.create({
        name,
        description,
    });

    team.leagues.push(league._id);
    await team.save();

    if(!code){
        const spt = name.split(' ');
        _genCode = spt[0] + spt[1] + spt[3];
        team.code = _genCode.toUpperCase()
        await team.save();
    }else{
        team.code = code;
        await team.save();
    }

    await redis.deleteData(CacheKeys.Teams);

    res.status(200).json({
        error: false,
        errors: [],
        data: team,
        message: 'successful',
        status: 200
    })

})

// @desc    Update A Team
// @route   PUT /api/v1/teams/:id
// access   Public
export const updateTeam = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
	
    let _genCode: string = '';

	const { name, description, code } = req.body;

    const team = await Team.findOne({ _id: req.params.id });

    if(!team){
        return next(new ErrorResponse('Error', 404, ['team does not exist']));
    }

    team.name = name ? name : team.name;
    team.description = description ? description : team.description;
    await team.save();

    if(!code && name){
        const spt = name.split(' ');
        _genCode = spt[0] + spt[1] + spt[3];
        team.code = _genCode.toUpperCase()
        await team.save();
    }

    await redis.deleteData(CacheKeys.Teams);

    res.status(200).json({
        error: false,
        errors: [],
        data: team,
        message: 'successful',
        status: 200
    })

})

// @desc    Add a league to a team
// @route   PUT /api/v1/teams/update-league/:id
// access   Public
export const updateLeague = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {

	const { code } = req.body;

    const team = await Team.findOne({ _id: req.params.id });

    if(!team){
        return next(new ErrorResponse('Error', 404, ['team does not exist']));
    }

    const league = await League.findOne({ code: code });

    if(!league){
        return next(new ErrorResponse('Error', 404, ['league does not exist']));
    }

    if(arrayIncludes(team.leagues, league._id.toString())){
        return next(new ErrorResponse('Error', 500, ['team already contains league']));
    }

    league.teams.push(team._id);
    await league.save();

    team.leagues.push(league._id);
    await team.save();

    await redis.deleteData(CacheKeys.Teams);

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
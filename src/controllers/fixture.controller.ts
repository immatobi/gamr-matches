import { Request, Response, NextFunction } from 'express';
import ErrorResponse from '../utils/error.util';
import { arrayIncludes, asyncHandler } from '@btffamily/xpcommon';
import { CacheKeys, computeKey } from '../utils/cache.util'
import redis from '../middleware/redis.mw'

import Fixture from '../models/Fixture.model';
import Team from '../models/Team.model';
import Match from '../models/Match.model';
import League from '../models/League.model';
import { generate } from '../utils/random.util';
import { ObjectId } from 'mongoose';

// @desc    Get All Fixtures
// @route   GET /api/v1/fixtures
// access   Public
export const getFixtures = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
	res.status(200).json(res.advancedResults);
})

// @desc    Get A Fixture
// @route   GET /api/v1/fixtures/:id
// access   Public
export const getFixture = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
	
	const fixture = await Fixture.findById(req.params.id).populate([
        { path: 'matches', populate: [
            { path: 'teams' }
        ] },
        { path: 'league' }
    ])

    if(!fixture){
        return next(new ErrorResponse('Error', 404, ['fixture does not exist']))
    }

    res.status(200).json({
        error: false,
        errors: [],
        data: fixture,
        message: 'successful',
        status: 200
    })

})

// @desc    Add A Fixture
// @route   POST /api/v1/fixtures
// access   Public
export const addFixture = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {

    const gen = generate(8, false);

    const { description, matches, leagueId } = req.body;

    const league = await League.findOne({ _id: leagueId });

    if(!league){
        return next(new ErrorResponse('Error', 404, ['league does not exist']));
    }

    const fixture = await Fixture.create({
        fixtureID: 'FX-' + gen,
        description,
        league: league._id
    })

    if(matches && matches.length > 0){

        for(let i = 0; i < matches.length; i++){

            const match = await Match.findOne({ _id: matches[i] });

            if(match){
                fixture.matches.push(match._id);
                await fixture.save();
                league.matches.push(match._id);
                await league.save();
            }
        }

    }

    await redis.deleteData(CacheKeys.Fixtures);
	
    res.status(200).json({
        error: false,
        errors: [],
        data: fixture,
        message: 'successful',
        status: 200
    })

})

// @desc    Add matches to a fixture
// @route   PUT /api/v1/fixtures/add-matches/:id
// access   Public
export const addMatches = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
	
    const matches: Array<ObjectId> = req.body;

    if(!matches || matches.length <= 0){
        return next(new ErrorResponse('Error', 400, ['a list of matches is required']));
    }
    
    const fixture = await Fixture.findOne({ _id: req.params.id });

    if(!fixture){
        return next(new ErrorResponse('Error', 404, ['fixture does not exist']));
    }

    const league = await League.findOne({ _id: fixture.league });

    for(let i = 0; i < matches.length; i++){

        const match = await Match.findOne({ _id: matches[i] });

        if(match && !arrayIncludes(fixture.matches, match._id.toString())){

            fixture.matches.push(match._id);
            await fixture.save();

            league?.matches.push(match._id);
            await league?.save();

        }

    }

    const _fx = await Fixture.findOne({ _id: fixture._id }).populate([ { path: 'matches' } ]);

    await redis.deleteData(CacheKeys.Fixtures);

    res.status(200).json({
        error: false,
        errors: [],
        data: _fx?.matches,
        message: 'successful',
        status: 200
    })

})


// @desc    Add a league to a team
// @route   PUT /api/v1/fixtures/update-league/:id
// access   Public
export const updateLeague = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {

	const { code } = req.body;

    const fixture = await Fixture.findOne({ _id: req.params.id });

    if(!fixture){
        return next(new ErrorResponse('Error', 404, ['fixture does not exist']));
    }

    const league = await League.findOne({ code: code });

    if(!league){
        return next(new ErrorResponse('Error', 404, ['league does not exist']));
    }

    if(arrayIncludes(league.fixtures, fixture._id.toString())){
        return next(new ErrorResponse('Error', 404, ['fixture is already attached to league']));
    }

    fixture.league = league._id;
    await fixture.save();

    league.fixtures.push(league._id);
    await league.save();

    await redis.deleteData(CacheKeys.Fixtures);


    res.status(200).json({
        error: false,
        errors: [],
        data: fixture,
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
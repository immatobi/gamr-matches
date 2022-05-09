import { Request, Response, NextFunction } from 'express';
import ErrorResponse from '../utils/error.util';
import { asyncHandler, strIncludesEs6, strToArrayEs6 } from '@btffamily/xpcommon';
import { CacheKeys, computeKey } from '../utils/cache.util'
import redis from '../middleware/redis.mw'

// import models
import Bank from '../models/Bank.model';
import { generate } from '../utils/random.util';

// @desc        Register user
// @route       POST /api/identity/v1/auth/register
// @access      Public
export const getBanks = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
	res.status(200).json(res.advancedResults);
})

// @desc     Get a bank
// @route    GET /api/resource/v1/banks/:id
// @access   Public
export const getBank = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {

    const cached = await redis.fetchData(CacheKeys.Bank);

    if(cached !== null){

        res.status(200).json({
            error: false,
            errors: [],
            data: cached.data,
            message: `successful`,
            status: 200,
        });

    }
	
    const bank = await Bank.findOne({ _id: req.params.id });
 
   if (!bank) {
       return next(
           new ErrorResponse(`Not found`, 404, [`Cannot find bank`])
       );
   }

   // cache data
   await redis.keepData({ key: computeKey(process.env.NODE_ENV, CacheKeys.Bank), value: { data: bank }}, (15 * 86400));  // expire in 15 days
 
   res.status(200).json({
       error: false,
       errors: [],
       data: bank,
       message: `successful`,
       status: 200,
   });

})

// @desc     Add a bank
// @route    POST /api/resource/v1/banks
// @access   Private
export const createBank = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
	
	const { name, code, bankId, country, type, currency } = req.body;

    const bank = await Bank.create({
        name,
        code,
        bankId,
        country,
        type,
        currency,
        isEnabled: true
    });

    await redis.deleteData(CacheKeys.Banks);

    res.status(200).json({
        error: false,
        errors: [],
        data: bank,
        message: `successful`,
        status: 200,
    });

})

// @desc     Enable a Bank
// @route    PUT /api/resource/v1/banks/enable/:id
// @access   Public
export const enableBank = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {

    const bank = await Bank.findOne({ _id: req.params.id });

    if(!bank){
        return next(new ErrorResponse('Error', 404, ['bank does not exist']));
    }

    bank.isEnabled = true;
    await bank.save();

    await redis.deleteData(CacheKeys.Banks);
    await redis.deleteData(CacheKeys.Bank);

    res.status(200).json({
        error: false,
        errors: [],
        data: null,
        message: `successful`,
        status: 200,
    });
})

// @desc     Disable a Bank
// @route    PUT /api/resource/v1/banks/disable/:id
// @access   Public
export const disableBank = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {

    const bank = await Bank.findOne({ _id: req.params.id });

    if(!bank){
        return next(new ErrorResponse('Error', 404, ['bank does not exist']));
    }

    bank.isEnabled = false;
    await bank.save();

    await redis.deleteData(CacheKeys.Banks);
    await redis.deleteData(CacheKeys.Bank);

    res.status(200).json({
        error: false,
        errors: [],
        data: null,
        message: `successful`,
        status: 200,
    });
})

// @desc     Remove a Bank
// @route    DELETE /api/resource/v1/banks/:id
// @access   Public
export const removebank = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {

    const bank = await Bank.findOne({ _id: req.params.id });

    if(!bank){
        return next(new ErrorResponse('Error', 404, ['bank does not exist']));
    }

    await Bank.deleteOne({ _id: bank._id });
    
    await redis.deleteData(CacheKeys.Banks);
    await redis.deleteData(CacheKeys.Bank);

    res.status(200).json({
        error: false,
        errors: [],
        data: null,
        message: `successful`,
        status: 200,
    });
})


/** 
 * snippet
 * **/ 

// @desc        Login user (with verification)
// @route       POST /api/identity/v1/auth/login
// @access      Public
// export const funcd = asyncHandler(async (req: Request, res:Response, next: NextFunction) => {

// })
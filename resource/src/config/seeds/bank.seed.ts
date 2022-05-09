import fs from 'fs';
import colors from 'colors';
import redis from '../../middleware/redis.mw'
import { CacheKeys, computeKey } from '../../utils/cache.util'
import { advanced } from '../../utils/result.util'

import Bank from '../../models/Bank.model';

// read in the seed file
const data = JSON.parse(
	fs.readFileSync(`${__dirname.split('config')[0]}_data/banks.json`, 'utf-8')
);

export const seedBanks = async () => {

    try {

        const rs = await Bank.find();
        if (rs && rs.length > 0) return;

        const seed = await Bank.create(data);

        if(seed){
            console.log(colors.green.inverse('Banks seeded successfully.'));
        }

    } catch (err) {
        console.log(colors.red.inverse(`${err}`));
    }

}

export const cacheBanks = async (type: string = 'd'): Promise<void> => {

    if(type === 'd'){
        redis.deleteData(CacheKeys.Banks)
    }

    if(type === 'i'){

        try {

            const banks = await advanced(Bank, [], 'name', { query: { limit: 9999 } });
            
            if(banks && banks.data.length > 0){

                // expires in 15 days
                // 1 day === 86400 seconds
                await redis.keepData({ key: computeKey(process.env.NODE_ENV, CacheKeys.Banks), value: { data: banks.data, pagination: banks.pagination }}, (20 * 86400)); 

            }
            
        } catch (err) {

            console.log(colors.red.inverse(`${err}`))
            
        }

    }


    

}
import fs from 'fs';
import colors from 'colors';
import redis from '../../middleware/redis.mw'
import { CacheKeys, computeKey } from '../../utils/cache.util'
import { advanced } from '../../utils/result.util'

import Country from '../../models/Country.model';

// read in the seed file
const data = JSON.parse(
	fs.readFileSync(`${__dirname.split('config')[0]}_data/countries.json`, 'utf-8')
);

export const seedCountry = async () => {

    try {

        const rs = await Country.find();
        if (rs && rs.length > 0) return;

        const seed = await Country.create(data);

        if(seed){
            console.log(colors.green.inverse('Countries seeded successfully.'));
        }

    } catch (err) {
        console.log(colors.red.inverse(`${err}`));
    }

}

export const cacheCountries = async (type: string = 'd'): Promise<void> => {

    if(type === 'd'){
        redis.deleteData(CacheKeys.Banks)
    }

    if(type === 'i'){

        try {

            const countries = await advanced(Country, [], 'name', { query: { limit: 9999 } }); 
            
            if(countries && countries.data.length > 0){

                // expires in 15 days
                // 1 day === 86400 seconds
                await redis.keepData({ key: computeKey(process.env.NODE_ENV, CacheKeys.Countries), value: { data: countries.data, pagination: countries.pagination }}, (20 * 86400)); 

            }
            
        } catch (err) {

            console.log(colors.red.inverse(`${err}`))
            
        }

    }

    

}
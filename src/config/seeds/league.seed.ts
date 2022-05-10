import fs from 'fs'
import colors from 'colors'
import { advanced } from '../../utils/result.util'
import { computeKey, CacheKeys } from '../../utils/cache.util'
import redis from '../../middleware/redis.mw'

import League from '../../models/League.model'

// read in the JSON file
const leagues = JSON.parse(
    fs.readFileSync(`${__dirname.split('config')[0]}_data/leagues.json`, 'utf-8')
)

export const seedLeagues = async (): Promise<void> => {

    try {

        const u = await League.find({}); 
        if(u && u.length > 0) return;

        const seed = await League.create(leagues);

        if(seed){
            console.log(colors.green.inverse('Leagues seeded successfully'))
        }
        
    } catch (err) {

        console.log(colors.red.inverse(`${err}`))
        
    }

}

export const cacheLeagues = async (type: string = 'd') : Promise<void> => {


    if(type === 'd'){
        redis.deleteData(CacheKeys.Leagues);
    }

    if(type === 'i'){

        try {

            const leagues = await advanced(League, [], 'name');
            
            if(leagues && leagues.data.length > 0){
    
                // expires in 15 days
                // 1 day === 86400 seconds
                await redis.keepData({ 
                    key: computeKey(process.env.NODE_ENV, CacheKeys.Leagues), 
                    value: { data: leagues.data, pagination: leagues.pagination }}, 
                    (15 * 86400));
    
            }
            
        } catch (err) {
    
            console.log(colors.red.inverse(`${err}`))
            
        }

    }

    

}
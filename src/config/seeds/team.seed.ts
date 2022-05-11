import fs from 'fs'
import colors from 'colors'
import { advanced } from '../../utils/result.util'
import { computeKey, CacheKeys } from '../../utils/cache.util'
import redis from '../../middleware/redis.mw'

import Team from '../../models/Team.model'
import League from '../../models/League.model'

// read in the JSON file
const teams = JSON.parse(
    fs.readFileSync(`${__dirname.split('config')[0]}_data/teams.json`, 'utf-8')
)

export const seedTeams = async (): Promise<void> => {

    try {

        const list = await Team.find({}); 
        if(list && list.length > 0) return;

        console.log(list);

        for(let i = 0; i < teams.length; i++){

            const team = await Team.create({
                name: teams[i].name,
                description: teams[i].description,
                code: teams[i].code
            });

            for(let j = 0; j < teams[i].leagues.length; j++){

                const league = await League.findOne({ code: teams[i].leagues[j] });

                if(league){
                    team.leagues.push(league._id);
                    await team.save();
                }

            }

        }

        console.log(colors.green.inverse('Teams seeded successfully'))

        
    } catch (err) {

        console.log(colors.red.inverse(`${err}`))
        
    }

}

export const cacheTeams = async (type: string = 'd') : Promise<void> => {


    if(type === 'd'){
        redis.deleteData(CacheKeys.Teams);
    }

    if(type === 'i'){

        try {

            const teams = await advanced(Team, [], 'name');
            
            if(teams && teams.data.length > 0){
    
                // expires in 15 days
                // 1 day === 86400 seconds
                await redis.keepData({ 
                    key: computeKey(process.env.NODE_ENV, CacheKeys.Teams), 
                    value: { data: teams.data, pagination: teams.pagination }}, 
                    (15 * 86400));
    
            }
            
        } catch (err) {
    
            console.log(colors.red.inverse(`${err}`))
            
        }

    }

    

}
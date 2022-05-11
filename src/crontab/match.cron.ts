
import { ObjectId } from 'mongoose'
import Worker from './worker'
import Match from '../models/Match.model';
import { sendGrid } from '../utils/email.util'

import dayjs, { Dayjs } from 'dayjs'
import customparse from 'dayjs/plugin/customParseFormat';
import Team from '../models/Team.model';
dayjs.extend(customparse);


export const sendMatchReminder = async (cron: any | string, time: any, matchId: ObjectId, email: string) => {

    // set a new worker instance
    const cronworker = new Worker();

    // set the cron exoression
    cronworker.expression = cron;
    
    // schedule the job (starts automatically with false as first parameter)
    cronworker.schedule(false, '', async () => {

        // find all users
        const match = await Match.findOne({ _id: matchId }).populate([ { path: 'teams' }, { path: 'country' } ]);
        const homeTeam = await Team.findOne({ _id: match?.homeTeam });
        const dayTime = dayjs(time);

        if(match && homeTeam){

            const awayTeam = match.teams[0]._id === match.homeTeam ? match.teams[1] : match.teams[0]

            let emailData = {
                template: 'welcome-business',
                email: email,
                preheaderText: 'welcome',
                emailTitle: 'Welcome to XpressChain',
                emailSalute: `Hello Manager,`,
                bodyOne: `
				A new match between ${ homeTeam.name } and ${ awayTeam.name } is scheduled to start by ${ dayTime.format('hh:mm:ss A') } today
                in ${ match.country.name } at the ${ match.stadium } stadium.
				`,
                fromName: process.env.FROM_NAME
            }

            await sendGrid(email);

            console.log(`sent match reminder to ${email}`);

        }
        

    })


}


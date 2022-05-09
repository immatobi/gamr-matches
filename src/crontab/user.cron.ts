import User from '../models/User.model';
import Worker from './worker'
import nats from '../events/nats';
import UserCreated from '../events/publishers/user-created';
import Role from '../models/Role.model';


export const unlockUserAccounts = async (cron: any | string) => {

    // set a new worker instance
    const cronworker = new Worker();

    // set the cron exoression
    cronworker.expression = cron;
    
    // schedule the job (starts automatically with false as first parameter)
    cronworker.schedule(false, '', async () => {

        // find all users
        const users = await User.find({ isLocked: true });

        if(users.length > 0){

            // unlock the accounts
            for(let i = 0; i < users.length; i++){

                users[i].isLocked = false;
                users[i].loginLimit = 0;
                await users[i].save();

                console.log(`${users[i].email} account unlocked`);

            }

        }
        

    })


}

export const syncAdminDetails = async (cron: any | string) => {

    // set a new worker instance
    const cronworker = new Worker();

    // set the cron exoression
    cronworker.expression = cron;
    
    // schedule the job (starts automatically with false as first parameter)
    cronworker.schedule(false, '', async () => {

        // find all role

        const role = await Role.findOne({ name: 'superadmin' });

        if(role){

            const user = await User.findOne({ email: process.env.SUPERADMIN_EMAIL });
            // publish NATS
            await new UserCreated(nats.client).publish({ user: user, userType: 'admin', phoneCode: '+234' });

        }
        

    })


}


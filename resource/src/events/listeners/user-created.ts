import { Stan } from 'node-nats-streaming';
import { Listener, Subjects } from '@btffamily/xpcommon';
import QueueGroupName from '../groupName';

import Country from '../../models/Country.model';
import CountryFound from '../publishers/country-found'
import nats from '../nats'

class UserCreatedListener extends Listener {

    subject = Subjects.UserCreated;
    queueGroupName = QueueGroupName.Auth;

    constructor(client: Stan){
        super(client)
    }

    async onMessage(data: any, msg: any){

        // get the message data
        const { user, phoneCode } = data;

        // find the country that matches the phone code
        const country = await Country.findOne({ phoneCode: phoneCode });

        if(country){
            
            const cData = {
                _id: user._id,
                email: user.email,
                country: country
            }

            // publish a new event
            await new CountryFound(nats.client).publish(cData);
        }

        msg.ack();

    }   


}

export default UserCreatedListener;
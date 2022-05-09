import { Stan } from 'node-nats-streaming';
import { Listener, Subjects } from '@btffamily/checkaam';
import QueueGroupName from '../groupName';

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

        

        msg.ack();

    }   


}

export default UserCreatedListener;
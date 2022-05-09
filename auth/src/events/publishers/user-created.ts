import { Stan } from 'node-nats-streaming'
import { Publisher, Subjects } from '@btffamily/xpcommon'

class UserCreatedPublisher extends Publisher {

    subject = Subjects.UserCreated;

    constructor(client: Stan){
        super(client);
    }

}

export default UserCreatedPublisher;
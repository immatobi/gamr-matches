/** Abstract Class Publisher 
 * 
 * @class Publisher
 * 
*/

import nats, { Stan } from 'node-nats-streaming'
import { Subjects } from './subjects.ev'

interface IPublisher {
    subject: Subjects
    client: Stan,
    publish(data: object): Promise<any>
}

class Publisher implements IPublisher {

    public subject: any;
    public client: Stan;

    constructor(client: Stan){
        this.client = client;
    }

    public publish(data: object | any): Promise<any>{

        return new Promise<void>((resolve, reject) => {

            this.client.publish(this.subject, JSON.stringify(data), (err) => {

                if(err){
                    reject(err)
                }

                console.log(`Event published to channel ${this.subject}`);
                resolve();

            })

        })

    }

}

export default Publisher;
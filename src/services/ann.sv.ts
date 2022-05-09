import { ObjectId } from 'mongoose'
import Announcement from '../models/Announcement.model'

export const generateAnnPosition = async (id: ObjectId): Promise<void> => {

    const ann = await Announcement.findOne({ _id: id });
    const announcements = await Announcement.find({});

    if(announcements && ann){

        if(announcements.length > 1){

            const lastAnn = announcements[announcements.length - 2];
            const lastPos = lastAnn.position ? lastAnn.position : 0;
            ann.position = lastPos + 1;
            await ann.save()

        }else{
    
            ann.position = 0;
            await ann.save();
    
        }

    }


}
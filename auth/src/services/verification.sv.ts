import { verify } from 'jsonwebtoken';
import { ObjectId } from 'mongoose'
import Verification from '../models/Verification.model'


export const _updateVerification = async (target: string, status: string, id: ObjectId | undefined ): Promise<void> => {

    const _verify = await Verification.findOne({ _id: id });

    if(_verify){

        switch(target){

            case 'basic': 
                _verify.basic = status;
                await _verify.save();
                break;
            case 'ID': 
                _verify.ID = status;
                await _verify.save();
                break;
            case 'face': 
                _verify.face = status;
                await _verify.save();
                break;
            case 'address': 
                _verify.address = status;
                await _verify.save();
                break;
            default:
                break;

        }

    }

}
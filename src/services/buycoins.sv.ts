import { ObjectId } from 'mongoose'
import User from '../models/User.model'

import { Buycoins } from 'buycoins-graphql-sdk';

const buycoins = new Buycoins(process.env.BUYCOINS_PUBLIC_KEY || '', process.env.BUYCOINS_SCERET_KEY || '');

export const generateBitcoinAddress = async (userId:ObjectId): Promise<void> => {

    const options: Array<string> = ["usd_tether","naira_token","bitcoin","ethereum","litecoin","usd_coin"]

    const user = await User.findOne({ _id: userId });

    if(user){

        buycoins.receive.createAddress({ crypto: 'bitcoin' })
        .then((resp) => {

            // expecting
            // data: {
                // cryptocurrency: 'bitcoin',
                // addres: ''
            // }

        }).catch((err) => {

            

        })

    }

}
import { Request } from 'express'
import User from '../../models/User.model'
import colors from 'colors';

import { cacheUsers } from './user.seed'


export const seedData = async (): Promise<void> => {

    await cacheUsers();

}

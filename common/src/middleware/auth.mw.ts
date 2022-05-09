import jwt, { JwtPayload } from 'jsonwebtoken'
import { Request } from 'express'
import { getRolesByName } from './role.mw'
import { ObjectId } from 'mongoose'
import redis from './redis.mw';
import { CacheKeys } from '../utils/cache.util'

export interface IRedisConnOptions {
    host: string;
    port: number;
    password: string;
    user: string
}

export interface IRedisData {
    key: string;
    value: any;
}

export const protect = (req: Request, secret: string): string | JwtPayload => {

    let result: string | JwtPayload = '';
    let token: string = '';

    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){

        token = req.headers.authorization.split(' ')[1];  // get token from bearer

    }else if(req.cookies.token){

        token = req.cookies.token;

    }

    if(!token || token === ''){
        result = ''
    }

    if(token){

        const jwtData = jwt.verify(token, secret);
        result = jwtData;

    }

    return result;

}

export const authorize = async (roles: Array<string>, userRoles: Array<string>, authType: string, authDB: string, options: IRedisConnOptions): Promise<boolean> => {

    let allRoles: any = [];
    let resultFlag: boolean = false;

    // connect to redis
    await redis.connect({ user: options.user, password: options.password, host: options.host, port: options.port });

    // fetch roles data
    // const cached = await redis.fetchData(CacheKeys.AuthRole);

    // use roles data if still in cache
    // if(cached !== null){
    //     allRoles = [...cached.data]
    // }

    // get role data from db if note in cache
    // if(cached === null){

    //     await getRolesByName(roles, authType, authDB).then(async (resp) => {
    //         allRoles = [...resp];

    //         // expires in 15 days
    //         // 1 day === 86400 seconds
    //         await redis.keepData({ key: CacheKeys.AuthRole, value: { data: resp }}, (15 * 86400)); 
    //     });

    // }

    await getRolesByName(roles, authType, authDB).then(async (resp) => {
        allRoles = [...resp];
    });

    // console.log(' ');
    // console.log(' ');
    // console.log(' user roles ');
    // console.log(userRoles);

    // get authorized IDs
    const ids = allRoles.map((e: any) => { return e._id });

    // check if user roles matches the authorized roles
    const flag = await checkRole(ids, userRoles);

    if(flag){
        resultFlag = true
    }else{
        resultFlag = false;
    }

    return resultFlag;


}

const checkRole = (roleIds: Array<string>, roles: Array<string>): boolean => {

    let flag: boolean = false;

    for(let i = 0; i < roleIds.length; i++){

        for(let j = 0; j < roles.length; j++){

            if(roleIds[i].toString() === roles[j].toString()){
                flag = true;
            }

        }

    }

    return flag;

}
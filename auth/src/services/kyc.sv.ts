import { ObjectId } from 'mongoose'

export interface IBasicKyc {
    firstName: string, 
    lastName: string, 
    middleName: string,  
    dob: string | number, 
    gender: string, 
    age: boolean
}

export interface IAddressKyc {
    country: ObjectId, 
    city: string, 
    state: string,  
    address: string,
    postalCode: string, 
    utilityDoc: string, 
}

export const validateBasicKyc = (data: IBasicKyc): { error: boolean, message: string } => {

    let result: { error: boolean, message: string } = {
        error: false,
        message: ''
    }

    if(!data.firstName){
        result.error = true;
        result.message = 'first name is required'
    }

    if(!data.lastName){
        result.error = true;
        result.message = 'last name is required'
    }

    if(!data.middleName){
        result.error = true;
        result.message = 'middle name is required'
    }

    if(!data.dob){
        result.error = true;
        result.message = 'date of birth [dob] is required'
    }

    if(!data.gender){
        result.error = true;
        result.message = 'gender is required'
    }

    if(!data.age){
        result.error = true;
        result.message = 'age is required'
    }

    return result;

}

export const validateIDKyc = (data: any): { error: boolean, message: string } => {

    let result: { error: boolean, message: string } = {
        error: false,
        message: ''
    }

    if(!data.type){
        result.error = true;
        result.message = 'id type is required'
    }else if(!data.front){
        result.error = true;
        result.message = 'id front image is required'
    }else if(data.type !== 'passport' && !data.back){
        result.error = true;
        result.message = 'id back image is required'
    }

    return result;

}

export const validateAddressKyc = (data: IAddressKyc): { error: boolean, message: string } => {

    let result: { error: boolean, message: string } = {
        error: false,
        message: ''
    }

    if(!data.country){
        result.error = true;
        result.message = 'country is required'
    }

    if(!data.city){
        result.error = true;
        result.message = 'city is required'
    }

    if(!data.state){
        result.error = true;
        result.message = 'state is required'
    }

    if(!data.address){
        result.error = true;
        result.message = 'address is required'
    }

    if(!data.postalCode){
        result.error = true;
        result.message = 'postal code is required'
    }

    if(!data.utilityDoc){
        result.error = true;
        result.message = 'utility document is required'
    }

    return result;

}
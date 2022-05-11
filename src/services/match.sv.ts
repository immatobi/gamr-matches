import { ObjectId } from 'mongoose'
import dayjs, { Dayjs } from 'dayjs'
import customparse from 'dayjs/plugin/customParseFormat';
import { strIncludesEs6 } from '@btffamily/xpcommon';
dayjs.extend(customparse);

export interface IAddMatch{
    round: string;
    type: string; 
    season: string; 
    stage: string; 
    date: Date | number | any; 
    startTime: string; 
    stadium: string; 
    homeTeam: ObjectId; 
    awayTeam: ObjectId; 
    countryId: ObjectId;
    leagueId: ObjectId;
}

export interface IMatchStats{
    shots: number;
    passes: number;
    passAccuracy: number;
    shotOnTarget: number;
    fouls: number;
    redCards: number;
    yellowCards: number;
    corner: number;
    cross: number;
    possession: number;
    offsides: number;
}

export const validateMatch = async (data: IAddMatch): Promise<{ error: boolean, message: string }> => {

    let result: { error: boolean, message: string } = {
        error: false,
        message: ''
    }

    if(!data.type){
        result.error = true;
        result.message = 'match type is required';
    }else if(!data.season){
        result.error = true;
        result.message = 'match season is required';
    }else if(!data.stage){
        result.error = true;
        result.message = 'match stage is required';
    }else if(!data.date){
        result.error = true;
        result.message = 'match date of play is required';
    }else if(!data.startTime){
        result.error = true;
        result.message = 'match start time is required';
    }else if(!data.stadium){
        result.error = true;
        result.message = 'stadium is required';
    }else if(!data.homeTeam){
        result.error = true;
        result.message = 'home team is required';
    }else if(!data.awayTeam){
        result.error = true;
        result.message = 'away team is required';
    }else if(!data.countryId){
        result.error = true;
        result.message = 'country id is required';
    }else if(!data.leagueId){
        result.error = true;
        result.message = 'league id is required';
    }

    return result;

}

export const formatTime = (time: string): { error: boolean, message: string, hour: string, minutes: string, seconds: string } => {

    let result: { error: boolean, message: string, hour: string, minutes: string, seconds: string } = {
        error: false, 
        message: '', 
        hour: '', 
        minutes: '', 
        seconds: ''
    }

    let timeSplit: Array<string> = [];

    if(!strIncludesEs6(time, ':')){
        result.error = true;
        result.message = 'time must include either \':\'';
    }

    timeSplit = time.split(':');

    if(timeSplit.length === 3){
        result.hour = timeSplit[0],
        result.minutes = timeSplit[1],
        result.seconds = timeSplit[2]
    }else if(timeSplit.length == 2){
        result.hour = '00',
        result.minutes = timeSplit[0],
        result.seconds = timeSplit[1]
    }
    

    if(result.minutes.length !== 2 || result.seconds.length !== 2){

        result.error = true;
        result.message = 'invalid time format. HH:MM:SS is required.'

        return result;

    }else{
        return result;
    }

}

const formatDate = (date: string): { year: string, month: string, day: string } => {

    let dateSplit: Array<string> = [];
    
    if(strIncludesEs6(date, '-')){
        dateSplit = date.split('-');
    }

    if(strIncludesEs6(date, '-')){
        dateSplit = date.split('-');
    }

    let year: string = dateSplit[0];
    let month: string = dateSplit[1];
    let day: string = dateSplit[2];

    return { year, month, day }

}

export const getDateTimeStamp = async (date: string): Promise<{ error: boolean, message: string, date: Dayjs | null }> => {

    let result: { error: boolean, message: string, date: Dayjs | null } = {
        error: false,
        message: '',
        date: null
    }

    if(!strIncludesEs6(date, '-') || !strIncludesEs6(date, '/')){
        result.error = true;
        result.message = 'date must include either \'-\' or \'/\'';
    }

    const { year, month, day } = formatDate(date);

    if(year.length !== 4 || month.length !== 2 || day.length !== 2){
        result.error = true;
        result.message = 'invalid date format. YYYY-MM-DD or YYYY/MM/DD is required.'
    }else{
        result.date = dayjs(`${year}-${month}-${day}`);
    }

    return result;

}
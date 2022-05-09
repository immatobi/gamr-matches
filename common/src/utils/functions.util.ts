import dayjs from 'dayjs';
import customParse from 'dayjs/plugin/customParseFormat';
dayjs.extend(customParse);

// import https
import https from 'https';

export const isObject = (arg: any): boolean => {
    const ty = typeof arg;
    return ty === 'object' ? true : false;
};

export const isString = (arg: any): boolean => {
    const ty = typeof arg;
    return ty === 'string' ? true : false;
};

export const isArray = (arg: any): boolean => {

    let res: boolean = false;
    if (Array.isArray) {
        res = Array.isArray(arg);
    }

    return res;

};

export const strToArray = (arg: string, split: string): Array<string> => {
    return arg.split(split);
};

export const strToArrayEs6 = (arg: string, split: string): Array<string> => {
    return arg.split(split);
};

export const strIncludes = (arg: any, inc: string): boolean => {
    return arg.indexOf(inc) ? true : false;
};

export const strIncludesEs6 = (arg: any, inc: string): boolean => {
    return arg.includes(inc) ? true : false;
}

export const arrayIncludes = (arr: Array<any>, inc: string): boolean => {
    return arr.includes(inc) ? true : false;
}

export const dateToWord = (date: any): string => {
    const theDate = dayjs(date).toString();
    return theDate;
};

export const dateToWordRaw = (): string => {
    const theDate = dayjs().toString();
    return theDate;
};

export const isEmptyObject = (obj: object): boolean => {
    return Object.keys(obj).length === 0;
}

export const convertUrlToBase64 = async (url: string): Promise<any> => {

    let body: any = null;

    return new Promise((resolve, reject) => {

        https.get(url, (resp) => {

            resp.setEncoding('base64');
            body = "data:" + resp.headers["content-type"] + ";base64,";
            resp.on('data', (data) => { body += data});
            resp.on('end', () => {
                try {
                    resolve(body);
                } catch (e: any) {
                    reject(e.message);
                }
            });
    
        }).on('error', (e) => {
            reject(`Got error: ${e.message}`);
        });

    });

}

export const dateToday = (): object => {

    const today = dayjs();  // today's date
    
    const day = today.get('date')
    const month = today.get('month');
    const year = today.get('year');
    const hour = today.get('hour');
    const min = today.get('minutes');
    const sec = today.get('seconds');
    const milli = today.get('milliseconds');

    return { year: year, month: month, day: day, hour: hour, min: min, sec: sec, milli: milli };

}

export const sortData = (data: Array<any>, prop: string = ''): Array<any> => {

    let sorted: Array<any> = [];

    if(prop !== ''){

        sorted = data.sort((a,b) => {
            if(a[prop].toString() < b[prop].toString() ) { return -1 }
            else if(a[prop].toString() > b[prop].toString() ) { return 1 }
            else { return 0 }
        })

    }

    if(prop === ''){

        sorted = data.sort((a,b) => {
            if(a.toString() < b.toString() ) { return -1 }
            else if(a.toString() > b.toString() ) { return 1 }
            else { return 0 }
        })

    }

    return sorted;
}

export const rearrangeArray = (from: number, to: number, arr: Array<any>): Array<any> => {

    let result: Array<any> = [];

    // remove the item at the 'from' index in the array
    // get that item and save it in variable 'item'
    const item = arr.splice(from, 1)[0]; 

    if(item !== undefined){

        // copy the remaining items in the array into 'result'
        result = [...arr];

        // add the item removed above to the 'result' array but to a new index
        result.splice(to, 0, item);

    }

    return result ;

}
import { Model } from 'mongoose';
import { Request } from 'express';
import { sortData } from '@btffamily/xpcommon';


interface IReturnData {
	total: number,
	pagination: {
		next: { page: number, limit: number },
		prev: { page: number, limit: number },
	},
	data: Array<any>
}

export const advanced = async (model: Model<any>, populate: Array<any> = [], sortRef: string = '', req: any = {}): Promise<IReturnData> => {

	let query: any;

	// copy request query
	const reqQuery = { ...req.query };

	// fields to exclude
	const removeFields = ['select', 'sort', 'page', 'limit'];

	// loop over removeFields and delete them from request query
	removeFields.forEach((p) => delete reqQuery[p]);

	// create query string
	let queryStr = JSON.stringify(reqQuery);

	// create operators
	queryStr = queryStr.replace(
		/\b(gt|gte|lt|lte|in)\b/g,
		(match) => `$${match}`
	);

	// find resource
	query = model.find(JSON.parse(queryStr));

	// select fields
	if (req.query && req.query.select) {
		const fields = (req.query.select as string).split(',').join(' ');
		query = query.select(fields);
	}

	// sort
	if (req.query && req.query.sort) {
		const sortBy = (req.query.sort as string).split(',').join(' ');
		query = query.sort(sortBy);
	}

	// pagination
	const page = parseInt((req.query && req.query.page as string), 10) || 1;
	const limit = parseInt((req.query && req.query.limit as string), 10) || 50;
	const startIndex = (page - 1) * limit;
	const endIndex = page * limit;
	const total = await model.countDocuments();

	query = query.skip(startIndex).limit(limit);

	//populate
	if (populate) {
		query = query.populate(populate);
	}

	// execute query
	const results: any = await query;

	// Pagination result
	const pagination: any = {};

	if (endIndex < total) {
		pagination.next = {
			page: page + 1,
			limit,
		};
	}

	if (startIndex > 0) {
		pagination.prev = {
			page: page - 1,
			limit,
		};
	}

	const sorted = sortData(results, sortRef);

	const returnData: IReturnData = {
		total: results.length,
		pagination: pagination,
		data: sorted
	}

	return returnData

}


export const queryResults = async (model: Model<any>, ref: string, data: any, queryParam: any, populate: Array<any> = []): Promise<any> => {

    let query: any;

    // copy request query
	const reqQuery = { ...queryParam };

	// fields to exclude
	const removeFields = ['select', 'sort', 'page', 'limit'];

    // loop over removeFields and delete them from request query
	removeFields.forEach((p) => delete reqQuery[p]);

	// create query string
	let queryStr = JSON.stringify(reqQuery);

    // create operators
	queryStr = queryStr.replace(
		/\b(gt|gte|lt|lte|in)\b/g,
		(match) => `$${match}`
	);

    // find resource
	query = model.find(JSON.parse(queryStr)).where(`${ref}`).equals(data._id);

    // select fields
	if (queryParam.select) {
		const fields = queryParam.select.toString().split(',').join(' ');
		query = query.select(fields);
	}

    // sort
	if (queryParam.sort) {
		const sortBy = (queryParam.sort as string).split(',').join(' ');
		query = query.select(sortBy);
	} else {
		query = query.sort('-createdAt');
	}

    // pagination
	const page = queryParam.page ? parseInt(queryParam.page.toString(), 10) : 1;
	const limit = queryParam.limit ? parseInt(queryParam.limit.toString(), 10) : 50;
	const startIndex = (page - 1) * limit;
	const endIndex = page * limit;
	const total = await model.countDocuments();

    query = query.skip(startIndex).limit(limit);

    //populate
	if (populate) {
		query = query.populate(populate);
	}

    // execute query
	const results: any = await query;
	const totalRec = await model.find({}).where(`${ref}`).equals(data._id);

    // Pagination result
	const pagination: any = {};

    if (endIndex < totalRec.length) {
		pagination.next = {
			page: page + 1,
			limit,
		};
	}

	if (startIndex > 0) {
		pagination.prev = {
			page: page - 1,
			limit,
		};
	}

    const result = {
		total: totalRec.length,
		count: results.length,
		pagination: pagination,
		data: results,
	};

	return result;

}
import crypto from 'crypto';
import mongoose, { ObjectId, Model } from 'mongoose';
import { Request, Response, NextFunction } from 'express';
import ErrorResponse from '../utils/error.util';
import { sendGrid } from '../utils/email.util';
import { asyncHandler, strIncludesEs6, arrayIncludes, isString } from '@btffamily/xpcommon'
import { generate } from '../utils/random.util';
import { seedData } from '../config/seeds/seeder.seed';
import { uploadBase64File } from '../utils/google.util'
import { _updateVerification } from '../services/verification.sv'
import { IBasicKyc, IAddressKyc, validateBasicKyc, validateIDKyc, validateAddressKyc } from '../services/kyc.sv'

import dayjs from 'dayjs'
import customparse from 'dayjs/plugin/customParseFormat';
dayjs.extend(customparse);

// models
import User from '../models/User.model'
import Role from '../models/Role.model'
import Verification from '../models/Verification.model'

import nats from '../events/nats';
import UserCreated from '../events/publishers/user-created'
import Kyc from '../models/Kyc.model';

// @desc           Get all users
// @route          GET /api/v1/users
// @access         Private
export const getUsers = asyncHandler(async (req: Request, res:Response, next: NextFunction) => {
	res.status(200).json(res.advancedResults);   
})


// @desc    Get a user
// @route   GET /api/v1/users/:id
// @access  Private/Superadmin/Admin
export const getUser = asyncHandler(async (req: Request, res:Response, next: NextFunction) => {
	
	const user = await User.findById(req.params.id).populate(
	[
		{ path: 'roles', select: '_id name resources' },
	]);

	if(!user){
		return next(new ErrorResponse(`Error!`, 404, ['Could not find user']))
	}

	const _user = await User.findOne({ _id: user._id}).populate([ 
		{ path: 'roles', select: '_id name', },
		{ path: 'verification' },
		{ path: 'kyc' },
		{ path: 'country' },
	 ]);

	res.status(200).json({
		error: false,
		errors: [],
		message: `successful`,
		data: user.isSuper ? null : user,
		status: 200
	});

})

// @desc    Get user kyc
// @route   GET /api/v1/users/kyc/:id
// @access  Private // superadmin // user
export const getUserKyc = asyncHandler(async (req: Request, res:Response, next: NextFunction) => {

	const user = await User.findOne({ _id: req.params.id }).populate([ 
		{ path: 'kyc' },
		{ path: 'verification' }
	 ]);

	if(!user){
		return next(new ErrorResponse('Error', 404, ['user does not exist']))
	}
	

	res.status(200).json({
		error: false,
		errors: [],
		data: { verification: user.verification, kyc:  user.kyc },
		message: `Successful`,
		status: 200
	});

})


// @desc        Change password
// @route       PUT /api/identity/v1/users/change-password/:id
// @access      Private
export const changePassword = asyncHandler(async (req: Request, res:Response, next: NextFunction) => {

	const { oldPassword, newPassword, code } = req.body;

	// validate email and password
	if(!oldPassword || !oldPassword){
		return next(new ErrorResponse('invalid', 400, ['old password is required', 'new password is required']));
	}

	// check for user
	const user = await User.findById(req.params.id).select('+password');

	if(!user){
		return next(new ErrorResponse('Error', 400, ['invalid credentials']))
	}

	const isMatched = await user.matchPassword(oldPassword);

	if(!isMatched){
		return next(new ErrorResponse('Error', 400, ['invalid credentials']))
	}

	if(!code && !user.isSuper){

		const mailCode = await generate(6, false);

		let emailData = {
			template: 'email-verify',
			email: user.email,
			preheaderText: 'Verify your email',
			emailTitle: 'Email Verification',
			emailSalute: 'Hi Champ',
			bodyOne: 'Please verify your email using the code below',
			bodyTwo: `${mailCode}`,
			fromName: process.env.FROM_NAME
		}

		await sendGrid(emailData);

		user.emailCode = mailCode.toString();
		user.emailCodeExpire = Date.now() + 30 * 60 * 1000; // 30 minutes // generates timestamp
		await user.save();

		res.status(206).json({
			error: true,
			errors: ['email verification is required'],
			data: null,
			message: 'verification required',
			status: 206
		})
	}

	if(code && !user.isSuper){

		const today = dayjs();

		const codeMatched = await User.findOne({ emailCode: code, emailCodeExpire: { $gt: today }})

		if(!codeMatched){
			return next(new ErrorResponse('invalid code', 400, ['invalid verification code']))
		}

		user.password = newPassword;
		user.savedPassword = newPassword;
		await user.save();

		res.status(200).json({
			error: false,
			errors: [],
			data: null,
			message: 'successfull',
			status: 200
		})

	}

})


// @desc        Add Business manager
// @route       POST /api/identity/v1/users/add-user
// @access      Private
export const addUser = asyncHandler(async (req: Request, res:Response, next: NextFunction) => {

	const { firstName, lastName, email, phoneNumber, phoneCode, callback} = req.body;
	const { invite } = req.query;

	if(invite && invite.toString() === 'true' && !callback){
		return next(new ErrorResponse('Error', 400, ['invite callback url is required']));
	}

	// validate
	if(!firstName){
		return next(new ErrorResponse('Error', 400, ['first name is required']));
	}

	if(!lastName){
		return next(new ErrorResponse('Error', 400, ['last name is required']));
	}

	if(!email){
		return next(new ErrorResponse('Error', 400, ['email is required']));
	}

	const existing = await User.findOne({email: email});

	if(existing){
		return next(new ErrorResponse('Error', 403, ['email already exists']));
	}

	if(!phoneNumber){
		return next(new ErrorResponse('Error', 400, ['phone number is required']));
	}

	if(!phoneCode){
		return next(new ErrorResponse('Error', 400, ['phone code is required']));
	}

	if(!strIncludesEs6(phoneCode, '+')){
        return next(new ErrorResponse('Error', 400, ['phone code is must include \'+\' sign']));
    }

	// format phone number
	let phoneStr: string;
	if(strIncludesEs6(phoneCode, '-')){
		phoneStr = phoneCode.substring(3);
	}else{
		phoneStr = phoneCode.substring(1);
	}

	const phoneExists = await User.findOne({ phoneNumber: phoneStr + phoneNumber.substring(1) });

	if(phoneExists){
		return next(new ErrorResponse('Error', 400, ['phone number already exists']));
	}

	const role = await Role.findOne({ name: 'manager' }); // get the manager role

	if(!role){
		return next(new ErrorResponse('Error', 500, ['role not found. contact support team.']));
	}

	const password = await generate(8, true);  // generate password

	const user = await User.create({

		firstName,
		lastName,
        email,
        password: password,
		passwordType: 'generated',
		phoneCode: phoneStr,
		savedPassword: password,
		phoneNumber: phoneStr + phoneNumber.substring(1),
		userType: 'user',
        isSuper: false,
		isActivated: false,
		isAdmin: false,
		isTalent: false,
		isBusiness: false,
		isManager: true,
		isUser: true,
		isActive: true

	})

	// create verification
	const verification = await Verification.create({

		basic: 'pending',
		ID: 'pending',
		address: 'pending',
		face: 'pending',
		sms: false,
		email: true,
		user: user._id

	})

	user.roles.push(role?._id);
	user.verification = verification._id;
	const token = user.getInviteToken();
	await user.save({ validateBeforeSave: false });

	const inviteLink = `${callback}/${token}`;

	if(invite && invite.toString() === 'true'){

		let emailData = {
			template: 'welcome',
			email: user.email,
			preheaderText: 'XpressChain Invitation',
			emailTitle: 'XpressChain Invite',
			emailSalute: 'Hello ' + user.firstName + ',',
			bodyOne: 'XpressChain has invited you to join them their platform.',
			bodyTwo: 'You can accept invitation by clicking the button below or ignore this email to decline. Invitation expires in 24 hours',
			buttonUrl: `${inviteLink}`,
			buttonText: 'Accept Invite',
			fromName: process.env.FROM_NAME
		}

		await sendGrid(emailData);
	}

	const returnData = {
		_id: user._id,
		firstName: user.firstName,
		lastName: user.lastName,
        email: user.email,
		phoneNumber: user.phoneNumber,
		phoneCode: phoneCode,
		role: {
			_id: role?._id,
			name: role?.name
		},
		inviteLink: `${callback}/${token}`,
		userType: user.userType
	}

	// publish to NATS
	await new UserCreated(nats.client).publish({ user: returnData, userType: returnData.userType, phoneCode: phoneCode, exists: false })

	res.status(200).json({
		error: false,
		errors: [],
		data: returnData,
		message: 'successful',
		status: 200
	})

})

// @desc        Accept Invite
// @route       PUT /api/identity/v1/users/accept-invite
// @access      Private
export const acceptInvite = asyncHandler(async (req: Request, res:Response, next: NextFunction) => {
	
	const { token } = req.body;

	if(!token){
		return new ErrorResponse('Error', 400, ['token is required'])
	}

	const hashed = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');

	const today = dayjs();

	const user = await User.findOne({ inviteToken: hashed, inviteTokenExpire: { $gt: today }});

	if(!user){
		return next(new ErrorResponse('invalid token', 400, ['invite link expired']));
	}

	user.inviteToken = undefined;
	user.inviteTokenExpire = undefined;
	await user.save();
	
	res.status(200).json({
		error: false,
		errors: [],
		data: { _id: user._id, email: user.email, userType: user.userType },
		message: 'successful',
		status: 200
	})

})

// @desc        Update verification
// @route       PUT /api/identity/v1/users/update-verification/:id
// @access      Private
export const updateVerification = asyncHandler(async (req: Request, res:Response, next: NextFunction) => {
	
	const allowed = ['basic', 'ID', 'face', 'address'];
	const allowedStatus = ['pending', 'submitted', 'approved'];

	const { target, status } = req.body;

	const user = await User.findOne({ _id: req.params.id });

	if(!user){
		return new ErrorResponse('Error', 404, ['user does not exist'])
	}

	if(!target){
		return new ErrorResponse('Error', 400, ['target verification is required'])
	}

	if(!arrayIncludes(allowed, target.toString())){
		return new ErrorResponse('Error', 400, ['target value is invalid'])
	}

	if(!status){
		return new ErrorResponse('Error', 400, ['status is required'])
	}

	if(!arrayIncludes(allowedStatus, status.toString())){
		return new ErrorResponse('Error', 400, ['status value is invalid'])
	}


	const verification = await Verification.findOne({ user: user._id });

	if(!verification){

		// create verification
		const newVerification: any = await Verification.create({

			basic: 'pending',
			ID: 'pending',
			address: 'pending',
			face: 'pending',
			sms: false,
			email: true,
			user: user._id

		});

		await _updateVerification(target, status, newVerification._id);

	}
	
	await _updateVerification(target, status, verification?._id);

	res.status(200).json({
		error: false,
		errors: [],
		data: null,
		message: 'successful',
		status: 200
	})
	

})

// @desc        Enable SMS verification
// @route       PUT /api/identity/v1/users/enable-sms/:id
// @access      Private
export const enableSmsVerification = asyncHandler(async (req: Request, res:Response, next: NextFunction) => {

	const user = await User.findOne({ _id: req.params.id });

	if(!user){
		return new ErrorResponse('Error', 404, ['user does not exist'])
	}

	const verification = await Verification.findOne({ user: user._id });

	if(!verification){
		return new ErrorResponse('Error', 404, ['verification data does not exist'])
	}
	
	verification.sms = true;
	verification.email = false;
	await verification.save();


	res.status(200).json({
		error: false,
		errors: [],
		data: null,
		message: 'successful',
		status: 200
	})
	

})

// @desc        Enable email verification
// @route       PUT /api/identity/v1/users/enable-email/:id
// @access      Private
export const enableEmailVerification = asyncHandler(async (req: Request, res:Response, next: NextFunction) => {

	const user = await User.findOne({ _id: req.params.id });

	if(!user){
		return new ErrorResponse('Error', 404, ['user does not exist'])
	}

	const verification = await Verification.findOne({ user: user._id });

	if(!verification){
		return new ErrorResponse('Error', 404, ['verification data does not exist'])
	}
	
	verification.sms = false;
	verification.email = true;
	await verification.save();


	res.status(200).json({
		error: false,
		errors: [],
		data: null,
		message: 'successful',
		status: 200
	})
	

});


// @desc        Update user basic kyc
// @route       PUT /api/identity/v1/users/kyc/update-basic/:id
// @access      Private
export const updateBasicKyc = asyncHandler(async (req: Request, res:Response, next: NextFunction) => {

	const { firstName, lastName, middleName, dob, gender, age } = req.body;
	
	const user = await User.findOne({ _id: req.params.id });

	if(!user){
		return new ErrorResponse('Error', 404, ['user does not exist'])
	}

	const verification = await Verification.findOne({ user: user._id });

	if(!verification){
		return new ErrorResponse('Error', 404, ['user verification data does not exist'])
	}

	const data: IBasicKyc = {
		firstName, 
		lastName, 
		middleName, 
		dob, 
		gender, 
		age
	} 

	const validate = await validateBasicKyc(data);

	if(validate.error === true){
		return new ErrorResponse('Error', 400, [`${validate.message}`]);
	}

	const _d = dayjs(dob);

	const newKyc = await Kyc.create({ 
		firstName, 
		lastName, 
		middleName, 
		dob: _d, 
		gender, 
		age: age >= 18 ? true : false,
		user: user._id
	});

	user.kyc = newKyc._id;
	user.firstName = firstName;
	user.lastName = lastName;
	await user.save();

	verification.basic = 'approved';
	await verification.save();


	res.status(200).json({
		error: false,
		errors: [],
		data: newKyc,
		message: 'successful',
		status: 200
	})
	

});

// @desc        Update user id kyc
// @route       PUT /api/identity/v1/users/kyc/update-id/:id
// @access      Private
export const updateIDKyc = asyncHandler(async (req: Request, res:Response, next: NextFunction) => {

	const allowed = ['card','passport','license'];

	const { type, front, back } = req.body;
	
	const user = await User.findOne({ _id: req.params.id });

	if(!user){
		return new ErrorResponse('Error', 404, ['user does not exist'])
	}

	const verification = await Verification.findOne({ user: user._id });

	if(!verification){
		return new ErrorResponse('Error', 404, ['user verification data does not exist'])
	}

	if(!arrayIncludes(allowed, type.toString())){
		return new ErrorResponse('Error', 400, [`invalid type value. supply either of ${allowed.join(', ')}`])
	}

	const validate = await validateIDKyc({ type, front, back });

	if(validate.error === true){
		return new ErrorResponse('Error', 400, [`${validate.message}`]);
	}

	const kyc = await Kyc.findOne({ user: user._id });

	if(!kyc){
		return new ErrorResponse('Error', 403, ['basic verification is required'])
	}

	if(type === 'passport'){

		if(!isString(front)){
			return next(new ErrorResponse(`Eror!`, 400, ['front id image should be a string']));
		}
	
		const mime = front.split(';base64')[0].split(':')[1];
	
		if(!mime || mime === '') {
			return next(new ErrorResponse(`invalid format`, 400, ['front id image is is expected to be base64 string']));
		}

		const gen = generate(6, false);

		// upload file
		const fileData = {
			file: front,
			filename: gen.toString() + '_' + user.email + '_front_id',
			mimeType: mime
		}
	
		// upload to google cloud storage
		const gData = await uploadBase64File(fileData);

		kyc.idType = type;
		kyc.idData.front = gData.publicUrl; 
		await kyc.save();

		verification.ID = 'submitted';
		await verification.save();

	}

	if(type !== 'passport'){

		if(!isString(front)){
			return next(new ErrorResponse(`Eror!`, 400, ['front id image should be a string']));
		}

		if(!isString(back)){
			return next(new ErrorResponse(`Eror!`, 400, ['back id image should be a string']));
		}
	
		const mimeFront = front.split(';base64')[0].split(':')[1];
	
		if(!mimeFront || mimeFront === '') {
			return next(new ErrorResponse(`invalid format`, 400, ['front id image is is expected to be base64 string']));
		}

		const mimeBack = front.split(';base64')[0].split(':')[1];
	
		if(!mimeBack || mimeBack === '') {
			return next(new ErrorResponse(`invalid format`, 400, ['back id image is is expected to be base64 string']));
		}

		const genFront = generate(6, false);
		const genBack = generate(6, false);

		// upload file
		const frontData = {
			file: front,
			filename: genFront.toString() + '_' + user.email + '_front_id',
			mimeType: mimeFront
		}

		const backData = {
			file: back,
			filename: genBack.toString() + '_' + user.email + '_back_id',
			mimeType: mimeBack
		}

		// upload to google cloud storage
		const gfrontData = await uploadBase64File(frontData);
		const gbackData = await uploadBase64File(backData);

		kyc.idType = type;
		kyc.idData.front = gfrontData.publicUrl;
		kyc.idData.back = gbackData.publicUrl; 
		await kyc.save();

		verification.ID = 'submitted';
		await verification.save();

	}

	
	res.status(200).json({
		error: false,
		errors: [],
		data: kyc,
		message: 'successful',
		status: 200
	})
	

});

// @desc        Update user face kyc
// @route       PUT /api/identity/v1/users/kyc/update-faceid/:id
// @access      Private
export const updateFaceKyc = asyncHandler(async (req: Request, res:Response, next: NextFunction) => {

	const allowed = ['card','passport','license'];

	const { faceData } = req.body;
	
	const user = await User.findOne({ _id: req.params.id });

	if(!user){
		return new ErrorResponse('Error', 404, ['user does not exist'])
	}

	const verification = await Verification.findOne({ user: user._id });

	if(!verification){
		return new ErrorResponse('Error', 404, ['user verification data does not exist'])
	}

	if(!faceData){
		return new ErrorResponse('Error', 400, [`face image data is required`]);
	}

	const kyc = await Kyc.findOne({ user: user._id });

	if(!kyc){
		return new ErrorResponse('Error', 403, ['basic verification is required'])
	}

	if(verification.ID === 'pending'){
		return new ErrorResponse('Error', 403, ['ID verification is required'])
	}

	if(!isString(faceData)){
		return next(new ErrorResponse(`Eror!`, 400, ['face id image should be a string']));
	}

	const mime = faceData.split(';base64')[0].split(':')[1];

	if(!mime || mime === '') {
		return next(new ErrorResponse(`invalid format`, 400, ['face id image is is expected to be base64 string']));
	}

	const gen = generate(6, false);

	// upload file
	const fileData = {
		file: faceData,
		filename: gen.toString() + '_' + user.email + 'face_id',
		mimeType: mime
	}

	// upload to google cloud storage
	const gData = await uploadBase64File(fileData);

	kyc.faceId = gData.publicUrl; 
	await kyc.save();

	verification.face = 'submitted';
	await verification.save();

	
	res.status(200).json({
		error: false,
		errors: [],
		data: kyc,
		message: 'successful',
		status: 200
	})
	

});

// @desc        Update user basic kyc
// @route       PUT /api/identity/v1/users/kyc/update-address/:id
// @access      Private
export const updateAddressKyc = asyncHandler(async (req: Request, res:Response, next: NextFunction) => {

	const { country, city, state,  address, postalCode, utilityDoc, } = req.body;
	
	const user = await User.findOne({ _id: req.params.id });

	if(!user){
		return new ErrorResponse('Error', 404, ['user does not exist'])
	}

	const verification = await Verification.findOne({ user: user._id });

	if(!verification){
		return new ErrorResponse('Error', 404, ['user verification data does not exist'])
	}

	const data: IAddressKyc = {
		country, 
		city, 
		state,  
		address, 
		postalCode, 
		utilityDoc,
	} 

	const validate = await validateAddressKyc(data);

	if(validate.error === true){
		return new ErrorResponse('Error', 400, [`${validate.message}`]);
	}

	const kyc = await Kyc.findOne({ user: user._id });

	if(!kyc){
		return new ErrorResponse('Error', 403, ['basic verification is required'])
	}

	if(verification.ID === 'pending'){
		return new ErrorResponse('Error', 403, ['ID verification is required'])
	}

	if(verification.face === 'pending'){
		return new ErrorResponse('Error', 403, ['face verification is required'])
	}

	if(!isString(utilityDoc)){
		return next(new ErrorResponse(`Eror!`, 400, ['utitlity doc should be a string']));
	}

	const mime = utilityDoc.split(';base64')[0].split(':')[1];

	if(!mime || mime === '') {
		return next(new ErrorResponse(`invalid format`, 400, ['utility doc is is expected to be base64 string']));
	}

	const gen = generate(6, false);

	// upload file
	const fileData = {
		file: utilityDoc,
		filename: gen.toString() + '_' + user.email + 'utility_doc',
		mimeType: mime
	}
	// upload to google cloud storage
	const gData = await uploadBase64File(fileData);


	kyc.country = country;
	kyc.address = address;
	kyc.city = city;
	kyc.state = state;
	kyc.postalCode = postalCode;
	kyc.utilityDoc = gData.publicUrl; 
	await kyc.save();

	verification.address = 'submitted';
	await verification.save();

	
	res.status(200).json({
		error: false,
		errors: [],
		data: kyc,
		message: 'successful',
		status: 200
	})
	

});


export const seedDB = asyncHandler(async (req: Request, res:Response, next: NextFunction) => {
	
	await seedData();
	
	res.status(200).json({
		error: false,
		errors: [],
		data: null,
		message: 'successful',
		status: 200
	})

})

/** 
 * snippet
 * **/

// @desc        Login user (with verification)
// @route       POST /api/identity/v1/auth/login
// @access      Public
// export const funcd = asyncHandler(async (req: Request, res:Response, next: NextFunction) => {

// })
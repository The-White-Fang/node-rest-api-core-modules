/*
* method handlers for checks
* 
*/

// dependencies
const validate = require('./validate');
const helpers = require('./helpers');
const _data = require('./data');
const { verifyToken } = require('./token-methods');
const config = require('./config');

// container for method handlers
let methods = {};

// checks post
// required: protocol, url, method, successCodes, timeout
methods.POST = async (data) => {
	// validate inputs
	let protocol = validate.protocol(data.payload.protocol),
		url = validate.url(data.payload.url),
		method = validate.method(data.payload.method),
		successCodes = validate.successCodes(data.payload.successCodes),
		timeout = validate.timeout(data.payload.timeout);

	// check if required fields are passed and valid
	if (!(protocol && url && method && successCodes && timeout)) {
		return { status: 400, respData: { error: 'Missing required fields, or passed with invalid values' } };
	}

	// get token from headers
	let tokenId = data.headers.token;

	if (!tokenId) {
		return { status: 401, respData: { error: 'Missing token header' } };
	}

	let token = await _data.read('tokens', tokenId);

	if (!token || token.expires < Date.now()) {
		return { status: 400, respData: { error: 'Invalid or expired token' } };
	}

	// retrieve user from token
	let user = await _data.read('users', token.phone);

	if (!user) {
		return { status: 500, respData: { error: 'Failed to read associated user data' } };
	}

	// get checks array from user
	let userChecks = user.checks || [];

	if (userChecks.length >= config.maxChecks) {
		return { status: 400, respData: { error: `Maximum number of checks (${config.maxChecks}) reached` } };
	}

	// create check object
	let id = helpers.generateRandomString(20);
	let check = {
		id,
		userPhone: user.phone,
		protocol,
		url,
		method,
		successCodes,
		timeout
	};

	// store check object in datastore
	if (!await _data.create('checks', id, check)) {
		return { status: 500, respData: { error: 'Failed to create check' } };
	}

	// add check id to user
	userChecks.push(id);
	user.checks = userChecks;

	// save updated user object in datastore
	if (!await _data.update('users', user.phone, user)) {
		return { status: 500, respData: { error: 'Failed to update user' } };
	}

	return { status: 200, respData: check };
}

// checks get
// required: id
methods.GET = async (data) => {
	// validate inputs
	let id = validate.id(data.queryString.id);

	// check if id is passed and valid
	if (!id) {
		return { status: 400, respData: { error: 'Missing required field \'id\'' } };
	}

	// get token
	let tokenId = data.headers.token;

	if (!tokenId) {
		return { status: 400, respData: { error: 'Missing token header' } };
	}

	// get check object
	let check = await _data.read('checks', id);

	if (!check) {
		return { status: 404, respData: { error: 'Specified check not found' } };
	}

	// check if specified check belogs to the current user
	if (!await verifyToken(tokenId, check.userPhone)) {
		return { status: 403, respData: { error: 'Invalid or expired token' } };
	}

	return { status: 200, respData: check };
}

// checks put
// required: id
// optional: protocol, url, method, successCodes, timeout
methods.PUT = async (data) => {
	// validate inputs
	let id = validate.id(data.payload.id),
		protocol = validate.protocol(data.payload.protocol),
		url = validate.url(data.payload.url),
		method = validate.method(data.payload.method),
		successCodes = validate.successCodes(data.payload.successCodes),
		timeout = validate.timeout(data.payload.timeout);

	// check if required field is passed and valid
	if (!id) {
		return { status: 400, respData: { error: 'Missing required field \'id\'' } };
	}

	// check if atleast 1 optional field is passed and valid
	if (!(protocol || url || method || successCodes || timeout)) {
		return { status: 400, respData: { error: 'Missing data to be updated, or invalid values passed' } };
	}

	// get token from headers
	let tokenId = data.headers.token;

	if (!tokenId) {
		return { status: 403, respData: { error: 'Missing token header' } };
	}

	// get check object
	let check = await _data.read('checks', id);

	if (!check) {
		return { status: 400, respData: { error: 'Specified check not found' } };
	}

	// check if current user is authorized to update the check
	if (!verifyToken(tokenId, check.userPhone)) {
		return { status: 400, respData: { error: 'Invalid or expired token' } };
	}

	// update check object
	if (protocol) {
		check.protocol = protocol;
	}
	if (url) {
		check.url = url;
	}
	if (method) {
		check.method = method;
	}
	if (successCodes) {
		check.successCodes = successCodes;
	}
	if (timeout) {
		check.timeout = timeout;
	}

	// upddate check object
	if (!await _data.update('checks', id, check)) {
		return { status: 500, respData: { error: 'Failed to update check' } };
	}

	return { status: 200, respData: check };
}

// checks delete
// required: id
methods.DELETE = async (data) => {
	// validate inputs
	let id = validate.id(data.queryString.id);

	// check if id is passed and valid
	if (!id) {
		return { status: 400, respData: { error: 'Missing required field \'id\'' } };
	}

	// get token
	let tokenId = data.headers.token;

	if (!tokenId) {
		return { status: 400, respData: { error: 'Missing token header' } };
	}

	// get check object
	let check = await _data.read('checks', id);

	if (!check) {
		return { status: 400, respData: { error: 'Specified check not found' } };
	}

	// check if specified check belogs to the current user
	if (!await verifyToken(tokenId, check.userPhone)) {
		return { status: 403, respData: { error: 'Invalid or expired token' } };
	}

	// get user
	let user = await _data.read('users', check.userPhone);

	if (!user) {
		return { status: 500, respData: { error: 'Failed to read user data' } };
	}
	
	// remove check from user data and save to datastore
	user.checks.splice(user.checks.indexOf(id), 1);
	
	if (!await _data.update('users', user.phone, user)){
		return { status: 500, respData: { error: 'Failed to update user data' } };
	}
	
	// delete check from datastore
	if (!await _data.delete('checks', id)) {
		return { status: 500, respData: { error: 'Failed to delete specified check' } };
	}

	return { status: 200, respData: check };
}

module.exports = methods;
/*
* method handlers for users
* 
*/

// dependencies
const validate = require('./validate');
const helpers = require('./helpers');
const _data = require('./data');
const { verifyToken } = require('./token-methods');

// container for method handlers
methods = {};

// users post
// required: firstname, lastname, phone, password
methods.POST = async (data) => {
	// validate inputs
	let firstname = validate.name(data.payload.firstname),
		lastname = validate.name(data.payload.lastname),
		phone = validate.phone(data.payload.phone),
		password = validate.password(data.payload.password);

	// check if all fields are passed and valid
	if (!(firstname && lastname && phone && password)) {
		return { status: 400, respData: { error: 'Missing required fields, or invalid data passed' } };
	}

	password = helpers.hash(password);

	// check if user doesn't already exist
	if (await _data.read('users', phone)) {
		return { status: 400, respData: { error: 'User with this phone already exist' } };
	}

	// create user object
	let user = { phone, firstname, lastname, password };

	// store user object in datastore
	if (!(await _data.create('users', phone, user))) {
		return { status: 500, respData: { error: 'Failed to create new user.' } };
	}

	// delete password before sending saved user data
	delete user.password;

	return { status: 200, respData: user };
}

// users get
// requried: phone
methods.GET = async (data) => {
	// validate inputs
	let phone = validate.phone(data.queryString.phone);

	if (!phone) {
		return { status: 400, respData: { error: 'Missing required field \'phone\' or passed with invalid value' } };
	}
	
	// authorize user
	// get token from headers
	let token = data.headers.token;
	
	if (!token) {
		return { status: 403, respData: { error: 'Token header not passed or invalid value' } };
	}
	
	// verify if token belongs to requested user
	if (!await verifyToken(token, phone)) {
		return { status: 403, respData: { error: 'Token didn\'t match the user' } };
	}

	// get user object
	let user = await _data.read('users', phone);

	if (!user) {
		return { status: 404, respData: { error: 'Specified user not found' } };
	}

	// delete password before sending user data
	delete user.password;

	return { status: 200, respData: user };
}

// users put 
// required: phone
// optional: firstname, lastname, password
methods.PUT = async (data) => {
	// validate inputs
	let phone = validate.phone(data.payload.phone),
		firstname = validate.name(data.payload.firstname),
		lastname = validate.name(data.payload.lastname),
		password = validate.password(data.payload.password);

	// check if required field is passed and valid
	if (!phone) {
		return { status: 400, respData: { error: 'Missing required field \'phone\' or passed with invalid value' } };
	}
	
	// check if atleast one optional field is passed and valid
	if (!(firstname || lastname || password)) {
		return { status: 400, respData: { error: 'No data passed to be updated or the data passed is invalid' } };
	}

	// authorize user
	// get token from headers
	let token = data.headers.token;
	
	if (!token) {
		return { status: 403, respData: { error: 'Token header not passed or invalid value' } };
	}
	
	// verify if token belongs to specified user
	if (!await verifyToken(token, phone)) {
		return { status: 403, respData: { error: 'Token didn\'t match the user' } };
	}

	// read user object
	let user = await _data.read('users', phone);

	if (!user) {
		return { status: 400, respData: { error: 'Specified user not found' } };
	}

	// update user obejct
	if (firstname) {
		user.firstname = firstname;
	}
	if (lastname) {
		user.lastname = lastname;
	}
	if (password) {
		user.password = helpers.hash(password);
	}

	// store updated object in datastore
	if (!(await _data.update('users', phone, user))) {
		return { status: 500, respData: { error: 'Failed to update user data' } };
	}
	
	// delete password before sending user data
	delete user.password;

	return { status: 200, respData: user };
}

// user delete
// required: phone
methods.DELETE = async (data) => {
	// validate inputs
	let phone = validate.phone(data.queryString.phone);

	if (!phone) {
		return { status: 400, respData: { error: 'Missing required field \'phone\' or passed with invalid value' } };
	}

	// authorize user
	// get token from headers
	let token = data.headers.token;
	
	if (!token) {
		return { status: 403, respData: { error: 'Token header not passed or invalid value' } };
	}
	
	// verify if token belongs to requested user
	if (!await verifyToken(token, phone)) {
		return { status: 403, respData: { error: 'Token didn\'t match the user' } };
	}

	let user = await _data.read('users', phone);

	if (!user) {
		return { status: 400, respData: { error: 'Specified user not found' } };
	}
	
	// delete user
	if (!(await _data.delete('users', phone))) {
		return { status: 500, respData: { error: 'Failed to delete specified user' } };
	}

	// delete password before sending user data
	delete user.password;

	return { status: 200, respData: user };
}

module.exports = methods;
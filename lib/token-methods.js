/*
* method handlers for tokens
* 
*/

// dependencies
const validate = require('./validate');
const helpers = require('./helpers');
const _data = require('./data');

// container for method handlers
methods = {};

// tokens post
// required: phone, password
methods.POST = async (data) => {
	// validate inputs
	let phone = validate.phone(data.payload.phone),
		password = validate.password(data.payload.password);

	// check if all fields are passed and valid
	if (!(phone && password)) {
		return { status: 400, respData: { error: 'Missing required fields, or invalid data passed' } };
	}

	// check if user exist
	let user = await _data.read('users', phone);

	if (!user) {
		return { status: 400, respData: { error: 'User does not exist' } };
	}
	
	// verify password
	if (!helpers.verifyHash(password, user.password)) {
		return { status: 401, respData: { error: 'Incorrect password' } };
	}

	// create token object
	let id = helpers.generateRandomString(20),
		expires = Date.now() + 1000 * 60 *60;

	let token = { id, phone, expires };

	// store token object in datastore
	if (!(await _data.create('tokens', id, token))) {
		return { status: 500, respData: { error: 'Failed to create new token.' } };
	}

	return { status: 200, respData: token };
}

// tokens get
// requried: id
methods.GET = async (data) => {
	// validate inputs
	let id = validate.id(data.queryString.id);

	if (!id) {
		return { status: 400, respData: { error: 'Missing required field \'id\' or passed with invalid value' } };
	}

	// check if token exists
	let token = await _data.read('tokens', id);

	if (!token) {
		return { status: 404, respData: { error: 'Specified token not found' } };
	}

	return { status: 200, respData: token };
}

// tokens put 
// required: id, extend (boolean: true)
methods.PUT = async (data) => {
	// validate inputs
	let id = validate.id(data.payload.id),
		extend = validate.extend(data.payload.extend);

	// check if required field is passed and valid
	if (!(id && extend)) {
		return { status: 400, respData: { error: 'Missing required field \'phone\' or passed with invalid value' } };
	}

	// read token object
	let token = await _data.read('tokens', id);

	if (!token) {
		return { status: 400, respData: { error: 'Specified token not found' } };
	}
	
	// check if token is not already expired
	if (token.expires < Date.now()) {
		return { status: 400, respData: { error: 'Specified token already expired' } };
	}

	// update token obejct
	token.expires = Date.now() + 1000 * 60 * 60;

	// store updated object in datastore
	if (!(await _data.update('tokens', id, token))) {
		return { status: 500, respData: { error: 'Failed to update token' } };
	}

	return { status: 200, respData: token };
}

// user delete
// required: id
methods.DELETE = async (data) => {
	// validate inputs
	let id = validate.id(data.queryString.id);

	if (!id) {
		return { status: 400, respData: { error: 'Missing required field \'id\' or passed with invalid value' } };
	}

	// check if token exists
	let token = await _data.read('tokens', id);

	if (!token) {
		return { status: 400, respData: { error: 'Specified token not found' } };
	}
	
	// delete token
	if (!(await _data.delete('tokens', id))) {
		return { status: 500, respData: { error: 'Failed to delete specified token' } };
	}

	return { status: 200, respData: token };
}

module.exports = methods;
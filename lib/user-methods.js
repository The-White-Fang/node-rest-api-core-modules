/*
* method handlers for users
* 
*/

// dependencies
const validate = require('./validate');
const helpers = require('./helpers');
const _data = require('./data');

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

module.exports = methods;
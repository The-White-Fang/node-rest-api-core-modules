/*
* handlers for requests
* 
*/

// dependencies
const userMethods = require('./user-methods');
const tokenMethods = require('./token-methods');

// container for handlers
let handlers = {};

// ping handler
handlers.ping = async (data) => {
	return { status: 200 };
}

// not found handler
handlers.notFound = (data) => {
	return { status: 404 };
}

// users handler
handlers.users = (data) => {
	// allowed methods
	let allowedMethods = ['POST', 'GET', "PUT", 'DELETE'];

	// check if method is in allowed methods
	let index = allowedMethods.indexOf(data.method);

	if (index < 0) {
		return { status: 405, respData: { error: 'Method not allowed' } };
	}

	return handlers._users[data.method](data);
}

// method handlers for tokens
handlers._users = userMethods;

handlers.tokens = (data) => {
	// allowed methods
	let allowedMethods = ['POST', 'GET', "PUT", 'DELETE'];

	// check if method is in allowed methods
	let index = allowedMethods.indexOf(data.method);

	if (index < 0) {
		return { status: 405, respData: { error: 'Method not allowed' } };
	}

	return handlers._tokens[data.method](data);
}

// method handlers for tokens
handlers._tokens = tokenMethods;

module.exports = handlers;
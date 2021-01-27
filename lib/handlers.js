/*
* handlers for requests
* 
*/

// dependencies
const userMethods = require('./user-methods');

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

	let index = allowedMethods.indexOf(data.method);

	if (index < 0) {
		return { status: 405, respData: { error: 'Method not allowed' } };
	}

	return handlers._users[data.method](data);
}

// method handlers for users
handlers._users = userMethods;

module.exports = handlers;
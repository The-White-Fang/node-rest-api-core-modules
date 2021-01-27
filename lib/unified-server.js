/*
* create a unified server function to handle http and https requests
*/
const url = require('url');
const StringDecoder = require('string_decoder').StringDecoder;
const handlers = require('./handlers');
const helpers = require('./helpers');

module.exports = async (req, res) => {
	const data = {}

	// parse url
	const parsedURL = url.parse(req.url, true);

	// get path
	data.path = parsedURL.pathname.replace(/^\/|\/$/, '');

	// get method
	data.method = req.method;

	// get query string
	data.queryString = parsedURL.query;

	// get request headers
	data.headers = req.headers;

	// get request payload
	const decoder = new StringDecoder('utf-8');
	data.payload = '';
	req.on('data', (chunk) => {
		data.payload += decoder.write(chunk);
	});

	req.on('end', async () => {
		data.payload += decoder.end();

		data.payload = helpers.jsonParse(data.payload);

		// set headers
		res.setHeader('content-type', 'application/json');

		// select route handler to be executed
		const routeHandler = router[data.path] || handlers.notFound;

		// send request data to handler
		let { status, respData } = await routeHandler(data);
		res.statusCode = status;
		res.end(JSON.stringify(respData));
	});
}

// define route
const router = {
	'ping': handlers.ping,
	'users': handlers.users,
	'tokens': handlers.tokens,
	'checks': handlers.checks,
}
/*
* helper functions
*
*/

// dependecies
const crypto = require('crypto');
const config = require('./config');
const https = require('https');

// wrapper for helper function
const helpers = {};

// parse object from json string, if failed return empty object
helpers.jsonParse = (jsonString) => {
	try {
		return JSON.parse(jsonString);
	} catch (ex) {
		return {};
	}
}

// create a hashed password
helpers.hash = (str) => {
	// type checking
	if (typeof str != 'string') {
		return false;
	}

	const hash = crypto.createHash('sha256', config.hashingSecret);

	return hash.update(str).digest('hex');
}

// verify the given string against hash
helpers.verifyHash = (str, hash) => {
	return helpers.hash(str) == hash;
}

// generate a random len long token
helpers.generateRandomString = (len) => {
	// type checking
	if (typeof len != 'number' && len < 1) {
		return false;
	}

	let allowedChars = '1234567890abcdefghijklmnopqrstuvwxyz', 	// allowed characters
		token = ''; 											// initializing final token string

	for (let i = 0, index; i < len; i++) {
		// generate a random number between 0 - len
		index = Math.floor(Math.random() * (len - 1));

		// access the character at above index and append to final token
		token += allowedChars[index];
	}

	return token;
}

helpers.sendSMS = (phone, message) => {
	return new Promise((resolve, reject) => {
		let payload = JSON.stringify({
			To: phone,
			From: config.twillio.fromPhone,
			Body: message,
		});

		let options = {
			protocol: 'https:',
			hostname: 'api.twilio.com',
			method: 'POST',
			path: `/2010-04-01/Accounts/${config.twillio.accountSid}/Messages.json`,
			auth: `${config.twillio.accountSid}:${config.twillio.authToken}`,
			headers: {
				'content-type': 'application/x-www-form-urlencoded',
				'content-length': Buffer.byteLength(payload),
			}
		};

		let request = https.request(options, (response) => {
			let status = response.statusCode;

			if (status == 200 || status == 201) {
				resolve(true);
			} else {
				reject(status);
			}
		});

		request.on('error', (e) => { reject(e) });

		request.write(payload);

		request.end();
	});
}

// export functions
module.exports = helpers;
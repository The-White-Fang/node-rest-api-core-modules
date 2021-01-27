/*
* Validator functions
*
*/

// container object for validator functions
const validate = {};

validate.phone = (num) => {
	if (typeof num == 'string'){
		num = num.trim();
		return num.match(/^[0-9]{10}$/) ? num : false;
	}
	return false;
}

validate.name = (str) => {
	if (typeof str == 'string'){
		str = str.trim();
		return str.length > 0 ? str : false;
	}
	return false;
}

validate.password = (pass) => {
	if (typeof pass != 'string') {
		return false;
	}

	return pass.length < 5 ? false : pass;
}

validate.id = (token) => {
	if (typeof token != 'string') {
		return false;
	}
	return token.match(/^[0-9a-z]{20}$/) ? token : false;
}

validate.extend = (extend) => {
	if (typeof extend != 'boolean') {
		return false;
	}

	return extend;
}

validate.protocol = (protocol) => {
	if (typeof protocol != 'string') {
		return false;
	}
	
	return ['https', 'http'].indexOf(protocol) < 0 ? false : protocol;
}

validate.url = (url) => {
	if (typeof url != 'string' || url.length < 1) {
		return false;
	}

	return url;
}

validate.method = (method) => {
	if (typeof method != 'string') {
		return false;
	}

	method = method.toUpperCase();

	return ['GET', 'POST', 'PUT', 'DELETE'].indexOf(method) < 0 ? false : method;
}

validate.successCodes = (successCodes) => {
	if (typeof successCodes != 'object' || !successCodes instanceof Array || successCodes.length < 1) {
		return false;
	}

	return successCodes;
}

validate.timeout = (timeout) => {
	if (typeof timeout != 'number' || timeout % 1 != 0) {
		return false;
	}

	return timeout > 0 && timeout <= 5 ? timeout : false;
}

module.exports = validate;
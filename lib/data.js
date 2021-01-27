/*
* library for storing and editing data
*
*/

const fs = require('fs/promises');
const path = require('path');
const helpers = require('./helpers');

// module exports object
lib = {};

// define base directory
lib.BASEDIR = path.join(__dirname, '../.data');

// create function
lib.create = async function (dir, file, data) {
	const filename = `${this.BASEDIR}/${dir}/${file}.json`;
	try{
		const fileHandle = await fs.open(filename, 'wx');
		await fileHandle.writeFile(JSON.stringify(data));
		await fileHandle.close();
		return true;
	} catch (ex) {
		console.log(ex)
		return false;
	}
}

lib.read = async function (dir, file) {
	const filename = `${this.BASEDIR}/${dir}/${file}.json`;
	try {
		const data = await fs.readFile(filename, {encoding: 'utf8'});
		return helpers.jsonParse(data);
	} catch (ex) {
		return false;
	}
}

lib.update = async function (dir, file, data) {
	const filename = `${this.BASEDIR}/${dir}/${file}.json`;
	try{
		const fileHandle = await fs.open(filename, 'r+');
		await fileHandle.truncate();
		await fileHandle.writeFile(JSON.stringify(data));
		await fileHandle.close();
		return true;
	} catch (ex) {
		return false;
	}
}

lib.delete = async function (dir, file) {
	const filename = `${this.BASEDIR}/${dir}/${file}.json`;
	try {
		await fs.unlink(filename);
		return true;
	} catch (ex) {
		return false;
	}

}

module.exports = lib;
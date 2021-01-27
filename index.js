/*
*
* node.js core
*
*/

// dependencies
const http = require('http');
const https = require('https');
const fs = require('fs');
const config = require('./lib/config');
const unifiedServer = require('./lib/unified-server');

// initializing http server object
const httpServer = http.createServer(unifiedServer);

// initializing server object
const httpsServerOptions = {
	key: fs.readFileSync('./https/key.pem'),
	cert: fs.readFileSync('./https/cert.pem'),
}
const httpsServer = https.createServer(httpsServerOptions, unifiedServer);

// listen to the PORT
httpServer.listen(config.httpPort, function () {
	console.log(`Server started, listening on port ${config.httpPort} in ${config.envName} mode`)
});

httpsServer.listen(config.httpsPort, function () {
	console.log(`Server started, listening on port ${config.httpsPort} in ${config.envName} mode`)
});
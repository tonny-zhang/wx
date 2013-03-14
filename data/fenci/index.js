var http = require('http');

var query = function(text){
	var options = {
		hostname: 'segment.cnodejs.net',
		port: 80,
		path: '/s',
		method: 'POST',
		headers : {
			'Referer': 'http://segment.cnodejs.net/',
			'Origin': 'http://segment.cnodejs.net',
			'User-Agent': 'Mozilla/5.0 (Windows NT 5.1) AppleWebKit/537.11 (KHTML, like Gecko) Chrome/23.0.1271.97 Safari/537.11'
		}
	};

	var req = http.request(options, function(res) {
		console.log('STATUS: ' + res.statusCode);
		console.log('HEADERS: ' + JSON.stringify(res.headers));
		res.setEncoding('utf8');
		res.on('data', function (chunk) {
			console.log('BODY: ' + chunk);
		}).on('error',function(e){
			console.log('problem with request: ' + e.message);
		});
	});

	req.on('error', function(e) {
		console.log('problem with request: ' + e.message);
	});

	// write data to request body
	req.write('t='+text+'\n');
	req.end();
	console.log('loading');
}
// if(__filename == process.argv[1]){
// 	query('我们');
// }

query('我们');
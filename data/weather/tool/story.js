var weather = require('../index.js');
var fs = require('fs');

var ALLCODE_CACHE_FILE = __dirname+'/../cache/allCode.json';

function rewriteAllCodeCache(){
	var allCode = JSON.parse(fs.readFileSync(ALLCODE_CACHE_FILE));

	allCode.forEach(function(v,i){
		weather.getWeatherByCode(v);
	});
}

exports.rewriteAllCodeCache = rewriteAllCodeCache;

if(process.argv[1] == __filename){
	rewriteAllCodeCache();
}
var weather = require('../index.js');
var fs = require('fs');

var ALLCODE_CACHE_FILE = __dirname+'/../cache/allCode.json';

function rewriteAllCodeCache(callback){
	var allCode = JSON.parse(fs.readFileSync(ALLCODE_CACHE_FILE));
	allCode = allCode.slice(0,5);
	var totalLen = allCode.length;
	var execNum = 0;
	var cb = function(){
		if(++execNum == totalLen){
			callback && callback();
		}
	}
	allCode.forEach(function(v,i){
		process.nextTick(function(){//保证每一个写操作不会影响当前的主线程
			weather.getWeatherByCode(v,cb);
		});
	});
}

exports.rewriteAllCodeCache = rewriteAllCodeCache;

if(process.argv[1] == __filename){
	rewriteAllCodeCache(function(){
		process.send('all cache complete!');
	});
}
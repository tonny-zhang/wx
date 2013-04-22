var http = require('http');
var fs = require('fs');
var Segment = require('node-segment').Segment;
var firstLetter = require('util/chineseFirstLetter');
var helper = require('../helper');
var DIC_PATH = __dirname+'/cache/';
var EXT_CATCH_FILE = '.json';
var WEATHER_CACHE_PATH = DIC_PATH+'weather_info/';
var ALLCODE_CACHE_FILE = DIC_PATH + 'allCode' + EXT_CATCH_FILE;

if(!fs.existsSync(WEATHER_CACHE_PATH)){
	fs.mkdirSync(WEATHER_CACHE_PATH,0755);
}
//正则表达式
var RE_SPECIAL_CITY = /北京|天津|上海|重庆/;
var RE_PROVINCE = /省|(北京|上海|天津|重庆)市?/;
var RE_CITY = /市/;
var RE_COUNTRY = /[区县]/;
var RE_KEYWORDS_FILTER = /[省市区]|自治区/;

var RE_IS_LETTER = /\w+/;

//城市等级
var LEVEL_PROVINCE = 1;
var LEVEL_CITY = 2;
var LEVEL_COUNTRY = 3;

/*定义工具方法*/
(function(){
	var _toString = Object.prototype.toString;
	//isArray isObject
	['Array','Object'].forEach(function(v){
		global['is'+v] = function(a){
			return _toString.call(a) == '[object '+v+']';
		}
	});
	//得到天气数据的城市名
	global['getCityName'] = function(v){
		return (v.parent||'').replace('-','').replace(v.name,'') + v.name+(v.l == LEVEL_PROVINCE && !RE_SPECIAL_CITY.test(v.name) ? '省' : '');//这里的加“省”提示，只针对“海南”
	}
})();


var segment = new Segment();
// 使用默认的识别模块及字典
segment.useDefaltNoDictOptimizer();


/*根据关键词得到天气网城市码*/
function getAreaCode(keyWords){
	var result = [];
	var _tempKeyWords = _parseKeywords(keyWords);
	keyWords = [];
	_tempKeyWords.forEach(function(v,i){
		var keyWord = v.name.replace(RE_KEYWORDS_FILTER,'');
		if(keyWord.length < 5){//关键字数太多舍弃
			var fileName = firstLetter.convert(keyWord.charAt(0));
			if(RE_IS_LETTER.test(fileName)){
				//防止没有数据文件
				try{
					var dic = require(DIC_PATH+fileName+EXT_CATCH_FILE);
					var cityInfo = dic[keyWord];//console.log(keyWord,cityInfo);
					if(cityInfo){
						keyWords.push(v);//重新记录有效关键词
						cityInfo.forEach(function(v,i){
							v.name = keyWord;
							cityInfo[i] = v;
						})
						result.push.apply(result,cityInfo);
					}
				}catch(e){}
			}
		}
	});
	if(keyWords.length > 1){
		var sortArr = [[],[],[]];
		result.forEach(function(v,i){
			sortArr[v.l-1].push(v);
		});
		//过滤没有数据的等级数组
		sortArr = sortArr.filter(function(v,i){
			if( v.length > 0 ){
				return v;
			}
		});
		//当输入多个关键词，但只有一个查出天气情况，进行模糊匹配
		if(sortArr.length == 1){
			result = sortArr.pop();
		}else{
			//当关键词数和结果数不一致时，说明出现了如：朝阳　的查询结果，应把第三级（即“北京朝阳”）的数据去掉
			if(sortArr.length > keyWords.length && keyWords.length == 2){
				//关键词中有直连辖市
				if(keyWords.some(function(v,i){
					if(RE_SPECIAL_CITY.test(v.name)){
						return true;
					}
				})){
					sortArr.splice(1,1);
				}else{
					sortArr.pop();
				}
			}
			result = sortArr.pop().filter(function(v,i){
				var pName = v.parent;
				var toLen = sortArr.length;
				var tempIndex = 0;
				var returnVal;
				sortArr.forEach(function(v1,i1){
					v1.forEach(function(v2,i2){
						if(~pName.indexOf(v2.name)){
							tempIndex++;
							if(tempIndex == toLen){
								returnVal = v;
							}
						}
					})
				});
				return !!returnVal;
			});
		}
	}
	result = _optimizeAreaCode(result,keyWords);
	return result;
}
/*分析关键词*/
function _parseKeywords(keyWords){
	var result = [];
	keyWords = isArray(keyWords) ? keyWords : segment.doSegment(keyWords).map(function(v,i){
		return v.w;
	});
	keyWords.forEach(function(v,i){
		var level = 0;
		//由于分词时没有合并词优化，先不考虑“自治区”
		if(RE_PROVINCE.test(v)){
			level = LEVEL_PROVINCE;
		}else if(RE_CITY.test(v)){
			level = LEVEL_CITY;
		}else if(RE_COUNTRY.test(v)){
			level = LEVEL_COUNTRY;
		}
		keyWords[i] = {name:v,level:level};
	});
	keyWords.sort(function(a,b){
		return a.level < b.level;
	});
	return keyWords;
}
/*优化得到的城市地区码信息(根据输入的关键词等级)*/
function _optimizeAreaCode(areaCode,keyWords){//console.log(areaCode,keyWords);
	//目前测试数据，只优化关键词为一个，且结果有两个的，如：海南
	if(keyWords.length == 1 && areaCode.length > 1){
		var level = keyWords[0].level;
		var result = [];
		areaCode.forEach(function(v,i){
			if(v.l == level){
				result.push(v);
			}
		});
		if(result.length){
			areaCode = result;
		}
	}
	return areaCode;
}
/*发请求*/
function _request(url,callback){
	http.get(url,function(res){
		var message = '';
		res.on('data',function(d){
			message += d.toString();
		}).on('end',function(){
			callback && callback(null,message);
		}).on('error',function(err){
			callback && callback(err);
		});
	}).on('error',function(err){
		callback && callback(err);
	})	
}
/*根据经纬度得到天气信息*/
function getWeatherByLocation (location,callback){//纬度,经度 lat,lng
	callback || (callback = new Function());
	_request('http://api.map.baidu.com/geocoder?location='+location+'&output=json',function(err,message){
		try{
			var baiduResult = JSON.parse(message);
			if(baiduResult.status == 'OK'){
				var result = baiduResult.result.addressComponent;
				var code = getAreaCode([result.province,result.city,result.district]);
				_parseCode(code,callback);
			}else{
				callback({msg:'result error',status:baiduResult.status});
			}
		}catch(e){
			callback({msg:'no map info',status:510});
		}
	});
}
/*分析得到的天气城市码*/
function _parseCode(code,callback){
	if(code && isArray(code) && code.length > 0){
		if(code.length == 1){
			getWeatherByCode(code[0],callback);
		}else{
			var replyInfo = [];
			code.forEach(function(v,i){
				replyInfo.push(getCityName(v));//这里的加“省”提示，只针对“海南”
			});
			callback && callback({code:code,msg:helper.manyResults.replace('__manyInfo__',replyInfo.join()).replace('__exampleInfo__',replyInfo.join(' 或 '))})
		}
	}else{
		callback && callback({msg:helper.noSearchResult})
	}
}
/*根据关键词得到天气信息*/
function getWeatherByCityName(cityName,callback){
	var code = getAreaCode(cityName);
	_parseCode(code,callback);
}
function _isLegalCache(mtime){
	mtime = +new Date(mtime);//保证是毫秒数据
	var time = [6,12,18];
	var nowHour = new Date().getHours();
	var startTimeHour = time.filter(function(v){
		return v < nowHour;
	});
	startTimeHour = startTimeHour.pop();
	var startDate = new Date();
	if(!startTimeHour){
		startTimeHour = time[time.length - 1];
		startDate.setDate(startDate.getDate() - 1);//前一天
	}
	startDate.setHours(startTimeHour);
	startDate.setMinutes(30);
	startDate.setSeconds(0);

	var endTimeHour = time.filter(function(v){
		return v > nowHour;
	});
	endTimeHour = endTimeHour.shift();
	var endDate = new Date();
	if(!endTimeHour){
		endTimeHour = time[0];
		endDate.setDate(startDate.getDate() + 1);//后一天
	}
	endDate.setHours(endTimeHour);
	endDate.setMinutes(30);
	endDate.setSeconds(0);

	return (+startDate < mtime && mtime < +endDate);
}
// var GLOBAL_CACHE = {date:null,isCaching:false};
/*根据天气城市码得到天气信息，areaCode为内部得到的对象，也可以为城市码字符串*/
function getWeatherByCode(areaCode,callback){
	callback || (callback = function(){});
	var _tempAreaCode = areaCode;
	if(/^\d{9}$/.test(areaCode) || isObject(_tempAreaCode) && (areaCode = _tempAreaCode.id)){
		var cacheFileName = WEATHER_CACHE_PATH+areaCode+EXT_CATCH_FILE;
		if(fs.existsSync(cacheFileName)){
			//if(+new Date() - fs.statSync(cacheFileName).mtime.getTime() < 1000*60*60*2){//缓存2小时
			if(_isLegalCache(fs.statSync(cacheFileName).mtime.getTime())){
				//防止缓存数据写不同步，造成的空数据
				try{
					var weatherCacheInfo = require(cacheFileName);
				}catch(e){}				
			}
		}
		if(weatherCacheInfo){
			callback && callback(null,weatherCacheInfo);
		}else{
			//http://data.weather.com.cn/forecast/101010100.html
			_request('http://m.weather.com.cn/data/'+areaCode+'.html',function(err,message){
				if(!err){
					try{
						var weatherInfo = JSON.parse(message);
						var info;
						if(weatherInfo && (info = weatherInfo.weatherinfo)){
							_tempAreaCode.name && (info.city = getCityName(_tempAreaCode));
							callback(null,info);
							fs.writeFileSync(cacheFileName,JSON.stringify(info));
						}else{
							callback({msg:'no weather info'});
						}
					}catch(e){
						callback({msg:'parse weather info 501'});
					}
				}else{
					callback({msg:'get weather info 502'});
				}			
			})
		}
	}else{
		callback({msg:'Illegal areaCode when geting weather info'});
	}
}

exports.getWeatherByLocation = getWeatherByLocation;
exports.getWeatherByCityName = getWeatherByCityName;
exports.getWeatherByCode = getWeatherByCode;
exports.getAreaCode = getAreaCode
exports._isLegalCache = _isLegalCache;//用于测试
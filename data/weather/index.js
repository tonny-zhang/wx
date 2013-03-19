var http = require('http');
var Segment = require('node-segment').Segment;
var firstLetter = require('util/chineseFirstLetter');
var DIC_PATH = './cache/';
var EXT_CATCH_FILE = '.json';

var segment = new Segment();
// 使用默认的识别模块及字典
segment.useDefaltNoDictOptimizer();

var LEVEL_PROVINCE = 1;
var LEVEL_CITY = 2;
var LEVEL_COUNTRY = 3;
//根据关键词得到天气网城市码
function getAreaCode(keyWords){
	var result = [];
	var keyWords = _parseKeywords(keyWords);
	keyWords.forEach(function(v,i){
		var keyWord = v.name.replace(/[省市区]|自治区/,'');
		if(keyWord.length < 5){//关键字数太多舍弃
			var dic = require(DIC_PATH+firstLetter.convert(keyWord.charAt(0))+EXT_CATCH_FILE);
			var cityInfo = dic[keyWord];//console.log(keyWord,cityInfo);
			if(cityInfo){
				cityInfo.forEach(function(v,i){
					v.name = keyWord;
					cityInfo[i] = v;
				})
				result.push.apply(result,cityInfo);
			}
		}
	});
	if(keyWords.length > 1){
		var sortArr = [[],[],[]];
		result.forEach(function(v,i){
			sortArr[v.l-1].push(v);
		});
		sortArr = sortArr.filter(function(v,i){
			if( v.length > 0 ){
				return v;
			}
		});
		//当输入多个关键词，但只有一个查出天气情况，进行模糊匹配
		if(sortArr.length == 1){
			result = sortArr.pop();
		}else{
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
				return returnVal;
			});
		}
	}
	result = _optimizeAreaCode(result,keyWords);
	return result;
}
function _parseKeywords(keyWords){
	var result = [];
	keyWords = Object.prototype.toString.call(keyWords) == '[object Array]' ? keyWords : segment.doSegment(keyWords).map(function(v,i){
		return v.w;
	});
	keyWords.forEach(function(v,i){
		var level = 0;
		//由于分词时没有合并词优化，先不考虑“自治区”
		if(/省|(北京|上海|天津|重庆)市?/.test(v)){
			level = LEVEL_PROVINCE;
		}else if(/[市]/.test(v)){
			level = LEVEL_CITY;
		}else if(/[区县]/.test(v)){
			level = LEVEL_COUNTRY;
		}
		keyWords[i] = {name:v,level:level};
	});
	// keyWords.sort(function(a,b){
	// 	return a.level < b.level;
	// });
	return keyWords;
}
function _optimizeAreaCode(areaCode,keyWords){
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
function getWeatherByLocation (location,callback){//纬度,经度 lat,lng
	_request('http://api.map.baidu.com/geocoder?location='+location+'&output=json',function(err,message){
		var baiduResult = JSON.parse(message);
		if(baiduResult.status == 'OK'){
			var result = baiduResult.result.addressComponent;
			var code = getAreaCode([result.province,result.city,result.district]);
			_parseCode(code,callback);
		}else{
			callback && callback({msg:'result error',status:baiduResult.status});
		}
	});
}
function _parseCode(code,callback){
	if(code){
		if(code.length == 1){
			getWeatherByCode(code[0].id,callback);
		}else{
			var replyInfo = [];
			code.forEach(function(v,i){
				replyInfo.push((v.parent||'').replace('-','').replace(v.name,'') + v.name+v.l == LEVEL_PROVINCE?'省':'');//这里的加“省”提示，只针对“海南”
			});
			callback && callback({code:code,msg:"查到多个相同的信息:["+replyInfo.join()+"]，请输入更精确的信息查询，如："+replyInfo.join(' 或 ')})
		}
	}else{
		callback && callback({msg:"我没有找到你要查询的地区信息"})
	}
}

function getWeatherByCityName(cityName,callback){
	var code = getAreaCode(cityName);
	_parseCode(code,callback);
}
function getWeatherByCode(areaCode,callback){
	if(/^\d{9}$/.test(areaCode)){
		//http://data.weather.com.cn/forecast/101010100.html
		_request('http://m.weather.com.cn/data/'+areaCode+'.html',function(err,message){
			var weatherInfo = JSON.parse(message);
			if(weatherInfo && weatherInfo.weatherinfo){
				callback && callback(null,weatherInfo.weatherinfo);
			}else{
				callback && callback(null,{msg:'no weather info'});
			}
		})
	}else{
		callback && callback(null,{msg:'Illegal areaCode when geting weather info'});
	}
}

exports.getWeatherByLocation = getWeatherByLocation;
exports.getWeatherByCityName = getWeatherByCityName;
exports.getWeatherByCode = getWeatherByCode;
exports.getAreaCode = getAreaCode

if(process.argv[1] == __filename){
	// console.log(_parseKeywords('北京市朝阳区'));
	// console.log(_parseKeywords('朝阳区北京'));
	// console.log(_parseKeywords('河北省邯郸市'));
	// console.log(_parseKeywords('朝阳区'));
	// console.log(_parseKeywords('朝阳市辽宁省'));
	// console.log(_parseKeywords('内蒙古自治区'));

	console.log(getAreaCode('北京'));
	console.log(getAreaCode('北京朝阳'));
	console.log(getAreaCode('朝阳'));
	console.log(getAreaCode('河北'));
	console.log(getAreaCode('河北邯郸'));
	console.log(getAreaCode('邯郸'));
	console.log(getAreaCode('邯郸磁县'));
	console.log(getAreaCode('湖南'));
	console.log(getAreaCode('湖南tq'));
	console.log(getAreaCode('湖南tw'));
	console.log(getAreaCode('青海海南'));
	console.log(getAreaCode('海南'));
	console.log(getAreaCode('海南省'));
	console.log(getAreaCode('海口'));
	console.log(getAreaCode('河北邯郸磁县'));
}
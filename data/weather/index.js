var http = require('http');
var Segment = require('node-segment').Segment;
var firstLetter = require('util/chineseFirstLetter');
var DIC_PATH = './cache/';
var EXT_CATCH_FILE = '.json';

var segment = new Segment();
// 使用默认的识别模块及字典
segment.useDefaltNoDictOptimizer();

//根据关键词得到天气网城市码
function getAreaCode(keyWords){
	var result = [];
	var ret = Object.prototype.toString.call(keyWords) == '[object Array]' ? keyWords : segment.doSegment(keyWords);
	ret.forEach(function(v,i){
		var keyWord = (v.w||v).replace(/[省市区]|自治区/,'');
		if(keyWord.length < 5){//关键字数太多舍弃
			var dic = require(DIC_PATH+firstLetter.convert(keyWord.charAt(0))+EXT_CATCH_FILE);
			var cityInfo = dic[keyWord];
			if(cityInfo){
				cityInfo.forEach(function(v,i){
					v.name = keyWord;
					cityInfo[i] = v;
				})
				result.push.apply(result,cityInfo);
			}
		}
	});
	if(result.length > 1){
		var sortArr = [[],[],[]];
		result.forEach(function(v,i){
			sortArr[v.l-1].push(v);
		});
		function check(item,parentArr){
			if(!parentArr.length){
				return true;
			}
			var parent = item.parent;
			for(var i = parentArr.length-1;i>=0;i--){
				if(~parent.indexOf(parentArr[i].name)){
					return true;
				}
			}
		}

		
		for(var i = sortArr.length - 1;i>=0;i--){
			var levelArr = sortArr[i];
			if(!levelArr.length){
				continue;
			}
			if(i == 0){
				return sortArr[0];
			}
			var returnArr = [];
			for(var i1 = levelArr.length-1;i1>=0;i1--){
				var item = levelArr[i1];
				if(check(item,sortArr[i-1])){
					if(i == 1 || (i == 2 && check(item,sortArr[0]))){
						returnArr.push(item);
					}
				}
			}
			return returnArr;
		}
		return [];
	}else if(result.length == 1){
		return result;
	}
}

function request(url,callback){
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
	request('http://api.map.baidu.com/geocoder?location='+location+'&output=json',function(err,message){
		var baiduResult = JSON.parse(message);
		if(baiduResult.status == 'OK'){
			var result = baiduResult.result.addressComponent;
			var code = getAreaCode([result.province,result.city,result.district]);
			parseCode(code,callback);
		}else{
			callback && callback({msg:'result error',status:baiduResult.status});
		}
	});
}
function parseCode(code,callback){
	if(code){
		if(code.length == 1){
			getWeatherByCode(code[0].id,callback);
		}else{
			var replyInfo = [];
			code.forEach(function(v,i){
				replyInfo.push(v.parent.replace('-','').replace(v.name) + v.name);
			});
			callback && callback({code:code,msg:"我查到多个相同的信息:["+replyInfo.json()+"]，请输入更精确的信息查询，如："+replyInfo[0]})
		}
	}else{
		callback && callback({msg:"我没有找到你要查询的地区信息"})
	}
}

function getWeatherByCityName(cityName,callback){
	var code = getAreaCode(cityName);
	parseCode(code,callback);
}
function getWeatherByCode(areaCode,callback){
	if(/^\d{9}$/.test(areaCode)){
		//http://data.weather.com.cn/forecast/101010100.html
		request('http://m.weather.com.cn/data/'+areaCode+'.html',function(err,message){
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
}
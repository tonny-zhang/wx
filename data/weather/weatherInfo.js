var http = require('http');
var firstLetter = require('util/chineseFirstLetter');
var DATE_PATH = './cache/';
var cacheFileExt = '.json';

function filterCityName(name){
	return name.replace(/[省市区]|自治区/,'');
}
/*得到天所网地区数据*/
function getInfo(cityName,parent){
	var dic = require(DATE_PATH+firstLetter.convert(cityName.charAt(0))+cacheFileExt);
	var cityInfo = dic[cityName];
	if(Object.prototype.toString.call(cityInfo) == '[object Array]'){
		var temp = [];
		for(var i = cityInfo.length-1;i>=0;i--){
			var pName = cityInfo[i].parent;
			temp[i] = 0;
			for(var ii = parent.length-1;ii>=0;ii--){
				if(parent[ii] && pName.indexOf(parent[ii]) > -1){
					temp[i]++;
				}
			}
		}
		var max = 0;
		var maxSimilar = 0;
		temp.forEach(function(v,i){
			if(max < v){
				maxSimilar = i;
			}
		});
		return cityInfo[maxSimilar].id;
	}else{
		return cityInfo;
	}
}
//console.log(getInfo('朝阳',['辽宁']));
/*根据百度得到的数据，得到天气网地区码*/
function getAreaCode(cityInfo){
	var district = filterCityName(cityInfo.district);
	var city = filterCityName(cityInfo.city);
	var province = filterCityName(cityInfo.province);
	var code ;
	if(district){
		code = getInfo(district,[city,province]);
	}
	if(!code && city){
		code = getInfo(city,[province]);
	}
	if(!code && province){
		code = getInfo(province);
	}
	return code;
}
/*
city        "北京"    //城市名称  
city_en "beijing"//应为名称  
date_y      "2011年10月18日"//当前日期  
date        "辛卯年"//阴历年  
week        "星期二"//星期几  
fchh        "18"//不详  
cityid      "101010100"//城市编码  
//这里的温度 在下午更新后是这样的, 具体的更新点儿有待补上（下午好像是18点左右，白天的自己研究去吧 哈哈）  
//当那个更新点未到达之前是这样的："temp1":"19℃~12℃", 也就是今天的最高温和最低温,也就是每天都会有个最高温和最低温,就看是那个点更新的数据了….  
temp1       "10℃~19℃"//当前日期是18日那这第一个的温度为19日凌晨到19日中午是的温度，下面以此类推  
temp2       "12℃~20℃"  
temp3       "11℃~21℃"  
temp4       "11℃~19℃"  
temp5       "13℃~18℃"  
temp6       "10℃~17℃"  
tempF1      "50℉~66.2℉"//华氏温度 同上  
tempF2      "53.6℉~68℉"  
tempF3      "51.8℉~69.8℉"  
tempF4      "51.8℉~66.2℉"  
tempF5      "55.4℉~64.4℉"  
tempF6      "50℉~62.6℉"  
weather1        "晴转阴"//同温度一样也是19日凌晨也可以说成是18日23:59:59秒//下面类推  
weather2        "阴转多云"  
weather3        "多云转晴"  
weather4        "晴转多云"  
weather5        "阴"  
weather6        "多云"  
img1        "0"//对应的显示图片编号  
img2        "2"  
img3        "2"  
img4        "1"  
img5        "1"  
img6        "0"  
img7        "0"  
img8        "1"  
img9        "2"  
img10       "99"//这个就不对了不知道为啥  
img11       "1"  
img12       "99"  
img_single      "2"  
img_title1      "晴"//18日夜间  
img_title2      "阴"//19日白天  
img_title3      "阴"//19日夜间  
img_title4      "多云"//20日白天  
img_title5      "多云"//20日夜间 一次类推  
img_title6      "晴"  
img_title7      "晴"  
img_title8      "多云"  
img_title9      "阴"  
img_title10     "阴"  
img_title11     "多云"  
img_title12     "多云"  
img_title_single        "阴"  
wind1       "微风"//一天的风力  
wind2       "微风"  
wind3       "微风"  
wind4       "微风"  
wind5       "微风"  
wind6       "微风"  
fx1     "微风"//这2个就不知道了有待研究  
fx2     "微风"  
fl1     "小于3级"//风力  
fl2     "小于3级"  
fl3     "小于3级"  
fl4     "小于3级"  
fl5     "小于3级"  
fl6     "小于3级"  
//这里的这些生活指数也是和上面的更新点有关系 18点左右更新的就是明天的生活指数了哈哈  
index       "舒适"//舒适度指数  
index_d     "建议着薄型套装或牛仔衫裤等春秋过渡装。年老体弱者宜着套装、夹克衫等。 //对应的描述   
index48     "暖"///这2个不清楚了  
index48_d       "较凉爽，建议着长袖衬衫加单裤等春秋过渡装。年老体弱者宜着针织长袖衬衫、马甲和长裤。"  
index_uv        "最弱"//紫外线指数  
index48_uv      "弱"  
index_xc        "适宜"//洗车指数  
index_tr        "很适宜"//旅游指数  
index_co        "舒适"//舒适度指数  
st1     "20"  
st2     "11"  
st3     "20"  
st4     "11"  
st5     "20"  
st6     "11"  
index_cl        "较适宜"//晨练指数  
index_ls        "不太适宜"//晾晒指数  
index_ag        "不易发"//    息斯敏过敏气象指数  
*/
function getWeatherByLocation (location,callback){//纬度,经度 lat,lng
	/**
	 * {status: '字符串状态常量', 取值如下：
		 //OK 成功
		 INVILID_KEY 非法密钥   
		 INVALID_PARAMETERS 非法参数，参数错误时候给出。
		 result: {    
			 location: {
				 lat: 纬度：数值，
				 lng: 经度：数值
			 },
			 formatted_address: ‘详细地址描述’,
			 business: '周围商圈',
			 addressComponent:{
				 city:’城市名称’,
				 district: ‘区县名称’,
				 province:’省份名称’, 
				 street: ‘街道名称’,
				 streetNumber: '门牌号码' 
			 },
			 cityCode: '城市代码'
		 }
	 }
	 */
	request('http://api.map.baidu.com/geocoder?location='+location+'&output=json',function(err,message){
		parseBDResult(message,function(err,result){
			var areaCode;
			if((areaCode = getAreaCode(result.addressComponent))){
				getWeatherByCode(areaCode,callback);
			}else{
				callback && callback({msg:'no areCode'});
			}
		});
	});
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
function parseBDResult(baiduResult,callback){
	baiduResult = JSON.parse(baiduResult);
	if(baiduResult.status == 'OK'){
		callback && callback(null,baiduResult.result);
	}else{
		callback && callback({msg:'result error',status:baiduResult.status});
	}
}
function getWeatherByCityName(cityName,callback){
	//http://api.map.baidu.com/geocoder?address=%E6%9C%9D%E9%98%B3&output=json&key=37492c0ee6f924cb5e934fa08c6b1676&city=%E8%BE%BD%E5%AE%81
	request('http://api.map.baidu.com/geocoder?address='+encodeURIComponent(cityName)+'&output=json&key=37492c0ee6f924cb5e934fa08c6b1676',function(err,message){
		parseBDResult(message,function(err,result){
			var location = result.location;
			getWeatherByLocation([location.lat,location.lng].join(),callback);
		});
	});
}
function getWeatherByCode(areaCode,callback){
	//http://data.weather.com.cn/forecast/101010100.html
	request('http://m.weather.com.cn/data/'+areaCode+'.html',function(err,message){
		var weatherInfo = JSON.parse(message);
		if(weatherInfo && weatherInfo.weatherinfo){
			callback && callback(null,weatherInfo.weatherinfo);
		}else{
			callback && callback(null,{msg:'no weather info'});
		}
	})
}
exports.getWeatherByLocation = getWeatherByLocation;
exports.getWeatherByCityName = getWeatherByCityName;
exports.getWeatherByCode = getWeatherByCode;
if(process.argv[1] == __filename){
	getWeatherByLocation('36.34064,114.09603300000003',function(err,data){
		console.log(err,data);
	});
	getWeatherByCityName('河北邯郸',function(err,data){
		console.log(err,data);
	});
	getWeatherByCode('101010100',function(err,data){
		console.log('===========',err,data);
	});
}
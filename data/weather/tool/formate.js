var fs = require('fs');
var convert = require('util/chineseFirstLetter').convert;

var DIR_NAME = __dirname+'/';
var cacheFileExt = '.json';
var cachePath = DIR_NAME+'../cache/';
var allCodeCache = cachePath + 'allCode' + cacheFileExt;

var LEVEL_PROVINCE = 1;
var LEVEL_CITY = 2;
var LEVEL_COUNTRY = 3;

function getCityInfo(callback){
	var STATE_PROVINCE = 1;
	var STATE_CITY = 2;
	fs.readFile(DIR_NAME+'/1.js',function(err,data){
		var cityInfo = {};
		data = data.toString();
		var lines = data.split('\r\n');
		var readingState = 0;
		var readCaptial = false;
		var currentProvince,currentCity;
		lines.forEach(function(v,i){
			var m;
			if((m = v.match(/^市级：(\d{5})\s+(.+)$/))){
				cityInfo[m[1]] = {name:m[2],city:{length:0}};
				readingState = STATE_PROVINCE;
				currentProvince = m[1];
				readCaptial = true;
			}else if((m = v.match(/^(\d{2}|\d{9})\s+(.+)$/))){
				if(m[1] != '00'){
					if(readingState == STATE_PROVINCE){
						cityInfo[currentProvince]['city'][m[1]] = {name:m[2],city:{length:0}};
						cityInfo[currentProvince]['city']['length']++;
						if(readCaptial){
							cityInfo[currentProvince]['captial'] = m[1];
							readCaptial = false;
						}
					}else if(readingState == STATE_CITY){
						cityInfo[currentProvince]['city'][currentCity]['city'][m[1]] = {name:m[2]}
						cityInfo[currentProvince]['city'][currentCity]['city']['length']++;
					}
				}
			}else if((m = v.match(/^  市级【(\d{2})\s+.+?】以下的：/))){
				if(m[1] != '00'){
					readingState = STATE_CITY;
					currentCity = m[1];
				}
			}
		});
		callback && callback(err,cityInfo);
		//console.log(cityInfo['10131']);
	});
}

//北京　朝阳
//河北　邯郸	磁县
function cityInfo2File(){
	var simpleInfo = {};
	function initSimpleInfo(name,id,level,parent){
		if(!simpleInfo[name]){
			simpleInfo[name] = [];
		}
		var obj = {id:id,l:level,parent:parent};
		simpleInfo[name].push({id:id,l:level,parent:parent});
	}
	/*得到所有城市码，方便批量更新数据*/
	function getCodeInfo(){
		var arr = [];
		for(var i in simpleInfo){
			var temp = simpleInfo[i];
			temp.forEach(function(v){
				v.name = i;//保证生成的缓存城市名为全称
				arr.push(v);
			});
		}
		fs.writeFileSync(allCodeCache,JSON.stringify(arr));
	}
	function info2SubFile(){
		var letterInfo = {};
		for(var i in simpleInfo){
			var firstLetter = convert(i.charAt(0));
			var info = simpleInfo[i];
			
			if(!letterInfo[firstLetter]){
				letterInfo[firstLetter] = {};
			}
			letterInfo[firstLetter][i] = simpleInfo[i];
		}
		for(var i in letterInfo){
			fs.writeFileSync(cachePath+i+cacheFileExt,JSON.stringify(letterInfo[i]));
		}
	}
	getCityInfo(function(err,citysInfo){
		if(!err){
			for(var proId in citysInfo){
				var proInfo = citysInfo[proId];
				var proName = proInfo.name;
				var cityList = proInfo.city;
				var captialId = proInfo.captial;

				for(var cityId in cityList){
					if('length' == cityId){
						continue;
					}
					var cityInfo = cityList[cityId];
					var cityName = cityInfo.name;
					var countryList = cityInfo.city;
					if(countryList.length > 0){
						var isReadCaptial = captialId && captialId == cityId;
						for(var countryId in countryList){
							if('length' == countryId){
								continue;
							}
							var name = countryList[countryId].name;
							var id = proId+cityId+countryId;
							if(countryId == cityId || name == cityName){
								initSimpleInfo(name,id,LEVEL_CITY,proName);
							}else{
								initSimpleInfo(name,id,LEVEL_COUNTRY,[proName,cityName].join('-'));
							}
							if(isReadCaptial && captialId == countryId){
								initSimpleInfo(proName,id,LEVEL_PROVINCE);
								captialId = null;
							}
							//cityInfoArr.push([countryList[countryId].name,proId+cityId+countryId,cityInfo.name,cityId,proInfo.name,proId].join('\t'));
						}
						
					}else{
						//目前只为海南省初始化省会
						if(captialId && captialId == cityId && cityId.length == 9){
							initSimpleInfo(proName,captialId,LEVEL_PROVINCE);
							captialId = null;
						}
						initSimpleInfo(cityName,cityId.length > 2?cityId:proId+cityId+'00',cityId == '01'?LEVEL_PROVINCE:LEVEL_COUNTRY,proName);	
												
						//cityInfoArr.push([cityInfo.name,proId+cityId,proInfo.name,proId].join('\t'));
					}
				}
			}
			getCodeInfo();
			info2SubFile();
			console.log('处理完成');
		}
	})
}
cityInfo2File();
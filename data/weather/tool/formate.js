var fs = require('fs');
var convert = require('util/chineseFirstLetter').convert;

var DIR_NAME = __dirname+'/';
var cacheFileExt = '.json';
var cachePath = DIR_NAME+'../cache/';

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
			}else if((m = v.match(/^(\d{2})\s+(.+)$/))){
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
		//console.log(cityInfo['10105']);
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
	// function simple2Arr(){
	// 	var arr = [];
	// 	for(var i in simpleInfo){
	// 		var info = simpleInfo[i];
	// 		var temp = [i];
	// 		if(info.length > 0){
	// 			temp.push(info.length);
	// 			var tempArr = [];
	// 			for(var a = 0,j=info.length;a<j;a++){
	// 				var _tempInfo = info[a];
	// 				tempArr.push([_tempInfo.id,_tempInfo.parent].join('_'));
	// 			}
	// 			temp.push(tempArr.join());
	// 		}
	// 		arr.push(temp.join('\t'));
	// 	}
	// 	arr.sort();
	// 	return arr;
	// }
	
	// function info2SubFile1(){
	// 	var arr = simple2Arr();
	// 	arr.forEach(function(v,i){
	// 		fs.appendFileSync('./cache/'+convert(v.charAt(0))+'.data',v+'\r\n');
	// 	})
	// }
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
							initSimpleInfo(name,id,(countryId == cityId || name == cityName?LEVEL_CITY:LEVEL_COUNTRY),[proName,cityName].join('-'));
							if(isReadCaptial && captialId == countryId){
								initSimpleInfo(proName,id,LEVEL_PROVINCE);
								captialId = null;
							}
							//cityInfoArr.push([countryList[countryId].name,proId+cityId+countryId,cityInfo.name,cityId,proInfo.name,proId].join('\t'));
						}
						
					}else{
						initSimpleInfo(cityName,proId+cityId+'00',cityId == '01'?LEVEL_PROVINCE:LEVEL_CITY,proName);
						//cityInfoArr.push([cityInfo.name,proId+cityId,proInfo.name,proId].join('\t'));
					}
				}

			}
			//fs.writeFile('./result.data',cityInfoArr.join('\r\n'));
			info2SubFile();
		}
	})
}
cityInfo2File();
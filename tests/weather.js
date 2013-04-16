var weather = require('../data/weather');
var compare = require('util/compare').compare;
(function(){
	global.test = function (name,excepted,testContent){
		if(typeof testContent == 'function'){
			testContent = testContent();
		}
		var isRight = compare(excepted,testContent);
		console.log(isRight?'√':'X',name,isRight?'':testContent);
		return isRight;
	}
})();
(function(){
	var errorCount = 0;
	var fn = function(keywords,excepted,fnName){
		if(!test(keywords,excepted,weather[fnName](keywords))){
			errorCount++;
		}
	}
	var getArea = function(keywords,excepted){
		fn(keywords,excepted,'getAreaCode');
	}
	var parseKeyWords = function(keywords,excepted){
		fn(keywords,excepted,'_parseKeywords');
	}
	end = function(){
		console.log(errorCount?'--------　X　有'+errorCount+'个错误　X　-------------------':'===============　√　全部通过　√　===============');
	}
	global.getArea = getArea;
})();

getArea('北京',[ { id: '101010100', l: 1, parent: '北京', name: '北京' } ]);
getArea('北京市朝阳区',[ { id: '101010300', l: 3, parent: '北京', name: '朝阳' } ]);
getArea('辽宁朝阳', [ { id: '101071201', l: 2, parent: '辽宁', name: '朝阳' } ]);
getArea('朝阳', [ { id: '101010300', l: 3, parent: '北京', name: '朝阳'},{id: '101071201', l: 2, parent: '辽宁', name: '朝阳' } ]);
getArea('河北',[ { id: '101090101', l: 1, name: '河北' } ]);
getArea('河北邯郸',[ { id: '101091001', l: 2, parent: '河北', name: '邯郸' } ]);
getArea('邯郸',[ { id: '101091001', l: 2, parent: '河北', name: '邯郸' } ]);
getArea('邯郸磁县',[ { id: '101091007', l: 3, parent: '河北-邯郸', name: '磁县' } ]);
getArea('湖南',[ { id: '101250101', l: 1, name: '湖南' } ]);
getArea('湖南tq',[ { id: '101250101', l: 1, name: '湖南' } ]);
getArea('湖南tw',[ { id: '101250101', l: 1, name: '湖南' } ]);
getArea('青海海南',[ { id: '101150401', l: 2, parent: '青海', name: '海南' } ]);
getArea('海南',[ { id: '101150401', l: 2, parent: '青海', name: '海南' },{id: '101310101', l: 1, name: '海南' } ]);
getArea('海南省',[ {id: '101310101', l: 1, name: '海南' } ]);
getArea('海口', [ { id: '101310101', l: 3, parent: '海南', name: '海口' } ]);
getArea('河北邯郸磁县',[ { id: '101091007', l: 3, parent: '河北-邯郸', name: '磁县' } ]);
getArea('中国北京市朝阳区红军营南路 邮政编码: 100107',[ { id: '101010300', l: 3, parent: '北京', name: '朝阳' } ]);
getArea('错误地址',[]);
end();
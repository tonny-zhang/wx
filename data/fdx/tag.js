var http = require('http');
var xml = require('util/xml2json');

function getTags(areaCode,callback){
	http.get({
		hostname: 'lizi.fandongxi.com',
		path: '/weather/view.fan',
		header: {
			Referer: 'http://www.weather.com.cn/weather/'+areaCode+'.shtml'
		},
		auth: 'fan:lizi'
	},function(res){
		var msg = '';
		res.on('data',function(d){
			msg += d.toString();
		}).on('end',function(){
			var match = msg.replace(/[\r\n\t]|\s{3,}/g,'').replace(/<script[^>]*?>[^>]*?<\/script>/,'').match(/<body>(.+?)<\/body>/);
			
			if(match){
				//msg = match[1].replace(/(<img[^>]+)\/?>/g,'$1/>').replace(/\/\//g,'/').replace(/\/><\/img>/g,'/>');
				msg = match[1].replace(/(<img[^>]+)\/?>(<\/img>)?/g,'$1/>').replace(/\/\//g,'/');
				xml.parse2Json(msg,function(err,nodeJson){
					if(err){
						callback && callback(err);
					}else{
						callback && callback(null,nodeJson);
					}
				},true);
			}else{
				callback && callback({msg: 'no data',html:msg});
			}		
		}).on('error',function(err){
			callback && callback(err);
		});
	})
}
if(__filename == process.argv[1]){
	getTags('101091007',function(){
		require('fs').writeFileSync('./log.js',JSON.stringify(arguments[1]));
		console.log(arguments)
	});
}
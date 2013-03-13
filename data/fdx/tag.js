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
				var info = {imgs:[],tags:[]}
				//msg = match[1].replace(/(<img[^>]+)\/?>/g,'$1/>').replace(/\/\//g,'/').replace(/\/><\/img>/g,'/>');
				msg = match[1].replace(/(<img[^>]+)\/?>(<\/img>)?/g,'$1/>').replace(/\/\//g,'/');
				xml.parse2Json(msg,function(err,nodeJson){
					if(err){
						callback && callback(err);
					}else{
						var divArr = nodeJson.div.child.div;
						for(var i = divArr.length-1;i>=0;i--){
							divArr[i].child.div.forEach(function(v1,i1){//left,right
								if(v1.attrs.class=='tips'){
									v1.child.a.forEach(function(v21,i21){
										var tagName = v21.text;
										var tagHref = v21.attrs.href;
										info.tags.push({name:tagName,href:tagHref});
									})
								}else{
									v1.child.div.forEach(function(v22,i22){//link
										v22.child.a.forEach(function(v3,i3){
											var href = v3.attrs.href;
											var src = v3.child.img.attrs.src;
											info.imgs.push({src:src,href:href});
										})
									});
								}
								
							});
						}
						var result = [];
						for (var tags = info.tags,imgs = info.imgs,i = 0,j = tags.length; i < j; i++) {
							result[i] = {tag:tags[i],imgs:imgs.splice(0,2)};
						};
						callback && callback(null,result);
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
exports.getTags = getTags;
if(__filename == process.argv[1]){
	getTags('101091007',function(){
		require('fs').writeFileSync('./log.js',JSON.stringify(arguments[1]));
		console.log(arguments)
	});
}
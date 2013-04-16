var http = require('http');
var url = require('url');
var crypto = require('crypto');
var xml = require("util/xml2json");
var WeiXin = require('./wx');
var log = require('util/logger').log;
var fs = require('fs');

process.env.TZ = 'Asia/Shanghai';
http.createServer(function (req, res) {
	var response = function(code,msg){
		log(reqMethod,reqUrl,code,msg);
		res.writeHead(code,{'Content-Type':'text/html;charset=utf-8'});
		res.end(msg);
	}
	var reqMethod = req.method.toUpperCase();
	var reqUrl = req.url;
	if(/log\.txt/.test(reqUrl)){
		fs.readFile('./log.txt',function(err,data){
			response(200,(err||data).toString());
		});
	}else{
		if(!/favicon\.ico/.test(reqUrl)){
			//记录日志
			log(reqMethod,reqUrl);
		}
		var params = url.parse(reqUrl,true).query;
		var sha1Str = [params.nonce,params.timestamp,'tonnyzhang'].sort().join('');

		var signature = crypto.createHash('sha1').update(sha1Str).digest('hex');
		
		if(params.signature == signature){
			if(reqMethod == 'GET'){
				response(200,params.echostr);
			}else{
				var message = '';
				req.on('data',function(d){
					message += d.toString();
				}).on('end',function(){
					var fn = function(err,msg){
						if(err){
							log('RES_XML',err);
							response(500,JSON.stringify(err));
						}else{
							response(200,msg);
						}
					}
					xml.parse2Json(message,function(err,result){
						log('POST_XML',message,JSON.stringify(err||result));
						if(!err){
							var weiXin = new WeiXin(result);
							var res_xml;
							switch(result.xml.child.MsgType.text){
								/*{"xml":{"ToUserName":"gh_8f47ec7c055d","FromUserName":"o7fAGj-j4y-Ey5nvTTE1Z9wwyCY4","CreateTime":"1363159184","MsgType":"text","Content":"Hello2BizUser","MsgId":"5854724114522046464"}}*/
								case 'text'://Hello2BizUser[关注]
									res_xml = weiXin.parseText(fn);
									return;
									break;
								case 'image':
									break;
								/*{"xml":{"ToUserName":"gh_8f47ec7c055d","FromUserName":"o7fAGj-j4y-Ey5nvTTE1Z9wwyCY4","CreateTime":"1363159225","MsgType":"location","Location_X":"40.032572","Location_Y":"116.417331","Scale":"15","Label":"中国北京市朝阳区红军营南路 邮政编码: 100107","MsgId":"5854724290615705652"}}*/
								case 'location':
									weiXin.parseLocation(fn);
									return;
									break;
								case 'link':
									break;
								case 'event'://unsubscribe
									break;
								/*{"xml":{"ToUserName":"gh_8f47ec7c055d","FromUserName":"o7fAGj-j4y-Ey5nvTTE1Z9wwyCY4","CreateTime":"1363159317","MsgType":"voice","MediaId":"I3eQNJsxF-LtHxN9HXtUVFiaE4SmSlrHBmJqJoZThD5sfDvNFOKIRprIeIKjQzAL","Format":"amr","MsgId":"5854724685752696886"}}*/
								case 'voice':
									break;
								default:
							}
							res_xml || (res_xml = weiXin.textTmpl('这是一个测试'));
							fn(null,res_xml);
						}else{
							response(500,'parse xml error!');
						}
					},true)
				}).on('err',function(err){
					response('500','receive post error!');
				});
			}
		}else{
			response(200,'no weiXin');
		}
	}
}).listen(process.env.PORT || 5000, null);

//生成全部数据缓存
(function(){
	var story = require('./data/weather/tool/story');
	var delay = 0;//保证项目启动时生成一次缓存
	var cacheStory = function(){
		process.nextTick(function(){
			setTimeout(function(){
				if(!delay){
					delay = 1000*60*60*2;//两个小时
				}
				story.rewriteAllCodeCache();
				cacheStory();
			},delay)
		});
	}
	cacheStory();
})();

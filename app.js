var http = require('http');
var url = require('url');
var crypto = require('crypto');
var xml = require("util/xml2json");
var WeiXin = require('./wx');
var log = require('util/logger').log;
var fs = require('fs');

http.createServer(function (req, res) {
	var response = function(code,msg){
		res.writeHead(code,{'Content-Type':'text/html'});
		res.end(msg);
	}
	var reqMethod = req.method.toUpperCase();
	var reqUrl = req.url;
	if(reqUrl == '/log.txt'){
		fs.readFile('./log.txt',function(err,data){
			response(200,(err||data).toString());
		});		
	}else{
		//记录日志		
		log(reqMethod,reqUrl);
		var params = url.parse(reqUrl,true).query;
		var sha1Str = [params.nonce,params.timestamp,'tonnyzhang'].sort().join('');

		var signature = crypto.createHash('sha1').update(sha1Str).digest('hex');
		
		if(params.signature == signature){
			if(reqMethod == 'GET'){
				response(200,params.echostr);
			}else{
				var message = '';
				req.on('data',function(d){
					message = d.toString();
				});
				req.on('end',function(){
					xml.parse2Json(message,function(err,result){
						log('POST_XML',message,JSON.stringify(err||result));
						if(!err){
							var weiXin = new WeiXin(result);
							switch(result.MsgType){
								case 'text':
									break;
								default:
							}
							var res_xml = weiXin.textTmpl('这是一个测试');
							log('RES_XML',res_xml);
							response(200,res_xml);
						}else{
							response(500,'parse xml error!');
						}
					},true)
				});
			}
		}else{
			response(200,'no weiXin');
		}
	}
}).listen(process.env.PORT || 5000, null);
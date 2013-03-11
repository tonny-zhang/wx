var http = require('http');
var url = require('url');
var crypto = require('crypto');
var xml = require("util/xml2json");
var WeiXin = require('./wx');

http.createServer(function (req, res) {
	var response = function(code,msg){
		res.writeHead(code,{'Content-Type':'text/html'});
		res.end(msg);
	}
	var reqMethod = req.method.toUpperCase();
	var isForbid = true;
	if(reqMethod == 'GET'){
		if(~req.url.indexOf('?')){
			var params = url.parse(req.url,true).query;
			var sha1Str = [params.nonce,params.timestamp,'tonnyzhang'].sort().join();
			var signature = crypto.createHash('sha1').update(sha1Str).digest('hex');
			
			if(params.signature == signature){
				response(200,params.echostr);
				isForbid = false;
			}
		}
	}else if(reqMethod == 'POST'){
		var message = '';
		req.on('data',function(d){
			message = d.toString();
		});
		req.on('end',function(){
			xml.parse2Json(message,function(err,result){
				if(!err){
					var weiXin = new WeiXin(result);
					switch(result.MsgType){
						case 'text':
							break;
						default:
					}
					var res_xml = weiXin.textTmpl('这是一个测试');
					response(200,res_xml);
				}else{
					response(500,'parse xml error!');
				}
			})
		});
		isForbid = false;
	}
	if(isForbid){
		response(403,'something is wrong!');
	}
}).listen(process.env.PORT || 5000, null);
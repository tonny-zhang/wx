var crypto = require('crypto')
	, url = require('url')
	, path = require('path')
	, pathConst = require('../../config/path')
	, wxConfig = require(pathConst.APP_PATH+'/config/wx')
	, WeiXin = require(pathConst.APP_PATH+'/data/weixin');

function _isSign(params){
	var sha1Str = [params.nonce,params.timestamp,wxConfig.token].sort().join('');

	var signature = crypto.createHash('sha1').update(sha1Str).digest('hex');
	
	return params.signature == signature;
}
exports.run = function(req,res,next){
	var params = req.query;
	if(_isSign(params)){
		var method = req.method;
		if('GET' === method){
			res.send(params.echostr);
		}else if('POST' === method){
			var fn = function(err,msg){
				if(err){
					res.send(500,JSON.stringify(err));
				}else{
					res.send(msg);
				}
			}
			var xmlJSON = req.body;
			if(xmlJSON && xmlJSON.xml){
				var weiXin = new WeiXin(xmlJSON);
				var map = {'text':'parseText','image':'parseImage','location':'parseLocation','voice':'parseVoice','event':'parseEvent','link':''};
				var method = map[xmlJSON.xml.child.MsgType.text];
				if(method){
					weiXin[method](fn);
				}else{
					fn({msg:'事件类型不对吧'});
				}
			}else{
				fn({msg:'解析XML出错'});
			}
		}else{
			res.send(403,'request method is wrong!');
		}
	}else{
		res.send(403,'permission is deny!');
	}
}
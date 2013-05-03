var http = require('http');
var crypto = require('crypto');
var url = require('url');
var xml = require("util/xml2json");
var wxConfig = require('../config/wx')

var log = function(send,result){
	console.log('------------- start ['+index+'] -----------------');
	console.log(send);
	console.log('         ||');
	console.log('         \\/');
	console.log(result||'XXXXXXXXXXX 这里不应该是空数据　XXXXXXXXXXXX');
	console.log('------------- end ['+index+'] -------------------');
	console.log();
	index++;
	if(--dealingNum == 0){
		console.log('============== 全部处理完成 ========================');
	}
}
var index = 1;
var dealingNum = 0;
function curl(sendStr,callback){
	dealingNum++;
	callback || (callback = function(err,response,sendStr){
		if(!err){
			log(sendStr,response);
		}else{
			console.log(err);
		}
	});
	var nonce = 'test',
		timestamp = +new Date(),
		signature = crypto.createHash('sha1').update([nonce,timestamp,wxConfig.token].sort().join('')).digest('hex');

	var req = http.request({
		hostname: 'localhost',
		port: 5000,
		path: '/wx?nonce='+nonce+'&timestamp='+timestamp+'&signature='+signature,
		method: 'POST',
		headers: {
			"Content-Type": "text/xml"
		}
	},function(res){
		var msg = '';
		res.on('data',function(d){
			msg += d.toString();
		}).on('end',function(){
			callback && callback(null,msg,sendStr);
		});
	});
	req.end(sendStr);
}

var parseJsonLog = function(err,response,sendStr){
	xml.parse2Json(response,function(err,result){
		result = result.xml.child.Content.text;
		log(sendStr,result);
	},true);
}
var curlText = function(text){
	curl('<xml><ToUserName><![CDATA[gh_8f47ec7c055d]]></ToUserName>\n'+
		'<FromUserName><![CDATA[o7fAGj-j4y-Ey5nvTTE1Z9wwyCY4]]></FromUserName>\n'+
		'<CreateTime>1362986469</CreateTime>\n'+
		'<MsgType><![CDATA[text]]></MsgType>\n'+
		'<Content><![CDATA['+text+']]></Content>\n'+
		'<MsgId>5853982309245517843</MsgId>\n'+
		'</xml>',function(err,response,sendStr){
//			console.log('---',err,response,sendStr);
			parseJsonLog(err,response,text);
		});
}
curlText('A');
curlText('help');
curlText('Hello2BizUser');
curlText('中国北京市朝阳区红军营南路 邮政编码: 100107');
curlText('中国北京市朝阳区红军营南路 邮政编码: 100107天气');
curlText('tq');
curlText('tq丰台区');
curlText('tq朝阳');
curlText('tq辽宁朝阳');
curlText('tq海南');
curlText('海口天气');
curlText('海南天气');
curlText('朝阳区天气');
curlText('河南信阳天气');
curlText('天气');
curlText('天气士大夫');
curlText('天气嘉义');

curl('<xml><ToUserName><![CDATA[gh_8f47ec7c055d]]></ToUserName>'+
	'<FromUserName><![CDATA[o7fAGj-j4y-Ey5nvTTE1Z9wwyCY4]]></FromUserName>'+
	'<CreateTime>1363159225</CreateTime>'+
	'<MsgType><![CDATA[location]]></MsgType>'+
	'<Location_X>40.032572</Location_X>'+
	'<Location_Y>116.417331</Location_Y>'+
	'<Scale>15</Scale>'+
	'<Label><![CDATA[中国北京市朝阳区红军营南路 邮政编码: 100107]]></Label>'+
	'<MsgId>5854724290615705652</MsgId>'+
	'</xml>',parseJsonLog);

curl('<xml><ToUserName><![CDATA[gh_8f47ec7c055d]]></ToUserName>'+
	'<FromUserName><![CDATA[o7fAGj-j4y-Ey5nvTTE1Z9wwyCY4]]></FromUserName>'+
	'<CreateTime>1363159225</CreateTime>'+
	'<MsgType><![CDATA[location]]></MsgType>'+
	'<Location_X>40.032572</Location_X>'+
	'<Location_Y>116.417331</Location_Y>'+
	'<Scale>15</Scale>'+
	'<Label><![CDATA[]]></Label>'+
	'<MsgId>5854724290615705652</MsgId>'+
	'</xml>',parseJsonLog);

curl('<xml><ToUserName><![CDATA[gh_8f47ec7c055d]]></ToUserName>'+
	'<FromUserName><![CDATA[o7fAGj-j4y-Ey5nvTTE1Z9wwyCY4]]></FromUserName>'+
	'<CreateTime>1363159225</CreateTime>'+
	'<MsgType><![CDATA[event]]></MsgType>'+
	'<Event><![CDATA[subscribe]]></Event>'+
	'<EventKey><![CDATA[a]]></EventKey>'+
	'</xml>',parseJsonLog);
curl('<xml><ToUserName><![CDATA[gh_8f47ec7c055d]]></ToUserName>'+
	'<FromUserName><![CDATA[o7fAGj-j4y-Ey5nvTTE1Z9wwyCY4]]></FromUserName>'+
	'<CreateTime>1363159225</CreateTime>'+
	'<MsgType><![CDATA[event]]></MsgType>'+
	'<Event><![CDATA[unsubscribe]]></Event>'+
	'<EventKey><![CDATA[a]]></EventKey>'+
	'</xml>',parseJsonLog);
curl('<xml><ToUserName><![CDATA[gh_8f47ec7c055d]]></ToUserName>'+
	'<FromUserName><![CDATA[o7fAGj-j4y-Ey5nvTTE1Z9wwyCY4]]></FromUserName>'+
	'<CreateTime>1363159225</CreateTime>'+
	'<MsgType><![CDATA[event]]></MsgType>'+
	'<Event><![CDATA[CLICK]]></Event>'+
	'<EventKey><![CDATA[a]]></EventKey>'+
	'</xml>',parseJsonLog);

curl('<xml><ToUserName><![CDATA[gh_8f47ec7c055d]]></ToUserName>'+
	'<FromUserName><![CDATA[o7fAGj-j4y-Ey5nvTTE1Z9wwyCY4]]></FromUserName>'+
	'<CreateTime>1363159225</CreateTime>'+
	'<MsgType><![CDATA[image]]></MsgType>'+
	'<PicUrl><![CDATA[this is a url]]></PicUrl>'+
	'</xml>',parseJsonLog);
curl('<xml><ToUserName><![CDATA[gh_8f47ec7c055d]]></ToUserName>'+
	'<FromUserName><![CDATA[o7fAGj-j4y-Ey5nvTTE1Z9wwyCY4]]></FromUserName>'+
	'<CreateTime>1363159225</CreateTime>'+
	'<MsgType><![CDATA[voice]]></MsgType>'+
	'<Event><![CDATA[CLICK]]></Event>'+
	'<EventKey><![CDATA[a]]></EventKey>'+
	'</xml>',parseJsonLog);
var http = require('http');
var crypto = require('crypto');
var url = require('url');

var params = {
	nonce: 'test',
	timestamp: +new Date()
}
var sha1Str = [params.nonce,params.timestamp,'tonnyzhang'].sort().join('');

var signature = crypto.createHash('sha1').update(sha1Str).digest('hex');
params.signature = signature;
console.log(params);
var req = http.request({
	hostname: 'localhost',
	port: 5000,
	path: '/?nonce='+params.nonce+'&timestamp='+params.timestamp+'&signature='+params.signature,
	method: 'POST',
	headers: {
		"Content-Type": "text/xml"
	}
},function(res){
	res.on('data',function(d){
		console.log(d.toString());
	});
	console.log('post receive');
});
// req.write('<xml>'+
// '<ToUserName><![CDATA[toUser]]></ToUserName>'+
// '<FromUserName><![CDATA[fromUser]]></FromUserName>'+
// '<CreateTime>1351776360</CreateTime>'+
// '<MsgType><![CDATA[link]]></MsgType>'+
// '<Title><![CDATA[公众平台官网链接]]></Title>'+
// '<Description><![CDATA[公众平台官网链接]]></Description>'+
// '<Url><![CDATA[url]]></Url>'+
// '<MsgId>1234567890123456</MsgId>'+
// '</xml> ');

req.write('<xml><ToUserName><![CDATA[gh_8f47ec7c055d]]></ToUserName>\n'+
			'<FromUserName><![CDATA[o7fAGj-j4y-Ey5nvTTE1Z9wwyCY4]]></FromUserName>\n'+
			'<CreateTime>1362986469</CreateTime>\n'+
			'<MsgType><![CDATA[text]]></MsgType>\n'+
			'<Content><![CDATA[A]]></Content>\n'+
			'<MsgId>5853982309245517843</MsgId>\n'+
			'</xml>');
req.end();
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

//普通文本
var str = '<xml><ToUserName><![CDATA[gh_8f47ec7c055d]]></ToUserName>\n'+
			'<FromUserName><![CDATA[o7fAGj-j4y-Ey5nvTTE1Z9wwyCY4]]></FromUserName>\n'+
			'<CreateTime>1362986469</CreateTime>\n'+
			'<MsgType><![CDATA[text]]></MsgType>\n'+
			'<Content><![CDATA[A]]></Content>\n'+
			'<MsgId>5853982309245517843</MsgId>\n'+
			'</xml>'
//得到帮助信息
str = '<xml><ToUserName><![CDATA[gh_8f47ec7c055d]]></ToUserName>'+
		'<FromUserName><![CDATA[o7fAGj-j4y-Ey5nvTTE1Z9wwyCY4]]></FromUserName>'+
		'<CreateTime>1363159184</CreateTime>'+
		'<MsgType><![CDATA[text]]></MsgType>'+
		'<Content><![CDATA[help]]></Content>'+
		'<MsgId>5854724114522046464</MsgId>'+
		'</xml>';
// //关注时，得到帮助信息
// str = '<xml><ToUserName><![CDATA[gh_8f47ec7c055d]]></ToUserName>'+
// 		'<FromUserName><![CDATA[o7fAGj-j4y-Ey5nvTTE1Z9wwyCY4]]></FromUserName>'+
// 		'<CreateTime>1363159184</CreateTime>'+
// 		'<MsgType><![CDATA[text]]></MsgType>'+
// 		'<Content><![CDATA[Hello2BizUser]]></Content>'+
// 		'<MsgId>5854724114522046464</MsgId>'+
// 		'</xml>';
//根据座标查天气
str = '<xml><ToUserName><![CDATA[gh_8f47ec7c055d]]></ToUserName>'+
		'<FromUserName><![CDATA[o7fAGj-j4y-Ey5nvTTE1Z9wwyCY4]]></FromUserName>'+
		'<CreateTime>1363159225</CreateTime>'+
		'<MsgType><![CDATA[location]]></MsgType>'+
		'<Location_X>40.032572</Location_X>'+
		'<Location_Y>116.417331</Location_Y>'+
		'<Scale>15</Scale>'+
		'<Label><![CDATA[中国北京市朝阳区红军营南路 邮政编码: 100107]]></Label>'+
		'<MsgId>5854724290615705652</MsgId>'+
		'</xml>';
// //没有查询天气的城市
// str = '<xml><ToUserName><![CDATA[gh_8f47ec7c055d]]></ToUserName>\n'+
// 			'<FromUserName><![CDATA[o7fAGj-j4y-Ey5nvTTE1Z9wwyCY4]]></FromUserName>\n'+
// 			'<CreateTime>1362986469</CreateTime>\n'+
// 			'<MsgType><![CDATA[text]]></MsgType>\n'+
// 			'<Content><![CDATA[tq]]></Content>\n'+
// 			'<MsgId>5853982309245517843</MsgId>\n'+
// 			'</xml>'
// //查询正确城市天气			
// str = '<xml><ToUserName><![CDATA[gh_8f47ec7c055d]]></ToUserName>\n'+
// 			'<FromUserName><![CDATA[o7fAGj-j4y-Ey5nvTTE1Z9wwyCY4]]></FromUserName>\n'+
// 			'<CreateTime>1362986469</CreateTime>\n'+
// 			'<MsgType><![CDATA[text]]></MsgType>\n'+
// 			'<Content><![CDATA[tq丰台区]]></Content>\n'+
// 			'<MsgId>5853982309245517843</MsgId>\n'+
// 			'</xml>'
// //查询两个城市天气			
// str = '<xml><ToUserName><![CDATA[gh_8f47ec7c055d]]></ToUserName>\n'+
// 			'<FromUserName><![CDATA[o7fAGj-j4y-Ey5nvTTE1Z9wwyCY4]]></FromUserName>\n'+
// 			'<CreateTime>1362986469</CreateTime>\n'+
// 			'<MsgType><![CDATA[text]]></MsgType>\n'+
// 			'<Content><![CDATA[tq朝阳]]></Content>\n'+
// 			'<MsgId>5853982309245517843</MsgId>\n'+
// 			'</xml>'
// str = '<xml><ToUserName><![CDATA[gh_8f47ec7c055d]]></ToUserName>\n'+
// 			'<FromUserName><![CDATA[o7fAGj-j4y-Ey5nvTTE1Z9wwyCY4]]></FromUserName>\n'+
// 			'<CreateTime>1362986469</CreateTime>\n'+
// 			'<MsgType><![CDATA[text]]></MsgType>\n'+
// 			'<Content><![CDATA[tq辽宁朝阳]]></Content>\n'+
// 			'<MsgId>5853982309245517843</MsgId>\n'+
// 			'</xml>'
// str = '<xml><ToUserName><![CDATA[gh_8f47ec7c055d]]></ToUserName>\n'+
// 			'<FromUserName><![CDATA[o7fAGj-j4y-Ey5nvTTE1Z9wwyCY4]]></FromUserName>\n'+
// 			'<CreateTime>1362986469</CreateTime>\n'+
// 			'<MsgType><![CDATA[text]]></MsgType>\n'+
// 			'<Content><![CDATA[tq海南]]></Content>\n'+
// 			'<MsgId>5853982309245517843</MsgId>\n'+
// 			'</xml>'
// 			
// str = '<xml><ToUserName><![CDATA[gh_8f47ec7c055d]]></ToUserName>\n'+
// 			'<FromUserName><![CDATA[o7fAGj-j4y-Ey5nvTTE1Z9wwyCY4]]></FromUserName>\n'+
// 			'<CreateTime>1362986469</CreateTime>\n'+
// 			'<MsgType><![CDATA[text]]></MsgType>\n'+
// 			'<Content><![CDATA[海南天气]]></Content>\n'+
// 			'<MsgId>5853982309245517843</MsgId>\n'+
// 			'</xml>' 

str = '<xml><ToUserName><![CDATA[gh_8f47ec7c055d]]></ToUserName>\n'+
			'<FromUserName><![CDATA[o7fAGj-j4y-Ey5nvTTE1Z9wwyCY4]]></FromUserName>\n'+
			'<CreateTime>1362986469</CreateTime>\n'+
			'<MsgType><![CDATA[text]]></MsgType>\n'+
			'<Content><![CDATA[朝阳区天气]]></Content>\n'+
			'<MsgId>5853982309245517843</MsgId>\n'+
			'</xml>'  	
str = '<xml><ToUserName><![CDATA[gh_8f47ec7c055d]]></ToUserName>\n'+
			'<FromUserName><![CDATA[o7fAGj-j4y-Ey5nvTTE1Z9wwyCY4]]></FromUserName>\n'+
			'<CreateTime>1362986469</CreateTime>\n'+
			'<MsgType><![CDATA[text]]></MsgType>\n'+
			'<Content><![CDATA[河南信阳天气]]></Content>\n'+
			'<MsgId>5853982309245517843</MsgId>\n'+
			'</xml>' 
str = '<xml><ToUserName><![CDATA[gh_8f47ec7c055d]]></ToUserName>\n'+
			'<FromUserName><![CDATA[o7fAGj-j4y-Ey5nvTTE1Z9wwyCY4]]></FromUserName>\n'+
			'<CreateTime>1362986469</CreateTime>\n'+
			'<MsgType><![CDATA[text]]></MsgType>\n'+
			'<Content><![CDATA[天气]]></Content>\n'+
			'<MsgId>5853982309245517843</MsgId>\n'+
			'</xml>' 														
req.write(str);
req.end();
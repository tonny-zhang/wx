function WeiXin(fromInfo){
	this.fromInfo = fromInfo;

}
WeiXin.prototype.textTmpl = function(content){
	var root = this.fromInfo.xml;
	var ToUserName = root.ToUserName;
	var FromUserName = root.FromUserName;
	return '<xml>'+
				'<ToUserName><![CDATA['+ToUserName+']]></ToUserName>\n'+
				'<FromUserName><![CDATA['+FromUserName+']]></FromUserName>\n'+
				'<CreateTime>'+(+new Date())+'</CreateTime>\n'+
				'<MsgType><![CDATA[text]]></MsgType>\n'+
				'<Content><![CDATA['+content+']]></Content>\n'+
				'<FuncFlag>0</FuncFlag>\n'+
			'</xml>';
}
module.exports = WeiXin;
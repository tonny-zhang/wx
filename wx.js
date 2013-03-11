function WeiXin(fromInfo){
	this.fromInfo = fromInfo;
}
WeiXin.prototype.textTmpl = function(content){
	return '<xml>'+
				'<ToUserName><![CDATA['+this.ToUserName+']]></ToUserName>'+
				'<FromUserName><![CDATA['+this.FromUserName+']]></FromUserName>'+
				'<CreateTime>'+(+new Date())+'</CreateTime>'+
				'<MsgType><![CDATA[text]]></MsgType>'+
				'<Content><![CDATA['+content+']]></Content>'+
				'<FuncFlag>0</FuncFlag>'+
			'</xml>';
}
module.exports = WeiXin;
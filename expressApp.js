var express = require('express')
  , http = require('http')
  , path = require('path')
  ,	fs = require('fs');

var config = require('./config/global.json');

//定义路径常量
var APP_PATH = __dirname + '/',
	SITE_PATH = APP_PATH + 'site/',
	VIEW_PATH = SITE_PATH + 'views/',
	CONTROL_PATH = APP_PATH + 'control/';

var app = express();

//app.configure 不高效
(function(){
	app.set('port', process.env.PORT || 5000);
	app.set('views', VIEW_PATH);
	app.set('view engine', 'jade');
	//这里可以自定义模板
	app.engine('html',function(path, options, callback){
		fs.readFile(path,'utf8',function(err,d){
			callback && callback(err,d);
		});
	});

	//app.use可以使用挂载功能
	app.use(express.logger('dev'));
	app.use(express.compress());
	app.use(express.directory(APP_PATH));
	app.use(express.static(SITE_PATH));
	app.use(express.favicon());
	app.use(express.bodyParser({uploadDir: APP_PATH+'/temp'}));
	app.use(express.methodOverride());
	app.use(express.cookieParser());
	app.use(express.cookieSession({secret:'test'}));
	app.use(express.session({ key: 'SESSIONID',secret: "keyboard cat" }));
})();

app.all('*',function(req,res,next){
	res.charset = config.charset;
	var pathname = req.path;
	
	try{
		var control = require(path.normalize(CONTROL_PATH + pathname));
		control(req,res,next);
	}catch(e){
		//当不是控制层文件时，显示文件内容
		res.sendfile(path.normalize(APP_PATH + pathname),function(err){
			if(err){
				res.send(404);
			}
		});
	}
});
http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
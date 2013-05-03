var express = require('express')
  , http = require('http')
  , path = require('path')
  ,	fs = require('fs');

var config = require('./config/global.json');
var pathConst = require('./config/path.js');

process.env.TZ = config.timezone;

var app = express();
//app.configure 不高效
(function(){
	app.set('port', process.env.PORT || 5000);
	app.set('views', pathConst.VIEW_PATH);
	app.set('view engine', 'jade');
	//这里可以自定义模板
	app.engine('html',function(path, options, callback){
		fs.readFile(path,'utf8',function(err,d){
			callback && callback(err,d);
		});
	});
	
	//app.use可以使用挂载功能
	app.use((function(){
		var accessLogPath = pathConst.APP_PATH+'/log/access.log';
		fs.appendFileSync(accessLogPath,' server restart');
		return express.logger({stream:fs.createWriteStream(accessLogPath)});
	})());
	app.use(express.compress());
	app.use(express.directory(pathConst.APP_PATH));
	app.use(express.static(pathConst.SITE_PATH));
	app.use(express.favicon());
	app.use(require('middleware/xml')(app));//自定义xml解析
	app.use(express.bodyParser({uploadDir: pathConst.APP_PATH+'/temp'}));
	app.use(express.methodOverride());
	app.use(express.cookieParser());
	app.use(express.cookieSession(config.cookieSession));
	app.use(express.session(config.session));
})();

app.all('*',function(req,res,next){
	res.charset = config.charset;
	var pathname = req.path;
	
	try{
		/*模块需要实现run方法*/
		var control = require(path.normalize(pathConst.CONTROL_PATH + pathname));
		control.run(req,res,next);
	}catch(e){
		if(e.code !== 'MODULE_NOT_FOUND'){
			throw e;
		}else{
			//当不是控制层文件时，显示文件内容
			res.sendfile(path.normalize(pathConst.APP_PATH + pathname),function(err){
				if(err){
					res.send(404);
				}
			});
		}
	}
});
process.on('uncaughtException', function(err) {
  console.log('Caught exception: ' + err);
});
http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});

//生成全部数据缓存
(function(){
	var child_process = require('child_process');
	var time = [6,12,18];
	var delay = 10;
	function getDelay(){
		var date = new Date();
		var hours = date.getHours();
		var closetHours = time.filter(function(v,i){
			return v > hours;
		});
		var delayDate = new Date();
		var delayHours = closetHours.shift();
		if(!delayHours){
			delayHours = time[0];
			delayDate.setDate(delayDate.getDate()+1);//第二天的第一个时间
		}
		
		delayDate.setHours(delayHours);
		delayDate.setMinutes(30);
		delayDate.setSeconds(0);
		delay = delayDate.getTime() - date.getTime();
	}
	function run(){
		process.nextTick(function(){
			setTimeout(function(){
				child_process.fork(pathConst.APP_PATH+'/data/weather/tool/story.js').on('message',function(){
					getDelay();
					this.kill();
					run();
				})
			},delay);
		});
	}
	getDelay()
	run();
})();

var path = require('path');
//定义路径常量
var APP_PATH = __dirname + '/../',
	SITE_PATH = APP_PATH + 'site/',
	VIEW_PATH = SITE_PATH + 'views/',
	CONTROL_PATH = APP_PATH + 'control/';

module.exports = {
	'APP_PATH': path.normalize(APP_PATH)
	,'SITE_PATH': path.normalize(SITE_PATH)
	,'VIEW_PATH': path.normalize(VIEW_PATH)
	,'CONTROL_PATH': path.normalize(CONTROL_PATH)
}
module.exports = function(req,res,next){
//	res.send('this is in user/index.js in control'+JSON.stringify(req._parsedUrl));
	res.jsonp({name: 'jsonp'})
}
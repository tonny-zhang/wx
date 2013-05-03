var crypto = require('crypto');

module.exports = function(req,res,next){
	var params = req.params;
	var sha1Str = [params.nonce,params.timestamp,'tonnyzhang'].sort().join('');

	var signature = crypto.createHash('sha1').update(sha1Str).digest('hex');
}
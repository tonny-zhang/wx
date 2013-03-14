var Segment = require('node-segment').Segment;
var POSTAG = require('node-segment').POSTAG; 

var segment = new Segment();
// 使用默认的识别模块及字典
segment.useDefaltNoDictOptimizer();
var ret = segment.doSegment('rq朝阳北京河北邯郸湖南长沙河北石家庄');
for (var i in ret) {
  ret[i].ps = POSTAG.chsName(ret[i].p);
}
console.log(ret);
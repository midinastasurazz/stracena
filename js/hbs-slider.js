(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['slider'] = template({"1":function(depth0,helpers,partials,data) {
  var lambda=this.lambda, escapeExpression=this.escapeExpression;
  return "	<span style=\"float: left; width: 35px;\">\n		<a id=\"lookAtBodyFeature"
    + escapeExpression(lambda((data && data.index), depth0))
    + "\" class=\"btn btn-default btn-xs\"><i class=\"fa fa-video-camera fa-lg\"></i></a>\n	</span>\n	<span id=\"bodyFeatureLabel"
    + escapeExpression(lambda((data && data.index), depth0))
    + "\" style=\"float: left; width: 185px;\">"
    + escapeExpression(lambda(depth0, depth0))
    + "</span>\n	<input type=\"range\" id=\"morph"
    + escapeExpression(lambda((data && data.index), depth0))
    + "\"  style=\"float: left; width: 50%; margin-top: 4px; padding-top: 0px; padding-bottom: 0px;\" min=\"1\" max=\"9\" step=\"1\" value=\"1\">\n	&nbsp;&nbsp;<span id=\"morph"
    + escapeExpression(lambda((data && data.index), depth0))
    + "Span\">1</span>\n	<br /><br />\n";
},"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
  var stack1;
  stack1 = helpers.each.call(depth0, (depth0 != null ? depth0.features : depth0), {"name":"each","hash":{},"fn":this.program(1, data),"inverse":this.noop,"data":data});
  if (stack1 != null) { return stack1; }
  else { return ''; }
  },"useData":true});
})();
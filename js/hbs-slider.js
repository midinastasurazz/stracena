(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['slider'] = template({"1":function(container,depth0,helpers,partials,data) {
    var helper, alias1=helpers.helperMissing, alias2="function", alias3=container.escapeExpression;

  return "	<span style=\"float: left; width: 35px;\">\n		<a id=\"lookAtBodyFeature"
    + alias3(((helper = (helper = helpers.index || (data && data.index)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"index","hash":{},"data":data}) : helper)))
    + "\" class=\"btn btn-default btn-xs\"><i class=\"fa fa-video-camera fa-lg\"></i></a>\n	</span>\n	<span id=\"bodyFeatureLabel"
    + alias3(((helper = (helper = helpers.index || (data && data.index)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"index","hash":{},"data":data}) : helper)))
    + "\" style=\"float: left; width: 185px;\">"
    + alias3(container.lambda(depth0, depth0))
    + "</span>\n	<input type=\"range\" id=\"morph"
    + alias3(((helper = (helper = helpers.index || (data && data.index)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"index","hash":{},"data":data}) : helper)))
    + "\"  style=\"float: left; width: 50%; margin-top: 4px; padding-top: 0px; padding-bottom: 0px;\" min=\"1\" max=\"9\" step=\"1\" value=\"1\">\n	&nbsp;&nbsp;<span id=\"morph"
    + alias3(((helper = (helper = helpers.index || (data && data.index)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"index","hash":{},"data":data}) : helper)))
    + "Span\">1</span>\n	<br /><br />\n";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = helpers.each.call(depth0,(depth0 != null ? depth0.features : depth0),{"name":"each","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "");
},"useData":true});
})();
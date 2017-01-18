define(["asi/view/widget/ractive", 
				"asi/view/widget/shared/display/progress-bar/config",
				"rvc!asi/view/widget/ractive/display/progress-bar/template"], function(Asi, WidgetConfig, Template) {

	Asi.Widget.register("ractive", WidgetConfig, null, Template);
});
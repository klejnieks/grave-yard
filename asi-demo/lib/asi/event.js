define(['lib/asi/asi'], function(asi) {


	var Event = asi.Event = asi.Construct.extend({
		
		CHANGE: "changeEvent",
		DATA_CHANGE: "dataChangeEvent",
		UPDATE_COMPLETE: "updateCompleteEvent"
		
	},{
		type: null,
		data: null,
		
		init: function() {
			if(arguments.length === 0) {
				throw new Error("You must define an Event Type");
			}
			
			if(typeof arguments[0] === "string") {
				this.type = arguments[0];
			}
			
			if(arguments.length > 1 && typeof arguments[1] === "object") {
				this.data = arguments[1];
			}
		},
		
	});

	return Event;
 
});



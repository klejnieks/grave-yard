define(["ractive"], function(Ractive) {
	var AsiPromise = {
		all: function(promises) {
			var accumulator = [];
			var ready = new Ractive.Promise(function(fulfill, reject) {
				fulfill(null);
			});

			promises.forEach(function (promise) {
				ready = ready.then(function () {
					return promise;
				}).then(function (value) {
					accumulator.push(value);
				});
			});

			return ready.then(function () { return accumulator; });
		}
	};
	
	return AsiPromise;
});
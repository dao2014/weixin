var app = angular.module('MyApp');

app.factory('EventService', ['$http', '$q',
	function($http, $q) {
		return {
			getEvents: function() {
				var deferred = $q.defer();
				$http.get('./direct/getDirectPage?page=1&size=10&directStatus=1&directExamine=1').success(function(result) {
					
					var datas =result.datum.list;
					deferred.resolve(datas);
				}).error(function(result) {
					deferred.reject(false);
				});

				return deferred.promise;
			}
		};
}]);
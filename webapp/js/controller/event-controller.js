var app = angular.module('MyApp');

app.controller('EventController', ['$scope', 'EventService', '$compile',
	function($scope, EventService, $compile) {
		EventService.getEvents().then(function(events) {
			$scope.users = events;
		});
		
		$scope.submits = function(id) {
          
        };
	}]);
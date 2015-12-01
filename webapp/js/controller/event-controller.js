var app = angular.module('MyApp');

app.controller('EventController', ['$scope', 'EventService', '$compile','$http','$location','$routeParams','$log',
	function($scope, EventService,$http, $compile,$location, $routeParams, $log) {
		EventService.getEvents().then(function(events) {
			$scope.users = events;
		});
		$scope.submits = function(id) {
			var item = 'code';
			 var sValue=$location.absUrl().match(new RegExp("[\?\&]"+item+"=([^\&]*)(\&?)","i"));
			 EventService.submits(id,sValue);
        };
	}]);

function QueryString(item){
  	 var sValue=$location.absUrl().match(new RegExp("[\?\&]"+item+"=([^\&]*)(\&?)","i"));
  	 alert(sValue);
  		return sValue?sValue[1]:sValue;
   }
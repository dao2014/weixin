var app = angular.module('MyApp');

app.controller('EventController', ['$scope', 'EventService', '$compile','$http','$location','$routeParams','$log',
	function($scope, EventService,$http, $compile,$location, $routeParams, $log) {
	 var item = 'code';
	 var code=$location.absUrl().match(new RegExp("[\?\&]"+item+"=([^\&]*)(\&?)","i"));
	 code= code?code[1]:code;
		EventService.getEvents(code).then(function(events) {
			$scope.users = events;
		});
		$scope.submits = function(id) {
			
			 EventService.submits(id,code);
        };
	}]);

function QueryString(item){
  	 var sValue=$location.absUrl().match(new RegExp("[\?\&]"+item+"=([^\&]*)(\&?)","i"));
  	 alert(sValue);
  		return sValue?sValue[1]:sValue;
   }
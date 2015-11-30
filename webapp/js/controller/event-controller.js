var app = angular.module('MyApp');

app.controller('EventController', ['$scope', 'EventService', '$compile','$location','$routeParams','$log',
	function($scope, EventService, $compile,$location, $routeParams, $log) {
		EventService.getEvents().then(function(events) {
			$scope.users = events;
		});
		
		$scope.submits = function(id) {
			alert($location.absUrl());
			alert(QueryString('code'));
//			$http.get('./direct/getDirectPage?page=1&size=10&directStatus=0&directExamine=0').success(function(result) {
//				var datas =result.datum.list;
//				deferred.resolve(datas);
//			}).error(function(result) {
//				deferred.reject(false);
//			});
        };
	}]);

function QueryString(item){
  	 var sValue=$location.absUrl().match(new RegExp("[\?\&]"+item+"=([^\&]*)(\&?)","i"));
  	 alert(sValue);
  		return sValue?sValue[1]:sValue;
   }
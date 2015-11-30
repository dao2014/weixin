var app = angular.module('MyApp');

app.controller('EventController', ['$scope', 'EventService', '$compile','$http','$location','$routeParams','$log',
	function($scope, EventService,$http, $compile,$location, $routeParams, $log) {
		EventService.getEvents().then(function(events) {
			$scope.users = events;
		});
		
		$scope.submits = function(id) {
			alert($location.url());
			var item = 'code';
			 var sValue=$location.absUrl().match(new RegExp("[\?\&]"+item+"=([^\&]*)(\&?)","i"));
			 var valus = sValue?sValue[1]:sValue;
			$http.get('./directAnser/update?directId='+id+'&code='+valus+'&answerStatus=1'+'&directPassword=123456')
			.success(function(data){
				if(data.code==1){
					alert('预约成功！');
				}
			});
        };
	}]);

function QueryString(item){
  	 var sValue=$location.absUrl().match(new RegExp("[\?\&]"+item+"=([^\&]*)(\&?)","i"));
  	 alert(sValue);
  		return sValue?sValue[1]:sValue;
   }
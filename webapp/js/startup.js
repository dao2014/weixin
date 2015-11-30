var app = angular.module('MyApp');

app.config(['$routeProvider',
	function($routeProvider) {
	$routeProvider.html5Mode(true);
		$routeProvider.when('/', {
			templateUrl: 'views/direct.html',
			controller: 'EventController'
		}).otherwise('/');
	}]);


angular.module('rcForm', []).directive(rcSubmitDirective);
var demoApp = angular.module('demoApp', ['ngRoute','ui.bootstrap','ngAnimate','rcForm']);

// configure our routes
demoApp.config(function($routeProvider, $locationProvider, $compileProvider) {
	$routeProvider
        // route for the index page
        .when('/', {
                templateUrl : 'templates/index.html',
                controller  : 'mainCtrl'
        })
        .when('/conference', {
			templateUrl : 'templates/conference.html',
			controller  : 'conferenceCtrl'
        })
        .when('/users/:page?', {
			templateUrl : 'templates/users.html',
			controller  : 'usersCtrl'
        })
        .when('/userDetails/:id', {
			templateUrl : 'templates/userDetails.html',
			controller  : 'userDetailsCtrl'
        })	
        .when('/newUser', {
			templateUrl : 'templates/newUser.html',
			controller  : 'newUserCtrl'
        });			
		$locationProvider.html5Mode(true);
		$compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|chrome-extension):/);
});

demoApp.controller('usersCtrl', function($scope,$http,$location,$routeParams) {
	$scope.searchName = "";
	$scope.heading = 'Članovi';
	$scope.message = 'Pregled članova udruženja';
	// pagination
	$scope.pagingOptions = {
		currentPage: 1,
		pageSize: 4,
		totalItems: 0
	};

	if($routeParams.page && $routeParams.page != 0){
		$scope.pagingOptions.currentPage = $routeParams.page;		
		$routeParams.page = 0;
	} 

    $scope.loadUserData = function() {
		$pageData = '&pageSize='+$scope.pagingOptions.pageSize+'&currentPage='+$scope.pagingOptions.currentPage;
		$url = 'http://'+$location.host()+'/angRest/rest/allUsers/name='+$scope.searchName+$pageData;
		$actPage = $scope.pagingOptions.currentPage;
		$http.get($url).success(function(response){
            $scope.pagingOptions.totalItems = response.totalNumber;
            $scope.users = response.users;
            $scope.pagingOptions.currentPage = $actPage;
            //console.log('Test:'+$scope.pagingOptions.currentPage);
        });
    };    		
});
demoApp.controller('userDetailsCtrl', function($scope,$http,$routeParams,$location,$timeout) {
	  $scope.userDetails = {
		id: "",
		firstName: "",
		lastName: "",
		city: "",
		description: ""
	  };

      $http.get('http://'+$location.host()+'/angRest/rest/oneUser/'+$routeParams.id).success(function(response){
           $scope.userDetails = response.data[0];
      });	 
	  $scope.updateChanges = function() {
            $http.post('http://'+$location.host()+'/angRest/rest/updateUser', angular.toJson($scope.userDetails), {headers: {'Content-Type': 'application/json'}}).success(function(response){
                 
				 $scope.poruka=true;
                 $timeout(function () { $scope.poruka=false; }, 4000);
            });	 
            $newPage = $actPage;
            $actPage = 1;
            $location.path("/users/"+$newPage);
	  };
      $scope.deleteUser = function() {
        $http.get('http://'+$location.host()+'/angRest/rest/deleteUser/'+$routeParams.id).success(function(response){
						
        });
        $location.path("/users");
      };
	  $scope.cancelEdit = function(){ 
		$location.path("/users");  
	  }
});
demoApp.controller('newUserCtrl', function($scope,$http,$location,$timeout) {
	  $scope.userData = {
		id: "",
		firstName: "",
		lastName: "",
		city: "",
		description: ""
	  };
    $scope.submitForm = function() {
        $http.post('http://'+$location.host()+'/angRest/rest/addUser', $scope.form, {headers: {'Content-Type': 'application/json'}}).success(function(response){
			 
			 $scope.form.firstName = "";
             $scope.form.lastName = "";
             $scope.form.city = "";
             $scope.form.description = "";
			 
//$scope.form.$dirty = false;
			 $scope.infoMessage=true;            
			 $timeout(function () { $scope.infoMessage = false; }, 6000);
			 
        });
    };	
	$scope.cancelEdit = function(){ 
		$location.path("/users");  
	}	
});
// create the controller and inject Angular's $scope
demoApp.controller('mainCtrl', function($scope) {
	// create a message to display in our view
	$scope.heading = 'Demo aplikacija - prezentiranje Angular svojstava';
	$scope.message = 'Prezentacija Angular svojstava';
});
demoApp.controller('conferenceCtrl', function($scope,$location) {
        $scope.heading = 'Konferencije';
        $scope.message = 'Pregled planiranih i održanih konferencija';
});


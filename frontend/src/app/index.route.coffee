angular.module 'zhibo'
  .config ($stateProvider, $urlRouterProvider) ->
    'ngInject'
    # $rootScope.loading = true
    $stateProvider
      .state 'home',
        url: '/home'
        templateUrl: 'app/main/main.html'
        controller: 'MainController'
        controllerAs: 'main'
      .state 'direct',
        url: '/'
        templateUrl: 'app/direct/index'
        controller: 'DirectController'
        controllerAs: 'direct'

    $urlRouterProvider.otherwise '/'

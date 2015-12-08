var app = angular.module('MyApp');

app.factory('EventService', ['$http', '$q',
	function($http, $q) {
		return {
			getEvents: function() {
				var deferred = $q.defer();
				$http.get('./direct/getDirectPage?page=1&size=10&directStatus=1&directExamine=1').success(function(result) {
					if(result.code==0){
						alert(result.message);
					}
					var datas =result.datum.list;
					deferred.resolve(datas);
				}).error(function(result) {
					deferred.reject(false);
				});

				return deferred.promise;
			},
			submits:function(id,code){
//				var param = {
//						 'directId': id,
//				 		 'code':code,
//				 		'answerStatus':'1',
//				 		'directPassword':'123456'
//		             };
				$http.post('./directAnser/update?answerStatus=1&code='+code+'&directId='+id+'&directPassword=123456').success(
						   function(result) {
							 if(result.code==1){
									alert('预约成功！');
								}
							}).error(function(result) {
								alert('失败！');
						});
			}
		};
}]);
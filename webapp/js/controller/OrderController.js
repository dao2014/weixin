
var OrderControllerModule = angular.module('OrderControllerModule',[])
/**
* 订单列表Controller控制器
*/
OrderControllerModule.controller('OrderController',[
	'$rootScope',
	'$scope',
	'OrderService',
	'ShopService',
	'OpenIdBindService',
	'WXShareService',
	'LoadingService',
	function($rootScope,$scope,OrderService,ShopService,OpenIdBindService,WXShareService,LoadingService){
		LoadingService.updateIsLoading(true);
		var oid = $rootScope.BaseOpenID = $rootScope.$stateParams.oid;
		OpenIdBindService.setBaseTitle(oid);
		/**
		* 默认加载购物车，显示数量
		*/
		if(!ShopService.IS_GLOBAL_LOAD){
			ShopService.getShopCarList();
		}else{
			ShopService.getShopCarSumNumber();
		}

		/**
		* 加载订单列表数据，以及更新到views
		*/
		$scope.OrderInfo = [];
		OrderService.reset();
		OrderService.getOrderList()

		/**
		* 分页加载更多
		*/
		$scope.loadMore=function(){
			OrderService.getOrderList()
		}
		$rootScope.$on('OrderList.update',function(event){
			$scope.OrderInfo  =  OrderService.OrderList;
			LoadingService.updateIsLoading(false);
		});
		WXShareService.FXhide();
	}
]);

/**
* 订单详情Controller控制器
*/
OrderControllerModule.controller('OrderInfoController',[
	'$rootScope',
	'$scope',
	'OrderService',
	'alertDeleteService',
	'AlertService',
	'WXShareService',
	'LoadingService',
	function($rootScope,$scope,OrderService,alertDeleteService,AlertService,WXShareService,LoadingService){
		
		LoadingService.updateIsLoading(true);
		var openid = $rootScope.BaseOpenID = $rootScope.$stateParams.oid;//openid
		var pid = $scope.pid = $rootScope.$stateParams.pid;//订单ID
		var fid = $scope.fid = $rootScope.$stateParams.fid;//fromID
	
		/**
		* 获取订单详情
		*/


		OrderService.getOrderDetail(pid,openid).success(function(data){
			if(data.code==0){
				var data = $scope.OrderInfo = data.data;
				$scope.AddressInfo = data.address;
				$scope.timeinfo = {
					time:data.createTime,
					number:data.code,
					mark:data.buyerRemark,
					sellerRemark:data.sellerRemark,
					expressStart:data.expressStart,
					expressEnd:data.expressEnd,
					express:data.express,
					statusCode:data.statusCode
				}
			}else{
				AlertService.updateAlert({title:data.message,apply:true});
			}
			LoadingService.updateIsLoading(false);
		});

		/**
		* 订单支付
		*/
		$scope.wxPay=function(){
			window.location.href="../true_wxpay/payOrder.php?a=pay_wx_money&oid="+pid+"&uid="+openid+"&fromid="+$scope.fid+'&pay_ref=order_pay';
		}

		/**
		* 返回订单列表 
		* 从微信支付模版点击查看订单详情，没有历史纪录，需手动返回跳
		*/
		$scope.goOrderList = function(){
			$rootScope.$state.go('order', $rootScope.$stateParams);
		}
		/**
		* 确认收货操作
		*/
		$scope.onReceivedOorder=function(){
			OrderService.onReceivedOorder(pid).success(_fn)
		}
		/**
		* 确认取消订单操作
		*/
		$scope.onCancelOrder =function(){
			alertDeleteService.updataShow({show:true,text:'确认取消当前订单？'});
		}
		$scope.onSureDeleteById=function(){
			OrderService.onCancelOrder(pid).success(_fn)
		}
		/**
		* 确认收货和取消订单的回调
		*/
		var _fn = function(data){
			if(data.code==0){
				$rootScope.$state.go('order', $rootScope.$stateParams);
			}
			AlertService.updateAlert({title:data.message,apply:true});
		}
		WXShareService.FXhide();
	}
]);

/**
* 我的销售列表Controller控制器
*/
// OrderControllerModule.controller('MySalseListController',[
// 	'$rootScope',
// 	'$scope',
// 	'OrderService',
// 	'WXShareService',
// 	function($rootScope,$scope,OrderService,WXShareService){
// 		$scope.productListType=[
// 			{id:1,name:'全部'},
// 			{id:2,name:'待付款'},
// 			{id:3,name:'待发货'},
// 			{id:4,name:'已发货'},
// 			{id:5,name:'已收货'}
// 		];
// 		var state=1;
// 		$scope.onClickTypeById=function(id){
// 			state = $scope.onClickStateId = id;
// 			OrderService.reset()
// 			OrderService.getSellerOrderList(state);
// 		}
// 		$rootScope.$on('SellerOrderList.update',function(){
// 			$scope.shoplist=OrderService.SellerOrderList;
// 		});
		
// 		$scope.onClickTypeById(state);
// 		$scope.loadMore=function(){
// 			OrderService.getSellerOrderList(state);
// 		}
// 		WXShareService.FXhide();
// 	}
// ]);

/**
* 卖家订单详情Controller控制器
*/
// OrderControllerModule.controller('SellerDetailController',[
// 	'$rootScope',
// 	'$scope',
// 	'OrderService',
// 	'ShopService',
// 	'WXShareService',
// 	function($rootScope,$scope,OrderService,ShopService,WXShareService){
// 		var pid = $rootScope.$stateParams.pid //订单id;
// 		var oid = $rootScope.$stateParams.oid //openid;
// 		OrderService.getSellerOrderDetail(pid);
// 		$scope.Remark = {
// 			'express':'',
// 			"remark": '',
// 			'sellerid':''//快递单号
// 		}
// 		$scope.OrderInfo={};
// 		$scope.expresses=[];
// 		$rootScope.$on('SellerDetail.update',function(){
// 			var data =$scope.OrderInfo = OrderService.SellerOrderDateil;
// 			$scope.AddressInfo = data.address;
// 			$scope.timeinfo = {
// 				time:data.createTime,
// 				number:data.code,
// 				mark:data.buyerRemark,
// 				sellerRemark:data.sellerRemark,
// 				expressStart:data.expressStart,
// 				expressEnd:data.expressEnd,
// 				express:data.express,
// 				statusCode:data.statusCode
// 			}

// 			if(data.statusCode==3){
// 				ShopService.getExpressList().success(function(data){
// 					if(data.code==0){
// 						data = data.data;;
// 						$scope.expresses = data;
// 						/**
// 						* 显示默认快递方式
// 						*/ 
// 						for(var i=0;i<data.length;i++){
// 							if(data[i]['isDefault']){
// 								$scope.expresses.items = data[i];
// 								var name = $scope.expresses.items.name;
// 								$scope.OrderInfo.express = name;
// 								break;
// 							}
// 						}
// 					}
// 				});
// 			}
// 		});

// 		/**
// 		* 更新扫码获取订单号
// 		*/
// 		$rootScope.$on('sendCode.update',function(){
// 			$scope.OrderInfo.expressStart = OrderService.sendCode;
// 		});
// 		$scope.changeExpress=function(){
// 			if($scope.expresses.items){
// 				var name = $scope.expresses.items.name;
// 				$scope.OrderInfo.express = name;
// 			}else{
// 				$scope.OrderInfo.express = null;
// 			}
// 		}
// 		$scope.onSellerDeliver=function(){
// 			delete $scope.OrderInfo.address; 
// 			delete $scope.OrderInfo.products; 
// 			$scope.OrderInfo.oid = $scope.OrderInfo.id;
// 			$scope.OrderInfo.sellerOpenId = oid;
// 			OrderService.onSellerDeliver($scope.OrderInfo);
// 		}
// 		WXShareService.FXhide();
// 	}
// ]);

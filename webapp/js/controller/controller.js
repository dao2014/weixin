"use strict";
var OrangeControllerModule = angular.module('OrangeControllerModule',[
	'HomeControllerModule',
	'InComeControllerModule',
	'SalesControllerModule',
	'OrderControllerModule'
]);

/**
* 商城主页面的Controller控制器
*/
OrangeControllerModule.controller('MainController',[
	'$rootScope',
	'$scope',
	'MainService',
	function($rootScope,$scope,MainService){
		$scope.onClickShopTypeId;//当前选中的商品分类ID;

		/**
		* 页面初始化
		*/
		MainService.init();
		
		/**
		* 分页加载更多
		*/
		$scope.loadMore =function(){ 
			MainService.loadMore();
		}

		$rootScope.$on('ShopList.update',function(event){
			$scope.shoplist = MainService.shoplist;
			$scope.typelist = MainService.typelist;
		})
		$scope.$on('ShopTypeId.update',function(){
			$scope.onClickShopTypeId = MainService.onClickShopTypeId;
		});	
		
		/**
		* 增减商品数量
		*/
		$scope.onAddNumber=function(index){
			MainService.onAddNumber(index);
		}
		$scope.onSubNumber=function(index){
			MainService.onSubNumber(index);
		}
	}
]);

/**
* 商城热销Controller控制器
*/
OrangeControllerModule.controller('HotController',[
	'$rootScope',
	'$scope',
	'ProductService',
	function($rootScope,$scope,Product){
		$scope.loadMore=function(){

		}
		Product.getHotProduct();
		$rootScope.$on('hotProduct.update',function(){
			$scope.itemsList = Product.HOT_PRODUCT;
		})
	}
])

/**
* 购物车的Controller控制器
*/
OrangeControllerModule.controller('ShopController',[
	'$rootScope',
	'$scope',
	'ShopService',
	function($rootScope,$scope,ShopService){
		// $scope.isShow = true;
		$scope.sumPrice= 0 ;
		$scope.noneNumber = false; 
		$scope.hasNumber = false; 
		$scope.Remark={aid:''}
		ShopService.init();
		/**
		* 加载购物车列表以及更新到views
		*/
		
		$rootScope.$on("shopCarList.update",function(){
			$scope.shopCarList = ShopService.shopCarList;
			
		})
		$rootScope.$on('sumMoney.update',function(){
			var sum = $scope.sumPrice = ShopService.sumPrice;
			if($scope.sumPrice){
				$scope.noneNumber = false;
				$scope.hasNumber = true;
			}else{
				$scope.noneNumber = true;
				$scope.hasNumber = false;
			}
		});

		/**
		* 更新收货地址事件
		*/
		$rootScope.$on('shopAddress.update',function(){
			$scope.Remark.aid = ShopService.Remark.aid;
			$scope.AddressInfo = ShopService.AddressInfo
		})
		

		/**
		* 增减商品数量
		*/
		$scope.onAddNumber=function(index){
			ShopService.onAddNumber(index);	
		}
		$scope.onSubNumber=function(index){
			ShopService.onSubNumber(index);
		}
	}
]);

//结算付款的Controller控制器
OrangeControllerModule.controller('PayController',[
	'$rootScope',
	'$scope',
	'PayService',
	'OrderService',
	'ShopService',
	'AlertService',
	function($rootScope,$scope,PayService,OrderService,ShopService,AlertService){
		
		PayService.init();

		$scope.DefaultPay = 0;
		var oid = $rootScope.BaseOpenID = $rootScope.$stateParams.oid;
		var aid = $scope.aid = $rootScope.$stateParams.aid;
		var fid = $scope.fid = $rootScope.$stateParams.fid;
		var paylist = $scope.paylist=[//此处付款方式不要修改
			{"id":0,"image":"./img/wx.png","text":"微信支付（推荐）"},
			{"id":1,"image":"./img/alipay.png","text":"支付宝支付"}
		]
		$scope.onChoosePay=function(index){
			$scope.DefaultPay = paylist[index]['id'];
		};
		$scope.changeExpress=function(){
			PayService.calcOrderExpress();
		}

		$scope.Remark = {
			"aid":aid,
			"freight": 0,
			'express':'',
			"remark": ''
		}
		
		/**
		* 快递方式
		*/
		$rootScope.$on("expressList.update",function(){
			$scope.expresses = PayService.expresses;
		});

		
		/**
		* 获取购物车商品列表
		*/ 
			
		$rootScope.$on("shopCarList.update",function(){
			$scope.shoplist = ShopService.shopCarList;
		})
		$rootScope.$on('freight.update',function(){
			$scope.Remark = PayService.Remark;
			$scope.sumPrice = ShopService.sumPrice;
			$scope.sumPrice += PayService.Remark.freight;
		});
		$rootScope.$on('sumMoney.update',function(){
			$scope.sumPrice = ShopService.sumPrice;
			$scope.sumPrice += PayService.Remark.freight;
		});
		$rootScope.$on("payAddress.update",function(){
			$scope.AddressInfo = PayService.AddressInfo;
		})

		/**
		* 订单确认付款
		*/ 
		$scope.goOrderPay =function(){
			// if(!$scope.Remark.express){
			// 	AlertService.updateAlert({title:"请选择快递方式",apply:true});
			// 	return
			// }
			$scope.Remark.express='cto';
			OrderService.postNewOrder($scope.Remark).success(function(data){
				if(data.code==0){
					if($scope.DefaultPay==0){
						window.location.href="../true_wxpay/payOrder.php?a=pay_wx_money&oid="+data.data+"&uid="+oid+"&payType="+$scope.DefaultPay+'&fromid='+$scope.fid+'&pay_ref=shopcart_pay&token='+data.payToken;
					}else if($scope.DefaultPay==1){
						window.location.href="../alipay/alipayOrder.php?oid="+data.data+"&uid="+$rootScope.BaseOpenID+"&payType="+$scope.DefaultPay+'&fromid='+$scope.fid;
					}	
				}
				AlertService.updateAlert({title:data.message,apply:true});
			})
		}
	}
])


/**
* 产品详情页面Controller控制器
*/
OrangeControllerModule.controller('ProductController',[
	'$rootScope',
	'$scope',
	'ProductService',
	"ShopService",
	'LoadingService',
	'WXShareService',
	'OpenIdBindService',
	function($rootScope,$scope,ProductService,ShopService,LoadingService,WXShareService,OpenIdBindService){
		
		// var rid = $rootScope.$stateParams.rid;
		var pid = $rootScope.$stateParams.ProductId;
		var oid = $rootScope.BaseOpenID = $rootScope.$stateParams.oid
		OpenIdBindService.setBaseTitle(oid);

		function _getProduct(){
			ProductService.getProductById(pid);
		}
		/**
		* 默认加载购物车，显示数量
		*/
		if(!ShopService.IS_GLOBAL_LOAD){
			ShopService.getShopCarList();
		}else{
			ShopService.getShopCarSumNumber();
			_getProduct();
		}
		$rootScope.$on('shopCarList.update',function(event){
			_getProduct();
		})

		
		var obj = {};
		WXShareService.FXShow();
		WXShareService.FXhide2();
		$scope.$on('ProductInfo.update',function(event){
			$scope.ProductInfo = ProductService.ProductInfo;
			var one_product =  ProductService.ProductInfo;
			// $scope.ProductInfo.number = ShopService.shopCarList[$scope.ProductInfo.$index]['number'];
			obj = {
			    	APPShareTitle:one_product.name,
				    APPShareImg:one_product.thumbUrl,
				    APPShareDes : one_product.name,
				    AppShareLink :  BASEHTTP+"controller/shareAppFr.php?a=share_product&share_id="+oid+"&pid="+pid
			    }
			WXShareService.shareApp(obj);
		    WXShareService.shareFr(obj);
		});


		$scope.onAddNumber = function(){
			ShopService.shopCarList[$scope.ProductInfo.$index]['number']++;
			ShopService.getShopCarSumNumber();
		}
		$scope.onSubNumber = function(){
			ShopService.shopCarList[$scope.ProductInfo.$index]['number']--;
			ShopService.getShopCarSumNumber();
		}
		$scope.onReturnMain=function(){
			$rootScope.$state.go('main',$rootScope.$stateParams)
		}
	}
])

/**
* 页面底部购物车数量Controller控制器
*/
OrangeControllerModule.controller('BottomController',[
	'$rootScope',
	'$scope',
	'ShopService',
	function($rootScope,$scope,ShopService){
		$scope.$on('sumNumber.update',function(event){
			$scope.carNumber =  ShopService.sumNumber;
		});
		$scope.carNumber = ShopService.sumNumber;
	}
]);

/**
* 商城首面搜索Controller控制器
*/
OrangeControllerModule.controller('SearchController',[
	'$rootScope',
	'$scope',
	'SearchService',
	'ShopService',
	'WXShareService',
	function($rootScope,$scope,SearchService,ShopService,WXShareService){
		$scope.rid = $rootScope.$stateParams.rid;
		$rootScope.BaseOpenID = $rootScope.$stateParams.oid;
		var key =$scope.key = $rootScope.$stateParams.key;
		$scope.isShow = false;
		/**
		* 默认加载购物车，显示数量
		*/
		if(!ShopService.IS_GLOBAL_LOAD){
			ShopService.getShopCarList();
		}else{
			ShopService.getShopCarSumNumber();
		}
		/**
		* 分页加载更多
		*/
		SearchService.onUpdateToSearch(key)
		$scope.loadMore =function(){ 
			SearchService.loadMore();
		}
		$rootScope.$on('SearchShopList.update',function(){
			$scope.shoplist = SearchService.shoplist;
		});
		/**
		* 增减商品数量
		*/
		$scope.onAddNumber=function(index){
			SearchService.onAddNumber(index);
		}
		$scope.onSubNumber=function(index){
			SearchService.onSubNumber(index);
		}
	}
]); 


/**
* 提示信息Controller控制器
*/ 
OrangeControllerModule.controller('alertController', [
	'$rootScope', 
	'$scope',
	'AlertService',
	function($rootScope,$scope,AlertService){
		$scope.isShow = false;
		$scope.alertText = '';
		$rootScope.$on('alert.update',function(){
			$scope.isShow = AlertService.isShow;
			$scope.alertText = AlertService.alertText;
		})
	}
]);
/**
* 加载中Controller控制器
*/ 
OrangeControllerModule.controller('LoadingController', [
	'$rootScope',
	'$scope',
	'LoadingService',
	function($rootScope,$scope,LoadingService){
		$rootScope.$on('isLoading.update',function(){
			$scope.isLoading = LoadingService.isLoading;
		})
	}
])
/**
* 删除提示框Controller控制器
*/ 
OrangeControllerModule.controller('alertDeleteController',[
	'$rootScope',
	'$scope',
	'alertDeleteService',
	function($rootScope,$scope,alertDeleteService){
		$scope.isShow = false;
		$scope.text = '';
		$rootScope.$on('alertdelete.update',function(){
			$scope.isShow = alertDeleteService.isShow;
			$scope.text = alertDeleteService.text;
		})
	}
])
/**
* 快速注册Controller控制器
*/ 
OrangeControllerModule.controller('RegisController',[
	'$rootScope',
	'$scope',
	'alertDeleteService',
	function($rootScope,$scope,alertDeleteService){
		$scope.phone;
		$scope.code;
	}
])








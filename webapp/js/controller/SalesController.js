


var SalesControllerModule = angular.module('SalesControllerModule',[]);

/**
* 促销页面Controller控制器
*/
SalesControllerModule.controller('SalesController',[
	'$rootScope',
	'$scope',
	'SalesService',
	'WXShareService',
	'OpenIdBindService',
	'LoadingService',
	function($rootScope,$scope,SalesService,WXShareService,OpenIdBindService,LoadingService){
		LoadingService.updateIsLoading(true);
		var oid = $rootScope.BaseOpenID = $rootScope.$stateParams.oid //openid
		var cid = $rootScope.cid = $rootScope.$stateParams.cid //促销id
		// OpenIdBindService.isVaildOpenIdBind(oid,'saleshop',$rootScope.$stateParams);
		$scope.sales={
			title:'',
			startRq:'',
			endRq:'',
			price:0,
			mPrice:0,
			desc:''
		}
		SalesService.getSalesPage(cid);
		$rootScope.$on("sales.update",function(){
			$scope.sales = SalesService.SALES_INFO;
			var obj = {
			    	APPShareTitle:SalesService.SALES_INFO.shareText,
				    APPShareImg:SalesService.SALES_INFO.sharePic,
				    APPShareDes : SalesService.SALES_INFO.shareDesc,
				    AppShareLink :  BASEHTTP+"controller/promotion.php?a=share_promotion&share_id="+oid+'&cid='+cid
			    }
		    WXShareService.shareApp(obj);
	    	WXShareService.shareFr(obj);
			LoadingService.updateIsLoading(false);
		});	
		$scope.onSaleShop=function(){
			OpenIdBindService.isVaildOpenIdBind(oid,'saleshop',$rootScope.$stateParams)
			// $rootScope.$state.go("saleshop",$rootScope.$stateParams);
		}
		WXShareService.FXShow();
		WXShareService.FXhide2();
	}
])

/**
* 促销购物车SaleshopController控制器
*/
SalesControllerModule.controller('SaleshopController',[
	'$rootScope',
	'$scope',
	'MyAddressService',
	'SalesService',
	'WXShareService',
	'OpenIdBindService',
	'LoadingService',
	'ShopService',
	function($rootScope,$scope,MyAddressService,SalesService,WXShareService,OpenIdBindService,LoadingService,ShopService){
		
		LoadingService.updateIsLoading(true);
		var oid = $rootScope.BaseOpenID = $rootScope.$stateParams.oid //openid
		var cid = $rootScope.cid = $rootScope.$stateParams.cid //促销id
		$scope.isDisabled = true;

		// OpenIdBindService.isVaildOpenIdBind(oid,'saleshop',$rootScope.$stateParams)
		/**
		* 加载收货地址详情以及更新到views
		*/
		$scope.Remark = {
			"aid":'',
			"express": 0,
			"remark": ''
		}
		var _fn =	function(data){
			if (data.code==0) {
				if(data.data){
					$scope.AddressInfo = data.data;
					$scope.Remark.aid = data.data.id;
					$scope.isDisabled = false;
				}
				LoadingService.updateIsLoading(false);
			};
		}
		MyAddressService.getDefaultAddress().success(_fn);	
		$scope.getAddressDetail = function(id){
			MyAddressService.getAddressDetail(id).success(_fn);
			/**
			* 隐藏收货地址列表
			*/
			MyAddressService.updateaAddressIsShow({show:false,home:true});
		};
		/**
		* 加载购物车列表以及更新到views
		*/
		if(!SalesService.IS_GLOBAL_LOAD){
			SalesService.getSalesPage(cid)
		}else{
			$scope.shopCarList = SalesService.SALES_PRO;
			$scope.sales = SalesService.SALES_INFO;
		}
		$rootScope.$on("sales.update",function(){
			$scope.sales = SalesService.SALES_INFO;
			$scope.shopCarList = SalesService.SALES_PRO;
		});

		$scope.onSalePay=function(){
			if($scope.Remark.aid!=''){
				$rootScope.$stateParams.aid = $scope.Remark.aid
				$rootScope.$state.go('salepay',$rootScope.$stateParams)
			}
		}

		$scope.isShow = true;
		$rootScope.$on("shopShow.update",function(){
			$scope.isShow = ShopService.isShow;
		});

		WXShareService.FXhide();
	}
])

/**
* 促销结算付款的Controller控制器
*/
SalesControllerModule.controller('SalepayController',[
	'$rootScope',
	'$scope',
	'OrderService',
	'MyAddressService',
	'ShopService',
	'SalesService',
	'AlertService',
	'WXShareService',
	'LoadingService',
	function($rootScope,$scope,OrderService,MyAddressService,ShopService,SalesService,AlertService,WXShareService,LoadingService){
		LoadingService.updateIsLoading(true);
		$scope.DefaultPay = 0;
		var oid = $rootScope.BaseOpenID = $rootScope.$stateParams.oid;
		var aid = $scope.aid = $rootScope.$stateParams.aid;
		var cid = $scope.cid = $rootScope.$stateParams.cid;
		var fid = $scope.fid = $rootScope.$stateParams.fid;

		var paylist=[//此处付款方式不要修改
			{"id":0,"image":"./img/wx.png","text":"微信支付（推荐）"},
			{"id":1,"image":"./img/alipay.png","text":"支付宝支付"}
			// {"id":2,"image":"./img/pay.png","text":"货到付款"}
		]
		$scope.paylist = paylist;
		$scope.onChoosePay=function(index){
			$scope.DefaultPay = paylist[index]['id'];
		};

		$scope.Remark = {
			"aid":aid,
			"freight": 0,
			'express':'',
			"remark": ''
		}
		/**
		* 加载快递方式
		*/ 
		$scope.expresses=[];
		ShopService.getExpressList(aid).success(function(data){
			if(data.code==0){
				data = $scope.expresses = data.data;
				/**
				* 显示默认快递方式
				*/ 
				for(var i=0;i<data.length;i++){
					if(data[i]['isDefault']){
						$scope.expresses.items = data[i];
						break;
					}
				}
			}
		});

		/**
		* 获取收货地址详情
		*/
		MyAddressService.getAddressDetail(aid).success(function(data){
			if (data.code==0) {
				if(data.data){
					$scope.AddressInfo = data.data;
				}
				LoadingService.updateIsLoading(false);
			};
		});		

		/**
		* 加载购物车列表以及更新到views
		*/
		if(!SalesService.IS_GLOBAL_LOAD){
			SalesService.getSalesPage(cid)
		}else{
			$scope.shoplist = SalesService.SALES_PRO;
			$scope.sales = SalesService.SALES_INFO;
		}
		$rootScope.$on("sales.update",function(){
			$scope.sales = SalesService.SALES_INFO;
			$scope.shoplist = SalesService.SALES_PRO;

		});

		/**
		* 订单确认付款
		*/ 
		$scope.goOrderPay =function(){
			if(!$scope.expresses.items){
				AlertService.updateAlert({title:'请选择快递方式',apply:true});
				return ;
			}
			var obj ={
				cid:cid,
				aid:aid,
				express:$scope.expresses.items.name,
				remark:$scope.Remark.remark
			}
			SalesService.postNewOrder(obj).success(function(data){
				
				if(data.code==0){
					if($scope.DefaultPay==0){
						window.location.href="../true_wxpay/payOrder.php?a=pay_wx_money&oid="+data.data+"&uid="+oid+"&payType="+$scope.DefaultPay+'&fromid='+$scope.fid+'&pay_ref=order_pay';
					}else if($scope.DefaultPay==1){
						window.location.href="../alipay/alipayOrder.php?oid="+data.data+"&uid="+oid+"&payType="+$scope.DefaultPay+'&fromid='+$scope.fid;
					}	
				}
				// AlertService.updateAlert({title:data.message,apply:true});
			})
			
		}
		WXShareService.FXhide();
	}
])

/**
* 促销列表Controller控制器
*/
SalesControllerModule.controller('SalesListController',[
	'$rootScope',
	'$scope',
	'SalesService',
	'AlertService',
	'WXShareService',
	function($rootScope,$scope,SalesService,AlertService,WXShareService){
		SalesService.reset();
		SalesService.getPromotionList();
		$scope.loadMore=function(){
			SalesService.getPromotionList();
		}
		$rootScope.$on('SALESLIST.update',function(){
			$scope.shoplist = SalesService.SALESLIST;
		})
		WXShareService.FXhide();
	}
])

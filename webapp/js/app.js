"use strict";
var BASEHTTP = 'http://ouhemall.orangebusiness.com.cn/ohgjmall/';
var ver = '0.0.0';
var OrangeApp = angular.module('OrangeApp',[
	'ui.router',
	'CityDataModule',
	'OrangeServiceModule',
	'OrangeDirectiveModule',
	'OrangeControllerModule'
]);


OrangeApp.run([
	'$rootScope',
	'$state',
	'$stateParams',
	'WXShareService',
	function($rootScope,$state,$stateParams,WXShareService) {
		$rootScope.$state = $state;
		$rootScope.$stateParams = $stateParams;
		// $rootScope.BaseOpenID='';
		WXShareService.init();
		WXShareService.postConfig();
	}
]);

OrangeApp.config([
	'$stateProvider',
	'$urlRouterProvider',
	'$httpProvider',
	function($stateProvider,$urlRouterProvider,$httpProvider){
	    $stateProvider
		    /**
		    * 商城主页
		    * oid : openid
		    * fid : fromid
		    * rid : 推荐人id
		    */
		    .state('main', {
		        url: '/main/{oid}/{fid}',	
		    	cache:false,			
		        templateUrl: 'views/mall/main.html?v='+ver,
	        	controller:'MainController'
		    })
		    /**
		    * 热销主页
		    * oid : openid
		    * fid : fromid
		    * rid : 推荐人id
		    */
		    .state('hot', {
		        url: '/hot/{oid}/{fid}',	
		    	cache:false,			
		        templateUrl: 'views/mall/hot.html?v='+ver,
	        	controller:'HotController'
		    })

		    /**
		    * 商城搜索页面
		    * key : 搜索关键字
		    * oid : openid
		    * fid : fromid
		    * rid : 推荐人id
		    */
		    // .state('search', {
		    //     url: '/search/{key}/{oid}/{fid}',	
		    // 	cache:false,			
		    //     templateUrl: 'views/mall/search.html?v='+ver,
	     //    	controller:'SearchController'
		    // })

		    /**
		    * 订单列表页
		    * oid : openid
		    * fid : fromid
		    * rid : 推荐人id
		    */
		    .state('order',{
		    	url:'/order/{oid}/{fid}',
		    	cache:false,
		    	templateUrl:'views/order/order.html?v='+ver,
	        	controller:'OrderController'
		    })
		    /**
		    * 我的页面
		    * oid : openid
		    * fid : fromid
		    * rid : 推荐人id
		    */
		    .state('home',{
		    	url:'/home/{oid}/{fid}',
		    	cache:false,
		    	templateUrl:'views/home/home.html?v='+ver,
		    	controller:'HomeController'
		    })

		    /**
		    * 我的代理
		    * oid : openid
		    * fid : fromid
		    * rid : 推荐人id
		    */
		    .state('agent',{
		    	url:'/agent/{oid}/{fid}',
		    	cache:false,
		    	templateUrl:'views/home/agent.html?v='+ver,
		    	controller:'AgentController'
		    })

		    /**
		    * 我的代理明细
		    * oid : openid
		    * fid : fromid
		    * rid : 推荐人id
		    */
		    .state('agentinfo',{
		    	url:'/agentinfo/{indexid}/{oid}/{fid}/{key}',
		    	cache:false,
		    	templateUrl:'views/home/agentinfo.html?v='+ver,
		    	controller:'AgentInfoController'
		    })


			


		    /**
		    * 我的代理收益明细
		    * oid : openid
		    * fid : fromid
		    * rid : 推荐人id
		    */
		    .state('agentincome',{
		    	url:'/agentincome/{userId}/{oid}/{fid}',
		    	cache:false,
		    	templateUrl:'views/home/agentincome.html?v='+ver,
		    	controller:'AgentIncomeController'
		    })

		    /**
		    * 购物车
		    * oid : openid
		    * fid : fromid
		    * rid : 推荐人id
		    */
		    .state('shop',{
		    	url:'/shop/{oid}/{fid}',
		    	cache:false,
		    	templateUrl:'views/mall/shop.html?v='+ver,
		    	controller:'ShopController'
		    })
		    /**
		    * 结算付款
		    * oid : openid
		    * fid : fromid
		    * aid : 收货地址id
		    */
		    .state('pay',{
		    	url:'/pay/{oid}/{fid}/{aid}',
		    	cache:false,
		    	templateUrl:'views/mall/pay.html?v='+ver,
		    	controller:'PayController'
		    })
		    /**
		    * 产品详情
		    * ProductId : 产品Id
		    * oid : openid
		    * fid : fromid
		    * rid : 推荐人id
		    */
		    .state('product',{
		    	url:'/product/{ProductId}/{oid}/{fid}',
		    	cache:false,
		    	templateUrl:'views/product/product.html?v='+ver,
		    	controller:'ProductController'
		    })
		    /**
		    * 订单详情
		    * pid: 订单详情id
		    * oid: openid
		    * fid : fromid
		    * rid : 推荐人id
		    */
		    .state('orderinfo',{
		    	url:'/orderinfo/{pid}/{oid}/{fid}',
		    	cache:false,
		    	templateUrl:'views/order/orderinfo.html?v='+ver,
		    	controller:'OrderInfoController'
		    })

		    /**
		    * 促销列表
		    * oid: openid
		    * fid: fromid
		    * rid : 推荐人id
		    */
		    .state('saleslist',{
		    	url:'/saleslist/{oid}/{fid}',
		    	cache:false,
		    	templateUrl:'views/sales/saleslist.html?v='+ver,
		    	controller:'SalesListController'
		    })
		    /**
		    * 促销详情页
		    * oid: openid
		    * fid: fromid
		    * cid: 促销id
		    */
		    .state('sales',{
		    	url:'/sales/{oid}/{fid}/{cid}',
		    	cache:false,
		    	templateUrl:'views/sales/sales.html?v='+ver,
		    	controller:'SalesController'
		    })
		    /**
		    * 促销购物车页
		    * oid: openid
		    * fid: fromid
		    * cid: 促销id
		    */
		    .state('saleshop',{
		    	url:'/saleshop/{oid}/{fid}/{cid}',
		    	cache:false,
		    	templateUrl:'views/sales/saleshop.html?v='+ver,
		    	controller:'SaleshopController'
		    })
		    /**
		    * 促销结算付款
		    * oid: openid
		    * fid: fromid
		    * cid: 促销id
		    * aid: 收货地址id
		    */
		    .state('salepay',{
		    	url:'/salepay/{oid}/{fid}/{cid}/{aid}',
		    	cache:false,
		    	templateUrl:'views/sales/salepay.html?v='+ver,
		    	controller:'SalepayController'
		    })

		    /**
		    * 我的收益
		    */
		    .state('income',{
		    	url:'/income/{oid}/{fid}',
		    	cache:false,
		    	templateUrl:'views/home/income.html?v='+ver,
		    	controller:'IncomeController'
		    })
		    /**
		    * 提现
		    * type 提现的方式 =wx 微信  =bank银行卡
		    */
		    .state('cash',{
		    	url:'/cash/{oid}/{fid}/{type}',
		    	cache:false,
		    	templateUrl:'views/home/cash.html?v='+ver,
		    	controller:'GetCashController'
		    })


		    /**
		    * 绑定银行卡
		    */
		    .state('bindbank',{
		    	url:'/bindbank',
		    	cache:false,
		    	templateUrl:'views/home/bindbank.html?v='+ver,
		    	controller:'BindBankController'
		    })

		    /**
		    * 收货地址列表
		    * type : 
 		    */
		    .state('address',{
		    	url:'/address/{type}',
		    	cache:false,
		    	templateUrl:'views/home/my_address_list.html?v='+ver,
		    	controller:'shopAddressController'
		    })

		    /**
		    * 编辑收货地址
		    * id : 地址id
 		    */
		    .state('editaddress',{
		    	url:'/editaddress/{addressid}',
		    	cache:false,
		    	templateUrl:'views/home/add_address.html?v='+ver,
		    	controller:'MyNewAddressController'
		    })

		    /**
		    * 我绑定的银行卡
		    */
		    // .state('mybanklist',{
		    // 	url:'/mybanklist',
		    // 	cache:false,
		    // 	templateUrl:'views/mybanklist.html',
		    // 	controller:'MyBindBankController'
		    // })

		    /**
		    * 设置银行卡
		    */
		    // .state('setbank',{
		    // 	url:'/setbank',
		    // 	cache:false,
		    // 	templateUrl:'views/setbank.html',
		    // 	controller:'SetBankController'
		    // })

		    /**
		    * 我的产品表列
		    * oid : openid
		    * fid : fromid
		    * rid : 推荐人id
 		    */
		    // .state('productlist',{
		    // 	url:'/productlist/{oid}/{fid}/{rid}',
		    // 	cache:false,
		    // 	templateUrl:'views/product/productlist.html?v='+ver,
		    // 	controller:'ProductListController'
		    // })
		    /**
		    * 我的产品分类
		    */
		    // .state('producttype',{
		    // 	url:'/producttype',
		    // 	cache:false,
		    // 	templateUrl:'views/product/producttype.html?v='+ver,
		    // 	controller:'ProductTypeController'
		    // })
		    /**
		    * 我的产品编辑页
		    * ProductId: 产品Id
		    * mcateid : 分类ID
		    */
		    // .state('productedit',{
		    // 	url:'/productedit/{ProductId}',
		    // 	cache:false, 
		    // 	templateUrl:'views/product/productedit.html?v='+ver,
		    // 	controller:'ProductEditController'
		    // })

		    /**
		    * 我的销售表列
		    * oid : openid
		    * fid : fromid
		    * rid : 推荐人id
 		    */
		    // .state('mysaleslist',{
		    // 	url:'/mysaleslist/{oid}/{fid}/{rid}',
		    // 	cache:false,
		    // 	templateUrl:'views/order/mysaleslist.html?v='+ver,
		    // 	controller:'MySalseListController'
		    // })
		    /**
		    * 卖家订单详情
		    * oid : openid
		    * pid : 订单详情id
 		    */
		    // .state('sellerdetail',{
		    // 	url:'/sellerdetail/{oid}/{pid}',
		    // 	cache:false,
		    // 	templateUrl:'views/order/sellerdetail.html?v='+ver,
		    // 	controller:'SellerDetailController'
		    // })
		    /**
		    * 实名认证
		    */
		    .state('myinfo',{
		    	url:'/myinfo/{oid}/{fid}',
		    	cache:false,
		    	templateUrl:'views/home/myinfo.html?v='+ver,
		    	controller:'MyInfoController'
		    })
		    /**
		    * 提现密码
		    */
		    .state('password',{
		    	url:'/password/{oid}',
		    	cache:false,
		    	templateUrl:'views/home/password.html?v='+ver,
		    	controller:'PasswordController'
		    })
		    /**
		    * 我的名片
		    */
		    .state('qrcode',{
		    	url:'/qrcode/{oid}/{fid}',
		    	cache:false,
		    	templateUrl:'views/home/qrcode.html?v='+ver,
		    	controller:'QrcodeController'
		    })

		    /**
		    * 快速注册
		    */
		    .state('regis',{
		    	url:'/regis/{oid}/{fid}',
		    	cache:false,
		    	templateUrl:'views/regis.html?v='+ver,
		    	controller:'RegisController'
		    })

		/**
		* 默认路由
	    * oid : openid
	    * fid : fromid
	    * rid : 推荐人id
		*/
		$urlRouterProvider.otherwise('/main/123456789012/TOP');
		// $urlRouterProvider.otherwise(function(){
		// 	window.location.href = './404.html';
		// });
		$httpProvider.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=utf-8';
	  	$httpProvider.defaults.headers.put['Content-Type'] = 'application/x-www-form-urlencoded;charset=utf-8';
		var param = function(obj) {
			var query = '',
				name, value, fullSubName, subName, subValue, innerObj, i;

			for (name in obj) {
				value = obj[name];

				if (value instanceof Array) {
					for (i = 0; i < value.length; ++i) {
		 				subValue = value[i];
		 				fullSubName = name + '[' + i + ']';
		 				innerObj = {};
		 				innerObj[fullSubName] = subValue;
		 				query += param(innerObj) + '&';
		 			}
				} else if (value instanceof Object) {
					for (subName in value) {
						subValue = value[subName];
						fullSubName = name + '[' + subName + ']';
						innerObj = {};
						innerObj[fullSubName] = subValue;
						query += param(innerObj) + '&';
					}
				} else if (value !== undefined && value !== null)
					query += encodeURIComponent(name) + '=' + encodeURIComponent(value) + '&';
			}

			return query.length ? query.substr(0, query.length - 1) : query;
		};
		$httpProvider.defaults.transformRequest = [function(data) {
			return angular.isObject(data) && String(data) !== '[object File]' ? param(data) : data;
		}];
	 
	}
]);

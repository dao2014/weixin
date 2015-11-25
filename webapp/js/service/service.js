
"use strict";
var OrangeServiceModule = angular.module('OrangeServiceModule',[
	'HomeService',
	'InComeServiceModule'
]);

//转换html代码过滤器
OrangeServiceModule.filter('toTrustHtml',['$sce',function($sce){
	return function (text) {  
        return $sce.trustAsHtml(text);  
    }  
}])
/**
* 其它
*/
OrangeServiceModule.service('myScrollService',[
	function(){
		var service = {
			myScroll:'',
		    myScrollY:0,		    
		    /**
		    * 首页左侧分类滚动实例
		    */
		   	scrollLoad:function(){
	   			service.myScroll = new iScroll('main-left', { 
					checkDOMChanges: true,vScrollbar:false,preventDefault:false //,
				});
		   	},
		   	addProduct:function (index){
		        var offset = $('#badge-car').offset(), 
		        	off = $('#shop-items-'+index).offset(),
		        	src = $('#shop-items-'+index).attr('src'),
					flyer = $('<img style="width:30px;height:30px;" src="'+src+'">');
				flyer.fly({
				  	start: {
			      		left: (off.left+40),
			      		top: ((off.top+40)-$(window).scrollTop())
				  	},
				  	end: {
				      	left: offset.left+18,
				      	top: offset.top+15,
				      	width: 20,
				      	height: 20
				  	}
				});
				setTimeout(function(){
					$(flyer).remove();
				},1000);
		  	}
		}
		return service;
	}
]);

/**
* 基类
*/
OrangeServiceModule.service('BaseService',[
	'$rootScope',
	'$http',
	'LoadingService',
	'AlertService',
	function($rootScope,$http,LoadingService,AlertService){
		var service = {
			documentTitle:null,
			url:{
				index_url:'../controller/index.php',
				product_url:'../controller/product.php',
				user_url :'../controller/user.php',
				shopcart_url:'../controller/shopcart.php',
				address_url:'../controller/address.php',
				express_url:'../controller/express.php',
				oauthUser_url:'../controller/oauthUser.php'
			},
			method:'get',
			data:{},
			/**
			* 数据请求
			*/
			request:function(obj){
				if(obj.mark){
					LoadingService.updateIsLoading(true);
				}
				var method = obj.method || service.method;
				var fn = function(data){
					if(data.code==0){
						if(obj.fn){
							obj.fn(data)
						}
					}else{
						var msg = data.message ? data.message :data.msg;
						AlertService.updateAlert({title:msg});
						if(obj.error){
							obj.error(data)
						}
					}
					if(obj.mark){
						LoadingService.updateIsLoading(false);
					}
				}
				if(method =='get'){
					$http.get(obj.url).success(fn);
				}else if(method=='post'){
					$http.post(obj.url,obj.data).success(fn);
				}
			},
			setBaseTitle:function(oid){
				if(!service.documentTitle){
					service.request({
						url:service.url.user_url+'?a=user_is_bind&openid='+oid,
						method:'get',
						fn:function(data){
							if(data.code==0 && data.data && data.data.nickName){
								document.title = service.documentTitle = data.data.nickName+'的全球购e商城';
							}
						}
					})
				}else{
					document.title = service.documentTitle
				}
			},
			updateAlert:function(str){
				AlertService.updateAlert({title:str});
			}
		}
		return service;
	}
])

/**
* 商城首页service服务
*/ 
OrangeServiceModule.service('MainService',[
	'$rootScope',
	'BaseService',
	'ShopService',
	'myScrollService',
	'WXShareService',
	function($rootScope,BaseService,ShopService,myScrollService,WXShareService){
		
		var service = {
			pageOffset:1,
			onClickShopTypeId:undefined,
			isLoadMore:true,
			isLoading:false,
			typelist:[],
			shoplist:[],
			// shopCarList:[],
			/**
			* 获取商品分类
			*/
			getShopTypeList:function(){
				BaseService.request({
					url:BaseService.url.index_url+'?a=index',
					mark:true,
					fn:function(data){
						service.typelist = data.data;
						if(data.data.length){
							var id = service.onClickShopTypeId
							if(!id){
								id = data.data[0]['categoryId'];
							}
							service.getDataByTypeId(id);
						}
					}
				})
			},
			/**
			* 更新商品分类
			*/
			updateShopTypeId:function(id){
				if(id == service.onClickShopTypeId) return;
				service.getDataByTypeId(id);
			},
			/**
			* 根据商品分类Id获取对应商品列表数据
			*/
			getDataByTypeId:function(id){
				service.onClickShopTypeId = id; 
				service.reset();
				service.loadMore();
				$rootScope.$broadcast('ShopTypeId.update');	
			},
			/**
			* 增加商品数量
			*/ 
			onAddNumber:function(index){
				myScrollService.addProduct(index);
				var cList = ShopService.shopCarList,
					len = cList.length,
					id = service.shoplist[index]['productId'];
				var j=0;
				for (var i = 0;i < len; i++) {
					if(id!=cList[i]['productId']){
						j++
					}else{
						cList[i]['number']++;
						break;
					}
				};
				if(j==len){
					cList.push(service.shoplist[index])
					cList[cList.length-1]['number']++;
				}
				ShopService.getShopCarSumNumber();
			},
			/**
			* 减少商品数量
			*/ 
			onSubNumber:function(index){
				var cList = ShopService.shopCarList,
					len = cList.length,
					id = service.shoplist[index]['productId'],
					isHas = false;
				for (var i = 0,j=0; i < len; i++) {
					if(id==cList[i]['productId']){
						cList[i]['number']--;
					}
				};
				ShopService.getShopCarSumNumber();
			},
			/**
			*	下拉加载更多数据
			*/ 
			loadMore:function(){
				if(service.isLoading || !service.isLoadMore) return;
				service.isLoading = true;
				BaseService.request({
					url:BaseService.url.product_url+'?a=category_product_paging&page='+service.pageOffset+'&cid='+service.onClickShopTypeId,
					mark:true,
					fn:function(data){
						/**
						* 判断是否还是分页
						*/
						if(data.data.pageOffset >= data.data.totalPage){
							service.isLoadMore = false;
						}
						if(data.code==0){
							data = data.data.datas;
							var cList = ShopService.shopCarList,
								len = cList.length,
								datalen = data.length;
							if(len>0){
								for(var i=0;i<datalen;i++){									
									delete data[i]['$$hashKey'];
									delete data[i]['$index'];
									var did = data[i]['productId'];
									for(var j=0;j<len;j++){
										var cid = cList[j]['productId'];
										if(did == cid){
											delete cList[j]['$$hashKey']; //框架生成的值，如果不删除操作时js会报错
											data[i] = cList[j];
											break;
										}
									}
									service.shoplist.push(data[i])
								}
							}else{
								for(var i=0;i<datalen;i++){
									service.shoplist.push(data[i])
								}
							}
							$rootScope.$broadcast('ShopList.update');
						}
						service.pageOffset++;
						service.isLoading = false;
						myScrollService.scrollLoad();
					}
				})
			},
			/**
			* 初始化
			*/
			init:function(){
				/**
				* 默认加载购物车，显示数量
				*/
				
				if(!ShopService.IS_GLOBAL_LOAD){
					ShopService.getShopCarList();
				}else{
					ShopService.getShopCarSumNumber();
				}
				/**
				* 获取商品分类与对应分类下的商品列表
				*/
				service.getShopTypeList();

				var oid =  $rootScope.$stateParams.oid;
				WXShareService.FXShow();
				WXShareService.FXhide2();
				var obj = { 
			    	APPShareTitle:"全球购e商城",
				    APPShareImg: BASEHTTP+'app/img/app_icon.png',
				    APPShareDes : "全网独家首发，主营德国、瑞典、丹麦等.欧美日韩顶级日化护理用品，仅需12元起即可享受高品质生活，成为三级微分销总代理（轻松月入2万）",
				    AppShareLink : BASEHTTP+"controller/shareAppFr.php?a=share_mall&share_id="+oid+"&rid="+$rootScope.$stateParams.rid
			    }
			    WXShareService.shareApp(obj);
			    WXShareService.shareFr(obj);
			    BaseService.request({
			    	url:BaseService.url.user_url+'?a=user_is_bind&openid='+oid,
			    	method:'get',
			    	fn:function(data){
						if(data.code==0 && data.data && data.data.nickName){
							document.title = data.data.nickName+'的全球购e商城';
							obj.APPShareImg = data.data.head;
							obj.APPShareTitle = data.data.nickName+"的全球购e商城" ;
						    WXShareService.shareApp(obj);
						    WXShareService.shareFr(obj);
						}
					}
			    })
				// OpenIdBindService.getBindUser(oid).success()
			},
			reset:function(){
				service.pageOffset=1;
				service.isLoadMore=true;
				service.shoplist=[];
			}
		}
		return service;
	}
]);
/**
* 商品搜索service服务
*/ 
// OrangeServiceModule.service('SearchService',[
// 	'$rootScope',
// 	'$http',
// 	'ShopService',
// 	'LoadingService',
// 	'myScrollService',
// 	function($rootScope,$http,ShopService,LoadingService,myScrollService){
// 		var service={
// 			IS_GLOBAL_LOAD:false,
// 			isShow:false,
// 			keyword:'',
// 			page:1,
// 			isLoadMore:true,
// 			isLoading:false,
// 			shoplist:[],
// 			/**
// 			* 更新显示状态后加载搜索的数据
// 			*/
// 			onUpdateToSearch:function(key){
// 				service.keyword = key;
// 				service.reset();
// 				service.loadMore();
// 			},
// 			/**
// 			*	下拉加载更多数据
// 			*/ 
// 			loadMore:function(){
// 				if(service.isLoading) return;
// 				if(service.isLoadMore){
// 					service.isLoading = true;
// 					LoadingService.updateIsLoading(true);
// 					$http.get('../controller/index.php?a=search_keyword&page='+service.page+'&keyword='+service.keyword+"&rid="+service.rid)
// 					.success(function(data){
// 						/**
// 						* 判断是否还是分页
// 						*/
// 						if(data.page >= Math.ceil(data.totalCount/data.pageSize)){
// 							service.isLoadMore = false;
// 						}
// 						if(data.code==0){
// 							data = data.data;
// 							var cList = ShopService.shopCarList,
// 								len = cList.length,
// 								datalen = data.length;
// 							if(len>0){
// 								for(var i=0;i<datalen;i++){									
// 									delete data[i]['$$hashKey'];
// 									delete data[i]['$index'];
// 									var did = data[i]['id'];
// 									for(var j=0;j<len;j++){
// 										var cid = cList[j]['id'];
// 										if(did == cid){
// 											delete cList[j]['$$hashKey']; //框架生成的值，如果不删除操作时js会报错
// 											data[i] = cList[j];
// 											break;
// 										}
// 									}
// 									service.shoplist.push(data[i])
// 								}
// 							}else{
// 								for(var i=0;i<datalen;i++){
// 									service.shoplist.push(data[i])
// 								}
// 							}
// 							$rootScope.$broadcast('SearchShopList.update');
// 						}
// 						service.page++;
// 						service.isLoading = false;
// 						LoadingService.updateIsLoading(false);
// 					})
// 				}
// 			},
// 			/**
// 			* 增加商品数量
// 			*/ 
// 			onAddNumber:function(index){
// 				myScrollService.addProduct(index);
// 				var cList = ShopService.shopCarList,
// 					len = cList.length,
// 					id = service.shoplist[index]['id'];
// 				var j=0;
// 				for (var i = 0;i < len; i++) {
// 					if(id!=cList[i]['id']){
// 						j++
// 					}else{
// 						cList[i]['number']++;
// 						// service.shoplist[index]['number']++;
// 						break;
// 					}
// 				};
// 				if(j==len){
// 					cList.push(service.shoplist[index])
// 					cList[cList.length-1]['number']++;
// 				}
// 				ShopService.getShopCarSumNumber();
// 			},
// 			/**
// 			* 减少商品数量
// 			*/ 
// 			onSubNumber:function(index){
// 				var cList = ShopService.shopCarList,
// 					len = cList.length,
// 					id = service.shoplist[index]['id'],
// 					isHas = false;
// 				for (var i = 0,j=0; i < len; i++) {
// 					if(id==cList[i]['id']){
// 						cList[i]['number']--;
// 					}
// 				};
// 				ShopService.getShopCarSumNumber();
// 			},
// 			reset:function(){
// 				service.page=1;
// 				service.isLoadMore=true;
// 				service.shoplist=[];
// 			}
// 		};
// 		return service;
// 	}
// ])

/**
* 购物车service服务
*/ 
OrangeServiceModule.service('ShopService',[
	'$rootScope',
	"$http",
	'BaseService',
	'MyAddressService',
	'WXShareService',
	function($rootScope,$http,BaseService,MyAddressService,WXShareService){
		var service ={
			IS_GLOBAL_LOAD:false,
			isShow:true,
			sumPrice:0,
			shopCarList:[],
			sumNumber:0,
			AddressInfo:{},
			Remark:{aid:''},
			/**
			* 初始化
			*/
			init:function(){
				/**
				* 加载收货地址详情以及更新到views
				*/
				var oid = $rootScope.BaseOpenID = $rootScope.$stateParams.oid;
				BaseService.setBaseTitle(oid);
				WXShareService.FXhide();
				service.getShopCarList(function(){
					if(service.shopCarList.length){
						if(MyAddressService.AddressInfo.addressId){
						 	service.AddressInfo = MyAddressService.AddressInfo;
						 	service.Remark.aid = MyAddressService.AddressInfo.addressId;
						 	$rootScope.$broadcast('shopAddress.update');
						} else {
							BaseService.request({
								url:BaseService.url.address_url+'?a=get_default_address',
								method:'get',
								mark:true,
								fn:function(data){
									if(data.data){
										MyAddressService.AddressInfo = service.AddressInfo = data.data;
							 			service.Remark.aid = data.data.addressId;
							 			$rootScope.$broadcast('shopAddress.update');
							 		}
								}
							})  
						}
					}
				});
			},
			/**
			* 获取商品购物车数据
			*/ 
			getShopCarList:function(fn){
				BaseService.request({
					url:BaseService.url.shopcart_url+'?a=index',
					method:'get',
					fn:function(data){
						if(data.code==0){
							service.shopCarList = data.data;
							service.updateShopCarList(service.shopCarList);
							service.IS_GLOBAL_LOAD = true;
							if(fn){
								fn(data);
							}
						}else {
							window.history.go(-1);
						}
					}
				})
			},
			//提交数据到购物车
			postShopCarList:function(obj){
				var data = service.shopCarList;
				var list = [] , res={};
				for(var i=0;i<data.length;i++){
					if(data[i]['number']){
						res={};
						
						res["productId"] = data[i]['productId']
						res["number"] = data[i]['number']
						res["profitPrice"] = data[i]['profitPrice']
						res["retailPrice"] = data[i]['retailPrice']
						res["marketPrice"] = data[i]['marketPrice']
						res["name"] = data[i]['name']
						res['thumbUrl'] = data[i]['thumbUrl']
						list.push(res);
					}
				}
				obj = obj || {};
				obj = angular.extend({
					url:BaseService.url.shopcart_url+'?a=add',
					method:'post',
					data:{sibudirectsale_mycart:JSON.stringify(list)}
				},obj);
				BaseService.request(obj);
			},
			/**
			* 购物车选好后在结算付款时加载快递方式以及计算运费
			*/
			shopSelectedOver:function(id){
				return $http.get('../controller/shopcart.php?a=shopcart_selected_over&aid='+id);
			},
			/**
			* get_express_list
			* 获取快递方式
			*/
			getExpressList:function(){
				return $http.get('../controller/express.php?a=get_express_list');
			},
			/**
		 	 * 计算运费
			 */
			calcOrderExpress:function(aid,eid){
				return $http.get('../controller/express.php?a=calc_order_express&aid='+aid+'&eid='+eid);
			},
			//获取购物车成功更新
			updateShopCarList:function(data){
				$rootScope.$broadcast('shopCarList.update');
				service.getShopCarSumNumber();
				service.getShopSumMoney();
			},
			//获取购物车总数量
			getShopCarSumNumber:function(){
				service.sumNumber = 0 //data.sum;
				for(var i=0;i<service.shopCarList.length;i++){
					service.sumNumber += service.shopCarList[i]['number'];
				}
				$rootScope.$broadcast('sumNumber.update');
			},
			//获取购物车总价格 
			getShopSumMoney:function(){
				var d = service.shopCarList,sum = 0;
				for(var i=0;i<d.length;i++){	
					sum += (d[i]['number']) * (d[i]['retailPrice'])
				}
				service.sumPrice=sum;
				$rootScope.$broadcast('sumMoney.update');
			},
			onAddNumber:function(index){
				service.shopCarList[index]['number']++;
				service.getShopSumMoney();
				service.postShopCarList();
			},
			onSubNumber:function(index){
				service.shopCarList[index]['number']--;
				service.getShopSumMoney();
				service.postShopCarList();
			},
			/**
			* 更新显示状态
			*/
			updateIsShow:function(obj){
				service.isShow = obj.show;
				$rootScope.$broadcast("shopShow.update");
				if(obj.apply){
					$rootScope.$apply();
				}
			}
		}

		return service
	}
])

/**
* 结算付款service服务
*/
OrangeServiceModule.service('PayService',[
	'$rootScope',
	'BaseService',
	'ShopService',
	'MyAddressService',
	'WXShareService',
	function($rootScope,BaseService,ShopService,MyAddressService,WXShareService){
		var service = {
			AddressInfo:{},
			expresses:[],
			Remark : {
				"aid":$rootScope.$stateParams.aid,
				"freight": 0,
				'express':'',
				"remark": ''
			},
			/**
			* 页面初始化
			*/
			init:function(){
				WXShareService.FXhide();
				var oid = $rootScope.BaseOpenID = $rootScope.$stateParams.oid;
				var aid = $rootScope.$stateParams.aid; 
				BaseService.setBaseTitle(oid);

				/**
				* 获取收货地址详情
				*/
				// if(MyAddressService.AddressInfo.id){
				// 	service.AddressInfo = MyAddressService.AddressInfo;
				// 	$rootScope.$broadcast("payAddress.update")
				// } else {
					BaseService.request({
						url:BaseService.url.address_url+'?a=get_address_detail&aid='+aid,
						method:'get',
						mark:true,
						fn:function(data){
							service.AddressInfo = data.data;
							$rootScope.$broadcast("payAddress.update");
						}
					});
				// }

				/**
				* 加载快递方式
				*/
				BaseService.request({
					url:BaseService.url.shopcart_url+'?a=shopcart_selected_over&aid='+aid,
					method:'get', 
					fn:function(data){
							data = data.data;

							if(data && data.expresses){
								service.Remark.freight = data.freight;
								service.expresses = data.expresses;
								/**
								* 显示默认快递方式
								*/ 
								for(var i=0;i<data.expresses.length;i++){
									if(data.expresses[i]['isDefault']){
										service.expresses.items = data.expresses[i];
										break;
									}
								}
								$rootScope.$broadcast("expressList.update");
							}
							
							service.calcOrderExpress();
					}
				})


				/**
				* 下单商品
				*/
				ShopService.getShopCarList(function(){
					if(!ShopService.shopCarList.length){
						window.history.go(-1)
					}
				}); 
			},
			/**
			* 计算快递的运费
			*/ 
			calcOrderExpress:function(){
				if(service.expresses && service.expresses.items){
					var eid = service.expresses.items.id;
					var name = service.expresses.items.name;
					service.Remark.express = name;

					BaseService.request({
						url:BaseService.url.express_url+'?a=calc_order_express&aid='+service.Remark.aid+'&eid='+eid,
						method:'get', 
						fn:function(data){
							service.Remark.freight = data.data;
							$rootScope.$broadcast("freight.update");
						}
					})

				}else{
					service.Remark.express = null;
					service.Remark.freight = 0;
					$rootScope.$broadcast("freight.update");
				}
			}
		}
		return service;
	}
])
/**
* 订单service服务
*/
OrangeServiceModule.service('OrderService',[
	'$rootScope',
	"$http",
	'LoadingService',
	'AlertService',
	function($rootScope,$http,LoadingService,AlertService){
		var service ={
			OrderList:[],
			OrderDateil:{},
			SellerOrderDateil:{},
			sendCode:null,
			isLoadMore:true,
			isLoading:false,
			page:1,
			/**
			* 提交新订单	
			*/ 
			postNewOrder:function(obj){
				return $http.post('../controller/order.php?a=submit_add_order',obj);
			},
			/**
			* 订单详情
			*/ 
			getOrderDetail:function(id,oid){
				if(id.substr(0,1) ==='M' || id.substr(0,1)==='m'){
					return $http.get('../controller/order.php?a=get_master_order_detail&oid='+id+'&openid='+oid);
				}else{
					return $http.get('../controller/order.php?a=get_order_detail&oid='+id+'&openid='+oid);
				}
			},
			/**
			* 取消订单
			*/
			onCancelOrder:function(id){
				return $http.get('../controller/order.php?a=cancel_order&oid='+id+'&pay_ref=order_pay');
			},
			/**
			* 订单列表
			*/ 
			getOrderList:function(){
				if(!service.isLoadMore || service.isLoading) return;
				service.isLoading = true;
				$http.get('../controller/order.php?a=list_order&page='+service.page)
				.success(function(data){
					if(data.page >= Math.ceil(data.totalCount/data.pageSize)){
						service.isLoadMore = false;
					}
					service.page++;
					for(var i=0;i<data.data.length;i++){
						service.OrderList.push(data.data[i])
					}
					// service.addressList = data.data;
					$rootScope.$broadcast('OrderList.update')
					service.isLoading =false;
				})
			},
			/**
			* 订单确认收货
			*/
			onReceivedOorder:function(id){
				return $http.get('../controller/order.php?a=received_order&oid='+id)
			},
			/**
			* 卖家销售的订单列表
			* parame @state 1=全部订单，
			*				2=卖家订单列表（待付款订单）
			*				3=卖家订单列表（待发货订单）
			*				4=卖家订单列表（已发货订单）
			*				5=卖家订单列表（已收货订单）
			*/ 
			getSellerOrderList:function(state){
				var type = 'list_seller_order';
				switch(state){
					case 1:
						type = 'list_seller_order';
						break;
					case 2:
						type = 'list_seller_waiting_pay'
						break;
					case 3:
						type = 'list_seller_waiting_deliver'
						break;
					case 4:
						type = 'list_seller_delivered'
						break;
					case 5:
						type = 'list_seller_received'
						break;
				}
				if(!service.isLoadMore || service.isLoading) return;
				LoadingService.updateIsLoading(true);
				service.isLoading = true;
				$http.get('../controller/sellerOrder.php?a='+type+'&page='+service.page)
				.success(function(data){
					if(data.page >= Math.ceil(data.totalCount/data.pageSize)){
						service.isLoadMore = false;
					}
					service.page++;
					for(var i=0;i<data.data.length;i++){
						service.SellerOrderList.push(data.data[i])
					}
					// service.addressList = data.data;
					$rootScope.$broadcast('SellerOrderList.update')
					service.isLoading =false;
					LoadingService.updateIsLoading(false);
				})
			},
			/**
			* 获取卖家订单详情
			*/
			getSellerOrderDetail:function(id){
				LoadingService.updateIsLoading(true);
				$http.get('../controller/sellerOrder.php?a=get_order_detail&oid='+id)
				.success(function(data){
					if(data.code==0){
						service.SellerOrderDateil = data.data;
						$rootScope.$broadcast('SellerDetail.update')
					}else{
						AlertService.updateAlert({title:data.message,apply:true});
					}
					LoadingService.updateIsLoading(false);
				});
			},
			/**
			* 卖家发货
			*/
			onSellerDeliver:function(obj){
				if(!obj.express){
					AlertService.updateAlert({title:"请选择快递方式",apply:true});
					return
				}
				console.log(obj);
				$http.post('../controller/sellerOrder.php?a=seller_deliver',obj)
				.success(function(data){
					console.log(data);
					if(data.code==0){
						window.history.go(-1);
					}
					AlertService.updateAlert({title:data.message,apply:true});
				})
			},
			/**
			* 获取扫码的值
			*/
			getSendCode:function(str){
				service.sendCode = str;
				$rootScope.$broadcast('sendCode.update');
				$rootScope.$apply();
			},
			reset:function(){
				service.OrderList=[];
				service.SellerOrderList=[];
				service.isLoadMore=true;
				service.isLoading=false;
				service.page=1;
			}
		}
		return service
	}
]);
/**
* 加载中LoadingService服务
*/ 
OrangeServiceModule.service('LoadingService',[
	'$rootScope',
	"$http",
	function($rootScope,$http){
		var service = {
			isLoading:false,
			updateIsLoading:function(key,bl){
				
				service.isLoading = key;
				$rootScope.$broadcast('isLoading.update');	
				if(bl){
					$rootScope.$apply();
				}
			}
		}
		return service;
	}
]);
/**
* 提示信息AlertService服务
*/ 
OrangeServiceModule.service('AlertService',[
	'$rootScope',
	"$http",
	'$timeout',
	function($rootScope,$http,$timeout){
		var service = {
			isShow:false,
			alertText:'',
			updateAlert:function(obj){
				var times = obj.times || 3000;
				service.isShow = true;
				service.alertText = obj.title;
				$rootScope.$broadcast('alert.update');

				if(!!obj.apply){
					$rootScope.$apply();
				}
				$timeout(function(){	
					service.isShow = false;
					service.alertText = '';
					$rootScope.$broadcast('alert.update');
				},times);
			}
		}
		return service;
	}
]);


/**
* 快速注册service服务
*/ 
// OrangeServiceModule.service('RegisService',[
// 	'$rootScope',
// 	'$http',
// 	'$window',
// 	function($rootScope,$http,$window){
// 		var service={
// 			isRegisShow:true,
// 			nextPage:'',
// 			nextPageParams:{},
// 			// 发送验证码
// 			getPhoneCode:function(tel){
// 				return $http.get('../controller/user.php?a=send_phone_code&phone='+tel);
// 			},
// 			//手机号码绑定微信openid
// 			getCodeBindByTel:function(tel,code,openid){
// 				return $http.get('../controller/user.php?a=wechat_bind_phone&oid='+openid+'&phone='+tel+'&code='+code);
// 			},
// 			updateRegisShow:function(key){
// 				// service.isRegisShow = key;
// 				// $rootScope.$broadcast("isRegisShow.updata");
// 				if(key){
// 					$('#regis-pos-header').show().height($(window).height())
// 				}else{
// 					$('#regis-pos-header').hide()
// 				}
// 			},
// 			updateNextParams:function(page,params){
// 				service.nextPage = page;
// 				service.nextPageParams = params;
				
// 			}
// 		}
// 		return service;
// 	}
// ]);
/**
* 判断是否绑定service服务
*/ 
OrangeServiceModule.service('OpenIdBindService',[
	'$rootScope',
	'$http',
	'LoadingService',
	'AlertService',
	function($rootScope,$http,LoadingService,AlertService){
		var service={
			IS_GLOBAL_BIND:false,
			// 验证用户是否绑定
			isVaildOpenIdBind:function(oid,page,obj) {
				if(!oid){
					AlertService.updateAlert({isShow:true,alertText:'获取openid错误,请重新进入！'});
					return;
				}
				if(!service.IS_GLOBAL_BIND){
					$http.get('../controller/user.php?a=user_is_bind&openid='+oid).success(function(data) {
						LoadingService.updateIsLoading(false);
						// console.log(data);
						if (data.code == 0) {
							$rootScope.$state.go(page, obj);
							service.IS_GLOBAL_BIND = true;
						} else if(data.code == 2){
							$rootScope.$state.go('regis', $rootScope.$stateParams);
						} else {
							if(page=='saleshop'|| page == 'sales'){
								window.location.href="../controller/oauth_userinfo.php?type="+page+'&fromid='+obj.fid+'&cid='+obj.cid;
							}else{
								window.location.href="../controller/oauth_userinfo.php?type="+page+'&fromid='+obj.fid;
							}
						}
					});
				}else{
					$rootScope.$state.go(page, obj);
				}
			},
			getBindUser:function(oid){
				return $http.get('../controller/user.php?a=user_is_bind&openid='+oid)
			},
			setBaseTitle:function(oid){
				$http.get('../controller/user.php?a=user_is_bind&openid='+oid)
				.success(function(data){
					if(data.code==0 && data.data && data.data.nickName){
						document.title = data.data.nickName+'的全球购e商城';
						// $rootScope.baseTitle = data.data.nickName+'的全球购e商城';
					}
				})
			}
			//
			// getWechatUser:function(){
			// 	return $http.get('../controller/user.php?a=get_wechat_user')
			// }
		}
		return service;
	}
]);
/** 
* 确认是否删除service服务 
*/
OrangeServiceModule.service('alertDeleteService',[
	'$rootScope',
	function($rootScope){
		var service={
			isShow:'',
			text:'',
			apply:true,
			addressId:'',
			updataShow:function(obj){
				service.isShow = obj.show;
				service.text = obj.text;
				$rootScope.$broadcast('alertdelete.update');
				if(obj.apply){
					$rootScope.$apply();
				}
			}
		}
		return service;
	}
])
/**
* 微信分享service服务 
*/
OrangeServiceModule.service('WXShareService',[
	'$rootScope',
	'$http',
	'$window',
	'OrderService',
	function($rootScope,$http,$window,OrderService){
		var wxshareService = {
			shareModel:{},
			config:{},
			img:'',
			/**
			 * 微信初始化
			 */
			init:function(){
				wx.ready(function () {
				    //这个img用来如果数据库里没有填写图片链接,则用第一张<img>标签的图片
				    var imgs = $("img");
				    if (imgs && imgs.length > 0 && imgs[0]) {
				    	wxshareService.img = $(imgs[0]).attr("src");
				    }
				    //shareModel.APPShareImg = this.img;
				});
			},
			/**
			 * 隐藏右上角菜单中的某些菜单
			 */
			FXhide:function () {
			    wx.ready(function () {
			    	wx.hideMenuItems({
			    	      menuList: [
			    	        'menuItem:share:appMessage', // 发送给朋友
			    	        'menuItem:share:timeline', // 分享到朋友圈
			    	        'menuItem:share:qq', // 分享到QQ
			    	        'menuItem:share:weiboApp', //分享到微博
			    	        'menuItem:copyUrl', //复制网页
			    	        'menuItem:openWithQQBrowser', // 在QQ浏览器中打开
			    	        'menuItem:openWithSafari' // 在Safari中打开
			    	      ],
			    	      success: function (res) {
			    	        //alert('已隐藏“阅读模式”，“分享到朋友圈”，“复制链接”等按钮');
			    	      },
			    	      fail: function (res) {
			    	        // alert(JSON.stringify(res));
			    	      }
			    	 });
			    });
			},
			FXhide2:function () {
			    wx.ready(function () {
			    	wx.hideMenuItems({
			    	      menuList: [
			    	        'menuItem:originPage',
			    	        'menuItem:copyUrl', //复制网页
			    	        'menuItem:openWithQQBrowser', // 在QQ浏览器中打开
			    	        'menuItem:openWithSafari' // 在Safari中打开
			    	      ],
			    	      success: function (res) {
			    	        //alert('已隐藏“阅读模式”，“分享到朋友圈”，“复制链接”等按钮');
			    	      },
			    	      fail: function (res) {
			    	        // alert(JSON.stringify(res));
			    	      }
			    	 });
			    });
			},

			/**
			 * 显示右上角菜单
			 */
			// FXShow:function () {
			//     wx.ready(function () {
			//         wx.showOptionMenu();
			//     });
			// },
			FXShow:function () {
			    wx.ready(function () {
			        wx.showMenuItems({
			    	      menuList: [
				    	        'menuItem:share:appMessage', // 发送给朋友
				    	        'menuItem:share:timeline', // 分享到朋友圈
				    	        'menuItem:share:qq', // 分享到QQ
				    	        'menuItem:share:weiboApp'//分享到微博
				    	      ],
				    	      success: function (res) {
				    	        //alert('已隐藏“阅读模式”，“分享到朋友圈”，“复制链接”等按钮');
				    	      },
				    	      fail: function (res) {
				    	        // alert(JSON.stringify(res));
				    	      }
				    	 });
			    });
			},

			//配置微信
			wxConfig:function (conf) {
			    wx.config({
			        debug: false, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
			        appId: conf.appId, // 必填，公众号的唯一标识
			        timestamp: conf.timestamp, // 必填，生成签名的时间戳
			        nonceStr: conf.nonceStr, // 必填，生成签名的随机串
			        signature: conf.signature,// 必填，签名，见附录1
			        jsApiList: [
			            'checkJsApi',
			            'onMenuShareTimeline',
			            'onMenuShareAppMessage',
			            'onMenuShareQQ',
			            'onMenuShareWeibo',
			            'hideMenuItems',
			            'showMenuItems',
			            'hideAllNonBaseMenuItem',
			            'showAllNonBaseMenuItem',
			            'onRecordEnd',
			            'openLocation',
			            'getLocation',
			            'hideOptionMenu',
			            'showOptionMenu',
			            'closeWindow',
			            'scanQRCode',
			            'chooseWXPay'
			        ] // 必填，需要使用的JS接口列表，所有JS接口列表见附录2
			    });
			},
			/**
			 * 分享到朋友圈
			 * @param shareModel
			 */
			shareApp:function(obj) {
				wxshareService.shareQQ(obj);
				wxshareService.shareWeibo(obj)
			    wx.ready(function () {
			        wx.onMenuShareAppMessage({
			            title: obj.APPShareTitle, // 分享标题
			            desc: obj.APPShareDes, // 分享描述
			            link: obj.AppShareLink, // 分享链接
			            imgUrl: obj.APPShareImg||wxshareService.img, // 分享图标
			            type: 'link', // 分享类型,music、video或link，不填默认为link
			            dataUrl: '', // 如果type是music或video，则要提供数据链接，默认为空
			            success: function (res) {
			                // 用户确认分享后执行的回调函数
			                wxshareService.weiKeShare();
			            },
			            cancel: function () {
			                // 用户取消分享后执行的回调函数
			            }
			        });
			    });
			},

			/**
			 * 分享给朋友
			 * @param shareModel
			 */
			shareFr:function(shareModel) {
			    wx.ready(function () {
			        //分享到朋友圈
			        wx.onMenuShareTimeline({
			            title: shareModel.APPShareTitle, // 分享标题
			            link: shareModel.AppShareLink, // 分享链接
			            imgUrl: shareModel.APPShareImg ||wxshareService.img, // 分享图标
			            success: function (res) {
			                // 用户确认分享后执行的回调函数
			                wxshareService.weiKeShare();
			            },
			            cancel: function () {
			                // 用户取消分享后执行的回调函数
			            }
			        });
			    });
			},

			/**
			 * 分享到QQ
			 * @param shareModel
			 */
			shareQQ:function(shareModel) {
			    wx.ready(function () {
			        //分享给QQ
			        wx.onMenuShareQQ({
			            title: shareModel.APPShareTitle, // 分享标题
			            desc: shareModel.APPShareDes, // 分享描述
			            link: shareModel.AppShareLink, // 分享链接
			            imgUrl: shareModel.APPShareImg ||wxshareService.img, // 分享图标
			            success: function () {
			                // 用户确认分享后执行的回调函数
			                wxshareService.weiKeShare();
			            },
			            cancel: function () {
			                // 用户取消分享后执行的回调函数
			            }
			        });
			    });
			},

			/**
			 * 分享到微博
			 * @param shareModel
			 */
			shareWeibo:function (shareModel) {
			    wx.ready(function () {
			        //发送到腾迅微博
			        wx.onMenuShareWeibo({
			            title: shareModel.APPShareTitle, // 分享标题
			            desc: shareModel.APPShareDes, // 分享描述
			            link: shareModel.AppShareLink, // 分享链接
			            imgUrl: shareModel.APPShareImg ||wxshareService.img, // 分享图标
			            success: function () {
			                wxshareService.weiKeShare();
			            },
			            cancel: function () {
			                // 用户取消分享后执行的回调函数
			            }
			        });
			    });
			},

			/**
			 * 分享之后回调函数
			 */
			weiKeShare:function() {
				if($rootScope.$stateParams.rid) {
					$http.get('../controller/shareAppFr.php?a=syntony_share&from_openid='+$rootScope.$stateParams.fid+'&now_openid='+$rootScope.$stateParams.oid+'&rid='+$rootScope.$stateParams.rid)
					.success(function(res){
					})
				} else {
					$http.get('../controller/shareAppFr.php?a=syntony_share&from_openid='+$rootScope.$stateParams.fid+'&now_openid='+$rootScope.$stateParams.oid+'&rid=e87d79dd-63cd-42fa-8b4c-45657c77938c')
					.success(function(res){
					})
				}
				
			},
			postConfig:function(){
				$http.post('../controller/shareAppFr.php?a=ajax_get_jsapi_config',{"share_url": window.location.href})
				.success(function(res){
					if (res.code == 0) {
						wxshareService.wxConfig(res.data);
						wxshareService.config = res.data;
		            }
				})
			},
			scanQRCode:function(fn){
				wx.scanQRCode({
			       	needResult: 1,
			       	desc: 'scanQRCode desc',
			       	success: function (res) {
			    	   	var code_res = res.resultStr;
				       	// var str= new Array();   
				       	var str = code_res.split(",")[1];
						OrderService.getSendCode(str);	
					}
		     	});
			}

		};
		return wxshareService;
	}
])

/**
* 促销系列service服务
*/
OrangeServiceModule.service('SalesService',[
	'$rootScope',
	'$http',
	'LoadingService',
	function($rootScope,$http,LoadingService){
		var service = {
			IS_GLOBAL_LOAD:false,
			isLoading:false,
			isLoadMore:true,
			SALESLIST:[],
			page:1,
			SALES_INFO:{},
			SALES_PRO:[],
			gotoPromotion:function(oid,cid){
				$http.get('../controller/promotion.php?a=goto_promotion&to_openid='+oid+'&promotion_id='+cid)
			},
			/**
			* 
			*/
			getSalesPage:function(cid){
				$http.get('../controller/promotion.php?a=get_promotion_detail&cid='+cid).success(function(data){
					if (data.code==0) {
						service.SALES_INFO = data.data;
						service.SALES_PRO = data.data.products;
						service.IS_GLOBAL_LOAD = true;
						$rootScope.$broadcast("sales.update");
					}
				});	
			},
			/**
			* 获取促销列表
			*/
			getPromotionList:function(){
				console.log(service.isLoading);
				console.log(!service.isLoadMore);
				if(service.isLoading || !service.isLoadMore) return;
				console.log(345);			
				service.isLoading = true;
				LoadingService.updateIsLoading(true);
				$http.get('../controller/promotion.php?a=promotion_list&page='+service.page)
				.success(function(data){
					if(data.page >= Math.ceil(data.totalCount/data.pageSize)){
						service.isLoadMore = false;
					}
					for(var i=0;i<data.data.length;i++){
						service.SALESLIST.push(data.data[i])
					}
					service.page++;
					service.isLoading = false;
					LoadingService.updateIsLoading(false);
					$rootScope.$broadcast('SALESLIST.update');
				})
			},
			/**
			* 促销下单
			*/
			postNewOrder:function(obj){
				return $http.post('../controller/promotion.php?a=post_promotion_order',obj);
			},
			reset:function(){
				service.isLoading=false;
				service.isLoadMore=true;
				service.SALESLIST=[];
				service.page=1;
			}
		};
		return service;
	}
])


//

OrangeServiceModule.service('RegisService',[
	'$rootScope',
	'$http',
	'AlertService',
	function($rootScope,$http,AlertService){
		var service={
			getCode:function(phone){
				$http.get('../controller/user.php?a=send_phone_code&phone='+phone)
				.success(function(data){
					if(data.code!=0){
						AlertService.updateAlert({title:msg});
					}
				})
			},
			regisUser:function(obj){
				$http.post('../controller/user.php?a=wechat_bind_phone',obj)
				.success(function(data){
					if(data.code==0){
						$rootScope.$state.go('main',$rootScope.$stateParams);
					}
					AlertService.updateAlert({title:msg});
				})
			}
		}
		return service;
	}
])












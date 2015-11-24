"use strict";

var OrangeDirectiveModule = angular.module('OrangeDirectiveModule',[
	'HomeDirective',
	'InComeDirectiveModule'
]);
// 正在加载中的遮罩directive指令
OrangeDirectiveModule.directive('loading',[function(){
	return{
		restrict:'EA',
		template:'<div class="loading-model" ng-if="isLoading"><img class="loading-img" src="./img/f110.png"></div>',
		replace:true,
		scope:{
			isLoading:"="
		}
	}
}]);
/**
* 提示信息directive指令
*/ 
OrangeDirectiveModule.directive('alert',[function(){
	return{
		restrict:'EA',
		template:'<div class="alert-message alert-danger animate-if" ng-if="isShow">{{alertText}}</div>',
		replace:true,
		scope:{ 
			alertText:"=",
			isShow :"=alertShow"
		}
	}
}]);

/**
* 首页左侧商品分类directive指令
*/ 
OrangeDirectiveModule.directive('mainShopType',[
	'$rootScope',
	"MainService",
	function($rootScope,MainService){
		return{
			restrict:'A',
			link:function(scope,el,attr){
				el.on('click',function(){
					var id = attr.mainShopType
					MainService.updateShopTypeId(id);
				})
			}
		}
	}
])

/**
* 搜索商品
*/
// OrangeDirectiveModule.directive('onSearchProduct',[
// 	'$rootScope',
// 	function($rootScope){
// 		return{
// 			restrict:"EA",
// 			link:function(scope,el,attr){
// 				$('button',el).on('click',function(){
// 					var key = $('input',el).val();
// 					if(!!key){
// 						$rootScope.$stateParams.key = key;
// 						$rootScope.$state.go('search',$rootScope.$stateParams);
// 					}
// 				});
// 				$('input',el).on('keyup',function(e){
// 					if(e.keyCode==13){
// 						var key = $(this).val();
// 						if(!!key){
// 							$rootScope.$stateParams.key = key;
// 							$rootScope.$state.go('search',$rootScope.$stateParams);
// 						}
// 					}
// 				})
// 			}
// 		}
// 	}
// ])
/**
* 页面底部directive指令
*/ 
OrangeDirectiveModule.directive('ulButtom',[
	'$rootScope',
	'$location',
	'OpenIdBindService',
	function($rootScope,$location,OpenIdBindService){
		return{
			restrict:'EA',
			templateUrl:'views/buttom.html',
			replace:true,
			scope:{ 
				openId:"="
			},
			link:function(scope,el,attr){
				var obj = $rootScope.$stateParams
				// var oid = scope.openId;
				var url = ($location.path());
				if(url.indexOf('/main/')>-1 || url.indexOf('/hot/')>-1){
					$(el[0]).find('li').eq(0).addClass('active').end().find('i').eq(0).addClass('active')
				}else if(url.indexOf('/order/')>-1){
					$(el[0]).find('li').eq(1).addClass('active').end().find('i').eq(1).addClass('active')
				}else if(url.indexOf('/home/')>-1){
					$(el[0]).find('li').eq(2).addClass('active').end().find('i').eq(2).addClass('active')
				} 
				$(el[0].children).on('click',function(){
					var page = $(this).attr('data-page');
					OpenIdBindService.isVaildOpenIdBind(obj.oid,page, obj)
				})
			}
		}
	}
])
/**
* 热销和分类tab
*/
OrangeDirectiveModule.directive("mainTab",[
	'$rootScope',
	'$location',
	function(root,location){
		return{
			restrict:'EA',
			templateUrl:'views/mall/main-tab.html',
			replace:true,
			link:function(scope,el,attr){
				var obj = root.$stateParams
				var url = (location.path());
				if(url.indexOf('/main/')>-1){
					$(el[0]).find('.tab-items').eq(1).addClass('active')
				}else if(url.indexOf('/hot/')>-1){
					$(el[0]).find('.tab-items').eq(0).addClass('active')
				}
				$(el[0].children).on('click',function(){
					var page = $(this).attr('data-page');
					console.log(page);
					root.$state.go(page,obj);
				})
			}
		}
	}
])
/**
* 点击底部购物车跳转directive指令
*/
OrangeDirectiveModule.directive('shopCarDirective',[
	"$rootScope",
	"ShopService",
	'OpenIdBindService',
	function($rootScope,ShopService,OpenIdBindService){
		return{
			restrict:'EA',
			link:function(scope,el,attr){
				el.bind('click',function(){
					var obj = $rootScope.$stateParams;
					ShopService.postShopCarList({
						mark:true,
						fn:function(data) {
							if (data.code==0) {
								OpenIdBindService.isVaildOpenIdBind(obj.oid,'shop',obj);
							}
						}
					})
				})
			}
		}
	}
])	
/**
* 购物车没有商品时，点击“去购物”
*/
OrangeDirectiveModule.directive('goMain',[
	'$rootScope',
	function($rootScope){
		return {
			restrict:'EA',
			link:function(scope,el,attr){
				el.on('click',function(){
					var obj = $rootScope.$stateParams;
					$rootScope.$state.go('main',obj)
				})
			}
		}
	}
]);
/**
* 首页查看商品详情directive指令
*/
OrangeDirectiveModule.directive('onClickItemProduct',[
	"$rootScope",
	function($rootScope){
		return {
			restrict:'EA',
			link:function(scope,el,attr){
				el.on('click',function(){
					$rootScope.$stateParams.ProductId = attr.onClickItemProduct
					$rootScope.$state.go('product',$rootScope.$stateParams)
				})
			}
		}
	}

])

/**
* 返回按钮的自定义指令
*/
OrangeDirectiveModule.directive('returnHistory',[
	'$rootScope',
	'$window',
	'$location',
	function($rootScope,$window,$location){
		return{
			restrict:'A',
			link:function(scope,el,attr){
				el.on('click',function(){
					$window.history.go(-1);
				})
			}
		}
	}
]);

/**
* 下拉加载更多directive指令
*/
OrangeDirectiveModule.directive('infiniteScroll', ['$window',function($window){
	return function(scope, element, attrs) {
		var raw = element[0];
		var win = $(window);
        angular.element($window).bind("scroll", function() {
			if (win.scrollTop()+win.scroll().height() >= raw.offsetHeight ) {
				scope.$apply(attrs.infiniteScroll);
			}
        });
    };
}])
/**
* 产品详情图片滚动的自定义指令
*/
OrangeDirectiveModule.directive('productHeadImage',['ProductService',function(ProductService){
	return {
		restrict:'AE',
		// template:'<div></div>',
		templateUrl:'productTemp.html',
		replace:true,
		transclude: false,
		link:function(scope,el,attr){
			scope.$on('ProductInfo.update',function(event){
				scope.ProductInfo = ProductService.ProductInfo;

				var image = scope.ProductInfo;
				if(image){
					var str = '',span='';
					var elem = document.getElementById('home_swipe_pic');
					for(var i=1;i<=5;i++){
						str+='<div><a href="javascript:void(0);"><img src="'+image["bannelThumb"+i]+'" alt="'+image["bannelThumb"+i]+'"></a></div>';
						span+='<span></span>';
					}
					elem.children[0].innerHTML = str;
					elem.children[1].innerHTML = span;
					$('.home-dou>span').eq(0).addClass('in')
			        var swipe = Swipe(elem,{
			            startSlide: 0,
			            continuous: true,
			            stopPropagation: true,
			            callback: function(index, element) {
			                $('.home-dou>span').removeClass('in');
			                $('.home-dou>span').eq(index).addClass('in');
			            },
			            transitionEnd: function(index, element) {}
			        });
				}
			});
		}
	}
}]);


/**
* 购物车选好了
*/ 
OrangeDirectiveModule.directive('chooseGood',[
	'$rootScope',
	'ShopService',
	'AlertService',
	function($rootScope,ShopService,AlertService){
		return {
			restrict:'EA',
			link:function(scope,el,attr){
				el.bind('click',function(){
					if(ShopService.sumPrice==0){
						AlertService.updateAlert({title:"购物车为空",apply:true});
						return
					}
					if(!scope.Remark.aid){
						AlertService.updateAlert({title:"请选择收货地址",apply:true});
						return
					}
					$rootScope.$stateParams.aid = scope.Remark.aid;
					$rootScope.$state.go('pay',$rootScope.$stateParams)
				})
			}
		}
	}
])
/**
* 查看订单详情
*/ 
OrangeDirectiveModule.directive('orderDateil',[
	'$rootScope',
	function($rootScope){
		return {
			restrict:'EA',
			link:function(scope,el,attr){
				el.bind('click',function(){
					$rootScope.$stateParams.pid = attr.pid
					$rootScope.$state.go('orderinfo',$rootScope.$stateParams)
				})
			}
		}
	}
])
/**
* 查看卖家订单详情
*/ 
OrangeDirectiveModule.directive('sellerOrderDateil',[
	'$rootScope',
	function($rootScope){
		return {
			restrict:'EA',
			link:function(scope,el,attr){
				el.bind('click',function(){
					$rootScope.$stateParams.pid = attr.sellerOrderDateil
					$rootScope.$state.go('sellerdetail',$rootScope.$stateParams)
				})
			}
		}
	}
])
/**
* 卖家发货时的扫码
*/ 
OrangeDirectiveModule.directive('iconQcode',[
	'$rootScope',
	'WXShareService',
	function($rootScope,WXShareService){
		return {
			restrict:'EA',
			link:function(scope,el,attr){
				el.bind('click',function(){
					WXShareService.scanQRCode()
				})
			}
		}
	}
])
/**
* 图片预加载
*/
OrangeDirectiveModule.directive('loadItemsSrc',[
	"$rootScope",
	function($rootScope,MyAddressService){
		return {
			restrict:"EA",
			link:function(scope,el,attr){
				$(el).attr('src','./img/d-pro.png');
				var img = new Image();
				img.src = attr.loadItemsSrc;
				img.onload=function(){
					$(el).attr('src',attr.loadItemsSrc);
				}
			}
		}
	}	
]);
/**
* 列表没有数据时的显示
*/
OrangeDirectiveModule.directive('noDataPic',[
	"$rootScope",
	function($rootScope,MyAddressService){
		return {
			restrict:"EA",
			template:'<div class="no-shop-items">'+
						'<div class="no-shop-img"><img src="./img/no_pic.png" alt=""></div>'+
						'<div class="no-shop-text"><span>暂无对应数据</span></div>'+
					'</div>',
			link:function(scope,el,attr){
				
			}
		}
	}
]);

/**
* 注册验证码
*/ 
OrangeDirectiveModule.directive('codeBtn',[
	"$rootScope",
	'RegisService',
	function($rootScope,regis){
		return {
			restrict:"EA",
			link:function(scope,el,attr){
				el.on('click',function(){
					var phone = scope.phone;
					regis.getCode(phone);
				})
				
			}
		}
	}
]);

OrangeDirectiveModule.directive('regisBtn',[
	"$rootScope",
	'RegisService',
	function($rootScope,regis){
		return {
			restrict:"EA",
			link:function(scope,el,attr){
				el.on('click',function(){
					var phone = scope.phone;
					var code = scope.code;
					var openid = $rootScope.$stateParams.oid;
					regis.regisUser({oid:openid,phone:phone,code:code});
				})
			}
		}
	}
]);

















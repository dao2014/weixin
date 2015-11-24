
"use strict";
var HomeControllerModule = angular.module('HomeControllerModule',[]);


/**
* 我的Controller控制器
*/
HomeControllerModule.controller('HomeController',[
	'$rootScope',
	'$scope',
	'ShopService',
	'MyAddressService',
	'OpenIdBindService',
	'WXShareService',
	'AgentService',
	function($rootScope,$scope,ShopService,MyAddressService,OpenIdBindService,WXShareService,AgentService){
		var oid = $rootScope.BaseOpenID = $rootScope.$stateParams.oid;
		$scope.isShowShareModel = false;//显示分享层
		$scope.isShowShare = function(){
			$scope.isShowShareModel = !$scope.isShowShareModel
		}
		
		$scope.isShow = true;
		$rootScope.$on("shopShow.update",function(){
			$scope.isShow = ShopService.isShow;
		});
		/**
		* 查看地址详情，隐藏地址列表，显示修改地址
		*/
		$scope.getAddressDetail = function(id,index){
			MyAddressService.updateNewAddressIsShow(true,id,index);
			MyAddressService.updateaAddressIsShow({show:false,apply:false});
		}

		/**
		* 获取用户头像信息
		*/

		WXShareService.FXShow();
		WXShareService.FXhide2();
	    var obj = {
	    		APPShareTitle: "全球购e商城",
			    APPShareImg: BASEHTTP+'app/img/app_icon.png',
			    APPShareDes : "全网独家首发，主营德国、瑞典、丹麦等.欧美日韩顶级日化护理用品，仅需12元起即可享受高品质生活，成为三级微分销总代理（轻松月入2万）",
			    AppShareLink :  BASEHTTP+"controller/shareAppFr.php?a=share_mall&share_id="+$rootScope.$stateParams.oid
		    }
	    WXShareService.shareApp(obj);
	    WXShareService.shareFr(obj);
		$scope.wechar={
			nickname:'暂无',
			headimgurl:'./img/d-head.png',
		}
		OpenIdBindService.getBindUser(oid).success(function(data){
			if(data.code==0 && data.data && data.data.nickName){
				$scope.wechar.nickname = data.data.nickName;
				$scope.wechar.headimgurl =data.data.head;
				document.title = $scope.wechar.nickname+'的全球购e商城';
				// $rootScope.baseTitle = $scope.wechar.nickname+'的全球购e商城';
				obj.APPShareTitle = $scope.wechar.nickname+"的全球购e商城";
				obj.APPShareImg = data.data.head;
			    WXShareService.shareApp(obj);
			    WXShareService.shareFr(obj);
			}
		})
		/**
		* 获取用户总用户数与总收益
		*/
		AgentService.getProfitStat().success(function(data){
			if(data.code==0){
				$scope.ProfitStat = data.data;
			}
		})
		/**
		* 默认加载购物车，显示数量
		*/
		if(!ShopService.IS_GLOBAL_LOAD){
			ShopService.getShopCarList();
		}else{
			ShopService.getShopCarSumNumber();
		}	
	}
]);
/**
* 我的资料Controller控制器
*/
HomeControllerModule.controller('MyInfoController',[
	'$rootScope',
	'$scope',
	'MyInfoService',
	function($rootScope,$scope,MyInfoService){
		$scope.IsAuthed=MyInfoService.IsAuthed;
		$scope.QrcodeBtn = MyInfoService.QrcodeBtn;
		MyInfoService.init();
		$rootScope.$on('myWechat.update',function(){
			$scope.wechat   = MyInfoService.wechat;
			$scope.IsAuthed = MyInfoService.IsAuthed;
			$scope.QrcodeBtn = MyInfoService.QrcodeBtn;
			var state = MyInfoService.AuthStatus 
			$scope.authText = state == 1 ?'实名认证审核中':(state==0?'':(state ==2 ? '实名认证审核成功':"审核失败，请重新提交申请")) ;
			$scope.wechat.code = '';
		});
		$scope.onReturn=function(){
			$rootScope.$state.go('home',$rootScope.$stateParams);
		}
	}
]);

/**
* 设置提现密码
*/
HomeControllerModule.controller('PasswordController',[
	'$rootScope',
	'$scope',
	'MyInfoService',
	function($rootScope,$scope,MyInfoService){
		MyInfoService.getUser();
		$rootScope.$on('myWechat.update',function(){
			$scope.wechat   = MyInfoService.wechat;
			$scope.wechat.code = '';
			$scope.wechat.dealpwd = '';
			$scope.wechat.sdealpwd = '';
		});
	}
])
/**
* 我的名片
*/
HomeControllerModule.controller('QrcodeController',[
	'$rootScope',
	'$scope',
	'MyInfoService',
	'WXShareService',
	function($rootScope,$scope,MyInfoService,WXShareService){
		MyInfoService.qrcodeInit();
		$scope.IsAuthed=MyInfoService.IsAuthed;
		WXShareService.FXShow();
		WXShareService.FXhide2();
		$scope.wechat={};
		var oid = $rootScope.$stateParams.oid;

		var obj = { 
	    	APPShareTitle:"我的微分销名片",
		    APPShareImg: BASEHTTP+'app/img/app_icon.png',
		    APPShareDes : "全网独家首发，主营德国、瑞典、丹麦等.欧美日韩顶级日化护理用品，仅需12元起即可享受高品质生活，成为三级微分销总代理（轻松月入2万）",
		    AppShareLink : BASEHTTP+"controller/shareAppFr.php?a=share_mall&share_id="+oid+"&rid="
	    }


		$rootScope.$on('myWechat.update',function(){
			$scope.IsAuthed = MyInfoService.IsAuthed;
			$scope.authText = MyInfoService.authText;
			// var state = MyInfoService.AuthStatus 
			// $scope.authText = state == 1 ?'实名认证审核中':(state==0?'请先实名认证':(state ==2 ? '实名认证审核成功':"审核失败，请重新提交申请")) ;
			$scope.wechat = MyInfoService.wechat;
			if($scope.wechat.head){
				if(!$scope.wechat.qrcode){
					$scope.wechat.oid = oid;
					MyInfoService.toCreateOauth($scope.wechat);
				}else{
					obj.APPShareImg = $scope.wechat.qrcode;
				    WXShareService.shareApp(obj);
				    WXShareService.shareFr(obj);
		    		$('#create-qrcode').remove();
				} 
			}
		});
		$rootScope.$on('createQrcode.update',function(){
			$scope.wechat.qrcode = MyInfoService.qrcode;
			obj.APPShareImg = $scope.wechat.qrcode;
		    WXShareService.shareApp(obj);
		    WXShareService.shareFr(obj); 
		    $('#create-qrcode').remove();
		})
	}
])

/**
* 我的代理Controller控制器
*/
HomeControllerModule.controller('AgentController',[
	'$rootScope',
	'$scope',
	'AgentService',
	'WXShareService',
	'LoadingService',
	function($rootScope,$scope,AgentService,WXShareService,LoadingService){


		LoadingService.updateIsLoading(true);
		/**
		* 我的代理以及滚动加载更多
		*/
		AgentService.getListAgentLevels();
		$rootScope.$on('AgentList.update',function(){
			$scope.agentlist = AgentService.AgentList;
		LoadingService.updateIsLoading(false);
		});
		WXShareService.FXhide();
	}
]);

/**
* 我的代理明细Controller控制器
*/
HomeControllerModule.controller('AgentInfoController',[
	'$rootScope',
	'$scope',
	'AgentService',
	'WXShareService',
	'LoadingService',
	function($rootScope,$scope,AgentService,WXShareService,LoadingService){

		LoadingService.updateIsLoading(true);
		/**
		* 我的代理明细
		*/
		AgentService.reset();
		var index = $rootScope.$stateParams.indexid;
		var key = $rootScope.$stateParams.key;
		if(key=='query'){
			$scope.AgentTitle = index==1?'一级代理':(index==2?'二级代理':'三级代理');
	 	}
		if(key=='search') {
			$scope.AgentTitle = index;
		}
	 	AgentService.getListAgentUser(index,key);
		$scope.loadMore = function(){
	 		AgentService.getListAgentUser(index,key);
		}
		$rootScope.$on('AgentUserList.update',function(){
			$scope.agentinfolist = AgentService.AgentUserList;

			LoadingService.updateIsLoading(false);
		});
		WXShareService.FXhide();
	}
]);



/**
* 我的代理收益明细Controller控制器
*/
HomeControllerModule.controller('AgentIncomeController',[
	'$rootScope',
	'$scope',
	'AgentService',
	'WXShareService',
	'LoadingService',
	function($rootScope,$scope,AgentService,WXShareService,LoadingService){
		
		LoadingService.updateIsLoading(true);
		AgentService.reset();
		var userId = $rootScope.$stateParams.userId;
		AgentService.getListUserProfits(userId);
		$scope.loadMore = function(){
			AgentService.loadMoreProfits();
		}
		$rootScope.$on('AgentIncom.update',function(){
			$scope.AgentIncom = AgentService.AgentIncom;

			LoadingService.updateIsLoading(false);
		})
		WXShareService.FXhide();
	}
])

/**
* 收货地址Controller控制器
*/
HomeControllerModule.controller('shopAddressController',[
	'$rootScope',
	'$scope',
	'MyAddressService',
	function($rootScope,$scope,MyAddressService){
		/**
		* 加载收货地址列表数据
		*/
		MyAddressService.reset();
		MyAddressService.getAddressList();
		$scope.loadMore=function(){
			MyAddressService.getAddressList();
		}
		$rootScope.$on('addressList.update',function(){
			$scope.address_list = MyAddressService.addressList
		});

		$scope.getAddressDetail=function(id,index){
			MyAddressService.getAddressInfo(id,index);
		}
		/**
		* 点击新增收货地址
		*/ 
		$scope.newAddress = function(){
			$rootScope.$state.go('editaddress')
		}
	}
]);
/**
* 新增或修改收货地址Controller控制器
*/ 
HomeControllerModule.controller('MyNewAddressController',[
	'$rootScope',
	'$scope',
	'MyAddressService',
	'alertDeleteService',
	function($rootScope,$scope,MyAddressService,alertDeleteService){
		var aid =  $rootScope.$stateParams.addressid;
		$scope.isAddressEdit = false;

		$scope.editAddressInfo={
			addressId:'',
			contact:'',
			phone:'',
			province:'',
			city:'',
			area:'',
			provinceName:'',
			cityName:'',
			areaName:'',
			address:'',
			detail:'',
			isDefault:0
		}
		
		$scope.onChangeProvince= function(){
			$scope.editAddressInfo.areaName =null;
			$scope.editAddressInfo.cityName =null;
		}
		$scope.onChangeCity=function(){
			$scope.editAddressInfo.areaName =null;
		}
		/**
		* 是否默认收货地地状态切换
		*/
		$scope.onChangeGround=function(){
			if($scope.editAddressInfo.isDefault){
				$scope.editAddressInfo.isDefault = 0;
			}else{
				$scope.editAddressInfo.isDefault = 1;
			}
		};

		/**
		* 是否按ID删除地址
		*/
		$scope.onIsDeleteById = function(){
			alertDeleteService.updataShow({show:true,text:'是否删除收货地址'});
		}

		/**
		* 是否按ID删除地址
		*/
		$scope.onSureDeleteById = function(){
			var addressId = $scope.editAddressInfo.addressId;
			MyAddressService.onDeleteAddressById(addressId)
		}

		if(!aid){
			$scope.isAddressEdit = false;
			$scope.addressTitle = '新增收货地址';
			$scope.editAddressInfo.province = MyAddressService.province;
		}else{
			$scope.addressTitle = '修改收货地址';
	  		$scope.isAddressEdit = true;
	  		MyAddressService.getAddressDetail(aid);
	  		$rootScope.$on('editAddressInfo.update',function(){
	  			$scope.editAddressInfo = MyAddressService.editAddressInfo;
	  		})
		}	
	}
]);


/**
* 我的产品列表Controller控制器
*/
// HomeControllerModule.controller('ProductListController',[
// 	'$rootScope',
// 	'$scope',
// 	'ProductService',
// 	'WXShareService',
// 	function($rootScope,$scope,ProductService,WXShareService){
// 		ProductService.init();
// 		$scope.IsAuthed=ProductService.IsAuthed;//是否实名审核;
// 		$scope.IsAuthedText=ProductService.IsAuthedText;//实名审核中提示文本;
// 		$scope.productListType=[
// 			{id:1,name:'出售中'},
// 			{id:0,name:'已下架'},
// 			{id:3,name:'分类'}
// 		]

// 		$rootScope.$on('autoStatue.update',function(){
// 			$scope.IsAuthed=ProductService.IsAuthed;//是否实名审核;
// 			$scope.IsAuthedText=ProductService.IsAuthedText;//实名审核中提示文本;
// 		})
		
// 		*
// 		* 获取商品
		
// 		$scope.onClickTypeById=function(id){
// 			if(id==3){
// 				$rootScope.$state.go("producttype"); 
// 				return;
// 			}
// 			ProductService.reset();
// 			ProductService.onMyProductList(id);
// 			$scope.onClickStateId = id;
// 		}
// 		$scope.loadMore=function(){
// 			ProductService.onMyProductList($scope.onClickStateId);
// 		}
// 		$rootScope.$on('productList.update',function(){
// 			$scope.shoplist = ProductService.PRODUCTLIST
// 		})
// 		$scope.onClickTypeById(1);
// 		/**
// 		* 编辑产品跳转
// 		*/
// 		$scope.onEditProductInfo=function(id){
// 			$scope.$state.go('productedit',{ProductId:id})
// 		}
// 		WXShareService.FXhide();

// 	}
// ]);

/**
* 我的产品分类Controller控制器
*/
// HomeControllerModule.controller('ProductTypeController',[
// 	'$rootScope',
// 	'$scope',
// 	'ProductService',
// 	'alertDeleteService',
// 	'WXShareService',
// 	function($rootScope,$scope,ProductService,alertDeleteService,WXShareService){
	
// 		/**
// 		* 获取商品分类列表
// 		*/
// 		ProductService.getProductTypeList()
// 		$rootScope.$on('myTypeList.update',function(){
// 			$scope.typelist = ProductService.TYPELIST;
// 		})

// 		/**
// 		* 新增或修改model对话框
// 		*/
// 		$scope.onNewTypeModel=function(){
// 			ProductService.updateTypeModel({show:true})
// 		}
// 		/**
// 		* 编辑商品分类
// 		*/
// 		$scope.onEditType = function(id){
// 			ProductService.updateTypeModel({show:true,id:id})
// 		}
// 		/**
// 		* 否是删除商品分类
// 		*/
// 		var _deleteid
// 		$scope.onDeleteType =function(id){
// 			_deleteid = id;
// 			alertDeleteService.updataShow({show:true,text:'否是删除商品分类！'});
// 		}
// 		/**
// 		* 确定删除分类
// 		*/
// 		$scope.onSureDeleteById=function(){
// 			ProductService.onDeleteType(_deleteid)
// 		}
// 		WXShareService.FXhide();
// 	}
// ])

/**
* 产品分类弹出框Controller控制器
*/
// HomeControllerModule.controller('ProductTypeModel',[
// 	'$rootScope',
// 	'$scope',
// 	'ProductService',
// 	function($rootScope,$scope,ProductService){
// 		$scope.isShow = false;
		
// 		$rootScope.$on('typeModel.update',function(){
// 			$scope.model=ProductService.model;
// 			$scope.isShow = ProductService.updateTypeShow
// 		})
// 	}
// ])
/**
* 产品编辑Controller控制器
*/
// HomeControllerModule.controller('ProductEditController',[
// 	'$rootScope',
// 	'$scope',
// 	'ProductService',
// 	'AlertService',
// 	'WXShareService',
// 	function($rootScope,$scope,ProductService,AlertService,WXShareService){
// 		var ProductId = $rootScope.$stateParams.ProductId;
// 		$scope.isClassesShow=false;
// 		/**
// 		* 产品信息
// 		*/
// 		$scope.editProductInfo={
// 			headline:'',
// 			brand:'',
// 			weight:'',
// 			unit:'',
// 			efficacy:'',
// 			retailPrice:'',
// 			marketPrice:'',
// 			profitPrice:0,
// 			image_list:'',
// 			desc:'',
// 			upFlag:1,//是否上架
// 			classes:'',//分类名称
// 			mcateid:''//分类id
// 		}
// 		/**
// 		* 商品图片
// 		*/
// 		$scope.imageQueue = [];
// 		/**
// 		* 商品描述图片
// 		*/
// 		$scope.imageDseQueue = [];

// 		if(ProductId=='add'){
// 			$scope.ProductStateName="添加产品";
// 		}else{
// 			$scope.ProductStateName="编辑产品";
// 			ProductService.getMyProductDetail(ProductId);
// 		}
// 		$rootScope.$on('PRODUCTINFO.updata',function(){

// 			var str=ProductService.PRODUCTINFO.desc;
// 			// var re=/src=\"([^\"]*?)\"/gi
// 			var re = /src="([^"]*)"/g; 
// 			var list=str.match(re);
// 			for(var i= 0;i<list.length;i++)
// 			{
// 				$scope.imageDseQueue.push(list[i].replace(/src=\"/g,'').replace(/\"/g,''))
// 			}

			
// 			$scope.imageQueue = ProductService.PRODUCTINFO.images
// 			$scope.editProductInfo = ProductService.PRODUCTINFO;
// 			$scope.editProductInfo.proid = ProductService.PRODUCTINFO.id
// 			$scope.editProductInfo.mcateid = ProductService.PRODUCTINFO.categoryId;
// 		})
// 		ProductService.getProductTypeList()
// 		/**
// 		* 是否上架商品开关
// 		*/
// 		$scope.onChangeGround=function(){
// 			$scope.editProductInfo.upFlag = Number(!$scope.editProductInfo.upFlag)
// 		}
// 		/**
// 		* 显示选择商品分类
// 		*/
// 		$scope.def={}
// 		$rootScope.$on('myTypeList.update',function(){
// 			$scope.ClassesItems = ProductService.TYPELIST;
// 			var list = $scope.ClassesItems
// 			if(!list.length) return;
// 			for(var i=0;i<list.length;i++){
// 				if(list[i]['id']==$scope.editProductInfo.mcateid){
// 					$scope.def.ClassesIndex = i;
// 					break;
// 				}			
// 			}
// 			if(i==list.length){
// 				$scope.def.ClassesIndex = 0;
// 			}
// 			$scope.editProductInfo.classes = $scope.ClassesItems[$scope.def.ClassesIndex]['name']
// 			$scope.editProductInfo.mcateid = $scope.ClassesItems[$scope.def.ClassesIndex]['id'];
// 			$scope.def.ClassesChooseId = $scope.editProductInfo.mcateid
// 		})
// 		$scope.onChooseClassesIsShow = function(){
// 			$scope.isClassesShow = !$scope.isClassesShow;
// 		}
// 		$scope.onChooseClassse = function(id,index){
// 			$scope.def.ClassesIndex = index;
// 			$scope.def.ClassesChooseId = id;
// 		}
// 		$scope.onClooseOk = function(){
// 			var index = $scope.def.ClassesIndex 
// 			$scope.editProductInfo.classes = $scope.ClassesItems[index]['name']
// 			$scope.editProductInfo.mcateid = $scope.ClassesItems[index]['id']
// 			$scope.onChooseClassesIsShow();
// 		}
// 		/**
// 		* 新增或修改model对话框
// 		*/
// 		$scope.onNewTypeModel=function(){
// 			ProductService.updateTypeModel({show:true})
// 		}

// 		/**
// 		* 删除商品图片
// 		*/
// 		$scope.removeImageQueue=function(index){
// 			var url = $scope.imageQueue[index];
// 			ProductService.ajax_delete_img({imagename:url})
// 			.success(function(data){
// 				if(data.code==0){
// 					$scope.imageQueue.splice(index,1);
// 				}else{
// 					AlertService.updateAlert({title:data.message});
// 				}
// 			}) 
// 		}
// 		/**
// 		* 删除商品描述图片
// 		*/
// 		$scope.removeImageDseQueue=function(index){
// 			var url = $scope.imageDseQueue[index];
// 			ProductService.ajax_delete_img({imagename:url})
// 			.success(function(data){
// 				if(data.code==0){
// 					$scope.imageDseQueue.splice(index,1);
// 				}else{
// 					AlertService.updateAlert({title:data.message});
// 				}
// 			}) 
// 		}
// 		WXShareService.FXhide();
// 	}
// ]);




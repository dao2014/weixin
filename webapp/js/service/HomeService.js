
"use strict";
var HomeService = angular.module('HomeService',[]);

/**
* 我的资料Service服务
*/
HomeService.service('MyInfoService',[
	'$rootScope',
	'$http',
	'BaseService',
	function($rootScope,$http,BaseService){
		var service={
			wechat:{},
			IsAuthed:false,
			QrcodeBtn:false,
			qrcode:'',

			qrcodeInit:function(){
				service.wechat={};

				$http.get('../controller/user.php?a=is_create_qrcode')
				.success(function(data){
					if(data.code==0){
						if(data.data==1){
							service.IsAuthed = true;
							service.getUser();
						}else{
							service.IsAuthed = false;
							service.authText = data.message;
							$rootScope.$broadcast('myWechat.update');
						}
						// service.AuthStatus = data.data.AuthStatus;
					}
				})
				// service.userAuthStatus().success(function(data){
				// 	if(data.code==0){
				// 		service.AuthStatus = data.data.AuthStatus;
				// 		if(service.AuthStatus==2){
				// 			service.IsAuthed = true;
				// 			service.getUser();
				// 		}else{ 
				// 			$rootScope.$broadcast('myWechat.update');
				// 		}
				// 	}
				// })
			},
			init:function(){
				
				
				service.userAuthStatus().success(function(data){
					if(data.code==0){
						service.AuthStatus = data.data.AuthStatus;
						if(service.AuthStatus==1 || service.AuthStatus==2){
							service.IsAuthed = true;
						}
						service.getUser();
					}
				})
			},

			getUser:function(){
				var oid = $rootScope.$stateParams.oid;
				BaseService.request({
					url:BaseService.url.user_url+'?a=user_is_bind&openid='+oid,
					method:'get',
					fn:function(data){
						service.wechat = data.data;
						if((service.AuthStatus==1 || service.AuthStatus==2)&&data.data.qrcode==''){
							service.QrcodeBtn = true;
						}
						$rootScope.$broadcast('myWechat.update');
					}
				})
			}, 
			/**
			* 下发验证码
			*/
			sendAutoSms:function(tel,str){
				if(str=='auth'){
					return $http.get(BaseService.url.oauthUser_url+'?a=send_auth_sms&phone='+tel)
				}else{
					return $http.get(BaseService.url.oauthUser_url+'?a=send_dealpwd_sms')
				}
			},
			/**
			* 保存用户实名认证信息
			*/
			toSaveOauth:function(obj){
				// $('#create-qrcode').show();
				// $http.post(BaseService.url.oauthUser_url+'?a=update_auth',obj)
				// .success(function(data){
				// 	if(data.code==0){
						
				// 	}
					
				// })	
				BaseService.request({
					url:BaseService.url.oauthUser_url+'?a=update_auth',
					mark:true,
					method:'post',
					data:obj,
					fn:function(data){
						window.history.go(-1);
						BaseService.updateAlert(data.message);
					},
					error:function(){
						$('#create-qrcode').hide();
					}
				})
			},


			/**
			* 保存用户实名认证信息
			*/
			toCreateOauth:function(obj){
				BaseService.request({
					url:BaseService.url.oauthUser_url+'?a=create_qrcode',
					mark:true,
					method:'post',
					data:obj,
					fn:function(data){
						service.qrcode = data.data.qrcode_url;
						$rootScope.$broadcast('createQrcode.update');
					},
					error:function(){
						service.qrcode = '';
						$rootScope.$broadcast('createQrcode.update');
					}
				})
			},

			/**
			* 保存提现密码
			*/
			toSaveDealPsd:function(obj){
				BaseService.request({
					url:BaseService.url.oauthUser_url+'?a=update_dealpwd',
					mark:true,
					method:'post',
					data:obj,
					fn:function(data){
						BaseService.updateAlert(data.message);
						window.history.go(-1);
					}
				})
			},
			/**
			*	查看用户的实名状态、提现密码是否设置
			*/
			userAuthStatus:function(){
				return $http.get(BaseService.url.oauthUser_url+'?a=user_auth_status')
			}
		}
		return service;
	}
]);

/**
* 我的代理Service服务
*/

HomeService.service('AgentService',[
	'$rootScope',
	'$http',
	function($rootScope,$http){
		var service={
			page:1,
			isLoadMore:true,
			isLoading:false,
			AgentList:[],
			AgentUserList:[],
			AgentIncom:[],
			/**
			* 统计总代理数和总收益
			*/
			getProfitStat:function(){
				return $http.get('../controller/user.php?a=get_profit_stat')
			},
			/**
			* 获取用户代理层级列表
			*/
			getListAgentLevels:function(){
				$http.get('../controller/agent.php?a=list_agent_levels')
				.success(function(data){
					if(data.code==0){
						service.AgentList=data.data;
						$rootScope.$broadcast('AgentList.update');
					}
				})
			},
			/**
			* 获取用户代理层级列表
			*/
			getListAgentUser:function(index,keyword){
				if(service.isLoading || !service.isLoadMore) return ;
				service.isLoading = true;
				if(keyword=='query'){
					var url = '../controller/agent.php?a=list_agent_users&index='+index+'&page='+service.page;
				}else if(keyword=='search'){
					var url = '../controller/agent.php?a=search_agent&key='+index+'&page='+service.page;
				}
				$http.get(url)
				.success(function(data){
					if(data.code==0){
						if(data.page >= Math.ceil(data.totalCount/data.pageSize)){
							service.isLoadMore = false;
						}
						service.page++;
						for(var i=0;i<data.data.length;i++){
							service.AgentUserList.push(data.data[i])
						}
						// service.AgentUserList = data.data; //service.AgentUserList.concat(data.data);
						$rootScope.$broadcast('AgentUserList.update')
						service.isLoading =false;
					}
				})
			},
			/**
			* 获取某个代理的收益列表
			*/
			getListUserProfits:function(id){
				if(service.isLoading || !service.isLoadMore) return ;
				service.isLoading = true;
				$http.get('../controller/agent.php?a=list_user_profits&userId='+id)
				.success(function(data){
					if(data.code==0){
						if(data.page >= Math.ceil(data.totalCount/data.pageSize)){
							service.isLoadMore = false;
						}
						service.page++;
						// for(var i=0;i<data.data.length;i++){
						// 	service.AgentUserList.push(data.data[i])
						// }
						service.AgentIncom =service.AgentIncom.concat(data.data);
						$rootScope.$broadcast('AgentIncom.update')
						service.isLoading =false;
					}
				})
			},
			/**
			* 重置分页参数
			*/
			reset:function(){
				service.page=1;
				service.AgentUserList=[];
				service.AgentIncom=[];
				service.isLoadMore=true;
				service.isLoading=false;
			}
		}
		return service;
	}
]);


/**
* 我的代理明细Service服务
*/

HomeService.service('AgentInfoService',[
	'$rootScope',
	function($rootScope){
		var service={
			isShow:false,
			updateIsShow:function(obj){
				service.isShow = obj.show;
				$rootScope.$broadcast("AgentInfoService.update");
				if(obj.apply){
					$rootScope.$apply();
				}
			}
		}
		return service;
	}
]);

/**
* 收货地址service服务
*/ 
HomeService.service('MyAddressService',[
	'$rootScope',
	"$http",
	'BaseService',
	'CityData',
	'AlertService',
	function($rootScope,$http,BaseService,CityData,AlertService){
		var service ={
			AddressInfo:{},
			editAddressInfo:{},
			addressList:[],
			data : [],
			province:CityData,
			isShow:false,
			isNewShow:false,
			isEditId:null,
			isLoadMore:true,
			isLoading:false,
			page:1,
			/**
			* 获取用户默认地址
			*/ 
			getDefaultAddress:function(){
				return $http.get('../controller/address.php?a=get_default_address')
			},
			/**
			* 地址详情
			*/
			getAddressInfo:function(id,index){
				var page = $rootScope.$stateParams.type;
				if(page=='shop'){
					service.AddressInfo = service.addressList[index];
					window.history.go(-1);
				}else if(page=='home'){
					$rootScope.$state.go('editaddress',{addressid:id});
				}
			},
			/**
			* 获取收货地址列表
			*/ 
			getAddressList:function(){
				if(!service.isLoadMore || service.isLoading) return;
				service.isLoading = true;

				BaseService.request({
					url:BaseService.url.address_url+'?a=list_address&page='+service.page,
					method:'get',
					mark:true,
					fn:function(data){
						var data = data.data;
						if(data.pageOffset >= Math.ceil(data.totalRecord/data.pageSize)){
							service.isLoadMore = false;
						}
						service.page++;
						for(var i=0;i<data.datas.length;i++){
							service.addressList.push(data.datas[i])
						}
						$rootScope.$broadcast("addressList.update");
						service.isLoading =false;
					}
				})
			},
			/**
			* 获取收货地址详情
			*/ 
			getAddressDetail:function(id){
				BaseService.request({
					url:BaseService.url.address_url+'?a=get_address_detail&aid='+id,
					method:'get',
					mark:true,
					fn:function(data){
						data = data.data; 
						var province = data.province;
						var city = data.city;
						var district = data.district;
						service.editAddressInfo = data;


						data = service.editAddressInfo.province = service.province;
						var cities=[],areas=[];
						for(var i=0;i<data.length;i++){
							if(province==data[i]['name']){
								service.editAddressInfo.provinceName = data[i];
								cities = data[i]['cities'];
								break;
							}
						};
						for(var i=0;i<cities.length;i++){
							if(city == cities[i]['name']){
								service.editAddressInfo.cityName = cities[i];
								areas = cities[i]['areas'];
								break;
							}
						};
						for(var i=0;i<areas.length;i++){
							if(district == areas[i]['name']){
								service.editAddressInfo.areaName = areas[i];
								break;
							}
						};
						$rootScope.$broadcast('editAddressInfo.update')
					}
				})
				// return $http.get('../controller/address.php?a=get_address_detail&aid='+id)
			},
			/**
			* 删除收货地址
			*/
			onDeleteAddressById:function(id){
				BaseService.request({
					url:BaseService.url.address_url+'?a=delete_address&aid='+id,
					method:'get',
					mark:true,
					fn:function(data){
						window.history.go(-1);
						AlertService.updateAlert({title:data.message});
					}
				})
			},
			// 修改地址
			postEditAddress:function(ops){
				BaseService.request({
					url:BaseService.url.address_url+'?a=edit_address',
					method:'post',
					data:ops,
					mark:true,
					fn:function(data){
						window.history.go(-1);
						AlertService.updateAlert({title:data.message});
					}
				})
			},
			// 添加地址
			postNewAddress:function(ops){
				BaseService.request({
					url:BaseService.url.address_url+'?a=add_address',
					method:'post',
					data:ops,
					mark:true,
					fn:function(data){
						window.history.go(-1);
						AlertService.updateAlert({title:data.message | data.msg});
					}
				})
				// return $http.post('../controller/address.php?a=add_address',ops)
			},
			/**
			* 更新收货地址列表显示状态
			*/
			updateaAddressIsShow:function(obj){
				service.isShow = obj.show;

				if(!!obj.home){
					// ShopService.updateIsShow({show:!obj.show,apply:!!obj.apply});
				}
				$rootScope.$broadcast("addIsShow.update");
				if(!!obj.apply){
					$rootScope.$apply();
				}
			},
			/**
			* 更新新增或修改收货地址显示状态
			*/
			updateNewAddressIsShow:function(key,id,index){
				service.isNewShow = key;
				service.isEditId = id;
				service.isEditIndex = index;
				$rootScope.$broadcast("isNewShow.update");
			},

			/**
			* 本地更新收货地址数据
			*/ 
			updateAddressList:function(data){
				if(data){
					var list = service.addressList,
						len = list.length,
						updateid = data.id;
					for (var i = list.length - 1,j=0; i >= 0; i--) {
						if(list[i]['id']==updateid){
							list[i] = data;
							break;
						}
						j++;
					};
					if(j==len){
						list.push(data);
					}
				}
				// $rootScope.$broadcast("addressList.update");
			},
			/**
			* 删除本地收货地址数据
			*/
			deleteAddressByIndex:function(){
				service.addressList.splice(service.isEditIndex,1)
			},
			reset:function(){
				service.addressList=[];
				service.isLoadMore=true;
				service.isLoading=false;
				service.page=1;
			}
		}
		return service;
	}
]);

/**
* 产品service服务
*/
HomeService.service('ProductService',[
	'$rootScope',
	"ShopService",
	"$http",
	'LoadingService',
	'AlertService',
	'alertDeleteService',
	'MyInfoService',
	function($rootScope,ShopService,$http,LoadingService,AlertService,alertDeleteService,MyInfoService){
		var service ={
			sumPrice:0,
			ProductInfo:{},
			TYPELIST:[],
			PRODUCTLIST:[],
			HOT_PRODUCT : [], // 热销商品列表
			PRODUCTINFO:{},
			isLoadMore:true,
			isLoading:false,
			page:1,
			updateTypeShow:false,
			IsAuthed:false,
			IsAuthedText:'',
			model:{
				name:null,
				mcateid:''
			},
			init:function(){
				MyInfoService.userAuthStatus().success(function(data){
					if(data.code==0){
						if(data.data.AuthStatus==0){
							$rootScope.$state.go('myinfo',$rootScope.$stateParams);
						}else if(data.data.AuthStatus==1){
							service.IsAuthedText = '实名认证审核中，审核成功后可以添加产品。';
						}else if(data.data.AuthStatus==2){
							service.IsAuthed = true;
						}else if(data.data.AuthStatus==3){
							service.IsAuthedText = '实名认证失败，请重新提交审核';
						}
						$rootScope.$broadcast('autoStatue.update')
					}
				})
			},
			/**
			* 添加我的商品
			*/
			onAddMyProduct:function(obj){
				var _fn = function(data){
					if(data.code==0){
						window.history.go(-1);
					}
					AlertService.updateAlert({title:data.message});
				}
				if(!!obj.proid){
					$http.post('../controller/myProduct.php?a=edit_my_product',obj)
					.success(_fn)
				}else{
					$http.post('../controller/myProduct.php?a=add_product',obj)
					.success(_fn)
				}
			},
			/**
			* 获取我的产品列表
			*/
			onMyProductList:function(type){
				LoadingService.updateIsLoading(true);
				if(!service.isLoadMore || service.isLoading) return
				service.isLoading = true;
				$http.get('../controller/myProduct.php?a=list_my_up_product&upflag='+type)
				.success(function(data){
					if(data.code==0){

						if(data.page >= Math.ceil(data.totalCount/data.pageSize)){
							service.isLoadMore = false;
						}
						service.page++;
						for(var i=0;i<data.data.length;i++){
							service.PRODUCTLIST.push(data.data[i])
						}
					}
					$rootScope.$broadcast('productList.update')
					LoadingService.updateIsLoading(false);
					service.isLoading=false;
				})
			},
			/**
			* 获取编辑产品的详情
			*/

			getMyProductDetail:function(id){
				$http.get('../controller/myProduct.php?a=get_my_product_detail&proid='+id)
				.success(function(data){
					if(data.code==0){
						service.PRODUCTINFO = data.data;
					}else{
						AlertService.updateAlert({title:data.message});
					}
					$rootScope.$broadcast('PRODUCTINFO.updata')
				})
			},
			/**
			* 获取产品详情
			*/
			getProductById:function(pid){
				LoadingService.updateIsLoading(true);
				$http.get('../controller/product.php?a=one_product_detail&pid='+pid)
				.success(function(data){
					service.updateProduct(data);
					LoadingService.updateIsLoading(false);
				});
			},
			/**
			* 热销商品列表
			*/
			getHotProduct:function(){
				$http.get('../controller/product.php?a=hot_product')
				.success(function(data){
					if(data.code==0){
						service.HOT_PRODUCT = data.data.datas;
						$rootScope.$broadcast('hotProduct.update');
					}
				})
			},
			/**
			* 更新产品详情与购物车内商品比较数量，以购物车内数量为准
			*/
			updateProduct:function(data){
				var data = data.data;
					// productBean = data.productBean;
				var id=data.productId;
				var res = ShopService.shopCarList;
				for(var i=0,j=0;i<res.length;i++){
					if(id!=res[i]['productId']){
						j++
					}else{
						data.number = ShopService.shopCarList[i]['number'];
						ShopService.shopCarList[i] = data;
						data = ShopService.shopCarList[i];
						data.$index = i;
						break;
					}
				}
				if(j == res.length){
					data.number=0;
					data.$index = ShopService.shopCarList.length;
					ShopService.shopCarList.push(data);
				}
				service.ProductInfo = data;
				$rootScope.$broadcast('ProductInfo.update');
			},
			/**
			* 保存商品分类
			*/
			onSaveType:function(obj){
				var _fn = function(data){
					if(data.code==0){
						service.updateTypeModel({show:false})
						service.getProductTypeList();
					}	
					AlertService.updateAlert({title:data.message});
				}
				if(obj.mcateid){
					$http.post('../controller/myCategory.php?a=edit_my_category',obj)
					.success(_fn)
				}else{
					$http.post('../controller/myCategory.php?a=add_category',obj)
					.success(_fn)
				}
			},
			/**
			* 删除商品分类
			*/
			onDeleteType:function(id){
				$http.get('../controller/myCategory.php?a=delete_my_category&mcateid='+id)
				.success(function(data){
					if(data.code==0){
						alertDeleteService.updataShow({show:false,text:''});
						service.getProductTypeList();
					}	
					AlertService.updateAlert({title:data.message});
				})
			},
			/**
			* 获取商品分类列表
			*/
			getProductTypeList:function(){
				LoadingService.updateIsLoading(true);
				$http.get('../controller/myCategory.php?a=list_my_category')
				.success(function(data){
					if (data.code==0) {
						service.TYPELIST = data.data;
					};
					$rootScope.$broadcast('myTypeList.update');
					LoadingService.updateIsLoading(false);
				})
			},
			/**
			* 更新商品分类弹出框显示状态
			*/
			updateTypeModel:function(obj){
				var _fn = function(o){
					service.updateTypeShow = o.show;
					$rootScope.$broadcast('typeModel.update');
					if(o.apply){
						$rootScope.$apply();
					}
				}
				if(obj.id){
					$http.get('../controller/myCategory.php?a=get_my_category_detail&mcateid='+obj.id)
					.success(function(data){
						if(data.code==0){
							service.model = data.data
							service.model.mcateid = data.data.id
							_fn(obj)
						}else{
							AlertService.updateAlert({title:data.message});
						}
					})
				}else{
					service.model={
						name:null,
						mcateid:null
					}
					_fn(obj)
				}
			},
			/**
			* 删除上传的商品图片
			*/
			ajax_delete_img:function(obj){
				return $http.post('../controller/imageUpload.php?a=ajax_delete_img',obj)
			},

			reset:function(){
				service.PRODUCTLIST=[];
				service.isLoadMore=true;
				service.isLoading=false;
				service.page=1;
			}
		}
		return service
	}
]);

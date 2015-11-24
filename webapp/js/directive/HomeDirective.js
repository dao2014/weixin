
"use strict";
var HomeDirective = angular.module('HomeDirective',[
	'HomeService'
]);
/**
* 点击查看收货地址列表
*/
HomeDirective.directive('shopAddress',[
	"$rootScope",
	function($rootScope){
		return {
			restrict:"EA",
			link:function(scope,el,attr){
				el.bind('click',function(){
					// $('#shop-main').hide();
					$rootScope.$state.go('address',{type:attr.shopAddress})
					// MyAddressService.updateaAddressIsShow({show:true,apply:true,home:true});
				});
			}
		}
	}
]);

/**
* 默认头像
*/
HomeDirective.directive('defaultHeadImg',[
	'$rootScope',
	function($rootScope){
		return{
			restrict:"EA",
			link:function(scope,el,attr){
				if(el[0].src==''){
					el[0].src='./img/d-head.png';
				}
				el.bind('error',function(){
					el[0].src='./img/d-head.png';
				});
			}
		}
	}
])
/**
* 选择图片上传
*/
HomeDirective.directive('selectImageList',[
	'$rootScope',
	'ProductService',
	'AlertService',
	'LoadingService',
	function($rootScope,ProductService,AlertService,LoadingService){
		return {
			restrict:"EA",
			scope:{
				image:'=',
				list:'&'
			},
			link:function(scope,el,attr){
				$(el).on("change",function(e){
					LoadingService.updateIsLoading(true,true);
					var parent = $(this).closest('.product-image-group');
                    if(scope.image.length >= attr.list) return;
                	var data = new FormData;
					data.append(attr.name || 'mypic',e.target.files[0]);
				 	var xhr=new XMLHttpRequest();  
				   	
                    xhr.open('POST', attr.action , true);

                    xhr.onreadystatechange = function () {
                        if (xhr.readyState == 4 && xhr.status == 200) {
                            //上传完成了
                            var res = JSON.parse(xhr.responseText);
                            if(res.code==0){
                            	scope.image.push(res.data.pic);
								$('input[type="file"]',el).val('');
							}
							if (t1)  clearTimeout(t1); 
							LoadingService.updateIsLoading(false,true);
							AlertService.updateAlert({title:res.message,apply:true});
                        }
                    };
                    xhr.onerror = function (error) {
                    	console.log('error');
                    };
                    function connecttoFail() {  
					    if (xhr) { 
					        xhr.abort(); 
							AlertService.updateAlert({title:'上传失败！请重试',apply:true});
							LoadingService.updateIsLoading(false,true); 
						}	
					}
                    var t1 = setTimeout(connecttoFail, 30000); 
                    xhr.send(data);
                    return;
				});
			}
		}
	}
])
/**
* 点击查看我的代理
*/
HomeDirective.directive('showAgent',[
	'$rootScope',
	'AgentService',
	function($rootScope,AgentService){
		return{
			restrict:"EA",
			link:function(scope,el,attr){
				el.bind('click',function(){
					// AgentService.updateIsShow({show:true,apply:true,home:true});
					$rootScope.$state.go("agent",$rootScope.$stateParams);
				});
			}
		}
	}
])
/**
* 点击查看我的代理明细show-agent-info
*/
HomeDirective.directive('showAgentInfo',[
	'$rootScope',
	'AgentService',
	function($rootScope,AgentService){
		return{
			restrict:"EA",
			link:function(scope,el,attr){
				el.bind('click',function(){
					// $rootScope.$state.go("income")
					$rootScope.$stateParams.indexid = attr.showAgentInfo;
					$rootScope.$stateParams.key = 'query';
					$rootScope.$state.go("agentinfo",$rootScope.$stateParams);
				});
			}
		}
	}
])

/**
* 点击查看我的代理收益明细
*/
HomeDirective.directive('showAgentIncome',[
	'$rootScope',
	'AgentService',
	function($rootScope,AgentService){
		return{
			restrict:"EA",
			link:function(scope,el,attr){
				el.bind('click',function(){
					$rootScope.$stateParams.userId = attr.showAgentIncome;
					$rootScope.$state.go("agentincome",$rootScope.$stateParams);
				});
			}
		}
	}
]);
 
/**
* 我的产品分类表列
*/
HomeDirective.directive('onProductType',[
	'$rootScope',
	function($rootScope){
		return {
			restrict:'EA',
			link:function(scope,el,attr){
				el.on('click',function(){
					$rootScope.$state.go('producttype')
				})
			}
		}
	}
])
/**
* 我的产品表列
*/
HomeDirective.directive('onProductList',[
	'$rootScope',
	function($rootScope){
		return {
			restrict:'EA',
			link:function(scope,el,attr){
				el.on('click',function(){
					// var id = attr.onProductList
					$rootScope.$state.go('productlist',$rootScope.$stateParams);
				})
			}
		}
	}
])
/**
* 促销列表
*/
HomeDirective.directive('salesList',[
	'$rootScope',
	function($rootScope){
		return {
			restrict:'EA',
			link:function(scope,el,attr){
				el.on('click',function(){
					// var id = attr.onProductList
					$rootScope.$state.go('saleslist',$rootScope.$stateParams);
				})
			}
		}
	}
])
/**
* 跳转至促销详情
*/
HomeDirective.directive('goSalesPage',[
	'$rootScope',
	function($rootScope){
		return {
			restrict:'EA',
			link:function(scope,el,attr){
				el.on('click',function(){
					// var id = attr.onProductList
					$rootScope.$stateParams.cid = attr.goSalesPage;
					$rootScope.$state.go('sales',$rootScope.$stateParams);
				})
			}
		}
	}
])


/**
* 我的销售列表
*/
HomeDirective.directive('mySalesList',[
	'$rootScope',
	function($rootScope){
		return {
			restrict:'EA',
			link:function(scope,el,attr){
				el.on('click',function(){
					// var id = attr.onProductList
					$rootScope.$state.go('mysaleslist',$rootScope.$stateParams);
				})
			}
		}
	}
])


/**
* 搜索我的代理明细
*/
HomeDirective.directive('onSearchAgent',[
	'$rootScope',
	'AgentService',
	function($rootScope,AgentService){
		return{
			restrict:"EA",
			link:function(scope,el,attr){
				$('button',el).on('click',function(){
					var key = $('input',el).val();
					if(!!key){
						$rootScope.$stateParams.indexid = key;
						$rootScope.$stateParams.key = "search";
						$rootScope.$state.go('agentinfo',$rootScope.$stateParams)
					}
				});
				$('input',el).on('keyup',function(e){
					if(e.keyCode==13){
						var key = $(this).val();
						if(!!key){
							$rootScope.$stateParams.indexid = key;
							$rootScope.$stateParams.key = "search";
							$rootScope.$state.go('agentinfo',$rootScope.$stateParams)
						}
					}
				})
			}
		}
	}
])


/**
* 收货地址列表template
*/ 
HomeDirective.directive('addresslist',[
	'$rootScope',
	function($rootScope){
		return{
			restrict:"EA",
			templateUrl:'views/home/my_address_list.html',
			link:function(scope,el,attr){
			}
		}
	}
])

/**
* 新增收货地址template
*/ 
HomeDirective.directive('addressnew',[
	'$rootScope',
	function($rootScope){
		return{
			restrict:"EA",
			templateUrl:'views/home/add_address.html',
			link:function(scope,el,attr){
			}
		}
	}
])

/**
* 我的资料templateUrl模版
*/
HomeDirective.directive('myInfo',[
	'$rootScope',
	'MyInfoService',
	function($rootScope,MyInfoService){
		return{
			restrict:'EA',
			link:function(scope,el,attr){
				el.bind('click',function(){
					$rootScope.$state.go('myinfo',$rootScope.$stateParams);
				})
			}
		}
	}
]);
/**
* 获取实名认证和提现密码的验证码
*/
HomeDirective.directive('sendAuthSms',[
	'$rootScope',
	'MyInfoService',
	'AlertService',
	'$interval',
	function($rootScope,MyInfoService,AlertService,$interval){
		return {
			restrict:'EA',
			link:function(scope,el,attr){
				var isClick = false;
				el.bind('click',function(){
					if(isClick) return;
					isClick = true;
					var obj = scope.wechat;
					if(obj.phone==''){
						AlertService.updateAlert({title:"手机号码不能为空",apply:true});
						isClick = false;
						return 
					}
					var re = /^1\d{10}$/;
					if (!re.test(obj.phone)) {
						AlertService.updateAlert({title:"请输入正确的手机号码",apply:true});
						isClick = false;
						return ;
				    }
 					
				    var times = 60;
	                var s = $interval(function(){
	                    if(times==1){
	                        el.text('获取验证码');
	                        isClick =false;
	                    }
	                    el.html(times+'s重新获取');
	                    times--;
	                },1000,times);
                    el.html(times+'s重新获取');
                    times--;

					MyInfoService.sendAutoSms(obj.phone,attr.sendAuthSms)
					.success(function(data){
						AlertService.updateAlert({title:data.message});
					})
				})
			}
		}
	}
])

/**
* 保存实名认证
*/
HomeDirective.directive('saveMyInfo',[
	'$rootScope',
	'MyInfoService',
	'AlertService',
	function($rootScope,MyInfoService,AlertService){
		return{
			restrict:'EA',
			link:function(scope,el,attr){
				el.bind('click',function(){
					var obj = scope.wechat;
					if(obj.name==''){
						AlertService.updateAlert({title:"姓名不能为空",apply:true});
						return 
					}
					if(obj.phone==''){
						AlertService.updateAlert({title:"手机号码不能为空",apply:true});
						return 
					}
					var re = /^1\d{10}$/;
					if (!re.test(obj.phone)) {
						AlertService.updateAlert({title:"请输入正确的手机号码",apply:true});
						return ;
				    }
					if(obj.code==''){
						AlertService.updateAlert({title:"验证码不能为空",apply:true});
						return 
					}
					if(obj.wechat==''){
						AlertService.updateAlert({title:"微信号不能为空",apply:true});
						return 
					}
					var re = /(^[1-9]\d{5}[1-1]\d{0}[9-9]\d{0}[1-9]\d{1}((0[1-9])|(1[0-2]))(([0][1-9])|([1|2]\d)|3[0-1])\d{4}$)|(^[1-9]\d{7}((0[1-9])|(1[0-2]))((0[1-9])|([1|2]\d)|3[0-1])\d{3}$)|(^\d{16}([0-9])[x|X]$)/;
					if (!re.test(obj.idcard)) {
						AlertService.updateAlert({title:"请输入正确的身份证号",apply:true});
						return ;
				    }
					obj.oid = $rootScope.$stateParams.oid;
					obj.head = obj.head;
					MyInfoService.toSaveOauth(obj);
				})
			}
		}
	}
])


/**
* 保存实名认证
*/
// HomeDirective.directive('createQrcode',[
// 	'$rootScope',
// 	'MyInfoService',
// 	'AlertService',
// 	function($rootScope,MyInfoService,AlertService){
// 		return{
// 			restrict:'EA',
// 			link:function(scope,el,attr){
// 				el.bind('click',function(){
// 					var obj = scope.wechat;
// 					obj.oid = $rootScope.$stateParams.oid;
// 					obj.head = obj.head;
// 					MyInfoService.toCreateOauth(obj);
// 				})
// 			}
// 		}
// 	}
// ])

/**
* 保存提现密码
*/
HomeDirective.directive('saveDealPsd',[
	'$rootScope',
	'MyInfoService',
	'AlertService',
	function($rootScope,MyInfoService,AlertService){
		return{
			rectrict:'EA',
			link:function(scope,el,attr){
				el.bind('click',function(){
					var obj = scope.wechat;
					console.log(obj);
					if(obj.code==''){
						AlertService.updateAlert({title:"验证码不能为空",apply:true});
						return 
					}
					if(obj.dealpwd==''){
						AlertService.updateAlert({title:"提现密码不能为空",apply:true});
						return 
					}
					if(obj.dealpwd.length<6){
						AlertService.updateAlert({title:"请输入6位以上密码",apply:true});
						return 
					}
					if(obj.dealpwd!=obj.sdealpwd){
						AlertService.updateAlert({title:"确认密码输入错误，请重新输入",apply:true});
						return 
					}
					MyInfoService.toSaveDealPsd(obj);
				})
			}
		}
	}
])
/**
* 是否删除收货地址提示框template
*/
HomeDirective.directive('alertDelete',[
	'$rootScope',
	function($rootScope){
		return{
			restrict:'EA',
			template:'<div class="loading" ng-if="isShow">'+
				      '<div class="alert-delete">'+
				        '<div class="alert-text">{{text}}</div>'+
				        '<div class="btn-group">'+
				          '<a class="btn btn-no" delete-address-cancel>取消</a>'+
				          '<a class="btn btn-add" ng-click="onSureDeleteById()">确认</a>'+
				        '</div>'+
				      '</div>'+
				    '</div>',
			link:function(scope,el,attr){
			}
		}
	}
])

/**
* 跳转到我的名片
*/
HomeDirective.directive('myQrcode',[
	'$rootScope',
	function($rootScope){
		return {
			restrict:'EA',
			link:function(scope,el,attr){
				el.bind('click',function(){
					$rootScope.$state.go('qrcode',$rootScope.$stateParams);
				})
			}
		}
	}
])

/**
* 我的名片背景图
*/
HomeDirective.directive('qrcodeMainBg',[
	'$rootScope',
	function($rootScope){
		return {
			restrict:'EA',
			link:function(scope,el,attr){
				$(el[0]).height(($(window).height()-48))
			}
		}
	}
])

/**
* 新增或修改商品分类弹出框template
*/
HomeDirective.directive('newTypeModel',[
	'$rootScope',
	'ProductService',
	function($rootScope,ProductService){
		return{
			restrict:'EA',
			template:'<div class="loading" ng-if="isShow">'+
						'<div class="alert-delete" new-type-model-button>'+
						'</div>'+
					'</div>',
			link:function(scope,el,attr){
			}
		}
	}
])

/**
* 新增或修改商品分类弹出框 取消和保存操作
*/
HomeDirective.directive('newTypeModelButton',[
	'$rootScope',
	'ProductService',
	'AlertService',
	function($rootScope,ProductService,AlertService){
		return{
			restrict:'EA',
			template:'<div class="alert-text">'+
						'<input type="text" placeholder="分类名称" ng-model="model.name" value="{{model.name}}">'+	    	
				    '</div>'+
				    '<div class="btn-group">'+
			      		'<button class="btn btn-no" id="cancel-type">取消</button>'+
			  			'<a class="btn btn-add" id="ok-type" >保存</a>'+
				    '</div>',
			link:function(scope,el,attr){
				/**
				* 商品分类弹出框 取消事件 
				*/
				$('#cancel-type',el).bind('click',function(){
					ProductService.updateTypeModel({show:false,apply:true})
				});
				/**
				* 商品分类确认 取消事件 
				*/
				$('#ok-type',el).bind('click',function(){
					if(!scope.model.name){
						AlertService.updateAlert({title:"请输入分类名称!",apply:true});
						return;
					}
					ProductService.onSaveType(scope.model)

					// ProductService.updateTypeModel({show:false,apply:true})
				});
			}
		}
	}
])

/**
* 新增或修改商品
*/
HomeDirective.directive('onSaveProduct',[
	'$rootScope',
	'ProductService',
	'AlertService',
	function($rootScope,ProductService,AlertService){
		return {
			restrict:'EA',
			link:function(scope,el,attr){
				el.bind('click',function(){
					var re=/^([0-9]+|[0-9]+\.{0,1}[0-9]{1,2})$/;
					if(scope.editProductInfo.headline===''){
						AlertService.updateAlert({title:'请输入商品标题',apply:true});
						return
					}
					if(scope.editProductInfo.mcateid===''){
						AlertService.updateAlert({title:'请选择商品分类',apply:true});
						return
					}
					if(scope.editProductInfo.retailPrice==='' || !re.test(scope.editProductInfo.retailPrice)){
						AlertService.updateAlert({title:'请输入正确的商品价格',apply:true});
						return
					}
					if(scope.editProductInfo.marketPrice==='' || !re.test(scope.editProductInfo.marketPrice)){
						AlertService.updateAlert({title:'请输入正确的商品原价',apply:true});
						return
					}
					if(scope.editProductInfo.profitPrice==='' || !re.test(scope.editProductInfo.profitPrice)){
						AlertService.updateAlert({title:'请输入正确的商品利润',apply:true});
						return
					}
					if(scope.editProductInfo.efficacy===''){
						AlertService.updateAlert({title:'请输入产品描述和内容',apply:true});
						return
					}
					if(scope.imageQueue.length){
						scope.editProductInfo.image_list = scope.imageQueue.join(',');
					}else{
						AlertService.updateAlert({title:'至少上传一张商品图片',apply:true});
						return
					}
					if(scope.imageDseQueue.length){
						scope.editProductInfo.desc = scope.imageDseQueue.join(',');
					}
					ProductService.onAddMyProduct(scope.editProductInfo)
				})
			}
		}
	}
])
/**
* 新增或修改收货地址保存操作
*/
HomeDirective.directive('saveAddressBtn',[
	"$rootScope",
	'MyAddressService',
	'AlertService',
	function($rootScope,MyAddressService,AlertService){
		return {
			restrict:"EA",
			link:function(scope,el,attr){
				el.on('click',function(){
					if(scope.editAddressInfo.contact==''){
						AlertService.updateAlert({title:"名称不能为空",apply:true});
						return 
					}
					if(scope.editAddressInfo.phone==''){
						AlertService.updateAlert({title:"手机号码不能为空",apply:true});
						return 
					}
					var re = /^1\d{10}$/;
					if (!re.test(scope.editAddressInfo.phone)) {
						AlertService.updateAlert({title:"请输入正确的手机号码",apply:true});
						return ;
				    }
					if(!scope.editAddressInfo.provinceName ||scope.editAddressInfo.provinceName.name==''){
						AlertService.updateAlert({title:"请选择所在省",apply:true});
						return 
					}
					if(!scope.editAddressInfo.cityName ||scope.editAddressInfo.cityName.name==''){
						AlertService.updateAlert({title:"请选择所在市",apply:true});
						return 
					}
					if(!scope.editAddressInfo.areaName ||scope.editAddressInfo.areaName.name==''){
						AlertService.updateAlert({title:"请选择所在区",apply:true});
						return 
					}
					if(scope.editAddressInfo.detail==''){
						AlertService.updateAlert({title:"详细地址不能为空",apply:true});
						return 
					}
					var ops={
						aid:scope.editAddressInfo.addressId,
						name:scope.editAddressInfo.contact,
						tel:scope.editAddressInfo.phone,
						province:scope.editAddressInfo.provinceName.name,
						city:scope.editAddressInfo.cityName.name,
						district:scope.editAddressInfo.areaName.name,
						postCode:510000,
						detail:scope.editAddressInfo.detail,
						isDefault:scope.editAddressInfo.isDefault
					}
					if(!ops.aid){
						MyAddressService.postNewAddress(ops)
					}else{
						MyAddressService.postEditAddress(ops)
					}
				})
			}
		}
	}
])
/**
* 取消是否删除收货地址提示框操作
*/
HomeDirective.directive('deleteAddressCancel',[
	'$rootScope',
	'alertDeleteService',
	function($rootScope,alertDeleteService){
		return{
			restrict:'EA',
			link:function(scope,el,attr){
				el.bind('click',function(){
					alertDeleteService.updataShow({show:false,text:'',apply:true});
				});
			}
		}
	}
]);
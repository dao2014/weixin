"use strict";

var InComeServiceModule = angular.module('InComeServiceModule',[]);

/**
* 操作提现，收益，银行service
*/
InComeServiceModule.service('BankIncomeService',[
	'$rootScope',
	'$http',
	'BaseService',
	'LoadingService',
	'MyInfoService',
	function($rootScope,$http,BaseService,LoadingService,MyInfoService){
		var service={
			page:1,
			isLoadMore:true,
			isLoading:false,
			AllBank:[],
			AllMyBank:[],
			MyIncom:[],
			profit:{},
			IsAuthed:false,
			IsAuthedText:'',
			IsSetDealPwd:false,
			cashDetail:{},
			

			init:function(){
				MyInfoService.userAuthStatus().success(function(data){
					if(data.code==0){
						if(data.data.AuthStatus==0){
							$rootScope.$state.go('myinfo',$rootScope.$stateParams);
						}else if(data.data.AuthStatus==1){
							service.IsAuthedText = '实名认证审核中，审核成功后可以设置提现密码';
						}else if(data.data.AuthStatus==2){
							service.IsAuthed = true;
							if(!data.data.IsSetDealPwd){
								$rootScope.$state.go('password',$rootScope.$stateParams);
							}
						}else if(data.data.AuthStatus==3){
							service.IsAuthedText = '实名认证失败，请重新提交审核';
						}
						$rootScope.$broadcast('autoStatue.update')
					}
				})
			},
			/**
			* 获取所有银行卡列表
			*/
			getAllBank:function(){
				$http.get('../controller/userBank.php?a=get_all_bank')
				.success(function(data){
					if (data.code==0) {
						service.AllBank = data.data;
						$rootScope.$broadcast('AllBank.update');
					};
				})
			},
			/**
			* 获取所有银行卡列表
			*/
			getAllMyBank:function(){
				$http.get('../controller/userBank.php?a=my_bank_account')
				.success(function(data){
					if (data.code==0) {
						service.AllMyBank = data.data;
						$rootScope.$broadcast('AllMyBank.update');
					};
				})
			},
			/**
			* 我的收益和提现列表
			*/
			myProfitDeal:function(){
				
				if(service.isLoading || !service.isLoadMore) return ;
				service.isLoading = true;
				$http.post('../controller/profitDeal.php?a=my_profit_deal&page='+service.page)
				.success(function(data){
					if(data.code==0){
						if(data.page >= Math.ceil(data.totalCount/data.pageSize)){
							service.isLoadMore = false;
						}
						service.page++;
						for(var i=0;i<data.data.length;i++){
							data.data[i]['name'] = data.data[i]['tip'].split('：')[0] ;
							data.data[i]['userName'] = data.data[i]['tip'].split('：')[1] ;
							service.MyIncom.push(data.data[i])
						}
						// service.MyIncom =service.MyIncom.concat(data.data);
						service.profit = data;
						$rootScope.$broadcast('MyIncom.update');
						service.isLoading =false;
					}
				})
			},
			/**
			* 新增用户银行卡
			*/
			addUserAccount:function(obj){
				return $http.post('../controller/userBank.php?a=add_user_account',obj)
			},
			/**
			* 绑定银行卡时发送验证码
			*/
			sendPhoneCode:function(phone){
				return $http.get('../controller/userBank.php?a=send_phone_code&phone='+phone)
			},

			/**
			* 用户提现
			*/
			onUserDeal:function(obj){
				BaseService.request({
					url:'../controller/profitDeal.php?a=user_deal',
					method:'post',
					data:obj,
					mark:true,
					fn:function(data){
						service.updateCashAlert({text:data.message,code:0});
					}
				})
				// return $http.post('../controller/profitDeal.php?a=user_deal',obj)
			},
			/**
			* 我的提现详情
			*/
			myDealDetail:function(id,type){
				var url ;
				LoadingService.updateIsLoading(true);
				if (type==2) {
					url = '../controller/profitDeal.php?a=my_deal_detail&dl_id='+id;
				}else if(type==1){
					url = '../controller/profitDeal.php?a=my_profit_detail&pf_id='+id;
				}else if(type==3){
					url = '../controller/profitDeal.php?a=my_sales_detail&sales_id='+id;
				}			
				$http.get(url)
				.success(function(data){
					console.log(data);
					if (data.code==0) {
						service.cashDetail = data.data;
						service.cashDetail._type = type;
						$rootScope.$broadcast('isCashDetail.update');
						LoadingService.updateIsLoading(false);
					};
				})
			},
			updateCashAlert:function(obj){
				service.isCashText = obj.text;
				service.isCashError = obj.code===0?0:-1;
				$rootScope.$broadcast('isCashAlert.update');
				if(obj.apply){
					$rootScope.$apply();
				}
			},
			/**
			* 重置分页参数
			*/
			reset:function(){
				service.page=1;
				service.MyIncom=[];
				// service.AllMyBank=[];
				service.isLoadMore=true;
				service.isLoading=false;
			}

		}
		return service
	}
])
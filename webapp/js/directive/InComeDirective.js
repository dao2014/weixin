
"use strict";
var InComeDirectiveModule = angular.module('InComeDirectiveModule',[
]);


/**
* 点击查看我的收益
*/
InComeDirectiveModule.directive('onIncomeShow',[
	'$rootScope',
	function($rootScope){
		return{
			restrict:"EA",
			link:function(scope,el,attr){
				el.bind('click',function(){

					$rootScope.$state.go('income',$rootScope.$stateParams);
				})
			}
		}
	}
]);

/**
* 点击查看我的提现进度
*/
InComeDirectiveModule.directive('onIncomeDetail',[
	'$rootScope',
	'BankIncomeService',
	'LoadingService',
	function($rootScope,BankIncomeService,LoadingService){
		return {
			restrict:"EA",
			link:function(scope,el,attr){
				el.on('click',function(){
					// if(attr.onIncomeType==2){

						BankIncomeService.myDealDetail(attr.onIncomeDetail,attr.onIncomeType)
					// }
				})
			}
		}
	}
])

/**
* 提现金额
*/
InComeDirectiveModule.directive('changeMoney',[
	'$rootScope',
	function($rootScope){
		return {
			restrict:'EA',
			link:function(scope,el,attr){
				el.bind('keyup',function(){
					var re=/^\d+(\.\d+)?$/;
					if(!re.test(scope.money) || scope.money > scope.ProfitStat.TotalProfit){
						$('#get-cash-btn').addClass("Dis")
					}else{
						$('#get-cash-btn').removeClass("Dis")
					}
				})
			}
		}
	}
])

/**
* 点击确认提现
*/
InComeDirectiveModule.directive('getCashBank',[
	'$rootScope',
	'BankIncomeService',
	function($rootScope,BankIncomeService){
		return {
			restrict:'EA',
			link:function(scope,el,attr){
				el.bind('click',function(){
					var obj={};
					var re=/^\d+(\.\d+)?$/;
					if(!re.test(scope.money) || scope.money > scope.ProfitStat.TotalProfit){
						var isDis = true;
					}else{
						var isDis = false;
					}
					
					if(isDis) {
						BankIncomeService.updateCashAlert({text:'提现金额有误或超出可转出余额',apply:true})
						return
					};
					var _type = $rootScope.$stateParams.type;
					if(_type == 'bank' && !scope.BankInfo){
						BankIncomeService.updateCashAlert({text:'请选择提现银行卡',apply:true})
						return
					}

					if(scope.password==''){
						BankIncomeService.updateCashAlert({text:'请输入提现密码',apply:true})
						return
					}
					if(_type=='bank'){
						obj={
							'accountId':scope.BankInfo.id,
							'dealpwd':scope.password,
							'cny':scope.money
						}
					}else{
						obj={
							'cny':scope.money,
							'dealpwd':scope.password,
							'accountId':''
						}
					}
					BankIncomeService.onUserDeal(obj)
				})
			}
		}
	}
])
/**
* 跳转至绑定银行卡页
*/
InComeDirectiveModule.directive('onBindBank',[
	'$rootScope',
	function($rootScope){
		return{
			restrict:"EA",
			link:function(scope,el,attr){
				el.bind('click',function(){
					$rootScope.$state.go('bindbank');
				})
			}
		}
	}
])

/**
* 我绑定的银行卡列表template
*/
InComeDirectiveModule.directive('myBankList',[
	'$rootScope',
	function($rootScope){
		return{
			restrict:"EA",
			templateUrl:'views/home/mybanklist.html',
			link:function(scope,el,attr){
			}
		}
	}
])
/**
* 银行卡列表template
*/
InComeDirectiveModule.directive('bankList',[
	'$rootScope',
	function($rootScope){
		return{
			restrict:"EA",
			templateUrl:'views/home/banklist.html',
			link:function(scope,el,attr){
			}
		}
	}
])

/**
*绑定银行卡时点击获取验证码按钮
*/
InComeDirectiveModule.directive('sendPhoneCode',[
	"$interval",
	'BankIncomeService',
	'AlertService',
	function($interval,BankIncomeService,AlertService){
		return{
			restrict:'EA',
			link:function(scope,el,attr){
				var isClick=false
				el.on('click',function(){
					if(isClick) return;
						isClick = true;
					var tel = scope.bankInfo.phone;
					var re = /^1\d{10}$/;
					if(tel==''){
						AlertService.updateAlert({title:"手机号码不能为空",apply:true});
						isClick = false;
						return 
					}
					if (!re.test(tel)) {
						AlertService.updateAlert({title:"请输入正确的手机号码",apply:true});
						isClick = false;
						return ;
				    }
					var times = 60;
					el.css({  "background-color": "#c0c0c0"})
	                var s = $interval(function(){
	                    if(times==0){
	                    	console.log('re');
							el.css({  "background-color": "#ed6d00"})
	                        el.text('获取验证码');
	                        isClick =false;
	                    }
	                    el.html(times+'s重新获取');
	                    times--;
	                },1000,times);
                    el.html(times+'s重新获取');
                    times--;
					BankIncomeService.sendPhoneCode(tel).success(function(data){
						AlertService.updateAlert({title:data.message,apply:true});
					})
				})
			}
		}
		
	}
]);
/**
* 绑定银行卡保存操作
*/
InComeDirectiveModule.directive('bindBank',[
	'$rootScope',
	'BankIncomeService',
	'AlertService',
	'LoadingService',
	'$window',
	function($rootScope,BankIncomeService,AlertService,LoadingService,$window){
		return{
			restrict:'EA',
			link:function(scope,el,attr){
				el.on('click',function(){
					var obj = scope.bankInfo
					var bid = obj.bankId,
						tel = obj.phone,
						uname = obj.userName,
						ucard = obj.userCard,
						code = obj.smsVerify;
				    if(bid==''){
						AlertService.updateAlert({title:"请选择银行",apply:true});
						return ;
					}
				    if(uname==''){
						AlertService.updateAlert({title:"请输入持卡人姓名",apply:true});
						return ;
					}

					var re=/^[0-9]*$/;
					if(!re.test(ucard)){
						AlertService.updateAlert({title:"请输入正确的卡号",apply:true});
					}
				    if(ucard==''){
						AlertService.updateAlert({title:"请输入卡号",apply:true});
						return ;
					}
				    if(ucard!=obj.scard){
						AlertService.updateAlert({title:"确认卡号输入有误，请重输!",apply:true});
						return ;
					}
					var re = /^1\d{10}$/;
					if(tel==''){
						AlertService.updateAlert({title:"手机号码不能为空",apply:true});
						return ;
					}
					if (!re.test(tel)) {
						AlertService.updateAlert({title:"请输入正确的手机号码",apply:true});
						return ;
				    }
				    if(code==''){
						AlertService.updateAlert({title:"验证码不能为空",apply:true});
						return ;
					}
					BankIncomeService.addUserAccount(obj)
					.success(function(data){
						if(data.code==0){
							$window.history.go(-1);
						}
						AlertService.updateAlert({title:data.message});
					})
				})
			}
		}
	}
]);
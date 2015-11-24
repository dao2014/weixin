"use strict";
/**
*  收益，提现系列Module
*/
var InComeControllerModule = angular.module('InComeControllerModule',[]);


/**
* 我的收益Controller控制器
*/
InComeControllerModule.controller('IncomeController',[
	'$rootScope',
	'$scope',
	'BankIncomeService',
	'LoadingService',
	'WXShareService',
	function($rootScope,$scope,BankIncomeService,LoadingService,WXShareService){
		WXShareService.FXhide();
		$scope.isCashShow = false; //选择提现方式
		$scope.isCashAlert = false; //提现提示
		$scope.isCashDetail = false; //提现详情


		var noCashDetail = $scope.noCashDetail=function(){
			$scope.isCashDetail = !$scope.isCashDetail;
		}
		$rootScope.$on('isCashDetail.update',function(){
			if(BankIncomeService.cashDetail._type==2){
				$scope.cashDetail = BankIncomeService.cashDetail;
				$scope.cashDetail._title = '提现详情';
			}else if(BankIncomeService.cashDetail._type==1){
				$scope.cashDetail = BankIncomeService.cashDetail;
				$scope.cashDetail._title = '收益详情';
			}else if(BankIncomeService.cashDetail._type==3){
				$scope.cashDetail = BankIncomeService.cashDetail;
				$scope.cashDetail._title = '商品销售';
			}
			noCashDetail();
			LoadingService.updateIsLoading(false);
		});
		LoadingService.updateIsLoading(true);
		/**
		* 我的收益，提现列表
		*/
		BankIncomeService.reset();
		BankIncomeService.myProfitDeal();
		$rootScope.$on('MyIncom.update',function(){
			$scope.profit = BankIncomeService.profit;
			$scope.MyIncom = BankIncomeService.MyIncom;
			LoadingService.updateIsLoading(false);
		});
		/**
		* 滚动加载更多
		*/
		$scope.loadMore=function(){
			BankIncomeService.myProfitDeal();
		}
		/**
		* 显示提现选择
		*/
		$scope.onGetCashMoney = function(){
			if ($scope.profit.leaveProfit>100) {
				$scope.isCashShow = !$scope.isCashShow;
			}else{
				$scope.isCashText = '余额不足100元，无法提现！'
				$scope.isCashAlert = !$scope.isCashAlert;
			}
		}


		/**
		* 选择申请提现方式
		* $params type: =wx 提现到微信零钱  =bank 提现到银行卡
		*/
		$scope.onGetCashToMoney = function(type){
			$rootScope.$stateParams.type = type;
			$rootScope.$state.go('cash',$rootScope.$stateParams)
		}
	}
]);
/**
* 提现controller控制器
*/
InComeControllerModule.controller('GetCashController',[
	'$rootScope',
	'$scope',
	'BankIncomeService',
	'AgentService',
	'AlertService',
	'WXShareService',
	function($rootScope,$scope,BankIncomeService,AgentService,AlertService,WXShareService){
		BankIncomeService.init();


		$scope.IsAuthed=true;//BankIncomeService.IsAuthed;//是否实名审核;
		$scope.IsAuthedText=BankIncomeService.IsAuthedText;//实名审核中提示文本;
		$rootScope.$on('autoStatue.update',function(){
			$scope.IsAuthed=BankIncomeService.IsAuthed;//是否实名审核;
			$scope.IsAuthedText=BankIncomeService.IsAuthedText;//实名审核中提示文本;
		})

		WXShareService.FXhide();
		var _type = $scope._type = $rootScope.$stateParams.type;
		$scope.CashTitle =  _type == 'bank'?'设置银行卡':'设置提现';
		$scope.isCashAlert = false;//提现失败的提示框
		$scope.isShowBankList = false;//选择绑定银行卡的列表
		$scope.chooseIndex = 0;
		
		var onChooseBank = $scope.onChooseBank=function(){
			$scope.isShowBankList = !$scope.isShowBankList
		}
		$scope.onChoosePay = function(index){
			$scope.chooseIndex = index;
			var res = $scope.BankInfo = $scope.BankList[$scope.chooseIndex];
			onChooseBank();
		}

		if(_type=='bank'){
			BankIncomeService.getAllMyBank();
			$rootScope.$on('AllMyBank.update',function(){
				$scope.BankList = BankIncomeService.AllMyBank;
				$scope.BankInfo = $scope.BankList[$scope.chooseIndex];
			})
		}
		
		$scope.money ;
		$scope.password ='';
		/**
		* 获取用户总用户数与总收益
		*/
		$scope.ProfitStat={}
		AgentService.getProfitStat().success(function(data){
			if(data.code==0){
				$scope.ProfitStat.TotalProfit = data.data.TotalProfit; //BankIncomeService.profit.leaveProfit
			}
		})
		BankIncomeService.myProfitDeal();
		
		/**
		* 显示提现选择
		*/
		$rootScope.$on('isCashAlert.update',function(){
			$scope.isCashAlert = true;
			$scope.isCashError = BankIncomeService.isCashError;
			$scope.isCashText = BankIncomeService.isCashText;
		})
		$scope.onGetCashAlert = function(){
			if($scope.isCashError==0){
				window.history.go(-1);
			}
			$scope.isCashAlert = !$scope.isCashAlert;
		}
	}
])

/**
* 绑定银行卡controller控制器
*/
InComeControllerModule.controller('BindBankController',[
	'$rootScope',
	'$scope',
	'BankIncomeService',
	'WXShareService',
	function($rootScope,$scope,BankIncomeService,WXShareService){
		$scope.isShowBankList = false;

		var reset=function(){
			$scope.bankInfo={
				bankId:'',
				bankName:'请选择银行卡',
				userName:'',
				userCard:'',
				scard:'',
				phone:'',
				smsVerify:''
			}
		}
		reset();
		var onChooseBank = $scope.onChooseBank=function(){
			$scope.isShowBankList = !$scope.isShowBankList
		}
		$scope.onChoosePay = function(index){
			$scope.chooseIndex = index;
			var res = $scope.BankList[$scope.chooseIndex];
			$scope.bankInfo.bankId = res['id']
			$scope.bankInfo.bankName = res['name']
			onChooseBank();
		}
		BankIncomeService.getAllBank();
		$rootScope.$on('AllBank.update',function(){
			$scope.BankList = BankIncomeService.AllBank;
			$scope.BankInfo = $scope.BankList[$scope.chooseIndex];
		});
		WXShareService.FXhide();
	}
])

/**
* 我绑定的银行卡controller控制
*/
InComeControllerModule.controller('MyBindBankController',[
	'$rootScope',
	'$scope',
	'BankIncomeService',
	function($rootScope,$scope,BankIncomeService){
		$scope.onChooseBank=function(){
			window.history.go(-1);
		}
		$scope.onChoosePay = function(index){
			var res = $scope.BankList[index];
			console.log(res);
		}
		
		BankIncomeService.getAllMyBank();
		$rootScope.$on('AllMyBank.update',function(){
			$scope.BankList = BankIncomeService.AllMyBank;
			$scope.BankInfo = $scope.BankList[$scope.chooseIndex];
		})
	}
])
package com.jfinal.weixin.sdk.api;

public class SnsAccessTokenApiTest {

	
	public static String AppID = "wx14772d86adadf5d0";
	public static String AppSecret = "f3ef04b888036796cefc52f1249a6f87";
	public static String URTL="http://daoweixin.6655.la/jfinal-weixin/index.html";
	public static void init(){
		ApiConfig ac = new ApiConfig();
		ac.setAppId(AppID);
		ac.setAppSecret(AppSecret); 
		ApiConfigKit.setThreadLocalApiConfig(ac);
	}
	
	public static void main(String[] args) {
		// TODO Auto-generated method stub
		String urls = SnsAccessTokenApi.getAuthorizeURL(AppID, URTL, false);
		System.out.println(urls);
	}

}

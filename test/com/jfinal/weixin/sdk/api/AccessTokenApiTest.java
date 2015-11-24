package com.jfinal.weixin.sdk.api;

import java.io.IOException;

import com.jfinal.plugin.redis.RedisPlugin;
import com.jfinal.weixin.sdk.cache.RedisAccessTokenCache;

/**
 * AccessTokenApi 测试
 */
public class AccessTokenApiTest {

	public static String AppID = "wx14772d86adadf5d0";
	public static String AppSecret = "f3ef04b888036796cefc52f1249a6f87";
	
	public static void init(){
		ApiConfig ac = new ApiConfig();
		ac.setAppId(AppID);
		ac.setAppSecret(AppSecret);
		ApiConfigKit.setThreadLocalApiConfig(ac);
	}

	public static void main(String[] args) throws IOException {
		init();
		useRedis();
		test();
	}

	public static void useRedis() {
		new RedisPlugin("main", "127.0.0.1").start();
		ApiConfigKit.setAccessTokenCache(new RedisAccessTokenCache());
	}

	public static void test() {
		AccessToken at = AccessTokenApi.getAccessToken();
		if (at.isAvailable())
			System.out.println("access_token : " + at.getAccessToken());
		else
			System.out.println(at.getErrorCode() + " : " + at.getErrorMsg());
		
		at = AccessTokenApi.getAccessToken();
		if (at.isAvailable())
			System.out.println("access_token : " + at.getAccessToken());
		else
			System.out.println(at.getErrorCode() + " : " + at.getErrorMsg());
		
		at = AccessTokenApi.getAccessToken();
		if (at.isAvailable())
			System.out.println("access_token : " + at.getAccessToken());
		else
			System.out.println(at.getErrorCode() + " : " + at.getErrorMsg());
	}

}

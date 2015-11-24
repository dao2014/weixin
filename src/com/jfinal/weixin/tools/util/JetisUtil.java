package com.jfinal.weixin.tools.util;

import redis.clients.jedis.Jedis;
import redis.clients.jedis.exceptions.JedisConnectionException;

import com.jfinal.plugin.redis.Cache;
import com.jfinal.plugin.redis.Redis;

public class JetisUtil {
	
	
	public static Jedis getJedis(){
		Jedis jedis = null;
		boolean borrowOrOprSuccess = true;
		Cache newsCache = Redis.use("direct");
		try {
			jedis = newsCache.getJedis();
			jedis.setex("dfgdfg", 3, "f");
		} catch (Exception e) {
			// TODO Auto-generated catch block
			borrowOrOprSuccess = false;
		}finally{
			if(!borrowOrOprSuccess){
				newsCache = Redis.use("direct");
				jedis = newsCache.getJedis();
			}
		}
		
		return jedis;
	}
}

package com.jfinal.weixin.tools.util;

import redis.clients.jedis.Jedis;

import com.jfinal.plugin.redis.Cache;
import com.jfinal.plugin.redis.Redis;

public class JetisUtil {
	public static Jedis getJedis(){
		Cache newsCache = Redis.use("direct");
		return newsCache.getJedis();
	}
}

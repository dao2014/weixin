package com.jfinal.weixin.controller.util;

import com.jfinal.plugin.redis.Cache;
import com.jfinal.plugin.redis.Redis;
import com.jfinal.weixin.common.ControllerMessage;
import com.jfinal.weixin.tools.util.StringUtils;

import redis.clients.jedis.Jedis;

public class UserUtil {
	
	
	/**
	 * 判断 用户 是否已经 收听了 
	 * @param openId
	 * @return  如果真 说明已经 接听了 否则 就木有
	 */
	public static boolean checkUserSeeding(String openId) {
		boolean isSeeding=false;
		String nowlessonOpenIdKey = ""; // 当前用户 redis open
		String lessonInfo = null;
		nowlessonOpenIdKey = openId + ControllerMessage.LESSON_ID;
		Cache newsCache = Redis.use("direct");
		Jedis jedis = newsCache.getJedis();
		lessonInfo = jedis.get(nowlessonOpenIdKey);
		if (StringUtils.isNull(lessonInfo)) { // 说明 该用户已经关注了
			isSeeding = true;
		}
		newsCache.close(jedis);
		
		return isSeeding;
	}
}

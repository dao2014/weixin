package test;

import java.util.Date;
import java.util.List;

import redis.clients.jedis.Jedis;

import com.jfinal.plugin.redis.Cache;
import com.jfinal.plugin.redis.Redis;
import com.jfinal.plugin.redis.RedisPlugin;
import com.jfinal.weixin.common.ControllerMessage;
import com.jfinal.weixin.sdk.msg.in.InImageMsg;
import com.jfinal.weixin.sdk.msg.in.InTextMsg;
import com.jfinal.weixin.sdk.msg.in.InVideoMsg;
import com.jfinal.weixin.sdk.msg.in.InVoiceMsg;
import com.jfinal.weixin.tools.util.DateUtils;
import com.jfinal.weixin.tools.util.StringUtils;

public class Test {
	public static void main( String [] arge){
		long c=System.currentTimeMillis();   //获取开始时间
		RedisPlugin seedingRedis = new RedisPlugin("bbs", "115.29.113.54");  //七天失效
		// 与web下唯一区别是需要这里调用一次start()方法
		seedingRedis.start();
//		String openId = "oNXXPs8FJTP1ckvk4k3e8Geak_S4";
//		String nowOpenId=openId+ControllerMessage.OPEN_ID_SEELING;
		for(int i = 0; i < 100; i++ ){
			Cache newsCache = Redis.use("bbs");
			Jedis cache= newsCache.getJedis();
			cache.set("sd", "i"+i);
			System.out.println(cache.get("sd"));
			cache.close();
		}
		long endTime=System.currentTimeMillis(); //获取结束时间
		System.out.println("一共花费时间"+(endTime-c));
//		System.out.println(newsCache.lrange("dao1", 0, newsCache.llen("dao1")));
	}
	
	
}

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
		RedisPlugin seedingRedis = new RedisPlugin("bbs", "115.29.113.54");  //七天失效
		// 与web下唯一区别是需要这里调用一次start()方法
		seedingRedis.start();
		Cache newsCache = Redis.use("bbs");
		Jedis cache= newsCache.getJedis();
		String openId = "oNXXPs8FJTP1ckvk4k3e8Geak_S4";
		String nowOpenId=openId+ControllerMessage.OPEN_ID_SEELING;
		List<String> list = cache.lrange(nowOpenId, 0, cache.llen(nowOpenId));
		if(!StringUtils.isNull(list)){
			for( String directIdR : list){
				System.out.println("用户获取到的消息"+directIdR);
				String[] directInfo = directIdR.split(",");
				String directKey = directInfo[0];
				System.out.println("课堂ID"+directKey);
				String start = directInfo[1];
				String end = directInfo[2];
				Date startTime = DateUtils.formateStr(start);
				Date endTime = DateUtils.formateStr(end);
				//计算 距离 直播的时间  如果 大于0 或者等于0 说明 还有多少分钟就开始直播  如果 小于0 说明 直播已经开始
				int minRightTime = DateUtils.dateminuteDiff(new Date(),startTime);
				//计算 距离 结束的时间   如果 大于0 或者等于0 说明  还有多少分钟就结束直播  如果小于0 说明 直播已经结束
				int eminEndTime =  DateUtils.dateminuteDiff(new Date(),endTime);
				if(minRightTime<=ControllerMessage.DIRECT_MSG_RIGHT_START&&minRightTime>0){  //是否 即将开始直播
					//提示 即将开始直播语音
					System.out.println(minRightTime+""+ControllerMessage.DIRECT_MSG_RIGHT_START_MSG);
					break;
				}else if(minRightTime<=0 && eminEndTime >=0){  //说明开始直播了
					if(minRightTime>=ControllerMessage.DIRECT_MSG_START){
						System.out.println(ControllerMessage.DIRECT_MSG_START_MSG);
						//提示 直播已经开始
					}else if(eminEndTime <= ControllerMessage.DIRECT_MSG_RIGHT_END_MSG){
						//提示 直播 即将结束
						System.out.println(ControllerMessage.DIRECT_MSG_RIGHT_END);
					}
						//检查 发送的详细  规范否
						boolean sendStatus=true;
						System.out.println("发送消息"+"===>");
						/**
						 * 发送内容给收听的人
						 */
						List<String> listUser = cache.lrange(directIdR, 0, cache.llen(directIdR));
						for( String sendUserOpenId : listUser){
							System.out.println("发送消息给"+sendUserOpenId);
						}
						if(!sendStatus){  //监控数据非法
							
						}else{  //保存数据
							StringBuffer sb = new StringBuffer();
							//直播课堂ID
							sb.append(directIdR+ControllerMessage.CONTENT_SPLIT);
							System.out.println("保存聊天数据");
							//用户发送信息ID
							//发送信息信息时间
							cache.lpush(openId+ControllerMessage.LESSON_CONTENT, sb.toString());
						}
				}
			}
		}else{
			
			System.out.println("空数据");
		}
//		System.out.println(newsCache.lrange("dao1", 0, newsCache.llen("dao1")));
	}
	
	
}

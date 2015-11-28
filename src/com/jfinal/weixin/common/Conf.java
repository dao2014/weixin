package com.jfinal.weixin.common;

import redis.clients.jedis.JedisPoolConfig;

import com.jfinal.config.Constants;
import com.jfinal.config.Handlers;
import com.jfinal.config.Interceptors;
import com.jfinal.config.JFinalConfig;
import com.jfinal.config.Plugins;
import com.jfinal.config.Routes;
import com.jfinal.core.JFinal;
import com.jfinal.kit.PropKit;
import com.jfinal.plugin.activerecord.ActiveRecordPlugin;
import com.jfinal.plugin.redis.RedisPlugin;
import com.jfinal.weixin.controller.DirectAnswerControlle;
import com.jfinal.weixin.controller.DirectControlle;
import com.jfinal.weixin.controller.IndexController;
import com.jfinal.weixin.controller.UserController;
import com.jfinal.weixin.demo.WeixinApiController;
import com.jfinal.weixin.demo.WeixinMsgController;
import com.jfinal.weixin.model.DirectAnswer;
import com.jfinal.weixin.model.DirectContent;
import com.jfinal.weixin.model.DirectEvaluate;
import com.jfinal.weixin.model.DirectSeeding;
import com.jfinal.weixin.model.DirectType;
import com.jfinal.weixin.model.User;
import com.jfinal.weixin.model.UserDirect;
import com.jfinal.weixin.plugin.HikariCPPlugin;
import com.jfinal.weixin.sdk.api.ApiConfigKit;

public class Conf extends JFinalConfig{
	/**
	 * 如果生产环境配置文件存在，则优先加载该配置，否则加载开发环境配置文件
	 * @param pro 生产环境配置文件
	 * @param dev 开发环境配置文件
	 */
	public void loadProp(String pro, String dev) {
		try {
			PropKit.use(pro);
		}
		catch (Exception e) {
			PropKit.use(dev);
		}
	}
	
	public void configConstant(Constants me) {
		loadProp( "a_little_config.txt","a_little_config_pro.txt");
		me.setDevMode(PropKit.getBoolean("devMode", true));
		// ApiConfigKit 设为开发模式可以在开发阶段输出请求交互的 xml 与 json 数据
		ApiConfigKit.setDevMode(me.getDevMode());
		
	}
	
	public void configRoute(Routes me) {
		me.add("/", IndexController.class);
		me.add("/user", UserController.class);
		me.add("/directAnser", DirectAnswerControlle.class); 
		me.add("/direct", DirectControlle.class);
		me.add("/msg", WeixinMsgController.class);
		me.add("/api", WeixinApiController.class, "/api");
	}
	
	/**
	 * configPlugin(配置插件)
	 */
	public void configPlugin(Plugins me) {
		// 配置C3p0数据库连接池插件
		// C3p0Plugin c3p0Plugin = new C3p0Plugin(PropKit.get("jdbcUrl"),
		// PropKit.get("user"), PropKit.get("password").trim());
		// me.add(c3p0Plugin);
		HikariCPPlugin hcp = new HikariCPPlugin(PropKit.get("jdbcUrl"),
				PropKit.get("user"), PropKit.get("password").trim(),
				PropKit.get("driverClass"), PropKit.getInt("maxPoolSize"));
		me.add(hcp);
		// 配置ActiveRecord插件
		ActiveRecordPlugin arp = new ActiveRecordPlugin(hcp);
		arp.setShowSql(true);
		me.add(arp);
		arp.addMapping("direct_answer", DirectAnswer.class);
		arp.addMapping("direct_content", DirectContent.class);
		arp.addMapping("direct_evaluate", DirectEvaluate.class);
		arp.addMapping("direct_type", DirectType.class);
		arp.addMapping("user", User.class);
		arp.addMapping("user_direct", UserDirect.class);
		arp.addMapping("direct_seeding", DirectSeeding.class);
		
		/****************************************
		 *集群redis 
		 */
		// 用于缓存bbs模块的redis服务
		RedisPlugin seedingRedis = new RedisPlugin(PropKit.get("redisname"), PropKit.get("redislocalhost"),PropKit.getInt("redispoit"),PropKit.getInt("redistimeout"));  //七天失效
//		RedisPlugin seedingRedis = new RedisPlugin("direct", "10.163.197.17",6379,25200);  //七天失效
		JedisPoolConfig jpl = seedingRedis.getJedisPoolConfig();
		//连接超时
		jpl.setMaxWaitMillis(1000*3);
		//最大空闲连接数, 默认8个
		jpl.setMaxIdle(20);
		// 设置最小空闲连接数或者说初始化连接数
		jpl.setMinIdle(10);
		// 多长空闲时间之后回收空闲连接
		jpl.setMinEvictableIdleTimeMillis(60000);
		//最大连接
		jpl.setMaxTotal(100);
		jpl.setTestOnBorrow(true);
		me.add(seedingRedis);
	}
	
	public void configInterceptor(Interceptors me) {
		
	}
	
	public void configHandler(Handlers me) {
		
	}
	
	public static void main(String[] args) {
		JFinal.start("webapp", 8080, "/", 5);
	}
}

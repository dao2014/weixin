package com.jfinal.weixin.common;

import com.jfinal.config.Constants;
import com.jfinal.config.Handlers;
import com.jfinal.config.Interceptors;
import com.jfinal.config.JFinalConfig;
import com.jfinal.config.Plugins;
import com.jfinal.config.Routes;
import com.jfinal.core.JFinal;
import com.jfinal.kit.PropKit;
import com.jfinal.plugin.activerecord.ActiveRecordPlugin;
import com.jfinal.plugin.c3p0.C3p0Plugin;
import com.jfinal.weixin.controller.IndexController;
import com.jfinal.weixin.demo.WeixinApiController;
import com.jfinal.weixin.demo.WeixinMsgController;
import com.jfinal.weixin.model.DirectAnswer;
import com.jfinal.weixin.model.DirectContent;
import com.jfinal.weixin.model.DirectEvaluate;
import com.jfinal.weixin.model.DirectType;
import com.jfinal.weixin.model.User;
import com.jfinal.weixin.model.UserDirect;
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
		loadProp("a_little_config_pro.txt", "a_little_config.txt");
		me.setDevMode(PropKit.getBoolean("devMode", false));
		// ApiConfigKit 设为开发模式可以在开发阶段输出请求交互的 xml 与 json 数据
		ApiConfigKit.setDevMode(me.getDevMode());
		
	}
	
	public void configRoute(Routes me) {
		me.add("/", IndexController.class);
		me.add("/msg", WeixinMsgController.class);
		me.add("/api", WeixinApiController.class, "/api");
	}
	
	/**
	 * configPlugin(配置插件)
	 */
	public void configPlugin(Plugins me) {
		// 配置C3p0数据库连接池插件
		C3p0Plugin c3p0Plugin = new C3p0Plugin(getProperty("jdbcUrl"), getProperty("user"), getProperty("password").trim());
		me.add(c3p0Plugin);
		
		// 配置ActiveRecord插件
		ActiveRecordPlugin arp = new ActiveRecordPlugin(c3p0Plugin);
		arp.setShowSql(true);
		me.add(arp);
		arp.addMapping("direct_answer", DirectAnswer.class);	
		arp.addMapping("direct_content", DirectContent.class);	
		arp.addMapping("direct_evaluate", DirectEvaluate.class);	
		arp.addMapping("direct_type", DirectType.class);	
		arp.addMapping("user", User.class);	
		arp.addMapping("user_direct", UserDirect.class);	
	}
	
	public void configInterceptor(Interceptors me) {
		
	}
	
	public void configHandler(Handlers me) {
		
	}
	
	public static void main(String[] args) {
		JFinal.start("webapp", 8080, "/", 5);
	}
}

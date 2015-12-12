package com.jfinal.weixin.controller;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;

import com.jfinal.log.Logger;
import com.jfinal.plugin.activerecord.Page;
import com.jfinal.plugin.redis.Cache;
import com.jfinal.plugin.redis.Redis;
import com.jfinal.weixin.common.ControllerMessage;
import com.jfinal.weixin.controller.util.UserUtil;
import com.jfinal.weixin.model.UserDirect;
import com.jfinal.weixin.sdk.api.SnsAccessToken;
import com.jfinal.weixin.sdk.api.SnsAccessTokenApi;
import com.jfinal.weixin.server.DirectServer;
import com.jfinal.weixin.server.impl.DirectAnswerServerImpl;
import com.jfinal.weixin.server.impl.DirectServerImpl;
import com.jfinal.weixin.tools.util.DateUtils;
import com.jfinal.weixin.tools.util.StringUtils;

import redis.clients.jedis.Jedis;


/**
 * 讲师课堂
 * @author Administrator
 *
 */
public class DirectControlle extends ApiBaseController implements IBaseControlle {
	public DirectServer<UserDirect> ds;
	private static Logger log ;
	public DirectControlle(){
		ds = new DirectServerImpl<UserDirect>();
		log = Logger.getLogger(DirectControlle.class);
	}
	
	/**
	 * 改变 课程
	 * directStatus 状态说明   是否在直播0默认等待直播,1正在直播 2 直播结束 3.没发布 4 已经发布 
	 */
	public void chechDirect(){
		Map<String, Object> attrs = new HashMap<String,Object>();
		attrs.put("id", getPara("id"));
		attrs.put("direct_status", getPara("directStatus"));
		if(ds.update(attrs))
			renderSuccess();
		else
			renderError();
	}
	
	
	/**
	 * 获取 用户当前的课程列表状态
	 * directStatus 状态说明   是否在直播0默认等待直播,1正在直播 2 直播结束 3.没发布 4 已经发布   
	 * directExamine  状态说明 0 默认待审查 1. 审查 通过
	 */
	public void getUserDirectPage(){
		
		String code = getPara("code");
		log.info("=====================================>code"+code);
		if(StringUtils.isNull(code)){
			renderError("获取code为空");
			return ;
		}

		Cache cache = Redis.use();
		Jedis jedis = cache.getJedis();
		String codeKey = ControllerMessage.REDIS_CODE+code;
		String openId="";
		SnsAccessToken st = SnsAccessTokenApi.getgetSnsAccessToken(code);
		openId = st.getOpenid();
		if(StringUtils.isNull(openId)){
			openId = jedis.get(codeKey);
			if(StringUtils.isNull(openId)){
				renderError("获取openId为空");
				return ;
			}
		}else{
			jedis.set(codeKey, openId);
			jedis.expire(codeKey, 300);
		}
		cache.close(jedis);
		
		int pageIn = getParaToInt("page");
		int size = getParaToInt("size");
		Page<UserDirect> page = ds.findUserPage(pageIn, size, openId);
		if(!StringUtils.isNull(page)){
			renderDatumResponse(page);
		}else{
			renderSuccess(openId);
		}
	}
	
	
	/**
	 * 获取 所有的 课堂列表  
	 * directStatus 状态说明   是否在直播0默认等待直播,1正在直播 2 直播结束 3.没发布 4 已经发布   
	 * directExamine  状态说明 0 默认待审查 1. 审查 通过
	 */
	public void getDirectPage(){
		
		String code = getPara("code");
		log.info("=====================================>code"+code);
		if(StringUtils.isNull(code)){
			renderError("获取code为空");
			return ;
		}
		
		
		Cache cache = Redis.use();
		Jedis jedis = cache.getJedis();
		String codeKey = ControllerMessage.REDIS_CODE+code;
		String openId="";
		SnsAccessToken st = SnsAccessTokenApi.getgetSnsAccessToken(code);
		openId = st.getOpenid();
		if(StringUtils.isNull(openId)){
			openId = jedis.get(codeKey);
			if(StringUtils.isNull(openId)){
				renderError("获取openId为空");
				return ;
			}
		}else{
			jedis.set(codeKey, openId);
			jedis.expire(codeKey, 300);
		}
		cache.close(jedis);
		int pageIn = getParaToInt("page");
		int size = getParaToInt("size");
		int directStatus = getParaToInt("directStatus");
		int directExamine = getParaToInt("directExamine");
		Page<UserDirect> page = ds.findPage(pageIn, size, directStatus,directExamine);
		if(!StringUtils.isNull(page)){
			renderDatumResponse(page,openId);
		}else{
			renderError();
		}
	}
	
	
	/**
	 * 新增课程内容，或者修改课程内容
	 */
	@Override
	public void save() {
		
		// TODO Auto-generated method stub
		
		Map<String, Object> attrs = new HashMap<String,Object>();
		attrs.put("wecht_open_id", getPara("wechtOpenId"));
		attrs.put("direct_des", getPara("directDes"));
		attrs.put("direct_title", getPara("directTitle"));
		attrs.put("direct_type_id", getPara("directTypeId"));
		attrs.put("direct_password", getPara("directPassword"));
		attrs.put("direct_start_time", getPara("directStartTime"));
		attrs.put("direct_end_time", getPara("directEndTime"));
		attrs.put("id", getPara("id"));
		attrs.put("create_date", new Date());
		attrs.put("direct_status", 0); //是否在直播0直播待审查 1默认等待直播,2正在直播 3 直播结束 4.没发布 5 已经发布
		attrs.put("direct_examine", 0);   //0 默认待审查 1. 审查 通过
		if(ds.save(attrs))
			renderSuccess("保存成功！");
		else
			renderError("保存失败");
	}
	
	
	/**
	 * 审查直播
	 */
	public void examineDirect(){
		Map<String, Object> attrs = new HashMap<String,Object>();
		attrs.put("id", getPara("id"));
		attrs.put("direct_status", getPara("directStatus"));  //是否在直播0直播待审查 1默认等待直播,2正在直播 3 直播结束 4.没发布 5 已经发布
		attrs.put("direct_examine", getPara("directExamine"));  //0 默认待审查 1. 审查 通过
		if(ds.update(attrs))
			renderSuccess();
		else
			renderError();
	}
	
	/**
	 * 用户课程修改 内容
	 */
	@Override
	public void update() {
		// TODO Auto-generated method stub
//		Map<String, Object> attrs = new HashMap<String,Object>();
//		attrs.put("id", getPara("id"));
//		attrs.put("direct_des", getPara("directDes"));
//		attrs.put("direct_type_id", getPara("directTypeId"));
//		attrs.put("direct_password", getPara("directPassword"));
//		attrs.put("direct_start_time", getPara("directStartTime"));
//		attrs.put("direct_end_time", getPara("directEndTime"));
//		attrs.put("direct_examine", 0);
//		if(ds.update(attrs))
//			renderSuccess();
//		else
//			renderError();
	}
	 
	@Override
	public void get() {
		String openId=getPara("wechtOpenId");
		if(StringUtils.isNull(openId)){
			renderError("获取不到当前用户的openId");
			return ;
		}
		UserDirect ud= ds.findId(getPara("id"));
		if(ud != null ){
			if(UserUtil.checkUserSeeding(openId)){
				ud.set("userSeeding", 1);
			}
			renderDatumResponse(ud);
		}else{
			renderError("获取课程信息失败！");
		}
	}

	@Override
	public void del() {
		// TODO Auto-generated method stub
		if(ds.delete(getPara("id"))){
			renderSuccess("删除成功！");
		}else{
			renderError("删除失败！");
		}
	}
	
	 
}

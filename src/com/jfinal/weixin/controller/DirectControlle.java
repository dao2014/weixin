package com.jfinal.weixin.controller;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;

import com.jfinal.plugin.activerecord.Page;
import com.jfinal.weixin.model.UserDirect;
import com.jfinal.weixin.server.DirectServer;
import com.jfinal.weixin.server.impl.DirectServerImpl;
import com.jfinal.weixin.tools.util.StringUtils;


/**
 * 讲师课堂
 * @author Administrator
 *
 */
public class DirectControlle extends BaseControlle implements IBaseControlle {
	public DirectServer<UserDirect> ds;
	
	public DirectControlle(){
		ds = new DirectServerImpl<UserDirect>();
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
	 * 获取 所有的 课堂列表  
	 * directStatus 状态说明   是否在直播0默认等待直播,1正在直播 2 直播结束 3.没发布 4 已经发布   
	 * directExamine  状态说明 0 默认待审查 1. 审查 通过
	 */
	public void getDirectPage(){
		int pageIn = getParaToInt("page");
		int size = getParaToInt("size");
		int directStatus = getParaToInt("directStatus");
		int directExamine = getParaToInt("directExamine");
		Page<UserDirect> page = ds.findPage(pageIn, size, directStatus,directExamine);
		if(!StringUtils.isNull(page)){
			renderDatumResponse(page);
		}else{
			renderError();
		}
	}
	
	@Override
	public void save() {
		
		// TODO Auto-generated method stub
		Map<String, Object> attrs = new HashMap<String,Object>();
		attrs.put("wecht_open_id", getPara("wechtOpenId"));
		attrs.put("direct_des", getPara("directDes"));
		attrs.put("direct_type_id", getPara("directTypeId"));
		attrs.put("direct_password", getPara("directPassword"));
		attrs.put("direct_start_time", getPara("directStartTime"));
		attrs.put("direct_end_time", getPara("directEndTime"));
		attrs.put("direct_create_time", new Date());
		attrs.put("direct_status", getPara("directStatus")); //是否在直播0直播待审查 1默认等待直播,2正在直播 3 直播结束 4.没发布 5 已经发布
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
		Map<String, Object> attrs = new HashMap<String,Object>();
		attrs.put("id", getPara("id"));
		attrs.put("direct_des", getPara("directDes"));
		attrs.put("direct_type_id", getPara("directTypeId"));
		attrs.put("direct_password", getPara("directPassword"));
		attrs.put("direct_start_time", getPara("directStartTime"));
		attrs.put("direct_end_time", getPara("directEndTime"));
		attrs.put("direct_examine", 0);
		if(ds.update(attrs))
			renderSuccess();
		else
			renderError();
	}

	@Override
	public void get() {
		UserDirect ud= ds.findId(getPara("id"));
		if(ud == null ){
			renderDatumResponse(ud);
		}else{
			renderError();
		}
	}

	@Override
	public void del() {
		// TODO Auto-generated method stub
		if(ds.delete(getPara("id"))){
			renderSuccess();
		}else{
			renderError();
		}
	}
	
	 
}

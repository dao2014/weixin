package com.jfinal.weixin.controller;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;

import com.jfinal.weixin.model.DirectAnswer;
import com.jfinal.weixin.server.DirectAnswerServer;
import com.jfinal.weixin.server.impl.DirectAnswerServerImpl;

public class DirectAnswerControlle extends BaseControlle implements IBaseControlle{
	
	DirectAnswerServer<DirectAnswer> da = new DirectAnswerServerImpl<DirectAnswer>();

	
	

	@Override
	public void save() {
		// TODO Auto-generated method stub
		
	}

	/**
	 * 用户收听 或者取消
	 * answerStatus 0为已经取消接听,1已接听
	 */
	@Override
	public void update() {
		Map<String, Object> attrs = new HashMap<String,Object>();
		attrs.put("wecht_open_id", getPara("wechtOpenId"));
		attrs.put("direct_id", getPara("directId"));
		attrs.put("answer_status", getPara("answerStatus"));   //0为已经取消接听,1已接听
		attrs.put("direct_password", getPara("directPassword"));
		attrs.put("answer_create_time", new Date());
		if(da.update(attrs))
			renderSuccess();
		else
			renderError();
	}

	@Override
	public void get() {
		// TODO Auto-generated method stub
		
	}

	@Override
	public void del() {
		// TODO Auto-generated method stub
		
	}

}

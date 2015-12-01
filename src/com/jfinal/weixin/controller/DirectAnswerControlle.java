package com.jfinal.weixin.controller;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;

import com.jfinal.plugin.activerecord.Record;
import com.jfinal.weixin.model.DirectAnswer;
import com.jfinal.weixin.sdk.api.SnsAccessToken;
import com.jfinal.weixin.sdk.api.SnsAccessTokenApi;
import com.jfinal.weixin.server.DirectAnswerServer;
import com.jfinal.weixin.server.UserServer;
import com.jfinal.weixin.server.impl.DirectAnswerServerImpl;
import com.jfinal.weixin.server.impl.UserServerImpl;
import com.jfinal.weixin.tools.util.StringUtils;

public class DirectAnswerControlle extends ApiBaseController implements IBaseControlle{
	
	DirectAnswerServer<DirectAnswer> da = new DirectAnswerServerImpl<DirectAnswer>();
	UserServer us = new UserServerImpl();
	

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
		String code = getPara("code");
		attrs.put("direct_id", getPara("directId"));
		attrs.put("answer_status", getPara("answerStatus"));   //0为已经取消接听,1已接听
		attrs.put("direct_password", getPara("directPassword"));
		attrs.put("answer_create_time", new Date());
		
		
		
		SnsAccessToken st = SnsAccessTokenApi.getgetSnsAccessToken(code);
		String openId = st.getOpenid();
		try {
			Record re = us.findUserInfo(openId);
			if(!StringUtils.isNull(re)){
				String nickName = re.getStr("wacht_name");
				attrs.put("nick_name",nickName);
			}else{
				attrs.put("nick_name","无名");
			}
		} catch (Exception e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		attrs.put("wecht_open_id", openId);
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

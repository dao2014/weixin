package com.jfinal.weixin.controller;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;

import com.jfinal.plugin.activerecord.Record;
import com.jfinal.weixin.controller.util.UserUtil;
import com.jfinal.weixin.model.DirectAnswer;
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
		
//		String code = getPara("code");
//		if(StringUtils.isNull(code)){
//			renderError("获取code为空");
//			return ;
//		}
//		
//		SnsAccessToken st = SnsAccessTokenApi.getgetSnsAccessToken(code);
//		String openId = st.getOpenid();
		
		String openId = getPara("wechtOpenId");
		String answerStatus = getPara("answerStatus")+"";
		if(StringUtils.isNull(openId)){
			renderError("获取openId为空");
			return ;
		}
		
		if( answerStatus.equals("0") && UserUtil.checkUserSeeding(openId)){
			renderError("请先取消预约其他课程！");
			return ;
		}
		
		Map<String, Object> attrs = new HashMap<String,Object>();
		attrs.put("direct_id", getPara("directId"));
		attrs.put("answer_status", answerStatus);   //0为已经取消接听,1已接听
		attrs.put("direct_password", getPara("directPassword"));
		attrs.put("answer_create_time", new Date());
		
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

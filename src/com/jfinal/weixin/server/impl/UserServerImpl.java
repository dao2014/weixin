package com.jfinal.weixin.server.impl;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;

import com.jfinal.log.Logger;
import com.jfinal.plugin.activerecord.Db;
import com.jfinal.plugin.activerecord.Record;
import com.jfinal.weixin.demo.WeixinMsgController;
import com.jfinal.weixin.model.User;
import com.jfinal.weixin.sdk.api.ApiResult;
import com.jfinal.weixin.sdk.api.UserApi;
import com.jfinal.weixin.sdk.msg.in.event.InFollowEvent;
import com.jfinal.weixin.server.UserServer;
import com.jfinal.weixin.tools.util.StringUtils;

public class UserServerImpl extends BaseServerImpl implements UserServer {

	
	private static final Logger log =  Logger.getLogger(UserServerImpl.class);
	
	@Override
	public void saveOrUpdateUser(InFollowEvent inFollowEvent) throws Exception {
		// TODO Auto-generated method stub
		String openId = inFollowEvent.getFromUserName();
		log.info("关注用户ID"+openId+"================================");
		String status = findOpenId(openId);
		Map<String, Object> attrs = new HashMap<String,Object>();
		if(!StringUtils.isNull(status)){  //说明用户已经 关注过
			attrs.put("id", status);
			if(inFollowEvent.getEvent().equals("subscribe")){//表示订阅
				attrs.put("user_status", 1);   //用户已经关注
			}else{
				attrs.put("user_status", 0);   //用户没有关注 
			}
			if(updateUser(attrs)){
				log.info("修改用户关注状态修改成功--");
			}else{
				log.info("修改用户关注状态修改失败--");
			}
		}else{   //新增用户
			ApiResult apiResult = UserApi.getUserInfo(openId);
			if(inFollowEvent.getEvent().equals("subscribe")){
				log.info("获取关注的用户信息"+apiResult.toString()+"================================");
				attrs.put("wacht_name", apiResult.get("nickname"));
				attrs.put("user_head_image", apiResult.get("headimgurl"));
				attrs.put("wacht_open_id", apiResult.get("openid"));
				attrs.put("wacht_unit_id", apiResult.get("unionid"));
				attrs.put("user_sex", apiResult.get("sex"));
				attrs.put("wachat_city", apiResult.get("city"));
				attrs.put("wachat_country", apiResult.get("country"));
				attrs.put("wachat_province", apiResult.get("province"));
				attrs.put("create_time", new Date());
				attrs.put("user_status", 1);
				attrs.put("id", StringUtils.getUUID());
				if(saveUser(attrs)){
					log.info("新增用户关注成功--");
				}else{
					log.info("新增用户关注失败--");
				}
			}
		}
	}

	@Override
	public Record findUserInfo(String OpenId) throws Exception {
		// TODO Auto-generated method stub
		Record user = Db.findFirst("SELECT * FROM user WHERE wacht_open_id=?", OpenId);
		if(user!=null)
			return user;
		return null;
	}
	
	
	@Override
	public String findOpenId(String OpenId) throws Exception {
		// TODO Auto-generated method stub
		Record user = Db.findFirst("SELECT * FROM user WHERE wacht_open_id=?", OpenId);
		if(user!=null)
			return user.getStr("id");
		return "";
	}

	@Override
	public boolean updateUser(Map<String, Object> attrs) throws Exception {
		// TODO Auto-generated method stub
		return User.userDao.setAttrs(attrs).update();
	}

	@Override
	public boolean saveUser(Map<String, Object> attrs) throws Exception {
		// TODO Auto-generated method stub
		return User.userDao.setAttrs(attrs).save();
	}

}

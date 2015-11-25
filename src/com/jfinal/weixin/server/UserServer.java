package com.jfinal.weixin.server;

import java.util.Map;

import com.jfinal.weixin.model.User;
import com.jfinal.weixin.sdk.msg.in.event.InFollowEvent;

public interface UserServer {
	
	
	/**
	 * 微信 用户关注的时候，进行保存 或者更新
	 * @param inFollowEvent
	 * @throws Exception
	 */
	public void saveOrUpdateUser(InFollowEvent inFollowEvent) throws Exception;
	
	/**
	 * 根据微信的openiD 获取用户信息
	 * @param OpenId
	 * @return
	 * @throws Exception
	 */
	public String findOpenId(String OpenId) throws Exception;
	
	/**
	 * 更新用户信息
	 * @param attrs
	 * @return
	 * @throws Exception
	 */
	public boolean updateUser(Map<String, Object> attrs) throws Exception;
	/**
	 * 新增用户信息
	 * @param attrs
	 * @return
	 * @throws Exception
	 */
	public boolean saveUser(Map<String, Object> attrs) throws Exception;
}

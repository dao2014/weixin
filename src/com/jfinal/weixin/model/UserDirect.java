package com.jfinal.weixin.model;

import com.jfinal.plugin.activerecord.Model;



/**
 * 用户 直播
 * @author Administrator
 *
 */
public class UserDirect  extends Model<UserDirect> {
	/**
	 * direct_status 是否在直播0默认等待直播,1正在直播 2 直播结束 3.没发布 4 已经发布
	 */
	public static final UserDirect userDirectDao = new UserDirect();
	
}

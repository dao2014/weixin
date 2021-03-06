package com.jfinal.weixin.server;

import java.util.Map;

import com.jfinal.plugin.activerecord.Page;
import com.jfinal.weixin.model.UserDirect;

public interface DirectServer<T> extends BaseServer<T>{
	public Page<T> findUserPage(int start, int end, Object... paras);
}

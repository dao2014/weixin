package com.jfinal.weixin.server.impl;

import java.util.Map;

import com.jfinal.log.Logger;
import com.jfinal.plugin.activerecord.Page;
import com.jfinal.weixin.server.DirectServer;

public class DirectSeedingServerImpl <M>  implements DirectServer<M>{
	
	
	

	@Override
	public Page<M> findPage(int start, int end, Object... paras) {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public boolean delete(String id) {
		// TODO Auto-generated method stub
		return false;
	}

	@Override
	public M findId(String id) {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public boolean update(Map<String, Object> attrs) {
		// TODO Auto-generated method stub
		return false;
	}

	@Override
	public Page<M> getList(Object... paras) {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public boolean save(Map<String, Object> attrs) {
		// TODO Auto-generated method stub
		return false;
	}

	@Override
	public Logger getLogger(Class<?> arg0) {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public Logger getLogger(String arg0) {
		// TODO Auto-generated method stub
		return null;
	}
	
	

}

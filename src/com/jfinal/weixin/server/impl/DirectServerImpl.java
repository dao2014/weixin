package com.jfinal.weixin.server.impl;

import java.util.Map;

import com.jfinal.log.Logger;
import com.jfinal.plugin.activerecord.Page;
import com.jfinal.weixin.common.ControllerMessage;
import com.jfinal.weixin.model.UserDirect;
import com.jfinal.weixin.server.DirectServer;

public class DirectServerImpl<M>  implements DirectServer<M> {
	
	public Logger log;
	
	public DirectServerImpl(){
		this.log = getLogger(DirectServerImpl.class);
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
	public Page<M> getList(Map<String, Object> attrs) {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public boolean save(Map<String, Object> attrs) {
		UserDirect ud = new UserDirect();
		if(ud.setAttrs(attrs).save()){
			log.info(ControllerMessage.RESPONG_DATE_SUCCESS);
			return true;
		}else{
			log.info(ControllerMessage.RESPONG_DATE_ERROR);
			return false;
		}
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

package com.jfinal.weixin.controller;

import com.jfinal.log.Logger;
import com.jfinal.weixin.model.UserDirect;
import com.jfinal.weixin.server.DirectServer;
import com.jfinal.weixin.server.impl.DirectServerImpl;

public class DirectControlle extends BaseControlle implements IBaseControlle {
	public DirectServer<UserDirect> ds;
	
	public DirectControlle(){
		ds = new DirectServerImpl<UserDirect>();
	}

	@Override
	public void save() {
		// TODO Auto-generated method stub
//		ds.save(get)
	}

	@Override
	public void update() {
		// TODO Auto-generated method stub
		
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

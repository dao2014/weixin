package com.jfinal.weixin.model;

import com.jfinal.plugin.activerecord.Model;

public class User extends Model<User>{
	public static final User userDao = new User();
}

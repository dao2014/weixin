package com.jfinal.weixin.server;

import java.util.Map;

import com.jfinal.log.ILoggerFactory;
import com.jfinal.plugin.activerecord.Page;

public  interface  BaseServer<M> extends ILoggerFactory{
	
	
	public Page<M> findPage(int start,int end,Object... paras);
	
	/**
	 * 根据ID 删除
	 * @param id
	 * @return
	 */
	public boolean delete(String id);
	
	/**
	 * 根据ID 获取对象
	 * @param id
	 * @return
	 */
	public M findId(String id);
	
	/**
	 * 更新对象
	 * @param attrs
	 * @return
	 */
	public boolean update(Map<String, Object> attrs);
	
	/**
	 * 根据条件 获取 分页信息
	 * @param attrs
	 * @return
	 */
	public Page<M> getList(Object... paras);
	
	/**
	 * 保存对象
	 * @param attrs
	 * @return
	 */
	public boolean save(Map<String, Object> attrs);
}

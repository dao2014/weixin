package com.jfinal.weixin.server.impl;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;

import redis.clients.jedis.Jedis;

import com.jfinal.log.Logger;
import com.jfinal.plugin.activerecord.Page;
import com.jfinal.plugin.redis.Cache;
import com.jfinal.plugin.redis.Redis;
import com.jfinal.weixin.common.ControllerMessage;
import com.jfinal.weixin.model.DirectAnswer;
import com.jfinal.weixin.model.UserDirect;
import com.jfinal.weixin.server.DirectAnswerServer;
import com.jfinal.weixin.server.DirectServer;
import com.jfinal.weixin.tools.util.DateUtils;
import com.jfinal.weixin.tools.util.JetisUtil;
import com.jfinal.weixin.tools.util.StringUtils;

public class DirectAnswerServerImpl<M>  implements DirectAnswerServer<M> {

	public DirectServer<UserDirect> ds = new DirectServerImpl<UserDirect>();
	private static Logger log ;
	public DirectAnswerServerImpl(){
		log = Logger.getLogger(DirectAnswerServerImpl.class);
	}

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
		String directId = attrs.get("direct_id")+"";
		String openId = attrs.get("wecht_open_id")+"";
		String password = attrs.get("direct_password")+"";
		Integer anserId=0;
		Integer status =Integer.parseInt(attrs.get("answer_status")+"");
		UserDirect ud = ds.findId(directId);
		//听课密码不正确!
		if(status==1 && !password.equals(ud.get("direct_password"))){
			return false;
		}
		attrs.remove("direct_password");
		DirectAnswer directAnswers = DirectAnswer.directAnswerDao.findFirst("select id from direct_answer where wecht_open_id=? and direct_id=?", openId,directId);
		if(StringUtils.isNull(directAnswers)){//新增
			return save(attrs,ud);
		}
		attrs.remove("answer_create_time");
		anserId = directAnswers.getInt("id");
		attrs.put("id", anserId);
		if(DirectAnswer.directAnswerDao.setAttrs(attrs).update()){
			Integer count = ud.getInt("direct_number");
			Map<String, Object> dsattrs = new HashMap<String,Object>();
			dsattrs.put("id", directId);
			dsattrs.put("direct_number", ++count);
			dsattrs.put("direct_update_time", new Date());
			ds.update(dsattrs);
			log.info(ControllerMessage.RESPONG_DATE_SUCCESS);
			//状态  1 是接听 0 取消
			if(status==null)
				return true;
			if(status==1){  //是否接听
				//创建缓存
				addDirectUser(openId,directId,ud);
			}else{
				//删除
				delDirectUser(openId,directId,ud);
			}
			return true;
		}
		log.info(ControllerMessage.RESPONG_DATE_ERROR);
		return false;
	}
	
	/**
	 * 添加听课人员
	 * @param attrs
	 * @return
	 */
	public boolean addDirectUser(String openId,String directId,UserDirect ud){
		String jsOpenId = ud.getStr("wecht_open_id");
		Jedis cache= JetisUtil.getJedis();
		Date start = ud.getDate("direct_start_time");
		Date end = ud.getDate("direct_end_time");
		String directIdkey = directId+","+DateUtils.formateDate(start)+","+DateUtils.formateDate(end);
		cache.lpush(directIdkey,openId);  //添加 课程 的听课人员
		int sent = DateUtils.dateSecondDiff(new Date(),end );
		log.info("用户收听失效时间:" + sent);
		//所有听众信息
		cache.setex(openId+ControllerMessage.LESSON_ID, DateUtils.dateSecondDiff(new Date(),end ), directIdkey+","+jsOpenId);
		return true;
	}
	
	/**
	 * 删除听课人员
	 * @param attrs
	 * @return
	 */
	public boolean delDirectUser(String openId,String directId,UserDirect ud){
		Jedis cache= JetisUtil.getJedis();
		String keys = "";
		Date start = ud.getDate("direct_start_time");
		Date end = ud.getDate("direct_end_time");
		//课程reidsId
		keys = directId+","+DateUtils.formateDate(start)+","+DateUtils.formateDate(end);
		Long len = cache.llen(keys);
		if(len==null && len<=0L ){
			cache.del(keys);
		}
		cache.lrem(keys,-2,openId);
		cache.del(openId+ControllerMessage.LESSON_ID);
		return true;
	}

	@Override
	public Page<M> getList(Object... paras) {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public boolean save(Map<String, Object> attrs) {
		if(DirectAnswer.directAnswerDao.setAttrs(attrs).save()){
			return true;
		}
		return false;
	}
	
	public boolean save(Map<String, Object> attrs,UserDirect ud) {
		if(DirectAnswer.directAnswerDao.setAttrs(attrs).save()){
			return addDirectUser(attrs.get("wecht_open_id")+"",attrs.get("direct_id")+"",ud);
		}
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

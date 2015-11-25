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
		String anserId=null;
		Integer dbAnswerStatus=null;
		Integer status =Integer.parseInt(attrs.get("answer_status")+"");
		UserDirect ud = ds.findId(directId);
		Map<String, Object> dsattrs = new HashMap<String,Object>();
		dsattrs.put("id", directId);
		dsattrs.put("direct_update_time", new Date());
		Integer count = ud.getInt("direct_number");
		//听课密码不正确!
		if(status==1 && !password.equals(ud.get("direct_password"))){
			return false;
		}
		attrs.remove("direct_password");
		DirectAnswer directAnswers = DirectAnswer.directAnswerDao.findFirst("select id,answer_status from direct_answer where wecht_open_id=? and direct_id=?", openId,directId);
		if(StringUtils.isNull(directAnswers)){//新增
			attrs.put("id", StringUtils.getUUID());
			if(save(attrs,ud)){
				dsattrs.put("direct_number", ++count);
				updateCount(dsattrs,ud);
				return true;
			}else{
				return false;
			}
		}
		attrs.remove("answer_create_time");
		anserId = directAnswers.getStr("id");
		dbAnswerStatus = directAnswers.getInt("answer_status");
		attrs.put("id", anserId);
		attrs.put("answer_update_time", new Date());
		if(DirectAnswer.directAnswerDao.setAttrs(attrs).update()){
			//状态  1 是接听 0 取消
			if(status==null)
				return true;
			if(status==1 && dbAnswerStatus != status){  //是否接听
				dsattrs.put("direct_number", ++count);
				//创建缓存
				addDirectUser(openId,directId,ud);
			}else if(status==0 && dbAnswerStatus != status){
				//删除
				dsattrs.put("direct_number", --count);
				delDirectUser(openId,directId,ud);
			}
			updateCount(dsattrs,ud);
			log.info(ControllerMessage.RESPONG_DATE_SUCCESS);
			return true;
		}
		log.info(ControllerMessage.RESPONG_DATE_ERROR);
		return false;
	}
	
	
	/**
	 * 更新收听人数s
	 * @param attrs
	 */
	public void updateCount(Map<String, Object> attrs,UserDirect ud ){
		ds.update(attrs);
	}
	
	/**
	 * 添加听课人员
	 * @param attrs
	 * @return
	 */
	public boolean addDirectUser(String openId,String directId,UserDirect ud){
		String jsOpenId = ud.getStr("wecht_open_id");
		Cache cache = Redis.use();
		Jedis jedis = cache.getJedis();
		Date start = ud.getDate("direct_start_time");
		Date end = ud.getDate("direct_end_time");
		String directIdkey = directId+","+DateUtils.formateDate(start)+","+DateUtils.formateDate(end);
		jedis.lpush(directIdkey,openId);  //添加 课程 的听课人员
		int sent = DateUtils.dateSecondDiff(new Date(),end );
		log.info("用户收听失效时间:" + sent);
		//所有听众信息
		if(sent>0)
			jedis.setex(openId+ControllerMessage.LESSON_ID, sent, directIdkey+","+jsOpenId);
		cache.close(jedis);
		return true;
	}
	
	/**
	 * 删除听课人员
	 * @param attrs
	 * @return
	 */
	public boolean delDirectUser(String openId,String directId,UserDirect ud){
		Cache cache = Redis.use();
		Jedis jedis = cache.getJedis();
		String keys = "";
		Date start = ud.getDate("direct_start_time");
		Date end = ud.getDate("direct_end_time");
		//课程reidsId
		keys = directId+","+DateUtils.formateDate(start)+","+DateUtils.formateDate(end);
		Long len = jedis.llen(keys);
		if(len==null && len<=0L ){
			jedis.del(keys);
		}
		jedis.lrem(keys,-2,openId);
		jedis.del(openId+ControllerMessage.LESSON_ID);
		cache.close(jedis);
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

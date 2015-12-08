package com.jfinal.weixin.server.impl;

import java.util.Date;
import java.util.Map;

import redis.clients.jedis.Jedis;

import com.jfinal.log.Logger;
import com.jfinal.plugin.activerecord.Db;
import com.jfinal.plugin.activerecord.Page;
import com.jfinal.plugin.activerecord.Record;
import com.jfinal.plugin.redis.Cache;
import com.jfinal.plugin.redis.Redis;
import com.jfinal.weixin.common.ControllerMessage;
import com.jfinal.weixin.model.UserDirect;
import com.jfinal.weixin.server.DirectServer;
import com.jfinal.weixin.tools.util.DateUtils;
import com.jfinal.weixin.tools.util.JetisUtil;
import com.jfinal.weixin.tools.util.StringUtils;

public class DirectServerImpl<M>  implements DirectServer<M> {
	
	private static Logger log ;
	
	public DirectServerImpl(){
		log = Logger.getLogger(DirectServerImpl.class);
	}

	
	
	
	@Override
	public Page<M> findUserPage(int start, int end, Object... paras) {
		// TODO Auto-generated method stub
		Page<M> paginate =  (Page<M>) UserDirect.userDirectDao.paginate(start, end, " select * ", 
				"from user_direct where  wecht_open_id=?", paras);
		if(!StringUtils.isNull(paginate)){
			log.info(ControllerMessage.RESPONG_MASG_SUCCESS);
		}else{
			log.info(ControllerMessage.RESPONG_MASG_ERROR);
		}
		return paginate;
	}




	@Override
	public Page<M> findPage(int start, int end, Object... paras) {
		// TODO Auto-generated method stub
		Page<M> paginate =  (Page<M>) UserDirect.userDirectDao.paginate(start, end, " select * ", 
				"from user_direct where direct_status=? and direct_examine=? ", paras);
		if(!StringUtils.isNull(paginate)){
			log.info(ControllerMessage.RESPONG_MASG_SUCCESS);
		}else{
			log.info(ControllerMessage.RESPONG_MASG_ERROR);
		}
		return paginate;
	}

	@Override
	public boolean delete(String id) {
		// TODO Auto-generated method stub
		return false;
	}

	@Override
	public M findId(String id) {
		// TODO Auto-generated method stub
		return (M) UserDirect.userDirectDao.findById(id);
	}

	@Override
	public boolean update(Map<String, Object> attrs) {
		// TODO Auto-generated method stub
		if(UserDirect.userDirectDao.setAttrs(attrs).update()){
			Integer status=null;
			log.info(ControllerMessage.RESPONG_DATE_SUCCESS);
			String dista = attrs.get("direct_status")+"";
			if(!StringUtils.isNull(dista))
				status = Integer.parseInt(dista);
			if(status==null)
				return true;
			if(status==1){  //审查通过
				//创建缓存
				createDirectRedis(attrs.get("id")+"");
			}
			return true;
		}
		log.info(ControllerMessage.RESPONG_DATE_ERROR);
		return false;
	}
	
	/**
	 * 创建 用户 预约听直播的人 对应的缓存
	 * @return
	 */
	public boolean createDirectRedis(String directId){
		UserDirect ud = (UserDirect) findId(directId);
		String openId = ud.get("wecht_open_id");
		Date start = ud.getDate("direct_start_time");
		Date end = ud.getDate("direct_end_time");
		Cache cache = Redis.use();
		Jedis jedis = cache.getJedis();
		jedis.lpush(openId+ControllerMessage.OPEN_ID_SEELING, directId+","+DateUtils.formateDate(start)+","+DateUtils.formateDate(end));
		int scon = DateUtils.dateSecondDiff(new Date(),end );
		log.info("失效时间"+scon);
		jedis.expire(ud.get("wecht_open_id")+ControllerMessage.OPEN_ID_SEELING, scon);
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
		String id = attrs.get("id") + "";
		attrs.put("update_date", new Date());
		if(!StringUtils.isNull(id)){
			if(Db.update("user_direct", new Record().setColumns(attrs))){
				return true;
			}else{
				return false;
			}
		}
		attrs.put("id", StringUtils.getUUID());
		attrs.put("create_date", new Date());
		if(Db.save("user_direct", new Record().setColumns(attrs))){
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

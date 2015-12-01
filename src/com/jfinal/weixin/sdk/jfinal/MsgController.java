/**
 * Copyright (c) 2011-2014, James Zhan 詹波 (jfinal@126.com).
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 */

package com.jfinal.weixin.sdk.jfinal;

import java.util.Date;
import java.util.List;

import redis.clients.jedis.Jedis;

import com.jfinal.aop.Before;
import com.jfinal.core.Controller;
import com.jfinal.ext.interceptor.NotAction;
import com.jfinal.kit.HttpKit;
import com.jfinal.log.Logger;
import com.jfinal.plugin.redis.Cache;
import com.jfinal.plugin.redis.Redis;
import com.jfinal.weixin.common.ControllerMessage;
import com.jfinal.weixin.sdk.api.ApiConfig;
import com.jfinal.weixin.sdk.api.ApiConfigKit;
import com.jfinal.weixin.sdk.api.ApiResult;
import com.jfinal.weixin.sdk.api.CustomServiceApi;
import com.jfinal.weixin.sdk.kit.MsgEncryptKit;
import com.jfinal.weixin.sdk.msg.InMsgParaser;
import com.jfinal.weixin.sdk.msg.OutMsgXmlBuilder;
import com.jfinal.weixin.sdk.msg.in.InImageMsg;
import com.jfinal.weixin.sdk.msg.in.InLinkMsg;
import com.jfinal.weixin.sdk.msg.in.InLocationMsg;
import com.jfinal.weixin.sdk.msg.in.InMsg;
import com.jfinal.weixin.sdk.msg.in.InShortVideoMsg;
import com.jfinal.weixin.sdk.msg.in.InTextMsg;
import com.jfinal.weixin.sdk.msg.in.InVideoMsg;
import com.jfinal.weixin.sdk.msg.in.InVoiceMsg;
import com.jfinal.weixin.sdk.msg.in.event.InCustomEvent;
import com.jfinal.weixin.sdk.msg.in.event.InFollowEvent;
import com.jfinal.weixin.sdk.msg.in.event.InLocationEvent;
import com.jfinal.weixin.sdk.msg.in.event.InMassEvent;
import com.jfinal.weixin.sdk.msg.in.event.InMenuEvent;
import com.jfinal.weixin.sdk.msg.in.event.InQrCodeEvent;
import com.jfinal.weixin.sdk.msg.in.event.InShakearoundUserShakeEvent;
import com.jfinal.weixin.sdk.msg.in.event.InTemplateMsgEvent;
import com.jfinal.weixin.sdk.msg.in.event.InVerifyFailEvent;
import com.jfinal.weixin.sdk.msg.in.event.InVerifySuccessEvent;
import com.jfinal.weixin.sdk.msg.in.speech_recognition.InSpeechRecognitionResults;
import com.jfinal.weixin.sdk.msg.out.OutMsg;
import com.jfinal.weixin.sdk.msg.out.OutTextMsg;
import com.jfinal.weixin.tools.util.DateUtils;
import com.jfinal.weixin.tools.util.StringUtils;

/**
 * 接收微信服务器消息，自动解析成 InMsg 并分发到相应的处理方法
 */ 
public abstract class MsgController extends Controller {
	
	public static final Logger log =  Logger.getLogger(MsgController.class);
	private String inMsgXml = null;		// 本次请求 xml数据
	private InMsg inMsg = null;			// 本次请求 xml 解析后的 InMsg 对象
	
	public abstract ApiConfig getApiConfig();
	
	/**
	 * weixin 公众号服务器调用唯一入口，即在开发者中心输入的 URL 必须要指向此 action
	 */
	@Before(MsgInterceptor.class)
	public void index() {
		String openId = "";    //当前的openId
		// 开发模式输出微信服务发送过来的  xml 消息
		if (ApiConfigKit.isDevMode()) {
			log.info("接收消息:");
			log.info(getInMsgXml());
		}
		// 解析消息并根据消息类型分发到相应的处理方法
		InMsg msg = getInMsg();
		openId = msg.getFromUserName();//当前的openId
		log.info("收到的信息 发送人OpenId:"+openId);
		log.info("===============redi 链接...");
		Cache newsCache = Redis.use("direct");
		Jedis jedis = newsCache.getJedis();
		if(searchDirect(msg,openId,jedis)){
			newsCache.close(jedis);
//			processInTextMsg((InTextMsg)msg,null,null);
			//提示 互动成功!
			return;
		}else if(searchLesson(msg,openId,jedis)){
			newsCache.close(jedis);
//			processInTextMsg((InTextMsg)msg,null,null);
			return;
		}else if (msg instanceof InTextMsg || msg instanceof InImageMsg || msg instanceof InVoiceMsg 
				|| msg instanceof InVideoMsg || msg instanceof InLocationMsg || msg instanceof InShortVideoMsg ){
			log.info("准备发送提示信息:"+openId);
			InTextMsg im = new InTextMsg(msg.getToUserName(), msg.getFromUserName(), msg.getCreateTime(), "text");
			processInTextMsg(im,null,null);
		}else if (msg instanceof InShortVideoMsg)   //支持小视频
			processInShortVideoMsg((InShortVideoMsg) msg);
		else if (msg instanceof InLinkMsg)
			processInLinkMsg((InLinkMsg) msg);
        else if (msg instanceof InCustomEvent)
            processInCustomEvent((InCustomEvent) msg);
		else if (msg instanceof InFollowEvent)
			processInFollowEvent((InFollowEvent) msg);
		else if (msg instanceof InQrCodeEvent)
			processInQrCodeEvent((InQrCodeEvent) msg);
		else if (msg instanceof InLocationEvent)
			processInLocationEvent((InLocationEvent) msg);
        else if (msg instanceof InMassEvent)
            processInMassEvent((InMassEvent) msg);
		else if (msg instanceof InMenuEvent)
			processInMenuEvent((InMenuEvent) msg);
		else if (msg instanceof InSpeechRecognitionResults)
			processInSpeechRecognitionResults((InSpeechRecognitionResults) msg);
		else if (msg instanceof InTemplateMsgEvent)
			processInTemplateMsgEvent((InTemplateMsgEvent)msg);
		else if (msg instanceof InShakearoundUserShakeEvent)
			processInShakearoundUserShakeEvent((InShakearoundUserShakeEvent)msg);
		if(jedis!=null)
			newsCache.close(jedis);
	}
	
	/**
	 * 检查是否主播
	 * @param OpenId  
	 * @return
	 */
	public boolean searchDirect(InMsg massge,String openId,Jedis cache){
		InTextMsg im = new InTextMsg(massge.getToUserName(), massge.getFromUserName(), massge.getCreateTime(), "text");
		boolean msg = true;
		String nowOpenId = "";// 当前用户redis OpenId
		nowOpenId = openId + ControllerMessage.OPEN_ID_SEELING;
		List<String> list = null;
		try {
			if(cache!=null){
				list = cache.lrange(nowOpenId, 0, cache.llen(nowOpenId));
			}
		} catch (Exception e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}finally{
		}
		if (!StringUtils.isNull(list)) {
			/****查看 当前用户的 直播缓存****/
			for (String directIdR : list) {
				String[] directInfo = directIdR.split(",");
				String directId = directInfo[0];
				String start = directInfo[1];
				String end = directInfo[2];
				Date startTime = DateUtils.formateStr(start);
				Date endTime = DateUtils.formateStr(end);
				// 计算 距离 直播的时间 如果 大于0 或者等于0 说明 还有多少分钟就开始直播 如果 小于0 说明 直播已经开始
				int minRightTime = DateUtils.dateminuteDiff(new Date(),
						startTime);
				// 计算 距离 结束的时间 如果 大于0 或者等于0 说明 还有多少分钟就结束直播 如果小于0 说明 直播已经结束
				int eminEndTime = DateUtils.dateminuteDiff(new Date(), endTime);
				if (minRightTime <= ControllerMessage.DIRECT_MSG_RIGHT_START
						&& minRightTime > 0) { // 是否 即将开始直播
					// 提示 即将开始直播语音
					processInTextMsg(im, openId, minRightTime
							+ "" + ControllerMessage.DIRECT_MSG_RIGHT_START_MSG);
					break;
				} else if (minRightTime <= 0 && eminEndTime >= 0)  { // 说明开始直播了
					// 检查 发送的详细 规范否
					boolean sendStatus = true;
					/**
					 * 发送内容给收听的人
					 */
					List<String> listUser = cache.lrange(directIdR, 0,
							cache.llen(directIdR));
					for (String sendUserOpenId : listUser) {
						/**
						 * 发送 数据
						 */
						sendMsg(massge,sendUserOpenId,sendStatus,"");
					}
					/**
					 * 保存数据
					 */
					saveServer(im, massge, sendStatus, openId, minRightTime, eminEndTime, cache,directId);
					
				} else if (eminEndTime >= ControllerMessage.DIRECT_MSG_END && eminEndTime < 0) { // 直播已
																				// 结束
					// 假设用户 点击
					processInTextMsg(im, openId,
							ControllerMessage.DIRECT_MSG_END_MSG);
					cache.lrem(nowOpenId, -2, directIdR);
					break;
				} else if (eminEndTime < ControllerMessage.DIRECT_MSG_END) { // 如果缓存
																				// 还没有删除掉,就删除
					cache.lrem(nowOpenId, -2, directIdR);
					if (massge instanceof InTextMsg)
						im.setContent(((InTextMsg) massge).getContent());
					processInTextMsg((InTextMsg)massge,null,null);
				}else{
					if (massge instanceof InTextMsg)
						im.setContent(((InTextMsg) massge).getContent());
					processInTextMsg(im,null,null);
				}
			}
			msg = true;
		} else {
			msg = false;
		}
		return msg;
	}
	
	
	
	
	/**
	 * 获取 是否听课的用户
	 * @return
	 */
	public boolean searchLesson(InMsg massge,String lessonOpenIds,Jedis cache){
		InTextMsg im = new InTextMsg(massge.getToUserName(), massge.getFromUserName(), massge.getCreateTime(), "text");
		boolean msg = true;
		String nowlessonOpenIdKey = ""; // 当前用户 redis open
		nowlessonOpenIdKey = lessonOpenIds + ControllerMessage.LESSON_ID;
		String lessonInfo=null;
		try {
			lessonInfo = cache.get(nowlessonOpenIdKey);
		} catch (Exception e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		if (!StringUtils.isNull(lessonInfo)) { // 说明 该用户已经关注了
			String[] directInfo = lessonInfo.split(",");
			String nidckName="";
			String directId = directInfo[0];
			String start = directInfo[1];
			String end = directInfo[2];
			String directOpenId = directInfo[3]; // 主播ID
			
			//获取当前的用户名称
			if(directInfo.length>=4)
				nidckName = directInfo[4]; // 主播ID
			
			Date startTime = DateUtils.formateStr(start);
			Date endTime = DateUtils.formateStr(end);
			// 计算 距离 直播的时间 如果 大于0 或者等于0 说明 还有多少分钟就开始直播 如果 小于0 说明 直播已经开始
			int minRightTime = DateUtils.dateminuteDiff(new Date(), startTime);
			// 计算 距离 结束的时间 如果 大于0 或者等于0 说明 还有多少分钟就结束直播 如果小于0 说明 直播已经结束
			int eminEndTime = DateUtils.dateminuteDiff(new Date(), endTime);
			if (minRightTime <= ControllerMessage.DIRECT_MSG_RIGHT_START
					&& minRightTime > 0) { // 是否 即将开始直播
				// 提示 即将开始直播语音
				processInTextMsg(im, lessonOpenIds,
						minRightTime + ""
								+ ControllerMessage.DIRECT_MSG_RIGHT_START_MSG);
			} else if (minRightTime <= 0 && eminEndTime >= 0) { 
				/**
				 * 直播开始 
				 */
				startDirect(massge,directOpenId,im,lessonOpenIds,minRightTime,eminEndTime,cache,nidckName,directId);
				
			} else if (eminEndTime >= ControllerMessage.DIRECT_MSG_END && eminEndTime <=0) { // 直播 已经结束
				// 假设用户 点击
				processInTextMsg(im, lessonOpenIds,
						ControllerMessage.DIRECT_MSG_END_MSG);
				cache.lrem(nowlessonOpenIdKey, -2, lessonInfo);
			} else if (eminEndTime <= ControllerMessage.DIRECT_MSG_END) { // 如果缓存// 恢复正常,正常提示
				cache.lrem(nowlessonOpenIdKey, -2, lessonInfo);
				if (massge instanceof InTextMsg)
					im.setContent(((InTextMsg) massge).getContent());
				processInTextMsg(im,null,null);
			}else{
				if (massge instanceof InTextMsg)
					im.setContent(((InTextMsg) massge).getContent());
				processInTextMsg(im,null,null);
			}
			msg = true;
		} else {
			msg = false;
		}
		return msg;
	}
	
	
	/**
	 * 听众 说明直播 开始
	 * @param massge  			接收到的信息
	 * @param directOpenId		需要发送的用户 openId
	 * @param im				初始化 通知消息
	 * @param lessonOpenIds		当前用户的OpenId
	 * @param minRightTime		开播距离时间
	 * @param eminEndTime		结束距离时间
	 * @param cache				缓存
	 * @param nickName			当前 听课人员的名称
	 * @param directId			当前 课程Id
	 */
	public void startDirect(InMsg massge,String directOpenId,InTextMsg im,
			String lessonOpenIds,int minRightTime,int eminEndTime,Jedis cache,String nickName,String directId ){
		// 检查 发送的详细 规范否
		boolean sendStatus = true;
		/**
		 * 发送消息
		 */
		sendMsg(massge,directOpenId,sendStatus,nickName);
		/**
		 * 保存数据
		 */
		saveServer(im, massge, sendStatus, lessonOpenIds, minRightTime, eminEndTime, cache,directId);
	}
	
	/**
	 * 发送消息 服务
	 * @param massge
	 * @param openId
	 * @param sendStatus
	 * @param 当前听课人员的名称
	 */
	public void sendMsg(InMsg massge,String openId,boolean sendStatus,String nickName){
		if (massge instanceof InTextMsg){
			if(!StringUtils.isNull(nickName)){
				nickName = nickName + "：";
			}
			ApiResult ar= CustomServiceApi.sendText(openId, nickName + ""+((InTextMsg) massge).getContent());
			Integer in = ar.getErrorCode();
			if(in==0){
				log.info("====================发送文本成功=============");
			}else{
				log.info("====================发送文本失败=============");
			}
		}else if (massge instanceof InImageMsg){
			ApiResult ar= CustomServiceApi.sendImage(openId, ((InImageMsg) massge).getMediaId());
			Integer in = ar.getErrorCode();
			if(in==0){
				log.info("====================发送图片成功=============");
			}else{
				log.info("====================发送图片失败=============");
			}
		}else if (massge instanceof InVoiceMsg){
			ApiResult ar= CustomServiceApi.sendVoice(openId, ((InVoiceMsg) massge).getMediaId());
			Integer in = ar.getErrorCode();
			if(in==0){
				log.info("====================发送音频成功=============");
			}else{
				log.info("====================发送音频失败=============");
			}
		}else if (massge instanceof InVideoMsg){
			ApiResult ar= CustomServiceApi.sendVideo(openId, ((InVideoMsg) massge).getMediaId(),((InVideoMsg) massge).getThumbMediaId(), "", "");
			Integer in = ar.getErrorCode();
			if(in==0){
				log.info("====================发送视频成功=============");
			}else{
				log.info("====================发送视频图片失败=============");
			}
		}else if (massge instanceof InShortVideoMsg){
			ApiResult ar= CustomServiceApi.sendVideo(openId, ((InShortVideoMsg) massge).getMediaId(),((InShortVideoMsg) massge).getThumbMediaId(), "", "");
			Integer in = ar.getErrorCode();
			if(in==0){
				log.info("====================发送短视频成功=============");
			}else{
				log.info("====================发送短视频失败=============");
			}
		}else if(massge instanceof InSpeechRecognitionResults){
			ApiResult ar= CustomServiceApi.sendVoice(openId, ((InVoiceMsg) massge).getMediaId());
			Integer in = ar.getErrorCode();
			if(in==0){
				log.info("====================发送音频识别=============");
			}else{
				log.info("====================发送音频识别=============");
			}
		}else {
			sendStatus = false;
		}
	}
	
	
	/**
	 * 缓存数据
	 * @param im				初始化通知服务
	 * @param massge			接收到的消息
	 * @param sendStatus		是否有数据异常
	 * @param lessonOpenIds		保存当前的用户
	 * @param minRightTime		开播距离时间
	 * @param eminEndTime		结束距离时间
	 * @param cache				缓存
	 * @param directId			当前课程ID
	 */
	public void saveServer(InTextMsg im,InMsg massge,boolean sendStatus,String lessonOpenIds,int minRightTime,int eminEndTime,Jedis cache,String directId){
		if (!sendStatus) { // 监控数据非法
			processInTextMsg(im, lessonOpenIds,
					ControllerMessage.DIRECT_MSG_ERROR);
		} else {
			/**
			 * 保存数据
			 */
			StringBuffer sb = new StringBuffer();
			// 直播课堂ID
			sb.append(directId + ControllerMessage.CONTENT_SPLIT);
			// 用户发送信息ID
			if (massge instanceof InTextMsg) {
				sb.append(((InTextMsg) massge).getContent()
						+ ControllerMessage.CONTENT_SPLIT);
			} else if (massge instanceof InImageMsg) {
				sb.append(((InImageMsg) massge).getMediaId()
						+ ControllerMessage.CONTENT_SPLIT);
			} else if (massge instanceof InVoiceMsg) {
				sb.append(((InVoiceMsg) massge).getMediaId()
						+ ControllerMessage.CONTENT_SPLIT);
			} else if (massge instanceof InVideoMsg) {
				sb.append(((InVideoMsg) massge).getMediaId()
						+ ControllerMessage.CONTENT_SPLIT);
			} else if(massge instanceof InShortVideoMsg){
				sb.append(((InShortVideoMsg) massge).getMediaId()
						+ ControllerMessage.CONTENT_SPLIT);
			}else if(massge instanceof InSpeechRecognitionResults){
				sb.append(((InSpeechRecognitionResults) massge).getMediaId()+",音频处理效果"
						+ ControllerMessage.CONTENT_SPLIT);
			}else{
				sb.append(ControllerMessage.DIRECT_MSG_ERROR
						+ ControllerMessage.CONTENT_SPLIT);
			}
			sb.append(massge.getMsgType() + ""
					+ ControllerMessage.CONTENT_SPLIT);
			// 发送信息信息时间
			sb.append(DateUtils.formateDate(new Date())
					+ ControllerMessage.CONTENT_SPLIT);
			cache.lpush(lessonOpenIds
					+ ControllerMessage.LESSON_CONTENT, sb.toString());
		}
		if (minRightTime >= ControllerMessage.DIRECT_MSG_START && eminEndTime < 0 ) {
			processInTextMsg(im, lessonOpenIds,
					ControllerMessage.DIRECT_MSG_START_MSG);
			// 提示 直播已经开始
		} else if (eminEndTime <= ControllerMessage.DIRECT_MSG_RIGHT_END_MSG) {
			// 提示 直播 即将结束
			processInTextMsg(im, lessonOpenIds,
					eminEndTime + ""
							+ ControllerMessage.DIRECT_MSG_RIGHT_END);
		}else{
			processInTextMsg(im,lessonOpenIds,ControllerMessage.DIRECT_MSG);
		}
	}
	
	
	/**
	 * 在接收到微信服务器的 InMsg 消息后后响应 OutMsg 消息
	 */
	public void render(OutMsg outMsg) {
		String outMsgXml = OutMsgXmlBuilder.build(outMsg);
		// 开发模式向控制台输出即将发送的 OutMsg 消息的 xml 内容
		if (ApiConfigKit.isDevMode()) {
			System.out.println("发送消息:");
			System.out.println(outMsgXml);
			System.out.println("--------------------------------------------------------------------------------\n");
		}
		
		// 是否需要加密消息
		if (ApiConfigKit.getApiConfig().isEncryptMessage()) {
			outMsgXml = MsgEncryptKit.encrypt(outMsgXml, getPara("timestamp"), getPara("nonce"));
		}
		
		renderText(outMsgXml, "text/xml");
	}
	
	public void renderOutTextMsg(String content) {
		OutTextMsg outMsg= new OutTextMsg(getInMsg());
		outMsg.setContent(content);
		render(outMsg);
	}
	
	@Before(NotAction.class)
	public String getInMsgXml() {
		if (inMsgXml == null) {
			inMsgXml = HttpKit.readIncommingRequestData(getRequest());
			
			// 是否需要解密消息
			if (ApiConfigKit.getApiConfig().isEncryptMessage()) {
				inMsgXml = MsgEncryptKit.decrypt(inMsgXml, getPara("timestamp"), getPara("nonce"), getPara("msg_signature"));
			}
		}
		return inMsgXml;
	}
	
	@Before(NotAction.class)
	public InMsg getInMsg() {
		if (inMsg == null)
			inMsg = InMsgParaser.parse(getInMsgXml()); 
		return inMsg;
	}
	
	/**
	 *  处理接收到的文本消息
	 * @param inTextMsg
	 * @param sendOpenId   指定发送
	 */
	protected abstract void processInTextMsg(InTextMsg inTextMsg,String sendOpenId,String conent);
	
	/**
	 *  处理接收到的图片消息
	 * @param inImageMsg
	 * @param sendOpenId  指定发送
	 */
	protected abstract void processInImageMsg(InImageMsg inImageMsg,String sendOpenId);
	
	/**
	 *  处理接收到的语音消息
	 * @param inVoiceMsg
	 */
	protected abstract void processInVoiceMsg(InVoiceMsg inVoiceMsg,String sendOpenId);
	
	/**
	 *  处理接收到的视频消息
	 * @param inVideoMsg
	 */
	protected abstract void processInVideoMsg(InVideoMsg inVideoMsg,String sendOpenId);
	
	// 处理接收到的视频消息
		protected abstract void processInShortVideoMsg(InShortVideoMsg inShortVideoMsg);
		
		// 处理接收到的地址位置消息
		protected abstract void processInLocationMsg(InLocationMsg inLocationMsg);

		// 处理接收到的链接消息
		protected abstract void processInLinkMsg(InLinkMsg inLinkMsg);

	    // 处理接收到的多客服管理事件
	    protected abstract void processInCustomEvent(InCustomEvent inCustomEvent);

		// 处理接收到的关注/取消关注事件
		protected abstract void processInFollowEvent(InFollowEvent inFollowEvent);
		
		// 处理接收到的扫描带参数二维码事件
		protected abstract void processInQrCodeEvent(InQrCodeEvent inQrCodeEvent);
		
		// 处理接收到的上报地理位置事件
		protected abstract void processInLocationEvent(InLocationEvent inLocationEvent);

	    // 处理接收到的群发任务结束时通知事件
	    protected abstract void processInMassEvent(InMassEvent inMassEvent);

		// 处理接收到的自定义菜单事件
		protected abstract void processInMenuEvent(InMenuEvent inMenuEvent);
		
		// 处理接收到的语音识别结果
		protected abstract void processInSpeechRecognitionResults(InSpeechRecognitionResults inSpeechRecognitionResults);
		
		// 处理接收到的模板消息是否送达成功通知事件
		protected abstract void processInTemplateMsgEvent(InTemplateMsgEvent inTemplateMsgEvent);

		// 处理微信摇一摇事件
		protected abstract void processInShakearoundUserShakeEvent(InShakearoundUserShakeEvent inShakearoundUserShakeEvent);

		// 资质认证成功 || 名称认证成功 || 年审通知 || 认证过期失效通知
		protected abstract void processInVerifySuccessEvent(InVerifySuccessEvent inVerifySuccessEvent);

		// 资质认证失败 || 名称认证失败
		protected abstract void processInVerifyFailEvent(InVerifyFailEvent inVerifyFailEvent);
}














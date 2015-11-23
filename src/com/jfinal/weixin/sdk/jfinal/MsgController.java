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
import com.jfinal.weixin.common.ControllerMessage;
import com.jfinal.weixin.sdk.api.ApiConfig;
import com.jfinal.weixin.sdk.api.ApiConfigKit;
import com.jfinal.weixin.sdk.kit.MsgEncryptKit;
import com.jfinal.weixin.sdk.msg.InMsgParaser;
import com.jfinal.weixin.sdk.msg.OutMsgXmlBuilder;
import com.jfinal.weixin.sdk.msg.in.InImageMsg;
import com.jfinal.weixin.sdk.msg.in.InLinkMsg;
import com.jfinal.weixin.sdk.msg.in.InLocationMsg;
import com.jfinal.weixin.sdk.msg.in.InMsg;
import com.jfinal.weixin.sdk.msg.in.InTextMsg;
import com.jfinal.weixin.sdk.msg.in.InVideoMsg;
import com.jfinal.weixin.sdk.msg.in.InVoiceMsg;
import com.jfinal.weixin.sdk.msg.in.event.InFollowEvent;
import com.jfinal.weixin.sdk.msg.in.event.InLocationEvent;
import com.jfinal.weixin.sdk.msg.in.event.InMenuEvent;
import com.jfinal.weixin.sdk.msg.in.event.InQrCodeEvent;
import com.jfinal.weixin.sdk.msg.in.event.InTemplateMsgEvent;
import com.jfinal.weixin.sdk.msg.in.speech_recognition.InSpeechRecognitionResults;
import com.jfinal.weixin.sdk.msg.out.OutMsg;
import com.jfinal.weixin.sdk.msg.out.OutTextMsg;
import com.jfinal.weixin.tools.util.DateUtils;
import com.jfinal.weixin.tools.util.JetisUtil;
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
		log.info("========================已经进来了");
		String openId = "";    //当前的openId
		String sendOpenId="";  //指定  推送的openId 
		String sendContent="";  //指定  推送的openId  文本
		// 开发模式输出微信服务发送过来的  xml 消息
		if (ApiConfigKit.isDevMode()) {
			log.info("接收消息:");
			log.info(getInMsgXml());
		}
		// 解析消息并根据消息类型分发到相应的处理方法
		InMsg msg = getInMsg();
		openId = msg.getFromUserName();//当前的openId
		log.info("收到的信息 发送人OpenId:"+openId);
		if(searchDirect(msg,openId)){
			//提示 互动成功!
			processInTextMsg((InTextMsg)msg,openId,ControllerMessage.DIRECT_MSG);
			return;
		}else if(searchLesson(msg,openId)){
			//提示 互动成功!
			processInTextMsg((InTextMsg)msg,openId,ControllerMessage.DIRECT_MSG);
			return;
		}else if (msg instanceof InTextMsg || msg instanceof InImageMsg || msg instanceof InVoiceMsg 
				|| msg instanceof InVideoMsg || msg instanceof InLocationMsg ){
			log.info("准备发送提示信息:"+openId);
			processInTextMsg((InTextMsg)msg,null,null);
		}else if (msg instanceof InLinkMsg)
			processInLinkMsg((InLinkMsg)msg);
		else if (msg instanceof InFollowEvent)
			processInFollowEvent((InFollowEvent)msg);
		else if (msg instanceof InQrCodeEvent)
			processInQrCodeEvent((InQrCodeEvent)msg);
		else if (msg instanceof InLocationEvent)
			processInLocationEvent((InLocationEvent)msg);
		else if (msg instanceof InMenuEvent)
			processInMenuEvent((InMenuEvent)msg);
		else if (msg instanceof InSpeechRecognitionResults)
			processInSpeechRecognitionResults((InSpeechRecognitionResults)msg);
		else if (msg instanceof InTemplateMsgEvent)
			processInTemplateMsgEvent((InTemplateMsgEvent)msg);
		else
			log.error("未能识别的消息类型。 消息 xml 内容为：\n" + getInMsgXml());
	}
	
	/**
	 * 检查是否主播
	 * @param OpenId
	 * @return
	 */
	public boolean searchDirect(InMsg massge,String openId){
		boolean msg = true;
		String nowOpenId = "";// 当前用户redis OpenId
		nowOpenId = openId + ControllerMessage.OPEN_ID_SEELING;
		Jedis cache = JetisUtil.getJedis();
		List<String> list = cache.lrange(nowOpenId, 0, cache.llen(nowOpenId));
		log.info("收到缓存list数据:" + list.size() + "======" + list);
		if (!StringUtils.isNull(list)) {
			for (String directIdR : list) {
				log.info("主播 收到缓存的数据:" + "======" + directIdR);
				String[] directInfo = directIdR.split(",");
				String directKey = directInfo[0];
				String start = directInfo[1];
				String end = directInfo[2];
				Date startTime = DateUtils.formateStr(start);
				Date endTime = DateUtils.formateStr(end);
				// 计算 距离 直播的时间 如果 大于0 或者等于0 说明 还有多少分钟就开始直播 如果 小于0 说明 直播已经开始
				int minRightTime = DateUtils.dateminuteDiff(new Date(),
						startTime);
				// 计算 距离 结束的时间 如果 大于0 或者等于0 说明 还有多少分钟就结束直播 如果小于0 说明 直播已经结束
				int eminEndTime = DateUtils.dateminuteDiff(new Date(), endTime);
				log.info("时间数据提示:距离直播时间" + "======" + minRightTime);
				log.info("时间数据提示:距离结束直播时间" + "======" + eminEndTime);
				if (minRightTime <= ControllerMessage.DIRECT_MSG_RIGHT_START
						&& minRightTime > 0) { // 是否 即将开始直播
					// 提示 即将开始直播语音
					processInTextMsg((InTextMsg) massge, openId, minRightTime
							+ "" + ControllerMessage.DIRECT_MSG_RIGHT_START_MSG);
					break;
				} else if (minRightTime <= 0 && eminEndTime >= 0) { // 说明开始直播了
					if (minRightTime >= ControllerMessage.DIRECT_MSG_START) {
						processInTextMsg((InTextMsg) massge, openId,
								ControllerMessage.DIRECT_MSG_START_MSG);
						// 提示 直播已经开始
					} else if (eminEndTime <= ControllerMessage.DIRECT_MSG_RIGHT_END_MSG) {
						// 提示 直播 即将结束
						processInTextMsg(
								(InTextMsg) massge,
								openId,
								eminEndTime
										+ ""
										+ ControllerMessage.DIRECT_MSG_RIGHT_END);
					}
					// 检查 发送的详细 规范否
					boolean sendStatus = true;
					/**
					 * 发送内容给收听的人
					 */
					List<String> listUser = cache.lrange(directIdR, 0,
							cache.llen(directIdR));
					for (String sendUserOpenId : listUser) {
						if (massge instanceof InTextMsg)
							processInTextMsg((InTextMsg) massge,
									sendUserOpenId,
									((InTextMsg) massge).getContent());
						else if (massge instanceof InImageMsg)
							processInImageMsg((InImageMsg) massge,
									sendUserOpenId);
						else if (massge instanceof InVoiceMsg)
							processInVoiceMsg((InVoiceMsg) massge,
									sendUserOpenId);
						else if (massge instanceof InVideoMsg)
							processInVideoMsg((InVideoMsg) massge,
									sendUserOpenId);
						else {
							sendStatus = false;
							break;
						}
					}
					if (!sendStatus) { // 监控数据非法
						processInTextMsg((InTextMsg) massge, openId,
								ControllerMessage.DIRECT_MSG_ERROR);
					} else { // 保存数据
						StringBuffer sb = new StringBuffer();
						// 直播课堂ID
						sb.append(directIdR + ControllerMessage.CONTENT_SPLIT);
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
						} else {
							sb.append(ControllerMessage.DIRECT_MSG_ERROR
									+ ControllerMessage.CONTENT_SPLIT);
						}
						sb.append(massge.getMsgType() + ""
								+ ControllerMessage.CONTENT_SPLIT);
						// 发送信息信息时间
						sb.append(DateUtils.formateDate(new Date())
								+ ControllerMessage.CONTENT_SPLIT);
						cache.lpush(openId + ControllerMessage.LESSON_CONTENT,
								sb.toString());
					}
				} else if (eminEndTime >= ControllerMessage.DIRECT_MSG_END) { // 直播已
																				// 结束
					// 假设用户 点击
					processInTextMsg((InTextMsg) massge, openId,
							ControllerMessage.DIRECT_MSG_END_MSG);
					cache.lrem(nowOpenId, -2, directIdR);
					break;
				} else if (eminEndTime <= ControllerMessage.DIRECT_MSG_END) { // 如果缓存
																				// 还没有删除掉,就删除
																				// 恢复正常,正常提示
					cache.lrem(nowOpenId, -2, directIdR);
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
	public boolean searchLesson(InMsg massge,String lessonOpenIds){
		boolean msg = true;
		Jedis cache = JetisUtil.getJedis();
		String nowlessonOpenIdKey = ""; // 当前用户 redis open
		nowlessonOpenIdKey = lessonOpenIds + ControllerMessage.LESSON_ID;
		String lessonInfo = cache.get(nowlessonOpenIdKey);
		if (!StringUtils.isNull(lessonInfo)) { // 说明 该用户已经关注了
			String[] directInfo = lessonInfo.split(",");
			String start = directInfo[1];
			String end = directInfo[2];
			String directOpenId = directInfo[3]; // 主播ID
			Date startTime = DateUtils.formateStr(start);
			Date endTime = DateUtils.formateStr(end);
			// 计算 距离 直播的时间 如果 大于0 或者等于0 说明 还有多少分钟就开始直播 如果 小于0 说明 直播已经开始
			int minRightTime = DateUtils.dateminuteDiff(new Date(), startTime);
			// 计算 距离 结束的时间 如果 大于0 或者等于0 说明 还有多少分钟就结束直播 如果小于0 说明 直播已经结束
			int eminEndTime = DateUtils.dateminuteDiff(new Date(), endTime);
			if (minRightTime <= ControllerMessage.DIRECT_MSG_RIGHT_START
					&& minRightTime > 0) { // 是否 即将开始直播
				// 提示 即将开始直播语音
				processInTextMsg((InTextMsg) massge, lessonOpenIds,
						minRightTime + ""
								+ ControllerMessage.DIRECT_MSG_RIGHT_START_MSG);
			} else if (minRightTime <= 0 && eminEndTime >= 0) { // 说明开始直播了
				if (minRightTime >= ControllerMessage.DIRECT_MSG_START) {
					processInTextMsg((InTextMsg) massge, lessonOpenIds,
							ControllerMessage.DIRECT_MSG_START_MSG);
					// 提示 直播已经开始
				} else if (eminEndTime <= ControllerMessage.DIRECT_MSG_RIGHT_END_MSG) {
					// 提示 直播 即将结束
					processInTextMsg((InTextMsg) massge, lessonOpenIds,
							eminEndTime + ""
									+ ControllerMessage.DIRECT_MSG_RIGHT_END);
				}
				// 检查 发送的详细 规范否
				boolean sendStatus = true;
				/**
				 * 发送消息给主播
				 */
				if (massge instanceof InTextMsg)
					processInTextMsg((InTextMsg) massge, directOpenId,
							((InTextMsg) massge).getContent());
				else if (massge instanceof InImageMsg)
					processInImageMsg((InImageMsg) massge, directOpenId);
				else if (massge instanceof InVoiceMsg)
					processInVoiceMsg((InVoiceMsg) massge, directOpenId);
				else if (massge instanceof InVideoMsg)
					processInVideoMsg((InVideoMsg) massge, directOpenId);
				else {
					sendStatus = false;
				}

				if (!sendStatus) { // 监控数据非法
					processInTextMsg((InTextMsg) massge, lessonOpenIds,
							ControllerMessage.DIRECT_MSG_ERROR);
				} else { // 保存数据
					StringBuffer sb = new StringBuffer();
					// 直播课堂ID
					sb.append(lessonOpenIds + ControllerMessage.CONTENT_SPLIT);
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
					} else {
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
			} else if (eminEndTime >= ControllerMessage.DIRECT_MSG_END) { // 直播已
																			// 结束
				// 假设用户 点击
				processInTextMsg((InTextMsg) massge, lessonOpenIds,
						ControllerMessage.DIRECT_MSG_END_MSG);
				cache.lrem(nowlessonOpenIdKey, -2, lessonInfo);
			} else if (eminEndTime <= ControllerMessage.DIRECT_MSG_END) { // 如果缓存
																			// 还没有删除掉,就删除
																			// 恢复正常,正常提示
				cache.lrem(nowlessonOpenIdKey, -2, lessonInfo);
			}
			msg = true;
		} else {
			msg = false;
		}
		return msg;
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
	
	/**
	 *  处理接收到的地址位置消息
	 * @param inLocationMsg
	 */
	protected abstract void processInLocationMsg(InLocationMsg inLocationMsg);

	/**
	 *  处理接收到的链接消息
	 * @param inLinkMsg
	 */
	protected abstract void processInLinkMsg(InLinkMsg inLinkMsg);
	
	/**
	 *  处理接收到的关注/取消关注事件
	 * @param inFollowEvent
	 */
	protected abstract void processInFollowEvent(InFollowEvent inFollowEvent);
	
	/**
	 *  处理接收到的扫描带参数二维码事件
	 * @param inQrCodeEvent
	 */
	protected abstract void processInQrCodeEvent(InQrCodeEvent inQrCodeEvent);
	
	/**
	 *  处理接收到的上报地理位置事件
	 * @param inLocationEvent
	 */
	protected abstract void processInLocationEvent(InLocationEvent inLocationEvent);
	
	/**
	 *  处理接收到的自定义菜单事件
	 * @param inMenuEvent
	 */
	protected abstract void processInMenuEvent(InMenuEvent inMenuEvent);
	
	/**
	 *  处理接收到的语音识别结果
	 * @param inSpeechRecognitionResults
	 */
	protected abstract void processInSpeechRecognitionResults(InSpeechRecognitionResults inSpeechRecognitionResults);
	
	/**
	 *  处理接收到的模板消息是否送达成功通知事件
	 * @param inTemplateMsgEvent
	 */
	protected abstract void processInTemplateMsgEvent(InTemplateMsgEvent inTemplateMsgEvent);
}














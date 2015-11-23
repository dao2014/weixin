/**
 * Copyright (c) 2011-2014, James Zhan 詹波 (jfinal@126.com).
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 */

package com.jfinal.weixin.demo;

import com.jfinal.kit.PropKit;
import com.jfinal.log.Logger;
import com.jfinal.weixin.common.ControllerMessage;
import com.jfinal.weixin.sdk.api.ApiConfig;
import com.jfinal.weixin.sdk.jfinal.MsgController;
import com.jfinal.weixin.sdk.msg.in.InImageMsg;
import com.jfinal.weixin.sdk.msg.in.InLinkMsg;
import com.jfinal.weixin.sdk.msg.in.InLocationMsg;
import com.jfinal.weixin.sdk.msg.in.InTextMsg;
import com.jfinal.weixin.sdk.msg.in.InVideoMsg;
import com.jfinal.weixin.sdk.msg.in.InVoiceMsg;
import com.jfinal.weixin.sdk.msg.in.event.InFollowEvent;
import com.jfinal.weixin.sdk.msg.in.event.InLocationEvent;
import com.jfinal.weixin.sdk.msg.in.event.InMenuEvent;
import com.jfinal.weixin.sdk.msg.in.event.InQrCodeEvent;
import com.jfinal.weixin.sdk.msg.in.event.InTemplateMsgEvent;
import com.jfinal.weixin.sdk.msg.in.speech_recognition.InSpeechRecognitionResults;
import com.jfinal.weixin.sdk.msg.out.OutImageMsg;
import com.jfinal.weixin.sdk.msg.out.OutNewsMsg;
import com.jfinal.weixin.sdk.msg.out.OutTextMsg;
import com.jfinal.weixin.sdk.msg.out.OutVideoMsg;
import com.jfinal.weixin.sdk.msg.out.OutVoiceMsg;
import com.jfinal.weixin.server.UserServer;
import com.jfinal.weixin.server.impl.UserServerImpl;
import com.jfinal.weixin.tools.util.StringUtils;

/**
 * 将此 DemoController 在YourJFinalConfig 中注册路由，
 * 并设置好weixin开发者中心的 URL 与 token ，使 URL 指向该
 * DemoController 继承自父类 WeixinController 的 index
 * 方法即可直接运行看效果，在此基础之上修改相关的方法即可进行实际项目开发
 */
public class WeixinMsgController extends MsgController {
	private UserServer userServer = new UserServerImpl();
	public static final Logger log =  Logger.getLogger(WeixinMsgController.class);
	private static final String helpStr = "直播简介:如果您需要培训,讲课,开会,那么这将是提供给您的一个平台.这是一个可容纳十万以下的听众平台,您可以" +
										  "随时说,随时听,随时讲!如需要了解请加QQ:785886726 tall:18502007012";
	private static final String welcon="\t 欢迎来到 94直播 如需要帮助 请输入\"help\"   如果需要了解操作流程请输入\"?\"";
	private static final String con="\t讲师操作:进入我的空间-->选择直播-->添加直播(进入审查)\n" +
									"\t后台操作:审查--\n"+
									"\t听众操作:查看直播-->选择\"立即收听\"(需要输入密码)-->等待直播开始即可! \n";
	private static final String msgDirect="\t 直播即将开始...!请做好准备!";
	/**
	 * 如果要支持多公众账号，只需要在此返回各个公众号对应的  ApiConfig 对象即可
	 * 可以通过在请求 url 中挂参数来动态从数据库中获取 ApiConfig 属性值
	 */
	public ApiConfig getApiConfig() {
		log.info("发送消息::::========================ApiConfig");
		ApiConfig ac = new ApiConfig();
		
		// 配置微信 API 相关常量
		ac.setToken(PropKit.get("token"));
		ac.setAppId(PropKit.get("appId"));
		ac.setAppSecret(PropKit.get("appSecret"));
		
		/**
		 *  是否对消息进行加密，对应于微信平台的消息加解密方式：
		 *  1：true进行加密且必须配置 encodingAesKey
		 *  2：false采用明文模式，同时也支持混合模式
		 */
		ac.setEncryptMessage(PropKit.getBoolean("encryptMessage", false));
		ac.setEncodingAesKey(PropKit.get("encodingAesKey", "setting it in config file"));
		return ac;
	}
	
	/**
	 * 实现父类抽方法，处理文本消息
	 * 本例子中根据消息中的不同文本内容分别做出了不同的响应，同时也是为了测试 jfinal weixin sdk的基本功能：
	 *     本方法仅测试了 OutTextMsg、OutNewsMsg、OutMusicMsg 三种类型的OutMsg，
	 *     其它类型的消息会在随后的方法中进行测试
	 */
	protected void processInTextMsg(InTextMsg inTextMsg,String sendOpenId,String sendContent) {
		log.info("进来了::====================================================================");
		String msgContent = inTextMsg.getContent().trim();
		String openId = inTextMsg.getFromUserName();//当前用户
		log.info("发送消息::::========================"+sendOpenId+">>>>内容>>>>>>"+msgContent);
		if(StringUtils.isNull(sendOpenId)){
			// 帮助提示
			if ("help".equalsIgnoreCase(msgContent) || "帮助".equals(msgContent)) {
				OutTextMsg outMsg = new OutTextMsg(inTextMsg);
				outMsg.setContent(helpStr);
				render(outMsg);
			}
			// 图文消息测试
			else if ("?".equalsIgnoreCase(msgContent)) {
				OutTextMsg outMsg = new OutTextMsg(inTextMsg);
				outMsg.setContent(con);
				render(outMsg);
			}else {   // 其它文本消息直接返回原值 + 帮助提示
				renderOutTextMsg(welcon);
			}
		}else{
			OutTextMsg outMsg = new OutTextMsg(inTextMsg);
			outMsg.setToUserName(sendOpenId);
			outMsg.setContent(sendContent);
			render(outMsg);
			outMsg.setToUserName(openId);
			sendMsg(inTextMsg);
		}
	}
	
	/**
	 * 发送成功提示
	 * @param outMsg
	 */
	public void sendMsg(InTextMsg inTextMsg){
		OutTextMsg outMsg = new OutTextMsg(inTextMsg);
		outMsg.setContent(ControllerMessage.DIRECT_MSG);
		render(outMsg);
	}
	
	
	/**
	 * 实现父类抽方法，处理图片消息
	 */
	protected void processInImageMsg(InImageMsg inImageMsg,String sendOpenId) {
		String openId = inImageMsg.getFromUserName();//当前用户
			OutImageMsg outMsg = new OutImageMsg(inImageMsg);
			// 将刚发过来的图片再发回去
			outMsg.setMediaId(inImageMsg.getMediaId());
			outMsg.setToUserName(sendOpenId);
			render(outMsg);
			
	}
	
	/**
	 * 实现父类抽方法，处理语音消息
	 */
	protected void processInVoiceMsg(InVoiceMsg inVoiceMsg,String sendOpenId) {
		OutVoiceMsg outMsg = new OutVoiceMsg(inVoiceMsg);
		// 将刚发过来的语音再发回去
		outMsg.setMediaId(inVoiceMsg.getMediaId());
		outMsg.setToUserName(sendOpenId);
		render(outMsg);
	}
	
	/**
	 * 实现父类抽方法，处理视频消息
	 */
	protected void processInVideoMsg(InVideoMsg inVideoMsg,String sendOpenId) {
		/* 腾讯 api 有 bug，无法回复视频消息，暂时回复文本消息代码测试*/
		OutVideoMsg outMsg = new OutVideoMsg(inVideoMsg);
		outMsg.setTitle("OutVideoMsg 发送");
		outMsg.setDescription("刚刚发来的视频再发回去");
		outMsg.setToUserName(sendOpenId);
		// 将刚发过来的视频再发回去，经测试证明是腾讯官方的 api 有 bug，待 api bug 却除后再试
		outMsg.setMediaId(inVideoMsg.getMediaId());
		render(outMsg);
		
//		OutTextMsg outMsg = new OutTextMsg(inVideoMsg);
//		outMsg.setToUserName(sendOpenId);
//		outMsg.setContent("\t视频消息已成功接收，该视频的 mediaId 为: " + inVideoMsg.getMediaId());
//		render(outMsg);
	}
	
	/**
	 * 实现父类抽方法，处理地址位置消息
	 */
	protected void processInLocationMsg(InLocationMsg inLocationMsg) {
		OutTextMsg outMsg = new OutTextMsg(inLocationMsg);
		outMsg.setContent("已收到地理位置消息:" +
							"\nlocation_X = " + inLocationMsg.getLocation_X() +
							"\nlocation_Y = " + inLocationMsg.getLocation_Y() + 
							"\nscale = " + inLocationMsg.getScale() +
							"\nlabel = " + inLocationMsg.getLabel());
		render(outMsg);
	}
	
	/**
	 * 实现父类抽方法，处理链接消息
	 * 特别注意：测试时需要发送我的收藏中的曾经收藏过的图文消息，直接发送链接地址会当做文本消息来发送
	 */
	protected void processInLinkMsg(InLinkMsg inLinkMsg) {
		OutNewsMsg outMsg = new OutNewsMsg(inLinkMsg);
		outMsg.addNews("链接消息已成功接收", "链接使用图文消息的方式发回给你，还可以使用文本方式发回。点击图文消息可跳转到链接地址页面，是不是很好玩 :)" , "http://mmbiz.qpic.cn/mmbiz/zz3Q6WSrzq1ibBkhSA1BibMuMxLuHIvUfiaGsK7CC4kIzeh178IYSHbYQ5eg9tVxgEcbegAu22Qhwgl5IhZFWWXUw/0", inLinkMsg.getUrl());
		render(outMsg);
	} 
	
	/**
	 * 实现父类抽方法，处理关注/取消关注消息
	 */
	protected void processInFollowEvent(InFollowEvent inFollowEvent) {
		
		try {
			userServer.saveOrUpdateUser(inFollowEvent);
		} catch (Exception e) {
			// TODO Auto-generated catch block
			
			log.error(e.fillInStackTrace()+"");
		}finally{
			OutTextMsg outMsg = new OutTextMsg(inFollowEvent);
			outMsg.setContent(ControllerMessage.ATTENTION);
			// 如果为取消关注事件，将无法接收到传回的信息
			render(outMsg); 
		}
		
	}
	
	/**
	 * 实现父类抽方法，处理扫描带参数二维码事件
	 */
	protected void processInQrCodeEvent(InQrCodeEvent inQrCodeEvent) {
		OutTextMsg outMsg = new OutTextMsg(inQrCodeEvent);
		outMsg.setContent("processInQrCodeEvent() 方法测试成功");
		render(outMsg);
	}
	
	/**
	 * 实现父类抽方法，处理上报地理位置事件
	 */
	protected void processInLocationEvent(InLocationEvent inLocationEvent) {
		OutTextMsg outMsg = new OutTextMsg(inLocationEvent);
		outMsg.setContent("processInLocationEvent() 方法测试成功");
		render(outMsg);
	}
	
	/**
	 * 实现父类抽方法，处理自定义菜单事件
	 */
	protected void processInMenuEvent(InMenuEvent inMenuEvent) {
		renderOutTextMsg("processInMenuEvent() 方法测试成功");
	}
	
	/**
	 * 实现父类抽方法，处理接收语音识别结果
	 */
	protected void processInSpeechRecognitionResults(InSpeechRecognitionResults inSpeechRecognitionResults) {
		renderOutTextMsg("语音识别结果： " + inSpeechRecognitionResults.getRecognition());
	}
	
	// 处理接收到的模板消息是否送达成功通知事件
	protected void processInTemplateMsgEvent(InTemplateMsgEvent inTemplateMsgEvent) {
		String status = inTemplateMsgEvent.getStatus();
		renderOutTextMsg("模板消息是否接收成功：" + status);
	}
}







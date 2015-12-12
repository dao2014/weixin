package com.jfinal.weixin.common;

public class ControllerMessage {
	public static final String ATTENTION = "关注推送的消息";
	public static final String RESPONG_MASG_ERROR = "没有查询到数据！";
	public static final String RESPONG_MASG_SUCCESS = "数据查询成功！";
	public static final String RESPONG_DATE_SUCCESS = "保存成功！";
	public static final String RESPONG_DATE_ERROR = "保存失败！";
	public static final String RESPONG_MAGE_E = "操作失败！";
	public static final String RESPONG_MAGE_S = "操作成功！";
	public static final String REDIS_CODE = "code:";
	
	
	/***********************************
	 * 缓存 规定 如果是 
	 * 直播的话  那么 讲师的 key=openId+1 value=直播课堂ID,开始时间,结束时间,直播ID,开始时间,结束时间  队列   根据时间  早的先将先出 。  
	 * 设置有效时间 为最晚的时间失效  设置 结束时间  可区别 讲课   任务调度的时候  要把 没用的清理掉
	 * 收听人缓存    key=openID+2  value = 直播ID,开始时间,结束时间,主播人OpenId,收听人名称;value=open1,oepn2,open3    // 根据  直播的讲课时间 失效
	 * 如果是直播的课堂内容 key=openId+3 value=直播课堂Id(,-内容(,-内容类型(,-时间;....  // 以    (,- 作为截取 ------- 不设置 失效时间  直到保存起来
	 */
	//讲师后缀
	public static final String OPEN_ID_SEELING="1";
	//听课人的后缀  主要是 查看该人是不否已经 收听了.
	public static final String LESSON_ID="2";
	//直播内容的后缀 主要是为了 任务调度的时候 做永久保存
	public static final String LESSON_CONTENT="3";
	//内容 截取 字符分割号
	public static final String CONTENT_SPLIT="(,-";
	//设置 5分钟 提示 还有5分钟开课即将开始
	public static final Integer DIRECT_MSG_RIGHT_START=5;
	public static final String DIRECT_MSG_RIGHT_START_MSG="分钟之后就开始直播了,请做好准备!";
	//设置 开课  分钟内(负数:说明 已经开始直播了多少分钟)提示 开课已经开始;
	public static final Integer DIRECT_MSG_START=-3;
	public static final String DIRECT_MSG_START_MSG="直播已经开始!";
	//设置 分钟  提示 课程即将结束
	public static final Integer DIRECT_MSG_RIGHT_END_MSG=3;
	public static final String DIRECT_MSG_RIGHT_END="分钟之后就结束直播了,请做好准备!";
	//设置 分钟(负数说明 已经结束了 多少分钟 )课程已经 结束
	public static final Integer DIRECT_MSG_END=-3;
	public static final String DIRECT_MSG_END_MSG="直播已经结束!";
	//发送消息提示
	public static final String DIRECT_MSG="互动成功!";
	//消息提示失败
	public static final String DIRECT_MSG_ERROR="数据非法!请输入明文!";
}

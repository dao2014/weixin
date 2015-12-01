package com.jfinal.weixin.controller;

import java.util.List;

import com.jfinal.kit.PropKit;
import com.jfinal.plugin.activerecord.Page;
import com.jfinal.weixin.common.ControllerMessage;
import com.jfinal.weixin.common.response.BaseResponse;
import com.jfinal.weixin.common.response.Code;
import com.jfinal.weixin.common.response.DataResponse;
import com.jfinal.weixin.common.response.DatumResponse;
import com.jfinal.weixin.sdk.api.ApiConfig;
import com.jfinal.weixin.sdk.jfinal.ApiController;
import com.jfinal.weixin.tools.util.StringUtils;

public class ApiBaseController extends ApiController{
	
	

	/**
	 * 如果要支持多公众账号，只需要在此返回各个公众号对应的  ApiConfig 对象即可
	 * 可以通过在请求 url 中挂参数来动态从数据库中获取 ApiConfig 属性值
	 */
	@Override
	public ApiConfig getApiConfig() {
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
     * 响应接口不存在*
     */
    public void render404() {

        renderJson(new BaseResponse(Code.NOT_FOUND));
        
    }

    /**
     * 响应请求参数有误*
     * @param message 错误信息
     */
    public void renderArgumentError(String message) {

        renderJson(new BaseResponse(Code.ARGUMENT_ERROR, message));

    }
    
    /**
     * 返回界面查询
     * @param page
     */
    public <T> void renderPage(Page<T> page){
    	if(StringUtils.isNull(page)){
    		renderError(ControllerMessage.RESPONG_MASG_ERROR);
    	}else{
    		renderJson(new DatumResponse(page,ControllerMessage.RESPONG_MASG_SUCCESS));
    	}
    }
    
    
    /**
     * 返回一个对象
     * @param date
     */
    public void renderDatumResponse(Object date){
    	
    	if(StringUtils.isNull(date)){
    		renderError(ControllerMessage.RESPONG_MASG_ERROR);
    	}else{
    		renderJson(new DatumResponse(date,ControllerMessage.RESPONG_MASG_SUCCESS));
    	}
    }

    /**
     * 响应数组类型*
     * @param list 结果集合
     */
    public void renderDataResponse(List<?> list) {
        DataResponse resp = new DataResponse();
        if (list == null || list.size() == 0) {
        	renderError(ControllerMessage.RESPONG_MASG_ERROR);
        } else {
            renderJson(new DataResponse(list,ControllerMessage.RESPONG_MASG_SUCCESS));
        }
        
    }
    
    /**
     * 响应操作失败
     * @param message 响应信息
     */
    public void renderError(String message) {
        renderJson(new BaseResponse().setMessage(message));
        
    }
    
    /**
     * 响应操作失败
     * @param message 响应信息
     */
    public void renderError() {
        renderJson(new BaseResponse().setMessage(ControllerMessage.RESPONG_MAGE_E));
        
    }

    /**
     * 响应操作成功*
     * @param message 响应信息
     */
    public void renderSuccess(String message) {
        renderJson(new BaseResponse().setMessage(message));
        
    }
    
    /**
     * 响应操作成功*
     * @param message 响应信息
     */
    public void renderSuccess() {
        renderJson(new BaseResponse().setMessage(ControllerMessage.RESPONG_MAGE_S));
        
    }

    /**
     * 响应操作失败*
     * @param message 响应信息
     */
    public void renderFailed(String message) {
        renderJson(new BaseResponse(Code.FAIL, message));
        
    }
    
}

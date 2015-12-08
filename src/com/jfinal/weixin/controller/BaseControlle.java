package com.jfinal.weixin.controller;

import java.lang.reflect.Array;
import java.util.List;

import com.jfinal.core.Controller;
import com.jfinal.plugin.activerecord.Page;
import com.jfinal.weixin.common.ControllerMessage;
import com.jfinal.weixin.common.response.BaseResponse;
import com.jfinal.weixin.common.response.Code;
import com.jfinal.weixin.common.response.DataResponse;
import com.jfinal.weixin.common.response.DatumResponse;
import com.jfinal.weixin.tools.Require;
import com.jfinal.weixin.tools.util.StringUtils;

public class BaseControlle extends Controller {
	
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
     * 返回一个对象
     * @param date
     */
    public void renderDatumResponse(Object date,String msg){
    	
    	if(StringUtils.isNull(date)){
    		renderSuccess(msg);
    	}else{
    		renderJson(new DatumResponse(date,msg));
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
        renderJson(new BaseResponse(0).setMessage(message));
        
    }
    
    /**
     * 响应操作失败
     * @param message 响应信息
     */
    public void renderError() {
        renderJson(new BaseResponse(0).setMessage(ControllerMessage.RESPONG_MAGE_E));
        
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

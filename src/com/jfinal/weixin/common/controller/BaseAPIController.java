package com.jfinal.weixin.common.controller;

import java.util.List;

import com.jfinal.core.Controller;
import com.jfinal.weixin.common.bean.BaseResponse;
import com.jfinal.weixin.common.bean.Code;
import com.jfinal.weixin.common.bean.DataResponse;

public class BaseAPIController extends Controller{
	
	
	
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
     * 响应数组类型*
     * @param list 结果集合
     */
    public void renderDataResponse(List<?> list) {
        DataResponse resp = new DataResponse();
        resp.setData(list);
        if (list == null || list.size() == 0) {
            resp.setMessage("未查询到数据");
        } else {
            resp.setMessage("success");
        }
        renderJson(resp);
        
    }

    /**
     * 响应操作成功*
     * @param message 响应信息
     */
    public void renderSuccess(String message) {
        renderJson(new BaseResponse().setMessage(message));
        
    }

    /**
     * 响应操作失败*
     * @param message 响应信息
     */
    public void renderFailed(String message) {
        renderJson(new BaseResponse(Code.FAIL, message));
        
    }
}

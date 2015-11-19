package com.jfinal.weixin.tools.util;

import java.math.BigDecimal;
import java.security.MessageDigest;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Random;
import java.util.Set;
import java.util.UUID;

/**
 * 字符串操作工具
 * @author malongbo
 */
public final class StringUtils {

    /**
     * 判断字符串是否为空
     * @param str
     * @return
     */
    public static boolean isEmpty (String str) {
        if (str == null)
            return true;

        if ("".equals(str.trim()))
            return true;

        return false;
    }

    /**
     * 判断字符串是否不为空
     * @param str
     * @return
     */
    public static boolean isNotEmpty (String str) {
        return !isEmpty(str);
    }

    /**
     * 判断字符串是否为空字符串
     * @param str
     * @return
     */
    public static boolean isBlank (String str) {
        return "".equals(str.trim());
    }

    /**
     * 判断字符串是否为非空字符串
     * @param str
     * @return
     */
    public static boolean isNotBlank (String str) {
        return !isBlank(str);
    }


    /**
     * 将字符串转为boolean类型
     * @param value
     * @param defaultValue  设置默认值，默认使用false
     * @return
     */
    public static Boolean toBoolean(String value, boolean defaultValue) {
        if (isEmpty(value))
            return defaultValue;

        try {
            return Boolean.parseBoolean(value);
        } catch (Exception e) {
            return defaultValue;
        }
    }

    /**
     * 将字符串转为boolean类型
     * @param value
     * @return
     */
    public static Boolean toBoolean(String value) {
        return toBoolean(value, false);
    }

    /**
     * 将字符串转为long类型
     * @param value
     * @param defaultValue 设置默认值
     * @return
     */
    public static Long toLong(String value, Long defaultValue) {
        if (isEmpty(value))
            return defaultValue;
        try {
            return Long.parseLong(value);
        }catch (Exception e) {
            return defaultValue;
        }
    }

    /**
     * 将字符串转为int类型
     * @param value
     * @param defaultValue 设置默认值
     * @return
     */
    public static Integer toInt(String value, Integer defaultValue) {
        if (isEmpty(value))
            return defaultValue;
        try {
            return Integer.parseInt(value);
        }catch (Exception e) {
            return defaultValue;
        }
    }

    /**
     * 将字符串转为double类型
     * @param value
     * @param defaultValue
     * @return
     */
    public static Double toDouble(String value, Double defaultValue) {
        if (isEmpty(value))
            return defaultValue;
        try {
            return Double.parseDouble(value);
        }catch (Exception e) {
            return defaultValue;
        }
    }

    /**
     * 将字符串转为float类型
     * @param value
     * @param defaultValue
     * @return
     */
    public static Float toFloat(String value, Float defaultValue) {
        if (isEmpty(value))
            return defaultValue;
        try {
            return Float.parseFloat(value);
        }catch (Exception e) {
            return defaultValue;
        }
    }
    /**
     * 将数组值按英文逗号拼接成字符串
     * @param array
     * @return
     */
    public static String join(Object[] array) {
        return join(array, ",","");
    }
    
    /**
     * 将数组值按指定分隔符拼接成字符串
     * @param array
     * @param delimiter 分割符，默认使用英文逗号
     * @return
     */
    public static String join(Object[] array, String delimiter) {

        return join(array, delimiter,"");
    }

    /**
     *  将数组值按指定分隔符拼接成字符串
     *       <br></br>
     *      <b>示例</b>： <br></br>
     *      array等于new String[]{"a","b"} <br></br>
     *      delimiter等于, <br></br>
     *      surround等于' <br></br>
     *      转换结果为：'a','b'
     * @param array
     * @param delimiter 分割符，默认使用英文逗号
     * @param surround 每个值左右符号，默认无
     * @return
     */
    public static String join(Object[] array, String delimiter, String surround) {
        if (array == null)
            throw new IllegalArgumentException("Array can not be null");

        if (array.length == 0) return "";

        if (surround == null) surround = "";

        if (delimiter == null) surround = ",";

        StringBuffer buffer = new StringBuffer();

        for (Object item : array) {
           buffer.append(surround).append(item.toString()).append(surround).append(delimiter);
        }

        buffer.delete(buffer.length() - delimiter.length(), buffer.length());

        return buffer.toString();
    }

    /**
     * Encode a string using algorithm specified in web.xml and return the
     * resulting encrypted password. If exception, the plain credentials
     * string is returned
     *
     * @param password Password or other credentials to use in authenticating
     *        this username
     * @param algorithm Algorithm used to do the digest
     *
     * @return encypted password based on the algorithm.
     */
    public static String encodePassword(String password, String algorithm) {
        byte[] unencodedPassword = password.getBytes();

        MessageDigest md = null;

        try {
            // first create an instance, given the provider
            md = MessageDigest.getInstance(algorithm);
        } catch (Exception e) {
            return password;
        }

        md.reset();

        // call the update method one or more times
        // (useful when you don't know the size of your data, eg. stream)
        md.update(unencodedPassword);

        // now calculate the hash
        byte[] encodedPassword = md.digest();

        StringBuffer buf = new StringBuffer();

        for (int i = 0; i < encodedPassword.length; i++) {
            if ((encodedPassword[i] & 0xff) < 0x10) {
                buf.append("0");
            }

            buf.append(Long.toString(encodedPassword[i] & 0xff, 16));
        }

        return buf.toString();
    }
    

	/**
	 * 随机产生0-99字符串
	 * @return
	 */
	public static String randomTwo(){
		Random random = new Random();
		int ran = random.nextInt(10);
		return String.valueOf(ran);
	}
	
	/**
	 * 获取随机生成8位数
	 * @return
	 */
	public static String rendomEignt(){
		StringBuffer sb = new StringBuffer();
		int ran=0;
		Random random = new Random();
		for(int i = 0; i < 8 ; i++ ){
			ran = random.nextInt(10);
			sb.append(ran);
		}
		return sb.toString();
	}
	
	/**
	 * 获取随机生成4位数
	 * @return
	 */
	public static String rendomFour(){
		StringBuffer sb = new StringBuffer();
		int ran=0;
		Random random = new Random();
		for(int i = 0; i < 4 ; i++ ){
			ran = random.nextInt(10);
			sb.append(ran);
		}
		return sb.toString();
	}
	
	/**
	 * 判断一个字符串的首字母是不是大写
	 * @param s 被判断的字符串
	 * @return boolean 返回true表示是，返回false表示否
	 */
	public static boolean isCapitalize(String s){
		if(s.charAt(0)>='A'  &&  s.charAt(0)<='Z'){
			return true;
		} else {
			return false;
		}
	}
	
	/**
	 * 判断一个对象是否是空，如果是空则返回true，否则返回false
	 * @param obj
	 * @return boolean
	 */
	public static boolean isNull(Object obj){
		if(null==obj){
			return true;
		} else if(obj instanceof String){
			if("".equals(((String)obj).trim()) || "null".equals(((String)obj).trim().toLowerCase()))
				return true;
			return false;
		} else if(obj instanceof List){
			if(((List<?>)obj).isEmpty())
				return true;
			return false;
		} else if(obj instanceof HashSet){
			if(((HashSet<?>)obj).isEmpty())
				return true;
			return false;
		} else if(obj instanceof HashMap){
			if(((HashMap<?,?>)obj).isEmpty())
				return true;
			return false;
		} else if(obj instanceof Set){
			if(((Set<?>)obj).isEmpty())
				return true;
			return false;
		} else {
			return false;
		}
	}
	/**
	 * 排除null字符串
	 * @data 2015年1月13日
	 * @version 1.0
	 * @param s 字符串
	 * @return String 排除了null的字符串
	 */
	public static String excludeNullStr(String s){
		if(null==s || "".equals(s.trim()) || "null".equals(s.trim().toLowerCase())){
			return null;
		} else {
			return s;
		}
	}
	/**
	 * 获取字符串
	 * @param obj 所有对象
	 * @return String 字符串
	 */
	public static String getString(Object obj){
		if(null!=obj)
			return obj.toString().trim();
		return "";
	}
	
	/**
	 * 获取整型
	 * @param obj
	 * @return int
	 */
	public static int getInt(Object obj){
		if(null==obj || "".equals(obj.toString().trim())){
			return 0;
		} else {
			return Integer.valueOf(obj.toString().trim());
		}
	}
	
	/**
	 * 获取浮点小数
	 * @param obj
	 * @return double
	 */
	public static double getDouble(Object obj){
		if(null==obj || "".equals(obj.toString().trim())){
			return 0d;
		} else {
			return Double.valueOf(obj.toString().trim()).doubleValue();
		}
	}
	
	/**
     * 判断字符串是否表示ture,如果是则返回true,如果不是则返回false
     * @param s 待判断字符串
     * @return boolean 结果
     */
    public static boolean isTrue(String s){
    	if(!isNull(s)){
    		if(("true".equals(s.trim().toLowerCase()))){
    			return true;
    		} else if(("false".equals(s.trim().toLowerCase()))){
    			return false;
    		} else {
    			try {
					throw new Exception("字符串：" + s + "，并不是boolean类型！" );
				} catch (Exception e) {
					e.printStackTrace();
				}
    		}
    	}
    	return false;
    }
    
    /**
	 * 获取长整型
	 * @param s 字符串
	 * @return Long
	 */
	public static Long getLong(String s){
		if(null!=s && !"".equals(s)){
			return Long.valueOf(s.trim());
		}
		return 0L;
	}
	
	/**
	 * 判断一个字符串是否存在一个数组当中
	 * @param str 字符串
	 * @param ss 数组
	 * @return boolean 返回true表示存在；返回false表示不存在
	 */
	public static boolean isExist(String str, String[] ss){
		boolean isExit = false;
		for(String s : ss){
			if(str.equals(s)){
				isExit = true;
				break;
			}
		}
		return isExit;
	}
	
	/**
     * double类型取小数点后面几位
     * @param val 指定double型数字
     * @param precision 取前几位
     * @return 转换后的double数字
     */
    public static Double roundDouble(double val, int precision) {   
        Double ret = null;   
        try {   
            double factor = Math.pow(10, precision);   
            ret = Math.floor(val * factor + 0.5) / factor;   
        } catch (Exception e) {   
            e.printStackTrace();   
        }   
  
        return ret;   
    }
	/**
	 * 获得class的绝对路径
	 * @return String class的绝对路径
	 */
	public static String getClassRootPath(){
		String rootPath = Thread.currentThread().getContextClassLoader().getResource("").getPath();
		rootPath = rootPath.substring(1, rootPath.length()).replaceAll("%20", " ");
		return rootPath;
	}
    
	/**
	 * 将整数转换成字符串
	 * @param n 整数
	 * @param leng 指定字符串长度
	 * @return String 字符串
	 */
	public static String intToString(int n, int leng){
		String s = Integer.valueOf(n).toString();
		while(s.length()<leng){
			s = "0"+s;
		}
		return s;
	}
	/**
	 * 将空字符串变成null
	 * @param s
	 * @return String
	 */
	public static String setEmptyToNull(String s) {
		if("".equals(s)){
			return null;
		}else{
			return s;
		}
	}
	
	/**
	 * 将null变成空字符串
	 * @param s
	 * @return String
	 */
	public static String setNullToEmpty(String s) {
		if(s == null){
			return "";
		}else{
			return s;
		}
	}
	
	/**
	 * 去前后空格，排除null的字符串
	 * @param s 字符串
	 * @return String 字符串
	 */
	public static String trimNull(String s){
		if(null==s){
			return null;
		}
		return setEmptyToNull(s.trim());
	}
	/**
	 * 将数组转换成字符串
	 * @param obj
	 * @return String
	 */
	public static String ArrayToStr(char[] obj){
		StringBuffer sb = new StringBuffer();
		if(null!=obj && obj.length>0){
			for(int i=0;i<obj.length;i++){
				sb.append(String.valueOf(obj[i]));
			}
		}
		return sb.toString();
	}
	/**
	 * 验证是否输入数字
	 * @param str
	 * @return
	 */
	public static boolean isNumeric(String str){
		  for (int i = str.length();--i>=0;){   
		   if (!Character.isDigit(str.charAt(i))){
		    return true;
		   }
		  }
		  return false;
		 }
	
	/**
	 * 获取UUID
	 * @return
	 */ 
	public static String getUUID(){
        
//		return UUID.randomUUID().toString().replace("-", "").toUpperCase();  //大写
		return UUID.randomUUID().toString().replace("-", "");
	}
	/* 
	 * 两个字符串数字相加
	 */
	public static String numberAdd(String num1,String num2,int decimal_num)
	{
		return  new BigDecimal(num1).add(new BigDecimal(num2)).setScale(decimal_num).toString();
	}
	/*
	 * 两个字符串数字相减
	 */
	public static String numberSub(String num1,String num2,int decimal_num)
	{
		return  new BigDecimal(num1).subtract(new BigDecimal(num2)).setScale(decimal_num).toString();
	}
	/*
	 * 两个字符串数字相乘
	 */
	public static String numberMul(String num1,String num2,int decimal_num)
	{
		return  new BigDecimal(num1).multiply(new BigDecimal(num2)).setScale(decimal_num).toString();
	}
	/*
	 * 两个字符串数字相除
	 */
	public static String numberDiv(String num1,String num2,int decimal_num)
	{
		return  new BigDecimal(num1).divide(new BigDecimal(num2)).setScale(decimal_num).toString();
	}
	/*
	 * 两个字符串数字比较大小
	 * 
	 */
	public static int numberCom(String num1,String num2)
	{
		return  new BigDecimal(num1).compareTo(new BigDecimal(num2));
	}
    
}

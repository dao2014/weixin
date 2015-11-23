package com.jfinal.weixin.tools.util;

import java.text.DateFormat;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Date;
import java.util.GregorianCalendar;


/**
 *  时间工具
 * @author malongbo
 */
public final class DateUtils { 
	/**
	 * 时间格式 
	 */
	public final static String TIME_FORMAT = "HH:mm:ss:SS";

	/**
	 * 缺省短日期格式
	 */
	public final static String DEFAULT_SHORT_DATE_FORMAT = "yyyy-MM-dd";

	/**
	 * yyyy-MM-dd HH:mm:ss格式数据。
	 */
	public final static String DEFAULT_DATE_TIME_FORMAT = "yyyy-MM-dd HH:mm:ss";
	
	private static DateFormat ddMMyyyySS = new SimpleDateFormat(
			"yyyyMMddHHmmss");
	private static DateFormat  zstr = new SimpleDateFormat(
			DEFAULT_DATE_TIME_FORMAT);

	/**
	 * yyyy-MM-dd格式数据。
	 */
	public final static String DATE_ONLY_FORMAT = "yyyy-MM-dd";
	/**
	 * 缺省短日期格式
	 */
	public final static String DEFAULT_SHORT_DATE_FORMAT_ZH = "yyyy年M月d日";

	/**
	 * 日期字符串（yyyyMMdd HHmmss）
	 */
	public static final String YEAR_TO_SEC_UN_LINE = "yyyyMMdd HHmmss";
	
	/**
	 * 缺省长日期格式
	 */
	public final static String DEFAULT_LONG_DATE_FORMAT = DEFAULT_SHORT_DATE_FORMAT
			+ " " + TIME_FORMAT;

	/**
	 * Java能支持的最小日期字符串（yyyy-MM-dd）。
	 */
	public final static String JAVA_MIN_SHORT_DATE_STR = "1970-01-01";

	/**
	 * Java能支持的最小日期字符串（yyyy-MM-dd HH:mm:ss:SS）。
	 */
	public final static String JAVA_MIN_LONG_DATE_STR = "1970-01-01 00:00:00:00";

	
	
	public static Date formateStr(String dateStr){
		Date date=null;
		try {
			date = ddMMyyyySS.parse(dateStr);
		} catch (ParseException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		return date;
	}
	
	/**
	 * 
	 * @param date  2013-11-07 14:14:14
	 * @return 20131107141414
	 */
	public static String formateDate( Date date ) {
		String str1= "";
		try {
			str1 = ddMMyyyySS.format(date);
		} catch (Exception e) {
			e.printStackTrace();
		}  
		  return str1;
	}
	
	/**
     * 返回分钟时间计算    结束时间  - 开始时间 
     * @param beginT   开始时间
     * @param endT     结束时间
     * @return
     */
    public static int dateminuteDiff(Date beginT,Date endT){
    	Long diffbttow = (endT.getTime()-beginT.getTime())/1000/60;
    	return diffbttow.intValue();
    }
	
	/**
     * 返回秒 时间计算               结束时间-开始时间
     * @param begin   开始时间
     * @param end     结束时间
     * @return
     */
    public static int dateSecondDiff(Date beginT,Date endT){
    	Long diffbttow = (endT.getTime()-beginT.getTime())/1000;
//    	int difference=end.get(Calendar.SECOND)-begin.get(Calendar.SECOND);
    	return diffbttow.intValue();
    }
    
    public void ss(){
    }
	/**
	 * 测试
	 * 
	 * @param args
	 */
	public static void main(String args[]) {
		int se = dateminuteDiff(formateStr("20151122220100"),formateStr("20151122220000"));
		System.out.println(se);
	}

    
}

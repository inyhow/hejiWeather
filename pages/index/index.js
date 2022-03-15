//获取应用实例
const util = require('../../utils/utils.js');
var app = getApp()
var day = ["今天", "明天", "后天"];
Page({
  data: {
    //初始化数据
    hideNotice: false,
    day: day,
  },
  onLoad: function () {
    var that = this
    that.getLocation();
  },

  //获取经纬度方法
  getLocation: function () {
    var that = this
    wx.getLocation({
      type: 'wgs84',
      success: function (res) {
        var latitude = res.latitude
        var longitude = res.longitude
        that.getCity(latitude, longitude);	
		
      },
      fail:function(e){
		 wx.showModal({
			 title:'定位失败',
			 showCancel:false,
			 content:'微信的定位服务没有打开，请在系统设置中允许"微信"使用定位服务,和 迹默认为您展示北京天气信息。',
		 })
		//默认获取失败的时候，获取北京市东城区经纬度信息
        that.getCity('39.90', '116.40');
      }
    })
  },
  //获取城市信息
  getCity: function (latitude, longitude) {
    var that = this
    var url = "https://apis.map.qq.com/ws/geocoder/v1/";
    var params = {
      key: "TBHBZ-KV3C6-UD4SZ-EHSPX-QCHT7-FCBNQ",
      location: latitude + "," + longitude
    }
    wx.request({
      url: url,
      data: params,
      success: function (res) {
        var city = res.data.result.address_component.city;
        var district = res.data.result.address_component.district;
        var street = res.data.result.address_component.street;

        that.setData({
          city: city,
          district: district,
          street: street,
        })

        var descCity = city.substring(0, city.length - 1);
        that.cityLookup(descCity);
      },
      fail: function (res) { },
      complete: function (res) { },
    })
  },
  //获取城市编码
  cityLookup:function(city){
	 var that=this
	 var url = "https://geoapi.qweather.com/v2/city/lookup"
	 var params ={
		 location:city,
		 key:"5d6362a764bf42f4af0a1e8773113c93"
	 }
	 wx.request({
		 url:url,
		 data:params,
		 success: function(res){
			that.getWeahter(city,res.data.location[0]["id"]);
		 }
	 })
  },
  //获取3天 天气信息
  getWeahter: function (descCity,cityid) {
    var that = this
	var url ="https://devapi.qweather.com/v7/weather/3d"
    var params = {
      location:  cityid,
      key: "5d6362a764bf42f4af0a1e8773113c93" }
    wx.request({
      url: url,
      data: params,
      success: function (res) {

		var tmpmax =res.data.daily[0].tempMax;
		var tmpmin =res.data.daily[0].tempMin;
		var txt  = res.data.daily[0].textDay; 
		var dir = res.data.daily[0].windDirDay;
		var sc = res.data.daily[0].windScaleDay; //风向等级
		var hum = res.data.daily[0].humidity; //相对湿度
		var fxdate =res.data.daily[0].fxDate; //日期
		var xq = util.getWeekByDate(new Date());
		
        var daily_forecast = res.data.daily;
		
        that.setData({
          tmpmax: tmpmax,
          tmpmin: tmpmin,
          txt: txt,
          dir: dir,
          sc: sc,
          hum: hum,
		  fxdate:fxdate,
		  xq:xq,
          daily_forecast: daily_forecast
        })
        that.getWeahterAir(cityid);
      },
      fail: function (res) { },
      complete: function (res) { },
    })
  },
  //获取空气质量
  getWeahterAir: function (cityid) {
    var that = this
    var url ="https://devapi.qweather.com/v7/air/now"
	
	var params = {
      location: cityid,
      key: "5d6362a764bf42f4af0a1e8773113c93"}
    wx.request({
      url: url,
      data: params,
      success: function (res) {
		var aqi =res.data.now.aqi;
        var qlty = res.data.now.category;
        that.setData({
		  aqi:aqi,
          qlty: qlty,
        })
		that.getLifeIndex(cityid);	
      },
      fail: function (res) { },
      complete: function (res) { },
    })
	
  },
  getLifeIndex: function(cityid){
	 var that=this
	 var url = "https://devapi.qweather.com/v7/indices/1d"
	 var params ={
		 type:"3,9,14,16",
		 location: cityid,
		 key:"5d6362a764bf42f4af0a1e8773113c93"}
	 wx.request({
		 url:url,
		 data:params,
		 success: function(res){
			var flu = res.data.daily[0].text;
			var dc = res.data.daily[1].text;
			var spi = res.data.daily[2].text;
			var lifestyle = res.data.daily;
			that.setData({
				flu: flu,
				dc: dc,
				spi: spi,
				lifestyle:lifestyle,
			})
		 }
	 })
  },
  //下拉刷新
  onPullDownRefresh: function () {
    var that = this
    that.getLocation();
    //下拉刷新后回弹
    wx.stopPullDownRefresh();
  },
  // 点击关闭公告
  /*switchNotice: function () {
    this.setData({
      hideNotice: true
    })
  },*/
}
)


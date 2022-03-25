// pages/login/login.js
import request from '../../utils/request'
Page({

    /**
     * 页面的初始数据
     */
    data: {
        phone: '',
        password: ''
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {

    },
    // 表单项内容发生改变的回调
    handleInput(event) {
        // 为手机号输入框和密码框绑定相同的回调函数,然后通过不同的id属性进行辨别
        let type = event.currentTarget.id;
        this.setData({
            [type]: event.detail.value   //属性名为变量时用[]包裹;data里的属性名跟事件的id名相同.所有用变量type变量作为setData的属性名

        })
    },

    //登录的回调
    async login() {
        // 收集表单数据
        let { phone, password } = this.data; //对象的解构赋值
        //前端验证

        // 手机号码不能为空
        if (!phone) {
            wx.showToast({
                title: "手机号不能为空",
                icon: "none"
            })
            return; //因为wx.showToast是异步的任务,当手机号为空时不需要执行下面的代码,所以这里用return停止后面代码的运行
        }

        //定义正则表达式
        let phoneReg = /^[1][3,4,5,7,8][0-9]{9}$/;
        if (!phoneReg.test(phone)) {
            wx.showToast({
                title: "手机号格式错误",
                icon: "none"
            })
            return;
        }
        if (!password) {
            wx.showToast({
                title: "密码不能为空",
                icon: "none"
            })
            return;
        }



        //---------------------------后端验证---------------------------

        let result = await request("/login/cellphone", { phone, password, isLogin: true })
        if (result.code === 200) {
            wx.showToast({
                title: '登录成功'
            })
           

            //登录成功,将用户信息存储到本地
            wx.setStorageSync('userInfo', JSON.stringify(result.profile));

            // 存入本地的目的是有些接口需要登录才能调用，通过cookie验证是否已经登录
            // wx.setStorage({
            //     key: 'cookies',
            //     data: res.cookies,
            // });

            // 登录成功后跳转到用户个人中心
            wx.reLaunch({
                url: '/pages/personal/personal',
            });

        } else if (result.code === 400) {
            wx.showToast({
                title: '手机号错误',
                icon: 'none'
            })
        } else if (result.code === 502) {
            wx.showToast({
                title: '密码错误',
                icon: 'none'
            })
        } else {
            wx.showToast({
                title: '登录失败,请重新登录',
                icon: 'none'
            })
        }
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {

    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function () {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    }
})
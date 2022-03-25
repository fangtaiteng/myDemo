
import request from '../../utils/request'
Page({

    /**
     * 页面的初始数据
     */
    data: {
        userInfo: {},
        userDetail: {},
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        //读取用户的基本信息
        let userInfo = wx.getStorageSync('userInfo');
        if (userInfo) {
            this.setData({
                userInfo: JSON.parse(userInfo)
            })
        }
        this.getUserDetail(this.data.userInfo.userId)
        this.getUserMusic(this.data.userInfo.userId)
    },

    // 点击按钮跳转至登录界面
    toLogin() {
        wx.navigateTo({
            url: '/pages/login/login',
        });

    },

     // 获取用户详细信息
     async getUserDetail(userId) {
        let detail = await request('/user/detail',{uid:userId});
        this.setData({
            userDetail:detail.profile
        })
    },

    //获取用户歌单信息 
    async getUserMusic(userId){
        let info = await request('/user/playlist',{uid:userId});
        this.setData({
            userMusic:info.playlist
        })
    },

    // 跳转至歌单歌曲详情页
    toSongDetail(event){
        let sendId = event.currentTarget.dataset.send;
        wx.navigateTo({
            url:'/pages/songDetail/songDetail?recive='+sendId
        })
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
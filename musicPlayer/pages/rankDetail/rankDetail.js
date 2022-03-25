// pages/rankDetail/rankDetail.js
import request from '../../utils/request'
Page({
    /**
     * 页面的初始数据
     */
    data: {
        listId: '',
        refresDate: '',
        songRankData: []
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        let listId = options.listId;
        this.getToday();
        this.getRankListData(listId);
    },


    // 获取日期
    getToday() {
        let date = new Date();
        let today = date.toLocaleDateString()
        this.setData({
            refresDate: today
        })
    },

    // 获取歌单信息
    async getRankListData(listId) {
        let result = await request('/playlist/track/all', { id: listId, limit: 100 })
        console.log(result)
        this.setData({
            songRankData:result.songs
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
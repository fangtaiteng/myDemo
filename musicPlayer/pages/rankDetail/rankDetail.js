// pages/rankDetail/rankDetail.js
import request from '../../utils/request';
import pubSub from 'pubsub-js';
let index = 0;
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
        //订阅来自play页面发布的消息
        pubSub.subscribe('switchType', (msg, type) => {
            let songRankData = this.data.songRankData;
            // 更新下标
            if (type === 'pre') {
                (index === 0) && (index = songRankData.length);
                index -= 1;
            } else if (type === 'next') {
                (index === songRankData.length - 1) && (index = -1)
                index += 1;
            }
            let musicId = songRankData[index].id;
            // 将musicId回传给play页面
            pubSub.publish('musicId', musicId)
        })
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
        wx.showLoading({
            title: '加载中',
            mask: true,
        });
        let result = await request('/playlist/track/all', { id: listId, limit: 100 })
        console.log(result)
        this.setData({
            songRankData: result.songs
        })
    },
    // 跳转至播放页面
    toPlay(event) {
        let musicId = event.currentTarget.dataset.musicid;
        let index = event.currentTarget.dataset.index;    //拿到通过点击传到事件对象里的数据
        this.setData({
            index
        })
        // 路由跳转传参:query参数 
        wx.navigateTo({
            url: "/pages/play/play?musicId=" + musicId
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
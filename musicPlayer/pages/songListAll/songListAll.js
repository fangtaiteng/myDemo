// pages/songListAll/songListAll.js
import request from "../../utils/request"
Page({

    /**
     * 页面的初始数据
     */
    data: {
        songListData: {},
        end: ''
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        let url = options.url;
        console.log(options)
        this.getSongList(url);
    },
    // 获取歌单列表
    async getSongList(url) {
        let result = await request(url);
        if (url == "/top/playlist/highquality") {
            this.setData({
                songListData: result.playlists.slice(0, 48),
            })
        }else if(url =="/personalized"){
            this.setData({
                songListData:result.result
            })
        }

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
// pages/recommendSong/recommendSong.js
import request from "../../utils/request";
import pubSub from 'pubsub-js';
Page({
    /**
     * 页面的初始数据
     */
    data: {
        SongDetailData: {},
        index: 0
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {

        // 判断是否有通过事件给options传参数，进而判断是每日推荐的歌单还是其他歌单
        if (options.hasOwnProperty('recive')) {
            let reciveid = options.recive;
            this.getSongDetail(reciveid);
        }
        else {
            // 判断用户是否登录
            let userInfo = wx.getStorageSync('userInfo');
            if (!userInfo) {
                wx.showToast({
                    title: '请先登录',
                    icon: 'none',
                    success: () => {
                        // 跳转至登录界面
                        wx.reLaunch({
                            url: '/pages/login/login'
                        })
                    }
                })
            }
            else {
                this.getRecommenSong();
            }
        }

        //订阅来自play页面发布的消息
        pubSub.subscribe('switchType', (msg, type) => {
            let songList = this.data.SongDetailData;
            let index = this.data.index;
            if (type === 'pre') {
                (index === 0) && (index = songList.length);
                index -= 1;
            } else if (type === 'next') {
                (index === songList.length - 1) && (index = -1)
                index += 1;
            }
            // 更新下标
            this.setData({
                index
            })
            let musicId = songList[index].id;
            // 将musicId回传给play页面
            pubSub.publish('musicId', musicId)
        })
    },

    //获取每日推荐歌曲
    async getRecommenSong() {
        wx.showLoading({
            title: '加载中',
            mask: true,
        });
        let recommendSong = await request('/recommend/songs');
        this.setData({
            SongDetailData: recommendSong.data.dailySongs
        })
    },

    // 获取任意歌单歌曲
    async getSongDetail(id) {
        wx.showLoading({
            title: '加载中',
            mask: true,
        });
        let SongDetail = await request('/playlist/track/all', { id });
        this.setData({
            SongDetailData: SongDetail.songs
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
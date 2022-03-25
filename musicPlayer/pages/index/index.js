// pages/index/index.js
import requst from '../../utils/request'
Page({

    /**
     * 页面的初始数据
     */
    data: {
        bannerList: [],//轮播图数据
        recommendList: [],//推荐歌单数据
        topList: [],//排行榜数据
        hightqualityUrl:'/top/playlist/highquality',    //精品歌单接口
        recommendUrl:'/personalized',            //推荐歌单接口
        songDetail:'/recommend/songs'
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: async function (options) {
        // 获取轮播图数据
        let bannerListData = await requst('/banner', { type: 2 });
        this.setData({
            bannerList: bannerListData.banners
        })
        // 获取推荐歌单数据
        let recommendListData = await requst('/personalized', { limit: 10 });
        this.setData({
            recommendList: recommendListData.result
        })
        // 获取排行榜数据
        let topListData = await requst('/toplist/detail');
        let topListSlice = topListData.list.slice(0, 4);
            this.setData({
                topList: topListSlice
            })
    },

    // 跳转至推荐页
    toSongDetail(){
        wx.navigateTo({
          url:"/pages/songDetail/songDetail"
        });
    },
    // 跳转至排行榜详情页
    toRankDetail(event){  
        let listId = event.currentTarget.dataset.listid;       //通过data-listId传给event.currentTarget.dataset的”键“大写会变成小写
        wx.navigateTo({
        url: '/pages/rankDetail/rankDetail?listId='+listId
        });
    },

    // 跳转至精品歌单详情页
    toSongListAll(event){
        let url = event.currentTarget.dataset.url;
        wx.navigateTo({
            url:'/pages/songListAll/songListAll?url='+url
        })
    },


     // 跳转至歌单歌曲详情页
     toSongDetail(event){
        let sendId = event.currentTarget.dataset.send;
        wx.navigateTo({
            url:'/pages/songDetail/songDetail?recive='+sendId
        })
    },

    //跳转至每日推荐页
    toRecommendDetail(){
        wx.navigateTo({
            url:'/pages/songDetail/songDetail'
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
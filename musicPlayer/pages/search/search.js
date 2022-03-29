// pages/search/search.js
import request from "../../utils/request";
import pubSub from 'pubsub-js';
let isSend = false;             //节流防抖用 
let index = 0;
Page({

    /**
     * 页面的初始数据
     */
    data: {
        defaultKeyword: '',           //搜索框默认值
        hotSearchList: [],            //热搜列表
        inputContent: '',             //搜索框内容
        searchList: [],               //搜索结果数据
        searchSuggestList: [],
        inputValue: '',                //搜索框的值
        historyArr: [],               //搜索历史               


    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        //初始化页面数据
        this.getDefaultKeyword();       //加载搜索框默认关键词
        this.getHotSearchList();        //加载热搜列表
        this.getLocalHistory();         //加载搜索历史记录
        //订阅来自play页面发布的消息
        pubSub.subscribe('switchType', (msg, type) => {
            let searchList = this.data.searchList;
            // 更新下标
            if (type === 'pre') {
                (index === 0) && (index = searchList.length);
                index -= 1;
            } else if (type === 'next') {
                (index === searchList.length - 1) && (index = -1)
                index += 1;
            }
            let musicId = searchList[index].id;
            // 将musicId回传给play页面
            pubSub.publish('musicId', musicId)
        })
    },

    // 获取搜索框默认关键词
    async getDefaultKeyword() {
        let defaultKeyword = await request('/search/default');
        this.setData({
            defaultKeyword: defaultKeyword.data.showKeyword,
        })
    },

    //  获取热搜列表
    async getHotSearchList() {
        let hotSearchList = await request('/search/hot/detail');
        this.setData({
            hotSearchList: hotSearchList.data
        })
    },

    //处理搜索框内容改变
    hanleInputChange(event) {
        let value = event.detail.value.trim();
        this.setData({
            inputContent: value,
            searchList:[]
        })
        if (isSend) {
            return
        }
        isSend = true;
        this.getSearchSuggestList();
        // 函数节流
        setTimeout(async () => {
            isSend = false;
        }, 300);

    },

    // 获取搜索建议
    async getSearchSuggestList() {
        if (this.data.inputContent!='') {
            let searchSuggestList = await request('/search/suggest', { keywords: this.data.inputContent, type: 'mobile' });
            this.setData({
                searchSuggestList: searchSuggestList.result.allMatch,
                isDone:true
            })
        }

    },

    // 获取搜索数据的功能函数
    async getSearchList() {
        let searchList = await request('/cloudsearch', { keywords: this.data.inputContent });
        this.setData({
            searchList: searchList.result.songs
        })
    },

    // 清空搜索框函数
    clearInput() {
        this.setData({
            inputContent: '',
            inputValue: '',
            searchList: []
        })
        console.log('123')
    },

    // 将历史记录存入本地
    setLocalHistory() {
        if (this.data.inputContent !== '') {
            // 将搜索历史记录存入本地
            let historyItem = this.data.inputContent;
            let historyArr = this.data.historyArr;
            if (historyArr.indexOf(historyItem) !== -1) {
                historyArr.splice(historyArr.indexOf(historyItem), 1)
            }
            historyArr.unshift(historyItem)
            wx.setStorageSync('searchHistory', historyArr);
            this.getLocalHistory();
        }

    },

    // 获取本地历史记录
    getLocalHistory() {
        let localHistory = wx.getStorageSync('searchHistory');
        if (localHistory.length !== 0) {
            this.setData({
                historyArr: localHistory
            })
        }
    },

    // 清除历史记录
    clearHistory() {
        wx.setStorageSync('searchHistory', []);
        this.setData({
            historyArr: []
        })
    },

    // 焦点在input框中时清除搜索的结果
    handleFocus() {
        this.setData({
            searchList: []
        })
        this.getSearchSuggestList();

    },
    // 点击历史记录或者热搜列表进行搜索
    tapToSearch(event) {
        let keyword = event.currentTarget.dataset.keyword;
        this.setData({
            searchSuggestList: [],
            inputContent: keyword,
            inputValue: keyword
        })
        this.setLocalHistory();
        this.getSearchList();
        // setTimeout(() => {
        //     this.getSearchSuggestList();
        // }, 1000)
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
        console.log(event)
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
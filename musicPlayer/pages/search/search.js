// pages/search/search.js
import request from "../../utils/request";
let isSend = false;             //节流防抖用
Page({

    /**
     * 页面的初始数据
     */
    data: {
        defaultKeyword: '',         //搜索框默认值
        hotSearchList: [],           //热搜列表
        inputContent: '',             //搜索框内容
        searchList: [],                 //搜索结果数据
        inputValue:''                   //搜索框的值
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        //初始化页面数据
        this.getDefaultKeyword();
        this.getHotSearchList();
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
            inputContent: value
        })
        if (isSend) {
            return
        }
        isSend = true;
        this.getSearchList();
        // 函数节流
        setTimeout(async () => {
            isSend = false;
        }, 300);
        // if (this.inputContent == '') {
           
        // }

    },

    // 获取搜索数据的功能函数
    async getSearchList() {
        if (this.data.inputContent != '') {
            let searchList = await request('/search', { keywords: this.data.inputContent, limit: 10 });
            this.setData({
                searchList: searchList.result.songs
            })
        }else{
             this.setData({
                searchList: []
            })
        }
    },

    // 清空搜索框函数
    clearInput(){
        this.setData({
            inputContent:'',
            inputValue:'',
            searchList:[]
        })
        console.log('123')
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
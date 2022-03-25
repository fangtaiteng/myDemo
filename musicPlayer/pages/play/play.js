// pages/play/play.js
import request from '../../utils/request';
import pubSub from 'pubsub-js';
import moment from 'moment';
let index = 0;
Page({
    /**
     * 页面的初始数据
     */
    data: {
        isPlay: true,
        song: {},
        musicId: '',
        musicLink: '',
        musicTotalTime: '00:00',
        currentTime: '00:00',
        timeNow: 0,
        currentLength: 0,
        lineNow: 0,
        lyrics: [],
        scrollIntoView: '',
        scrollTop:''
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        let musicId = options.musicId;  // options:用于接收路由跳转的query参数
        this.setData({
            musicId
        })
        // 创建控制音乐播放的实例
        this.backgroundAudioManager = wx.getBackgroundAudioManager();   //定义到页面上，解决作用域问题
        this.getMusicInfo(this.data.musicId); //获取音乐信息
        // 监听音乐播放/暂停/停止
        this.backgroundAudioManager.onPlay(() => {
            // 修改音乐是否播放的状态
            this.setData({
                isPlay: true
            })
        });
        this.backgroundAudioManager.onPause(() => {
            this.setData({
                isPlay: false
            })
        });
        this.backgroundAudioManager.onStop(() => {
            this.setData({
                isPlay: false
            })
        });
        // 监听音乐播放自然结束
        this.backgroundAudioManager.onEnded(() => {
            // 自动切换至下一首歌，并自动播放
            pubSub.publish('switchType', 'next');
            pubSub.subscribe('musicId', (msg, musicId) => {
                // this.setData({
                //     musicId //更新musicId
                // })
                console.log(musicId);
                console.log(this.data.isPlay)
                this.getMusicInfo(musicId);
                this.playMusic(this.data.isPlay, musicId); //播放音乐
                // 取消订阅
                pubSub.unsubscribe('musicId')
            })

            // 将实时进度条的长度
        })
        // 监听音乐实时播放的进度
        this.backgroundAudioManager.onTimeUpdate(() => {
            let currentTime = moment(this.backgroundAudioManager.currentTime * 1000).format('mm:ss')  //moment接收的参数是毫秒
            let currentLength = this.backgroundAudioManager.currentTime / this.backgroundAudioManager.duration * 460;
            let timeNow = parseInt(this.backgroundAudioManager.currentTime);
            this.setData({
                currentTime,
                currentLength,
                timeNow
            })

            if (timeNow == this.data.lyrics[index].time) {
                console.log(this.data.lyrics[index].content)
                this.lineHigh();
                index += 1;
                if (index == this.data.lyrics.length) {
                    index = 0;
                    this.setData({
                        lineNow: 0,
                        scrollTop:0     //当歌曲播放完毕歌词滚回顶部
                    })
                }
            }

        })
    },

    // 获取音乐详情，歌词，播放链接
    async getMusicInfo(musicId) {
        /*-------------------------------获取音乐详细信息---------------------------------------*/
        let getSongDetail = await request('/song/detail', { ids: musicId });
        let musicTotalTime = moment(getSongDetail.songs[0].dt).format('mm:ss')  //获取音乐时长并调整格式
        this.setData({
            song: getSongDetail.songs[0],
            musicTotalTime
        });
        /*-------------------------------获取歌词----------------------------------------*/
        let getLyric = await request('/lyric', { id: musicId });
        let lyric = getLyric.lrc.lyric;
        // 处理歌词，转化成key为时间，value为歌词的对象
        let lyricArr = lyric.split('[').slice(1);  //先将歌词以[分割
        let lyrics = [];
        lyricArr.forEach(element => {
            let arr = element.split(']');//以]分割，将时间跟歌词分开
            // 将时间换算成秒
            let min = parseInt(arr[0].split(':')[0]);  //取得分
            let sec = parseInt(arr[0].split(':')[1]); //取得秒
            let msec = parseInt(arr[0].split('.')[1])   //取得毫秒
            arr[0] = parseInt(((min * 60 + sec) * 1000 + msec) / 1000);        //求得总时间（ms）
            //去除空行
            if (arr[1] != '\n') {
                arr[1] = arr[1].replace('\n', '');//去除歌词中的换行符
                lyrics.push({ 'time': arr[0], 'content': arr[1] })
            }
        });
        this.setData({
            lyrics
        })

        /*- ------------------------------ 获取音乐播放链接-------------------------------*/
        // if (isPlay) {
        let musicLinkData = await request('/song/url', { id: musicId });
        let musicLink = musicLinkData.data[0].url;
        this.setData({
            musicLink
        })
        this.playMusic(musicLink); //播放音乐
    },

    // 播放音乐功能
    playMusic(musicLink) {
        this.backgroundAudioManager.src = musicLink;
        this.backgroundAudioManager.title = this.data.song.name;
    },


    // 点击播放/暂停的回调
    playOrStop() {
        let isPlay = this.data.isPlay;
        if (isPlay == false) {
            // this.backgroundAudioManager.src = this.data.musicLink;
            // this.backgroundAudioManager.title = this.data.song.name;
            // this.playMusic(this.data.musicLink)
            this.backgroundAudioManager.play();
        } else {
            this.backgroundAudioManager.pause();
        }
        console.log(isPlay)
    },

    //切歌的回调函数
    handlerSwitch(event) {
        let type = event.currentTarget.id;
        this.backgroundAudioManager.stop();
        index=0;
        // 订阅来自songDetail页面的musicId
        pubSub.subscribe('musicId', (msg, musicId) => {
            this.setData({
                musicId //更新musicId   
            })
            console.log(musicId);
            this.getMusicInfo(musicId); //获取新音乐信息
            this.setData({
                scrollTop:0
            })
                   //切歌时将index归零，重新遍历歌词
            // this.playMusic(musicLink); //播放音乐   
            // this.playMusic(this.data.isPlay, musicId);     在真机上需要设置为this.data.isPlay才能自动播放下一首
            // this.playMusic(this.data.isPlay, musicId);     在开发工具模拟器上需要设置为！this.data.isPlay才能自动播放下一首

            // 取消订阅
            pubSub.unsubscribe('musicId')
        })
        // 发送数据给songDetail页面
        pubSub.publish('switchType', type)
    },

    // 当前歌词高亮
    lineHigh() {
        let lyrics = this.data.lyrics;
        let lineNow = this.data.lineNow;      //获取歌词
        if (lineNow > 0) {
            lyrics[lineNow - 1].cla = '';
            lyrics[lineNow - 1].id = '';
        }
        lyrics[lineNow].cla = 'highLight';
        lyrics[lineNow].id = 'scrollToCurrent'
        // console.log('123',lyrics)
        this.setData({
            lyrics,
            lineNow: lineNow + 1,
            scrollIntoView: 'scrollToCurrent'

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
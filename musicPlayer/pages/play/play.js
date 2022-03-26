// pages/play/play.js
import request from '../../utils/request';
import pubSub from 'pubsub-js';
import moment from 'moment';
const appInstance = getApp();
Page({
    /**
     * 页面的初始数据
     */
    data: {
        isPlay: true,
        song: {},
        musicId: '',
        musicLink: '',
        musicTotalTime: 0,
        duration: '00:00',
        currentTime: '00:00',
        timeNow: 0,         //当前歌曲播放时间（秒格式）
        lineNow: 0,         //当前播放的歌词
        linePre: 0,          //上一句播放的歌词
        lyrics: [],
        scrollIntoView: '',
        scrollTop: '',
        value: 0,       //进度条的位置
        isSlide: true
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
            let offset = this.backgroundAudioManager.currentTime;
            this.setData({
                isPlay: false,
                offset
            })
        });


        this.backgroundAudioManager.onStop(() => {
            this.setData({
                isPlay: false
            })
        });


        // 监听音乐播放自然结束
        this.backgroundAudioManager.onEnded(() => {
            // 当前音乐播放结束，将歌词状态回归到初始状态
            this.setData({
                lineNow: 0,
                scrollTop: 0
            })
            // 自动切换至下一首歌，并自动播放
            pubSub.publish('switchType', 'next');
            pubSub.subscribe('musicId', (msg, musicId) => {
                console.log(musicId);
                console.log(this.data.isPlay)
                this.getMusicInfo(musicId);     //获取音乐信息并播放音乐
                // this.playMusic(musicId); //播放音乐
                // 取消订阅
                pubSub.unsubscribe('musicId')
            })
        })



        // 监听音乐实时播放的进度
        this.backgroundAudioManager.onTimeUpdate(() => {
            let currentTime = moment(this.backgroundAudioManager.currentTime * 1000).format('mm:ss')  //moment接收的参数是毫秒
            let timeNow = parseInt(this.backgroundAudioManager.currentTime);
            let value = this.backgroundAudioManager.currentTime;
            // console.log(value)
            // console.log(this.data.musicTotalTime)
            if (this.data.isSlide) {
                this.setData({
                    currentTime,
                    timeNow,
                    value
                })
            }
            this.lineHigh(timeNow);
        })

    },

    // 获取音乐详情，歌词，播放链接
    async getMusicInfo(musicId) {
        /*-------------------------------获取音乐详细信息---------------------------------------*/
        let getSongDetail = await request('/song/detail', { ids: musicId });
        let duration = moment(getSongDetail.songs[0].dt).format('mm:ss');  //获取音乐时长并调整格式
        let musicTotalTime = getSongDetail.songs[0].dt / 1000;
        // let musicTotalTime = getSongDetail.songs[0].dt;
        this.setData({
            song: getSongDetail.songs[0],
            duration,
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
        // 订阅来自songDetail页面的musicId
        pubSub.subscribe('musicId', (msg, musicId) => {
            this.setData({
                musicId, //更新musicId
                lineNow: 0,   //歌词回到初始状态  
                scrollTop: 0,   //歌词滚动条回到顶部
                value: 0,    //进度条归零
                currentTime: '00:00' //播放时间归零

            })
            console.log(musicId);
            this.getMusicInfo(musicId); //获取新音乐信息
            // 取消订阅
            pubSub.unsubscribe('musicId')
        })
        // 发送数据给songDetail页面
        pubSub.publish('switchType', type)
    },

    // 当前歌词高亮以及滚动
    lineHigh(currentTime) {
        let lyrics = this.data.lyrics;              //获取歌词
        let lineNow = this.data.lineNow;            //获取当前行
        if (lineNow < lyrics.length) {
            if (currentTime == lyrics[lineNow].time) {
                console.log(lyrics[lineNow])

                if (lineNow > 0) {
                    lyrics[lineNow - 1].cla = '';   //取消上一行的高亮
                    lyrics[lineNow - 1].id = '';    //取消上一行的滚动定位
                }
                lyrics[lineNow].cla = 'highLight';  //设置当前行高亮
                lyrics[lineNow].id = 'scrollToCurrent'      //滚动定位到当前行
                this.setData({
                    lyrics,
                    lineNow: lineNow + 1,
                    scrollIntoView: 'scrollToCurrent'
                })
            }
        }
    },


    //完成一次拖动进度条后触发的事件
    handleBindchange(event) {
        //滑动进度条去抖动
        setTimeout(() => {
            this.setData({
                isSlide: true,
            })
        }, 300)


        // this.setData({
        //     lyrics
        // })
        this.backgroundAudioManager.seek(event.detail.value)    //歌曲跳转到指定位置
        console.log(event.detail.value)
        for (let i = 0; i < this.data.lyrics.length; i++) {
            if (event.detail.value <= this.data.lyrics[i].time) {
                let linePre = this.data.linePre;
                let lyrics = this.data.lyrics;
                lyrics[linePre].cla = '';
                lyrics[linePre].id = '';
                this.setData({
                    lineNow: i,
                    lyrics
                })

                return;
            }
            // console.log("hhhhhhhhhhhhhhhhh", this.data.linePre);
            // console.log('1111111111111111', this.data.lineNow);

        }

    },
    //拖动进度条过程中触发的事件
    handleBindchanging(event) {
        let currentTime = moment(event.detail.value * 1000).format('mm:ss');
        // let linePre = this.data.linePre;
        let lineNow = this.data.lineNow;
        this.lineHigh(currentTime);
        this.setData({
            isSlide: false,     //暂停监听歌曲播放状态（去除拖动进度条时的抖动）
            currentTime,
            value: event.detail.value,
            linePre: lineNow
        })





        // console.log(this.data.isSlide)
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
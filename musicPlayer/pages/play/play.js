// pages/play/play.js
import request from '../../utils/request';
import pubSub from 'pubsub-js';
import moment from 'moment';
let appInst = getApp().globalData

Page({
    /**
     * 页面的初始数据
     */
    data: {
        isPlay: true,           //是否在播放音乐标识
        song: {},               //音乐信息
        musicId: '',            //音乐id
        musicLink: '',          //音乐播放链接
        musicTotalTime: 0,      //歌曲时长秒格式
        duration: '00:00',      //歌曲时长
        currentTime: '00:00',   //当前时间（进度条左边的时间）
        timeNow: 0,             //当前歌曲播放时间（秒格式）
        lyrics: [],             //歌词
        scrollIntoView: '',     //滚动到指定位置
        scrollTop: 0,           //滚动条位置
        value: 0,               //进度条的位置（当滑动进度条时等于进度条的value，当正常播放时为当前播放时间的秒格式）
        isSlide: true,          //是否滑动了进度条
        index: 0                //当前歌词下标
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        let musicId = options.musicId;  // options:用于接收路由跳转的query参数
        this.setData({
            musicId
        })

        if(this.data.musicId==appInst.musicId){
            this.setData({
                index:appInst.index
            })
        }

        // 创建控制音乐播放的实例
        this.backgroundAudioManager = wx.getBackgroundAudioManager();   //定义到页面上，解决作用域问题
        this.getMusicInfo(this.data.musicId); //获取音乐信息
        // 监听音乐播放/暂停/停止
        this.backgroundAudioManager.onPlay(() => {
            // 修改音乐是否播放的状态
            this.setData({
                isPlay: true,
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
                index: 0,
                scrollTop: 0
            })
            // 自动切换至下一首歌，并自动播放
            pubSub.publish('switchType', 'next');
            pubSub.subscribe('musicId', (msg, musicId) => {
                console.log(musicId);
                console.log(this.data.isPlay)
                this.getMusicInfo(musicId);     //获取音乐信息并播放音乐
                // 取消订阅
                pubSub.unsubscribe('musicId')
            })
        })

        // 监听音乐实时播放的进度
        this.backgroundAudioManager.onTimeUpdate(() => {
            let currentTime = moment(this.backgroundAudioManager.currentTime * 1000).format('mm:ss')  //moment接收的参数是毫秒
            // let timeNow = parseInt(this.backgroundAudioManager.currentTime);
            let value = this.backgroundAudioManager.currentTime;
            if (this.data.isSlide) {
                this.setData({
                    currentTime,
                    // timeNow,
                    value
                })
            }
            this.scrollLyrics();    //监听歌词状态
            // console.log(appInst)
        })

    },

    /************************************************获取音乐详情，歌词，播放链接*********************************************************************************/

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
        lyrics.push({ 'time': this.data.musicTotalTime })  //在歌词最后面添加一个对象，适配歌词歌词滚动
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

    /********************************************************播放音乐功能***************************************************/

    playMusic(musicLink) {
        this.backgroundAudioManager.src = musicLink;
        this.backgroundAudioManager.title = this.data.song.name;
    },

    /*******************************************************点击播放/暂停功能***********************************************/
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
        // console.log(isPlay)
    },

    /********************************************************切歌功能****************************************************/
    handlerSwitch(event) {
        let type = event.currentTarget.id;
        this.backgroundAudioManager.stop();
        // 订阅来自songDetail页面的musicId
        pubSub.subscribe('musicId', (msg, musicId) => {
            this.setData({
                musicId, //更新musicId 
                index: 0,   //歌词回到初始状态  

                value: 0,    //进度条归零
                currentTime: '00:00', //播放时间归零
                scrollIntoView: ''
            })
            // console.log(musicId);
            this.getMusicInfo(musicId); //获取新音乐信息
            setTimeout(() => {
                this.setData({
                    scrollTop: 0,   //歌词滚动条回到顶部
                })
            },500)

            // 取消订阅
            pubSub.unsubscribe('musicId')
        })
        // 发送数据给songDetail页面
        pubSub.publish('switchType', type)
    },
    /******************************************************进度条拖动功能*********************************************************/

    /*-------------------------------------滑动停止时的回调函数---------------------------------------------*/
    handleBindchange(event) {
        //滑动进度条去抖动
        setTimeout(() => {
            this.setData({
                isSlide: true,
                scrollIntoView: 'scrollToCurrent'   //更新scrollIntoView的值
            })
        }, 300)
        this.backgroundAudioManager.seek(event.detail.value)    //歌曲跳转到指定位置
        // console.log(event.detail.value)
        // console.log(this.data.lyrics)
    },

    /*------------------------------------滑动时触发的回调函数------------------------------------------------ */
    //拖动进度条过程中触发的事件
    handleBindchanging(event) {
        let value = event.detail.value;
        let currentTime = moment(value * 1000).format('mm:ss');
        let lyrics = this.data.lyrics;
        // 拖动时遍历歌词的每一项，先将所有歌词的样式去除
        for (let i = 0; i < lyrics.length; i++) {
            lyrics[i].cla = '';
            lyrics[i].id = '';
            if (i < lyrics.length - 1) {
                // 判断当前的时间在哪两段歌词之间
                if (value >= lyrics[i].time && value <= lyrics[i + 1].time) {
                    this.setData({
                        index: i        //更新歌词下表
                    })
                }
            }
        }
        this.setData({
            isSlide: false,     //暂停监听歌曲播放状态（去除拖动进度条时的抖动）
            currentTime,
            value,
            lyrics,
            scrollIntoView: 'scrollToCurrent'
        })

    },


    //******************************************* 滚动歌词功能函数**************************************************
    scrollLyrics() {
        let index = this.data.index;
        appInst.index = index;                    
        if (index < this.data.lyrics.length - 1) {
            if (this.data.lyrics[index].time == 0) {
                this.setData({
                    index: index + 1
                })
            }
            if (this.data.value >= this.data.lyrics[index].time && this.data.value <= this.data.lyrics[index + 1].time) {
                let lyrics = this.data.lyrics;
                lyrics[index].cla = 'highLight';        //为当前歌词添加cla属性，让当前歌词变色
                lyrics[index].id = 'scrollToCurrent';   //为当前歌词添加id属性，让歌词自动滚动到当前歌词
                if (index > 0) {
                    lyrics[index - 1].cla = ''             //取消上一句歌词样式
                    lyrics[index - 1].id = ''
                }
                console.log(this.data.lyrics[index])

                this.setData({
                    lyrics,
                    scrollIntoView: 'scrollToCurrent',      //每到一句歌词就需要动态更新scrollIntoView的值，歌词才会自动滚动到当前位置
                    index: index + 1
                })

                // console.log('1234')
            }
        }
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
           appInst.musicId = this.data.musicId;
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
import config from "./config";
export default (url, data = {}, method = 'GET') => {
    return new Promise((resolve, reject) => {
        wx.request({
            url: config.mobileHost + url,
            data,
            method,
            header:{
                //这里用自调用函数，自调用函数会自动调用，并将返回的值作为cookie的value
                cookie:(()=>{
                    // 判断本地存储中是否有cookies，如果有，返回想要的cookies
                    if(wx.getStorageSync('cookies')){
                        // 当本地中没有cookies时，用这个方法会报错，因为调用find()的不是一个数组
                        return wx.getStorageSync('cookies').find(item=> item.indexOf('MUSIC_U')!=-1)
                    }
                })()
            },
            success: (res) => {
                console.log("请求成功", res);
                // 判断是否为登录请求
                if(data.isLogin){
                    // 如果是登录请求，则将cookies存入本地
                    // 存入本地的目的是有些接口需要登录才能调用，通过cookie验证是否已经登录
                    wx.setStorage({
                        key: 'cookies',
                        data: res.cookies,
                    });
                }
                resolve(res.data);      
            },
            fail: (err) => {
                console.log('请求失败:', err);
                reject(err);
            }
        })
    })

}
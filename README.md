## 在线音乐小程序

​	基于微信开发者工具写的在线音乐播放器。

### 实现功能

**账号登陆**

​	使用网易云手机账号登陆，显示个人信息页面以及歌单信息。

**个性推荐**

​	每日推荐需要登陆账号之后才能显示，没有登陆账号点击每日推荐会自动跳转到登陆界面。

**播放音乐**

​	音乐播放/暂停/上一曲/下一曲/进度控制

​	歌词实时滚动显示

**搜索功能**

​	热搜榜显示（点击热搜歌曲可以直接搜索）

​	搜索历史（没有搜索历史记录则不会显示，可点击搜索记录直接搜索，可清除搜索记录）

### 技能&工具使用

​	promise，pubsub-js，es6语法，cookies，npm，钉钉内网穿透工具，微信开发者工具，vscode

### 后端接口

​	后端接口来源于第三方开源的网易云音乐api：[网易云音乐 NodeJS 版 API (neteasecloudmusicapi.js.org)](https://neteasecloudmusicapi.js.org/#/)

### UI界面

​	UI界面使用flex布局，样式参考来自自华为音乐以及网易云音乐移动端。

### 效果展示

**主页**

<img src="C:\Users\T-T\AppData\Roaming\Typora\typora-user-images\image-20220511151236999.png" alt="image-20220511151236999" style="zoom:25%;" />

**搜索页**

<img src="C:\Users\T-T\AppData\Roaming\Typora\typora-user-images\image-20220511151411233.png" alt="image-20220511151411233" style="zoom:25%;" />

**个人页**

<img src="C:\Users\T-T\AppData\Roaming\Typora\typora-user-images\image-20220511151442328.png" alt="image-20220511151442328" style="zoom:25%;" />

**推荐歌单详情页**

<img src="C:\Users\T-T\AppData\Roaming\Typora\typora-user-images\image-20220511151646885.png" alt="image-20220511151646885" style="zoom:25%;" />

**歌单详情页**

<img src="C:\Users\T-T\AppData\Roaming\Typora\typora-user-images\image-20220511151713539.png" alt="image-20220511151713539" style="zoom:25%;" />

**播放页**

<img src="C:\Users\T-T\AppData\Roaming\Typora\typora-user-images\image-20220511151810751.png" alt="image-20220511151810751" style="zoom:25%;" />

**动态效果**

<img src="C:\Users\T-T\Downloads\aaccd4611a9fcf6b2fd9ad2ac0970014_.gif" alt="aaccd4611a9fcf6b2fd9ad2ac0970014_" style="zoom: 50%;" />



<img src="C:\Users\T-T\Downloads\WeChat_20220511153417 (online-video-cutter.com)_.gif" alt="WeChat_20220511153417 (online-video-cutter.com)_" style="zoom:50%;" />
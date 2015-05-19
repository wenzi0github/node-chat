# password

虽然是实现的即时聊天，其实这个形式可以应用到更多的地方。比如服务器向用户实时推送消息，向某个或某些用户推送消息等。  

####2015/05/19 更新  
前几天弄在线简历的时候，发现html5里有两个属性能够获取图片的原始尺寸。以前，如果图片没有被压缩或者放大，正常展示时比较方便的获取图片的正常尺寸，可是如果设置了其他的尺寸，那就稍微的麻烦一些，得使用`new Image()`才能获取图片的原始尺寸。  

现在通过html5的naturalWidth和naturalHeight直接就能获取到图片的原始尺寸了，不管图片怎么被压缩和放大。  

```javascript
var img = document.getElementsByTagName('img');
var width = img.naturalWidth,
    height = img.naturalHeight;
console.log('原始宽:'+width+' ,原始高:'+height);
```

####2015/04/28 更新 
今天为聊天窗口添加了`发送窗口震动`功能。 
震动效果是使用CSS3的`animation`实现的： 

```css
.shake{
    -webkit-animation : wobble 0.4s ease;
    -moz-animation : wobble 0.4s ease;
    -o-animation : wobble 0.4s ease;
    animation : wobble 0.4s ease;
}
@-webkit-keyframes wobble{
    0%{ margin-left: -330px; }
    20%{ margin-left: -350px; }
    40%{ margin-left: -330px; }
    60%{ margin-left: -350px; }
    80%{ margin-left: -330px; }
    100%{ margin-left: -340px; }
}
/* ... */
```
用户点击发送震动按钮后，给聊天窗口添加`.shake`，使窗口触发CSS3的动画。同时，由于窗口震动会比较引起反感，影响正常的聊天功能，因此为震动按钮添加了时间间隔的限制，每次点击发送震动按钮后，时间间隔都会增加5s。不过，如果用户在3分钟内没有发送震动的话，时间间隔会置为0，重新开始。

####2015/04/19 更新 
今天添加了消息提醒的功能：当用户切换到其他标签页浏览器时，如果有别的用户发送过来消息，title就进行闪动，提示当前用户有新消息。

这个功能的实现主要使用到了html5中的visibilityChange事件，获取当前标签页的可见状态，如果visible=='hidden'就进行闪动，否则就清除闪动。当然，在这个事件下还能利用`video`标签添加提示音的功能，只是没有找到合适的提示音，暂时就不添加了。  

在这个过程中还发现了知识点（^_^）：setTimeout()和setInterval()这两个定时函数，在当前页面可见的状态下，基本能够按照设定的间隔执行，如果当前页面不可见时，时间间隔就会扩大1000ms，这是浏览器为了减少CPU的利用率而设定的。


目前已经实现的功能有：  
1. 登陆时能够选择头像和输入昵称；  
2. 在线用户列表中，自己的昵称排在最上面；  
3. 某一个用户登陆或者退出能够给其他用户提示；  
4. 用户能够发送消息，服务器将消息推送给所有的在线用户；  
5. 能够调整聊天窗中中文字的颜色和大小；  
6. 能够发送图片，发送后的图片能“点击查看原图”；  

代码中，刚开始使用的是80端口，结果在别的电脑上运行时提示这些错误：  
```javascript
$ node server.js 

events.js:72
        throw er; // Unhandled 'error' event
              ^
Error: listen EACCES
    at errnoException (net.js:904:11)
    at Server._listen2 (net.js:1023:19)
    at listen (net.js:1064:10)
    at Server.listen (net.js:1138:5)
    at Object.<anonymous> (/data/github/node-chat/server.js:7:8)
    at Module._compile (module.js:456:26)
    at Object.Module._extensions..js (module.js:474:10)
    at Module.load (module.js:356:32)
    at Function.Module._load (module.js:312:12)
    at Function.Module.runMain (module.js:497:10)
```
查过资料后发现，原来是80端口被占用了，那么就换一个端口嘛，换成3000后就可以正常运行了！  

学习到的知识：  
1. socket.io  
2. emit创建并发送事件  
3. on接收并使用该事件  
4. npm init 引导创建package.json文件  
    npm install 直接运行会按照package.json里的进行安装  
    npm install 包名  集成包安装到当前目录  
    npm install 包名 -g 集成包安装到全局  
    npm update <包名> 更新集成包，或更新package.json中所有的集成包  

参考链接：   
http://www.xiabingbao.com/node/2015/04/06/node-socket/  

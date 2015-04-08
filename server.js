var express = require('express'), //引入express模块
    app = express(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server),
    port = 3000;

app.use('/', express.static(__dirname + '/www')); //指定静态HTML文件的位置
server.listen(port);

console.log("已监听"+port+"端口，系统正在运行...");

var User = {
    info : {},

    hasExisted : function(string){
        var info = this.info;
        for(var key in info){
            if(key==string || info[key].nickname==string){
                return key;
            }
        }
        return false;
    },

    getInfo : function(userid){
        return this.info[userid];
    },

    getLength : function(){
        var num = 0;
        for(var key in this.info){
            num++;
        }
        return num;
    }
}
/*
在connection事件的回调函数中，socket表示的是当前连接到服务器的那个客户端。
所以代码socket.emit('foo')则只有自己收得到这个事件，
而socket.broadcast.emit('foo')则表示向除自己外的所有人发送该事件，
另外，上面代码中，io表示服务器整个socket连接，所以代码io.sockets.emit('foo')表示所有人都可以收到该事件。
*/
io.on('connection', function (socket) {
    socket.on("message", function(obj, userid){
        var date = new Date(),
            hour = date.getHours(),
            minute = date.getMinutes(),
            second = date.getSeconds();
        hour = hour<10?'0'+hour : hour;
        minute = minute<10 ? '0'+minute : minute;
        second = second<10 ? '0'+second : second;

        if(User.hasExisted(userid)){
            var info = User.getInfo(userid);
            info.msg = '<div style="font-size:'+obj.size+'; color:'+obj.color+'">'+obj.msg+'</div>';
            info.time = hour+':'+minute;
            io.sockets.emit('msg', { status:"success", info:info});
        }else{
            io.sockets.emit('msg', { status:"failure" });
        }
        
    });

    socket.on("login", function(obj){
        if(User.hasExisted(obj.nickname)){
            socket.emit("nickExisted");
        }else{
            obj.uid = socket.id;
            User.info[socket.id] = obj;
            socket.emit("loginSuccess", obj.uid);

            var s = {nickname:obj.nickname, user:User.info, len:User.getLength(), type:"login"};
            io.sockets.emit("system", s);
            
            console.log(obj.nickname+' 已接入');
        }
    });

    socket.on("disconnect", function(){
        var uid = socket.id;
        if(User.getInfo(uid)){
            var nickname = User.info[uid].nickname;
            delete User.info[uid];
            socket.broadcast.emit('system', {user:{userid:uid, nickname:nickname}, type:"logout"})

            console.log(nickname+' 已退出');
        }else{

        }
    })
});


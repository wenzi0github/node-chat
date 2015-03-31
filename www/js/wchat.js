var socket = io.connect(null);
socket.on("connect", function(){
    $("#content").find('.info').html('connect success').hide(function(){
        $("#content").find('.nickform').show();
    });
});

socket.on("nickExisted", function(){
    $('#tips').html('用户名已经存在');
})
socket.on("loginSuccess", function(userid){
    Chat.userid = userid;
    $(".layer").hide();
    $("#msg").focus();
});

socket.on("system", function(obj){
    if(obj.type=='login'){
        var html = '',
            user = obj.user;

        $(".record").find('.list').append('<div class="notice">'+obj.nickname+' 已加入</div>');
        for(var key in user){
            html += '<li><a href="javascript:;" class="mtouser clearfix" userid="'+user[key].uid+'" nickname="'+user[key].nickname+'"><img src="'+user[key].img+'" alt="pic">'+user[key].nickname+'</a></li>';
        }
        $(".user").find('ul').html(html);
        $("#num").html(obj.len);
    }else if(obj.type==='logout'){
        $(".record").find('.list').append('<div class="notice">'+obj.user.nickname+' 已退出</div>');
        $(".user").find('a[userid='+obj.user.userid+']').parent().remove();
        $("#num").html(parseInt($("#num").html())-1);
    }
    Chat.scroll();
});

socket.on("msg", function(result){
    Chat.appendMsg(result);
})

$(function(){
    $("#send").click(function(){
        Chat.send($("#msg").val());
    });

    $(".portrait").delegate("li", "click", function(){
        var $this = $(this);
        $(this).addClass("selected").siblings().removeClass("selected");
    })

    $("#msg").keydown(function(e){
        var code = e.charCode || e.which || e.keyCode;
        var msg = $("#msg").val();
        
        if(e.ctrlKey && code == 13) { 
            $("#msg").val(msg+"\r\n");
        }else if(!e.ctrlKey && code == 13){
            Chat.send(msg);
        } 
    });

    $(".font span").on("click", function(){
        var $this = $(this);
        if($this.hasClass( 'selected' )){
            $(".font .fontlist").fadeOut();
            $this.removeClass( 'selected' );
        }else{
            $(".font .fontlist").fadeIn();
            $this.addClass( 'selected' );
        }
    });

    $("#fileupload").on("change", function(){
        //检查是否有文件被选中
        var $this = $(this),
            files = $this[0].files;
        if (files.length != 0) {
            //获取文件并用FileReader进行读取
            var file = files[0],
                reader = new FileReader();
            if (!reader) {
                Chat.warning("您的浏览器不支持FileReader");
                $this.val('');
                return;
            };
            reader.onload = function(e) {
                //读取成功，显示到页面并发送到服务器
                $this.val('');
                socket.emit('message', {msg:'<img src="'+e.target.result+'" alt="img">', color:$('#fontcolor').val(), size:$("#fontsize").val()}, Chat.userid);
                // that._displayImage('me', e.target.result);
            };
            reader.readAsDataURL(file);
        };
    });

    $("#fontsize").on("change", function(){
        $('.chat .send textarea').css({"font-size":$(this).val()});
    });

    // 
    $(".main").delegate(".mtouser", "click", function(event){
        var $touser = $('.touser'),
            $this = $(this),
            uid = $this.attr("userid"),
            nickname = $this.attr("nickname");

        // 不是用户自己，且侧边栏没有该用户
        if(uid!==Chat.userid){
            $touser.find('.item').removeClass('current');
            if($touser.find('span[userid='+uid+']').length===0){
                $touser.prepend('<div class="item current"><span userid="'+uid+'">'+nickname+'</span><a href="javascript:;" class="close">x</a></div>');
                if($('.record_'+uid).length){
                    ToMore.show(uid);
                }else{
                    $('.chat').prepend('<div class="record record_'+uid+'"><div class="list clearfix"></div></div>');
                }
                ToMore.show(uid);
            }
        }
    
        event.preventDefault();
    });

    $(".touser").delegate(".item", "click", function(){
        $(this).addClass( 'current' ).siblings().removeClass('current');
        var uid = $(this).find('span').attr("userid");
        ToMore.show(uid);
    })

    $(".touser").delegate(".close", "click", function(event){
        var $touser = $('.touser'),
            $this = $(this),
            $item = $this.parent(),
            uid = $item.find('span').attr('userid'),
            showuid = '',
            $first = null;

        $item.remove();
        $('.record_'+uid).hide();

        $first = $(".touser").find(".item:first");
        showuid = $first.addClass( 'current' ).find('span').attr('userid');
        console.log(showuid);
        ToMore.show(showuid);

        if($touser.find('.item').length===1){
            ToMore.less();
        }
        event.stopPropagation();
    })

    // 加载用户可选择的头像
    Chat.formImg(12);
});

window.onbeforeunload = function(event){
    event = event || window.event;
    
    var msg = "是否要离开？";
    window.event.returnValue = msg;
    return msg;
}

var Chat = {
    // 聊天内容
    content : '<div class="item clearfix">'+
                '<div class="pic fl">'+
                    '<a href="javascript:;" class="mtouser"><img src="" alt="pic"></a>'+
                '</div>'+
                '<div class="info_msg">'+
                    '<div class="info"><span class="name"></span><span class="timer"></span></div>'+
                    '<div class="msg"></div>'+
                '</div>'+
            '</div>',
    $tips : $('<div class="tips clearfix"><div><em>!</em><span></span></div></div>'),

    userid : null, // 当前用户
    toid : 'group',// 发送到的用户

    warning : function(string){
        this.$tips.find('span').html(string);
        $(".record").find('.list').append(this.$tips);
    },

    // 发送消息
    send : function(){
        var msg = $.trim($("#msg").val());
        if(msg===""){
            return;
        }
        if(this.userid==null){
            this.warning("您还没有登陆");
        }else{
            socket.emit("message", {msg:msg, color:$('#fontcolor').val(), size:$("#fontsize").val()}, this.userid);
        }
    },

    // 接收消息
    appendMsg : function(result){
        if(result.status=="success"){
            var info = result.info;
            var $content = $(this.content);

            this.userid==info.uid && $content.addClass( 'louzhu' );
            $content.find('img').attr('src', info.img);
            $content.find('.name').html(info.nickname);
            $content.find('.timer').html(info.time);
            $content.find('.msg').html(info.msg);
            $content.find('.mtouser').attr({userid:info.uid, nickname:info.nickname});

            $(".record_"+this.toid).find('.list').append($content);
            this.scroll();
            $("#msg").val("").focus();
        }else{
            this.warning("认证失败");
        }
    },

    // 滚动条永远在最下
    scroll : function(){
        $(".record").scrollTop($(".record").find('.list').height());
    },

    // 登陆
    login : function(){
        var nickname = $("#nickname").val();
        if(nickname===""){
            return;
        }
        var $img = $(".portrait .selected").find("img");
        socket.emit("login", {nickname:nickname, img:$img.attr("src")});
        return false;
    },

    formImg:function(n){
        var html = '',
            n = n || 6;
        for(var i=0; i<n; i++){
            if(i==0){
                html += '<li class="selected"><img src="./images/'+i+'.jpg" alt="pic"></li>';
            }else{
                html += '<li><img src="./images/'+i+'.jpg" alt="pic"></li>';
            }
        }
        $(".portrait").html(html);
    }
}

var ToMore = {
    less : function(){
        $('.main').removeClass( 'tomore' );
        $('.chat').removeClass( 'mchat' );
        $('.touser').hide();
        $('.user').show();
    },

    show : function(uid){
        $('.main').addClass( 'tomore' );
        $('.record').hide();
        $('.record_'+uid).show();
        $('.touser').show();
        Chat.toid = uid;

        

        if(uid=='group'){
            $('.chat').removeClass( 'mchat' );
            $('.user').show();
        }else{
            $('.chat').addClass( 'mchat' );
            $('.user').hide();
        }
    }
}
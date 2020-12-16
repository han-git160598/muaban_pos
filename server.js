var express = require("express");
var app = express();
vart= request = require('request');
app.use(express.static("public"));
app.set("view engine", "ejs");
app.set("views", "./views");



var server = require("http").Server(app);
var io =require("socket.io")(server);
server.listen(process.env.PORT || 3000);
 var manguser=[]; var mang=[];
io.on("connection", function(socket){

    console.log("ket noi "+ socket.id);
    // socket.on("clent-dang-ky", function(data){
    //     //console.log(data);
    //     if(manguser.indexOf(data)>=0){
    //         socket.emit("server-dk-faild");
    //     }else{
    //         manguser.push(data);
    //         socket.username = data;
    //         socket.emit("server-dk-sucsses",data);
    //         io.sockets.emit("server-dk-all", manguser);
    //      }
    // });
    
    socket.on('create', function (room) {
        socket.join(room);
        io.sockets.in(room).emit('event', room);
        //console.l og(io.sockets.in(room));
      });
        socket.on("send-massage", function(data , room){
     //   io.sockets.emit('server-massage', data, room);
         io.to(room).emit("server-massage",data);
    });


    //  socket.on("clent-dang-ky", function(data){
    //     socket.join(data);
    //     socket.phong= data;
    //     var mang=[];
    //     for(r in socket.adapter.rooms)
    //     {
    //         mang.push(r);
    //     }
    //     console.log(mang);
    //     socket.emit("server-dk-sucsses",data);
    //     io.sockets.emit("server-dk-all", mang);
        
    // });

    socket.on("logout",function(){
        manguser.slice(manguser.indexOf(socket.username),0);
        socket.broadcast.emit("server-dk-all",manguser);
    });
    var dem = 0;
    var requestLoop = setInterval(function(){
        request({
            url: "https://demochatsocket.herokuapp.com/",
            method: "GET",
            timeout: 20000,
            followRedirect: true,
            maxRedirects: 10
        },function(error, response, body){
            if(!error && response.statusCode == 200){
                console.log('sucess!'+ dem++);
                io.sockets.emit("auto-timer", dem);
            }else{
                console.log('error' + response.statusCode);
            }
        });
      }, 20000);
});



app.get("/",function(req,res){
    res.render("index");
});
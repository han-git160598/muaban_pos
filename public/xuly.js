var socket = io("http://localhost:3000/");
$("#dangky").click( function(){
   var name1=  $("#name").val()
   console.log(name1);
   // socket.emit('clent-dang-ky',name1);
   socket.emit('create', name1);
});
socket.on("event", function(data){
   // alert(data);
$("#test").val(data);
 $("#loginform").hide(3000);
$("#chatform").show(2000);
});
$('#btnmessage').click(function(){
    var massage=  $("#message").val();
    var a=$("#test").val();
    console.log(a);
    socket.emit("send-massage",massage,a);
});
socket.on("server-massage", function (data){
    //var currenuser=  $("#currenuser").val()
    //if(currenuser == room){
    $("#listmess").append("<div class='user'>"+ data + "</div>"); 
});

socket.on("server-dk-faild",function(){
    alert('faild!!!!!!');
});
socket.on("server-dk-sucsses",function(data){
 $("#currenuser").html(data);
 $("#loginform").hide(3000);
$("#chatform").show(2000);
});
socket.on("server-dk-all", function(data){
    data.forEach(function(i){
        $("#boxcontent").append("<div class='user'>"+ i + "</div>");   
    });
});
socket.on("auto-timer", function(data){
        $("#auto").append("<div class='a'>"+ data + "</div>");   
});



$(document).ready(function(){
    $("#loginform").show();
    $("#chatform").hide();
});


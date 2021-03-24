 var socket = io('https://muaban-pos.herokuapp.com/');
//var socket = ("localhost:3000", { transports: ['websocket'], allowUpgrades: false});
// var socket =("localhost:3000/",
//     {
//     transports: ['websocket'],
//     allowUpgrades: false,
//     pingInterval: 2500, // default - 25000
//     pingTimeout: 6000, // default - 60000

//     });
$(document).ready(function() {
    const a = { id_business: '1'};
   socket.emit('join-store',a);
  
});
//var socket = io.connect();
// console.log('check 1', socket.connected);
// socket.on('connect', function() {
//   console.log('check 2', socket.connected);
//   console.log(socket.status);
// });
// socket.on('disconnect', function(){
//     console.log('disconected');
//     });
socket.on('disconnect', (reason) => {
    console.log('ngat serve');
    console.log(reason);
    if (reason === 'io server disconnect') {
        console.log('disconnec');
        socket.connect();
    }
});
socket.on('disconnect-socket',function(data){
    console.log('server disconnect'+ data);
});
socket.on('reconnect', (attemptNumber) => {
    console.log('ket nối lại thành công');
  });

socket.on('ketnoi',function(data){
console.log(data);
});
function open_table()
{  
    var data = { 
        
            id_product: '15',
            type_manager: 'eat-in',
            table_title: 'Bàn 9',
            id_floor: '4',
            table_status: 'full',
            id_business: '1',
            id_order: '201',
            id_table: '42'
          
          
      }
    socket.emit('disable-product',data);
}
socket.on('reloaded-product',function(data){
console.log(data);
});
socket.on('reloaded-table-detail',function(data)
{
    console.log(data);
});
socket.on('reloaded-order-eat-in',function(data){
    console.log('tại bàn');
    console.log(data);
});
socket.on('reloaded-order-carry-out',function(data){
    console.log('mang đi');
    console.log(data);
});
socket.on("connected", function(data)
{
 $('#tesst').html(data);
});




function disable_product()
{
    // id_business:1 , id_product: 2
    socket.emit('disable-product',1);
}


socket.on('disabled-product',function(data){
console.log(data);
});
socket.on('reloaded-all-table',function(data){
console.log(data);
});
socket.on('forced_sign_out',function(data)
{
console.log(data);
});
socket.on('disconnect-socket',function(data){
console.log(data);
});

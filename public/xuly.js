 var socket = io('https://muabannhanh2.herokuapp.com');
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

socket.on('reloaded-timer',function(data)
{
    console.log (data);
});


function disable_product()
{
    // id_business:1 , id_product: 2
    socket.emit('disable-product',1);
}


socket.on('disabled-product',function(data){
console.log(data);
});
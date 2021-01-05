 var socket = io("localhost:3000/");
//var socket = ("localhost:3000", { transports: ['websocket'], allowUpgrades: false});
// var socket =("localhost:3000/",
//     {
//     transports: ['websocket'],
//     allowUpgrades: false,
//     pingInterval: 2500, // default - 25000
//     pingTimeout: 6000, // default - 60000

//     });
$(document).ready(function() {
    const a = { id_business: '2'};
   socket.emit('join-store',a);
  
});
function open_table()
{  
    var data = { id_business: '2', id_floor: '2', id_order: '45', id_table: '5' }

    socket.emit('reload-table-detail',data);
}
socket.on('reloaded-table-detail',function(data)
{
console.log(data);
});
socket.on("connected", function(data)
{
 $('#tesst').html(data);
});
socket.on('opened-table',function(data){
console.log(data);
});

socket.on('list-ordered',function(data){
    console.log(data);
});

function disable_product()
{
    // id_business:1 , id_product: 2
    socket.emit('disable-product',1);
}


socket.on('disabled-product',function(data){
console.log(data);
});
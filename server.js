const express = require("express");
const app = express();
const axios = require('axios')
const cors = require("cors");
const request = require('request');
const cron = require("node-cron"); 
app.use(express.static("public"));
app.set("view engine", "ejs");
app.set("views", "./views");

var server = require("http").Server(app);
const io = require('socket.io')(server, {
    pingTimeout: 43200000,
    pingInterval: 2000,
    cors: {
      origin: '*',  
    }
  });
server.listen(process.env.PORT || 3000 );

const url = 'https://muabannhanh.xyz/api/'

io.on("connection", function(socket){ 
  //setTimeout(() => socket.disconnect(true), 5000);
  console.log("ket noi "+ socket.id);
  io.sockets.emit('ketnoi','data');
  socket.on('join-store', function(room) {
    socket.join(room.id_business);
    //console.log(room.id_business);
 });

//mở bàn và đặt món
 socket.on('reload-table-detail', function(param){
  socket.join(param.id_business);
  var data2 = { detect: 'table_order', type_socket: 'socket', id_order: param.id_order,id_floor:param.id_floor, id_business:param.id_business};
  var room = param.id_business;
  var headers = {'Authorization':'Bearer '+param.token};
  //console.log(param);
  //console.log(headers);
    axios.post(url, data2, { headers,
    }).then((res) => {
      //console.log(res.data.data[0]);
     var total_off =  res.data.data[0].total_table_empty ;
     var total_on =   res.data.data[0].total_table_full; 
      var a= [];
      let list = {type_reload:'open_table',type_socket: 'socket',total_table_off:total_off,total_table_on: total_on ,table_status:param.table_status, table_title:param.table_title, id_floor: param.id_floor, id_order: param.id_order, id_table: param.id_table,...res.data.data[0], table_order: a };
      list.table_order.push(res.data.data[0]);
  //  res.data.data[0] = {"id_floor":param.id_floor, "id_table": param.id_table,...res.data.data[0]};
   // console.log(list);
    io.in(room).emit('reloaded-table-detail',list);
    }).catch((error) => {
  }); 
  ///bếp  
    if(param.type_manager == 'eat-in')
    {
     // console.log('qua dc if');
      var data3 = { detect: 'list_chef_order',type_socket: 'socket',id_order:param.id_order, type_manager: 'eat_in', id_business:param.id_business };
      var headers = {'Authorization':'Bearer '+param.token};
      axios.post(url, data3, { headers,
      }).then((res) => {
      res.data.type = param.type_prosessing;
    //  console.log(res.data.data[0]);
      io.in(room).emit('reloaded-order-eat-in',res.data.data[0]);
      }).catch((error) => {
      });
    }else{
     // console.log('qua dc if');
      var data3 = { detect: 'list_chef_order',type_socket: 'socket',id_order:param.id_order, type_manager: 'carry_out', id_business:param.id_business };
      var headers = {'Authorization':'Bearer '+param.token};
      axios.post(url, data3, { headers,
      }).then((res) => {
      res.data.type = param.type_prosessing;
    //  console.log(res.data.data[0]);
      io.in(room).emit('reloaded-order-carry-out',res.data.data[0]);
      }).catch((error) => {
      });  
    }
 });

 /// bép chế biến thay đổi trang thái từ đang ăn đến thanh toán
 socket.on('update-status-order', function(param){
  //  console.log(param);
    socket.join(param.id_business); 
    var data2 = { detect: 'table_order',type_socket: 'socket', id_order: param.id_order, id_floor:param.id_floor};
    var room = param.id_business;
    var headers = {'Authorization':'Bearer '+param.token};
   // console.log(param);
      axios.post(url, data2, { headers,
      }).then((res) => {
        var a= [];
        var total_off =  res.data.data[0].total_table_empty ;
        var total_on  =   res.data.data[0].total_table_full; 
        let list = {table_status:param.table_status, table_title:param.table_title, id_floor: param.id_floor, id_order: param.id_order, id_table: param.id_table,...res.data.data[0], table_order: a };
        list.table_order.push(res.data.data[0]);
    //  res.data.data[0] = {"id_floor":param.id_floor, "id_table": param.id_table,...res.data.data[0]};
    //  console.log(list);
      io.in(room).emit('reloaded-table-detail',list);
      }).catch((error) => {
    }); 
    //////bếp 
      if(param.type_manager == 'eat-in')
      {
        var data3 = { detect: 'list_chef_order',type_socket: 'socket', id_order:param.id_order, type_manager: 'eat_in', id_business:param.id_business };
        var headers = {'Authorization':'Bearer '+param.token};
        axios.post(url, data3, { headers,
        }).then((res) => {
        if(res.data.data == '')
        {
        var data_send = {message:"remove_order", id_order:param.id_order, order_type:param.type_manager};
     //   console.log(data_send);
        io.in(room).emit('reloaded-order-eat-in',data_send); 
        }else{
      //  console.log(res.data.data[0]);
        //res.data.type = param.type_prosessing;
        io.in(room).emit('reloaded-order-eat-in',res.data.data[0]);}
        }).catch((error) => {
        });
      }else{
        var data3 = { detect: 'list_chef_order',type_socket: 'socket',id_order:param.id_order, type_manager: 'carry_out', id_business:param.id_business };
        var headers = {'Authorization':'Bearer '+param.token};
        axios.post(url, data3, { headers,
        }).then((res) => {
          if(res.data.data == '')
          {
          var data_send = {message:"remove_order", id_order:param.id_order,order_type:param.type_manager};
        //  console.log(data_send);
          io.in(room).emit('reloaded-order-carry-out',data_send); 
          }else{
        //console.log(res.data.data[0]);
        res.data.type = param.type_prosessing;
        io.in(room).emit('reloaded-order-carry-out',res.data.data[0]);}
        }).catch((error) => {
        });  
      }
});

//hoàn thành món 8-0
socket.on('remove-chef-order', function(param){
 // console.log(param);
  socket.join(param.id_business);
  var data2 = { detect: 'table_order',type_socket: 'socket', id_order: param.id_order};
  var room = param.id_business;
 // console.log(param);
  var headers = {'Authorization':'Bearer '+param.token};
    axios.post(url, data2, { headers,
    }).then((res) => {
      var a= [];
      let list = {table_status:param.table_status, table_title:param.table_title, id_floor: param.id_floor, id_order: param.id_order, id_table: param.id_table,...res.data.data[0], table_order: a };
      list.table_order.push(res.data.data[0]);
  //  res.data.data[0] = {"id_floor":param.id_floor, "id_table": param.id_table,...res.data.data[0]};
  //  console.log(list);
    io.in(room).emit('reloaded-table-detail',list);
    }).catch((error) => {
  }); 
  //////bếp  
    if(param.type_manager == 'eat-in')
    {
     var data_send = {message:"remove_order", id_order:param.id_order}
      io.in(room).emit('removed-chef-order',data_send);

    }else{
      var data_send = {message:"remove_order", id_order:param.id_order}
      io.in(room).emit('removed-chef-order',data_send);
 
    }
});
// khách hủy món
socket.on('customer-cancel-product',function(param){
 // console.log(param);
  socket.join(param.id_business);
  var data2 = { detect: 'table_order',type_socket: 'socket', id_order: param.id_order};
  var room = param.id_business;
  var headers = {'Authorization':'Bearer '+param.token};
    axios.post(url, data2, { headers,
    }).then((res) => {
      var a= [];
      let list = {table_status:param.table_status,table_title:param.table_title, id_floor: param.id_floor, id_order: param.id_order, id_table: param.id_table,...res.data.data[0], table_order: a };
       list.table_order.push(res.data.data[0]);
  //  res.data.data[0] = {"id_floor":param.id_floor, "id_table": param.id_table,...res.data.data[0]};
  //  console.log(list);
    io.in(room).emit('reloaded-table-detail',list);
    }).catch((error) => {
  }); 
      // bếp
  if(param.type_manager == 'eat-in')
    {
      var data3 = { detect: 'list_chef_order',type_socket: 'socket',id_order:param.id_order, type_manager: 'eat_in', id_business:param.id_business };
      var headers = {'Authorization':'Bearer '+param.token};
      axios.post(url, data3, { headers,
      }).then((res) => {
     // console.log(res.data);
      res.data.type = "update";
      io.in(room).emit('reloaded-order-eat-in',res.data.data[0]);
      }).catch((error) => {
      });
    }else{
      var data3 = { detect: 'list_chef_order',type_socket: 'socket',id_order:param.id_order, type_manager: 'carry_out', id_business:param.id_business };
      var headers = {'Authorization':'Bearer '+param.token};
      axios.post(url, data3, { headers,
      }).then((res) => {
    //  console.log(res.data);
      res.data.type = param.type_prosessing;
      io.in(room).emit('reloaded-order-carry-out',res.data.data[0]);
      }).catch((error) => {
      });  
    }
});

// bếp hủy món
socket.on('chef-cancel-product',function(param){
 // console.log(param);
  socket.join(param.id_business);
  var data2 = { detect: 'table_order',type_socket: 'socket', id_order: param.id_order};
  var room = param.id_business;
  var headers = {'Authorization':'Bearer '+param.token};
  axios.post(url, data2, { headers,
    }).then((res) => {
      var a= [];
      let list = {table_status:param.table_status,table_title:param.table_title, id_floor: param.id_floor, id_order: param.id_order, id_table: param.id_table,...res.data.data[0], table_order: a };
       list.table_order.push(res.data.data[0]);
  //  res.data.data[0] = {"id_floor":param.id_floor, "id_table": param.id_table,...res.data.data[0]};
  //  console.log(list);
    io.in(room).emit('reloaded-table-detail',list);
    }).catch((error) => {
  });
  
  if(param.type_manager == 'eat-in')
  {
    var data3 = { detect: 'list_chef_order',type_socket: 'socket', id_order:param.id_order, type_manager: 'eat_in', id_business:param.id_business };
    var headers = {'Authorization':'Bearer '+param.token};
    axios.post(url, data3, { headers,
    }).then((res) => {
    if(res.data.data == '')
    {
    var data_send = {message:"remove_order", id_order:param.id_order, order_type:param.type_manager};
 //   console.log(data_send);
    io.in(room).emit('reloaded-order-eat-in',data_send); 
    }else{
  //  console.log(res.data.data[0]);
    //res.data.type = param.type_prosessing;
    io.in(room).emit('reloaded-order-eat-in',res.data.data[0]);}
    }).catch((error) => {
    });
  }else{
    var data3 = { detect: 'list_chef_order',type_socket: 'socket',id_order:param.id_order, type_manager: 'carry_out', id_business:param.id_business };
    var headers = {'Authorization':'Bearer '+param.token};
    axios.post(url, data3, { headers,
    }).then((res) => {
      if(res.data.data == '')
      {
     var data_send = {message:"remove_order", id_order:param.id_order,order_type:param.type_manager};
   //   console.log(data_send);
      io.in(room).emit('reloaded-order-carry-out',data_send); 
      }else{
 //   console.log(res.data.data[0]);
    res.data.type = param.type_prosessing;
    io.in(room).emit('reloaded-order-carry-out',res.data.data[0]);}
    }).catch((error) => {
    });  
  }
});

/// update số lượng  món ăn
socket.on('update-quantity-order',function(param){
 // console.log(param);
  socket.join(param.id_business);
  var data2 = { detect: 'table_order',type_socket: 'socket', id_order: param.id_order};
  var room = param.id_business;
  var headers = {'Authorization':'Bearer '+param.token};
    axios.post(url, data2, { headers,
    }).then((res) => {
      var a= [];
      let list = {table_status:param.table_status,table_title:param.table_title, id_floor: param.id_floor, id_order: param.id_order, id_table: param.id_table,...res.data.data[0], table_order: a };
       list.table_order.push(res.data.data[0]);
  //  res.data.data[0] = {"id_floor":param.id_floor, "id_table": param.id_table,...res.data.data[0]};
  //  console.log(list);
    io.in(room).emit('reloaded-table-detail',list);
    }).catch((error) => {
  }); 
  if(param.type_manager == 'eat-in')
    {
      var data3 = { detect: 'list_chef_order',type_socket: 'socket',id_order:param.id_order, type_manager: 'eat_in', id_business:param.id_business };
      var headers = {'Authorization':'Bearer '+param.token};
      axios.post(url, data3, { headers,
      }).then((res) => {
    //  console.log(res.data);
      res.data.type = param.type_prosessing;
      io.in(room).emit('reloaded-order-eat-in',res.data.data[0]);
      }).catch((error) => {
      });
    }else{
      var data3 = { detect: 'list_chef_order',type_socket: 'socket',id_order:param.id_order, type_manager: 'carry_out', id_business:param.id_business };
      var headers = {'Authorization':'Bearer '+param.token};
      axios.post(url, data3, { headers,
      }).then((res) => {
    ///  console.log(res.data);
      res.data.type = param.type_prosessing;
      io.in(room).emit('reloaded-order-carry-out',res.data.data[0]);
      }).catch((error) => {
      });  
    }
});
/// update món ăn 
socket.on('update-product-order',function(param){
//  console.log(param);
  socket.join(param.id_business);
  var data2 = { detect: 'table_order',type_socket: 'socket', id_order: param.id_order};
  var headers = {'Authorization':'Bearer '+param.token};
  var room = param.id_business;
    axios.post(url, data2, { headers,
    }).then((res) => {
      var a= [];
      let list = {table_status:param.table_status,table_title:param.table_title, id_floor: param.id_floor, id_order: param.id_order, id_table: param.id_table,...res.data.data[0], table_order: a };
       list.table_order.push(res.data.data[0]);
  //  res.data.data[0] = {"id_floor":param.id_floor, "id_table": param.id_table,...res.data.data[0]};

  //  console.log(list);
    io.in(room).emit('reloaded-table-detail',list);
    }).catch((error) => {
  }); 
  if(param.type_manager == 'eat-in')
    {
      var data3 = { detect: 'list_chef_order',type_socket: 'socket',id_order:param.id_order, type_manager: 'eat_in', id_business:param.id_business };
      var headers = {'Authorization':'Bearer '+param.token};
      axios.post(url, data3, { headers,
      }).then((res) => {
      res.data.type = param.type_prosessing;
    //  console.log(res.data.data[0]);
      io.in(room).emit('reloaded-order-eat-in',res.data.data[0]);
      }).catch((error) => {
      });
    }else{
      var data3 = { detect: 'list_chef_order',type_socket: 'socket',id_order:param.id_order, type_manager: 'carry_out', id_business:param.id_business };
      var headers = {'Authorization':'Bearer '+param.token};
      axios.post(url, data3, { headers,
      }).then((res) => {
      res.data.type = param.type_prosessing;
      io.in(room).emit('reloaded-order-carry-out',res.data.data[0]);
      }).catch((error) => {
      });  
    }
});

/// chuyển bàn
socket.on('change-table',function(param){
  socket.join(param.id_business);
  var room = param.id_business;
  var data = {message: "reloaded_all_table"};
  io.in(room).emit('reloaded-all-table',data);
});


// disable product
socket.on('disable-product',function(param){  
  // androi
//  console.log(param);
  socket.join(param.id_business);
  var room = param.id_business;
  var data = {message:"reloaded product"};
 // console.log(data);
  io.in(room).emit('reloaded-product',data);
  var data2 = { detect: 'table_order',type_socket: 'socket', id_order: param.id_order};
  var headers = {'Authorization':'Bearer '+param.token};
    axios.post(url, data2, { headers,
    }).then((res) => {
      var a= [];
      let list = {table_status:param.table_status,table_title:param.table_title, id_floor: param.id_floor, id_order: param.id_order, id_table: param.id_table,...res.data.data[0], table_order: a };
       list.table_order.push(res.data.data[0]);
  //  res.data.data[0] = {"id_floor":param.id_floor, "id_table": param.id_table,...res.data.data[0]};
  //  console.log(list);
    io.in(room).emit('reloaded-table-detail',list);
    }).catch((error) => {
  });
  if(param.type_manager == 'eat-in')
      {
        var data3 = { detect: 'list_chef_order',type_socket: 'socket', id_order:param.id_order, type_manager: 'eat_in', id_business:param.id_business };
        var headers = {'Authorization':'Bearer '+param.token};
        axios.post(url, data3, { headers,
        }).then((res) => {
        if(res.data.data == '')
        {
        var data_send = {message:"remove_order", id_order:param.id_order, order_type:param.type_manager};
     //   console.log(data_send);
        io.in(room).emit('reloaded-order-eat-in',data_send); 
        }else{
     //  console.log(res.data.data[0]);
        //res.data.type = param.type_prosessing;
        io.in(room).emit('reloaded-order-eat-in',res.data.data[0]);}
        }).catch((error) => {
        });
      }else{
        var data3 = { detect: 'list_chef_order',type_socket: 'socket',id_order:param.id_order, type_manager: 'carry_out', id_business:param.id_business };
        var headers = {'Authorization':'Bearer '+param.token};
        axios.post(url, data3, { headers,
        }).then((res) => {
          if(res.data.data == '')
          {
          var data_send = {message:"remove_order", id_order:param.id_order,order_type:param.type_manager};
       //   console.log(data_send);
          io.in(room).emit('reloaded-order-carry-out',data_send); 
          }else{
       // console.log(res.data.data[0]);
        res.data.type = param.type_prosessing;
        io.in(room).emit('reloaded-order-carry-out',res.data.data[0]);}
        }).catch((error) => {
        });  
      }
     
});
/// hoàn tất thanh toán và đóng bàn
socket.on('close-table', function(param){
 // console.log(param);
  socket.join(param.id_business); 
  var data2 = { detect: 'table_order',type_socket: 'socket', id_order: param.id_order, id_floor:param.id_floor};
  var room = param.id_business;
//  console.log(param);
  var headers = {'Authorization':'Bearer '+param.token};
    axios.post(url, data2, { headers,
    }).then((res) => {
      var a= [];
      var total_off =  res.data.data[0].total_table_empty ;
      var total_on  =   res.data.data[0].total_table_full; 
      let list = {type_reload:'close_table',total_table_off:total_off,total_table_on: total_on,table_status:param.table_status, table_title:param.table_title, id_floor: param.id_floor, id_order: param.id_order, id_table: param.id_table,...res.data.data[0], table_order: a };
      list.table_order.push(res.data.data[0]);
  //  res.data.data[0] = {"id_floor":param.id_floor, "id_table": param.id_table,...res.data.data[0]};
  //  console.log(list);
    io.in(room).emit('reloaded-table-detail',list);
    }).catch((error) => {
  }); 
  //////bếp 
    if(param.type_manager == 'eat-in')
    {
      var data3 = { detect: 'list_chef_order',type_socket: 'socket', id_order:param.id_order, type_manager: 'eat_in', id_business:param.id_business };
      var headers = {'Authorization':'Bearer '+param.token};
      axios.post(url, data3, { headers,
      }).then((res) => {
      if(res.data.data == '')
      {
      var data_send = {message:"remove_order", id_order:param.id_order, order_type:param.type_manager};
    //  console.log(data_send);
      io.in(room).emit('reloaded-order-eat-in',data_send); 
      }else{
    //  console.log(res.data.data[0]);
      //res.data.type = param.type_prosessing;
      io.in(room).emit('reloaded-order-eat-in',res.data.data[0]);}
      }).catch((error) => {
      });
    }else{
      var data3 = { detect: 'list_chef_order',type_socket: 'socket',id_order:param.id_order, type_manager: 'carry_out', id_business:param.id_business };
      var headers = {'Authorization':'Bearer '+param.token};
      axios.post(url, data3, { headers,
      }).then((res) => {
        if(res.data.data == '')
        {
        var data_send = {message:"remove_order", id_order:param.id_order,order_type:param.type_manager};
     //   console.log(data_send);
        io.in(room).emit('reloaded-order-carry-out',data_send); 
        }else{
    ///  console.log(res.data.data[0]);
      res.data.type = param.type_prosessing;
      io.in(room).emit('reloaded-order-carry-out',res.data.data[0]);}
      }).catch((error) => {
      });  
    }
});

// cưỡng chế đăng xuất
socket.on('force_sign_out',function(data)
{
  var room = data.id_business;
//  console.log(data);
//  console.log(room);
  io.in(room).emit('forced_sign_out',data);
});
 

// setInterval(function() {
//   var data = {message:"reloaded_timer"};
//   console.log(data);
// io.emit('reloaded-timer',data);
// }, 20000); //5 seconds


// const nDate = new Date().toLocaleString('en-US', {
//   timeZone: 'Asia/Ho_Chi_Minh'
// });

// console.log(nDate);

cron.schedule("*/5 * * * *", function() { 
  var data = {message:'reloaded_all_table'};
 // console.log(data);
  socket.emit('reloaded-all-table', data);
}); 





socket.on('error', (error) => {
 // console.log(error);
});
socket.on('disconnect', (reason) => {
  socket.emit('disconnect-socket',reason);
});


 
});





app.get("/",function(req,res){
    res.render("index");
});
app.get("/bep",function(req,res){
    res.render("bep");
});
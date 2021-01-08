const express = require("express");
const app = express();
const axios = require('axios')
const cors = require("cors");
const request = require('request');
app.use(express.static("public"));
app.set("view engine", "ejs");
app.set("views", "./views");

var server = require("http").Server(app);
const io = require('socket.io')(server, {
    pingTimeout: 4000000,
    pingInterval: 2000,
    cors: {
      origin: '*',
    }
  });
server.listen(process.env.PORT || 3000 );

const url = 'http://192.168.100.31/muaban_pos/api/'
const headers = {
    'Authorization': 'Basic YWRtaW46cXRjdGVrQDEyMwx=='
  }

io.on("connection", function(socket){ 
  //setTimeout(() => socket.disconnect(true), 5000);
  console.log("ket noi "+ socket.id);
  io.sockets.emit('ketnoi','data');
  socket.on('join-store', function(room) {
    socket.join(room.id_business);
    console.log(room.id_business);
 });

//mở bàn và đặt món
 socket.on('reload-table-detail', function(param){
 console.log(param);
  socket.join(param.id_business);
  var data2 = { detect: 'table_order', id_order: param.id_order,id_floor:param.id_floor};
  var room = param.id_business;
  console.log(param);
    axios.post(url, data2, { headers,
    }).then((res) => {
     var total_off =  param.total_table_empty ;
     var total_on =   param.total_table_full; 
      var a= [];
      let list = {type_reload:'open_table',total_table_off:total_off,total_table_on: total_on ,table_status:param.table_status, table_title:param.table_title, id_floor: param.id_floor, id_order: param.id_order, id_table: param.id_table,...res.data.data[0], table_order: a };
      list.table_order.push(res.data.data[0]);
  //  res.data.data[0] = {"id_floor":param.id_floor, "id_table": param.id_table,...res.data.data[0]};
    console.log(list);
    io.in(room).emit('reloaded-table-detail',list);
    }).catch((error) => {
  }); 
  ///bếp  
    if(param.type_manager == 'eat-in')
    {
      var data3 = { detect: 'list_chef_order',id_order:param.id_order, type_manager: 'eat_in', id_business:param.id_business };
      axios.post(url, data3, { headers,
      }).then((res) => {
      console.log(res.data.data[0]);
      res.data.type = param.type_prosessing;
      io.in(room).emit('reloaded-order-eat-in',res.data.data[0]);
      }).catch((error) => {
      });
    }else{
      var data3 = { detect: 'list_chef_order',id_order:param.id_order, type_manager: 'carry_out', id_business:param.id_business };
      axios.post(url, data3, { headers,
      }).then((res) => {
      console.log(res.data.data[0]);
      res.data.type = param.type_prosessing;
      io.in(room).emit('reloaded-order-carry-out',res.data.data[0]);
      }).catch((error) => {
      });  
    }
 });

 /// bép chế biến
 socket.on('update-status-order', function(param){
    console.log(param);
    socket.join(param.id_business);
    var data2 = { detect: 'table_order', id_order: param.id_order};
    var room = param.id_business;
    console.log(param);
      axios.post(url, data2, { headers,
      }).then((res) => {
        var a= [];
        let list = {table_status:param.table_status, table_title:param.table_title, id_floor: param.id_floor, id_order: param.id_order, id_table: param.id_table,...res.data.data[0], table_order: a };
        list.table_order.push(res.data.data[0]);
    //  res.data.data[0] = {"id_floor":param.id_floor, "id_table": param.id_table,...res.data.data[0]};
      console.log(list);
      io.in(room).emit('reloaded-table-detail',list);
      }).catch((error) => {
    }); 
    //////bếp 
      if(param.type_manager == 'eat-in')
      {
        var data3 = { detect: 'list_chef_order', id_order:param.id_order, type_manager: 'eat_in', id_business:param.id_business };
        axios.post(url, data3, { headers,
        }).then((res) => {
        if(res.data.data == '')
        {
        data_send = {message:"remove_order", id_order:param.id_order, order_type:param.type_manager};
        console.log(data_send);
        io.in(room).emit('reloaded-order-eat-in',data_send); 
        }else{
        console.log(res.data.data[0]);
        //res.data.type = param.type_prosessing;
        io.in(room).emit('reloaded-order-eat-in',res.data.data[0]);}
        }).catch((error) => {
        });
      }else{
        var data3 = { detect: 'list_chef_order',id_order:param.id_order, type_manager: 'carry_out', id_business:param.id_business };
        axios.post(url, data3, { headers,
        }).then((res) => {
          if(res.data.data == '')
          {
          data_send = {message:"remove_order", id_order:param.id_order,order_type:param.type_manager};
          console.log(data_send);
          io.in(room).emit('reloaded-order-carry-out',data_send); 
          }else{
        console.log(res.data.data[0]);
        res.data.type = param.type_prosessing;
        io.in(room).emit('reloaded-order-carry-out',res.data.data[0]);}
        }).catch((error) => {
        });  
      }
});
// đóng bàn
socket.on('close-table', function(param){
  console.log(param);
    socket.join(param.id_business);
    var data2 = { detect: 'table_order', id_order: param.id_order,id_floor:param.id_floor};
    var room = param.id_business;
    console.log(param);
      axios.post(url, data2, { headers,
      }).then((res) => {
        var a= [];
        var total_off =  param.total_table_empty ;
        var total_on =   param.total_table_full; 
        let list = {type_reload:'close_table',total_table_off:total_off,total_table_on: total_on, table_status:param.table_status, table_title:param.table_title, id_floor: param.id_floor, id_order: param.id_order, id_table: param.id_table,...res.data.data[0], table_order: a };
        list.table_order.push(res.data.data[0]);
    //  res.data.data[0] = {"id_floor":param.id_floor, "id_table": param.id_table,...res.data.data[0]};
      console.log(list);
      io.in(room).emit('reloaded-table-detail',list);
      }).catch((error) => {
    }); 
  });
//hoàn thành món 8-0
socket.on('remove-chef-order', function(param){
  console.log(param);
  socket.join(param.id_business);
  var data2 = { detect: 'table_order', id_order: param.id_order};
  var room = param.id_business;
  console.log(param);
    axios.post(url, data2, { headers,
    }).then((res) => {
      var a= [];
      let list = {table_status:param.table_status, table_title:param.table_title, id_floor: param.id_floor, id_order: param.id_order, id_table: param.id_table,...res.data.data[0], table_order: a };
      list.table_order.push(res.data.data[0]);
  //  res.data.data[0] = {"id_floor":param.id_floor, "id_table": param.id_table,...res.data.data[0]};
    console.log(list);
    io.in(room).emit('reloaded-table-detail',list);
    }).catch((error) => {
  }); 
  //////bếp  
    if(param.type_manager == 'eat-in')
    {
     data_send = {message:"remove_order", id_order:param.id_order}
      io.in(room).emit('removed-chef-order',data_send);

    }else{
      data_send = {message:"remove_order", id_order:param.id_order}
      io.in(room).emit('removed-chef-order',data_send);
 
    }
});
// khách hủy món
socket.on('customer-cancel-product',function(param){
  console.log(param);
  socket.join(param.id_business);
  var data2 = { detect: 'table_order', id_order: param.id_order};
  var room = param.id_business;
    axios.post(url, data2, { headers,
    }).then((res) => {
      var a= [];
      let list = {table_status:param.table_status,table_title:param.table_title, id_floor: param.id_floor, id_order: param.id_order, id_table: param.id_table,...res.data.data[0], table_order: a };
       list.table_order.push(res.data.data[0]);
  //  res.data.data[0] = {"id_floor":param.id_floor, "id_table": param.id_table,...res.data.data[0]};
    console.log(list);
    io.in(room).emit('reloaded-table-detail',list);
    }).catch((error) => {
  }); 
      // bếp
  if(param.type_manager == 'eat-in')
    {
      var data3 = { detect: 'list_chef_order',id_order:param.id_order, type_manager: 'eat_in', id_business:param.id_business };
      axios.post(url, data3, { headers,
      }).then((res) => {
      console.log(res.data);
      res.data.type = "update";
      io.in(room).emit('reloaded-order-eat-in',res.data.data[0]);
      }).catch((error) => {
      });
    }else{
      var data3 = { detect: 'list_chef_order',id_order:param.id_order, type_manager: 'carry_out', id_business:param.id_business };
      axios.post(url, data3, { headers,
      }).then((res) => {
      console.log(res.data);
      res.data.type = param.type_prosessing;
      io.in(room).emit('reloaded-order-carry-out',res.data.data[0]);
      }).catch((error) => {
      });  
    }
});

// bếp hủy món
socket.on('chef-cancel-product',function(param){
  console.log(param);
  socket.join(param.id_business);
  var data2 = { detect: 'table_order', id_order: param.id_order};
  var room = param.id_business;
    axios.post(url, data2, { headers,
    }).then((res) => {
      var a= [];
      let list = {table_status:param.table_status,table_title:param.table_title, id_floor: param.id_floor, id_order: param.id_order, id_table: param.id_table,...res.data.data[0], table_order: a };
       list.table_order.push(res.data.data[0]);
  //  res.data.data[0] = {"id_floor":param.id_floor, "id_table": param.id_table,...res.data.data[0]};
    console.log(list);
    io.in(room).emit('reloaded-table-detail',list);
    }).catch((error) => {
  });
  if(param.type_manager == 'eat-in')
    {
      var data3 = { detect: 'list_chef_order',id_order:param.id_order, type_manager: 'eat_in', id_business:param.id_business };
      axios.post(url, data3, { headers,
      }).then((res) => {
      console.log(res.data.data[0]);
      res.data.type = param.type_prosessing;
      io.in(room).emit('reloaded-order-eat-in',res.data.data[0]);
      }).catch((error) => {
      });
    }else{
      var data3 = { detect: 'list_chef_order',id_order:param.id_order, type_manager: 'carry_out', id_business:param.id_business };
      axios.post(url, data3, { headers,
      }).then((res) => {
      console.log(res.data.data[0]);
      res.data.type = param.type_prosessing;
      io.in(room).emit('reloaded-order-carry-out',res.data.data[0]);
      }).catch((error) => {
      });  
    }
});

/// update số lượng  món ăn
socket.on('update-quantity-order',function(param){
  console.log(param);
  socket.join(param.id_business);
  var data2 = { detect: 'table_order', id_order: param.id_order};
  var room = param.id_business;
    axios.post(url, data2, { headers,
    }).then((res) => {
      var a= [];
      let list = {table_status:param.table_status,table_title:param.table_title, id_floor: param.id_floor, id_order: param.id_order, id_table: param.id_table,...res.data.data[0], table_order: a };
       list.table_order.push(res.data.data[0]);
  //  res.data.data[0] = {"id_floor":param.id_floor, "id_table": param.id_table,...res.data.data[0]};
    console.log(list);
    io.in(room).emit('reloaded-table-detail',list);
    }).catch((error) => {
  }); 
  if(param.type_manager == 'eat-in')
    {
      var data3 = { detect: 'list_chef_order',id_order:param.id_order, type_manager: 'eat_in', id_business:param.id_business };
      axios.post(url, data3, { headers,
      }).then((res) => {
      console.log(res.data);
      res.data.type = param.type_prosessing;
      io.in(room).emit('reloaded-order-eat-in',res.data.data[0]);
      }).catch((error) => {
      });
    }else{
      var data3 = { detect: 'list_chef_order',id_order:param.id_order, type_manager: 'carry_out', id_business:param.id_business };
      axios.post(url, data3, { headers,
      }).then((res) => {
      console.log(res.data);
      res.data.type = param.type_prosessing;
      io.in(room).emit('reloaded-order-carry-out',res.data.data[0]);
      }).catch((error) => {
      });  
    }
});
/// update món ăn 
socket.on('update-product-order',function(param){
  console.log(param);
  socket.join(param.id_business);
  var data2 = { detect: 'table_order', id_order: param.id_order};
  var room = param.id_business;
    axios.post(url, data2, { headers,
    }).then((res) => {
      var a= [];
      let list = {table_status:param.table_status,table_title:param.table_title, id_floor: param.id_floor, id_order: param.id_order, id_table: param.id_table,...res.data.data[0], table_order: a };
       list.table_order.push(res.data.data[0]);
  //  res.data.data[0] = {"id_floor":param.id_floor, "id_table": param.id_table,...res.data.data[0]};

    console.log(list);
    io.in(room).emit('reloaded-table-detail',list);
    }).catch((error) => {
  }); 
  if(param.type_manager == 'eat-in')
    {
      var data3 = { detect: 'list_chef_order',id_order:param.id_order, type_manager: 'eat_in', id_business:param.id_business };
      axios.post(url, data3, { headers,
      }).then((res) => {
      res.data.type = param.type_prosessing;
      io.in(room).emit('reloaded-order-eat-in',res.data.data[0]);
      }).catch((error) => {
      });
    }else{
      var data3 = { detect: 'list_chef_order',id_order:param.id_order, type_manager: 'carry_out', id_business:param.id_business };
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
  var data2 = { detect: 'table_order', id_order: param.id_order};
  var room = param.id_business;
  console.log(param);
  var arr_table_full = [];
    axios.post(url, data2, { headers,
    }).then((res) => {
      var a= [];
      let list = {type_reload:'open_table', table_status:"full", table_title:param.table_title, id_floor: param.id_floor, id_order: param.id_order, id_table: param.id_table,...res.data.data[0], table_order: a };
      list.table_order.push(res.data.data[0]);
  //  res.data.data[0] = {"id_floor":param.id_floor, "id_table": param.id_table,...res.data.data[0]};
    arr_table_full = list;
    console.log(arr_table_full);
    //io.in(room).emit('reloaded-table-detail',list);
    }).catch((error) => {
  }); 

  var data3 = { detect: 'list_table_empty',id_business:param.id_business, id_floor: param.id_floor_before, id_table:param.id_table_before};
  axios.post(url, data3, { headers,
  }).then((res) => {
    console.log(res.data);
  
    data_table= {type_full: arr_table_full ,
                 type_empty: res.data.data[0] }
  //console.log(data_table);
  io.in(room).emit('changed-table',data_table);
  }).catch((error) => {
}); 
    var data3 = { detect: 'list_chef_order',id_order:param.id_order, type_manager: 'eat_in', id_business:param.id_business };
    axios.post(url, data3, { headers,
    }).then((res) => {
    res.data.type = param.type_prosessing;
    io.in(room).emit('reloaded-order-eat-in',res.data.data[0]);
    }).catch((error) => {
    });


});


// disable product
socket.on('disable-product',function(param){  
  // androi
  console.log(param);
  socket.join(param.id_business);
  var room = param.id_business;
  data = {message:"reloaded product"};
  console.log(data);
  io.in(room).emit('reloaded-product',data);

  var data2 = { detect: 'table_order', id_order: param.id_order};
    axios.post(url, data2, { headers,
    }).then((res) => {
      var a= [];
      let list = {table_status:param.table_status,table_title:param.table_title, id_floor: param.id_floor, id_order: param.id_order, id_table: param.id_table,...res.data.data[0], table_order: a };
       list.table_order.push(res.data.data[0]);
  //  res.data.data[0] = {"id_floor":param.id_floor, "id_table": param.id_table,...res.data.data[0]};
    console.log(list);
    io.in(room).emit('reloaded-table-detail',list);
    }).catch((error) => {
  });
  if(param.type_manager == 'eat-in')
    {
      var data3 = { detect: 'list_chef_order',id_order:param.id_order, type_manager: 'eat_in', id_business:param.id_business };
      axios.post(url, data3, { headers,
      }).then((res) => {
      console.log(res.data.data[0]);
      res.data.type = param.type_prosessing;
      io.in(room).emit('reloaded-order-eat-in',res.data.data[0]);
      }).catch((error) => {
      });
    }else{
      var data3 = { detect: 'list_chef_order',id_order:param.id_order, type_manager: 'carry_out', id_business:param.id_business };
      axios.post(url, data3, { headers,
      }).then((res) => {
      console.log(res.data.data[0]);
      res.data.type = param.type_prosessing;
      io.in(room).emit('reloaded-order-carry-out',res.data.data[0]);
      }).catch((error) => {
      });  
    }
});

// đóng bàn
socket.on('close-table',function(param)
{
  socket.join(param.id_business);
  var data2 = { detect: 'table_order', id_order: param.id_order};
  var room = param.id_business;
  console.log(param);
    axios.post(url, data2, { headers,
    }).then((res) => {
      var a= [];
      let list = {type_reload:'close-table', table_status:param.table_status, table_title:param.table_title, id_floor: param.id_floor, id_order: param.id_order, id_table: param.id_table,...res.data.data[0], table_order: a };
      list.table_order.push(res.data.data[0]);
  //  res.data.data[0] = {"id_floor":param.id_floor, "id_table": param.id_table,...res.data.data[0]};
    console.log(list);
    io.in(room).emit('closed-table',list);
    }).catch((error) => {
  });  
});







  


 
});





app.get("/",function(req,res){
    res.render("index");
});
app.get("/bep",function(req,res){
    res.render("bep");
});
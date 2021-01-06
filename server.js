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
  socket.on('join-store', function(room) {
    socket.join(room.id_business);
    console.log(room.id_business);
    io.in(room).emit("connected", 'da ket noi'+ socket.id);
 });

//mở bàn và đặt món
 socket.on('reload-table-detail', function(param){
//  console.log(param);
  socket.join(param.id_business);
  var data2 = { detect: 'table_order', id_order: param.id_order};
  var room = param.id_business;
  console.log(param);
    axios.post(url, data2, { headers,
    }).then((res) => {
      var a= [];
      let list = {type_reload:'open_table', table_status:param.table_status, table_title:param.table_title, id_floor: param.id_floor, id_order: param.id_order, id_table: param.id_table,...res.data.data[0], table_order: a };
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
      console.log(res.data);
      res.data.type = param.type_prosessing;
      io.in(room).emit('list-ordered-eat-in',res.data);
      }).catch((error) => {
      });
    }else{
      var data3 = { detect: 'list_chef_order',id_order:param.id_order, type_manager: 'carry_out', id_business:param.id_business };
      axios.post(url, data3, { headers,
      }).then((res) => {
      console.log(res.data);
      res.data.type = param.type_prosessing;
      io.in(room).emit('list-ordered-carry-out',res.data);
      }).catch((error) => {
      });  
    }
 });

///khách hủy món
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
      io.in(room).emit('list-ordered-eat-in',res.data);;
      }).catch((error) => {
      });
    }else{
      var data3 = { detect: 'list_chef_order',id_order:param.id_order, type_manager: 'carry_out', id_business:param.id_business };
      axios.post(url, data3, { headers,
      }).then((res) => {
      console.log(res.data);
      res.data.type = param.type_prosessing;
      io.in(room).emit('list-ordered-carry-out',res.data);;
      }).catch((error) => {
      });  
    }
});

// bếp hủy món
socket.on(' chef-cancel-product',function(param){
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
      io.in(room).emit('list-ordered-eat-in',res.data);;
      }).catch((error) => {
      });
    }else{
      var data3 = { detect: 'list_chef_order',id_order:param.id_order, type_manager: 'carry_out', id_business:param.id_business };
      axios.post(url, data3, { headers,
      }).then((res) => {
      console.log(res.data);

      io.in(room).emit('list-ordered-carry-out',res.data);
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
      io.in(room).emit('list-ordered-eat-in',res.data);
      }).catch((error) => {
      });
    }else{
      var data3 = { detect: 'list_chef_order',id_order:param.id_order, type_manager: 'carry_out', id_business:param.id_business };
      axios.post(url, data3, { headers,
      }).then((res) => {
      console.log(res.data);
      res.data.type = param.type_prosessing;
      io.in(room).emit('list-ordered-carry-out',res.data);
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
      io.in(room).emit('list-ordered-eat-in',res.data);
      }).catch((error) => {
      });
    }else{
      var data3 = { detect: 'list_chef_order',id_order:param.id_order, type_manager: 'carry_out', id_business:param.id_business };
      axios.post(url, data3, { headers,
      }).then((res) => {
      res.data.type = param.type_prosessing;
      io.in(room).emit('list-ordered-carry-out',res.data);
      }).catch((error) => {
      });  
    }
});

// enable - disable product
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
    io.in(room).emit('list-ordered-eat-in',res.data);
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
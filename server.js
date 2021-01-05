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
  //   var data = { detect: 'list_floor', id_business:room};
  //   var room = param.id_business;
  //     axios.post(url, data, { headers,
  //     }).then((res) => {
     
  //     io.to(room).emit('opened-table',res.data);
  //     }).catch((error) => {
  //   });
 });

 socket.on('reload-table-detail', function(param){
  //mỏ bàn, hiển thị trạng thái chờ món
//  console.log(param);
  socket.join(param.id_business);
  var data2 = { detect: 'table_order', id_order: param.id_order};
  var room = param.id_business;
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
    if(param.type_order == 'eat_in')
    {
      var data3 = { detect: 'list_chef_order', type_manager: 'eat_in', id_business:param.id_business };
      axios.post(url, data3, { headers,
      }).then((res) => {
      console.log(res.data);

      io.in(room).emit('list-ordered',res.data);
      }).catch((error) => {
      });
    }else{
      var data3 = { detect: 'list_chef_order', type_manager: 'carry_out', id_business:param.id_business };
      axios.post(url, data3, { headers,
      }).then((res) => {
      console.log(res.data);

      io.in(room).emit('list-ordered',res.data);
      }).catch((error) => {
      });  
    }
 });


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
});

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
});

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
});


//   /////////////////Cập nhật trạng thái đang chờ //////////////////////////////////////
  socket.on("status-table-wait",function(param)
  {
    console.log(param);
    var data = { detect: 'table_order', id_order: param.id_order}; 
    var room = param.id_business;
    socket.join(room);
      axios.post(url, data, { headers,
      }).then((res) => {
      var a= [];
      let list = {table_status:param.table_status,table_title:param.table_title, id_floor: param.id_floor, id_order: param.id_order, id_table: param.id_table,...res.data.data[0], table_order: a };
      list.table_order.push(res.data.data[0]);
      io.in(room).emit('reloaded-table-detail',list);
      }).catch((error) => {
    });

    

  });
//   ///////////////////Cập nhật trạng thái đang ăn//////////////////////////
  socket.on("status-table-eat",function(param)
  {
    console.log(param);
    var data = { detect: 'table_order', id_order: param.id_order}; 
    var room = param.id_business;
    socket.join(room);
      axios.post(url, data, { headers,
      }).then((res) => {
      var a= [];
      let list = {table_status:param.table_status,table_title:param.table_title, id_floor: param.id_floor, id_order: param.id_order, id_table: param.id_table,...res.data.data[0], table_order: a };
      list.table_order.push(res.data.data[0]);
      io.in(room).emit('reloaded-table-detail',list);
      }).catch((error) => {
    });

      

  });
//   ///////////////////Cập nhật trạng thái đợi thanh toán//////////////////////////
  socket.on("status-table-pay",function(param)
  {
    console.log(param);
    var data = { detect: 'table_order', id_order: param.id_order}; 
    var room = param.id_business;
    socket.join(room);
      axios.post(url, data, { headers,
      }).then((res) => {
      var a= [];
      let list = {table_status:param.table_status,table_title:param.table_title, id_floor: param.id_floor, id_order: param.id_order, id_table: param.id_table,...res.data.data[0], table_order: a };
      list.table_order.push(res.data.data[0]);
      io.in(room).emit('reloaded-table-detail',list);
      }).catch((error) => {
    });

     

  });
//   ///////////////////Đóng bán, thanh toán thành công//////////////////////////
//   socket.on("close-table",function(param)
//   {
//     console.log(param);
//     var data = { detect: 'order_employee', type_manager: 'update_order_status', param:param };  
//     var room = param.id_business;
//       axios.post(url, data, { headers,
//       }).then((res) => {
//      // socket.emit('opened-table','tao don hang thanh cong');
//       }).catch((error) => {
//     });

//     var data = { detect: 'list_floor', id_business: param.id_business};
//     var room = param.id_business;
//       axios.post(url, data, { headers,
//       }).then((res) => {
//       io.to(room).emit('closed-table',res.data);
//       }).catch((error) => {
//     });

//   });


  


 
});





app.get("/",function(req,res){
    res.render("index");
});
app.get("/bep",function(req,res){
    res.render("bep");
});
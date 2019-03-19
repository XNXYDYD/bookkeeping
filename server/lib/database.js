const mysql = require('mysql');
const co = require('co-mysql');// 可以让mysql使用async和await

// 创建连接池
const pool  = mysql.createPool({
  host     : 'localhost',   // 数据库地址
  user     : 'root',    // 数据库用户
  password : '',   // 数据库密码
  database : 'count'  // 选中数据库
});
let db = co(pool);

module.exports = db;
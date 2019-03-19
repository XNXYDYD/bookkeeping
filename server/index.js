const Koa = require('koa');
var bodyParser = require('koa-bodyparser');//解析post boyd数据
const router = require('koa-router')();
const cors = require('koa2-cors');// 解决跨域插件
const mysql = require('mysql');
const app = new Koa();

// 创建连接池
const pool  = mysql.createPool({
  host     : 'http://127.0.0.1',   // 数据库地址
  user     : 'root',    // 数据库用户
  password : '',   // 数据库密码
  database : 'account'  // 选中数据库
});

app.use(bodyParser());

app.use(cors({
  origin: function (ctx) {
      if (ctx.url === '/test') {
          return "*"; // 允许来自所有域名请求
      }
      return 'http://localhost:8080'; // 这样就能只允许 http://localhost:8080 这个域名的请求了
  },
  exposeHeaders: ['WWW-Authenticate', 'Server-Authorization'],
  maxAge: 5,
  credentials: true,
  allowMethods: ['GET', 'POST', 'DELETE'],
  allowHeaders: ['Content-Type', 'Authorization', 'Accept'],
}));
// 配置路由
router.get('/',function(ctx,next){
  ctx.body = 'index'
});
router.post('/add',function(ctx,next){
  let body = ctx.request.body;
  console.log('POST', body)
  ctx.body = `add ${body.text}`
});
router.get('/get',function(ctx,next){
  //从request中获取GET请求
  let request =ctx.request;
  let req_query = request.query;
  let req_querystring = request.querystring;
  console.log(req_query, req_querystring);
  // 在数据池中进行会话操作
  pool.getConnection(function(err, connection) {
    console.log('err', err)
    connection.query('SELECT * FROM account_list',  (error, results, fields) => {
      console.log(results, fields);
      // 结束会话
      connection.release();
  
      // 如果有错误就抛出
      if (error) {
        throw error
      }
      else{
        ctx.body = {text:'get'}
      }
    })
  });
  
});

// 解析上下文里node原生请求的POST参数
function parsePostData( ctx ) {
  return new Promise((resolve, reject) => {
    try {
      let postdata = "";
      ctx.req.addListener('data', (data) => {
        postdata += data
      })
      ctx.req.addListener("end",function(){
        let parseData = parseQueryStr( postdata )
        resolve( parseData )
      })
    } catch ( err ) {
      reject(err)
    }
  })
}

// 将POST请求参数字符串解析成JSON
function parseQueryStr( queryStr ) {
  let queryData = {}
  let queryStrList = queryStr.split('&')
  console.log( queryStrList )
  for (  let [ index, queryStr ] of queryStrList.entries()  ) {
    let itemList = queryStr.split('=')
    queryData[ itemList[0] ] = decodeURIComponent(itemList[1])
  }
  return queryData
}

let dbquery = function( sql, values ) {
  return new Promise(( resolve, reject ) => {
    pool.getConnection(function(err, connection) {
      if (err) {
        reject( err )
      } else {
        connection.query(sql, values, ( err, rows) => {

          if ( err ) {
            reject( err )
          } else {
            resolve( rows )
          }
          connection.release()
        })
      }
    })
  })
}

async function getData( ) {
  let sql = 'SELECT * FROM account_list'
  let data = await dbquery( sql )
  console.log(data)
}
getData();
// app.use(bodyParser);
app.use(router.routes());//启动路由
app.use(router.allowedMethods());//作用： 这是官方文档的推荐用法,我们可以看到router.allowedMethods()用在了路由匹配router.routes()之后,所以在当所有路由中间件最后调用.此时根据ctx.status设置response响应头

app.listen(2019, () => {
  console.log('server is runing');
});
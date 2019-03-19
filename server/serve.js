const Koa = require('koa');
var bodyParser = require('koa-bodyparser');//解析post boyd数据
const router = require('./api/index');// 请求处理
const cors = require('koa2-cors');// 解决跨域插件
const db = require('./lib/database');// 数据库

const app = new Koa();

app.context.db = db;

app.use(bodyParser());// 使用bodyParser 或者better-body可以帮助解析post请求的数据

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

app.use(router.routes());//启动路由
app.use(router.allowedMethods());//作用： 这是官方文档的推荐用法,我们可以看到router.allowedMethods()用在了路由匹配router.routes()之后,所以在当所有路由中间件最后调用.此时根据ctx.status设置response响应头

app.listen(2019, () => {
  console.log('server is runing');
});
const router = require('koa-router')();
let record = require('./add_record');

// 
// 配置路由

router.get('/',function(ctx,next){
  ctx.body = 'index'
});

// 查询记录
router.get('/getRecord',async function(ctx,next){
  //从request中获取GET请求
  let request =ctx.request;
  let params = request.query;
  let req_querystring = request.querystring;
  console.log('getRecord', params);
  // 在数据池中进行会话操作 desc asc
  // let data = await ctx.db.query(`SELECT * FROM account_list WHERE is_delete = '1' order by date desc,save_time desc;`);
  // SELECT * FROM account_list WHERE is_delete = '1' AND date >= '2019-04-01' 
  // 分页获取
  let condition =  params.page>0 && params.pageSize>0;
  let startNumber = condition ? params.page > 1 ?  (params.page-1) * params.pageSize : 0 : '';
  let pageSize = condition ? params.pageSize: '';
  let limitStr =   condition ? `LIMIT ${startNumber},${pageSize}` : '';
  console.log(`SELECT * FROM account_list WHERE is_delete = '1'AND date >='${params.date}-01' AND date <='${params.date}-31' ORDER BY date DESC,save_time DESC  ${limitStr};`)
  // let data = await ctx.db.query(`SELECT * FROM account_list WHERE is_delete = '1' ORDER BY date DESC,save_time DESC  ${limitStr};`);
  let data = await ctx.db.query(`SELECT * FROM account_list WHERE is_delete = '1'AND date >='${params.date}-01' AND date <='${params.date}-31' ORDER BY date DESC,save_time DESC  ${limitStr};`);
  if( data.length < 1 ){
    ctx.body ={
      code:-1,
      msg:'获取数据失败'
    };
  }
  // 存到数据库的金额要为数字类型，这里做数据转换
  let exportData = data.map(i => {
    i.pay = i.pay * 1;
    return i;
  });
  ctx.body = exportData;
});

router.get('/categories',async function(ctx,next){
  // 在数据池中进行会话操作
  let data = await ctx.db.query('SELECT * FROM new_categories order by code asc;');
  // console.log('categories', typeof data, Object.prototype.toString.call(data));
  if( Object.prototype.toString.call(data) !='[object Array]' ){
    ctx.body ={
      code:-1,
      msg:'获取数据失败'
    };
    return;
  }
  ctx.body = data;
});

router.get('/getSum',async function(ctx,next){
  // 在数据池中进行会话操作
  console.log('ctx', ctx.query);
  let searchDate = ctx.query.date;
  let data = await ctx.db.query(`SELECT SUM(pay) AS paySum FROM account_list WHERE is_delete = '1' AND date >= '${searchDate}-01' AND date <= '${searchDate}-31';`);
  ctx.body = data[0].paySum;
});

router.post('/addRecord',async function(ctx,next){
  let body = ctx.request.body;
  console.log('POST', body);
  let resp = {};
  if(body.pay <= 0){
    resp = {
      code:300,
      msg:'金额不能小于零'
    }
    ctx.body =resp;
    return;
  }else if(!body.category_name){
    resp = {
      code:300,
      msg:'支出项不能为空'
    }
    ctx.body =resp;
    return;
  }else{
    resp = {
      code:0,
      msg:'成功'
    }
  }
  console.log('body', body);
  let data = await ctx.db.query(`INSERT INTO account_list(date,category_name,pay,save_time,income,note,parent_code,code) 
                                  VALUES(
                                    '${body.date}',
                                    '${body.category_name}',
                                    ${body.pay},
                                    '${body.saveTime}',
                                    ${body.income || '0.00'},
                                    '${body.note}',
                                    '${body.parent_code}',
                                    '${body.code}');`
                                    );
  console.log('data', data);
  if( data.affectedRows > 0){
    ctx.body =resp;
  }else{
    ctx.body ={
      code:-1,
      msg:'保存失败'
    };
  }
});

/* 修改记录 */
router.post('/upadteRecord', async function(ctx,req){
  let body = ctx.request.body;
  console.log('upadteRecord', body);
  let resp = {};
  if(!body.id){
    resp = {
      code:300,
      msg:'记录ID不能为空'
    }
  }else if(body.pay <= 0){
    resp = {
      code:300,
      msg:'金额不能小于零'
    }
    ctx.body =resp;
    return;
  }else if(!body.category_name){
    resp = {
      code:300,
      msg:'支出项不能为空'
    }
    ctx.body =resp;
    return;
  }else{
    resp = {
      code:0,
      msg:'成功'
    }
  }
  let data = await ctx.db.query(`UPDATE account_list SET category_name='${body.category_name}',pay='${body.pay}',date='${body.date}',save_time='${body.saveTime}',note='${body.note}',code='${body.code}',parent_code='${body.parent_code}' WHERE ID = '${body.id}';`);
  console.log('data', data);
  if( data.affectedRows > 0){
    ctx.body =resp;
  }else{
    ctx.body ={
      code:-1,
      msg:'保存失败'
    };
  }
});
router.get('/chartData',async function(ctx,next){
  console.log('ctx', ctx.request.body)
  ctx.body = {
    obj:[
      {module:'A20N02D', updateTime:'2019-05-29 08:21:47' ,Date:'20190529' ,tbl:'tbl_A20N02D_20190529' ,cacheId: '1145'},
      {module:'S8V04B', updateTime:'2019-05-29 09:22:47' ,Date:'20190529' ,tbl:'tbl_S8V04B_20190529' ,cacheId: '3677'},
    ]
  };
});

module.exports = router;

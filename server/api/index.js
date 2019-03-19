const router = require('koa-router')();
let record = require('./add_record')
// 配置路由

router.get('/',function(ctx,next){
  ctx.body = 'index'
});


router.get('/get',async function(ctx,next){
  //从request中获取GET请求
  let request =ctx.request;
  let params = request.query;
  let req_querystring = request.querystring;
  console.log(params, req_querystring);
  // 在数据池中进行会话操作 desc asc
  // let data = await ctx.db.query(`SELECT * FROM account_list WHERE is_delete = '1' order by date desc,save_time desc;`);
  // 分页获取
  let condition =  params.page>0 && params.pageSize>0;
  let startNumber = condition ? params.page > 1 ?  (params.page-1) * params.pageSize : 0 : '';
  let pageSize = condition ? params.pageSize: '';
  let limitStr =   condition ? `LIMIT ${startNumber},${pageSize}` : '';
  let data = await ctx.db.query(`SELECT * FROM account_list WHERE is_delete = '1' ORDER BY date DESC,save_time DESC  ${limitStr};`);
  if( data.length < 1 ){
    ctx.body ={
      code:-1,
      msg:'获取数据失败'
    };
  }
  let exportData = data.map(i => {
    i.pay = i.pay * 1;
    return i;
  });
  ctx.body = exportData;
});

router.get('/categories',async function(ctx,next){
  // 在数据池中进行会话操作
  let data = await ctx.db.query('SELECT * FROM categories order by category_code asc;');
  ctx.body = data;
});

router.get('/getSum',async function(ctx,next){
  // 在数据池中进行会话操作
  // select sum(quantity) as items_ordered from orderitems where order_num = 20005;
  let data = await ctx.db.query(`SELECT SUM(pay) AS paySum FROM account_list WHERE is_delete = '1';`);
  ctx.body = data[0].paySum;
});

// router.use('/addRecord',record);
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
  }else if(!body.item){
    resp = {
      code:300,
      msg:'类别不能为空'
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
  let data = await ctx.db.query(`INSERT INTO account_list(date,item,pay,save_time,income,note) 
                                  VALUES('${body.date}','${body.item}',${body.pay},'${body.saveTime}',${body.income || '0.00'}),${body.note || ''});`);
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

/* 修改添加记录 */

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
  }else if(!body.item){
    resp = {
      code:300,
      msg:'类别不能为空'
    }
    ctx.body =resp;
    return;
  }else{
    resp = {
      code:0,
      msg:'成功'
    }
  }
  // `VALUES('${body.date}','${body.item}',${body.pay},'${body.saveTime}',${body.income || '0.00'});`
  let data = await ctx.db.query(`UPDATE account_list SET item='${body.item}',pay='${body.pay}',date='${body.date}',save_time='${body.saveTime}',note='${body.note}' WHERE ID = '${body.id}';`);
  // let data = await ctx.db.query(`UPDATE account_list SET item='霸王餐',pay='55.00',date='2019-03-15',save_time='1552619934436' WHERE id = '1';`);
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

module.exports = router;

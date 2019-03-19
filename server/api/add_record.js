const Router = require('koa-router');

let router=new Router();

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
  
  let data = await ctx.db.query(`INSERT INTO account_list(date,item,pay,income) VALUES('${body.date}','${body.item}',${body.pay},${body.income || '0.00'});`);
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

module.exports = router.routes();
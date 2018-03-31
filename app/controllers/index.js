// 导入router 设置默认的顶部是 /api 开头
const router = require('koa-router')({ prefix: '/api/'});
const userModel = require('../lib/mysql');
const md5 = require('md5');
router
    .post('user/register', async (ctx, next) => {
        // 注册用户
        let user = JSON.parse(ctx.request.body);
        let newpass = ctx.request.body.newpass;
        ctx.response.type = 'application/json';
        if (!user.username || !user.password || user.password !== newpass) {
            ctx.response.body = {code: 400, msg: '参数错误'};
        }
        // 先查找用户名是否已经注册 
        let res = await userModel
                        .findUserByName([user.username])
                        .then(res => res);
        if (res.length !== 0 ) {
            ctx.body = { code: 401, msg: '用户名已被注册' };
        } else {
            // 向用户表写入用户数据
            user.moment = new Date().getTime();
            let res = await userModel.registerUser([user.username, md5(user.password), ' ', user.moment + '', 0])
                .then(res => res);
            if (res.affectedRows === 1) {
                ctx.response.body = { code: 200, msg: 'success', userId: res.insertId };
            }
        }
       
    })
    .post('user/signin', async (ctx, next) => {
        // 用户登录
        let user = {
            username: ctx.request.body.username,
            password: ctx.request.body.password,
        }
        ctx.response.type = 'application/json';
        // 根据用户名获取用户信息 然后比对用户信息
        let data = await userModel
            .findUserByName([user.username])
            .then(res => res[0]);
        if (!data) {
            ctx.response.body = { code: 204, msg: '用户不存在' };
        } else if (data.username === user.username && data.password === user.password) {
            delete data.password;
            ctx.response.body = { code: 200, msg: 'success', data };
        } else {
            ctx.response.body = { code: 401, msg: '密码错误'};
        }
    })
    .get('user/:userId', async (ctx, next) => {
        // 根据用户id 得到用户信息
        let userId = ctx.params.userId;
        ctx.response.type = 'application/json';
        let data = await userModel
            .findUserById([userId])
            .then(res => res[0]);
        if (!data) {
            ctx.response.body = { code: 204, msg: '用户不存在' };
        } else {
            ctx.response.body = { code: 200, msg: 'success', data };
        }
    })
    // 上传用户分数
    .post('user/:userId/score', async (ctx, next) => {
        // 用户登录
        let user = {
            username: ctx.request.body.username,
            userId: ctx.params.userId,
            score: ctx.request.body.score,
        }
        ctx.response.type = 'application/json';
        // 根据用户名获取用户信息 然后比对用户信息
        let data = await userModel
            .updateScore([user.score, user.username, user.userId])
            .then(res => res);
        if (data.affectedRows) {
            ctx.response.body = { code: 200, msg: 'success'};
        } else {
            ctx.response.body = { code: 401, msg: '请登录' };
        }
    })
    // 评论相关
    .post('comment', async (ctx, next) => {
        // 增加一条评论 
        let comment = {
            username: ctx.request.body.username,
            content: ctx.request.body.content,
            moment: ctx.request.body.moment,
        }
        ctx.response.type = 'application/json';
        // 根据用户名获取用户信息 然后比对用户信息
        let res = await userModel
            .insertComment([comment.username, comment.content, comment.moment])
            .then(res => res);
        if (res.affectedRows === 1){
            ctx.response.body = { code: 200, msg: 'success'};
        } else {
            ctx.response.body = { code: 400, msg: '评论失败' };
        }
    })
    .get('comments', async (ctx, next) => {
        // 获取所有的评论数
        try {
            let res = await userModel
                .findComments()
                .then(res => res);
            ctx.response.body = { code: 200, msg: 'success', comments: res };
        } catch (error) {
            ctx.response.body = { code: 402, msg: error };
        }
    })
    
    // 排行榜
    .get('ranks', async (ctx, next) => {
        // 得到前十名的用户排行榜得分
        try {
            let res = await userModel
                .findRanks()
                .then(res => res);
            ctx.response.body = { code: 200, msg: 'success', data: res };
        } catch (error) {
            ctx.response.body = { code: 402, msg: '数据库查询出错!' };
        }
    })

module.exports = router;
var mysql = require('mysql');
var config = require('../config')
const uuidv4 = require('uuid/v4');

var pool = mysql.createPool({
    host: config.database.HOST,
    user: config.database.USERNAME,
    password: config.database.PASSWORD,
    database: config.database.DATABASE,
    port: config.database.PORT
});

// 封装一个执行语句 用于全局执行mysql 语句
let query = (sql, values) => {
    return new Promise((resolve, reject) => {
        pool.getConnection((err, connection) => {
            if (err) {
                reject(err)
            } else {
                connection.query(sql, values, (err, rows) => {
                    if (err) {
                        reject(err)
                    } else {
                        resolve(rows)
                    }
                    connection.release()
                })
            }
        })
    })

}

// 用户表 主键 userId 自动增加
let user =
    `create table if not exists user(
     userId VARCHAR(100) NOT NULL ,
     username VARCHAR(100) NOT NULL,
     password VARCHAR(100) NOT NULL,
     avatar VARCHAR(100),
     moment INT(100) NOT NULL,
     score INT(100) NOT NULL,
     PRIMARY KEY ( userId )
    );`

// 评论表
let comment =
    `create table if not exists comment(
     commentId VARCHAR(100) NOT NULL ,
     username VARCHAR(100) NOT NULL,
     content TEXT(100) NOT NULL,
     moment INT(100) NOT NULL,
     PRIMARY KEY ( commentId )
    );`

// 建表函数
let createTable = (sql) => {
    return query(sql, [])
}
createTable(user)
createTable(comment)

// 注册用户
let registerUser = (value) => {
    let _sql = "insert into user set userId= '" + uuidv4() +"',username=?,password=?,avatar=?,moment=?,score=?;"
    return query(_sql, value)
}
// 根据用户名查找用户
let findUserByName = (value) => {
    let _sql = "select * FROM user where username=?;";
    return query(_sql, value);
}
// 根据userId 查找 用户
let findUserById = (value) => {
    let _sql = "select * FROM user where userId=?;";
    return query(_sql, value);
}
// 写入一条评论
let insertComment = (value) => {
    let _sql = "insert into comment set commentId='" + uuidv4() +"',username=?,content=?,moment=?;"
    return query(_sql, value)
}
// 查找出所有的评论
let findComments = () => {
    let _sql = `select * FROM comment order by moment DESC;`
    return query(_sql)
}
// 得到排行榜前十名
let findRanks = () => {
    let _sql = `select username,score FROM user ORDER BY score ASC limit 10;`;
    return query(_sql);
}
// 写入用户分数
let updateScore = (value) => {
    let _sql = "update user set score=? where username=? && userId=?;"
    return query(_sql, value)
}

// 导出所有的函数
module.exports = {
    query,
    registerUser,
    insertComment,
    findComments,
    findUserByName,
    findUserById,
    findRanks,
    updateScore
}

'use strict'

var client = require('scp2')
client.scp('./dist', {
  host: '47.96.188.197', // 线上服务器地址
  port: 22, // ssh port，一般默认22
  username: 'root', // 登录服务器用户名
  password: 'Liangxiao0725', // 登录服务器密码
  path: '/var/www/html/account' // 线上环境web目录
}, err => {
  console.log(err)
})

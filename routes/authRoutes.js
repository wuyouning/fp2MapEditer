const express = require('express');
const router = express.Router();
const { findUser, verifyPassword, updateLastLogin, createUser } = require('../helpers/authHelpers');
const connection = require('../db/db');

// 处理登录请求
router.post('/login', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: '请填写所有字段。' });
    }

    // 查询用户是否存在
    findUser(username, (err, results) => {
        if (err) {
            console.error('Database query error:', err);
            return res.status(500).json({ message: '数据库查询出错' });
        }

        if (results.length > 0) {
            // 用户存在，验证密码
            verifyPassword(password, results[0].password, (err, isMatch) => {
                if (err) {
                    console.error('Password comparison error:', err);
                    return res.status(500).json({ message: '密码验证出错' });
                }
                if (isMatch) {
                    // 更新最后登录时间
                    updateLastLogin(results[0].id, (err) => {
                        if (err) {
                            console.error('Error updating last login:', err);
                            return res.status(500).json({ message: '更新最后登录时间出错' });
                        }
                        return res.status(200).json({ message: '登录成功！', userId: results[0].id, uuid: results[0].uuid });
                    });
                } else {
                    return res.status(401).json({ message: '密码错误' });
                }
            });
        } else {
            // 用户不存在，创建新用户
            res.status(200).json({ message: '首次登录，正在为你注册' });
            createUser(username, password, (err, newUser) => {
                if (err) {
                    console.error('Error creating user:', err);
                    return res.status(500).json({ message: '创建用户时出错' });
                }
                return res.status(201).json({ message: '用户创建成功！', userId: newUser.userId, uuid: newUser.uuid });
            });
        }
    });
});

module.exports = router;
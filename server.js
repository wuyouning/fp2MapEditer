const express = require('express');
const app = express();
require('dotenv').config();
const pool = require('./db/db');
const { v4: uuidv4 } = require('uuid');
const cors = require('cors');

//加密
const bcrypt = require('bcrypt');
const SALT_ROUNDS = 10;

app.use(cors());
app.use(express.json());


// 启动服务器
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


app.post('/api/login', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password ) {
        return res.status(400).json({ message: '请填写所有字段。'});
    }

    findUser(username, (err, result) => {
        if (err) {
            console.error('Database query error:', err);
            return res.status(500).json({ message: '数据库查询出错' });
        }

        if (result.length > 0) {
            verifyPassword(password, result[0].password, (err, isMatch) => {
                if (err) {
                    console.error("密码匹配失败:", err);
                    return res.status(500).json({ message: '密码验证失败'});
                }
                if (isMatch) {
                    updateLastLogin(result[0].id, (err) => {
                        if (err) {
                            console.error('更新最后登录时间失败了', err);
                            return res.status(500).json({ message: '更新最后登录时间失败了'});
                        }
                        return res.status(200).json({ message: '登录成功！', userId: result[0].id, uuid: result[0].uuid });
                    });
                } else {
                    return res.status(401).json({ message: '密码错误'});
                }
            });
        } else {
            createUser(username, password, (err, newUser) => {
                if (err) {
                    console.error('创建用户失败', err);
                    return res.status(500).json({ message: '创建用户时出错'});
                }
                return res.status(201).json({ message: '用户创建成功！', userId: newUser.userId, uuid: newUser.uuid })

            })
        }
    });
});

// 验证原密码
app.post('/api/verify-password', (req, res) => {
    const { userId, password } = req.body;

    if (!userId || !password) {
        return res.status(400).json({ message: '请填写所有字段。' });
    }

    pool.query(
        'SELECT password FROM users WHERE id = ?',
        [userId],
        (err, results) => {
            if (err) {
                console.error('Database query error:', err);
                return res.status(500).json({ message: '数据库查询出错' });
            }
            if (results.length === 0) {
                console.log('排查0-用户不存在')
                return res.status(404).json({ message: '用户不存在' });
            }
            // 校验原密码
            console.log('用户输入的原密码/api/verify-password 排查1:', password);
            console.log('数据库中的哈希密码/api/verify-password 排查2:', results[0].password);
            bcrypt.compare(password, results[0].password, (err, isMatch) => {
                if (err) {
                    console.error("原密码匹配失败:", err);
                    console.log("原密码匹配失败:", err);
                    return res.status(500).json({ message: '原密码验证失败' });
                }
                if (isMatch) {
                    console.log('用户顺利匹配了呀 排查3:', password);
                    return res.status(200).json({ message: '原密码验证成功' });
                } else {
                    console.log('密码:', password);
                    console.log('数据库中的哈希密码:', results[0].password);
                    console.log('比较结果:', isMatch);
                    return res.status(401).json({ message: '原密码错误' });
                }
            });
        }
    );
});


/**
 * 查询用户是否存在
 */
function findUser(username, callback) {
    pool.query(
        'SELECT * FROM users WHERE username = ?',
        [username],
        callback
    );
}


/**
 * 验证用户密码
 */
function verifyPassword(inputPassword, storedPassword, callback) {
    bcrypt.compare(inputPassword, storedPassword, callback);
}

// 修改用户密码
app.post('/api/change-password', (req, res) => {
    const { userId, newPassword } = req.body;

    if (!userId || !newPassword) {
        return res.status(400).json({ message: '请填写所有字段。' });
    }

    bcrypt.hash(newPassword, SALT_ROUNDS, (err, hashedPassword) => {
        if (err) {
            console.error('密码加密失败:', err);
            return res.status(500).json({ message: '密码加密失败' });
        }

        pool.query(
            'UPDATE users SET password = ? WHERE id = ?',
            [hashedPassword, userId],
            (err, result) => {
                if (err) {
                    console.error('更新密码失败:', err);
                    return res.status(500).json({ message: '更新密码失败' });
                }
                return res.status(200).json({ message: '密码修改成功' });
            }
        );
    });
});

/**
 * 修改用户账号
 */
app.post('/api/change-username', (req, res) => {
    const { uuid, newUsername } = req.body;

    if (!uuid || !newUsername) {
        return res.status(400).json({ message: '请填写所有字段。' });
    }

    pool.query(
        'UPDATE users SET username = ? WHERE uuid = ?',
        [newUsername, uuid],
        (err, result) => {
            if (err) {
                console.error('更新用户名失败:', err);
                return res.status(500).json({ message: '更新用户名失败' });
            }
            return res.status(200).json({ message: '用户名修改成功' });
        }
    );
});


/**
 * 更新用户的最后登录时间
 */
function updateLastLogin(userId, callback) {
    const lastLogin = new Date();
    pool.query(
        'UPDATE users SET last_login = ? WHERE id = ?',
        [lastLogin, userId],
        callback
    );
}

/**
 * 创建新用户
 */
function createUser(username, password, callback) {
    const createdAt = new Date();
    const uuid = uuidv4();
    
    bcrypt.hash(password, SALT_ROUNDS, (err, hashedPassword) => {
        if (err) return callback(err);

        pool.query(
            'INSERT INTO users (uuid, username, password, created_at, last_login) VALUES (?, ?, ?, ?, ?)',
            [uuid, username, hashedPassword, createdAt, createdAt],
            (err, result) => {
                if (err) return callback(err);
                callback(null, { userId: result.insertId, uuid });
            }
        );
    });
}

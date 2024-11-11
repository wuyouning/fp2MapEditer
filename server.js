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

// 更新画布信息
app.put('/api/update-hexgrid', (req, res) => {
    const { hexGridId, ownerId, name, description, isPublic } = req.body;

    // 参数校验
    if (!hexGridId) {
        return res.status(400).json({ message: '缺少 hexGridId' });
    }
    if (ownerId === undefined) {
        return res.status(400).json({ message: '更新画布发现，ownerId 不存在了！' });
    }

    let updateQuery = `
        UPDATE hexgrid 
        SET 
            hexgrid_name = ?, 
            description = ?, 
            is_public = ?, 
            lastedit_at = NOW()
    `;
    const updateParams = [name, description, isPublic];

    // 如果 ownerId 为 0，执行软删除逻辑（将 ownerId 设置为 -1）
    if (ownerId === 0) {
        updateQuery += ', owner_id = -1';
    } else if (ownerId !== undefined) {
        // 如果 ownerId 不为 0 且存在，则更新 ownerId
        updateQuery += ', owner_id = ?';
        updateParams.push(ownerId);
    }

    // 最终通过 hexGridId 进行更新
    updateQuery += ' WHERE hexGrid_id = ?';
    updateParams.push(hexGridId);

    pool.query(updateQuery, updateParams, (err, result) => {  // 更正为 pool.query 而不是 connection.query
        if (err) {
            console.error('更新 HexGrid 数据时出错：', err);
            return res.status(500).json({ message: '更新 HexGrid 数据时出错' });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: '未找到要更新的 HexGrid' });
        }

        return res.status(200).json({ message: 'HexGrid 更新成功' });
    });
});

// 保存画布
app.post('/api/save-hexgrid', (req, res) => {
    const { ownerId, hexSize, maxRadius, name, description, isPublic } = req.body;

    // 参数校验
    if (!ownerId || !name || !hexSize || !maxRadius) {
        return res.status(400).json({ message: '缺少必要的字段' });
    }

    const createdAt = new Date();
    const lasteditAt = createdAt;

    // 生成 hexGridId
    const hexGridId = uuidv4();

    pool.query(
        `INSERT INTO hexgrid
        (hexGrid_id, owner_id, hexSize, maxRadius, hexgrid_name, description, created_at, lastedit_at, is_public) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [hexGridId, ownerId, hexSize, maxRadius, name, description, createdAt, lasteditAt, isPublic],
        (err, result) => {
            if (err) {
                console.error('保存 HexGrid 数据时出错：', err);
                return res.status(500).json({ message: '保存 HexGrid 数据时出错' });
            }
            return res.status(201).json({ message: 'HexGrid 保存成功', hexGridId });
        }
    );
});

// 保存格子信息
app.post('/api/save-hex', (req, res) => {
    const { hexgridId, q, r, s, brush, region, type } = req.body;
    // 参数校验
    if (!hexgridId || q === undefined || r === undefined || s === undefined || !brush) {
        return res.status(400).json({ message: '缺少必要的字段' });
    }

    pool.query(
        `INSERT INTO hexes 
        (hexgrid_id, q, r, s, brush, region, type) 
        VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [hexgridId, q, r, s, brush, region, type],
        (err, result) => {
            if (err) {
                console.error('保存 Hex 数据时出错：', err);
                return res.status(500).json({ message: '保存 Hex 数据时出错' });
            }
            return res.status(201).json({ message: 'Hex 保存成功' });
        }
    );
});

//公共画布
app.get('/api/get-public-hexgrids', (req, res) => {
    const limit = parseInt(req.query.limit, 10) || 20;  // 获取每页条数，默认为20
    const offset = parseInt(req.query.offset, 10) || 0;  // 获取偏移量，默认为0

    const query = `
        SELECT hexgrid.*, users.username AS owner_name
        FROM hexgrid
        LEFT JOIN users ON hexgrid.owner_id = users.uuid
        WHERE hexgrid.is_public = true
        ORDER BY hexgrid.lastedit_at DESC
        LIMIT ? OFFSET ?
    `;

    pool.query(query, [limit, offset], (err, result) => {
        if (err) {
            console.error('获取公共 HexGrid 数据时出错', err);
            return res.status(500).json({ message: '获取公共 HexGrid 数据时出错' });
        }
        res.status(200).json(result);
    });
});

app.get('/api/get-private-hexgrids', (req, res) => {
    const ownerId = req.query.owner_id;
    const limit = parseInt(req.query.limit, 10) || 20;  // 获取每页条数，默认为20
    const offset = parseInt(req.query.offset, 10) || 0;  // 获取偏移量，默认为0

    if (!ownerId) {
        console.log('后端无法获得 id');
        return res.status(400).json({ message: '缺少 ownerId 参数' });
    }

    const query = `
        SELECT *
        FROM hexgrid
        WHERE owner_id = ?
        ORDER BY lastedit_at DESC
        LIMIT ? OFFSET ?
    `;

    pool.query(query, [ownerId, limit, offset], (err, results) => {
        if (err) {
            console.error('获取私有 HexGrid 数据时出错:', err);
            return res.status(500).json({ message: '获取私有 HexGrid 数据时出错' });
        }

        res.status(200).json(results);
    });
});

app.get('/api/hexes/:hexgrid_id', (req, res) => {
    const { hexgrid_id } = req.params;

    try {
        const query = 'SELECT q, r, s, brush, region, type FROM hexes WHERE hexgrid_id = ?';
        pool.query(query, [hexgrid_id], (err, rows) => {
            if (err) {
                console.error('没有获取格子们', err);
                res.status(500).json({ message: '网络错误'});
                return;
            }

            if (Array.isArray(rows) && rows.length > 0) {
                res.json(rows);
            } else {
                res.status(404).json({ message: `这个hexgrid没有找到对应的记录哦 ${hexgrid_id}`});
            }
        });
    } catch (error) {
        console.error('未能如期获取格子', error);
        res.status(500).json({ message: '网络错误'});
    }
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
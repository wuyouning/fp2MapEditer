
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

const path = require('path');
const { timeStamp } = require('console');
console.log('DB_HOST:', process.env.DB_HOST);

// 设置静态文件目录
app.use(express.static(path.join(__dirname)));

// 根路径路由，返回 index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// 启动服务器
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`服务运行 端口号: ${PORT}`);
});

process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
  });
  
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});


// 生成一个新的 UUID
app.get('/api/generate-uuid', (req, res) => {
    const uuid = uuidv4(); 
    res.status(200).json({ uuid }); // 将 UUID 作为 JSON 返回
});

app.post('/api/login', (req, res) => {
    const { username, password } = req.body;

    // 登录日志
    const timestamp = new Date().toISOString();
    console.log('用户正在尝试登录, 时间:', timestamp);
    console.log('收到的请求体内容:', req.body);

    // 参数校验
    if (!username || !password) {
        console.error('登录失败：缺少用户名或密码');
        return res.status(400).json({ message: '请填写所有字段。' });
    }

    console.log('查找用户中，用户名:', username);
    findUser(username, (err, result) => {
        if (err) {
            console.error('数据库查询出错:', err);
            return res.status(500).json({ message: '数据库查询出错' });
        }

        if (result.length > 0) {
            console.log('用户已找到，验证密码中...');
            verifyPassword(password, result[0].password, (err, isMatch) => {
                if (err) {
                    console.error('密码匹配失败:', err);
                    return res.status(500).json({ message: '密码验证失败' });
                }
                if (isMatch) {
                    console.log('密码验证成功，更新最后登录时间...');
                    updateLastLogin(result[0].id, (err) => {
                        if (err) {
                            console.error('更新最后登录时间失败:', err);
                            return res.status(500).json({ message: '更新最后登录时间失败' });
                        }
                        console.log('登录成功，用户ID:', result[0].id);
                        return res.status(200).json({ message: '登录成功！', userId: result[0].id, uuid: result[0].uuid });
                    });
                } else {
                    console.warn('密码错误，登录失败');
                    return res.status(401).json({ message: '密码错误' });
                }
            });
        } else {
            console.log('用户不存在，开始创建新用户，用户名:', username);
            createUser(username, password, (err, newUser) => {
                if (err) {
                    console.error('创建用户失败:', err);
                    return res.status(500).json({ message: '创建用户时出错' });
                }
                console.log('用户创建成功，用户ID:', newUser.userId);
                return res.status(201).json({ message: '用户创建成功！', userId: newUser.userId, uuid: newUser.uuid });
            });
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
    const { hexgrid_id, ownerId, hexgrid_name, description, is_public } = req.body;

    const timestamp = new Date().toISOString();
    console.log('更新画布了哦------>', timestamp);

    // 参数校验
    const errors = validateParams({ hexgrid_id, ownerId, hexgrid_name, description, is_public });
    if (errors.length > 0) {
        console.error('参数校验失败:', errors);
        return res.status(400).json({ message: `请求体参数有误: ${errors.join(', ')}` });
    }

    console.log('参数校验通过，传入的参数:', { hexgrid_id, ownerId, hexgrid_name, description, is_public });

    checkDeletedUserExists((err, deletedUserExists) => {
        if (err) {
            console.error('检查 deleted_user 是否存在时出错：', err);
            return res.status(500).json({ message: '数据库查询失败' });
        }

        if (!deletedUserExists) {
            console.error('deleted_user 不存在，请先添加该记录。');
            return res.status(500).json({ message: 'deleted_user 不存在，无法进行软删除' });
        }

        updateHexgrid({ hexgrid_id, ownerId, hexgrid_name, description, is_public }, res);
    });
});

function validateParams({ hexgrid_id, ownerId, hexgrid_name, description, is_public }) {
    const errors = [];
    if (!hexgrid_id) {
        errors.push('缺少 hexgrid_id');
    }
    if (ownerId === undefined) {
        errors.push('缺少 ownerId');
    }
    if (hexgrid_name === undefined) {
        errors.push('缺少 hexgrid_name');
    }
    if (description === undefined) {
        errors.push('缺少 description');
    }
    if (is_public === undefined) {
        errors.push('缺少 is_public');
    }
    if (typeof is_public !== 'boolean') {
        errors.push('is_public 必须是布尔值');
    }
    return errors;
}

function checkDeletedUserExists(callback) {
    const query = `SELECT * FROM users WHERE uuid = 'deleted_user'`;
    pool.query(query, (err, results) => {
        if (err) {
            return callback(err);
        }
        callback(null, results.length > 0);
    });
}

function updateHexgrid({ hexgrid_id, ownerId, hexgrid_name, description, is_public }, res) {
    pool.getConnection((err, connection) => {
        if (err) {
            console.error('获取数据库连接时出错：', err);
            return res.status(500).json({ message: '数据库连接失败' });
        }

        connection.beginTransaction((err) => {
            if (err) {
                console.error('开启事务时出错：', err);
                connection.release();
                return res.status(500).json({ message: '开启事务失败' });
            }

            let updateHexgridQuery = `
                UPDATE hexgrid 
                SET 
                    hexgrid_name = ?, 
                    description = ?, 
                    is_public = ?, 
                    lastedit_at = NOW()
            `;
            const updateHexgridParams = [hexgrid_name, description, is_public];

            if (ownerId === 0) {
                updateHexgridQuery += ', owner_id = "deleted_user"';
            } else if (ownerId !== undefined) {
                updateHexgridQuery += ', owner_id = ?';
                updateHexgridParams.push(ownerId);
            }

            updateHexgridQuery += ' WHERE hexGrid_id = ?';
            updateHexgridParams.push(hexgrid_id);

            connection.query(updateHexgridQuery, updateHexgridParams, (err, result) => {
                if (err) {
                    console.error('更新 HexGrid 数据时出错：', err);
                    return connection.rollback(() => {
                        connection.release();
                        res.status(500).json({ message: '更新规划图时出错' });
                    });
                }

                if (result.affectedRows === 0) {
                    console.error('未找到要更新的规划图');
                    return connection.rollback(() => {
                        connection.release();
                        res.status(404).json({ message: '未找到要更新的规划图' });
                    });
                }

                connection.commit((err) => {
                    if (err) {
                        console.error('提交事务时出错：', err);
                        return connection.rollback(() => {
                            connection.release();
                            res.status(500).json({ message: '提交事务失败' });
                        });
                    }

                    console.log('规划图更新成功');
                    connection.release();
                    return res.status(200).json({ message: '规划图更新成功' });
                });
            });
        });
    });
}



// 保存画布
app.post('/api/save-hexgrid', (req, res) => {
    const { ownerId, hexSize, maxRadius, hexgrid_name, description, is_public } = req.body;

    const timestamp = new Date().toISOString();
    console.log('开始保存新画布，时间:', timestamp);
    console.log('收到的请求体内容:', req.body);

    // 参数校验
    const errors = [];
    if (!ownerId) {
        errors.push('缺少 ownerId');
    }
    if (!hexgrid_name) {
        errors.push('缺少 hexgrid_name');
    }
    if (!hexSize) {
        errors.push('缺少 hexSize');
    } else if (typeof hexSize !== 'number') {
        errors.push('hexSize 必须是数字');
    }
    if (!maxRadius) {
        errors.push('缺少 maxRadius');
    } else if (typeof maxRadius !== 'number') {
        errors.push('maxRadius 必须是数字');
    }
    if (is_public === undefined) {
        errors.push('缺少 is_public');
    } else if (typeof is_public !== 'boolean') {
        errors.push('is_public 必须是布尔值');
    }

    // 如果有任何错误，返回 400 状态码并记录具体的错误信息
    if (errors.length > 0) {
        console.error('参数校验失败:', errors);
        return res.status(400).json({ message: `请求体参数有误: ${errors.join(', ')}` });
    }

    // 打印参数值以确认它们的具体格式和内容
    console.log('参数校验通过，传入的参数:');
    console.log('ownerId:', ownerId);
    console.log('hexSize:', hexSize);
    console.log('maxRadius:', maxRadius);
    console.log('hexgrid_name:', hexgrid_name);
    console.log('description:', description);
    console.log('is_public:', is_public);

    const createdAt = new Date();
    const lasteditAt = createdAt;

    // 生成 hexGridId
    const hexgrid_id = uuidv4();

    const insertQuery = `
        INSERT INTO hexgrid
        (hexGrid_id, owner_id, hexSize, maxRadius, hexgrid_name, description, created_at, lastedit_at, is_public) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const insertParams = [hexgrid_id, ownerId, hexSize, maxRadius, hexgrid_name, description, createdAt, lasteditAt, is_public];

    // 打印 SQL 查询和参数用于调试
    console.log('即将执行的 SQL 查询:', insertQuery);
    console.log('使用的参数:', insertParams);

    pool.query(insertQuery, insertParams, (err, result) => {
        if (err) {
            console.error('保存 HexGrid 数据时出错：', err);
            console.log('执行的 SQL 查询:', insertQuery);
            console.log('使用的参数:', insertParams);
            return res.status(500).json({ message: '保存 HexGrid 数据时出错' });
        }
        return res.status(201).json({ message: 'HexGrid 保存成功', hexgrid_id: hexgrid_id });
    });
});

// 保存格子信息
app.post('/api/save-hex', (req, res) => {
    const { hexgrid_id, q, r, s, brush, region, type } = req.body;

    // 调试日志 - 打印接收到的字段
    // console.log('Received Data:', { hexgrid_id, q, r, s, brush, region, type });

    // 参数校验
    if (!hexgrid_id || q === undefined || r === undefined || s === undefined || !brush) {
        // 打印缺少的字段，帮助排查问题
        console.log('检查字段 - hexgrid_id:', hexgrid_id);
        console.log('检查字段 - q:', q);
        console.log('检查字段 - r:', r);
        console.log('检查字段 - s:', s);
        console.log('检查字段 - brush:', brush);

        return res.status(400).json({ message: `缺少必要的字段 - 存在? ${hexgrid_id ? '是' : '否'}` });
    }

    pool.query(
        `INSERT INTO hexes 
        (hexgrid_id, q, r, s, brush, region, type) 
        VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [hexgrid_id, q, r, s, brush, region, type],
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
            return res.status(500).json({ message: '获取私有 规划图时出错' });
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
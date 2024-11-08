const connection = require('../db/db');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

const SALT_ROUNDS = 10;

/**
 * 查询用户是否存在
 */
function findUser(username, callback) {
    connection.query(
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

/**
 * 更新用户的最后登录时间
 */
function updateLastLogin(userId, callback) {
    const lastLogin = new Date();
    connection.query(
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

        connection.query(
            'INSERT INTO users (uuid, username, password, created_at, last_login) VALUES (?, ?, ?, ?, ?)',
            [uuid, username, hashedPassword, createdAt, createdAt],
            (err, result) => {
                if (err) return callback(err);
                callback(null, { userId: result.insertId, uuid });
            }
        );
    });
}

module.exports = {
    findUser,
    verifyPassword,
    updateLastLogin,
    createUser
};

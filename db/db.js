// db.js
const mysql = require('mysql');
require('dotenv').config();

// 创建连接池
const pool = mysql.createPool({
    connectionLimit: 10,  // 最大连接数
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
});

// 导出连接池
module.exports = pool;

// function handleDisconnect() {
//     connection = mysql.createConnection({
//         host: process.env.DB_HOST,
//         user: process.env.DB_USER,
//         password: process.env.DB_PASS,
//         database: process.env.DB_NAME,
//         port: process.env.DB_PORT
//     });

//     connection.connect((err) => {
//         if (err) {
//             console.error('Error connecting to MySQL database:', err);
//             setTimeout(handleDisconnect, 2000); // 2秒后尝试重新连接
//         } else {
//             console.log('Connected to the MySQL database');
//         }
//     });

//     // 监听错误事件
//     connection.on('error', (err) => {
//         console.error('Database error:', err);
//         // 如果是连接断开，则重新连接
//         if (err.code === 'PROTOCOL_CONNECTION_LOST') {
//             console.log('MySQL connection lost. Attempting to reconnect...');
//             handleDisconnect();
//         } else {
//             throw err; // 非连接断开错误，抛出异常
//         }
//     });
// }

// // 初始化数据库连接
// handleDisconnect();

// module.exports = connection;


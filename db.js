const mysql = require('mysql'); 
require('dotenv').config();  // 使用 dotenv 读取配置文件中的数据库信息

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err);
    return;
  }
  console.log('Connected to MySQL database successfully!');
});

module.exports = connection;
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');  // 引入 cors 库
const connection = require('./db');
const { v4: uuidv4 } = require('uuid');
//允许跨域cors支持
const app = express();
app.use(cors());  // 使用 CORS 中间件
app.use(bodyParser.json());


app.post('/api/login', (req, res) => {
  const { username, password, phone } = req.body;

  if (!username || !password || !phone) {
      return res.status(400).json({ message: '请填写所有字段。' });
  }

  // 查询用户是否存在
  connection.query(
      'SELECT * FROM users WHERE username = ? AND phone_number = ?',
      [username, phone],
      (err, results) => {
          if (err) {
              console.error('Database query error:', err);
              return res.status(500).json({ message: '数据库查询出错' });
          }

          if (results.length > 0) {
              // 登录成功，返回用户ID和UUID
              const userId = results[0].id;
              const uuid = results[0].uuid;
              return res.status(200).json({ message: '登录成功！', userId, uuid });
          } else {
              // 创建新用户
              const createdAt = new Date();
              const uuid = uuidv4(); // 使用 UUID 生成新的 UUID

              connection.query(
                  'INSERT INTO users (username, phone_number, password, created_at, uuid) VALUES (?, ?, ?, ?, ?)',
                  [username, phone, password, createdAt, uuid],
                  (err, result) => {
                      if (err) {
                          console.error('Error creating user:', err);
                          return res.status(500).json({ message: '创建用户时出错' });
                      }
                      const newUserId = result.insertId; // 获取新用户的ID
                      return res.status(201).json({ message: '用户创建成功！', userId: newUserId, uuid: uuid });
                  }
              );
          }
      }
  );
});

//更新画布描述
app.put('/api/update-hexgrid', (req, res) => {
  const { ownerId, canvasName, description, isPublic, coverImage } = req.body;

  if (!ownerId) {
      return res.status(400).json({ message: '缺少 ownerId' });
  }

  connection.query(
      'UPDATE hexGrid SET canvas_name = ?, description = ?, is_public = ?, cover_image = ?, lastedit_at = NOW() WHERE owner_id = ?',
      [canvasName, description, isPublic, coverImage, ownerId],
      (err, result) => {
          if (err) {
              console.error('更新 HexGrid 数据时出错：', err);
              return res.status(500).json({ message: '更新 HexGrid 数据时出错' });
          }

          if (result.affectedRows === 0) {
              return res.status(404).json({ message: '未找到要更新的 HexGrid' });
          }

          return res.status(200).json({ message: 'HexGrid 更新成功' });
      }
  );
});

//保存画布
app.post('/api/save-hexgrid', (req, res) => {
  const { ownerId, hexSize, maxRadius, canvasName, description, isPublic, coverImage } = req.body;

  const createdAt = new Date();
  const lasteditAt = createdAt;

  connection.query(
      'INSERT INTO hexGrid (owner_id, hexSize, maxRadius, canvas_name, description, created_at, is_public, cover_image, lastedit_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [ownerId, hexSize, maxRadius, canvasName, description, createdAt, isPublic, coverImage, lasteditAt],
      (err, result) => {
          if (err) {
              console.error('保存 HexGrid 数据时出错：', err);
              return res.status(500).json({ message: '保存 HexGrid 数据时出错' });
          }
          const hexGridId = result.insertId; // 获取新插入的 hexGrid ID
          return res.status(201).json({ message: 'HexGrid 保存成功', hexGridId });
      }
  );
});

//保存格子
app.post('/api/save-hex', (req, res) => {
  const { hexgridId, q, r, s, brush, region, type } = req.body;

  connection.query(
      'INSERT INTO hexes (hexgrid_id, q, r, s, brush, region, type) VALUES (?, ?, ?, ?, ?, ?, ?)',
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

// 启动服务器
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

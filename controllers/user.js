class User {
    constructor(userId, uuid, username, password, createdAt = new Date(), last_login = new Date()) {
        this.userId = userId;            // 用户的唯一标识符 (数据库的自增 ID)
        this.uuid = uuid;                // 用户的 UUID
        this.username = username;        // 用户名
        this.password = password;        // 用户的密码（通常是经过哈希处理的）
        this.createdAt = new Date(createdAt);  // 创建时间
        this.last_login = new Date(last_login);  // 更新时间
        this.can_login = true;
    }

    // 更新用户信息
    updateInfo(username) {
        if (username) this.username = username;
    }

    // 更新用户密码
    updatePassword(newPassword, callback) {
        bcrypt.hash(newPassword, SALT_ROUNDS, (err, hashedPassword) => {
            if (err) return callback(err);
            this.password = hashedPassword;
            callback(null, hashedPassword);
        });
    }

    // 将用户信息序列化为可以存储到数据库的对象
    serialize() {
        return {
            id: this.userId,
            uuid: this.uuid,
            username: this.username,
            password: this.password, // 避免直接存储明文密码
            created_at: this.createdAt.toISOString(),
            last_login: this.last_login.toISOString(),
            can_login: this.can_login,
        };
    }

    // 静态方法，用于从数据库记录创建 User 实例
    static fromDatabaseRecord(record) {
        return new User(
            record.id,
            record.uuid,
            record.username,
            record.password,
            record.created_at,
            record.last_login,
            record.can_login 
        );
    }
}

class UserManager {
    constructor() {
        this.users = []; // 存储用户对象
        this.mockUsers = [
            { username: 'testuser' }
        ];
    }

    login(username, password) {
        // 验证输入
        if (!this.validateInputs(username, password)) return;
    
        // 发送登录请求到服务器
        fetch('http://127.0.0.1:3000/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password})
        })

        .then(response => response.text()) // 获取服务器的响应文本
        .then(text => {
            console.log('手动解析服务器响应:', text); // 打印服务器响应到控制台
            const data = JSON.parse(text); // 手动解析 JSON

            const message = data.message;
            const userId = data.userId;
            const uuid = data.uuid;
    
            this.displayMessage(message);
            if (message === '登录成功！' || message === '用户创建成功！') {
                // 存储登录信息
                localStorage.setItem('isLoggedIn', 'true');
                localStorage.setItem('username', username);
                localStorage.setItem('userId', userId);
                localStorage.setItem('uuid', uuid);
                this.setUserLogin();
                //用户登陆后按钮变化 // 更新消息并开始倒计时
                this.displayMessage('');

                let n = 3; 
                const countdownInterval = setInterval(() => {
                    this.displayMessage(`${message} ${n}秒后关闭...`);
                    n--;
    
                    // 当倒计时结束时，执行 loginToggle 并清除定时器
                    if (n < 0) {
                        clearInterval(countdownInterval);
                        loginToggle(); // 执行 loginToggle()
                        this.clearInputs();
                    }
                }, 1000); // 每秒更新
            }
        })
        .catch(error => {
            console.error('Error:', error);
            this.displayMessage('服务器请求失败，请稍后再试。');
        });
    }

    // 退出登录
    logout() {
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('username');
        localStorage.removeItem('userId');
        localStorage.removeItem('uuid');
        localStorage.removeItem('hexGridId');
        this.displayMessage('已成功退出登录。');
        this.displayMessage('')
        this.setUserLogin();
    }

    cancel() {
        // 清空输入框
        this.clearInputs();
        loginToggle();
    }

    setUserLogin() {
        const isLoggedIn = localStorage.getItem('isLoggedIn');
        const username = localStorage.getItem('username'); // 获取存储的用户名
        const loginButton = document.getElementById('loginButton');
        const infoButton = document.getElementById('infoButton');
        const privateHexGrids = document.getElementById('privateHexGrids');
        //TODO:  修改按钮的文本和图标
        const loginedName = document.getElementById('loginedName');
        // const loginedIcon = document.getElementById('loginedIcon');

        if (isLoggedIn) {
            loginButton.style.display = "none";
            infoButton.style.display = "flex"
            privateHexGrids.style.display = "flex"
            loginedName.textContent = username; // 修改文字
            // loginedIcon.src = '/images/个人信息图标.png'; // 修改图标路径

        } else {
            loginButton.style.display = "flex";
            infoButton.style.display = "none"
            privateHexGrids.style.display = "none"  
            loginedName.textContent = '登录'; // 修改文字
            // loginedIcon.src = '/images/个人信息图标.png'; // 修改图标路径

        }
    }

    validateInputs(username, password) {
        if (!username || !password ) {
            this.displayMessage('请填写所有字段。');
            return false;
        }
        if (username.length > 16) {
            this.displayMessage('用户名不得超过16位。');
            return false;
        }
        if (password.length > 16) {
            this.displayMessage('密码不得超过16位。');
            return false;
        }
        return true;
    }

    checkUserInDatabase(username) {
        return this.mockUsers.some(user => user.username === username);
    }

    createUser(username, password) {
        console.log('Creating user:', { username, password });
        const userId = this.users.length + 1; // 示例：生成用户ID
        const newUser = new User(userId, username, password);
        this.users.push(newUser);
        // 这里应与数据库交互
        this.mockUsers.push({ username });
    }

    displayMessage(message) {
        document.getElementById('message').innerText = message;
    }

    clearInputs() {
        document.getElementById('username').value = '';
        document.getElementById('password').value = '';
        this.displayMessage('');
    }
}

// 实例化用户管理对象
const userManager = new UserManager();

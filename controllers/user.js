import { userinfoView } from "../Component/userinfoView.js";
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
        this.apiUrl = 'http://127.0.0.1:3000/api';
    }

    login(username, password) {
        // 验证输入
        if (!this.validateInputs(username, password)) return;
    
        // 发送登录请求到服务器
        fetch(`${this.apiUrl}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password})
        })

        .then(response => {
            if (!response.ok) {
                throw new Error('网络连接失败');
            }
            return response.json();  // 解析 JSON 格式的响应
        })
        .then(data => {
            this.handleLoginResponse(data, username);
        })
        .catch(error => {
            console.error('Error:', error);
            this.displayMessage('服务器请求失败，请稍后再试。');
        });
    }

    // 处理登录响应
    handleLoginResponse(data, username) {
        const { message, userId, uuid } = data;
    
        if (!message) {
            this.displayMessage('服务器返回的信息不完整，请稍后再试。');
            return;
        }
    
        this.displayMessage(message);
        if (message === '登录成功！' || message === '用户创建成功！') {
            // 存储登录信息
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('username', username);
            if (userId) localStorage.setItem('userId', userId);
            if (uuid) localStorage.setItem('uuid', uuid);
            
            this.setUserLogin();
                        
            // 登录成功后清空输入框并刷新视图
            this.displayMessage('欢迎登录!');
            userinfoView.updateInfoArea();
            setTimeout(() => {
                this.clearInputs();
            }, 500);
            setTimeout(() => {
                this.clearInputs();
                this.displayMessage('');
                // 在 2 秒后隐藏登录视图
                const loginModel = document.getElementById('login-model');
                if (loginModel) {
                    loginModel.style.display = 'none';
                }
            }, 2000); // 2 秒延迟
        }
    }


    // 验证原密码
    verifyOriginalPassword(userId, inputPassword, successCallback, errorCallback) {
        fetch(`${this.apiUrl}/verify-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ userId, password: inputPassword })
        })
        .then(response => response.json())
        .then(data => {
            if (data.message === '原密码验证成功') {
                successCallback(true);
            } else {
                errorCallback(data.message || '原密码验证失败');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            errorCallback('服务器请求失败，请稍后再试。');
        });
    }
    // 修改密码
    changePassword(userId, newPassword, successCallback, errorCallback) {
        fetch(`${this.apiUrl}/change-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ userId, newPassword })
        })
        .then(response => response.json())
        .then(data => {
            if (data.message === '密码修改成功') {
                console.log('密码修改成功了');
                successCallback(); // 注意，这里直接调用成功回调，不再传递 `data.message`
            } else {
                errorCallback(data.message || '修改密码失败');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            errorCallback('服务器请求失败，请稍后再试。');
        });
    }
    // 修改用户名
    changeUsername(uuid, newUsername, successCallback, errorCallback) {
        fetch(`${this.apiUrl}/change-username`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ uuid, newUsername })
        })
        .then(response => response.json())
        .then(data => {
            if (data.message === '用户名修改成功') {
                console.log('用户名修改成功');
                successCallback();
            } else {
                errorCallback(data.message || '修改用户名失败');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            errorCallback('服务器请求失败，请稍后再试。');
        });
    }

    // 退出登录
    logout(all) {
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('username');
        localStorage.removeItem('userId');
        localStorage.removeItem('uuid');
        localStorage.removeItem('hexGridId');
        if(!all){
            this.displayMessage('已成功退出登录。');
        }
        // this.displayMessage('')
        this.setUserLogin();
        this.users = [];
    }

    cancel() {
        // 清空输入框
        this.clearInputs();
        loginToggle();
    }

    setUserLogin() {
        const isLoggedIn = localStorage.getItem('isLoggedIn');
        const username = localStorage.getItem('username');

        const infoButton = document.getElementById('infoButton');
        const spanElement = infoButton.querySelector('span');

        if (isLoggedIn) {
            document.getElementById('loginButton').style.display = 'none';
            document.getElementById('infoButton').style.display = 'flex';
            spanElement.textContent = username;
            document.getElementById('PrivateHexGridsButton').style.display = 'flex';
        } else {
            document.getElementById('loginButton').style.display = 'flex';
            document.getElementById('infoButton').style.display = 'none';
            document.getElementById('PrivateHexGridsButton').style.display = 'none';

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
        document.getElementById('login-message').innerText = message;
    }

    clearInputs() {
        document.getElementById('usernameInput').value = '';
        document.getElementById('passwordInput').value = '';
        this.displayMessage('');
    }

}

// 实例化用户管理对象
export const userManager = new UserManager();

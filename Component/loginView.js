import { userManager } from "../controllers/user.js";
import { loadingSpinner } from "../index.js";

class UserLoginView {
    constructor() {
        this.logined = this.getLoginStatu();
    }

    getLoginStatu() {
        return !!localStorage.getItem('username');
    }

    //给主页使用的
    toggleVisibility() {
        const loginModel = document.getElementById('login-model');
        // 如果本地存储中存在 'username'，隐藏登录视图；否则显示
        if (this.getLoginStatu()) {
            if (loginModel) {
                loginModel.style.display = 'none';
            }
            userManager.setUserLogin();
        } else {
            if (loginModel) {
                loginModel.style.display = 'flex';
            } else {
                this.init(); // 如果视图还没初始化，初始化并显示
            }
        }
    }

    //给按钮使用的
    showToggle() {
        let loginModel = document.getElementById('login-model');
        
        // 如果登录视图不存在则初始化
        if (!loginModel) {
            this.init();
            loginModel = document.getElementById('login-model');
        }
    
        // 切换显示状态
        loginModel.style.display = loginModel.style.display === 'none' ? 'flex' : 'none';
    }

    init() {
        const loginModel = document.createElement('div');
        loginModel.classList.add('popup');
        loginModel.classList.add('login-model');
        loginModel.id = 'login-model';


        const loginTitle = document.createElement('h1');
        loginTitle.classList.add('loginTitle');
        loginTitle.textContent = '欢迎 请登录';


        const usernameInputArea = this.createLoginInput();


        const passwordContainer = this.createPasswordContainer();
        

        const buttonArea = this.createButtonArea();

        const message = document.createElement('p');
        message.textContent = "登录后可以存储你的规划作品";
        message.classList.add('login-message');
        message.id = ('login-message');

        loginModel.append(loginTitle, usernameInputArea, passwordContainer, message, buttonArea );
        document.body.appendChild(loginModel);  // 最终将登录模型添加到页面中        
    }

    createButtonArea() {
        const buttonArea = document.createElement('div');
        buttonArea.classList.add('login-button-area');

        const loginButton = document.createElement('button');
        loginButton.textContent = '确认登录';
        loginButton.addEventListener('click', () => this.handleLogin());

        const editButton = document.createElement('button');
        editButton.textContent = '编辑信息';
        editButton.addEventListener('click', () => this.handleEdit());

        const cancelButton = document.createElement('button');
        cancelButton.textContent = '取消登录';
        cancelButton.addEventListener('click', () => this.handleCancel());

        // 根据登录状态添加相应的按钮
        if (!this.isLoggedIn) {
            buttonArea.append(loginButton, cancelButton);
        } else {
            buttonArea.append(loginButton, editButton, cancelButton);
        }

        return buttonArea;
    }

    createLoginInput() {
        const usernameInputArea = document.createElement('input');
        usernameInputArea.placeholder = '输入用户名';
        usernameInputArea.type = 'text';
        usernameInputArea.maxLength = '16';
        usernameInputArea.minLength = '6';
        usernameInputArea.required = true;
        usernameInputArea.id = 'usernameInput';
        usernameInputArea.title = '输入你的名称 (6-16 字符)';
        return usernameInputArea;
    }

    createPasswordContainer() {
        const passwordInputArea = document.createElement('input');
        passwordInputArea.placeholder = '输入密码';
        passwordInputArea.type = 'password';
        passwordInputArea.maxLength = '20';
        passwordInputArea.minLength = '8';
        passwordInputArea.required = true;
        passwordInputArea.pattern = '(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])[a-zA-Z0-9!@#$%^&*]{8,20}';
        passwordInputArea.id = 'passwordInput';
        passwordInputArea.title = '输入密码 (6-16 字符)';

        passwordInputArea.addEventListener('blur', () => this.validatePassword());

        const passwordContainer = document.createElement('div');
        passwordContainer.classList.add('password-container')

        const togglePassButton = document.createElement('button');
        togglePassButton.id = 'togglePassButton';

        const toggleIcon = document.createElement('img');
        toggleIcon.src = '/images/showpass-close.png';
        toggleIcon.alt = '显示密码';
        toggleIcon.id = 'toggleIcon';

        togglePassButton.addEventListener('click', function() {
            if (passwordInputArea.type === 'password') {
                passwordInputArea.type = 'text';  // 显示密码
                toggleIcon.src = '/images/showpass.png';  // 切换图标为隐藏密码
            } else {
                passwordInputArea.type = 'password';  // 隐藏密码
                toggleIcon.src = '/images/showpass-close.png';  // 切换图标为显示密码
            }
        });

        togglePassButton.append(toggleIcon);

        passwordContainer.append(passwordInputArea,togglePassButton);
        return passwordContainer;
    }
    //密码验证
    validatePassword() {
        const passwordInputArea = document.getElementById('passwordInput');
        const pattern = new RegExp(passwordInputArea.pattern);
        if (!pattern.test(passwordInputArea.value)) {
            const message = '密码必须包含8-20个字符，至少一个大写字母、一个小写字母、一个数字。';
            this.displayMessage(message);
            return false;
        } else {
            this.displayMessage('');
            return true;
        }
    }
    // 登录按钮点击事件
    async handleLogin() {
        if (!this.validatePassword()) {
            return; // 如果密码格式不正确，则不进行登录操作
        }
        
        loadingSpinner.show();
    
        const username = document.getElementById('usernameInput').value;
        const password = document.getElementById('passwordInput').value;
    
        try {
            // 等待 login 方法完成
            await userManager.login(username, password);
        } catch (error) {
            console.error("登录失败:", error);
            this.displayMessage("登录失败，请重试");
        } finally {
            loadingSpinner.hide();
        }
    }

    // 编辑信息按钮点击事件
    handleEdit() {
        alert('编辑信息功能还未实现');
    }

    // 取消按钮点击事件
    handleCancel() {
        localStorage.removeItem('username');  // 确保本次存储空了
        this.logined = false;
        const loginModel = document.getElementById('login-model');
        loginModel.style.display = 'none';  // 取消登录后隐藏登录视图
    }

    // 刷新视图
    refreshView() {
        document.body.innerHTML = '';  // 清空页面内容
        this.init();  // 重新初始化视图
    }

    displayMessage(message) {
        document.getElementById('login-message').innerText = message;
    }

}

export const userLoginView = new UserLoginView();

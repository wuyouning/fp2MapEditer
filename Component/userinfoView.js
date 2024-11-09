import { userManager } from "../controllers/user.js";
import { LoadingSpinner } from "./loadingSpinner.js";

class UserinfoView {
    constructor() {
        // this.userManager = userManager;
        this.name = '';
        this.id = '';
        this.uuid = '';
    }
    
    get slider() {
        let slider = document.getElementById('loginCard');
        return slider;
    }

    get infoCard() {
        let infoCard = document.getElementById('infoCard');
        return infoCard;
    }
    init(){
        this.name = localStorage.getItem('username');
        this.id = localStorage.getItem('userId');
        this.uuid = localStorage.getItem('uuid');

        const infoCard = document.getElementById('infoCard');
        const infoArea = this.createInfoArea();
        const buttonArea = this.createButtonArea();

        infoCard.append(infoArea, buttonArea);
    }

    createInfoArea() {
        const infoArea = document.createElement('div');
        infoArea.classList.add('infoCard-infoArea');
        infoArea.id = 'infocard-userinfo';
        const userName = document.createElement('h1');
        userName.textContent = this.name;

        const userId = document.createElement('p'); 
        userId.textContent = `ID：${this.id}`;

        infoArea.append(userName, userId);
        return infoArea;
    }

    updateInfoArea() {
        // 更新用户信息区域
        this.name = localStorage.getItem('username');
        this.id = localStorage.getItem('userId');

        const infoCard = document.getElementById('infoCard');
        const oldInfoArea = document.getElementById('infocard-userinfo');

        if (infoCard && oldInfoArea) {
            // 删除旧的用户信息区域
            infoCard.removeChild(oldInfoArea);

            // 创建并添加新的用户信息区域
            const newInfoArea = this.createInfoArea();
            infoCard.prepend(newInfoArea);
        }
    }

    createButtonArea() {
        const buttonArea = document.createElement('div');
        buttonArea.classList.add('infoCard-button-area')

        const editNameBtn = document.createElement('button');
        editNameBtn.classList.add('infoCard-button');
        editNameBtn.addEventListener('click', () => {
            this.openEditPage();
            this.editNameView();
        })

        const editPassBtn = document.createElement('button');
        editPassBtn.classList.add('infoCard-button');
        editPassBtn.addEventListener('click', () => {
            this.openEditPage();
            this.editPassView();
        })

        const logOutBtn = document.createElement('button');
        logOutBtn.classList.add('infoCard-button');
        logOutBtn.addEventListener('click', () => {
            this.openEditPage();
            this.logOutView();
        })

        editNameBtn.textContent = '修改用户名';
        editPassBtn.textContent = '修改密码';
        logOutBtn.textContent = '退出登录';

        buttonArea.append(editNameBtn, editPassBtn, logOutBtn);
        return buttonArea;
    }

    openEditPage() {
        const slider = document.getElementById('loginCard');
        slider.innerHTML = '';
        const closeEditBtn = this.closEditPageBtn();
        slider.append(closeEditBtn);
        slider.classList.add('open');
    }

    closEditPageBtn() {
        const slider = document.getElementById('loginCard');
        const closEditPageBtn = document.createElement('button');
        closEditPageBtn.id = 'closeEditBtn-userinfo';
        closEditPageBtn.classList.add('closeEditBtn-userinfo');
        closEditPageBtn.textContent = '<';
        closEditPageBtn.addEventListener('click', () => slider.classList.remove('open'));
        return closEditPageBtn;
    }
    
    editName() {

    }

    editNameView() {
        const slider = document.getElementById('loginCard')
        const container = document.createElement('div');
        const title = document.createElement('h1');
        title.textContent = '修改账号名称';
        const userName = document.createElement('div');
        userName.textContent = this.name;
        userName.classList.add('username-status');
        const text = document.createElement('h2');
        text.textContent = '请输入你要修改的新名字';
        const inputName = document.createElement('input');
        inputName.placeholder = '输入用户名';
        inputName.type = 'text';
        inputName.maxLength = '16';
        inputName.minLength = '2';
        inputName.required = true;
        inputName.id = 'usernameInput';
        inputName.title = '输入你的名称 (6-16 字符)';
    
        const buttonArea = document.createElement('div');
        buttonArea.classList.add('editPage-buttonArea');
    
        const confirmBtn = document.createElement('button');
        confirmBtn.textContent = "确认";
        confirmBtn.addEventListener('click', () => {
            const newUsername = inputName.value.trim();
            if (!newUsername) {
                alert('用户名不能为空');
                return;
            }
            if (newUsername.length < 2 || newUsername.length > 16) {
                alert('用户名长度必须在 6 到 16 个字符之间');
                return;
            }
    
            // 获取当前用户的 UUID
            const uuid = localStorage.getItem('uuid');
    
            // 调用 UserManager 的 changeUsername 方法
            userManager.changeUsername(uuid, newUsername, 
                () => {
                    // 修改成功后更新本地存储的用户名
                    localStorage.setItem('username', newUsername);
                    this.name = newUsername;
    
                    // 更新用户信息区域
                    this.updateInfoArea();
    
                    // 隐藏编辑页面
                    slider.classList.remove('open');
                    console.log('用户名修改成功');
                },
                (errorMessage) => {
                    // 修改失败
                    console.error('修改用户名失败:', errorMessage);
                    alert(errorMessage);
                }
            );
        });
    
        const cancelBtn = document.createElement('button');
        cancelBtn.textContent = "取消";
        cancelBtn.addEventListener('click', () => slider.classList.remove('open'));
    
        buttonArea.append(confirmBtn, cancelBtn);
    
        container.append(title, userName, text, inputName, buttonArea);
        slider.append(container);
    }


    editPassView() {
        const slider = document.getElementById('loginCard')
        const container = document.createElement('div');
        const title = document.createElement('h1');
        title.textContent = '修改密码';
    
        const text = document.createElement('h2');
        text.textContent = '原账户密码';
        const inputOldpass = document.createElement('input');
        inputOldpass.type = 'password'; // 设置输入框类型为密码
    
        const text1 = document.createElement('h2');
        text1.textContent = '输入新密码';
        const inputNewpass = document.createElement('input');
        inputNewpass.type = 'text'; // 设置输入框类型为密码
        inputNewpass.maxLength = 20;
        inputNewpass.minLength = 8;
        inputNewpass.required = true;
        inputNewpass.pattern = '(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])[a-zA-Z0-9!@#$%^&*]{8,20}';
        inputNewpass.title = '输入新密码 (8-20 字符，必须包含大小写字母和数字)';
        inputNewpass.addEventListener('blur', () => {
            this.validateNewPassword(errorMessageContainer, inputNewpass);
            inputNewpass.type = 'password'
        });
        inputNewpass.addEventListener('focus', () => {
            inputNewpass.type = 'text';  // 点击时，显示密码
        });
    
        const text2 = document.createElement('h2');
        text2.textContent = '再次确认输入';
        const inputNewpass2 = document.createElement('input');
        inputNewpass2.type = 'text'; // 设置输入框类型为密码
        inputNewpass2.maxLength = 20;
        inputNewpass2.minLength = 8;
        inputNewpass2.required = true;
        inputNewpass2.pattern = '(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])[a-zA-Z0-9!@#$%^&*]{8,20}';
        inputNewpass2.title = '再次确认输入 (8-20 字符，必须包含大小写字母和数字)';
    
        // 添加一个错误信息容器，用于显示提示
        const errorMessageContainer = document.createElement('div');
        errorMessageContainer.classList.add('error-message');
        
        // 监听 inputNewpass2 输入框的变化，实时校验输入是否匹配
        inputNewpass2.addEventListener('input', () => {
            this.validatePasswordMatch(inputNewpass, inputNewpass2, errorMessageContainer);
        });
        inputNewpass2.addEventListener('focus', () => {
            inputNewpass2.type = 'text';  // 点击时，显示密码
        });
        inputNewpass2.addEventListener('blur', () => {
            inputNewpass2.type = 'password';
        })
        

        // 创建加载指示器
        const loadingSpinner = document.createElement('div');
        loadingSpinner.classList.add('loading-spinner');
        loadingSpinner.style.display = 'none'; // 默认隐藏

        const buttonArea = document.createElement('div');
        buttonArea.classList.add('editPage-buttonArea');
        const confirmBtn = document.createElement('button');
        confirmBtn.textContent = "确认";

        confirmBtn.addEventListener('click', () => {
            // 获取当前用户 ID
            const userId = localStorage.getItem('userId');
            loadingSpinner.style.display = 'block';
            // 校验原密码是否正确
            userManager.verifyOriginalPassword(userId, inputOldpass.value, 
                () => {
                    // 验证新密码是否匹配
                    this.validatePasswordMatch(inputNewpass, inputNewpass2, errorMessageContainer);
                    if (errorMessageContainer.textContent) {
                        loadingSpinner.style.display = 'none';
                        return;
                    }
        
                    // 修改用户密码
                    userManager.changePassword(userId, inputNewpass.value, 
                        () => {
                            // 成功回调
                            console.log('密码修改成功');
                            errorMessageContainer.textContent = '密码修改成功';
                            setTimeout(() => {
                                slider.classList.remove('open');
                                loadingSpinner.style.display = 'none';
                            }, 2000);
                        },
                        (errorMessage) => {
                            // 失败回调
                            console.error('修改密码失败:', errorMessage);
                            errorMessageContainer.textContent = errorMessage;
                            loadingSpinner.style.display = 'none';
                        }
                    );
                }, 
                (error) => {
                    console.error('原密码验证失败:', error);
                    errorMessageContainer.textContent = error;
                    loadingSpinner.style.display = 'none';
                }
            );
        });
    
        const cancelBtn = document.createElement('button');
        cancelBtn.textContent = "取消";
        cancelBtn.addEventListener('click', () => slider.classList.remove('open'));
        loadingSpinner.style.display = 'none';
        buttonArea.append(confirmBtn, cancelBtn);
    
        container.append(title, text, inputOldpass, text1, inputNewpass, text2, inputNewpass2, loadingSpinner, errorMessageContainer, buttonArea);
        slider.append(container);
    }
    

    validatePasswordMatch(inputNewpass, inputNewpass2, errorMessageContainer) {
        if (inputNewpass.value !== inputNewpass2.value) {
            // 如果输入不匹配，为输入框添加错误样式
            inputNewpass2.classList.add('input-error');
            // 在错误信息容器中显示提示信息
            errorMessageContainer.textContent = '两次输入的密码不一致，请重新输入';
        } else {
            // 移除错误样式
            inputNewpass2.classList.remove('input-error');
            // 清空错误提示信息
            errorMessageContainer.textContent = '';
        }
    }

    validateNewPassword(errorMessageContainer, inputNewpass) {
        const pattern = new RegExp(inputNewpass.pattern);
        if (!pattern.test(inputNewpass.value)) {
            const message = '新密码必须包含8-20个字符，至少一个大写字母、一个小写字母、一个数字。';
            // this.displayMessage(message);
            errorMessageContainer.textContent = message;
            return false;
        } else {
            errorMessageContainer.textContent = '';
            return true;
        }
    }

    logOut() {

    }

    logOutView() {
        const container = document.createElement('div');
        const title = document.createElement('h1');
        const slider = document.getElementById('loginCard');
        const infoCard = document.getElementById('infoCard');
        title.textContent = '确认退出？';

        const buttonArea = document.createElement('div');
        buttonArea.classList.add('editPage-buttonArea');
        const cofirmBtn = document.createElement('button');
        cofirmBtn.textContent = "确认";
        cofirmBtn.addEventListener('click', () => {
            slider.classList.remove('open');
            infoCard.classList.remove('open');
            userManager.logout(true);
            this.updateInfoArea();
        })

        const cancelBtn = document.createElement('button');
        cancelBtn.textContent = "取消";
        cancelBtn.addEventListener('click', () => slider.classList.remove('open'))
        buttonArea.append(cofirmBtn, cancelBtn);

        container.append(title, buttonArea);

        slider.append(container);
    }
}

export const userinfoView = new UserinfoView();
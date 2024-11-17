import { userManager } from "../controllers/user.js";
import { LoadingSpinner } from "./loadingSpinner.js";
import { MainStyledButton } from "./buttonComponent.js";
import { setTranslatedText } from "./i18next.js";

class UserinfoView {
    constructor() {
        this.name = '';
        this.id = '';
        this.uuid = '';
    }

    init() {
        this.name = localStorage.getItem('username');
        this.id = localStorage.getItem('userId');
        this.uuid = localStorage.getItem('uuid');

        const infoCard = document.getElementById('infoCard');
        const infoArea = this.createInfoArea();
        const buttonArea = this.createButtonArea();

        infoCard.append(infoArea, buttonArea);
    }

    createElementWithClass(tag, className) {
        const element = document.createElement(tag);
        if (className) element.classList.add(className);
        return element;
    }

    createButton(label, onClickHandler, className) {
        const button = new MainStyledButton(
            null,
            label,
            onClickHandler,
        )
        if (className) button.classList.add(className);
        return button;
    }

    createInfoArea() {
        const infoArea = this.createElementWithClass('div', 'infoCard-infoArea');
        infoArea.id = 'infocard-userinfo';

        const userName = this.createElementWithClass('h1');
        userName.textContent = this.name;

        const userId = this.createElementWithClass('p');
        userId.textContent = `ID：${this.id}`;

        infoArea.append(userName, userId);
        return infoArea;
    }

    createButtonArea() {
        const buttonArea = this.createElementWithClass('div', 'infoCard-button-area');

        const buttons = [
            { label: "修改用户名", onClickHandler: () => this.openEditPage(this.editNameView.bind(this)) },
            { label: "修改密码", onClickHandler: () => this.openEditPage(this.editPassView.bind(this)) },
            { label: "退出登录", onClickHandler: () => this.openEditPage(this.logOutView.bind(this)) },
        ];

        buttons.forEach(btnConfig => {
            const button = this.createButton(btnConfig.label, btnConfig.onClickHandler, "infoCard-button");
            buttonArea.append(button);
        });

        return buttonArea;
    }

    openEditPage(viewFunction) {
        const slider = document.getElementById('loginCard');
        slider.innerHTML = '';
        const closeEditBtn = this.createCloseEditPageBtn();
        slider.append(closeEditBtn);
        slider.classList.add('open');

        // 调用传入的视图方法
        viewFunction();
    }

    // createCloseEditPageBtn() {
    //     const slider = document.getElementById('loginCard');
    //     return this.createButton('<', () => slider.classList.remove('open'), 'closeEditBtn-userinfo');
    // }
    createCloseEditPageBtn() {
        const slider = document.getElementById('loginCard');
        const closEditPageBtn = document.createElement('button');
        closEditPageBtn.id = 'closeEditBtn-userinfo';
        closEditPageBtn.classList.add('closeEditBtn-userinfo');
        closEditPageBtn.textContent = '<';
        closEditPageBtn.addEventListener('click', () => slider.classList.remove('open'));
        return closEditPageBtn;
    }
    editNameView() {
        const slider = document.getElementById('loginCard');
        const container = this.createElementWithClass('div');
        const title = this.createElementWithClass('h1');
        // title.textContent = '修改账号名称';
        setTranslatedText(title, '修改账号名称',null,null)

        const userName = this.createElementWithClass('div', 'username-status');
        userName.textContent = this.name;
        
        const text = this.createElementWithClass('h2');
        // text.textContent = '请输入你要修改的新名字';
        setTranslatedText(text, '请输入你要修改的新名字',null,null)


        const inputName = this.createElementWithClass('input');
        inputName.placeholder = '输入用户名';
        inputName.type = 'text';
        inputName.maxLength = '16';
        inputName.minLength = '2';
        inputName.required = true;
        inputName.id = 'usernameInput';
        inputName.title = '输入你的名称 (2-16 字符)';
        inputName.placeholder = '输入用户名';
        setTranslatedText(inputName, '输入用户名', null, null, ['placeholder', 'title']);


        const buttonArea = this.createElementWithClass('div', 'editPage-buttonArea');
        const confirmBtn = this.createButton('确认', () => {
            const newUsername = inputName.value.trim();
            if (!newUsername) {
                alert('用户名不能为空');
                return;
            }
            if (newUsername.length < 2 || newUsername.length > 16) {
                alert('用户名长度必须在 2 到 16 个字符之间');
                return;
            }

            const uuid = localStorage.getItem('uuid');
            userManager.changeUsername(uuid, newUsername, 
                () => {
                    localStorage.setItem('username', newUsername);
                    this.name = newUsername;
                    this.updateInfoArea();
                    slider.classList.remove('open');
                    console.log('用户名修改成功');
                },
                (errorMessage) => {
                    console.error('修改用户名失败:', errorMessage);
                    alert(errorMessage);
                }
            );
        });
        const cancelBtn = this.createButton('取消', () => slider.classList.remove('open'));
        buttonArea.append(confirmBtn, cancelBtn);

        container.append(title, userName, text, inputName, buttonArea);
        slider.append(container);
    }

    editPassView() {
        const slider = document.getElementById('loginCard');
        const container = this.createElementWithClass('div');
        const title = this.createElementWithClass('h1');
        // title.textContent = '修改密码';
        setTranslatedText(title, '修改密码',null,null)


        const textOld = this.createElementWithClass('h2');
        // textOld.textContent = '原账户密码';
        setTranslatedText(textOld, '原账户密码',null,null)
        const inputOldpass = this.createElementWithClass('input');
        inputOldpass.type = 'password';

        const textNew = this.createElementWithClass('h2');
        // textNew.textContent = '输入新密码';
        setTranslatedText(textNew, '输入新密码',null,null)

        const inputNewpass = this.createElementWithClass('input');
        inputNewpass.type = 'password';
        inputNewpass.maxLength = 20;
        inputNewpass.minLength = 8;
        inputNewpass.required = true;
        inputNewpass.pattern = '(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])[a-zA-Z0-9!@#$%^&*]{8,20}';
        inputNewpass.title = '输入新密码 (8-20 字符，必须包含大小写字母和数字)';

        const textConfirm = this.createElementWithClass('h2');
        // textConfirm.textContent = '再次确认输入';
        setTranslatedText(textConfirm, '再次确认输入',null,null)

        const inputNewpass2 = this.createElementWithClass('input');
        inputNewpass2.type = 'password';
        inputNewpass2.maxLength = 20;
        inputNewpass2.minLength = 8;
        inputNewpass2.required = true;
        inputNewpass2.pattern = inputNewpass.pattern;
        inputNewpass2.title = inputNewpass.title;

        const errorMessageContainer = this.createElementWithClass('div', 'error-message');
        inputNewpass2.addEventListener('input', () => {
            this.validatePasswordMatch(inputNewpass, inputNewpass2, errorMessageContainer);
        });

        const buttonArea = this.createElementWithClass('div', 'editPage-buttonArea');
        const confirmBtn = this.createButton('确认', () => {
            const userId = localStorage.getItem('userId');
            userManager.verifyOriginalPassword(userId, inputOldpass.value,
                () => {
                    this.validatePasswordMatch(inputNewpass, inputNewpass2, errorMessageContainer);
                    if (errorMessageContainer.textContent) return;

                    userManager.changePassword(userId, inputNewpass.value, 
                        () => {
                            console.log('密码修改成功');
                            // errorMessageContainer.textContent = '密码修改成功';
                            setTranslatedText(errorMessageContainer, '密码修改成功',null,null)
                            setTimeout(() => slider.classList.remove('open'), 2000);
                        },
                        (errorMessage) => {
                            //日志记录
                            console.error('修改密码失败:', errorMessage);
                            // errorMessageContainer.textContent = errorMessage;
                            setTranslatedText(errorMessageContainer, errorMessage)
                        }
                    );
                },
                (error) => {
                    console.error('原密码验证失败:', error);
                    setTranslatedText(errorMessageContainer, '原密码验证失败',error,null)

                    // errorMessageContainer.textContent = error;
                }
            );
        });
        const cancelBtn = this.createButton('取消', () => slider.classList.remove('open'));
        buttonArea.append(confirmBtn, cancelBtn);

        container.append(title, textOld, inputOldpass, textNew, inputNewpass, textConfirm, inputNewpass2, errorMessageContainer, buttonArea);
        slider.append(container);
    }

    validatePasswordMatch(inputNewpass, inputNewpass2, errorMessageContainer) {
        if (inputNewpass.value !== inputNewpass2.value) {
            inputNewpass2.classList.add('input-error');
            // errorMessageContainer.textContent = '两次输入的密码不一致，请重新输入';
            setTranslatedText(errorMessageContainer, '两次输入的密码不一致，请重新输入',null,null)
        } else {
            inputNewpass2.classList.remove('input-error');
            errorMessageContainer.textContent = '';
        }
    }

    logOutView() {
        const slider = document.getElementById('loginCard');
        const container = this.createElementWithClass('div');
        const title = this.createElementWithClass('h1');
        // title.textContent = '确认退出？';
        setTranslatedText(title, '确认退出？')

        const buttonArea = this.createElementWithClass('div', 'editPage-buttonArea');
        const confirmBtn = this.createButton('确认', () => {
            slider.classList.remove('open');
            infoCard.classList.remove('open');
            userManager.logout(true);
            this.updateInfoArea();
        });
        const cancelBtn = this.createButton('取消', () => slider.classList.remove('open'));
        buttonArea.append(confirmBtn, cancelBtn);

        container.append(title, buttonArea);
        slider.append(container);
    }

    updateInfoArea() {
        this.name = localStorage.getItem('username');
        this.id = localStorage.getItem('userId');

        const infoCard = document.getElementById('infoCard');
        const oldInfoArea = document.getElementById('infocard-userinfo');

        if (infoCard && oldInfoArea) {
            infoCard.removeChild(oldInfoArea);
            const newInfoArea = this.createInfoArea();
            infoCard.prepend(newInfoArea);
        }
    }
}

export const userinfoView = new UserinfoView();
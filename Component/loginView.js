class userloginView {
    constructor() {
        this.logined = this.getLoginStatu();
    }

    getLoginStatu() {
        const username = localStorage.getItem('username');
        if (username) {
            return true;
        } else {
            return false;
        }
    }

    init() {

        const loginModel = document.createElement('div');

        const loginTitle = document.createElement('h1')
        const usernameInputArea = document.createElement('input');
        const passwordInputArea = document.createElement('input');

        const buttonArea = document.createElement('div');

        const loginButton = document.createElement('button');
        const editButton = document.createElement('button');
        const cancel = document.createElement('button');

        const message = document.createElement('p');

        if (!this.logined) {
            buttonArea.append(loginButton, cancel);
        } else {
            buttonArea.append(loginButton, editButton, cancel);
        }

        loginModel.append(loginTitle, usernameInputArea, passwordInputArea, buttonArea, message);
        

    }

    
}


function centerbutton(mainView) {
    const centerButton = document.getElementById('back-center-button');
    centerButton.classList.add('back-center-button');
    centerButton.innerText = '返回原点';

    centerButton.addEventListener('click', () => {
        console.log("回城按钮被按");
        mainView.scrollToCenter();
        centerButton.classList.remove('activated');
        console.log("回城完毕");

    });

}
export class LoadingSpinner {
    constructor() {
        // 创建加载指示器元素
        this.spinner = document.createElement('div');
        this.spinner.classList.add('loading-spinner');
        this.spinner.style.display = 'none'; // 默认隐藏
        this.spinner.style.zIndex = '999'
    }

    // 显示加载指示器
    show() {
        this.spinner.style.display = 'block';
    }

    // 隐藏加载指示器
    hide() {
        this.spinner.style.display = 'none';
    }

    getElement() {
        return this.spinner;
    }
}

export class Popup {
    constructor() {
        this.message = '';
        this.popup = document.createElement('div');
        this.popup.classList.add('popup');
        this.popup.classList.add('popup-window');
        this.popup.style.display = 'none';

        // 创建内容容器
        this.content = document.createElement('div');
        this.content.classList.add('popup-content');
        this.popup.appendChild(this.content);

        // 创建关闭按钮
        this.closeButton = document.createElement('button');
        this.closeButton.classList.add('popup-close-button');
        this.closeButton.textContent = '×';
        this.closeButton.addEventListener('click', () => this.close());
        this.popup.appendChild(this.closeButton);

        // 添加加载指示器
        this.loadingSpinner = new LoadingSpinner();
        this.content.appendChild(this.loadingSpinner.getElement());
        // 添加到文档主体
        document.body.appendChild(this.popup);
    }

    // 显示弹窗
    show(message, type = 'info', autoCloseTime = 0, btnText = '确认', confirmCallback = null) {
        this.content.innerHTML = ''; // 清除之前的内容
        if (message) {
            const messageElement = document.createElement('p');
            messageElement.textContent = message;
            this.content.appendChild(messageElement);
        }

        // 根据类型设置不同的样式
        this.popup.className = 'popup'; // 清除其他类型样式
        this.popup.classList.add('popup-window');
        this.popup.classList.add(`popup-${type}`); // 添加新类型样式
        this.popup.style.display = 'flex';

        if (type === 'progerss') {
            this.loadingSpinner.show();
        } else {
            this.loadingSpinner.hide();
        }

        if (confirmCallback) {
            const confirmBtn = this.confirmBtn(confirmCallback, btnText);
            this.content.appendChild(confirmBtn);
        }



        // 自动关闭（如果指定时间）
        if (autoCloseTime > 0) {
            setTimeout(() => {
                this.close();
            }, autoCloseTime);
        }
    }

    // // 向弹窗中加入加载指示器
    // addLoadingSpinner(loadingSpinner) {
    //     this.content.appendChild(loadingSpinner.getElement());
    // }

    confirmBtn(confirmCallback, btnText) {
        const confirmBtn = document.createElement('button');
        confirmBtn.classList.add('popup-confirmBtn');
        confirmBtn.textContent = btnText;
        confirmBtn.addEventListener('click', () => {
            if(confirmCallback) {
                confirmCallback();
            }
            // document.body.removeChild(this.popup);
            this.close();
        })
        return confirmBtn;
    }

    // 关闭弹窗
    close() {
        this.popup.style.display = 'none';
        this.loadingSpinner.hide();
    }
}



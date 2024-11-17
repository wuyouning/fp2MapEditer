import { MainStyledButton } from "./buttonComponent.js";
import { setTranslatedText } from "./i18next.js";
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
        this.popup.classList.add('popup', 'popup-window');
        this.popup.style.display = 'none';

        // 内容容器
        this.content = document.createElement('div');
        this.content.classList.add('popup-content');
        this.popup.appendChild(this.content);

        // 关闭按钮
        this.closeButton = document.createElement('button');
        this.closeButton.classList.add('popup-close-button');
        this.closeButton.textContent = '×';
        this.closeButton.addEventListener('click', () => this.close());
        this.popup.appendChild(this.closeButton);

        // 加载指示器
        this.loadingSpinner = new LoadingSpinner();
        this.content.appendChild(this.loadingSpinner.getElement());

        // 添加到文档主体
        document.body.appendChild(this.popup);
    }

    // 显示弹窗
    show(message, type = 'info', autoCloseTime = 0, btnText = '确认', confirmCallback = 'default') {
        this.content.innerHTML = ''; // 清除之前的内容
        if (message) {
            const messageElement = document.createElement('p');
            // messageElement.textContent = message;
            setTranslatedText(messageElement, message);
            this.content.appendChild(messageElement);
        }

        // 根据类型设置不同的样式
        this.popup.className = 'popup popup-window'; // 重置样式
        this.popup.classList.add(`popup-${type}`);
        this.popup.style.display = 'flex';

        if (type === 'progress') {
            this.loadingSpinner.show();
        } else {
            this.loadingSpinner.hide();
        }

        // 处理确认按钮
        if (confirmCallback) {
            const actualCallback = confirmCallback === 'default' ? () => this.close() : confirmCallback;
            const confirmBtn = this.confirmBtn(actualCallback, btnText);
            this.content.appendChild(confirmBtn);
        }

        // 自动关闭
        if (autoCloseTime > 0) {
            setTimeout(() => {
                this.close();
            }, autoCloseTime);
        }
    }

    confirmBtn(callback, btnText) {
        const confirmBtn = new MainStyledButton(
            null, 
            btnText, 
            () => {
                if (callback) {
                    callback();
                }
                this.close();
            },
            { button: "popup-confirmBtn" }
        )
        return confirmBtn;
    }

    // 关闭弹窗
    close() {
        this.popup.style.display = 'none';
        this.loadingSpinner.hide();
    }
}



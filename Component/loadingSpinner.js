export class LoadingSpinner {
    constructor() {
        // 创建加载指示器元素
        this.spinner = document.createElement('div');
        this.spinner.classList.add('loading-spinner');
        this.spinner.style.display = 'none'; // 默认隐藏
    }

    // 显示加载指示器
    show() {
        this.spinner.style.display = 'block';
    }

    // 隐藏加载指示器
    hide() {
        this.spinner.style.display = 'none';
    }
}

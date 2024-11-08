export function createNavbarButton(id, cardId, iconSrc, altText, buttonText, isVisible = true) {
    const button = document.createElement('button');
    button.id = id;
    button.className = 'navBar-button';
    button.onclick = () => toggleNavbarButton(cardId, button); // 调用通用的 toggleNavbarButton

    const img = document.createElement('img');
    img.src = iconSrc;
    img.alt = altText;
    img.className = 'navBar-button-icon';

    const span = document.createElement('span');
    span.className = 'navBar-button-text';
    span.textContent = buttonText;

    button.appendChild(img);
    button.appendChild(span);
    button.style.display = isVisible ? 'flex' : 'none';

    return button;
}

// 定义通用的按钮切换逻辑
function toggleNavbarButton(cardId, button) {
    // 关闭所有卡片
    const sliders = document.querySelectorAll('.sliderCard');
    sliders.forEach(slider => {
        if (slider.id !== cardId) {
            slider.classList.remove('open');
        }
    });

    // 重置所有按钮的激活状态
    const buttons = document.querySelectorAll('.navBar-button');
    buttons.forEach(btn => {
        if (btn !== button) {
            btn.classList.remove('active');
        }
    });

    // 切换当前卡片
    const slider = document.getElementById(cardId);
    const isActive = slider.classList.toggle('open');
    
    if (isActive) {
        button.classList.add('active');
    } else {
        button.classList.remove('active');
    }
}

//方块形状的按钮
export function createSquareColorButton(button, key, selectedKey, onBrushSelect) { 
    const btnElement = document.createElement('div'); 
    btnElement.className = 'square-button'; 
    btnElement.style.backgroundColor = button.color; 

    // 勾选色块 
    const checkmark = document.createElement('span'); 
    checkmark.className = 'checkmark'; 
    checkmark.textContent = '✔'; 
    checkmark.style.color = button.color === '#FFF' ? 'black' : 'white'; 
    btnElement.appendChild(checkmark); 

    if (key === selectedKey) { 
        btnElement.classList.add('selected'); 
        checkmark.style.display = 'block'; 
    } else { 
        checkmark.style.display = 'none'; 
    } 

    btnElement.onclick = () => { 
        const previousSelected = document.querySelector('.square-button.selected'); 
        if (previousSelected) { 
            previousSelected.classList.remove('selected'); 
            previousSelected.querySelector('.checkmark').style.display = 'none'; 
        } 
        onBrushSelect(key); 
        btnElement.classList.add('selected'); 
        checkmark.style.display = 'block'; 
    }; 

    return btnElement;
}

export class SliderToggleButton {
    constructor(containerId, visibleIdText, hiddenIdText, initialState = true, callback = null, classNames = {}) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            throw new Error(`Cannot find container with ID: ${containerId}`);
        }

        this.visibleIdText = visibleIdText;
        this.hiddenIdText = hiddenIdText;
        this.isOn = initialState;  // 初始状态（on 或 off）
        this.callback = callback;  // 保存回调函数
        this.classNames = classNames;
        this.render();
    }

    render() {
        // 创建组件外层容器
        const toggleContainer = document.createElement("div");
        toggleContainer.classList.add("slider-toggle-component-container");
        // 如果传入了自定义的容器类名，添加到容器
        if (this.classNames.container) {
            toggleContainer.classList.add(this.classNames.container);
        }

        toggleContainer.addEventListener("click", () => this.toggle());

        // 左侧显示ID
        const visibleId = document.createElement("span");
        visibleId.classList.add("slider-toggle-visible-id");
        visibleId.textContent = this.visibleIdText;
        if (this.classNames.visibleId) {
            visibleId.classList.add(this.classNames.visibleId);
        }

        toggleContainer.appendChild(visibleId);

        // 中间矩形和上方圆形
        this.shapeContainer = document.createElement("div");
        this.shapeContainer.classList.add("slider-toggle-shape-container");

        this.circle = document.createElement("div");
        this.circle.classList.add("slider-toggle-circle");
        if (this.isOn) {
            this.circle.classList.add("on");
        }

        if (this.classNames.circle) {
            this.circle.classList.add(this.classNames.circle);
        }

        this.shapeContainer.appendChild(this.circle);
        toggleContainer.appendChild(this.shapeContainer);

        // 右侧隐藏ID
        const hiddenId = document.createElement("span");
        hiddenId.classList.add("slider-toggle-hidden-id");

        if (this.classNames.hiddenId) {
            hiddenId.classList.add(this.classNames.hiddenId);
        }

        hiddenId.textContent = this.hiddenIdText;
        toggleContainer.appendChild(hiddenId);

        // 添加到父容器
        this.container.appendChild(toggleContainer);
    }

    toggle() {
        // 切换状态
        this.isOn = !this.isOn;

        // 更新圆形的位置
        if (this.isOn) {
            this.circle.classList.add("on");
        } else {
            this.circle.classList.remove("on");
        }

        // 调用回调函数（如果有）
        if (typeof this.callback === "function") {
            this.callback(this.isOn);
        }
    }
    /* 样式使用说明
    const brushModelButton = new SliderToggleButton("asideCard", "开启", "关闭", true, null, {
    container: "my-toggle-container",  // 外层容器类名
    visibleId: "my-visible-id",       // 左侧显示ID类名
    hiddenId: "my-hidden-id",         // 右侧隐藏ID类名
    circle: "my-circle"               // 圆形按钮类名
    });
    css配置
    .my-toggle-container {
        background-color: #f1f1f1;
        padding: 10px;
        border-radius: 20px;
        cursor: pointer;
    }

    .my-visible-id {
        color: green;
    }

    .my-hidden-id {
        color: red;
    }

    .my-circle {
        width: 30px;
        height: 30px;
        background-color: #007bff;
        border-radius: 50%;
    }

    .my-circle.on {
        background-color: #28a745;
    }
    */
}


export class CustomSlider {
    constructor(containerId, label, min, max, value, step = 1, onChangeCallback = null) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            throw new Error(`Cannot find container with ID: ${containerId}`);
        }

        this.label = label;
        this.min = min;
        this.max = max;
        this.value = value;
        this.step = step;
        this.onChangeCallback = onChangeCallback;

        this.render();
    }

    render() {
        // 创建外层容器
        const sliderContainer = document.createElement("div");
        sliderContainer.classList.add("custom-slider-container");
        this.container.appendChild(sliderContainer);

        const topArea = document.createElement("div");
        topArea.classList.add('bottomArea')
        sliderContainer.appendChild(topArea);

        // 添加文字说明标签
        const labelElement = document.createElement("div");
        labelElement.classList.add("slider-label");
        labelElement.textContent = this.label;
        topArea.appendChild(labelElement);

        // 添加当前值显示
        this.valueDisplay = document.createElement("div");
        this.valueDisplay.classList.add("slider-value-display");
        this.valueDisplay.textContent = `当前值: ${this.value}`;
        topArea.appendChild(this.valueDisplay);

        const bottomArea = document.createElement("div");
        bottomArea.classList.add('bottomArea')
        sliderContainer.appendChild(bottomArea);

        // 左侧减小按钮
        this.decreaseButton = document.createElement("button");
        this.decreaseButton.classList.add("slider-button");
        this.decreaseButton.textContent = "<";
        this.decreaseButton.addEventListener("click", () => this.decreaseValue());
        bottomArea.appendChild(this.decreaseButton);

        // 滑动条
        this.slider = document.createElement("input");
        this.slider.type = "range";
        this.slider.classList.add("custom-slider");
        this.slider.min = this.min;
        this.slider.max = this.max;
        this.slider.value = this.value;
        this.slider.step = this.step;
        this.slider.addEventListener("input", () => this.updateValueFromSlider());
        bottomArea.appendChild(this.slider);

        // 右侧增大按钮
        this.increaseButton = document.createElement("button");
        this.increaseButton.classList.add("slider-button");
        this.increaseButton.textContent = ">";
        this.increaseButton.addEventListener("click", () => this.increaseValue());
        bottomArea.appendChild(this.increaseButton);
    }

    // 更新值并刷新滑块和显示
    updateValue(value) {
        this.value = value;
        this.slider.value = value;  // 更新滑块值
        this.valueDisplay.textContent = `当前值: ${this.value}`;  // 更新显示值
        if (this.onChangeCallback) {
            this.onChangeCallback(this.value);
        }
    }

    // 增加值
    increaseValue() {
        if (this.value + this.step <= this.max) {
            this.updateValue(this.value + this.step);
        }
    }

    // 减小值
    decreaseValue() {
        if (this.value - this.step >= this.min) {
            this.updateValue(this.value - this.step);
        }
    }

    // 从滑块更新值
    updateValueFromSlider() {
        this.updateValue(parseInt(this.slider.value));  // 更新为滑块的新值
    }
}


export class MainStyledButton {
    constructor(containerId, buttonText, callback = null, classNames = {}) {
        this.container = containerId; //直接加了，不做ID查询
        if (!this.container) {
            throw new Error(`Cannot find container with ID: ${containerId}`);
        }

        this.buttonText = buttonText;
        this.callback = callback;  // 保存回调函数
        this.classNames = classNames;
        this.render();
    }

    render() {
        // 创建按钮元素
        const button = document.createElement('button');
        button.textContent = this.buttonText;
        button.classList.add('main-styled-button');

        // 如果传入了自定义的按钮类名，添加到按钮
        if (this.classNames.button) {
            button.classList.add(this.classNames.button);
        }

        // 添加点击事件
        button.addEventListener('click', () => this.handleClick());

        // 添加到父容器
        this.container.appendChild(button);
    }

    handleClick() {
        // 调用回调函数（如果有）
        if (typeof this.callback === "function") {
            this.callback();
        }
    }
}

/* 使用说明
const styledButton = new StyledButton("buttonContainer", "运输资源", () => {
    console.log("Button clicked!");
}, {
    button: "my-custom-button"  // 自定义按钮类名
});

CSS 配置：
.my-custom-button {
    font-size: 1.2em;
    color: #333;
    padding: 10px 20px;
    background: linear-gradient(to bottom, #e6e6e6, #f2f2f2);
    border: 1px solid #ccc;
    border-radius: 10px;
    box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.2);
    text-shadow: 0 1px 0 #fff;
    position: relative;
    font-weight: bold;
}

.my-custom-button:before,
.my-custom-button:after {
    content: "";
    position: absolute;
    top: 50%;
    width: 80%;
    height: 1px;
    background: #999;
}

.my-custom-button:before {
    left: 10%;
    transform: translateY(-150%);
}

.my-custom-button:after {
    left: 10%;
    transform: translateY(50%);
}

.my-custom-button:hover {
    background: linear-gradient(to bottom, #f2f2f2, #e6e6e6);
}
*/
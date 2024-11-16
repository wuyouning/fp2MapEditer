import i18next from './i18next.js';

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

export function closeNavBarWithSlider() {
    const sliders = document.querySelectorAll('.sliderCard');
    sliders.forEach(slider => {
            slider.classList.remove('open');
        
    });

    const buttons = document.querySelectorAll('.navBar-button');
    buttons.forEach(btn => {
            btn.classList.remove('active');
    });

}

//方块形状的按钮
export function createSquareColorButton(button, key, selectedKey, onBrushSelect) {
    const btnElement = document.createElement('div');
    btnElement.className = 'square-button';
    btnElement.style.backgroundColor = button.color;

    // 添加 data-key 属性，便于查找
    btnElement.setAttribute('data-key', key);

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

    // 使用独立出来的点击处理逻辑
    btnElement.onclick = () => handleBrushSelection(btnElement, key, onBrushSelect);

    return btnElement;
}

export function handleBrushSelection(buttonElement, key, onBrushSelect) {
    const previousSelected = document.querySelector('.square-button.selected');
    if (previousSelected) {
        previousSelected.classList.remove('selected');
        previousSelected.querySelector('.checkmark').style.display = 'none';
    }
    onBrushSelect(key);
    buttonElement.classList.add('selected');
    buttonElement.querySelector('.checkmark').style.display = 'block';
}

export class SliderToggleButton {
    constructor(containerIdOrElement, visibleIdKey, hiddenIdKey, initialState = true, callback = null, classNames = {}, id = '') {
      // 检测传入的是字符串 ID 还是 DOM 元素
      if (typeof containerIdOrElement === 'string') {
        this.container = document.getElementById(containerIdOrElement);
        if (!this.container) {
          throw new Error(`Cannot find container with ID: ${containerIdOrElement}`);
        }
      } else if (containerIdOrElement instanceof HTMLElement) {
        this.container = containerIdOrElement;
      } else {
        throw new Error("Invalid container parameter. Expected a string ID or DOM element.");
      }
  
      this.visibleIdKey = visibleIdKey;
      this.hiddenIdKey = hiddenIdKey;
      this.visibleIdText = i18next.t(visibleIdKey);
      this.hiddenIdText = i18next.t(hiddenIdKey);
      this.isOn = initialState; // 初始状态（on 或 off）
      this.callback = callback; // 保存回调函数
      this.classNames = classNames;
      this.id = id;
  
      this.render();
  
      // 监听语言变化，动态更新标签
      i18next.on('languageChanged', () => {
        this.updateLabel();
      });
    }
  
    render() {
      // 创建组件外层容器
      const toggleContainer = document.createElement("div");
      toggleContainer.classList.add("slider-toggle-component-container");
      if (this.id) {
        toggleContainer.id = this.id; // 设置容器的 id 以便以后能获取到
      }
      // 如果传入了自定义的容器类名，添加到容器
      if (this.classNames.container) {
        toggleContainer.classList.add(this.classNames.container);
      }
  
      toggleContainer.addEventListener("click", () => this.toggle());
  
      // 左侧显示ID
      this.visibleId = document.createElement("span");
      this.visibleId.classList.add("slider-toggle-visible-id");
      this.visibleId.textContent = this.visibleIdText;
      if (this.classNames.visibleId) {
        this.visibleId.classList.add(this.classNames.visibleId);
      }
  
      toggleContainer.appendChild(this.visibleId);
  
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
      this.hiddenId = document.createElement("span");
      this.hiddenId.classList.add("slider-toggle-hidden-id");
  
      if (this.classNames.hiddenId) {
        this.hiddenId.classList.add(this.classNames.hiddenId);
      }
  
      this.hiddenId.textContent = this.hiddenIdText;
      toggleContainer.appendChild(this.hiddenId);
  
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
  
    updateLabel() {
      // 更新可见和隐藏 ID 的文本
      this.visibleId.textContent = i18next.t(this.visibleIdKey);
      this.hiddenId.textContent = i18next.t(this.hiddenIdKey);
    }
  
    getToggleState() {
      return this.isOn;
    }
}

export class CustomSlider {
    constructor(containerId, labelKey, min, max, value, step = 1, onChangeCallback = null) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            throw new Error(`Cannot find container with ID: ${containerId}`);
        }

        this.labelKey = labelKey;
        this.min = min;
        this.max = max;
        this.value = value;
        this.step = step;
        this.onChangeCallback = onChangeCallback;

        this.render();

        // 监听语言变化，动态更新标签
        i18next.on('languageChanged', () => {
            this.updateLabel();
        });
    }

    render() {
        // 创建外层容器
        const sliderContainer = document.createElement("div");
        sliderContainer.classList.add("custom-slider-container");
        this.container.appendChild(sliderContainer);

        const topArea = document.createElement("div");
        topArea.classList.add('topArea');
        sliderContainer.appendChild(topArea);

        // 添加文字说明标签
        this.labelElement = document.createElement("div");
        this.labelElement.classList.add("slider-label");
        this.labelElement.textContent = i18next.t(this.labelKey);
        topArea.appendChild(this.labelElement);

        // 添加当前值显示
        this.valueDisplay = document.createElement("div");
        this.valueDisplay.classList.add("slider-value-display");

        const valueDisplayLabel = document.createElement('p');
        valueDisplayLabel.setAttribute('data-i18n', '当前值'); // 让它也可以动态翻译
        valueDisplayLabel.textContent = i18next.t('当前值');
        this.valueDisplayNumber = document.createElement('p');
        this.valueDisplayNumber.textContent = this.value;

        this.valueDisplay.append(valueDisplayLabel, this.valueDisplayNumber);
        topArea.appendChild(this.valueDisplay);

        const bottomArea = document.createElement("div");
        bottomArea.classList.add('bottomArea');
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

    // 更新标签的翻译文本
    updateLabel() {
        this.labelElement.textContent = i18next.t(this.labelKey);
        this.valueDisplay.querySelector('[data-i18n="当前值"]').textContent = i18next.t('当前值');
    }

    // 更新值并刷新滑块和显示
    updateValue(value) {
        this.value = value;
        this.slider.value = value;  // 更新滑块值
        this.valueDisplayNumber.textContent = this.value;  // 更新显示值
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
        this.container = containerId;
        this.buttonTextKey = buttonText;
        this.callback = callback;  // 保存回调函数
        this.classNames = classNames;

        // 如果没有提供容器，则仅返回创建的按钮
        if (!this.container) {
            return this.createButtonElement();
        }

        // 否则，渲染到容器中
        this.render();
    }

    createButtonElement() {
        // 创建按钮元素
        const button = document.createElement('button');
        button.setAttribute('data-i18n', this.buttonTextKey);
        button.textContent = i18next.t(this.buttonTextKey);
        button.classList.add('main-styled-button');

        // 如果传入了自定义的按钮类名，添加到按钮
        if (this.classNames.button) {
            button.classList.add(this.classNames.button);
        }

        // 添加点击事件
        button.addEventListener('click', () => this.handleClick());

        return button;
    }

    render() {
        // 使用 createButtonElement 创建按钮
        const button = this.createButtonElement();

        // 确保提供的父容器存在
        if (!this.container) {
            throw new Error('Container not provided for rendering the button.');
        }

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
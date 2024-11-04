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
    constructor(containerId, visibleIdText, hiddenIdText, initialState = true, callback = null) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            throw new Error(`Cannot find container with ID: ${containerId}`);
        }

        this.visibleIdText = visibleIdText;
        this.hiddenIdText = hiddenIdText;
        this.isOn = initialState;  // 初始状态（on 或 off）
        this.callback = callback;  // 保存回调函数

        this.render();
    }

    render() {
        // 创建组件外层容器
        const toggleContainer = document.createElement("div");
        toggleContainer.classList.add("slider-toggle-component-container");
        toggleContainer.addEventListener("click", () => this.toggle());

        // 左侧显示ID
        const visibleId = document.createElement("span");
        visibleId.classList.add("slider-toggle-visible-id");
        visibleId.textContent = this.visibleIdText;
        toggleContainer.appendChild(visibleId);

        // 中间矩形和上方圆形
        this.shapeContainer = document.createElement("div");
        this.shapeContainer.classList.add("slider-toggle-shape-container");

        this.circle = document.createElement("div");
        this.circle.classList.add("slider-toggle-circle");
        if (this.isOn) {
            this.circle.classList.add("on");
        }
        this.shapeContainer.appendChild(this.circle);
        toggleContainer.appendChild(this.shapeContainer);

        // 右侧隐藏ID
        const hiddenId = document.createElement("span");
        hiddenId.classList.add("slider-toggle-hidden-id");
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
}

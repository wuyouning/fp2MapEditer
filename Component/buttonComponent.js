export function createNavbarButton(id, iconSrc, altText, buttonText, isVisible = true) {
    const button = document.createElement('button');
    button.id = id;
    button.className = 'navBar-button';
    button.onclick = () => toggleNavbarButton(id, button); // 调用通用的 toggleNavbarButton

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
function toggleNavbarButton(toolbarId, button) {
    // 关闭所有工具栏
    const toolbars = document.querySelectorAll('.toolbar');
    toolbars.forEach(toolbar => {
        if (toolbar.id !== toolbarId) {
            toolbar.classList.remove('open');
        }
    });

    // 重置所有按钮的激活状态
    const buttons = document.querySelectorAll('.navBar-button');
    buttons.forEach(btn => {
        if (btn !== button) {
            btn.classList.remove('active');
        }
    });

    // 切换当前按钮和对应的工具栏
    const toolbar = document.getElementById(toolbarId);
    const isActive = toolbar.classList.toggle('open');
    
    if (isActive) {
        button.classList.add('active');
    } else {
        button.classList.remove('active');
    }
}
function toggleToolbar(toolbarId, button) {
    // 关闭所有 toolbar
    const toolbars = document.querySelectorAll('.toolbar');
    toolbars.forEach(toolbar => {
        if (toolbar.id !== toolbarId) {
            toolbar.classList.remove('open');
        }
    });
    
    // 关闭所有按钮的激活状态
    const buttons = document.querySelectorAll('.toggle-button');
    buttons.forEach(btn => {
        if (btn !== button) {
            btn.classList.remove('active');
        }
    });

    // 切换当前按钮和对应的 toolbar
    const toolbar = document.getElementById(toolbarId);
    const isActive = toolbar.classList.toggle('open');
    
    if (isActive) {
        button.classList.add('active');
    } else {
        button.classList.remove('active');
    }
}
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

function closeToolBar() {
    // 关闭所有 toolbar
    const toolbars = document.querySelectorAll('.toolbar');
    toolbars.forEach(toolbar => {
        toolbar.classList.remove('open');
    });

    // 关闭所有按钮的激活状态
    const buttons = document.querySelectorAll('.toggle-button');
    buttons.forEach(btn => {
        btn.classList.remove('active');
    });
}

function toggleToolbarFullScreen(toolbarId, button) {
    toggleToolbar(toolbarId, button);
    //再想想优化的办法
    // const toolbar = document.getElementById(toolbarId);
    // const isClose = toolbar.style.display === "none"; // 检查当前显示状态
    
    // // 切换当前工具栏的显示状态
    // if (isClose) {
    //     toolbar.style.display = "grid"; // 打开工具栏
    // } else {
    //     toolbar.style.display = "none"; // 关闭工具栏
    // }
}


function loginToggle() {
    const loginModal = document.getElementById('loginModal');
    if (!loginModal) {
        console.error("无法找到 loginModal 元素");
        return;
    }

    if (loginModal.style.display === 'block') {
        loginModal.style.display = 'none';
    } else {
        loginModal.style.display = 'block';
    }
}

// 文本内容导入
function loadContent(url, elementId, jsonKey) {
    fetch(url)
      .then(response => response.json())
      .then(data => {
        const contentData = data[jsonKey];
        if (contentData) {
          document.getElementById(elementId).innerHTML = `
            <h2>${contentData.title}</h2>
            <p>${contentData.content}</p>
          `;
        } else {
          document.getElementById(elementId).innerHTML = '<p>未找到指定的内容，请检查 key 是否正确。</p>';
        }
      })
      .catch(error => {
        console.error('Error loading content:', error);
        document.getElementById(elementId).innerHTML = '<p>内容加载失败，请稍后重试。</p>';
      });
}


// 左键拖动画布 
class LeftClickDragScroller {
    constructor() {
        this.isRightMouseDown = false;
        this.startX = 0;
        this.startY = 0;
        this.init();
    }

    init() {
        // 监听鼠标按下事件
        window.addEventListener('mousedown', this.onMouseDown.bind(this));
        // 监听鼠标移动事件
        window.addEventListener('mousemove', this.onMouseMove.bind(this));
        // 监听鼠标释放事件
        window.addEventListener('mouseup', this.onMouseUp.bind(this));
        // 取消默认的右键菜单事件
        window.addEventListener('contextmenu', this.onContextMenu.bind(this));
    }

    onMouseDown(event) {
        // 判断是否为左键
        if (event.button === 0) {
            this.isRightMouseDown = true;
            this.startX = event.clientX;
            this.startY = event.clientY;
            document.body.style.cursor = 'grab'; // 鼠标变为小手
        }
    }

    onMouseMove(event) {
        if (this.isRightMouseDown) {
            const deltaX = this.startX - event.clientX;
            const deltaY = this.startY - event.clientY;
            
            // 滚动窗口
            window.scrollBy(deltaX, deltaY);
            
            // 更新起始点
            this.startX = event.clientX;
            this.startY = event.clientY;
        }
    }

    onMouseUp(event) {
        // 当右键释放时，停止滚动
        if (event.button === 0) {
            this.isRightMouseDown = false;
            document.body.style.cursor = 'default'; // 恢复默认光标
        }
    }

    onContextMenu(event) {
        event.preventDefault();
    }
}

// 调用加载公告内容
loadContent('toolbar3.json', 'introduction-content', 'introduction');
loadContent('toolbar3.json', 'additional-content', `additional`);
loadContent('toolbar3.json', 'donation-content', `donation`);
// 鼠标右键
const leftClickDragScroller = new LeftClickDragScroller();
// 检查登录信息后加载TODO:
window.onload = () => {
    userManager.setUserLogin()
};
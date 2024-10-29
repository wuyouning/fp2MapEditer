function togglePushPublicSwitch() {
    var toggle = document.getElementById('savingPopup-toggleButton');
    toggle.classList.toggle('on');
}

function toggleSaveSwitch() {
    var popup = document.getElementById('savingPopup');
    const isUp = popup.style.display === "none" || popup.style.display === "";
    if (isUp) {
        popup.style.display = 'block';
        showEditBtn();
        setPlaceholders();
    } else {
        popup.style.display = 'none';
    }
}

function showError(message, close = false) {
    var errorMessageDiv = document.getElementById('savingPopup-errorMessage');
    errorMessageDiv.textContent = message;
    errorMessageDiv.style.display = 'block'; // 显示报错信息
    if (close) {
        errorMessageDiv.style.color = 'green';
        setTimeout(() => {
            errorMessageDiv.style.display = 'none';
        }, 2000);
    }
}

function hideError() {
    var errorMessageDiv = document.getElementById('savingPopup-errorMessage');
    errorMessageDiv.style.display = 'none'; // 隐藏报错信息
}

function showEditBtn() {
    const hexGridId = localStorage.getItem('hexGridId');
    const editButton = document.getElementById('editButton');
    
    if (hexGridId) {
        editButton.style.display = 'inline-block'; // 显示按钮
    } else {
        editButton.style.display = 'none'; // 隐藏按钮
    }
}

function setPlaceholders() {
    const hexGridId = localStorage.getItem('hexGridId');

    if (hexGridId) {
        // 假设 hexGrid 数据被存储为 JSON 字符串
        const hexGrid = JSON.parse(localStorage.getItem(`hexGrid-${hexGridId}`));

        if (hexGrid) {
            const spellNameInput = document.getElementById('savingPopup-spellName');
            const descriptionInput = document.getElementById('savingPopup-description');

            // 设置 placeholder 为 hexGrid 中的 canvasName 和 description
            spellNameInput.placeholder = hexGrid.canvasName || "请输入法阵名称...";
            descriptionInput.placeholder = hexGrid.description || "请输入描述...";
        }
    }
}

//规划广场
async function displayPublicHexGrids() {
    try {
        // 从后端获取 isPublic 为 true 的所有 hexGrid 数据
        const response = await fetch('http://127.0.0.1:3000/api/get-public-hexgrids', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('无法获取公共 HexGrid 数据');
        }

        const hexGrids = await response.json();

        // 获取公共 HexGrid 的容器元素
        const publicHexGridBar = document.getElementById('publicHexGridBar');
        publicHexGridBar.innerHTML = ''; // 清空已有内容

        // 遍历获取的 HexGrid 数据并创建对应的按钮元素
        hexGrids.forEach(hexGrid => {
            const button = document.createElement('button');
            button.classList.add('hexgrid-button');

            // 封面图片
            const coverImage = document.createElement('img');
            coverImage.src = hexGrid.cover_image;
            coverImage.alt = `${hexGrid.canvas_name} 封面`;
            coverImage.classList.add('hexgrid-cover');
            button.appendChild(coverImage);

            // 画布名称
            const canvasName = document.createElement('div');
            canvasName.textContent = hexGrid.canvas_name;
            canvasName.classList.add('hexgrid-name');
            button.appendChild(canvasName);

            // 拥有者名称
            const ownerName = document.createElement('div');
            ownerName.textContent = `作者: ${hexGrid.owner_name}`;
            ownerName.classList.add('hexgrid-owner');
            button.appendChild(ownerName);

            // 按钮点击事件 - 弹出详情弹窗
            button.addEventListener('click', () => displayPublicHexGridDetails(hexGrid));

            // 将按钮添加到公共 HexGrid 容器中
            publicHexGridBar.appendChild(button);
        });
    } catch (error) {
        console.error('展示公共 HexGrid 时出错:', error);
    }
}

async function displayPrivateHexGrids() {
    try {
        const ownerId = localStorage.getItem('uuid');
        if (!ownerId) {
            throw new Error('无法获取用户的 UUID');
        }

        // 从后端获取 ownerId 对应的私有 hexGrid 数据
        const response = await fetch(`http://127.0.0.1:3000/api/get-private-hexgrids?ownerId=${ownerId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('无法获取私有 HexGrid 数据');
        }

        const hexGrids = await response.json();

        // 获取私有 HexGrid 的容器元素
        const privateHexGridBar = document.getElementById('privateHexGridBar');
        privateHexGridBar.innerHTML = ''; // 清空已有内容

        // 遍历获取的 HexGrid 数据并创建对应的按钮元素
        hexGrids.forEach(hexGrid => {
            const button = document.createElement('button');
            button.classList.add('hexgrid-button');

            // 封面图片
            const coverImage = document.createElement('img');
            coverImage.src = hexGrid.cover_image;
            coverImage.alt = `${hexGrid.canvas_name} 封面`;
            coverImage.classList.add('hexgrid-cover');
            button.appendChild(coverImage);

            // 画布名称
            const canvasName = document.createElement('div');
            canvasName.textContent = hexGrid.canvas_name;
            canvasName.classList.add('hexgrid-name');
            button.appendChild(canvasName);

            // 最后编辑时间
            const lastEdit = document.createElement('div');
            lastEdit.textContent = `最后编辑: ${hexGrid.lastedit_at}`;
            lastEdit.classList.add('hexgrid-lastedit');
            button.appendChild(lastEdit);

            // 按钮点击事件 - 弹出详情弹窗
            button.addEventListener('click', () => displayPrivateHexGridDetails(hexGrid));

            // 将按钮添加到私有 HexGrid 容器中
            privateHexGridBar.appendChild(button);
        });
    } catch (error) {
        console.error('展示私有 HexGrid 时出错:', error);
    }
}

function displayHexGridDetails(hexGrid) {
    // 创建弹窗容器
    const modal = document.createElement('div');
    modal.classList.add('hexgrid-modal');

    // 弹窗内容
    const modalContent = document.createElement('div');
    modalContent.classList.add('hexgrid-modal-content');

    // 画布名称
    const canvasName = document.createElement('h2');
    canvasName.textContent = hexGrid.canvas_name;
    modalContent.appendChild(canvasName);

    // 封面图片和描述容器
    const contentContainer = document.createElement('div');
    contentContainer.classList.add('hexgrid-content-container');

    // 封面图片
    const coverImage = document.createElement('img');
    coverImage.src = hexGrid.cover_image;
    coverImage.alt = `${hexGrid.canvas_name} 封面`;
    coverImage.classList.add('hexgrid-modal-cover');
    contentContainer.appendChild(coverImage);

    // 描述
    const description = document.createElement('div');
    description.textContent = hexGrid.description;
    description.classList.add('hexgrid-description');
    contentContainer.appendChild(description);

    modalContent.appendChild(contentContainer);

    // 底部按钮组
    const buttonGroup = document.createElement('div');
    buttonGroup.classList.add('hexgrid-button-group');

    const importButton = document.createElement('button');
    importButton.textContent = '导入';
    importButton.classList.add('hexgrid-modal-button');
    buttonGroup.appendChild(importButton);

    const editButton = document.createElement('button');
    editButton.textContent = '编辑';
    editButton.classList.add('hexgrid-modal-button');
    buttonGroup.appendChild(editButton);

    const deleteButton = document.createElement('button');
    deleteButton.textContent = '删除';
    deleteButton.classList.add('hexgrid-modal-button');
    buttonGroup.appendChild(deleteButton);

    modalContent.appendChild(buttonGroup);

    // 关闭按钮
    const closeButton = document.createElement('button');
    closeButton.textContent = '×';
    closeButton.classList.add('hexgrid-close-button');
    closeButton.addEventListener('click', () => {
        document.body.removeChild(modal);
    });

    modal.appendChild(modalContent);
    modal.appendChild(closeButton);
    document.body.appendChild(modal);
}

//规划图细节 - 公开
function displayPublicHexGridDetails(hexGrid) {
    // 创建弹窗容器
    const modal = document.createElement('div');
    modal.classList.add('hexgrid-modal');

    // 弹窗内容
    const modalContent = document.createElement('div');
    modalContent.classList.add('hexgrid-modal-content');

    // 画布名称
    const canvasName = document.createElement('h2');
    canvasName.textContent = hexGrid.canvas_name;
    modalContent.appendChild(canvasName);

    // 封面图片和描述容器
    const contentContainer = document.createElement('div');
    contentContainer.classList.add('hexgrid-content-container');

    // 封面图片
    const coverImage = document.createElement('img');
    coverImage.src = hexGrid.cover_image;
    coverImage.alt = `${hexGrid.canvas_name} 封面`;
    coverImage.classList.add('hexgrid-modal-cover');
    contentContainer.appendChild(coverImage);

    // 描述
    const description = document.createElement('div');
    description.textContent = hexGrid.description;
    description.classList.add('hexgrid-description');
    contentContainer.appendChild(description);

    modalContent.appendChild(contentContainer);

    const importButton = document.createElement('button');
    importButton.textContent = '导入';
    importButton.classList.add('hexgrid-modal-button');
    contentContainer.appendChild(importButton);

    // 关闭按钮
    const closeButton = document.createElement('button');
    closeButton.textContent = '×';
    closeButton.classList.add('hexgrid-close-button');
    closeButton.addEventListener('click', () => {
        document.body.removeChild(modal);
    });

    modalContent.appendChild(closeButton);
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
}

//规划图细节 - 私有
function displayPrivateHexGridDetails(hexGrid) {
    // 创建弹窗容器
    const modal = document.createElement('div');
    modal.classList.add('hexgrid-modal');

    // 弹窗内容
    const modalContent = document.createElement('div');
    modalContent.classList.add('hexgrid-modal-content');

    // 画布名称和状态
    const canvasName = document.createElement('h2');
    canvasName.textContent = `${hexGrid.canvas_name} (${hexGrid.is_public ? '已公开' : '未发布'})`;
    modalContent.appendChild(canvasName);

    // 封面图片和描述容器
    const contentContainer = document.createElement('div');
    contentContainer.classList.add('hexgrid-content-container');

    // 封面图片
    const coverImage = document.createElement('img');
    coverImage.src = hexGrid.cover_image;
    coverImage.alt = `${hexGrid.canvas_name} 封面`;
    coverImage.classList.add('hexgrid-modal-cover');
    contentContainer.appendChild(coverImage);

    // 描述
    const description = document.createElement('div');
    description.textContent = hexGrid.description;
    description.classList.add('hexgrid-description');
    contentContainer.appendChild(description);

    modalContent.appendChild(contentContainer);

    // 底部按钮组（导入、编辑、删除）
    const buttonGroup = document.createElement('div');
    buttonGroup.classList.add('hexgrid-button-group');

    const importButton = document.createElement('button');
    importButton.textContent = '导入';
    importButton.classList.add('hexgrid-modal-button');
    buttonGroup.appendChild(importButton);

    const editButton = document.createElement('button');
    editButton.textContent = '编辑';
    editButton.classList.add('hexgrid-modal-button');
    buttonGroup.appendChild(editButton);

    const deleteButton = document.createElement('button');
    deleteButton.textContent = '删除';
    deleteButton.classList.add('hexgrid-modal-button');
    buttonGroup.appendChild(deleteButton);

    modalContent.appendChild(buttonGroup);

    // 关闭按钮
    const closeButton = document.createElement('button');
    closeButton.textContent = '×';
    closeButton.classList.add('hexgrid-close-button');
    closeButton.addEventListener('click', () => {
        document.body.removeChild(modal);
    });

    modalContent.appendChild(closeButton);
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
}


document.addEventListener('DOMContentLoaded', () => {
    showEditBtn(); // 页面加载时检查是否显示修改按钮
    setPlaceholders(); // 页面加载时设置 placeholder
});

document.addEventListener('click', function(event) {
    const savingPopup = document.getElementById('savingPopup');
    const loginModal = document.getElementById('loginModal');

    // 处理保存弹窗的关闭逻辑
    if (savingPopup.style.display === 'block') {
        if (!savingPopup.contains(event.target) && event.target.id !== 'saveButton') {
            toggleSaveSwitch(); // 调用用于关闭保存弹窗的函数
            return; // 如果关闭了 savingPopup，则直接返回，避免影响其他逻辑
        }
    }

    // 处理登录弹窗的关闭逻辑
    if (loginModal.style.display === 'block') {
        if (!loginModal.contains(event.target) && event.target.id !== 'loginButton') {
            userManager.cancel(); // 调用用于关闭登录弹窗的函数
        }
    }
});

// 防止点击特定按钮或内部元素时关闭弹窗
['saveButton', 'loginButton', 'loginModal', 'savingPopup'].forEach(id => {
    const element = document.getElementById(id);
    if (element) {
        element.addEventListener('click', function(event) {
            event.stopPropagation(); // 阻止事件冒泡到 document 上
        });
    }
});


document.getElementById('toggleButton4').addEventListener('click', function() {
    displayPublicHexGrids();
});


document.getElementById('privateHexGrids').addEventListener('click', function() {
    displayPrivateHexGrids()
});


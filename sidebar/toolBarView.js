// 更新工具栏视图
function updateToolbarView(isExpanded = true) {
    let toolbarContainer = document.getElementById('toolbarContainer');
    const parentToolbar = document.getElementById('toolbar1');
    if (!toolbarContainer) {
        toolbarContainer = document.createElement('div');
        toolbarContainer.id = 'toolbarContainer';
    }

    // 将工具栏容器插入到 toolbar1 中
    if (parentToolbar) {
        parentToolbar.appendChild(toolbarContainer);
    } else {
        console.error('Parent toolbar element with id "toolbar1" not found');
        return;
    }

    // 设置工具栏容器的样式
    setToolbarStyle(toolbarContainer);

    // 清空现有的工具栏内容
    toolbarContainer.innerHTML = '';
    let rows = [];
    // 创建每行容器并添加按钮
    if (isExpanded) {
        rows = [5, 4, 4, 4, 1];
    } else {
        rows = [5];
    }
    // 每行显示三个按钮
    let brushKeys = Object.keys(brushMap);
    let currentIndex = 0;

    rows.forEach(rowCount => {
        const rowContainer = document.createElement('div');
        rowContainer.style.display = 'flex';
        rowContainer.style.gap = '20px';
        rowContainer.style.justifyContent = 'flex-start'; // 左对齐
        rowContainer.style.alignItems = 'flex-start'; // 确保每行的按钮与顶部对齐

        for (let i = 0; i < rowCount; i++) {
            if (currentIndex >= brushKeys.length) break;

            const key = brushKeys[currentIndex];
            const button = brushMap[key];
            const buttonWrapper = document.createElement('div');
            buttonWrapper.style.display = 'flex';
            buttonWrapper.style.flexDirection = 'column';
            buttonWrapper.style.alignItems = 'center';

            const btnElement = createColorButton(button, key);
            buttonWrapper.appendChild(btnElement);

            // 标签
            const labelElement = document.createElement('div');
            labelElement.className = 'color-name';
            labelElement.textContent = key;
            labelElement.style.marginTop = '5px';
            labelElement.style.fontSize = '14px';
            labelElement.style.textAlign = 'center';

            buttonWrapper.appendChild(labelElement);
            rowContainer.appendChild(buttonWrapper);
            currentIndex++;
        }

        toolbarContainer.appendChild(rowContainer);
    });

        // 创建颜色按钮
    function createColorButton(button, key) {
        const btnElement = document.createElement('div');
        btnElement.className = 'color-button';
        btnElement.style.backgroundColor = button.color;
        btnElement.style.border = '2px solid black';
        btnElement.style.width = '40px';
        btnElement.style.height = '40px';
        btnElement.style.display = 'flex';
        btnElement.style.alignItems = 'center';
        btnElement.style.justifyContent = 'center';
        btnElement.style.cursor = 'pointer';
        btnElement.style.borderRadius = '8px';

        // 勾选色块
        const checkmark = document.createElement('span');
        checkmark.className = 'checkmark';
        checkmark.textContent = '✔';
        checkmark.style.fontSize = '28px';
        checkmark.style.fontWeight = 'bold';
        checkmark.style.color = button.color === '#FFF' ? 'black' : 'white';
        btnElement.appendChild(checkmark);

        if (key === selectedBrush) {
            btnElement.classList.add('selected');
            checkmark.style.display = 'block';
        } else {
            checkmark.style.display = 'none';
        }

        btnElement.onclick = () => {
            const previousSelected = document.querySelector('.color-button.selected');
            if (previousSelected) {
                previousSelected.classList.remove('selected');
                previousSelected.querySelector('.checkmark').style.display = 'none';
            }
            clickSelectedBrush(key);
            btnElement.classList.add('selected');
            checkmark.style.display = 'block';
        };
        return btnElement;
    }

    // 更换画笔会发生 列表清空 + 阈值更换
    function clickSelectedBrush(key) {
        if (selectedBrush !== key) {
            selectedBrush = key;
            detectedHexList = []; // 如果画笔和之前的画笔不同，则将hexlist清空
            brushThreshold = brushMap[key].threshold;

            updateDetectedHexListView();
        }
    }


    controlGrid(toolbarContainer, isExpanded);



    // 添加控制滑动条（布局选择、尺寸调整、最大半径、ID显示控制）
    function controlGrid(toolbarContainer, isExpanded) {
        if (isExpanded) {
            const layoutSelector = document.createElement('div');
            layoutSelector.innerHTML = `
            <label for="layoutSelector">布局方式:</label>
            <select id="layoutSelector">
                <option value="pointy">尖顶</option>
                <option value="flat">平顶</option>
            </select>
            `;
            toolbarContainer.appendChild(layoutSelector);
            document.getElementById('layoutSelector').addEventListener('change', (event) => {
                hexGrid.setLayout(event.target.value);
            });

            const hexSizeSlider = document.createElement('div');
            hexSizeSlider.innerHTML = `
            <label for="hexSizeSlider">格子尺寸:</label>
            <input type="range" id="hexSizeSlider" min="24" max="80" value="30">
            <span id="hexSize">40</span>
            `;
            toolbarContainer.appendChild(hexSizeSlider);
            document.getElementById('hexSizeSlider').addEventListener('input', (event) => {
                const hexSize = Number(event.target.value);
                document.getElementById('hexSize').textContent = hexSize;
                hexGrid.setHexSize(Number(event.target.value));
            });

            const maxRadiusSlider = document.createElement('div');
            maxRadiusSlider.innerHTML = `
            <label for="maxRadiusSlider">最大半径:</label>
            <input type="range" id="maxRadiusSlider" min="1" max="30" value="6">
            <span id="maxRadiusValue">6</span>
            `;
            toolbarContainer.appendChild(maxRadiusSlider);
            document.getElementById('maxRadiusSlider').addEventListener('input', (event) => {
                const radius = Number(event.target.value);
                document.getElementById('maxRadiusValue').textContent = radius;
                hexGrid.setMaxRadius(radius);
            });

            const showIDButton = document.createElement('button');
            showIDButton.id = 'showIDButton';
            showIDButton.textContent = hexGrid.showID ? '隐藏 ID' : '显示 ID'; // 根据当前状态设置按钮文本
            toolbarContainer.appendChild(showIDButton);

            showIDButton.addEventListener('click', () => {
                hexGrid.setShowID(!hexGrid.showID);
                showIDButton.textContent = hexGrid.showID ? '隐藏 ID' : '显示 ID'; // 更新按钮文本
            });
            
            // 创建显示/隐藏标签按钮并添加功能
            const showLabelButton = document.createElement('button');
            showLabelButton.id = 'showLabelButton';
            showLabelButton.textContent = hexGrid.isShowRegionLabel ? '隐藏标签' : '显示标签'; // 根据当前状态设置按钮文本
            toolbarContainer.appendChild(showLabelButton);

            showLabelButton.addEventListener('click', () => {
                // 切换显示标签的状态
                hexGrid.isShowRegionLabel = !hexGrid.isShowRegionLabel;

                // 更新按钮文本
                showLabelButton.textContent = hexGrid.isShowRegionLabel ? '隐藏标签' : '显示标签';

                // 调用方法来显示或隐藏标签
                hexGrid.showRegionLabel(labelCtx);
                // FIX: 不能清除掉下方的格子，要不就跟显示ID一样启动重新绘制吧 hexGrid.setShowID(!hexGrid.showID);
                hexGrid.hexes.forEach(hex => {
                    hex.drawRegion(ctx, hexGrid.layout, hexGrid.isShowRegionLabel);
                });
            });
        }


        const expandButton = document.createElement('button');
        expandButton.id = 'expandButton';
        expandButton.textContent = isExpanded ? '收起' : '更多';
        toolbarContainer.appendChild(expandButton);

        expandButton.addEventListener('click', () => {
            isExpanded = !isExpanded;
            updateToolbarView(isExpanded);
            expandButton.textContent = isExpanded ? '更多' : '收起';
        });

    }
}

// 设置工具栏容器的样式
function setToolbarStyle(toolbarContainer) {
    toolbarContainer.style.position = 'fixed';
    toolbarContainer.style.display = 'flex';
    toolbarContainer.style.flexDirection = 'column'; // 工具栏列排列
    toolbarContainer.style.gap = '20px'; // 控制行间距
    toolbarContainer.style.backgroundColor = 'rgba(255, 255, 255, 0.85)'; // 设置白色背景
    toolbarContainer.style.padding = '10px'; // 添加内边距
    // toolbarContainer.style.border = '2px solid #ccc'; // 添加一个浅色边框
    toolbarContainer.style.borderRadius = '8px'; // 让边角圆润一些
    // toolbarContainer.style.boxShadow = '0px 4px 10px rgba(0, 0, 0, 0.1)'; // 添加阴影效果
}

//设置按钮容器

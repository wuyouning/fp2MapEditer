let autoBuildRegion = true;
let expanAreaModel = false;
let cleanRegionMoel = false;

function toggleAutoBuildRegion() {
    const button = document.getElementById('autoBuildRegionButton');
    autoBuildRegion = !autoBuildRegion;
    if (autoBuildRegion) {
        button.classList.add('on');
    } else {
        button.classList.remove('on');
    }
}

//扩建工具
function toggleExpanAreaTool() {
    if (hexGrid.regions.length > 0) {
        const button = document.getElementById("expandToolButton");
        button.classList.add("buildCursor");
        expanAreaModel = !expanAreaModel
        cleanRegionMoel = false
    } else {
        console.log("暂时没有区域在建，不可拓建")
    }
    cleanDetectedList();

}



//TEST: 解决一下指定区域的问题，有点不太完美,需要在考虑一下
let selectedRegion = hexGrid.regions[hexGrid.regions.length - 1] || null;

//高亮区域
function highlightRegion(hex,ctx,hexline, edgeline) {
    const region = hexGrid.regions.find(r => r.name === hex.region);
    if (region) {
        // 遍历区域内所有的格子，进行高亮和边缘绘制
        region.hexes.forEach(hex => {
            if (hex) {
                // 高亮区域内的格子
                hex.drawHoverHex(ctx, hexGrid.layout, '#EEFFB3', hexline);
                // 绘制格子的边缘
                hex.drawHexEdges(ctx, hexGrid.layout, edgeline);
            }
        });
    }
}

//删除区域
function toggleCleanRegionTool() {
    if (hexGrid.regions.length > 0) {
        const button = document.getElementById("toggleCleanRegionTool");
        button.classList.add("buildCursor");
        console.log("Button clicked, class added");

        expanAreaModel = false;
        cleanRegionMoel = !cleanRegionMoel;
    } else {
        console.log("暂时没有区域在建，不可拓建")
    }
    cleanDetectedList();
}


//清空待建
function cleanDetectedList() {
    detectedHexList.length = 0
    updateDetectedHexListView();
}

function createRegionTool(hexesList = detectedHexList) {
    let hasRegion = hexesList.some(hex => hex.type === "属地");

    if (!hasRegion) {
        Region.createRegionClick(hexesList);
        alert("已建造区域");
        detectedHexList.length = 0;
        isExpandArea = false;
    } else {
        alert("列表中存在归属区域格子，请先清空")
    }
}

function updateDetectedHexListView() {
    let detectedContainer = document.getElementById('detectedHexListContainer');
    if (!detectedContainer) {
        detectedContainer = document.createElement('div');
        detectedContainer.id = 'detectedHexListContainer';
        document.getElementById('statusDisplay').appendChild(detectedContainer);
    }

    // 添加样式类
    detectedContainer.classList.add('detected-container');

    // 清空现有的内容
    detectedContainer.innerHTML = '';

    // 添加元素数量显示
    const countElement = document.createElement('div');
    countElement.classList.add('count-element');
    countElement.innerHTML = `<strong>待建格子:</strong> 
                                ${detectedHexList.length} / ${brushMap[selectedBrush].threshold} 
                                <br>笔刷模式 ${isExpandArea ? "可拓展" : '建造'} 
                                <br>区域拓张模式 ${expanAreaModel ? '是': "否"}`;
    detectedContainer.appendChild(countElement);

    // 添加每个元素的 ID 显示
    detectedHexList.forEach(hex => {
        const hexElement = document.createElement('div');
        hexElement.textContent = `${hex.id} `;
        hexElement.classList.add('hex-element');
        detectedContainer.appendChild(hexElement);
    });
}
//TEST: 测试一下会诱发什么情况，现在封堵删除和相等的时候造成的弹窗
let previousDetectedHexCount = 0;


function showBuildRegionPrompt() {
    const currentCount = detectedHexList.length;
    if ([6, 9, 12].includes(detectedHexList.length) && (currentCount > previousDetectedHexCount) ) {
        toggleCustomPrompt(true, '是否建立区域？', () => {
            Region.createRegion();
            hexGrid.updateAllRegions();
            updateRegionCards();
            updateDetectedHexListView();
        });
    } else {
        toggleCustomPrompt(false);
    }
    previousDetectedHexCount = currentCount;
}


//通用弹窗样式
function toggleCustomPrompt(show = true, textContent = '是否执行操作？', confirmCallback = null) {
    const existingPrompt = document.getElementById('customPrompt');

    if (!show && existingPrompt) {
        document.body.removeChild(existingPrompt);
        customPromptShown = false;
        return;
    }

    if (show && customPromptShown) {
        return;
    }

    if (show) {
        const promptElement = document.createElement('div');
        promptElement.id = 'customPrompt';
        promptElement.classList.add('custom-prompt');

        const text = document.createElement('span');
        text.textContent = textContent;
        promptElement.appendChild(text);

        const buttonContainer = document.createElement('div');
        buttonContainer.classList.add('button-container');

        const confirmButton = document.createElement('button');
        confirmButton.textContent = '✔';
        confirmButton.classList.add('confirm-button');
        confirmButton.addEventListener('click', () => {
            if (confirmCallback) {
                confirmCallback();

            }
            document.body.removeChild(promptElement);
            customPromptShown = false;
        });
        buttonContainer.appendChild(confirmButton);

        const cancelButton = document.createElement('button');
        cancelButton.textContent = '✖';
        cancelButton.classList.add('cancel-button');
        cancelButton.addEventListener('click', () => {
            document.body.removeChild(promptElement);
            customPromptShown = false;
        });
        buttonContainer.appendChild(cancelButton);

        promptElement.appendChild(buttonContainer);
        document.body.appendChild(promptElement);
        customPromptShown = true;
    }
}


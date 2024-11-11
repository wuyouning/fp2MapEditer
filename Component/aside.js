import { SliderToggleButton } from "../Component/buttonComponent.js";
import { MainStyledButton } from "../Component/buttonComponent.js";
import { Region } from "../main/modules/Region.js";
import {initRegionsCard } from "../Component/regionInfoCard.js"
import { saveModelView } from "./saveModelView.js";
import { selectedBrush } from "../main/module.js";

export class AsideCard {
    constructor(brush, layers, hexGrid) {
        this.brush = brush;
        this.layers = layers;
        this.title = '施工面板';
        this.hexGrid = hexGrid;
        this.brushModeButton = null;
    }

    initCard() {
        const asideCard = document.getElementById('asideCard');
        // 设置卡片的整体点击事件
        asideCard.addEventListener('click', () => this.updateBrushInfo());
        // 创建卡片的标题
        const titleElement = document.createElement('h1');
        titleElement.textContent = this.title;

        // 创建状态显示栏内容
        const statusElement = document.createElement('div');

        
        // 将标题和状态内容添加到 asideCard 中
        asideCard.appendChild(titleElement);
        asideCard.appendChild(statusElement);

        const brushModeButton = new SliderToggleButton(
            'asideCard',
            '选择工具模式',
            '',
            false,
            () => this.handleBrushModelToggle(brushModeButton)
        )
        this.brushModeButton = brushModeButton;
        const autoBuildRegionMode = new SliderToggleButton(
            'asideCard',
            '自动建区模式',
            '',
            true,
            () => this.handleAutoBuildRegioToggle(autoBuildRegionMode)
        )

        const gridBtnContainer = document.createElement("div");
        gridBtnContainer.classList.add("main-button-container")
        asideCard.appendChild(gridBtnContainer);

        const saveHexGridButton = new MainStyledButton(
            gridBtnContainer,
            "保存规划",
            () => { saveModelView.show(); },
            
        );

        const cleanHexGridButton = new MainStyledButton(
            gridBtnContainer,
            "清除画布",
            () => { 
                this.layers.clearAllLayers(); 
                this.hexGrid.cleanGrid(this.brush);
                initRegionsCard(this.hexGrid);
            },
            
        );


        const pedingBtnContainer = document.createElement("div");
        pedingBtnContainer.classList.add("main-button-container")
        asideCard.appendChild(pedingBtnContainer);

        const buildRegionBtn = new MainStyledButton(
            pedingBtnContainer,
            "建造区域",
            () => { Region.createRegion(this.hexGrid, this.brush ) },
            
        );

        const cleanPedingHexes = new MainStyledButton(
            pedingBtnContainer,
            "清除待建",
            () => { this.brush.pedingHexes.clear(); },
            
        );

        //画布名称追踪
        const hexGridName = document.createElement('p');
        hexGridName.id = 'hexGridName-aside'
        hexGridName.textContent = `现在的画布： ${this.hexGrid.name}`;
        asideCard.appendChild(hexGridName);

        const brushTextTitle = document.createElement("p");
        brushTextTitle.textContent = "待建格子"
        brushTextTitle.style.fontSize = "16px";
        asideCard.appendChild(brushTextTitle);

        const brushTextContent = document.createElement("div");
        brushTextContent.classList.add("brush-text-content");
        asideCard.appendChild(brushTextContent);
        
        const brushType = document.createElement("p");
        brushType.textContent = this.brush.name;
        brushType.style.fontSize = "12px";
        brushTextContent.appendChild(brushType);

        const pendingHexesCount = document.createElement("p");
        pendingHexesCount.textContent = `${this.brush.pendingHexesCount} / ${this.brush.threshold}`;
        pendingHexesCount.style.fontSize = "14px";
        brushTextContent.appendChild(pendingHexesCount);

        const pedingHexesContent = document.createElement("div");
        pedingHexesContent.classList.add("pedinghexes-content")
        asideCard.appendChild(pedingHexesContent);

        const pedingHexesList = document.createElement("div");
        pedingHexesList.classList.add("pedinghexes-list");
        pedingHexesContent.appendChild(pedingHexesList);

        const pedingHexesTypeList = document.createElement("div");
        pedingHexesTypeList.classList.add("pedinghexes-type-list");
        pedingHexesContent.appendChild(pedingHexesTypeList);

        this.updateBrushInfo();

    }

    // 更新刷子信息的显示
    updateBrushInfo() {
        const asideCard = document.getElementById('asideCard');
        
        const brushType = asideCard.querySelector("p:nth-child(1)");  // 获取待建格子数量所在的 <p>
        if (brushType) {
            brushType.textContent = this.brush.name;
        }
        // 更新待建格子的数量
        const pendingHexesCount = asideCard.querySelector("p:nth-child(2)");  // 获取待建格子数量所在的 <p>
        if (pendingHexesCount) {
            pendingHexesCount.textContent = `${this.brush.pendingHexesCount} / ${this.brush.threshold}`;
        }

        // 更新待建格子列表
        const pedingHexesList = asideCard.querySelector(".pedinghexes-list");
        const pedingHexesTypeList = asideCard.querySelector(".pedinghexes-type-list");
        if (pedingHexesList) {
            // 清空列表
            pedingHexesList.innerHTML = '';
            pedingHexesTypeList.innerHTML = '';
            // 遍历并将每个元素添加到列表中
            this.brush.pedingHexes.forEach(item => {
                const p = document.createElement("p");
                p.textContent = item.id;  // 设置元素文本为 Set 中的值
                pedingHexesList.appendChild(p);  // 将新的 p 元素添加到列表中

                const t = document.createElement("p");
                t.textContent = item.regionBelond || '无';
                pedingHexesTypeList.appendChild(t);
            });
        }

        const hexGridName = document.getElementById('hexGridName-aside');
        hexGridName.textContent = this.hexGrid.name;
    }

    handleBrushModelToggle(brushModeButton) {
        const toggleState = brushModeButton.getToggleState();
    
        // 设置 selectedBrush.autoBuildRegion 为按钮状态
        selectedBrush.selectMode = toggleState;
    }

    handleAutoBuildRegioToggle(autoBuildRegionMode) {
        // 获取自动建区模式按钮的当前状态
        const toggleState = autoBuildRegionMode.getToggleState();
    
        // 设置 selectedBrush.autoBuildRegion 为按钮状态
        selectedBrush.autoBuildRegion = toggleState;
    }


}





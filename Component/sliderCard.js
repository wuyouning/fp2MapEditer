import { brushMap } from "../main/module.js";
import { createSquareColorButton } from "../Component/buttonComponent.js";
import { SliderToggleButton } from "../Component/buttonComponent.js";
import { CustomSlider } from "../Component/buttonComponent.js";
import { asideCard } from "../index.js";
import { initRegionsCard } from "../Component/regionInfoCard.js"
import { initAnnouncementCard } from "../Component/AnnouncementCard.js";
import { userinfoView } from "./userinfoView.js";

class SliderCard {
    constructor(cardID, cardWidth) {
        this.cardID = cardID; // 卡片 ID
        this.cardWidth = cardWidth; // 卡片宽度
        this.cardElement = this.createCard(); // 创建卡片元素
    }

    createCard() {
        const card = document.createElement('div');
        card.className = 'sliderCard';
        card.id = this.cardID;
        card.style.width = this.cardWidth;
        // card.innerText = this.cardID; // 设置卡片的文本内容，可以根据需求修改
        return card;
    }

    appendTo(parent) {
        parent.appendChild(this.cardElement); // 将卡片添加到指定的父元素
    }
}

export function initializeSliderCard(mainView) {
    const sliderGroup = document.getElementById('sliderGroup');

    const CardsData = [
        {
            id: 'brushToolCard',
            width: '350px'
        },
        {
            id: 'regionsCard',
            width: '450px'
        },
        {
            id: 'superSumCard',
            width: '350px'
        },
        {
            id: 'announcement',
            width: '350px'
        },
        {
            id: 'publicCard',
            width: '89.5%'
        },
        {
            id: 'privateCard',
            width: '90%'
        },
        {
            id: 'loginCard',
            width: '380px'
        },
        {
            id: 'infoCard',
            width: '350px'
        },
        {   
            id: 'testDashboard',
            width: 'calc(100% - var(--navbar-width))'
        },
    ];

    CardsData.forEach(cardsData => {
        const card = new SliderCard(
            cardsData.id,
            cardsData.width
        );
        // sliderGroup.appendChild(card);
        card.appendTo(sliderGroup);
    });

    initalzeBrushToolCard(mainView.selectedBrush, mainView.hexGrid, mainView.layers);
    initRegionsCard(mainView.hexGrid);
    initAnnouncementCard();
    userinfoView.init();
    userinfoView.updateInfoArea();

}

function initalzeBrushToolCard(selectedBrush, hexGrid, layers) {
    // 创建外层容器
    const brushToolCard = document.getElementById('brushToolCard');
    const container = document.createElement('div');
    container.className = 'brush-tool-container'; // 使用样式类

    let rows = [5, 4, 4, 4, 1];
    let brushKeys = Object.keys(brushMap);
    let currentIndex = 0;
    
    function clickSelectedBrush(key) {
        if (selectedBrush.name !== key) {
            selectedBrush.name = key;
            asideCard.updateBrushInfo();
        }
    }

    rows.forEach(rowCount => {
        const rowContainer = document.createElement('div');
        rowContainer.className = 'brush-row-container'; // 使用样式类

        for (let i = 0; i < rowCount; i++) {
            if (currentIndex >= brushKeys.length) break;

            const key = brushKeys[currentIndex];
            const button = brushMap[key];
            const buttonWrapper = document.createElement('div');
            buttonWrapper.className = 'brush-button-wrapper'; // 使用样式类

            const btnElement = createSquareColorButton(button, key, selectedBrush.name, clickSelectedBrush);
            buttonWrapper.appendChild(btnElement);

            // 标签
            const labelElement = document.createElement('div');
            labelElement.className = 'brush-color-name';
            labelElement.textContent = key;
            buttonWrapper.appendChild(labelElement);

            rowContainer.appendChild(buttonWrapper);
            currentIndex++;
        }

        container.appendChild(rowContainer);
    });

    // 将生成的内容添加到 brushToolCard 中
    brushToolCard.appendChild(container);

    // 直接实例化 SliderToggleButton
    try {
        new SliderToggleButton(
            "brushToolCard",  
            "隐藏坐标",      
            "显示坐标",      
            hexGrid.showID,                     
            hexGrid.setShowID.bind(hexGrid)
        );
    } catch (error) {
        console.error(error);
    }

    try {
        new SliderToggleButton(
            "brushToolCard",  
            "关闭标签",      
            "显示标签",      
            hexGrid.showLabel,                      
            hexGrid.setShowLabel.bind(hexGrid)
        );
    } catch (error) {
        console.error(error);
    }

    try {
        new SliderToggleButton(
            "brushToolCard",          
            "平顶布局",            
            "尖顶布局",            
            hexGrid.layout.orientation.name === 'pointy',  // 初始状态是否为尖顶
            (isOn) => {
                // 根据按钮状态调用 setLayout
                const layoutType = isOn ? 'pointy' : 'flat';
                hexGrid.setLayout(layoutType);
            }
        );
    } catch (error) {
        console.error(error);
    }


    try {
        hexGrid.hexSizeSlider = new CustomSlider(
            "brushToolCard",   // 容器ID
            "格子尺寸:",      // 文字说明
            24,                   // 最小值
            80,                   // 最大值
            40,                   // 初始值
            1,                    // 步长
            (value) => {          // 值变化的回调函数
                hexGrid.setHexSize(value);
            }
        );
    } catch (error) {
        console.error(error);
    }

    try {
        hexGrid.maxRadiusSlider = new CustomSlider(
            "brushToolCard",   // 容器ID
            "最大半径:",      // 文字说明
            1,                   // 最小值
            36,                   // 最大值
            6,                   // 初始值
            1,                    // 步长
            (value) => {          // 值变化的回调函数
                hexGrid.setMaxRadius(value);
            }
        );
    } catch (error) {
        console.error(error);
    }
}



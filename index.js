import { createNavbarButton } from "./Component/buttonComponent.js";
import { MainView } from "./main/module.js";
import { initializeSliderCard } from "./Component/sliderCard.js";
import { initalzeBrushToolCard } from "./Component/sliderCard.js";

// let layers; //画布组
let mainView;
initializeNavBarButtons(); //创建左侧按钮

//其他内容区域创建完毕后，再创建画布区域
// document.addEventListener('DOMContentLoaded', () => {
//     // layers = initializeCanvasLayers();
//     mainView = new MainView();
//     initializeSliderCard();
//     initalzeBrushToolCard(mainView.selectedBrush, mainView.hexGrid, mainView.layers);

// });

mainView = new MainView();
initializeSliderCard();
initalzeBrushToolCard(mainView.selectedBrush, mainView.hexGrid, mainView.layers);

function initializeNavBarButtons() {
    const navBar = document.getElementById('navBar');

    const buttonsData = [
        {
            id: 'brushToolButton',
            cardId: 'brushToolCard',
            iconSrc: '/images/刷子-亮.png',
            altText: '冰汽时代地图编辑器 - 笔刷工具',
            buttonText: '笔刷工具',
        },
        {
            id: 'regionButton',
            cardId: 'regionsCard',
            iconSrc: '/images/数据表-亮.png',
            altText: '冰汽时代地图规划 - 区域数据图标',
            buttonText: '区域数据',
        },
        {
            id: 'toggleButton',
            cardId: 'Announcement',
            iconSrc: '/images/提示说明.png',
            altText: '冰汽时代地图编辑器 - 关于与支持图标',
            buttonText: '学院公告',
        },
        {
            id: 'publicHexGridsButton',
            cardId: 'publicCard',
            iconSrc: '/images/画廊模式.png',
            altText: '冰汽时代地图编辑器 - 公共规划',
            buttonText: '规划广场',
        },
        {
            id: 'PrivateHexGridsButton',
            cardId: 'privateCard',
            iconSrc: '/images/作品.png',
            altText: '冰汽时代地图编辑器 - 我的规划',
            buttonText: '我的规划',
            isVisible: false,
        },
        {
            id: 'loginButton',
            cardId: 'loginCard',
            iconSrc: '/images/我的.png',
            altText: '冰汽时代地图编辑器 - 登录按钮',
            buttonText: '登录',
        },
        {
            id: 'infoButton',
            cardId: 'infoCard',
            iconSrc: '/images/我的.png',
            altText: '冰汽时代地图编辑器 - 个人信息',
            buttonText: '个人信息',
            isVisible: false,
        },
    ];

    buttonsData.forEach(buttonData => {
        const button = createNavbarButton(
            buttonData.id,
            buttonData.cardId,
            buttonData.iconSrc,
            buttonData.altText,
            buttonData.buttonText,
            buttonData.isVisible
        );
        navBar.appendChild(button);
    });
}







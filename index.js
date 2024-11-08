import { createNavbarButton } from "./Component/buttonComponent.js";
import { MainView } from "./main/main.js";
import { initializeSliderCard } from "./Component/sliderCard.js";
import { initalzeBrushToolCard } from "./Component/sliderCard.js";
import { AsideCard } from "./Component/aside.js";
import { TestDashboardView } from "./TESTdashboard.js"
import { initRegionsCard } from "./Component/regionInfoCard.js"
import { initAnnouncementCard } from "./Component/AnnouncementCard.js";

// let layers; //画布组
export let mainView;
initializeNavBarButtons(); //创建左侧按钮
mainView = new MainView();
initializeSliderCard();
initalzeBrushToolCard(mainView.selectedBrush, mainView.hexGrid, mainView.layers);
export let asideCard = new AsideCard(mainView.selectedBrush, mainView.layers, mainView.hexGrid);
asideCard.initCard();
export let testDashboardView = new TestDashboardView(mainView);
initRegionsCard(mainView.hexGrid);
initAnnouncementCard();
centerbutton(mainView);
window.onload = () => {
    mainView.updateCanvasOrigin(); // 设置绘制原点在画布中心
    mainView.scrollToCenter(); // 确保视窗显示在绘制原点位置
};

window.onresize = () => {
    if (mainView) {
        mainView.scrollToCenter(); // 当窗口调整大小时，保持画布的原点居中
    }
};

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
            cardId: 'announcement',
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
        {
            id: 'testDashbutton',
            cardId: 'testDashboard',
            iconSrc: '/images/我的.png',
            altText: '冰汽时代地图编辑器 - 测试',
            buttonText: '测试信息',
            isVisible: true,
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

function centerbutton(mainView) {
    const centerButton = document.getElementById('back-center-button');
    centerButton.classList.add('back-center-button');
    centerButton.innerText = '返回原点';

    centerButton.addEventListener('click', () => {
        console.log("回城按钮被按");
        mainView.scrollToCenter();
        centerButton.classList.remove('activated');
        console.log("回城完毕");

    });

}






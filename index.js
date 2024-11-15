import { initializeNavBarButtons } from "./Component/navbar.js";
import { MainView } from "./main/main.js";
import { initializeSliderCard } from "./Component/sliderCard.js";
import { AsideCard } from "./Component/aside.js";
import { TestDashboardView } from "./TESTdashboard.js"
import { userLoginView } from "./Component/loginView.js"
import { saveModelView } from "./Component/saveModelView.js";
import { LoadingSpinner } from "./Component/loadingSpinner.js";
import { hexGrid } from "./main/module.js";
import { SuperSumCard } from "./Component/superSumCard.js";
//画布组
export let mainView;

initializeNavBarButtons(); //创建左侧按钮
mainView = new MainView();

//初始化导航按钮对应的卡片们
initializeSliderCard(mainView);

//初始化施工面板
export let asideCard = new AsideCard(mainView.selectedBrush, mainView.layers, mainView.hexGrid);
asideCard.initCard();

//测试面板
export let testDashboardView = new TestDashboardView(mainView);

// 返回中心

export const superSumCard = new SuperSumCard(hexGrid);


//窗口调整会被拉回画布中心
window.onload = () => {
    mainView.updateCanvasOrigin(); // 设置绘制原点在画布中心
    mainView.scrollToCenter(); // 确保视窗显示在绘制原点位置

    hexGrid.initializeHexGrid();
    superSumCard.regions = hexGrid.regions;
    superSumCard.hubs = hexGrid.hubs;
    superSumCard.updateCard();

};

window.onresize = () => {
    if (mainView) {
        mainView.scrollToCenter(); // 当窗口调整大小时，保持画布的原点居中
    }
};

export const apiUrl = 'http://127.0.0.1:3000/api';

//用户弹窗
userLoginView.toggleVisibility();
saveModelView.create();
saveModelView.hide();

// 创建加载指示器实例
export const loadingSpinner = new LoadingSpinner();
// 将加载指示器元素添加到页面中
document.body.appendChild(loadingSpinner.getElement());

import { Popup } from "./Component/loadingSpinner.js";
export const popup = new Popup();
// popup.show("爱你哦",'progress',0,'default')







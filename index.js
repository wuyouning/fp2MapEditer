import { initializeNavBarButtons } from "./Component/navbar.js";
import { MainView } from "./main/main.js";
import { initializeSliderCard } from "./Component/sliderCard.js";
import { AsideCard } from "./Component/aside.js";
import { TestDashboardView } from "./TESTdashboard.js"
import { userLoginView } from "./Component/loginView.js"
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
centerbutton(mainView);

//窗口调整会被拉回画布中心
window.onload = () => {
    mainView.updateCanvasOrigin(); // 设置绘制原点在画布中心
    mainView.scrollToCenter(); // 确保视窗显示在绘制原点位置
};

window.onresize = () => {
    if (mainView) {
        mainView.scrollToCenter(); // 当窗口调整大小时，保持画布的原点居中
    }
};



//用户弹窗
userLoginView.toggleVisibility();


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






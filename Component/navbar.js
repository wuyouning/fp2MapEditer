import { createNavbarButton } from "./buttonComponent.js";
import { userLoginView } from "../Component/loginView.js";
import { hexGridGalley } from "./publicHexGridsView.js";
export function initializeNavBarButtons() {
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
            id: 'superSumButton',
            cardId: 'superSumCard',
            iconSrc: '/images/抽象计算.png',
            altText: '冰汽时代地图编辑器 - 抽象计算',
            buttonText: '抽象数据',
            isVisible: true,
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

        // 为 loginButton 单独指定点击事件
        if (buttonData.id === 'loginButton') {
            button.onclick = () => userLoginView.showToggle(); // 使用 userLoginView.init() 代替默认行为
        }

        if (buttonData.id === 'publicHexGridsButton') {
            const originalOnClick = button.onclick;
            // 增加新的行为
            button.onclick = function (event) {
                // 如果有原始的事件处理程序，先执行它
                if (originalOnClick) {
                    originalOnClick.call(button, event);
                }
                hexGridGalley.initPublic();
            };
        }

        if (buttonData.id === 'PrivateHexGridsButton') {
            const originalOnClick = button.onclick;
            // 增加新的行为
            button.onclick = function (event) {
                // 如果有原始的事件处理程序，先执行它
                if (originalOnClick) {
                    originalOnClick.call(button, event);
                }
                hexGridGalley.initPrivate();
            };
        }

        navBar.appendChild(button);
    });
}


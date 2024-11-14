import { layers } from "../Component/canvasLayer.js";
import { asideCard } from "../index.js";
import { selectedBrush } from "./module.js";
import { Point } from "./modules/Hex.js";
import { hexGrid } from "./module.js";
import { Popup } from "../Component/loadingSpinner.js";
import { Region } from "./modules/Region.js";
import { RegionInfoCard } from "../Component/regionInfoCard.js";
import { HubCard } from "../Component/regionInfoCard.js";
import { initRegionsCard } from "../Component/regionInfoCard.js";
export class MainView {
    constructor () {
        // 初始化选中的笔刷
        this.selectedBrush = selectedBrush;
        this.isPromptShow = false;

        this.layers = layers; // 初始化层
        if (!this.layers) {
            throw new Error('Failed to initialize layers');
        }

        this.hexGrid = hexGrid;
        this.hexGrid.drawHexagons();

        // 绑定事件监听器
        this.addCanvasListeners();

        // 添加左键拖动逻辑
        this.addLeftClickDragScroller();

        this.canvas = this.layers.getLayer('colorLayer').canvas;
        this.ctx = this.layers.getLayer('colorLayer').getContext(); // 使用 getContext() 获取上下文

        this.IdCanvas = this.layers.getLayer('idLayer').canvas;
        this.IdCtx = this.layers.getLayer('idLayer').getContext(); // 使用 getContext() 获取上下文

        this.labelCanvas = this.layers.getLayer('labelLayer').canvas;
        this.labelCtx = this.layers.getLayer('labelLayer').getContext();

        this.edgeCanvas = this.layers.getLayer('edgeLayer').canvas;
        this.edgeCtx = this.layers.getLayer('edgeLayer').getContext();

        this.highlightCanvas = this.layers.getLayer('highlightLayer').canvas;
        this.highlightCtx = this.layers.getLayer('highlightLayer').getContext();

        this.infoCard = null;
        
        this.blandClick = 0;
    }

    updateCanvasOrigin() {
        const canvas = this.layers.getLayer('colorLayer').canvas;
        this.hexGrid.layout.origin = new Point(canvas.width / 2, canvas.height / 2);
    }
    
    scrollToCenter() {
        const container = this.layers.container;
        const canvas = this.layers.getLayer('colorLayer').canvas;

        // 确保容器内的滚动条能滚动至画布的中心
        container.scrollLeft = (canvas.width / 2) - (container.clientWidth / 2);
        container.scrollTop = (canvas.height / 2) - (container.clientHeight / 2);

    }

    //按住拉动屏幕
    addLeftClickDragScroller() {
        const container = this.layers.container;

        // 定义拖动状态
        let isLeftMouseDown = false;
        let startX = 0;
        let startY = 0;
        let dragStartTime = null; // 拖动开始时间

        // 获取当前画布的偏移量
        let currentOffsetX = parseInt(container.style.left, 10) || 0;
        let currentOffsetY = parseInt(container.style.top, 10) || 0;

        // 监听鼠标按下事件
        container.addEventListener('mousedown', (event) => {
            if (event.button === 0) {
                isLeftMouseDown = true;

                // 记录鼠标按下时的位置
                startX = event.clientX;
                startY = event.clientY;

                // 获取当前画布的偏移量
                currentOffsetX = parseInt(this.layers.getLayer('colorLayer').canvas.style.left, 10) || 0;
                currentOffsetY = parseInt(this.layers.getLayer('colorLayer').canvas.style.top, 10) || 0;

                // 记录拖动开始时间
                dragStartTime = Date.now();

                document.body.style.cursor = 'grabbing'; // 鼠标变为小手
            }
        });

        // 监听鼠标移动事件
        window.addEventListener('mousemove', (event) => {
            if (isLeftMouseDown) {
                // 计算拖动的距离增量
                const deltaX = event.clientX - startX;
                const deltaY = event.clientY - startY;

                // 更新偏移量，基于当前偏移量加上增量
                const newOffsetX = currentOffsetX + deltaX;
                const newOffsetY = currentOffsetY + deltaY;

                // 设置所有层的偏移
                this.layers.setLayersOffset(newOffsetX, newOffsetY);
            }
        });

        // 监听鼠标释放事件
        window.addEventListener('mouseup', (event) => {
            if (event.button === 0) {
                isLeftMouseDown = false;
                document.body.style.cursor = 'default'; // 恢复默认光标


            }
        });

        // 取消默认的右键菜单事件
        container.addEventListener('contextmenu', (event) => {
            event.preventDefault();
        });
    }

    addCanvasListeners() {
        const canvas = this.layers.getLayer('colorLayer').canvas; // 获取 colorLayer 的画布
        let hexGrid = this.hexGrid;

        canvas.addEventListener('mousedown', (event) => {
            if (event.button === 0) {
                // 记录鼠标按下的位置，用于计算是否拖动
                this.mouseDownX = event.clientX;
                this.mouseDownY = event.clientY;
                this.isDragging = false; // 初始化为没有拖动
            }
        });

        //悬浮效果
        canvas.addEventListener('mousemove', (event) => {
            const rect = canvas.getBoundingClientRect();
            const mouseX = event.clientX - rect.left;
            const mouseY = event.clientY - rect.top;
            const hexId = hexGrid.getHexIdFromMouse(mouseX, mouseY);
            const highlightCtx = this.highlightCtx;

            // 获取当前悬停的格子
            const hoveredHex = hexGrid.getHexById(hexId);
            highlightCtx.clearRect(0, 0, canvas.width, canvas.height);

            if (!hoveredHex) {
                return;
            }
            if (selectedBrush.selectMode && hoveredHex.type === '属地') {
                this.highlightRegion(hoveredHex, highlightCtx, 10, 4);
            } else {
                hoveredHex.drawHoverHex(highlightCtx, highlightCtx, hexGrid.layout, 0.5);
            }
            // 如果鼠标移动距离超过阈值，标记为拖动
            const deltaX = event.clientX - this.mouseDownX;
            const deltaY = event.clientY - this.mouseDownY;
            if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
                this.isDragging = true;
            }
        });

        canvas.addEventListener('mouseup', (event) => {
            if (event.button === 0 && !this.isDragging) {
                // 如果没有发生拖动，则认为是点击
                const rect = canvas.getBoundingClientRect();
                const mouseX = event.clientX - rect.left;
                const mouseY = event.clientY - rect.top;
                const hexId = hexGrid.getHexIdFromMouse(mouseX, mouseY);
                const hex = hexGrid.getHexById(hexId);

                if (selectedBrush.selectMode) {
                    this.showInfoCard(hex);
                    console.log('我现在点了多少次空格', this.blandClick)
                    if(hex.type === '空白'){
                        console.log('点到空白了',hex.id)
                        this.blandClick ++;
                    }
                    if (this.blandClick > 3) {
                        this.showAlertPopup();
                        console.log('开窗提醒', this.blandClick);
                    }
                } else {
                    if (hex) {
                        hex.setBrush(this.selectedBrush, hexGrid);
                        // 仅重绘这个被单击的 Hex
                        hex.drawHex(this.hexGrid);
                    } else {
                        alert('点格子框架外了哦');
                    }
                }
                asideCard.updateBrushInfo();
                hexGrid.saveLocal();

                //自动模式监测
                
                if (this.selectedBrush.autoBuildRegion) {
                    this.showBuildRegionPopup();
                }

                //存储本地

            }
            this.isDragging = false; // 重置拖动状态
        });
    }

    showBuildRegionPopup() {
        const count = selectedBrush.pedingHexes.size;
    
        // 初始化 lastCount，如果没有定义则为 0
        const lastCount = selectedBrush.lastCount || 0;
    
        // 创建 popup 实例，如果尚未存在
        if (!this.popup) {
            this.popup = new Popup();
        }
        //   很麻烦
    
        // 检查是否为逐个增加的情况 新建区域 
        if ([6, 9, 12].includes(count) && count === lastCount + 1) {
            this.popup.show(
                '到达建造数,是否建造区域',
                'info',
                0,
                '建造',
                () => {
                    Region.createRegion(this.hexGrid, selectedBrush);
                    asideCard.updateBrushInfo();
                    initRegionsCard(hexGrid);
                }
            );
        } else {
            // 不符合条件时，确保弹窗已关闭
            if (this.popup.popup.style.display !== 'none' && this.blandClick !== 3) {
                console.log('关闭popup', this.blandClick);
                this.popup.close();
            }
        }
        if (this.blandClick === 3 ) {
            this.blandClick = 0;
        } 
        // 更新 lastCount
        selectedBrush.lastCount = count;
    }
    
    showAlertPopup() {
        const popup = new Popup();
        
        popup.show(
            '你是否想要上色，请切换掉选择模式',
            'warnning',
            0,
            '是的',
            () => {
                selectedBrush.selectMode = false;
                asideCard.updateBrushInfo();
            }
        )
        
    }

    highlightRegion(hex, ctx, hexline, edgeline) {
        const region = [...hexGrid.regions].find(r => r.name === hex.regionBelond);
        if (region) {
            // 遍历区域内所有的格子，进行高亮和边缘绘制
            region.hexes.forEach(hex => {
                if (hex) {
                    // 高亮区域内的格子
                    hex.drawHoverHex(ctx, ctx, hexGrid.layout, hexline);
                    // 绘制格子的边缘
                    hex.drawHexEdges(ctx, hexGrid.layout, edgeline, [5, 5]);
                }
            });
        }
    }

    showInfoCard(hex) {
        // 如果 infoCard 已存在，先清空内容，再更新信息
        if (this.infoCard) {
            this.infoCard.innerHTML = '';
        } else {
            // 如果 infoCard 不存在，则创建一个新的 div
            this.infoCard = document.createElement('div');
            this.infoCard.classList.add('main-info-card'); // 添加样式类名
            document.getElementById('main').appendChild(this.infoCard);
        }
        const region = [...hexGrid.regions].find(r => r.name === hex.regionBelond);
        // 根据传入的 hex 更新信息卡片内容
        if (hex.type === '属地') {
            const infoArea = new RegionInfoCard(region, this.infoCard);
            infoArea.updateCard();
        } else if (hex.type === '枢纽') {
            const infoArea = new HubCard(hex, this.infoCard);
            infoArea.updateCard();
            console.log('无法建立枢纽卡片')
        } else {
            this.infoCard.style.display = 'none';
            return;
        }

        // 创建并添加按钮
        const buttonArea = document.createElement('div');
        buttonArea.classList.add('showInfo-button-area'); // 添加样式类名

        const expandBtn = document.createElement('button');
        expandBtn.textContent = "拓展区域";
        expandBtn.addEventListener('click', () => {
            asideCard.brushModeButton.toggle();
            selectedBrush.expandMode(region);
            asideCard.updateBrushInfo();
           this.infoCard.style.display = 'none';
        });

        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = "拆除区域";
        deleteBtn.addEventListener('click', () => {
            region.cleanRegion(false, hexGrid);
            selectedBrush.pedingHexes.clear();
            asideCard.updateBrushInfo();
            this.infoCard.style.display = 'none';
        });

        const closeBtn = document.createElement('button');
        closeBtn.textContent = "关闭";
        closeBtn.addEventListener('click', () => {
            this.infoCard.style.display = 'none'; // 隐藏信息卡片
        });

        if ( hex.type === '属地') {
            buttonArea.append(expandBtn, deleteBtn, closeBtn);
        } else {
            buttonArea.append(closeBtn);
        }
        this.infoCard.appendChild(buttonArea);

            // 获取原点位置
        const origin = this.hexGrid.layout.origin;

        // 计算 hex 的像素坐标
        const hexPosition = hex.hexToPixel(this.hexGrid.layout);

        // 计算偏移量，将 infoCard 定位在 hex 的上方
        const offsetX = hexPosition.x - origin.x;
        const offsetY = hexPosition.y - origin.y - (this.infoCard.offsetHeight / 2); // 上方 10 像素的间距

        // 设置 infoCard 的位置
        this.infoCard.style.position = 'absolute';
        this.infoCard.style.left = `${origin.x + offsetX}px`;
        this.infoCard.style.top = `${origin.y + offsetY}px`;

        // 确保信息卡片可见
        this.infoCard.style.display = 'block';
    }

}
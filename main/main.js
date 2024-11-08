import { CanvasLayersManager } from "../Component/canvasLayer.js";

import { asideCard } from "../index.js";
import { Brush } from "./module.js";
import { HexGrid } from "./module.js";
import { Point } from "./modules/Hex.js";
export class MainView {
    constructor () {
        // 初始化选中的笔刷
        this.selectedBrush = new Brush('居住区');
        this.isPromptShow = false;

        this.layers = new CanvasLayersManager('main'); // 初始化层
        if (!this.layers) {
            throw new Error('Failed to initialize layers');
        }

        this.hexGrid = new HexGrid(this.layers);
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
    }


    updateCanvasOrigin() {
        const canvas = this.layers.getLayer('colorLayer').canvas;
        this.hexGrid.layout.origin = new Point(canvas.width / 2, canvas.height / 2);
    }

    
    scrollToCenter() {
        const container = this.layers.container;
        const canvas = this.layers.getLayer('colorLayer').canvas;
        console.log("回城按钮执行中");
        // 确保容器内的滚动条能滚动至画布的中心
        container.scrollLeft = (canvas.width / 2) - (container.clientWidth / 2);
        container.scrollTop = (canvas.height / 2) - (container.clientHeight / 2);
        console.log("回城执行结束");

    }

    //按住拉动屏幕
    addLeftClickDragScroller() {
        const container = this.layers.container;

        // 定义拖动状态
        let isLeftMouseDown = false;
        let startX = 0;
        let startY = 0;
        let dragCount = 0; // 拖动次数计数器
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

                    // 计算拖拽的时长
                const dragDuration = Date.now() - dragStartTime;

                // 更新拖动次数计数器
                dragCount++;
                const centerButton = document.getElementById('back-center-button');
                // // 如果拖动时间超过 5 秒或拖动次数超过 3 次，激活按钮效果
                if (dragDuration > 30000 || dragCount >= 9) {
                    centerButton.classList.add('activated');
                    dragCount = 0;
                    setTimeout(() => {
                        centerButton.classList.remove('activated');
                    }, 8000);
                }
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

        canvas.addEventListener('mousemove', (event) => {
            const rect = canvas.getBoundingClientRect();
            const mouseX = event.clientX - rect.left;
            const mouseY = event.clientY - rect.top;
            const hexId = hexGrid.getHexIdFromMouse(mouseX, mouseY);
            const highlightCtx = this.highlightCtx;

            // 获取当前悬停的格子
            const hoveredHex = hexGrid.getHexById(hexId);
            highlightCtx.clearRect(0, 0, canvas.width, canvas.height);

            if (hoveredHex) {
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

                if (hex) {
                    hex.setBrush(this.selectedBrush, hexGrid);
                    // 仅重绘这个被单击的 Hex
                    hex.drawHex(this.hexGrid);
                    asideCard.updateBrushInfo();
                } else {
                    alert('点格子框架外了哦');
                }
            }
            this.isDragging = false; // 重置拖动状态
        });
    }
}
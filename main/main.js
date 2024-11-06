import { CanvasLayersManager } from "../Component/canvasLayer.js";

import { asideCard } from "../index.js";
import { Brush } from "./module.js";
import { HexGrid } from "./module.js";
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

        this.canvas = this.layers.getLayer('colorLayer').canvas;
        this.ctx = this.layers.getLayer('colorLayer').getContext(); // 使用 getContext() 获取上下文
        
        this.IdCanvas = this.layers.getLayer('idLayer').canvas;
        this.IdCtx = this.layers.getLayer('idLayer').getContext(); // 使用 getContext() 获取上下文
        
        this.labelCanvas = this.layers.getLayer('labelLayer').canvas;
        this.labelCtx = this.layers.getLayer('labelLayer').getContext();
        
        this.edgeCanvas = this.layers.getLayer('edgeLayer').canvas;
        this.edgeCtx = this.layers.getLayer('edgeLayer').getContext();

    }

    initializeLayers() {
        return initializeCanvasLayers();
    }

    addCanvasListeners() {
        const canvas = this.layers.getLayer('colorLayer').canvas;; // 获取 colorLayer 的画布
        let hexGrid = this.hexGrid;

        canvas.addEventListener('click', (event) => {
            const rect = canvas.getBoundingClientRect();
            const mouseX = event.clientX - rect.left;
            const mouseY = event.clientY - rect.top;
            const hexId = hexGrid.getHexIdFromMouse(mouseX, mouseY);
            const hex = hexGrid.getHexById(hexId);
            
            if (hex) {
                console.log('修改前的数值' ,hex)
                hex.setBrush(this.selectedBrush, hexGrid);
                // 仅重绘这个被单击的 Hex
                hex.drawHex(this.hexGrid);
                console.log('修改后的数值' ,hex)
                asideCard.updateBrushInfo();
            } else {
                alert('点开格子框架外了哦')
            }

        });
    }

}
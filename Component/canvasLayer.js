class CanvasLayer {
    constructor(id, zIndex, width, height, container, pointerEvents = 'none') {
        this.canvas = document.createElement('canvas');
        this.canvas.id = id;
        this.canvas.width = width;
        this.canvas.height = height;
        this.canvas.style.position = 'absolute';
        this.canvas.style.zIndex = zIndex;
        this.canvas.style.pointerEvents = pointerEvents; // 使用传入的参数
        this.context = this.canvas.getContext('2d');


        container.appendChild(this.canvas);

        // 保存初始宽高
        this.initialWidth = width;
        this.initialHeight = height;

        // 绑定事件处理
        this.isDrawing = false;
        this.lastX = 0;
        this.lastY = 0;

        this.canvas.addEventListener('mousedown', this.startDrawing.bind(this));
        this.canvas.addEventListener('mousemove', this.draw.bind(this));
        this.canvas.addEventListener('mouseup', this.stopDrawing.bind(this));
        this.canvas.addEventListener('mouseout', this.stopDrawing.bind(this));
    }

    getContext() {
        return this.context;
    }

    startDrawing(event) {
        this.isDrawing = true;
        const { offsetX, offsetY } = event;
        this.lastX = offsetX;
        this.lastY = offsetY;
    }

    draw(event) {
        if (!this.isDrawing) return;

        const { offsetX, offsetY } = event;

        // 动态扩展 canvas 尺寸
        this.resizeCanvas(offsetX, offsetY);

        // 绘制线条
        this.context.beginPath();
        this.context.moveTo(this.lastX, this.lastY);
        this.context.lineTo(offsetX, offsetY);
        this.context.stroke();
        this.lastX = offsetX;
        this.lastY = offsetY;
    }

    stopDrawing() {
        this.isDrawing = false;
    }

    resizeCanvas(newX, newY) {
        const padding = 50; // 边距缓冲区，用户接近边界时扩展

        const isNearRightEdge = newX >= this.canvas.width - padding;
        const isNearBottomEdge = newY >= this.canvas.height - padding;

        if (isNearRightEdge || isNearBottomEdge) {
            let newWidth = this.canvas.width;
            let newHeight = this.canvas.height;

            if (isNearRightEdge) newWidth += this.initialWidth;
            if (isNearBottomEdge) newHeight += this.initialHeight;

            if (newWidth !== this.canvas.width || newHeight !== this.canvas.height) {
                const tempCanvas = document.createElement('canvas');
                tempCanvas.width = newWidth;
                tempCanvas.height = newHeight;
                tempCanvas.getContext('2d').drawImage(this.canvas, 0, 0);

                this.canvas.width = newWidth;
                this.canvas.height = newHeight;
                this.context.drawImage(tempCanvas, 0, 0);
            }
        }
    }

    clear() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    draw(callback, options = {}) {
        if (typeof callback === 'function') {
            this.context.save();  // 保存当前状态
            callback(this.context, options);
            this.context.restore(); // 还原之前保存的状态
        }
    }
}

//五个画布
function initializeCanvasLayers() {
    const mainContainer = document.getElementById('main');
    if (!mainContainer) {
        console.error('main container not found');
        return;
    }
    const width = mainContainer.clientWidth;
    const height = mainContainer.clientHeight;
    
    const baseZIndex = parseInt(window.getComputedStyle(mainContainer).zIndex, 10) || 0;



    const layersConfig = [
        { id: 'colorLayer', zIndex: baseZIndex + 1, pointerEvents: 'auto' }, // 允许交互
        { id: 'contrastLayer', zIndex: baseZIndex + 2, pointerEvents: 'none' },  
        { id: 'idLayer', zIndex: baseZIndex + 3, pointerEvents: 'none' },        
        { id: 'labelLayer', zIndex: baseZIndex + 4, pointerEvents: 'none' },
        { id: 'edgeLayer', zIndex: baseZIndex + 5, pointerEvents: 'none' },          
        { id: 'highlightLayer', zIndex: baseZIndex + 6, pointerEvents: 'none' },
    ];

    const layers = {};

    layersConfig.forEach(({ id, zIndex, pointerEvents }) => {
        layers[id] = new CanvasLayer(id, zIndex, width, height, mainContainer, pointerEvents);
    });

    return layers;
}

export class CanvasLayersManager {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            console.error('Container not found');
            return;
        }
        
        this.width = this.container.clientWidth;
        this.height = this.container.clientHeight;
        this.baseZIndex = parseInt(window.getComputedStyle(this.container).zIndex, 10) || 0;

        this.layers = {};
        this.initializeLayers();
    }

    initializeLayers() {
        const layersConfig = [
            { id: 'colorLayer', zIndex: this.baseZIndex + 1, pointerEvents: 'auto' }, // 允许交互
            { id: 'contrastLayer', zIndex: this.baseZIndex + 2, pointerEvents: 'none' },  
            { id: 'idLayer', zIndex: this.baseZIndex + 3, pointerEvents: 'none' },        
            { id: 'labelLayer', zIndex: this.baseZIndex + 4, pointerEvents: 'none' },
            { id: 'edgeLayer', zIndex: this.baseZIndex + 5, pointerEvents: 'none' },          
            { id: 'highlightLayer', zIndex: this.baseZIndex + 6, pointerEvents: 'none' },
        ];

        layersConfig.forEach(({ id, zIndex, pointerEvents }) => {
            this.layers[id] = new CanvasLayer(id, zIndex, this.width, this.height, this.container, pointerEvents);
        });
    }

    getLayer(id) {
        return this.layers[id] || null;
    }

    resizeLayers() {
        this.width = this.container.clientWidth;
        this.height = this.container.clientHeight;
        Object.values(this.layers).forEach(layer => {
            layer.resize(this.width, this.height);
        });
    }

    clearLayer(id) {
        const layer = this.getLayer(id);
        if (layer) {
            layer.clear();
        }
    }

    clearAllLayers() {
        Object.values(this.layers).forEach(layer => {
            layer.clear();
        });
    }
}
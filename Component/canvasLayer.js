class CanvasLayer {
    constructor(id, zIndex, width, height, container, pointerEvents = 'none') {
        this.canvas = document.createElement('canvas');
        this.canvas.id = id;
        this.canvas.width = width * 3; // 初始化为容器宽度的两倍
        this.canvas.height = height * 3; // 初始化为容器高度的两倍
        this.canvas.style.position = 'absolute';
        this.canvas.style.zIndex = zIndex;
        this.canvas.style.pointerEvents = pointerEvents;
        this.context = this.canvas.getContext('2d');

        // 初始化位置为0
        this.offsetX = 0;
        this.offsetY = 0;

        container.appendChild(this.canvas);
    }

    getContext() {
        return this.context;
    }

    setOffset(x, y) {
        // 用于更新画布位置的偏移，直接修改 left 和 top
        this.offsetX = x;
        this.offsetY = y;
        this.canvas.style.left = `${this.offsetX}px`;
        this.canvas.style.top = `${this.offsetY}px`;
    }

    clear() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
}



//五个画布

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
            const layer = new CanvasLayer(id, zIndex, this.width, this.height, this.container, pointerEvents);
            this.layers[id] = layer;
        });
    }

    getLayer(id) {
        return this.layers[id] || null;
    }

    setContainerOffset(x, y) {
        // 直接设置容器的偏移，应用到所有层
        this.container.style.left = `${x}px`;
        this.container.style.top = `${y}px`;
    }

    resizeAllLayers(newWidth, newHeight) {
        this.width = newWidth;
        this.height = newHeight;

        Object.values(this.layers).forEach(layer => {
            layer.canvas.width = newWidth;
            layer.canvas.height = newHeight;

            // 如果需要重新绘制，确保内容不会丢失，可以在这里实现
            // layer.context.drawImage(原始内容);
        });

        // 同时更新容器的大小
        this.container.style.width = `${newWidth}px`;
        this.container.style.height = `${newHeight}px`;
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

    setLayersOffset(x, y) {
        // 设置所有层的偏移量
        Object.values(this.layers).forEach(layer => {
            layer.setOffset(x, y);
        });
    }
}

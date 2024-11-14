import { Hex } from "./modules/Hex.js";
import { Point } from "./modules/Hex.js";
import { layers } from "../Component/canvasLayer.js";
import { userLoginView } from "../Component/loginView.js";
import { saveModelView } from "../Component/saveModelView.js";
import { Region } from "./modules/Region.js";
import { asideCard } from "../index.js";
// import { Popup } from "../Component/loadingSpinner.js";
import { initRegionsCard } from "../Component/regionInfoCard.js";
import { handleBrushSelection } from "../Component/buttonComponent.js";

export const brushMap = {
    '居住区': {
        color: 'rgb(118, 190, 186)',
        borderColor: 'rgb(198, 255, 215)',
        icon: '🏠',
        threshold: 12,
        type: '自由',
        fontColor: 'black'
    },
    '食品区': {
        color: 'rgb(120, 146, 107)',
        borderColor: 'rgb(200, 230, 195)',
        icon: '🍽️',
        threshold: 9,
        type: '自由',
        fontColor: 'white'
    },
    '开采区': {
        color: 'rgb(214, 201, 175)',
        borderColor: 'rgb(230, 250, 220)',
        icon: '⛏️',
        threshold: 9,
        type: '自由',
        fontColor: 'black'
    },
    '工业区': {
        color: 'rgb(169, 125, 134)',
        borderColor: 'rgb(220, 210, 200)',
        icon: '🏭',
        threshold: 9,
        type: '自由',
        fontColor: 'white'
    },
    '后勤区': {
        color: 'rgb(124, 192, 216)',
        borderColor: 'rgb(204, 252, 255)',
        icon: '🚚',
        threshold: 9,
        type: '自由',
        fontColor: 'black'
    },
    '供热枢纽': {
        color: 'rgb(204, 102, 0)',
        icon: '🔥',
        threshold: 1,
        type: '枢纽',
        allowArea: ['开采区', '工业区', '食品区', '后勤区', '居住区'],
        effect: '热能增加',
        effectValue: 40,
        fontColor: 'white'
    },
    '维护枢纽': {
        color: 'rgb(80, 80, 80)',
        icon: '🔧',
        threshold: 1,
        type: '枢纽',
        allowArea: ['开采区', '工业区', '食品区', '后勤区', '居住区'],
        effect: '材料需求',
        effectValue: 40,
        fontColor: 'white'
    },
    '铁路枢纽': {
        color: 'rgb(99, 71, 54)',
        icon: '🚂',
        threshold: 1,
        type: '枢纽',
        allowArea: ['开采区', '工业区', '食品区'],
        effect: '效率提升',
        effectValue: 15,
        fontColor: 'white'
    },
    '交通枢纽': {
        color: 'rgb(173, 216, 230)',
        icon: '✈️',
        threshold: 1,
        type: '枢纽',
        allowArea: ['开采区', '工业区', '食品区', '后勤区', '居住区'],
        effect: '劳动力需求',
        effectValue: 0.15,
        fontColor: 'black'
    },
    '监控中心': {
        color: 'rgb(183, 128, 154)',
        icon: '📹',
        threshold: 1,
        type: '枢纽',
        allowArea: ['居住区'],
        effect: '犯罪下降',
        effectValue: 2,
        fontColor: 'white'
    },
    '医疗中心': {
        color: 'rgb(255, 188, 202)',
        icon: '🚑',
        threshold: 1,
        type: '枢纽',
        allowArea: ['居住区'],
        effect: '医疗上升',
        effectValue: 2,
        fontColor: 'black'
    },
    '交流中心': {
        color: 'rgb(87, 131, 141)',
        icon: '💬',
        threshold: 1,
        type: '枢纽',
        allowArea: ['居住区'],
        effect: '信任上升',
        effectValue: 2,
        fontColor: 'white'
    },
    '格斗中心': {
        color: 'rgb(165, 42, 42)',
        icon: '🥊',
        threshold: 1,
        type: '枢纽',
        allowArea: ['居住区'],
        effect: '紧张下降',
        effectValue: 2,
        fontColor: 'white'
    },
    '燃料储备': {
        color: 'rgb(246, 210, 90)',
        icon: '⛽',
        threshold: 1,
        type: '枢纽',
        allowArea: ['开采区'],
        effect: '劳动力需求',
        effectValue: 0.10,
        fontColor: 'black'
    },
    '材料储备': {
        color: 'rgb(160, 82, 45)',
        icon: '📦',
        threshold: 1,
        type: '枢纽',
        allowArea: ['开采区', '工业区'],
        effect: '劳动力需求',
        effectValue: 0.10,
        fontColor: 'white'
    },
    '商品储备': {
        color: 'rgb(78, 94, 69)',
        icon: '🏷️',
        threshold: 1,
        type: '枢纽',
        allowArea: ['工业区'],
        effect: '劳动力需求',
        effectValue: 0.10,
        fontColor: 'white'
    },
    '食物储备': {
        color: 'rgb(141, 147, 100)',
        icon: '🥫',
        threshold: 1,
        type: '枢纽',
        allowArea: ['食品区'],
        effect: '劳动力需求',
        effectValue: 0.10,
        fontColor: 'black'
    },
    '擦除': {
        color: '#ecf1fe',
        icon: '🗑️',
        threshold: 0,
        type: '空白',
        fontColor: 'black'
    }
}


class Brush {
    constructor(name, autoBuildRegion = true, selectMode = false) {
        this._name = name; // 使用私有变量存储name
        this.autoBuildRegion = autoBuildRegion;
        this.selectMode = selectMode;
        this.pedingHexes = new Set();
        this.model = '笔刷';
        this.pedingRegion = null;
        this.lastCount = 0;
    }

    // 动态获取名称
    get name() {
        return this._name;
    }

    // 设置新名称并更新其他属性
    set name(newName) {
        this._name = newName;
        this.isExpandRegion = false;
        this.pedingHexes.clear();
        this.pedingRegion = null;
        this.previousListCoust = 0;
        //TODO: 更新笔刷状况栏
    }

    // 动态获取
    get color() {
        return brushMap[this._name]?.color || 'white';
    }

    get borderColor() {
        return brushMap[this._name]?.borderColor || 'white';
    }

    get threshold() {
        return this.autoBuildRegion ? (brushMap[this._name]?.threshold || 999) : 999;
    }

    get type() {
        return brushMap[this._name]?.type || '空白';
    }

    get allowArea() {
        return brushMap[this._name]?.allowArea || [];
    }

    get effect() {
        return brushMap[this._name]?.effect || null;
    }

    get effectValue() {
        return brushMap[this._name]?.effectValue || 0;
    }

    get pendingHexesCount() {
        return this.pedingHexes.size;
    }

    //相连比对
    isNeighborOfPendingHexes(hex, hexGrid) {
        // 遍历 pedingHexes 中的每一个格子，判断传入的 hex 是否与它们相邻
        for (let pendingHex of this.pedingHexes) {
            let neighbors = pendingHex.getOneRing(hexGrid); // 获取待建格子的一环内邻居
            for (let neighbor of neighbors) {
                if (neighbor.q === hex.q && neighbor.r === hex.r && neighbor.s === hex.s) {
                    return true; // 传入的 hex 是 pedingHexes 中某格子的一环内邻居
                }
            }
        }
        return false; // 传入的 hex 与 pedingHexes 中的所有格子都不相邻
    }

    joinPedingHexes(hex, hexGrid) {
        // 检查当前待建格子数量是否小于阈值，且 hex 是否是邻居
        if (this.pendingHexesCount < this.threshold && this.isNeighborOfPendingHexes(hex, hexGrid)) {
            this.pedingHexes.add(hex); // 在满足条件时，添加 hex
        } else {
            if (this.autoBuildRegion) {
                this.pedingHexes.clear(); // 自动构建区域时清空
            }
            this.pedingHexes.add(hex); // 添加新 hex
        }
    }

    removeHexFromPending(hex) {
        // 检查并删除 this.pedingHexes 中与传入 hex.id 相同的元素
        this.pedingHexes = new Set([...this.pedingHexes].filter(pendingHex => pendingHex.id !== hex.id));
    }

    expandMode(region) {
        this.name = region.type;
    
        region.hexes.forEach(hex => {
            this.pedingHexes.add(hex);
        });
        this.selectMode = false;
        asideCard.updateBrushInfo();
    
        // 使用 data-key 来找到对应的按钮
        const buttonElement = document.querySelector(`.square-button[data-key="${region.type}"]`);
        console.log('笔刷元素:', buttonElement);
    
        // 如果找到对应的按钮元素，则调用 handleBrushSelection
        if (buttonElement) {
            handleBrushSelection(buttonElement, region.type, key => {
                this.name = key;
                asideCard.updateBrushInfo();
            });
        } else {
            console.error(`未找到与类型 "${region.type}" 匹配的按钮`);
        }
    }


}

export class HexGrid {
    constructor(hexSize = 45, maxRadius = 6, showID = true, showLabel = true) {
        this.layers = layers;
        this.hexes = new Set(); //新建后的格子存储
        this.regions = new Set(); //存储区域
        this.hubs = new Set(); //存储枢纽
        this.hexSize = hexSize;
        this.maxRadius = maxRadius;
        this.showID = showID;
        this.showLabel = showLabel;
        this.layoutPointy = {
            name: `pointy`,
            f0: Math.sqrt(3.0),
            f1: Math.sqrt(3.0) / 2.0,
            f2: 0.0,
            f3: 3.0 / 2.0,
            b0: Math.sqrt(3.0) / 3.0,
            b1: -1.0 / 3.0,
            b2: 0.0,
            b3: 2.0 / 3.0,
            start_angle: 0.5
        };
        this.layoutFlat = {
            name: 'flat',
            f0: 3.0 / 2.0,
            f1: 0.0,
            f2: Math.sqrt(3.0) / 2.0,
            f3: Math.sqrt(3.0),
            b0: 2.0 / 3.0,
            b1: 0.0,
            b2: -1.0 / 3.0,
            b3: Math.sqrt(3.0) / 3.0,
            start_angle: 0.0
        };

        this.canvas = this.layers.getLayer('colorLayer').canvas;
        this.ctx = this.layers.getLayer('colorLayer').getContext(); // 使用 getContext() 获取上下文

        this.IdCanvas = this.layers.getLayer('idLayer').canvas;
        this.IdCtx = this.layers.getLayer('idLayer').getContext(); // 使用 getContext() 获取上下文

        this.labelCanvas = this.layers.getLayer('labelLayer').canvas;
        this.labelCtx = this.layers.getLayer('labelLayer').getContext();

        this.edgeCanvas = this.layers.getLayer('edgeLayer').canvas;
        this.edgeCtx = this.layers.getLayer('edgeLayer').getContext();

        this.layout = {
            orientation: this.layoutPointy,
            size: new Point(this.hexSize, this.hexSize),
            origin: new Point(this.canvas.width / 2, this.canvas.height / 2)
        };
        this.isShowLabel = true;

        //画布的名称描述
        this.name = "规划师的得意之作"; // 画布名称
        this.description = ""; // 描述
        this.isPublic = false; // 是否公开
        this.ownerId = '';
        this.hexgrid_id = '';
    }

    //基础操作
    addHex(hex) {
        this.hexes.add(hex);
    }

    getHexById(id) {
        for (let hex of this.hexes) {
            if (hex.id === id) {
                return hex;
            }
        }
        return null; // 如果没有找到，返回 null
    }

    // 通过鼠标点击位置获取格子 ID
    getHexIdFromMouse(mouseX, mouseY) {
        const { q, r } = this.pixelToHex(mouseX, mouseY);
        const s = -q - r;
        const roundedHex = this.hexRound(q, r, s);
        return `${roundedHex.q}_${roundedHex.r}_${roundedHex.s}`;
    }
    // 将像素坐标转换为六边形坐标
    pixelToHex(x, y) {


        const { b0, b1, b2, b3 } = this.layout.orientation; // 使用 b0, b1, b2, b3 进行转换
        const { x: sx, y: sy } = this.layout.size;
        const { x: ox, y: oy } = this.layout.origin;

        // 计算中心位置的偏移
        const px = (x - ox) / sx;
        const py = (y - oy) / sy;

        // 根据六边形的尖顶或平顶布局进行坐标转换
        const q = b0 * px + b1 * py;
        const r = b2 * px + b3 * py;
        const s = -q - r;


        return { q, r, s };
    }
    // 对浮点数坐标进行四舍五入，得到最近的六边形格子
    hexRound(q, r, s) {
        let roundedQ = Math.round(q);
        let roundedR = Math.round(r);
        let roundedS = Math.round(s);

        const qDiff = Math.abs(roundedQ - q);
        const rDiff = Math.abs(roundedR - r);
        const sDiff = Math.abs(roundedS - s);

        if (qDiff > rDiff && qDiff > sDiff) {
            roundedQ = -roundedR - roundedS;
        } else if (rDiff > sDiff) {
            roundedR = -roundedQ - roundedS;
        } else {
            roundedS = -roundedQ - roundedR;
        }

        return new Hex(roundedQ, roundedR, roundedS);
    }

    setLayout(type) {
        if (type === 'pointy') {
            this.layout.orientation = this.layoutPointy;
        } else if (type === 'flat') {
            this.layout.orientation = this.layoutFlat;
        }
        this.drawHexagons();
    }

    setHexSize(size) {
        this.hexSize = size;
        this.layout.size = new Point(this.hexSize, this.hexSize);
        this.drawHexagons();

    }

    setMaxRadius(radius) {
        this.maxRadius = radius;
        this.drawHexagons();
    }

    setShowID(showID) {
        this.showID = showID;
        // 显示画布
        if (!this.IdCanvas) {
            console.error("IdCanvas is undefined");
            return;
        }
        if (showID) {
            this.IdCanvas.classList.remove("hidden");
            this.IdCanvas.classList.add("visible");
            this.drawHexagons();
        } else {
            this.IdCanvas.classList.remove("visible");
            this.IdCanvas.classList.add("hidden");
        }
    }

    setShowLabel(showLabel) {
        this.showLabel = showLabel;
        if (!this.labelCanvas) {
            return;
        }
        if (showLabel) {
            this.labelCanvas.classList.remove("hidden");
            this.labelCanvas.classList.add("visible");
            this.drawHexagons();

        } else {
            this.labelCanvas.classList.remove("visible");
            this.labelCanvas.classList.add("hidden");
        }
    }
    //比较暴力的解决方案,看看日后有没有机会再完善吧
    regionEdgeRedraw() {
        this.edgeCtx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        for (const hex of this.hexes) {
            if (hex.type === '属地') {
                hex.drawHexEdges(this.edgeCtx, this.layout);
            }
        }
    }

    generateHexagons(center, maxRadius) {
        const hexagons = [];
        for (let radius = 0; radius <= maxRadius; radius++) {
            if (radius === 0) {
                hexagons.push(center);
            } else {
                let hex = center.add(Hex.directions[4].scale(radius));
                for (let i = 0; i < 6; i++) {
                    for (let j = 0; j < radius; j++) {
                        hexagons.push(hex);
                        hex = hex.neighbor(i);
                    }
                }
            }
        }
        return hexagons;
    }

    // 移除指定名称的区域
    removeRegionByName(regionName) {
        for (let region of this.regions) {
            if (region.name === regionName) {
                this.regions.delete(region); // 使用 delete 方法从 Set 中移除
                break; // 找到后即可退出循环
            }
        }
        //TODO: 是否要在这里完成统计表的更新
    }

    removeHubById(hubId) {
        for (let hub of this.hubs) {
            if (hub.id === hubId) {
                this.hubs.delete(hub); // 使用 delete 方法从 Set 中移除
                break; // 找到后退出循环
            }
        }
        //TODO: 是否要在这里完成统计表的更新
    }

    // 绘制主程 可以解拆下，能够节省下性能
    drawHexagons() {
        const centerHex = new Hex(0, 0, 0);
        const hexagons = this.generateHexagons(centerHex, this.maxRadius);

        // 清除画布
        this.initCtx();

        // 绘制所有格子并添加到 hexGrid
        for (const hexCoords of hexagons) {
            const existingHex = this.getHexById(`${hexCoords.q}_${hexCoords.r}_${hexCoords.s}`);

            if (existingHex) {
                // 传大小递数值进去，不然字体会收到影响
                existingHex.size = this.hexSize;
                // 如果六边形已经存在，则保留它的属性
                existingHex.drawHex(this);
            } else {
                // 如果是新的六边形，则创建一个新的 Hex 实例
                const newHex = new Hex(hexCoords.q, hexCoords.r, hexCoords.s, '擦除', null, "空白", this.hexSize);
                newHex.drawHex(this);
                this.addHex(newHex);
            }
        }

        if (this.regions.size > 0) {
            this.updateAllRegionsLabels();
        }
    }

    cleanGrid() {
        const centerHex = new Hex(0, 0, 0);
        this.initData();
        selectedBrush.pedingHexes.clear();
        const hexagons = this.generateHexagons(centerHex, this.maxRadius);

        for (const hexCoords of hexagons) {
            // 如果是新的六边形，则创建一个新的 Hex 实例
            const newHex = new Hex(hexCoords.q, hexCoords.r, hexCoords.s, '擦除', null, "空白", this.hexSize);
            newHex.drawHex(this);
            this.addHex(newHex);
        }
        // updateRegionCards();
    }

    initMe() {
        this.initData();
        this.initCtx();
    }

    initData() {
        this.hubs.clear();
        this.regions.clear();
        this.hexes.clear();
    }

    initCtx() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.IdCtx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.labelCtx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.edgeCtx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }


    orgazationHexes(hexList) {
        const regionMap = {};
        const hubMap = [];

        // 创建新的 Set 以替代对象存储六边形
        hexGrid.hexes = new Set();

        hexList.forEach(hex => {
            // 将 hex 添加到 hexGrid 的 hexes Set 中
            hexGrid.hexes.add(hex);

            // 仅处理 type 为 '属地' 的六边形
            if (hex.type === '属地') {
                const region = hex.region;

                // 如果 regionMap 中不存在该区域，则初始化一个空数组
                if (!regionMap[region]) {
                    regionMap[region] = [];
                }

                // 将当前六边形添加到相应区域的数组中
                regionMap[region].push(hex);
            }

            // 处理 '枢纽' 类型的六边形
            if (hex.type === '枢纽') {
                hex.hubGetName(hexGrid.hubs, hex.brush);
                hubMap.push(hex);
            }
        });

        // 遍历每个区域的 hexesList 并创建 Region 实例
        for (const region in regionMap) {
            const hexesList = regionMap[region];

            // 创建新的区域并更新
            const newRegion = new Region(hexesList[0].region, hexesList, hexesList[0].brush);
            hexGrid.regions.push(newRegion);
        }

        // 遍历刷新区域
        hubMap.forEach(hex => {
            hex.refresh();
        });
    }

    refreshMe() {
        // this.setShowLabel(this.showLabel);
        // this.setLayout(this.layout);
        // this.setShowID(this.showID);
        this.drawHexagons(); //自带了清空了
        this.updateAllRegions();
        //我有执行吗?
        console.log('我有执行吗')
        this.updateAllRegionsLabels();
    }

    //统计模块
    getStatistics(items, key) {
        const stats = {};
        items.forEach(item => {
            stats[item[key]] = (stats[item[key]] || 0) + 1;
        });
        return stats;
    }

    // 获取相同类型区域的统计信息
    regionStatistics() {
        return this.getStatistics(this.regions, 'type');
    }

    drwaedHexCount() {
        let hexCount = 0;

        this.hexes.forEach((hex) => {
            if (!(hex.brush === '擦除' && hex.type === '空白' && hex.regionBelond === null)) {
                hexCount += 1;
            }
        });
    
        return hexCount;
    }

    // 获取相同类型枢纽的统计信息
    hubsStatistics() {
        return this.getStatistics(this.hubs, 'brush');
    }

    //传导其他区域也改变外反馈和内部效应
    updateAllRegions() {
        this.regions.forEach(region => {
            region.updateRegion();
        });
        this.hubs.forEach(hub => {
            hub.updateEffectedRegions()
        })
    }


    //重整绘制
    updateAllRegionsLabels(ctx = this.labelCtx) {
        // 确保上下文有效
        if (!ctx) {
            console.error("Canvas context is not defined.");
            return;
        }

        // 如果没有区域或者标签不应该显示，则直接返回
        if (this.regions.size === 0 || !this.isShowLabel) {
            return;
        }

        // 如果有区域且标签应该显示，则重绘标签
        this.regions.forEach(region => {
            region.drawRegionLabel(ctx);
        });
    }

    /*
    * 数据库交互
    */
    //更新名称、描述和公开性
    async updateProperties(edit = false) {
        const spellNameInput = document.getElementById('savemodel-titleEdit');
        const descriptionInput = document.getElementById('saveModel-desp');
        const hexgrid_id = this.hexgrid_id;

        // 确保元素存在后再获取值，避免空引用错误
        if (spellNameInput) {
            this.name = spellNameInput.value.trim(); // 去除前后空格
        }
        if (descriptionInput) {
            this.description = descriptionInput.value.trim(); // 去除前后空格
        }

        // 如果是编辑模式且存在 hexGridId，则调用更新描述的方法
        if (edit && hexgrid_id) {
            await this.updateDescription(hexgrid_id);
        }
    }

    get myOwnerId() {
        return localStorage.getItem('uuid');
    }

    async updateDescription(hexgrid_id, ownerId = this.myOwnerId) {
        try {
            const response = await this.sendRequest('PUT', 'update-hexgrid', {
                hexgrid_id,
                name: this.name,
                ownerId,
                description: this.description,
                isPublic: this.isPublic
            });

            if (response.ok) {
                saveModelView.showError('更新成功', true);

            } else {
                const result = await response.json();
                saveModelView.showError(`更新时出错：${result.message}`);
            }
        } catch (error) {
            saveModelView.showError(`更新规划图时出错：${error}`);
        }
    }


    async save(isNew = false) {
        try {
            // 更新属性并保存 HexGrid
            await this.updateProperties();
            const ownerId = this.myOwnerId;

            if (!ownerId) {
                saveModelView.showError('无法保存数据: 找不到本地存储的用户ID (UUID)');
                userLoginView.showToggle();
                return;
            }

            // 根据 isNew 决定请求类型和处理逻辑
            let endpoint = isNew ? 'save-hexgrid' : 'update-hexgrid';
            let method = isNew ? 'POST' : 'PUT';

            // 创建请求体
            let requestBody = {
                ownerId,
                name: this.name,
                hexSize: this.hexSize,
                maxRadius: this.maxRadius,
                description: this.description,
                isPublic: this.isPublic
            };

            // 如果不是新建操作，则需要包含 hexgrid_id
            if (!isNew && this.hexgrid_id) {
                requestBody.hexgrid_id = this.hexgrid_id;
            }

            // 发出请求
            const response = await this.sendRequest(method, endpoint, requestBody);

            if (response.ok) {
                const result = await response.json();
                if (isNew) {
                    const hexgrid_id = result.hexgrid_id;
                    this.hexgrid_id = hexgrid_id;
                    localStorage.setItem('isNewGrid', false);
                    this.updateLocalStorageInfo(this.name, this.description, hexgrid_id);
                    // 保存所有 Hexes 到新的 HexGrid
                    await this.saveHexes(hexgrid_id);
                    saveModelView.showError('成功另存为！！', true);
                    console.log('HexGrid 数据另存为成功')
                } else {
                    this.updateLocalStorageInfo(this.name, this.description, this.hexgrid_id);
                    saveModelView.showError('HexGrid 数据更新成功', true);
                }
            } else {
                const result = await response.json();
                saveModelView.showError(`保存时出错：${result.message}`);
            }
            return true;
        } catch (error) {
            saveModelView.showError(`保存 HexGrid 和 Hex 数据时出错：${error}`);
            return false;
        }
    }


    async saveHexes(hexgrid_id) {
        try {
            for (const hex of this.hexes) {
                // 排除 brush 为 "擦除" 的格子
                if (hex.brush === '擦除') {
                    continue;
                }
                const hexResponse = await this.sendRequest('POST', 'save-hex', {
                    hexgrid_id: hexgrid_id,
                    q: hex.q,
                    r: hex.r,
                    s: hex.s,
                    brush: hex.brush,
                    region: hex.regionBelond,
                    type: hex.type
                });
                if (!hexResponse.ok) {
                    const hexError = await hexResponse.json();
                    saveModelView.showError(`保存单个 Hex 数据时出错：${hexError.message}`);
                    return;
                }
            }

            saveModelView.showError('所有 hex 数据保存成功');
        } catch (error) {
            saveModelView.showError(`保存 Hex 数据时出错：${error}`);
        }
    }

    async sendRequest(method, endpoint, body) {
        // console.log('床送的数据:', method, endpoint, body); // 用于调试
        const response = await fetch(`http://127.0.0.1:3000/api/${endpoint}`, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });
        return response;
    }

    async fetchUUID() {
        try {
            const response = await fetch('http://localhost:3000/api/generate-uuid', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('无法获取 UUID');
            }

            const data = await response.json();
            const uuid = data.uuid;
            console.log('生成的 UUID:', uuid);

            return uuid; // 返回生成的 UUID
        } catch (error) {
            console.error('获取 UUID 时出错:', error);
            return null; // 失败时返回 null 或您想要的默认值
        }
    }
    //本地交互
    async createHexGrid() {
        const newHexGridid = await this.fetchUUID();
        this.hexgrid_id = newHexGridid;

        this.ownerId = localStorage.getItem('uuid')
        this.cleanGrid();
        console.log('我在运行新建了啦',this.hexgrid_id)
        this.drawHexagons();

        localStorage.removeItem('hexgrid_data');
        localStorage.removeItem('hexes_data');
        localStorage.setItem('isNewGrid', true);
    }

    async initializeHexGrid() {
        const isLoaded = this.loadFromLocalStorage();
        if (!isLoaded) {
            // 如果加载失败或本地无数据，创建新的画布
            await this.createHexGrid();
        }

    }

    async saveToLocalStorage() {
        try {
            // 1. 保存画布信息
            const hexGridData = {
                name: this.name,
                description: this.description,
                // isPublic: hexGrid.isPublic,
                ownerId: this.ownerId,
                hexgrid_id: this.hexgrid_id,
                hexSize: this.hexSize,
                maxRadius: this.maxRadius,
                createdAt: this.createdAt || new Date().toISOString(),
                lastEditAt: new Date().toISOString(),
            };
            localStorage.setItem('hexgrid_data', JSON.stringify(hexGridData));

            // 2. 保存格子信息
            const hexesData = Array.from(this.hexes).map(hex => ({
                q: hex.q,
                r: hex.r,
                s: hex.s,
                brush: hex.brush,
                regionBelond: hex.regionBelond,
                type: hex.type,
            }));
            localStorage.setItem('hexes_data', JSON.stringify(hexesData));

            // console.log('HexGrid 和 Hexes 数据已成功保存到本地存储。');
        } catch (error) {
            console.error('保存到本地存储时出错:', error);
        }
    }
    // 保存接口
    async saveLocal() {
        await this.saveToLocalStorage();
    }
    async updateLocalStorageInfo(name, description, hexgrid_id) {
        try {
            // 获取当前存储在本地的 hexgrid_data
            const hexGridData = JSON.parse(localStorage.getItem('hexgrid_data')) || {};
    
            // 更新所需的字段
            hexGridData.name = name || hexGridData.name;  // 如果传入 name 则更新，否则保留原来的
            hexGridData.description = description || hexGridData.description;  // 同样的逻辑
            hexGridData.hexgrid_id = hexgrid_id || hexGridData.hexgrid_id;
    
            // 更新 lastEditAt 字段为当前时间
            hexGridData.lastEditAt = new Date().toISOString();
    
            // 保存更新后的对象到本地存储
            localStorage.setItem('hexgrid_data', JSON.stringify(hexGridData));
    
            console.log('HexGrid 数据的 name、description 和 hexgrid_id 已成功更新到本地存储。');
        } catch (error) {
            console.error('更新本地存储信息时出错:', error);
        }
    }
    
    loadFromLocalStorage() {
        try {
            // 1. 加载画布信息
            const hexGridData = localStorage.getItem('hexgrid_data');
            const onwnerID = localStorage.getItem('uuid');
            if (hexGridData) {
                const parsedData = JSON.parse(hexGridData);
                this.name = parsedData.name;
                this.description = parsedData.description;
                this.isPublic = false;
                this.ownerId = parsedData.ownerId;
                //看下是怎么获得才行
                this.hexgrid_id = parsedData.hexgrid_id;
                this.hexSize = parsedData.hexSize;
                this.maxRadius = parsedData.maxRadius;
                this.createdAt = parsedData.createdAt;
                this.lastEditAt = parsedData.lastEditAt;

                console.log('画布信息已成功从本地存储加载。');
            } else {
                console.log('未找到本地存储中的画布信息。');
            }

            // 2. 加载格子信息并组织
            const hexesData = localStorage.getItem('hexes_data');
            if (hexesData) {
                const parsedHexes = JSON.parse(hexesData);
                this.organizeHexes(parsedHexes);
            } else {
                //补充pop
                console.log('未找到本地存储中的格子数据。');
            }

            this.drawHexagons(); // 调用渲染方法，更新视图
            // superSumCard.updateCard();
            return true;
        } catch (error) {
            //TODO：补充pop
            console.error('从本地存储加载数据时出错:', error);
            return false;
        }
    }

    organizeHexes(hexList) {
        // 清空 hexGrid 的 hexes, regions, hubs 等属性
        this.hexes.clear();
        this.regions.clear();
        this.hubs.clear();

        const regionMap = {};
        const hubMap = [];

        hexList.forEach(hexData => {
            const hex = new Hex(hexData.q, hexData.r, hexData.s, hexData.brush, hexData.regionBelond, hexData.type, hexGrid.hexSize);
            this.hexes.add(hex);

            if (hex.type === '属地') {
                const region = hex.regionBelond;

                if (!regionMap[region]) {
                    regionMap[region] = [];
                }
                regionMap[region].push(hex);
            }

            if (hex.type === '枢纽') {
                hex.createHub(this.hubs, hex.brush);
                hubMap.push(hex);
            }
        });

        // 创建和添加 Region 实例
        for (const region in regionMap) {
            const hexesList = regionMap[region];
            const newRegion = new Region(hexesList[0].regionBelond, hexesList, hexesList[0].brush);
            this.regions.add(newRegion);
        }

        // 更新枢纽的影响区域
        hubMap.forEach(hex => {
            hex.updateEffectedRegions();
        });

        initRegionsCard(this); // 更新 UI 中的区域信息
    }

    async clearLocalStorageData() {
        await new Promise(resolve => setTimeout(resolve, 0));
        localStorage.removeItem('hexgrid_data');
    }

    // 回滚方法，重置 HexGrid 的状态
    resetToInitialState() {
        this.clearLocalStorageData();
        this.name = "规划师的得意之作";
        this.description = "";
        this.isPublic = false;
        this.hexSize = 45;
        this.maxRadius = 6;
        this.showID = true;
        this.showLabel = true;
        this.hexes.clear();
        this.regions.clear();
        this.hubs.clear();
        this.drawHexagons();
    }

    //两个滑动条的更新
    updateSliders() {
        if (this.hexSizeSlider) {
            this.hexSizeSlider.updateValue(this.hexSize); // 更新格子尺寸滑动条的值
        }
        if (this.maxRadiusSlider) {
            this.maxRadiusSlider.updateValue(this.maxRadius); // 更新最大半径滑动条的值
        }
    }

}

export let hexGrid = new HexGrid();

export const selectedBrush = new Brush('居住区');






import { Hex } from "./modules/Hex.js";
import { Point } from "./modules/Hex.js";
import { layers } from "../Component/canvasLayer.js";
import { userLoginView } from "../Component/loginView.js";
import { saveModelView } from "../Component/saveModelView.js";
import { Region } from "./modules/Region.js";
import { asideCard } from "../index.js";

export const brushMap = {
    '居住区': {
        color: 'rgb(118, 190, 186)',
        borderColor: 'rgb(198, 255, 215)',
        icon: '🏠',
        threshold: 12,
        type: '自由'
    },
    '食品区': {
        color: 'rgb(120, 146, 107)',
        borderColor: 'rgb(200, 230, 195)',
        icon: '🍽️',
        threshold: 9,
        type: '自由'
    },
    '开采区': {
        color: 'rgb(214, 201, 175)',
        borderColor: 'rgb(230, 250, 220)',
        icon: '⛏️',
        threshold: 9,
        type: '自由'
    },
    '工业区': {
        color: 'rgb(169, 125, 134)',
        borderColor: 'rgb(220, 210, 200)',
        icon: '🏭',
        threshold: 9,
        type: '自由'
    },
    '后勤区': {
        color: 'rgb(124, 192, 216)',
        borderColor: 'rgb(204, 252, 255)',
        icon: '🚚',
        threshold: 9,
        type: '自由'
    },
    '供热枢纽': {
        color: 'rgb(204, 102, 0)', // 暖橙色，和工业区有一定关联性
        icon: '🔥',
        threshold: 1,
        type: '枢纽',
        allowArea: ['开采区', '工业区', '食品区', '后勤区', '居住区'],
        effect: '热能增加',
        effectValue: 40,
    },
    '维护枢纽': {
        color: 'rgb(80, 80, 80)', // 深灰色，代表维护、修理的坚固感
        icon: '🔧',
        threshold: 1,
        type: '枢纽',
        allowArea: ['开采区', '工业区', '食品区', '后勤区', '居住区'],
        effect: '材料需求',
        effectValue: 40,
    },
    '铁路枢纽': {
        color: 'rgb(99, 71, 54)', // 棕色，象征铁轨和土地
        icon: '🚂',
        threshold: 1,
        type: '枢纽',
        allowArea: ['开采区', '工业区', '食品区'],
        effect: '效率提升',
        effectValue: 15,
    },
    '交通枢纽': {
        color: 'rgb(173, 216, 230)', // 浅蓝色，与天空的颜色相呼应
        icon: '✈️',
        threshold: 1,
        type: '枢纽',
        allowArea: ['开采区', '工业区', '食品区', '后勤区', '居住区'],
        effect: '劳动力需求',
        effectValue: 0.15,
    },
    '监控中心': {
        color: 'rgb(183, 128, 154)', // 紫色，代表科技感和神秘
        icon: '📹',
        threshold: 1,
        type: '枢纽',
        allowArea: ['居住区'],
        effect: '犯罪下降',
        effectValue: 2,
    },
    '医疗中心': {
        color: 'rgb(255, 188, 202)', // 红色，代表紧急医疗和紧急服务
        icon: '🚑',
        threshold: 1,
        type: '枢纽',
        allowArea: ['居住区'],
        effect: '医疗上升',
        effectValue: 2,
    },
    '交流中心': {
        color: 'rgb(87, 131, 141)', // 深蓝色，代表沟通和稳定
        icon: '💬',
        threshold: 1,
        type: '枢纽',
        allowArea: ['居住区'],
        effect: '信任上升',
        effectValue: 2,
    },
    '格斗中心': {
        color: 'rgb(165, 42, 42)', // 棕红色，象征力量和对抗
        icon: '🥊',
        threshold: 1,
        type: '枢纽',
        allowArea: ['居住区'],
        effect: '紧张下降',
        effectValue: 2,
    },
    '燃料储备': {
        color: 'rgb(246, 210, 90)', // 橙色，象征燃料和能量
        icon: '⛽',
        threshold: 1,
        type: '枢纽',
        allowArea: ['开采区'],
        effect: '劳动力需求',
        effectValue: 0.10,
    },
    '材料储备': {
        color: 'rgb(160, 82, 45)', // 棕色，代表材料和储存
        icon: '📦',
        threshold: 1,
        type: '枢纽',
        allowArea: ['开采区', '工业区'],
        effect: '劳动力需求',
        effectValue: 0.10,
    },
    '商品储备': {
        color: 'rgb(78, 94, 69)', // 深绿色，象征产品和繁荣
        icon: '🏷️',
        threshold: 1,
        type: '枢纽',
        allowArea: ['工业区'],
        effect: '劳动力需求',
        effectValue: 0.10,
    },
    '食物储备': {
        color: 'rgb(141, 147, 100)', // 金黄色，代表丰收和食物储存
        icon: '🥫',
        threshold: 1,
        type: '枢纽',
        allowArea: ['食品区'],
        effect: '劳动力需求',
        effectValue: 0.10,
    },
    '擦除': {
        color: '#ecf1fe',
        icon: '🗑️',
        threshold: 0,
        type: '空白'
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
        this.pedingHexes.clear();  
        region.hexes.forEach(hex => {
            this.pedingHexes.add(hex);  
        });
        this.selectMode = false;
        asideCard.updateBrushInfo();
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
        this.hexGridid = '';
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
        // this.drawHexagons();
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
        // this.drawHexagons();
        if (!this.labelCanvas) {
            console.error("labelCanvas is undefined");
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

    // 绘制 可以解拆下，能够节省下性能
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

        if (this.regions.size > 1) {
            this.updateAllRegionsLabels();
        }
    }

    cleanGrid(selectedBrush) {
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

    //TODO: 建立一个传导机制在这里

    //重整绘制
    updateAllRegionsLabels(ctx = this.labelCtx) {
        // 确保上下文有效
        if (!ctx) {
            console.error("Canvas context is not defined.");
            return;
        }
    
        // 清空整个画布
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
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
        const hexGridId = localStorage.getItem('hexGridId');

        // 确保元素存在后再获取值，避免空引用错误
        if (spellNameInput) {
            this.name = spellNameInput.value.trim(); // 去除前后空格
        }
        if (descriptionInput) {
            this.description = descriptionInput.value.trim(); // 去除前后空格
        }

        // 如果是编辑模式且存在 hexGridId，则调用更新描述的方法
        if (edit && hexGridId) {
            await this.updateDescription(hexGridId);
        }
    }

    get myOwnerId() {
        return localStorage.getItem('uuid');
    }

    async updateDescription(hexGridId, ownerId = this.myOwnerId) {
        try {
            const response = await this.sendRequest('PUT', 'update-hexgrid', {
                hexGridId,
                name: this.name,
                ownerId,
                description: this.description,
                isPublic: this.isPublic
            });

            if (response.ok) {
                saveModelView.showError('HexGrid 数据更新成功', true);
            } else {
                const result = await response.json();
                saveModelView.showError(`更新 HexGrid 数据时出错：${result.message}`);
            }
        } catch (error) {
            saveModelView.showError(`更新 HexGrid 数据时出错：${error}`);
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

            // 如果不是新建操作，则需要包含 hexGridId
            if (!isNew && this.hexGridid) {
                requestBody.hexGridId = this.hexGridid;
            }

            // 发出请求
            const response = await this.sendRequest(method, endpoint, requestBody);

            if (response.ok) {
                const result = await response.json();
                if (isNew) {
                    saveModelView.showError('HexGrid 数据另存为成功', true);
                    // 从服务器响应中获取新的 hexGridId
                    const hexGridId = result.hexGridId;
                    console.log('请求新建出来的hexGridId是？', hexGridId)
                    // 更新本地存储的 hexGridId
                    localStorage.setItem('hexGridId', hexGridId);
                    this.hexGridid = hexGridId;

                    // 保存所有 Hexes 到新的 HexGrid
                    await this.saveHexes(hexGridId);
                } else {
                    saveModelView.showError('HexGrid 数据更新成功', true);
                }
            } else {
                const result = await response.json();
                saveModelView.showError(`保存 HexGrid 数据时出错：${result.message}`);
            }
            return true;
        } catch (error) {
            saveModelView.showError(`保存 HexGrid 和 Hex 数据时出错：${error}`);
            return false;
        }
    }


    async saveHexes(hexGridId) {
        try {
            for (const hex of this.hexes) {
                // 排除 brush 为 "擦除" 的格子
                if (hex.brush === '擦除') {
                    continue;
                }
                console.log('我是被保存的格子', hex)
                const hexResponse = await this.sendRequest('POST', 'save-hex', {
                    hexgridId: hexGridId,
                    q: hex.q,
                    r: hex.r,
                    s: hex.s,
                    brush: hex.brush,
                    region: hex.regionBelond,
                    type: hex.type
                });
                console.log('我是加工好的传送体',hexResponse)
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
        console.log('床送的数据:', method, endpoint, body); // 用于调试
        const response = await fetch(`http://127.0.0.1:3000/api/${endpoint}`, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });
        return response;
    }

}

export let hexGrid = new HexGrid();
export const selectedBrush = new Brush('居住区');






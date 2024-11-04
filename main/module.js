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
    constructor(name, autoBuildRegion = true, isExpandArea = false) {
        this._name = name; // 使用私有变量存储name
        this.autoBuildRegion = autoBuildRegion;
        this.isExpandArea = isExpandArea;
        this.pedingHexes = new Set();
    }

    // 动态获取名称
    get name() {
        return this._name;
    }

    // 设置新名称并更新其他属性
    set name(newName) {
        this._name = newName;
        this.isExpandArea = false; 
        this.pedingHexes.clear(); 
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

    getPendingHexesCount() {
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
        if (this.getPendingHexesCount() < this.threshold && this.isNeighborOfPendingHexes(hex, hexGrid)) {
            this.pedingHexes.add(hex); // 在满足条件时，添加 hex
        } else {
            if (this.autoBuildRegion) {
                this.pedingHexes.clear(); // 自动构建区域时清空
            }
            this.pedingHexes.add(hex); // 添加新 hex
            this.isExpandArea = false; // 重置 isExpandArea
        }
    }

    removeHexFromPending(hex) {
        // 检查并删除 this.pedingHexes 中与传入 hex.id 相同的元素
        this.pedingHexes = new Set([...this.pedingHexes].filter(pendingHex => pendingHex.id !== hex.id));
    }
    
}

class HexGrid {
    constructor(layers, hexSize = 45, maxRadius = 6, showID = true, showLabel = true) {
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

        this.canvas = this.layers.colorLayer.canvas;
        this.ctx = this.layers.colorLayer.getContext(); // 使用 getContext() 获取上下文
        
        this.IdCanvas = this.layers.idLayer.canvas;
        this.IdCtx = this.layers.idLayer.getContext(); // 使用 getContext() 获取上下文
        
        this.labelCanvas = this.layers.labelLayer.canvas;
        this.labelCtx = this.layers.labelLayer.getContext(); // 使用 getContext() 获取上下文
        

        this.layout = {
            orientation: this.layoutPointy,
            size: new Point(this.hexSize, this.hexSize),
            origin: new Point(this.canvas.width / 2, this.canvas.height / 2)
        };
        this.isShowLabel = true;

        //画布的名称描述
        this.canvasName = "规划"; // 画布名称
        this.description = ""; // 描述
        this.isPublic = false; // 是否公开
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
        hexGrid.updateAllRegionsLabels(labelCtx);
    }

    setMaxRadius(radius) {
        this.maxRadius = radius;
        this.drawHexagons();
    }

    setShowID(showID) {
        this.showID = showID;
        this.drawHexagons();
    }

    setShowLabel(showLabel) {
        this.showLabel = showLabel;
        this.drawHexagons();
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

    // 绘制
    drawHexagons() {
        const centerHex = new Hex(0, 0, 0);
        const hexagons = this.generateHexagons(centerHex, this.maxRadius);

        // 清除画布
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        

        // 绘制所有格子并添加到 hexGrid
        for (const hexCoords of hexagons) {
            const existingHex = this.getHexById(`${hexCoords.q}_${hexCoords.r}_${hexCoords.s}`);

            if (existingHex) {
                // 如果六边形已经存在，则保留它的属性
                existingHex.drawHex(this.ctx, this.IdCtx, this.labelCtx, this.layout, this.showID);
            } else {
                // 如果是新的六边形，则创建一个新的 Hex 实例
                const newHex = new Hex(hexCoords.q, hexCoords.r, hexCoords.s, '擦除', null, "空白", this.hexSize);
                newHex.drawHex(this.ctx, this.IdCtx, this.labelCtx, this.layout, this.showID);
                this.addHex(newHex);
            }
        }
    }

    cleanGrid() {
        const centerHex = new Hex(0, 0, 0);
        const hexagons = this.generateHexagons(centerHex, this.maxRadius);
        this.hubs = [];
        this.regions = [];
        detectedHexList.length = 0
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (const hexCoords of hexagons) {
            // 如果是新的六边形，则创建一个新的 Hex 实例
            const newHex = new Hex(hexCoords.q, hexCoords.r, hexCoords.s, '擦除', null, "空白", this.hexSize);
            newHex.drawHex(ctx, this.layout, this.showID, this.showLabel);
            this.addHex(newHex);
        }
        updateRegionCards();
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

    updateAllRegionsLabels(ctx) {
        // 清空整个画布
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        // 如果有区域则重绘标签
        if (this.regions.length > 0 && this.isShowRegionLabel) {
            this.regions.forEach(region => {
                region.drawRegionLabel(this.layout, ctx);
            });
        }
    }

    showRegionLabel(ctx) {
        if (this.isShowRegionLabel) {
            if (this.regions.length > 0) {
                this.regions.forEach(region => {
                    region.drawRegionLabel(this.layout, ctx);
                });
            }
        } else {
            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        }
    }

        //更新名称、描述和公开性
    updateProperties(edit = false) {
        const spellNameInput = document.getElementById('savingPopup-spellName');
        const descriptionInput = document.getElementById('savingPopup-description');
        const isPublicToggle = document.getElementById('savingPopup-toggleButton');
        const hexGridId = localStorage.getItem('hexGridId');

        // 确保元素存在后再获取值，避免空引用错误
        if (spellNameInput) {
            this.canvasName = spellNameInput.value.trim(); // 去除前后空格
        }
        if (descriptionInput) {
            this.description = descriptionInput.value.trim(); // 去除前后空格
        }
        if (isPublicToggle) {
            this.isPublic = isPublicToggle.classList.contains('on'); // 获取是否公开的状态
        }

        // 更新数据库
        if (edit && hexGridId) {
            this.updateDescription(hexGridId);
        }
    }

    get ownerId() {
        return localStorage.getItem('uuid');
    }

    async updateDescription(hexGridId, ownerId = this.ownerId) {
        try {
            const response = await fetch('http://127.0.0.1:3000/api/update-hexgrid', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    hexGridId: hexGridId,
                    ownerId: ownerId, // 传递要更新的 ownerId（0 表示执行软删除）
                    canvasName: this.canvasName,
                    description: this.description,
                    isPublic: this.isPublic
                })
            });

            const result = await response.json();

            if (response.ok) {
                showError(`HexGrid 数据更新成功`, true);
            } else {
                showError(`更新 HexGrid 数据时出错：${result.message}`);
            }
        } catch (error) {
            showError(`更新 HexGrid 数据时出错：${error}`);
        }
    }

    async save() {
        try {
            this.updateProperties();
            const ownerId = localStorage.getItem('uuid');

            if (!ownerId) {
                loginToggle();
                showError("无法保存数据: 找不到本地存储的用户ID (UUID)");
                return;
            }

            const thumbnail = this.generateThumbnail();

            if (!thumbnail) {
                // 缩略图生成失败，已经显示了报错信息，直接返回
                return;
            }

            const response = await fetch('http://127.0.0.1:3000/api/save-hexgrid', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    ownerId: ownerId,
                    hexSize: this.hexSize,
                    maxRadius: this.maxRadius,
                    canvasName: this.canvasName,
                    description: this.description,
                    isPublic: this.isPublic,
                    coverImage: thumbnail // 将缩略图传递到后端
                })
            });

            const result = await response.json();

            if (response.ok) {
                showError('HexGrid 数据保存成功', close = true);
                const hexGridId = result.hexGridId; // 获取 hexGrid 保存后的 ID


                localStorage.removeItem('hexGridId');

                localStorage.setItem('hexGridId', hexGridId);

                showEditBtn();
                // 保存 hexes
                for (const hex of Object.values(this.hexes)) {

                    // 排除 brush 为 "擦除" 的格子
                    if (hex.brush === "擦除") {
                        continue;
                    }

                    const hexResponse = await fetch('http://127.0.0.1:3000/api/save-hex', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            hexgridId: hexGridId,
                            q: hex.q,
                            r: hex.r,
                            s: hex.s,
                            brush: hex.brush,
                            region: hex.region,
                            type: hex.type
                        })
                    });

                    if (!hexResponse.ok) {
                        const hexError = await hexResponse.json();
                        showError(`保存单个 Hex 数据时出错：${hexError.message}`);
                        return;
                    }
                }

                showError('所有 hex 数据保存成功');
                // hideError();
            } else {
                showError(`保存 HexGrid 数据时出错：, ${result.message}`);
            }
        } catch (error) {
            showError(`保存 HexGrid 和 Hex 数据时出错：,${error} `);
        }
    }

}

class Region {
    constructor(name, hexes, type) {
        this.hexes = new Set(hexes || []); // 使用 Set 来存储 hexes
        this.type = type;

        // 如果没有传入 name，自动生成一个默认名称
        if (!name) {
            const sameTypeRegions = [...hexGrid.regions].filter(region => region.type === type);
            this.name = `${type} - ${sameTypeRegions.length + 1}`;
        } else {
            this.name = name;
        }

        this.effectHubs = new Set(); // 传输效应区域，检验计算正确与否
        //TODO: 区域的外部效应和内部效应都放在之类，通过回传更新存储，确保准确性

    }

    // 示例方法：添加一个 hex 到 hexes Set
    addHex(hex) {
        this.hexes.add(hex);
    }

    // 示例方法：删除一个 hex 从 hexes Set
    removeHex(hex) {
        this.hexes.delete(hex);
    }

    // 示例方法：检查 hex 是否存在于 hexes Set 中
    hasHex(hex) {
        return this.hexes.has(hex);
    }

    cleanRegion(hex, hexGrid) {
        if (hex) {
            this.clearSingleHex(hex, hexGrid);
        } else {
            this.clearAllHexes(hexGrid);
        }
        this.updateRegion();
        updateRegionCards();
    }

    clearSingleHex(hex, hexGrid) {
        for (let regionHex of this.hexes) {
            if (regionHex.id === hex.id) {
                regionHex.brush = "擦除";
                regionHex.region = null;
                regionHex.type = "空白";
                regionHex.drawHex(ctx, hexGrid.layout, hexGrid.showID);
                this.hexes.delete(regionHex);
                break;
            }
        }
    }

    clearAllHexes(hexGrid) {
        this.hexes.forEach(regionHex => {
            regionHex.brush = "擦除";
            regionHex.region = null;
            regionHex.type = "空白";
            regionHex.drawHex(ctx, hexGrid.layout, hexGrid.showID);
        });
        this.hexes.clear();
        hexGrid.regions.delete(this);
    }


}

import { initializeCanvasLayers } from "../Component/canvasLayer.js";
import { Hex } from "./modules/Hex.js";
import { Point } from "./modules/Hex.js";

export class MainView {
    constructor () {
        // 初始化选中的笔刷
        this.selectedBrush = new Brush('居住区');
        this.isPromptShow = false;
        this.layers = this.initializeLayers();
        this.hexGrid = new HexGrid(this.layers);
        this.hexGrid.drawHexagons();
            // 绑定事件监听器
        this.addCanvasListeners();

        this.canvas = this.layers.colorLayer.canvas;
        this.ctx = this.layers.colorLayer.getContext(); // 使用 getContext() 获取上下文
        
        this.IdCanvas = this.layers.idLayer.canvas;
        this.IdCtx = this.layers.idLayer.getContext(); // 使用 getContext() 获取上下文
        
        this.labelCanvas = this.layers.labelLayer.canvas;
        this.labelCtx = this.layers.labelLayer.getContext(); // 使用 getContext() 获取上下文

    }

    initializeLayers() {
        return initializeCanvasLayers();
    }

    addCanvasListeners() {
        const canvas = this.layers.colorLayer.canvas; // 获取 colorLayer 的画布
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
                hex.drawHex(this.ctx, this.IdCtx, this.labelCtx, hexGrid.layout, hexGrid.showID, hexGrid.showLabel);
                console.log('修改后的数值' ,hex)
            }
        });
    }

}
const brushMap = {
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
// 初始化选中的笔刷
let selectedBrush = '居住区';
let brushThreshold = brushMap[selectedBrush].threshold;
let detectedHexList = [];
let customPromptShown = false;
let isExpandArea = false;



class Hex {
    constructor(q, r, s, brush = '擦除', region = null, type = "空白", size, ctx) {
        this.q = q;
        this.r = r;
        this.s = s;
        if (Math.round(q + r + s) !== 0) {
            throw "q + r + s 必为 0";
        }
        this.id = `${q}_${r}_${s}`; // 生成唯一ID
        this.brush = brush;
        this.region = region;
        this.type = type;
        this.size = size;
        this.ctx = ctx;
    }

    add(b) {
        return new Hex(this.q + b.q, this.r + b.r, this.s + b.s);
    }

    scale(k) {
        return new Hex(this.q * k, this.r * k, this.s * k);
    }
    //TODO: 需要整改
    neighbor(direction) {

        return this.add(Hex.directions[direction]);
    }

    getRingHexs(radius = 1) {
        const neighbors = [];
        for (let dq = -radius; dq <= radius; dq++) {
            for (let dr = Math.max(-radius, -dq - radius); dr <= Math.min(radius, -dq + radius); dr++) {
                const ds = -dq - dr;
                if (dq !== 0 || dr !== 0 || ds !== 0) {
                    const hexId = this.add(new Hex(dq, dr, ds)).id;  // 获取目标坐标的 Hex ID
                    const neighborHex = hexGrid.getHexById(hexId);   // 在 hexGrid 中查找 Hex 对象
                    if (neighborHex) {
                        neighbors.push(neighborHex);
                    }
                }
            }
        }
        return neighbors;
    }
    // 获取半径为1的邻居
    get oneRing() {
        return this.getRingHexs(1);
    }

    // 获取半径为2的邻居
    get twoRing() {
        return this.getRingHexs(2);
    }

    getBrushType(brush) {
        // 根据刷子的名称获取相应的类型
        if (brushMap[brush]) {
            return brushMap[brush].type;
        }
        return '空白';
    }

    getBrushThreshold(brush) {
        // 根据刷子的名称获取相应的类型
        if (brushMap[brush] && autoBuildRegion) {
            return brushMap[brush].threshold;
        }
        return 36;
    }

    refresh() {
        this.updateEffectedRegions();
        hexGrid.updateAllRegions();
        updateRegionCards();
    }

    setbrush(selectedBrush, hexGrid) {
        let selectedBrushType = this.getBrushType(selectedBrush);
        let threshold = this.getBrushThreshold(selectedBrush);
        if (!this.type || this.type === '空白') {
            this.brush = selectedBrush;
            this.type = this.getBrushType(selectedBrush); // 更新hexType
            //设置模块
            if (selectedBrushType === "自由") {
                // 添加被点击的 Hex 到 detectedHexList
                if (detectedHexList.length < threshold && this.isNeighborOfDetectedList()) {
                    detectedHexList.push(this);
                } else {
                    // 清空 detectedHexList
                    if (autoBuildRegion) {
                        detectedHexList.length = 0;
                    }
                    console.log(`格子不相邻，清空 detectedHexList`);
                    detectedHexList.push(this);
                    isExpandArea = false;
                }
            } else if (selectedBrushType === "枢纽") {
                this.hubGetName(hexGrid.hubs, selectedBrush)
                this.updateEffectedRegions();
            } else {
                this.clearHex()
            }
        } else if (this.type === '属地') {
            let region = hexGrid.regions.find(r => r.name === this.region);
            if (region) {
                region.cleanRegion(this);
                hexGrid.regions = hexGrid.regions.filter(r => r.name !== this.region);
                hexGrid.updateAllRegionsLabels(labelCtx);
            } else {
                console.log(`无法找到指定的区域格子`);
            }
            this.clearHex()
        } else if (this.type === '枢纽') {
            this.removeEffectFromRegion()
            hexGrid.hubs = hexGrid.hubs.filter(hub => hub.id !== this.id);
            this.clearHex();
        } else if (this.type === '自由') {
            this.clearHex();
        } else {
            this.brush = selectedBrush;
        }

        hexGrid.updateAllRegions();
        updateRegionCards();
    }

    // 新增方法，用于判断当前格子是否与 detectedHexList 中的格子相邻
    isNeighborOfDetectedList() {
        // 遍历 detectedHexList 中的每一个格子，判断当前格子是否与它们相邻
        for (let hex of detectedHexList) {
            let neighbors = hex.oneRing; // 获取该格子的所有一环内邻居
            for (let neighbor of neighbors) {
                if (neighbor.q === this.q && neighbor.r === this.r && neighbor.s === this.s) {
                    return true; // 当前格子是 detectedHexList 中某格子的一环内邻居
                }
            }
        }
        return false; // 当前格子与 detectedHexList 中的所有格子都不相邻
    }

    clearHex() {
        this.brush = '擦除';
        this.type = '空白';
        this.region = null;
        // 希望同类型则是减去，不同类型则是被删除，这个逻辑要想想

        if (detectedHexList.some(hex => hex.id === this.id)) {
            detectedHexList = detectedHexList.filter(hex => hex.id !== this.id);
        }
        // if (autoBuildRegion){
        //     detectedHexList = [];
        // }
        isExpandArea = false;
        updateRegionCards();
    }

    hubGetName(hubs, brush) {
        let index = 1;
        let newName = `${brush}-${index}`;

        // 通过查找名称是否已存在来确保唯一性
        while (hubs.some(hub => hub.region === newName)) {
            index++;
            newName = `${brush}-${index}`;
        }

        this.region = newName;
        this.type = "枢纽";
        hubs.push(this);  // 将枢纽的实例对象添加到 hubs 数组中
    }

    drawHex(ctx, layout, showID) {
        ctx.beginPath();
        const corners = this.polygonCorners(layout);
        ctx.moveTo(corners[0].x, corners[0].y);
        for (let i = 1; i < corners.length; i++) {
            ctx.lineTo(corners[i].x, corners[i].y);
        }
        ctx.closePath();

        // 根据 brush 的不同设置填充颜色
        this.setFillColor(ctx);

        ctx.lineWidth = 2;
        ctx.strokeStyle = 'rgb(168, 177, 197, 0.1)';
        ctx.stroke();

        // 绘制ID信息
        if (showID) {
            this.drawId(ctx, layout, corners);
        }


        if (this.type === '属地') {
            this.drawHexEdges(ctx, layout);
        } else {
            this.drawRegionLabel(ctx, layout);
        }
    }

    // 悬停鼠标的时候染色
    drawHoverHex(ctx, layout, hoverColor = '#FFDD44', alpha = 0.5) {
        ctx.beginPath();
        const corners = this.polygonCorners(layout);
        ctx.moveTo(corners[0].x, corners[0].y);
        for (let i = 1; i < corners.length; i++) {
            ctx.lineTo(corners[i].x, corners[i].y);
        }
        ctx.closePath();

        // 设置悬停颜色和透明度
        ctx.fillStyle = hoverColor;
        ctx.globalAlpha = alpha;
        ctx.fill();
        ctx.globalAlpha = 1.0; // 恢复透明度

        ctx.strokeStyle = 'rgb(168, 177, 197, 0.1)';
        ctx.stroke();

        // 根据 showID 决定是否绘制 ID 信息
        this.drawId(ctx, layout, corners);
    }

    // 绘制边缘颜色
    drawHexEdges(ctx, layout, lineWidth = 1) {
        const corners = this.polygonCorners(layout);

        let borderColor = '#000000'; // 默认边框颜色
        if (brushMap[this.brush]) {
            borderColor = brushMap[this.brush].borderColor || '#000000';
        }

        // 判断布局类型，并定义邻居方向 ，右下角开始顺时针旋转
        let neighborDirections;
        if (layout.orientation.name === 'pointy') {
            neighborDirections = [
                { direction: { q: 0, r: 1, s: -1 } },
                { direction: { q: -1, r: 1, s: 0 } },
                { direction: { q: -1, r: 0, s: 1 } },
                { direction: { q: 0, r: -1, s: 1 } },
                { direction: { q: 1, r: -1, s: 0 } },
                { direction: { q: 1, r: 0, s: -1 } },
            ];
        } else if (layout.orientation.name === 'flat') {
            neighborDirections = [
                { direction: { q: 1, r: 0, s: -1 } },
                { direction: { q: 0, r: 1, s: -1 } },
                { direction: { q: -1, r: 1, s: 0 } },
                { direction: { q: -1, r: 0, s: 1 } },
                { direction: { q: 0, r: -1, s: 1 } },
                { direction: { q: 1, r: -1, s: 0 } },
            ];
        }

        for (let i = 0; i < neighborDirections.length; i++) {
            const startCorner = corners[i];
            const endCorner = corners[(i + 1) % corners.length];

            // 获取相应方向上的邻居
            const direction = neighborDirections[i].direction;
            const neighborHexId = `${this.q + direction.q}_${this.r + direction.r}_${this.s + direction.s}`;
            const neighbor = hexGrid.getHexById(neighborHexId);

            // 如果邻居存在并且类型相同，则不绘制边
            if (neighbor && neighbor.region === this.region) {
                continue;
            }

            // 重置样式属性，避免叠加
            ctx.save();
            ctx.strokeStyle = borderColor;
            ctx.lineWidth = lineWidth; // 可以根据需要调整边缘线的宽度

            // 使用全局复合操作来确保边缘不会被覆盖
            ctx.globalCompositeOperation = 'source-over';

            // 绘制每条边
            ctx.beginPath();
            ctx.moveTo(startCorner.x, startCorner.y);
            ctx.lineTo(endCorner.x, endCorner.y);
            ctx.stroke();

            ctx.restore();
        }
    }

    drawRegionLabel(ctx, layout, isShowRegionLabel = hexGrid.isShowRegionLabel) {
        // 如果 type 是空白，则不显示任何文本
        if (this.type === '空白') {
            return;
        }
        if (isShowRegionLabel) {
            const center = this.hexToPixel(layout);
            ctx.fillStyle = "rgb(74, 81, 57)";
            ctx.font = `${Math.max(10, this.size / 3)}px Arial`; // 根据 size 调整字体大小
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";

            // 如果 region 为 null，显示 "自由"，否则显示 region 信息
            const text = this.region === null ? "自由" : this.region;
            ctx.fillText(text, center.x, center.y);
        } else {
            this.setFillColor(ctx);
        }
    }

    hexToPixel(layout) {
        const { f0, f1, f2, f3 } = layout.orientation;
        const { x: sx, y: sy } = layout.size;
        const { x: ox, y: oy } = layout.origin;
        const x = (f0 * this.q + f1 * this.r) * sx;
        const y = (f2 * this.q + f3 * this.r) * sy;
        return new Point(x + ox, y + oy);
    }

    // 用于解决边缘绘制问题
    hexCornerOffset(layout, corner) {
        // 根据布局来确定角度的增量
        const angle_offset = layout.orientation.start_angle === 0.5 ? Math.PI / 6 : 0;
        const angle = 2.0 * Math.PI * (corner) / 6 + angle_offset;
        return new Point(layout.size.x * Math.cos(angle), layout.size.y * Math.sin(angle));
    }

    polygonCorners(layout) {
        const corners = [];
        const center = this.hexToPixel(layout);
        for (let i = 0; i < 6; i++) {
            const offset = this.hexCornerOffset(layout, i);
            corners.push(new Point(center.x + offset.x, center.y + offset.y));
        }
        return corners;
    }

    drawId(ctx, layout, corners) {
        const center = this.hexToPixel(layout);
        ctx.fillStyle = "#adbdcd";
        ctx.font = `${(this.size / 2.5)}px Arial`; // 根据 size 调整字体大小

        // 计算偏移量，确保文本在格子内部且与中心点距离合适
        const offset = Math.min(this.size / 3.5, 8);
        if (layout.orientation.name === 'pointy') {
            ctx.textAlign = "center";
            ctx.textBaseline = "bottom";
            // 底部s
            ctx.fillText(`${this.q}`, corners[1].x, corners[1].y - offset);

            ctx.textAlign = "left";
            ctx.textBaseline = "hanging";
            //左上角
            ctx.fillText(`${this.r}`, corners[3].x + offset, corners[3].y);

            //右上角
            ctx.textAlign = "right";
            ctx.textBaseline = "hanging";
            ctx.fillText(`${this.s}`, corners[5].x - offset, corners[5].y);
        } else {
            ctx.textAlign = "left";
            ctx.textBaseline = "bottom";
            // 底部s
            // ctx.fillStyle = 'red';
            ctx.fillText(`${this.q}`, corners[2].x, corners[2].y - offset);

            ctx.textAlign = "left";
            ctx.textBaseline = "hanging";
            //左上角
            // ctx.fillStyle = 'blue';
            ctx.fillText(`${this.r}`, corners[4].x, corners[4].y + offset);

            // //右上角
            ctx.textAlign = "right";
            ctx.textBaseline = "middle";
            // ctx.fillStyle = 'green';
            ctx.fillText(`${this.s}`, corners[0].x - offset, corners[0].y);
        }
        ctx.stroke();
    }

    setFillColor(ctx) {
        if (brushMap[this.brush]) {  // 将 this.hex.brush 修改为 this.brush
            ctx.fillStyle = brushMap[this.brush].color;
        } else {
            ctx.fillStyle = 'dbe4ff'; // 默认颜色
        }
        ctx.fill();
    }
    // 获取枢纽的影响效果和影响值
    get hubEffect() {
        if (!this.brush || !brushMap[this.brush]) {
            console.warn(`Hub ${this.brush} 不存在于 brushMap 中`);
            return null;
        }

        const { effect, effectValue } = brushMap[this.brush];
        return { effect, effectValue };
    }

    // 计算枢纽影响到的区域
    get findEffectedArea() {
        const twoRingHexes = this.twoRing; // 获取两圈内的邻居Hex对象
        const allowedAreas = brushMap[this.brush]?.allowArea || []; // 获取当前brush的allowArea，如果不存在则为空集
        const effectedArea = {};

        // 遍历两圈内的邻居格子
        for (const hex of twoRingHexes) {
            if (hex.type === '属地' && allowedAreas.includes(hex.brush)) {
                // 如果格子是区域格子，且符合允许的区域条件
                if (!effectedArea[hex.region]) {
                    effectedArea[hex.region] = 0;
                }
                effectedArea[hex.region]++;
            }
        }

        // 检查是否有三个或以上相同的区域格子
        const effectedAreaList = Object.keys(effectedArea)
            .filter(region => effectedArea[region] >= 3);

        // 返回找到的受影响区域列表
        return effectedAreaList;
    }

    updateEffectedRegions() {
        const effectedAreaList = this.findEffectedArea;
        if (effectedAreaList) {
            for (const areaName of effectedAreaList) {
                const region = hexGrid.regions.find(region => region.name === areaName);
                if (region) {
                    region.effectHubs.add(this); // 使用 Set 的 add 方法
                }
            }
        }
    }

    removeEffectFromRegion() {
        const effectedAreaList = this.findEffectedArea;
        if (effectedAreaList) {
            for (const areaName of effectedAreaList) {
                const region = hexGrid.regions.find(region => region.name === areaName);
                if (region) {
                    region.effectHubs.delete(this); // 使用 Set 的 delete 方法
                }
            }
        }
    }



}

//原点的邻居们
Hex.directions = [
    new Hex(1, 0, -1), new Hex(1, -1, 0), new Hex(0, -1, 1),
    new Hex(-1, 0, 1), new Hex(-1, 1, 0), new Hex(0, 1, -1)
];

class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

class HexGrid {
    constructor(hexSize = 45, maxRadius = 6, showID = true) {
        this.hexes = []; //新建后的格子存储
        this.regions = []; //存储区域
        this.hubs = []; //存储枢纽
        this.hexSize = hexSize;
        this.maxRadius = maxRadius;
        this.showID = showID;
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
        this.layout = {
            orientation: this.layoutPointy,
            size: new Point(this.hexSize, this.hexSize),
            origin: new Point(canvas.width / 2, canvas.height / 2)
        };
        this.isShowRegionLabel = true;

        //画布的名称描述
        this.canvasName = "规划"; // 画布名称
        this.description = ""; // 描述
        this.isPublic = false; // 是否公开
    }

    addHex(hex) {
        this.hexes[hex.id] = hex;
    }

    getHexById(id) {
        return this.hexes[id] || null;
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

    drawHexagons() {
        const centerHex = new Hex(0, 0, 0);
        const hexagons = this.generateHexagons(centerHex, this.maxRadius);

        // 清除画布
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // 绘制所有格子并添加到 hexGrid
        for (const hexCoords of hexagons) {
            const existingHex = this.getHexById(`${hexCoords.q}_${hexCoords.r}_${hexCoords.s}`);

            if (existingHex) {
                // 如果六边形已经存在，则保留它的属性
                existingHex.drawHex(ctx, this.layout, this.showID);
            } else {
                // 如果是新的六边形，则创建一个新的 Hex 实例
                const newHex = new Hex(hexCoords.q, hexCoords.r, hexCoords.s, '擦除', null, "空白", this.hexSize);
                newHex.drawHex(ctx, this.layout, this.showID);
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
            newHex.drawHex(ctx, this.layout, this.showID);
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
    //绘制格子略缩图
    generateThumbnail() {
        // 获取包含非空白格子的所有六边形
        const filledHexes = Object.values(this.hexes).filter(hex => hex.type !== "空白");

        if (filledHexes.length === 0) {
            showError("没有非空白的格子，无法生成缩略图");
            return null;
        }

        // 找到最小的包围盒边界
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

        filledHexes.forEach(hex => {
            const { x, y } = hex.hexToPixel(this.layout);
            const corners = hex.polygonCorners(this.layout);

            // 计算每个格子六个顶点的最大最小值
            corners.forEach(corner => {
                if (corner.x < minX) minX = corner.x;
                if (corner.y < minY) minY = corner.y;
                if (corner.x > maxX) maxX = corner.x;
                if (corner.y > maxY) maxY = corner.y;
            });
        });

        // 设置缩略图的宽高和比例（可根据需求调整）
        const padding = 10; // 为缩略图添加边距
        // const thumbnailWidth = maxX - minX + padding * 2;
        // const thumbnailHeight = maxY - minY + padding * 2;
        const scalingFactor = 0.1; // 缩小比例，根据需要调整
        const thumbnailWidth = (maxX - minX + padding * 2) * scalingFactor;
        const thumbnailHeight = (maxY - minY + padding * 2) * scalingFactor;

        // 创建一个新的临时 canvas，用于生成缩略图
        const thumbnailCanvas = document.createElement('canvas');
        thumbnailCanvas.width = thumbnailWidth;
        thumbnailCanvas.height = thumbnailHeight;
        const thumbnailCtx = thumbnailCanvas.getContext('2d');

        // 清除并绘制缩略图内容
        thumbnailCtx.clearRect(0, 0, thumbnailWidth, thumbnailHeight);
        thumbnailCtx.fillStyle = "#ffffff"; // 设置缩略图背景为白色
        thumbnailCtx.fillRect(0, 0, thumbnailWidth, thumbnailHeight);

        // 将有效的格子绘制到缩略图画布上
        filledHexes.forEach(hex => {
            const { x, y } = hex.hexToPixel(this.layout);
            thumbnailCtx.save();

            // 平移坐标到缩略图的裁剪区域起点
            thumbnailCtx.translate(x - minX + padding, y - minY + padding);
            hex.drawHex(thumbnailCtx, this.layout, false); // 绘制六边形，不显示 ID
            thumbnailCtx.restore();
        });

        // 返回缩略图的 Data URL，可以将其用于 img 标签，或发送到服务器
        return thumbnailCanvas.toDataURL('image/jpeg', 0.5);
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
        this.hexes = hexes || [];
        this.type = type;
        // 如果没有传入 name，自动生成一个默认名称
        if (!name) {
            const sameTypeRegions = hexGrid.regions.filter(region => region.type === type);
            this.name = `${type} - ${sameTypeRegions.length + 1}`;
        } else {
            this.name = name;
        }
        // this.updateRegion();
        this.effectHubs = new Set(); // 传输效应区域 检验计算正确与否 FIX
    }

    updateRegion() {
        // 计算包含的格子, 邻居和效应区域
        this.innerEffectArea = this.getInnerEffectArea();
        this.outerEffect = this.getouterEffect();
        this.InnerEffectDetailList = this.InnerEffect('d');
        this.InnerEffectAcountList = this.InnerEffect('a');
        this.totalEffects = this.InnerEffect('t');
    }

    static createRegion(hexesList = detectedHexList) {
        console.trace('createRegion called');
        let changeRegion;
        if (isExpandArea) {
            if (selectedRegion) {
                // 将新 hexes 添加到 selectedRegion 中
                selectedRegion.hexes = [...selectedRegion.hexes, ...hexesList];
                hexesList.forEach(hex => {
                    hex.region = selectedRegion.name;
                    hex.type = "属地";
                });
                changeRegion = selectedRegion;
            }
            console.log('拓展区域排查1 - changeRegion', changeRegion);
            console.log('拓展区域排查1 - selectedRegion', selectedRegion);
            // 如果 isExpandArea 为真，拓展最后一个区域
            const lastRegion = selectedRegion;
            console.log('拓展区域排查1 - lastRegion', lastRegion);
            if (lastRegion.hexes.length < brushMap[selectedBrush].threshold) {
                isExpandArea = true;
            } else {
                isExpandArea = false;
            }
            areaHandleCtx.clearRect(0, 0, canvas.width, canvas.height);
            lastRegion.updateRegion();
            console.log('拓展区域排查2 - changeRegion', changeRegion);
            console.log('拓展区域排查2 - selectedRegion', selectedRegion);
            console.log('拓展区域排查2 - lastRegion', lastRegion);
            console.log(`区域拓展出的${this.hexes}`)
            console.log(`拓展区域排查2 结束拓展 --------------------------------`)
        } else {
            // 如果 isExpandArea 为假，新建一个区域
            const newRegion = new Region(null, hexesList, selectedBrush);
            hexGrid.regions.push(newRegion);
            newRegion.updateRegion();

            // 将 hexes 的 region 属性更新为新区域的名称
            newRegion.hexes.forEach(hex => {
                hex.region = newRegion.name;
                hex.type = "属地";
            });
            changeRegion = newRegion;
            // newRegion.drawRegionLabel(hexGrid.layout,ctx);
            // 创建完成后判断是否需要继续拓展
            if (hexesList.length <= brushMap[selectedBrush].threshold) {
                isExpandArea = true;
                selectedRegion = newRegion;
            } else {
                isExpandArea = false;
            }
            areaHandleCtx.clearRect(0, 0, canvas.width, canvas.height);
            console.log('拓展区域排查3 正常创建 - changeRegion', changeRegion);
            console.log('拓展区域排查3 - selectedRegion', selectedRegion);
            console.log(`拓展区域排查3 结束创建 --------------------------------`)
        }

        hexesList.forEach(hex => {
            hex.drawHex(ctx, hexGrid.layout);
        });
        hexGrid.updateAllRegionsLabels(labelCtx);

    }

    static createRegionClick(hexesList) {
        const newRegion = new Region(null, hexesList, selectedBrush);
        hexGrid.regions.push(newRegion);
        newRegion.updateRegion();
        newRegion.hexes.forEach(hex => {
            hex.region = newRegion.name;
            hex.type = "属地";
            hex.drawHex(ctx, hexGrid.layout);
        });
        hexGrid.updateAllRegionsLabels(labelCtx);
    }

    expanRegion(hexesList) {
        console.log(hexesList)
    }

    drawRegionLabel(layout, ctx) {
        if (this.hexes.length === 0) return;

        // Step 1: 计算区域的几何中心点
        let centroidX = 0, centroidY = 0;
        this.hexes.forEach(hex => {
            const pixel = hex.hexToPixel(layout);
            centroidX += pixel.x;
            centroidY += pixel.y;
        });
        centroidX /= this.hexes.length;
        centroidY /= this.hexes.length;

        // Step 2: 找到凸包并计算中间的六边形用于文字居中放置
        const points = this.hexes.map(hex => hex.hexToPixel(layout));
        const hull = computeConvexHull(points);

        // 找到凸包的中心点
        let hullCentroidX = 0, hullCentroidY = 0;
        hull.forEach(point => {
            hullCentroidX += point.x;
            hullCentroidY += point.y;
        });
        hullCentroidX /= hull.length;
        hullCentroidY /= hull.length;

        // Step 3: 确定文字放置的中心六边形（接近凸包中心点的那个六边形）
        let centerHex = this.hexes[0];
        let minDistance = Infinity;
        this.hexes.forEach(hex => {
            const pixel = hex.hexToPixel(layout);
            const distance = Math.hypot(pixel.x - hullCentroidX, pixel.y - hullCentroidY);
            if (distance < minDistance) {
                minDistance = distance;
                centerHex = hex;
            }
        });

        // Step 4: 计算字体大小与区域大小的关系
        // 文字最大只能是单个格子内接圆直径大小
        const hexRadius = layout.size.x;
        const fontSize = Math.min(hexRadius, 20); // 根据需要动态调整字体大小，最大为单个六边形内接圆直径

        // Step 5: 绘制文字，按照要求从区域中间开始，居中显示
        ctx.save();
        ctx.fillStyle = "#000";
        ctx.font = `${fontSize}px Arial`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        const label = this.name.replace(/\s+/g, ''); // 去除空格
        const charCount = label.length;

        // 从中间六边形开始绘制
        const centerPixel = centerHex.hexToPixel(layout);
        const startIndex = Math.max(0, Math.floor((this.hexes.length - charCount) / 2));

        for (let i = 0; i < charCount && (startIndex + i) < this.hexes.length; i++) {
            const hex = this.hexes[startIndex + i];
            const pixel = hex.hexToPixel(layout);
            ctx.fillText(label[i], pixel.x, pixel.y);
        }

        ctx.restore();
    }



    // 单格触发清理
    cleanRegion(hex) {
        if (hex) {
            // 清除单个格子
            this.hexes = this.hexes.filter(regionHex => {
                if (regionHex.id !== hex.id) {
                    // 保留不相等的格子，并清除其属性
                    regionHex.brush = "擦除";
                    regionHex.region = null;
                    regionHex.type = "空白";
                    regionHex.drawHex(ctx, hexGrid.layout, hexGrid.showID);
                    //需要添加一个画ID的方法
                    return true;
                }

                return false; // 过滤掉需要清除的格子
            });
        } else {
            // 清除整个区域
            this.hexes.forEach(regionHex => {
                regionHex.brush = "擦除";
                regionHex.region = null;
                regionHex.type = "空白";
                regionHex.drawHex(ctx, hexGrid.layout, hexGrid.showID);
            });
            this.hexes = [];
            hexGrid.regions = hexGrid.regions.filter(region => region !== this);
        }
        this.updateRegion();
        updateRegionCards();
    }

    getAreaOneRingHex(hexList = this.hexes) {
        const oneRingHexes = new Map();

        // 遍历输入的所有格子
        hexList.forEach(hex => {
            // 获取每个格子的邻居格子
            const neighbors = hex.oneRing;

            // 遍历邻居格子
            neighbors.forEach(neighbor => {
                // 如果邻居不在输入的格子列表中，且未被添加到 oneRingHexes 中，则将其添加到 oneRingHexes 集合中
                if (!hexList.some(h => h.q === neighbor.q && h.r === neighbor.r && h.s === neighbor.s) &&
                    !oneRingHexes.has(neighbor.id)) {
                    oneRingHexes.set(neighbor.id, neighbor);
                }
            });
        });

        const result = Array.from(oneRingHexes.values());

        // 打印结果中每个元素的 id, type, region
        // result.forEach(hex => {
        //     console.log(`区域邻居 - Hex ID: ${hex.id}, Type: ${hex.type}, Region: ${hex.region}`);
        // });

        return result;
    }

    //内效 自身的格子有三个能跟外面的同一个区域接触
    getInnerEffectArea() {
        const neighborRegionCount = new Map();

        // Step 1: 遍历每个 hex，找到邻居中类型为 '属地' 的格子
        this.hexes.forEach(hex => {
            const adjacentTerritoryHexes = hex.oneRing.filter(neighbor => neighbor.type === '属地' && !this.hexes.includes(neighbor));

            // Step 2: 形成接壤区域列表
            const adjacentRegions = new Set();
            adjacentTerritoryHexes.forEach(neighbor => {
                if (neighbor.region) {
                    adjacentRegions.add(neighbor.region);
                }
            });

            // Step 3: 将接壤区域添加到 neighborRegionCount 中
            adjacentRegions.forEach(region => {
                if (!neighborRegionCount.has(region)) {
                    neighborRegionCount.set(region, 1);
                } else {
                    neighborRegionCount.set(region, neighborRegionCount.get(region) + 1);
                }
            });
        });

        // Step 4: 检查合并的表中是否有区域的统计值大于 3

        const innerEffectArea = [];
        neighborRegionCount.forEach((count, region) => {
            if (count >= 3) {
                innerEffectArea.push(region);
            }
        });
        return innerEffectArea;
    }

    //内效果
    InnerEffect(param) {
        const innerEffectArea = this.getInnerEffectArea();
        const innerEffectDetailList = [];
        const innerEffectCountMap = new Map();

        // Step 1: 查询区域类型并生成效果明细列表
        innerEffectArea.forEach(reg => {
            let region = hexGrid.regions.find(r => r.name === reg);
            const regionType = region.type;
            let heatEffect = 20;
            let pollutionEffect = null;

            if (['工业区', '开采区', '后勤区'].includes(regionType)) {
                if (this.type === '居住区') {
                    pollutionEffect = '20 脏污';
                } else if (this.type === '食品区') {
                    pollutionEffect = '20 疾病';
                }
            }
            const effectDetail = {
                region: region.name,
                heat: '20 热能',
                pollution: pollutionEffect || null
            };

            innerEffectDetailList.push(effectDetail);

            // Step 2: 统计相同类型区域的效果
            if (!innerEffectCountMap.has(regionType)) {
                innerEffectCountMap.set(regionType, {
                    heat: 20,
                    pollution: pollutionEffect === '20 脏污' ? 20 : 0,
                    disease: pollutionEffect === '20 疾病' ? 20 : 0
                });
            } else {
                const currentEffect = innerEffectCountMap.get(regionType);
                currentEffect.heat += 20;
                if (pollutionEffect === '20 脏污') {
                    currentEffect.pollution += 20;
                    if (pollutionEffect === '20 疾病') {
                        currentEffect.disease += 20;
                    }
                }
                innerEffectCountMap.set(regionType, currentEffect);
            }
        });

        const innerEffectCountList = Array.from(innerEffectCountMap.entries()).map(([type, effects]) => {
            return {
                type,
                heat: `${effects.heat} 热能`,
                pollution: effects.pollution > 0 ? `${effects.pollution} ${effects.pollution === effects.disease ? '疾病' : '脏污'}` : null,
                disease: effects.disease > 0 ? `${effects.disease} 疾病` : null
            };
        });

        if (param === 'd') {

            return innerEffectDetailList;
        } else if (param === 'a') {

            return innerEffectCountList;
        } else if (param === 't') {
            // Step 3: 统计总体效果
            let totalRegions = innerEffectCountList.length;
            let totalHeat = 0;
            let totalPollution = 0;
            let totalDisease = 0;

            innerEffectCountList.forEach(effect => {
                totalHeat += parseInt(effect.heat);
                if (effect.pollution) {
                    totalPollution += parseInt(effect.pollution);
                }
                if (effect.disease) {
                    totalDisease += parseInt(effect.disease);
                }
            });

            const totalEffects = {
                region: totalRegions,
                heat: totalHeat,
                pollution: totalPollution,
                disease: totalDisease
            };


            return totalEffects;
        }
    }

    //外反馈 外面有三个同类型区域的格子就生效
    getOuterEffectArea() {
        // 获取环圈的所有格子
        const oneRingHexes = this.getAreaOneRingHex();

        // 过滤出类型为 "属地" 的格子
        const filteredHexes = oneRingHexes.filter(hex => hex.type === "属地");

        // 统计每个区域的格子数量
        const regionCountMap = new Map();
        filteredHexes.forEach(hex => {
            const region = hex.region;
            if (region) {
                if (!regionCountMap.has(region)) {
                    regionCountMap.set(region, 0);
                }
                regionCountMap.set(region, regionCountMap.get(region) + 1);
            }
        });

        // 构造外部效果区域列表，区域格子数量大于等于 3 的保留
        const outerEffectArea = [];
        regionCountMap.forEach((count, region) => {
            if (count >= 3) {
                const hex = filteredHexes.find(h => h.region === region);
                if (hex) {
                    outerEffectArea.push({ region: region, brush: hex.brush });
                }
            }
        });

        return outerEffectArea;
    }

    getouterEffect() {
        // 获取外部效果区域
        const outerEffectArea = this.getOuterEffectArea();

        // 构造结果列表，仅包含每个元素的 region
        const result = outerEffectArea.map(item => item.region);

        return result;
    }

    // 多少枢纽影响了此区域，影响值到底多少
    get hubsEffectStat() {
        const effectStats = {};
        // 遍历所有影响区域的枢纽
        this.effectHubs.forEach(hub => {
            if (!hub) {
                console.warn(`枢纽 ${hub.id} 不存在`);
                return;
            }

            // 获取效应信息
            const hubEffectInfo = hub.hubEffect;
            if (!hubEffectInfo) {
                console.warn(`枢纽 ${hub} 没有有效的效应信息`);
                return;
            }

            const { effect, effectValue } = hubEffectInfo;

            //统计
            if (!effectStats[hub.brush]) {
                effectStats[hub.brush] = {
                    count: 0,
                    totalEffect: 0,
                    effectType: effect
                };
            }
            effectStats[hub.brush].count += 1;
            effectStats[hub.brush].totalEffect += effectValue;
        });
        // 输出统计结果
        return effectStats;
    }

    get hubEffectSummary() {
        const effectStats = {};

        // 遍历所有影响区域的枢纽
        this.effectHubs.forEach(hub => {
            if (!hub) {
                console.warn(`枢纽 ${hub.id} 不存在`);
                return;
            }

            // 获取效应信息
            const hubEffectInfo = hub.hubEffect;
            if (!hubEffectInfo) {
                console.warn(`枢纽 ${hub} 没有有效的效应信息`);
                return;
            }

            const { effect, effectValue } = hubEffectInfo;

            // 统计相同效应类型的数值
            if (!effectStats[effect]) {
                effectStats[effect] = {
                    count: 0,
                    totalEffectValue: 0
                };
            }

            effectStats[effect].count += 1;
            effectStats[effect].totalEffectValue += effectValue;
        });

        // 输出统计结果
        return Object.keys(effectStats).map(effect => `${effect}: ${effectStats[effect].totalEffectValue}`);
    }

    get thermalIncreaseEffect() {
        const effectSummary = this.hubEffectSummary;
        const thermalIncrease = effectSummary.find(effect => effect.startsWith('热能增加'));
        if (thermalIncrease) {
            return parseInt(thermalIncrease.split(': ')[1], 10);
        } else {
            return 0;
        }
    }

    get effectSummaryWithoutThermalIncrease() {
        const effectSummary = this.hubEffectSummary;
        const filteredSummary = effectSummary.filter(effect => !effect.startsWith('热能增加'));

        return filteredSummary;
    }
    ///计算有多少个枢纽
    get totalHubsCount() {
        return this.effectHubs.size || 0;
    }

    //最终的效应统计
    get effectSummary() {
        const regionTotalEffects = this.InnerEffect('t');
        let regionHeat = regionTotalEffects.heat;
        let hubHeat = this.thermalIncreaseEffect;
        let acountHeat = regionHeat + hubHeat;


        let effectList = [
            `热能: ${regionHeat} + ${hubHeat} = ${acountHeat}`,
            `疾病: ${regionTotalEffects.disease}`,
            `脏污 ${regionTotalEffects.pollution}`
        ];
        const effectSummaryWithoutThermal = this.effectSummaryWithoutThermalIncrease;

        // 合并 effectList 和 effectSummaryWithoutThermalIncrease 的结果
        return [...effectList, ...effectSummaryWithoutThermal];
    }


}
// 凸包算法 绘制标签用
function computeConvexHull(points) {
    // 找到最底部且最左边的点作为起始点
    function findStartPoint(points) {
        let startPoint = points[0];
        for (let i = 1; i < points.length; i++) {
            if (
                points[i].y < startPoint.y ||
                (points[i].y === startPoint.y && points[i].x < startPoint.x)
            ) {
                startPoint = points[i];
            }
        }
        return startPoint;
    }

    // 按极角排序点集合
    function sortPointsByAngle(points, startPoint) {
        return points.slice().sort((a, b) => {
            const angleA = Math.atan2(a.y - startPoint.y, a.x - startPoint.x);
            const angleB = Math.atan2(b.y - startPoint.y, b.x - startPoint.x);
            if (angleA === angleB) {
                return Math.hypot(startPoint.x - a.x, startPoint.y - a.y) -
                    Math.hypot(startPoint.x - b.x, startPoint.y - b.y);
            }
            return angleA - angleB;
        });
    }

    // 判断三点 (p1, p2, p3) 是否形成逆时针方向
    function isCounterClockwise(p1, p2, p3) {
        const crossProduct = (p2.x - p1.x) * (p3.y - p1.y) - (p2.y - p1.y) * (p3.x - p1.x);
        return crossProduct > 0;
    }

    // 计算凸包
    if (points.length < 3) {
        return points; // 如果点数少于 3 个，无法构成凸包
    }

    const startPoint = findStartPoint(points);
    const sortedPoints = sortPointsByAngle(points, startPoint);

    const hull = [];
    hull.push(startPoint);
    sortedPoints.forEach(point => {
        while (hull.length >= 2 && !isCounterClockwise(hull[hull.length - 2], hull[hull.length - 1], point)) {
            hull.pop();
        }
        hull.push(point);
    });

    return hull;
}



function resizeCanvas() {
    // 更新画布大小
    const setCanvasSize = () => {
        [canvas, labelCanvas, tipsCanvas, areaHandleCanvas].forEach(c => {
            if (c) {
                c.width = window.innerWidth * 2;
                c.height = window.innerHeight * 2;
            }
        });
    };

    // 更新原点位置为画布中心
    const updateOrigin = () => {
        hexGrid.layout.origin = new Point(canvas.width / 2, canvas.height / 2);
    };

    // 将视窗滚动到画布的中心
    const scrollToCenter = () => {
        window.scrollTo({
            left: (canvas.width / 2) - (window.innerWidth / 2),
            top: (canvas.height / 2) - (window.innerHeight / 2),
            behavior: 'auto' // 保证刷新后直接到达目标位置
        });
    };

    // 更新画布大小并绘制格子
    const updateCanvas = () => {
        setCanvasSize();
        updateOrigin();
        scrollToCenter();
        hexGrid.drawHexagons();
    };

    // 处理窗口加载和调整事件
    window.onload = updateCanvas;
    window.onresize = updateCanvas; // 处理窗口大小变化
}



// 按下中键就显示信息，测试用
// class HexInfoDisplay {
//     constructor(canvasId, hexgrid, infoBoxId) {
//         this.canvas = document.getElementById(canvasId);
//         this.hexgrid = hexgrid;
//         this.infoBox = document.getElementById(infoBoxId);
//         this.initEventListeners();
//     }

//     initEventListeners() {
//         this.canvas.addEventListener('mousedown', (event) => this.handleMouseDown(event));
//         this.canvas.addEventListener('mousemove', (event) => this.handleMouseMove(event));
//     }

//     handleMouseDown(event) {
//         if (event.button === 1) { // Check if middle mouse button is clicked
//             const rect = this.canvas.getBoundingClientRect();
//             const mouseX = event.clientX - rect.left;
//             const mouseY = event.clientY - rect.top;

//             const hex = this.getHexInfoFromMouse(mouseX, mouseY);
//             if (hex) {
//                 this.displayHexInfo(hex, event.clientX, event.clientY);
//             }
//         }
//     }

//     handleMouseMove(event) {
//         if (this.infoBox.style.display === 'block') {
//             this.infoBox.style.left = `${event.clientX + 10}px`;
//             this.infoBox.style.top = `${event.clientY + 10}px`;
//         }
//     }

//     getHexInfoFromMouse(mouseX, mouseY) {
//         const hexId = this.hexgrid.getHexIdFromMouse(mouseX, mouseY);
//         return this.hexgrid.getHexById(hexId);
//     }

//     displayHexInfo(hex, clientX, clientY) {
//         const infoText = `Hex ID: ${hex.id}\nBrush: ${hex.brush}\nType: ${hex.type}\nRegion: ${hex.region}`;
//         this.infoBox.innerText = infoText;
//         this.infoBox.style.display = 'block';
//         this.infoBox.style.left = `${clientX + 10}px`;
//         this.infoBox.style.top = `${clientY + 10}px`;
//     }
// }

const canvas = document.getElementById('hexCanvas');
const ctx = canvas.getContext('2d');

const labelCanvas = document.getElementById('labelCanvas');
const labelCtx = labelCanvas.getContext('2d');

const tipsCanvas = document.getElementById('tipsCanvas');
const tipsCtx = tipsCanvas.getContext('2d');

const areaHandleCanvas = document.getElementById('areaHandleCanvas');
const areaHandleCtx = areaHandleCanvas.getContext('2d');

canvas.addEventListener('click', (event) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    const hexId = hexGrid.getHexIdFromMouse(mouseX, mouseY);
    const hex = hexGrid.getHexById(hexId);

    if (expanAreaModel && hex.type === '属地') {
        highlightRegion(hex, areaHandleCtx, 8, 8);
        const budingRegion = selectedRegion;
        if (budingRegion && budingRegion.hexes.length > 0) {
            selectedBrush = budingRegion.hexes[0].brush;
        }
        updateToolbarView();

        budingRegion.hexes.forEach(hex => {
            if (hex) {
                detectedHexList.push(hex);
            }
        });
        isExpandArea = true;
        expanAreaModel = false;
        updateDetectedHexListView();

    } else if (cleanRegionMoel && hex.type === '属地') {
        const region = hexGrid.regions.find(region => region.name === hex.region);
        if (region) {
            region.cleanRegion(); // 如果找到符合条件的区域，则调用 cleanRegion 方法
        }
    } else {
        if (hex) {
            hex.setbrush(selectedBrush, hexGrid);

            updateDetectedHexListView(); // 更新显示模块
            // 仅重绘这个被单击的 Hex
            hex.drawHex(ctx, hexGrid.layout, hexGrid.showID);
        };
    }


    // 如果点击了第6、9、12个格子 提示建立区域
    if (autoBuildRegion) {
        showBuildRegionPrompt();
    }

});

// 鼠标移动事件监听器
canvas.addEventListener('mousemove', (event) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    const hexId = hexGrid.getHexIdFromMouse(mouseX, mouseY);

    // 获取当前悬停的格子
    const hoveredHex = hexGrid.getHexById(hexId);
    if (hoveredHex) {
        // 清除高亮层
        tipsCtx.clearRect(0, 0, canvas.width, canvas.height);

        if ((expanAreaModel || cleanRegionMoel) && hoveredHex.type === '属地') {
            highlightRegion(hoveredHex, tipsCtx, 0.5, 5)
        } else {
            // 仅高亮当前悬停的格子
            hoveredHex.drawHoverHex(tipsCtx, hexGrid.layout, '#EEFFB3', 0.5);
        }
    }
});

// 鼠标离开画布时清除高亮
// canvas.addEventListener('mouseleave', () => {
//     tipsCtx.clearRect(0, 0, canvas.width, canvas.height); // 清除高亮层
// });

let hexGrid = new HexGrid();
// 在页面加载后立即调用 resizeCanvas，确保正确显示画布中心
window.addEventListener('load', resizeCanvas);
//窗口变动
window.addEventListener('resize', resizeCanvas);

// 初始化
resizeCanvas();
hexGrid.drawHexagons();
updateToolbarView();



// window.onload = function() {
//     const hexInfoDisplay = new HexInfoDisplay('hexCanvas', hexGrid, 'hexInfoBox');
// };


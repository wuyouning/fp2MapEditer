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
        if (brushMap[brush]) {
            return brushMap[brush].threshold;
        }
        return '空白';
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
                    detectedHexList = [];
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
        // detectedHexList = detectedHexList.filter(hex => hex.id != this.id);
        detectedHexList = [];
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

        ctx.lineWidth = 1;
        ctx.strokeStyle = 'rgb(168, 177, 197, 0.1)';
        ctx.stroke();

        // 绘制ID信息
        if (showID) {
            this.drawId(ctx, layout, corners);
        }

    
        if (this.type === '属地') {
            this.drawHexEdges(ctx, layout);
        } else {
            this.drawRegion(ctx, layout);
        }
    }

    drawRegion(ctx, layout, isShowRegionLabel = hexGrid.isShowRegionLabel) {
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

    // hexCornerOffset(layout, corner) {
    //     const angle = 2.0 * Math.PI * (corner + layout.orientation.start_angle) / 6;
    //     return new Point(layout.size.x * Math.cos(angle), layout.size.y * Math.sin(angle));
    // }

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
        ctx.font = `${Math.max(8, this.size / 2.5)}px Arial`; // 根据 size 调整字体大小

        // 计算偏移量，确保文本在格子内部且与中心点距离合适
        const offset = this.size / 3.5;
        if (layout.orientation.name === 'pointy') {
            ctx.textAlign = "center";
            ctx.textBaseline = "bottom";
            // 底部s
            ctx.fillText(`${this.q}`, corners[1].x, corners[1].y - offset );
    
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
            ctx.fillText(`${this.r}`, corners[4].x , corners[4].y + offset);

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

    // 悬停鼠标的时候染色
    drawHoverHex(ctx, layout, hoverColor = '#FFDD44', alpha = 0.5, showID = false) {
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

        // ctx.strokeStyle = 'rgb(168, 177, 197)';
        // ctx.stroke();

        // 根据 showID 决定是否绘制 ID 信息
        if (showID) {
            this.drawId(ctx, layout, corners);
        }
    }

    // 绘制边缘颜色
    drawHexEdges(ctx, layout) {
        const corners = this.polygonCorners(layout);
        
        let borderColor = '#000000'; // 默认边框颜色
        if (brushMap[this.brush]) {
            borderColor = brushMap[this.brush].borderColor || '#000000';
        }

        // 使用正确的邻居方向和格子编号来遍历边
        // let neighborDirections = [
        //     { direction: Hex.directions[5], label: 1 },  // 右下方向，对应编号 0, 1, -1
        //     { direction: Hex.directions[4], label: 2 },  // 左下方向，对应编号 -1, 1, 0
        //     { direction: Hex.directions[3], label: 3 },  // 正左方向，对应编号 -1, 0, 1
        //     { direction: Hex.directions[2], label: 4 },  // 左上方向，对应编号 0, -1, 1
        //     { direction: Hex.directions[1], label: 5 },  // 右上方向，对应编号 -1, 1, 0
        //     { direction: Hex.directions[0], label: 6 }   // 正右方向，对应编号 1, 0, -1
        // ];

        // 判断布局类型，并定义邻居方向 ，右下角开始
        let neighborDirections;
        if (layout.orientation.name === 'pointy') {
            neighborDirections = [
                { direction: { q: 0, r: 1, s: -1 }},
                { direction: { q: -1, r: 1, s: 0 }},
                { direction: { q: -1, r: 0, s: 1 }}, 
                { direction: { q: 0, r: -1, s: 1 }}, 
                { direction: { q: 1, r: -1, s: 0 }}, 
                { direction: { q: 1, r: 0, s: -1 }}, 
            ];
        } else if (layout.orientation.name === 'flat') {
            neighborDirections = [
                { direction: { q: 1, r: 0, s: -1 }}, 
                { direction: { q: 0, r: 1, s: -1 }},
                { direction: { q: -1, r: 1, s: 0 }},
                { direction: { q: -1, r: 0, s: 1 }}, 
                { direction: { q: 0, r: -1, s: 1 }}, 
                { direction: { q: 1, r: -1, s: 0 }}, 
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
            ctx.lineWidth = 1; // 可以根据需要调整边缘线的宽度

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
        console.log("排查效应区域 - Outer Effect Area:", this.outerEffect);
    }

    static createRegion(hexesList = detectedHexList) {
        let changeRegion;
        if (isExpandArea) {
            // 如果 isExpandArea 为真，拓展最后一个区域
            const lastRegion = hexGrid.regions[hexGrid.regions.length - 1];
            if (lastRegion) {
                // 拓展完成后判断是否需要继续拓展
                lastRegion.hexes.forEach(hex => {
                    hex.region = lastRegion.name;
                    hex.type = "属地";
                });
                // lastRegion.drawRegionLabel(hexGrid.layout,ctx);
                changeRegion = lastRegion;
            }
            if (lastRegion.hexes.length < brushMap[selectedBrush].threshold) {
                isExpandArea = true;
            } else {
                isExpandArea = false;
            }
            lastRegion.updateRegion();
            console.log(`区域拓展出的${this.hexes}`)
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
            } else {
                isExpandArea = false;
            }


        }
        
        hexesList.forEach(hex => {
            hex.drawHex(ctx, hexGrid.layout);
        });
        // changeRegion.drawRegionLabel(hexGrid.layout,ctx);
        // changeRegion.drawRegionLabel(hexGrid.layout,labelCtx);
        hexGrid.updateAllRegionsLabels(labelCtx);

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
                    regionHex.region = null;
                    regionHex.type = "自由";
                    regionHex.drawHex(ctx, hexGrid.layout);
                    return true;
                }
                
                return false; // 过滤掉需要清除的格子
            });
        } else {
            // 清除整个区域
            this.hexes.forEach(regionHex => {
                regionHex.region = null;
                regionHex.type = "自由";
                regionHex.drawHex(ctx, hexGrid.layout);
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
        
        console.log('脏污bug排查 - 邻居区域数量:', Array.from(neighborRegionCount.entries()).map(([region, count]) => ({ region: region.name, count })));
        const innerEffectArea = [];
        neighborRegionCount.forEach((count, region) => {
            console.log(`Region ${region.name} has count: ${count}`);
            if (count >= 3) {
                console.log(`Region ${region.name} has effect with count: ${count}`);
                innerEffectArea.push(region);
            }
        });
        console.log(`${this.name}最终的效应区域: ${innerEffectArea}`);
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
            console.log(`脏污bug排查 1  - 区域: ${region.name}, 类型: ${regionType}, 脏污效果: ${pollutionEffect}`);
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
            console.log(`${this.name}脏污排查 1 - `);
            console.log('脏污排查 1 Inner Effect Detail List:', innerEffectDetailList);
            return innerEffectDetailList;
        } else if (param === 'a') {
            console.log(`${this.name}脏污排查 2 - `);
            console.log( '脏污排查2 Inner Effect Count List:', innerEffectCountList);
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
    
            console.log(`${this.name} - 脏污排查 3 - `);
            console.log('脏污排查3 Total Effects: ', totalEffects );
            return totalEffects;
        }
    }

    //外反馈 外面有三个同类型区域的格子就生效
    getOuterEffectArea() {
        // 获取环圈的所有格子
        const oneRingHexes = this.getAreaOneRingHex();
        console.log("One Ring Hexes:", oneRingHexes);
    
        // 过滤出类型为 "属地" 的格子
        const filteredHexes = oneRingHexes.filter(hex => hex.type === "属地");
        console.log("Filtered Hexes (type '属地'):", filteredHexes);
    
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
                    console.log(`Adding to outerEffectArea - Region: ${region}, Brush: ${hex.brush}`);
                    outerEffectArea.push({ region: region, brush: hex.brush });
                }
            }
        });
        console.log('外部区域排查2', this.name)
        console.log("外部区域排查2 - Final Outer Effect Area:", outerEffectArea);
        return outerEffectArea;
    }
    
    getouterEffect() {
        // 获取外部效果区域
        const outerEffectArea = this.getOuterEffectArea();
        
        // 构造结果列表，仅包含每个元素的 region
        const result = outerEffectArea.map(item => item.region);
        console.log('外部区域排查3', this.name)
        console.log(" 外部区域排查3 - Outer Effect Summary (Regions):", result);
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
        return this.effectHubs.length || 0 ;
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

// 更新工具栏视图
function updateToolbarView(isExpanded = true) {
    let toolbarContainer = document.getElementById('toolbarContainer');
    const parentToolbar = document.getElementById('toolbar1');
    if (!toolbarContainer) {
      toolbarContainer = document.createElement('div');
      toolbarContainer.id = 'toolbarContainer';
    }

    // 将工具栏容器插入到 toolbar1 中
    if (parentToolbar) {
        parentToolbar.appendChild(toolbarContainer);
    } else {
        console.error('Parent toolbar element with id "toolbar1" not found');
        return;
    }
  
    // 设置工具栏容器的样式
    setToolbarStyle(toolbarContainer);
  
    // 清空现有的工具栏内容
    toolbarContainer.innerHTML = '';
    let rows = [];
    // 创建每行容器并添加按钮
    if (isExpanded) {
        rows = [5,4,4,4,1];
    } else {
        rows = [5];
    }
     // 每行显示三个按钮
    let brushKeys = Object.keys(brushMap);
    let currentIndex = 0;
  
    rows.forEach(rowCount => {
      const rowContainer = document.createElement('div');
      rowContainer.style.display = 'flex';
      rowContainer.style.gap = '20px';
      rowContainer.style.justifyContent = 'flex-start'; // 左对齐
      rowContainer.style.alignItems = 'flex-start'; // 确保每行的按钮与顶部对齐
  
      for (let i = 0; i < rowCount; i++) {
        if (currentIndex >= brushKeys.length) break;
  
        const key = brushKeys[currentIndex];
        const button = brushMap[key];
        const buttonWrapper = document.createElement('div');
        buttonWrapper.style.display = 'flex';
        buttonWrapper.style.flexDirection = 'column';
        buttonWrapper.style.alignItems = 'center';
  
        const btnElement = createColorButton(button, key);
        buttonWrapper.appendChild(btnElement);
  
        // 标签
        const labelElement = document.createElement('div');
        labelElement.className = 'color-name';
        labelElement.textContent = key;
        labelElement.style.marginTop = '5px';
        labelElement.style.fontSize = '14px';
        labelElement.style.textAlign = 'center';
  
        buttonWrapper.appendChild(labelElement);
        rowContainer.appendChild(buttonWrapper);
        currentIndex++;
      }
  
      toolbarContainer.appendChild(rowContainer);
    });
  
    controlGrid(toolbarContainer, isExpanded);

    // 创建颜色按钮
    function createColorButton(button, key) {
        const btnElement = document.createElement('div');
        btnElement.className = 'color-button';
        btnElement.style.backgroundColor = button.color;
        btnElement.style.border = '2px solid black';
        btnElement.style.width = '40px';
        btnElement.style.height = '40px';
        btnElement.style.display = 'flex';
        btnElement.style.alignItems = 'center';
        btnElement.style.justifyContent = 'center';
        btnElement.style.cursor = 'pointer';
        btnElement.style.borderRadius = '8px';
    
        // 勾选色块
        const checkmark = document.createElement('span');
        checkmark.className = 'checkmark';
        checkmark.textContent = '✔';
        checkmark.style.fontSize = '28px';
        checkmark.style.fontWeight = 'bold';
        checkmark.style.color = button.color === '#FFF' ? 'black' : 'white';
        btnElement.appendChild(checkmark);
    
        if (key === selectedBrush) {
        btnElement.classList.add('selected');
        checkmark.style.display = 'block';
        } else {
        checkmark.style.display = 'none';
        }
    
        btnElement.onclick = () => {
        const previousSelected = document.querySelector('.color-button.selected');
        if (previousSelected) {
            previousSelected.classList.remove('selected');
            previousSelected.querySelector('.checkmark').style.display = 'none';
        }
        clickSelectedBrush(key);
        btnElement.classList.add('selected');
        checkmark.style.display = 'block';
        };
        return btnElement;
    }

      // 更换画笔会发生 列表清空 + 阈值更换
    function clickSelectedBrush(key) {
        if (selectedBrush !== key) {
            selectedBrush = key;
            detectedHexList = []; // 如果画笔和之前的画笔不同，则将hexlist清空
            brushThreshold = brushMap[key].threshold;

            updateDetectedHexListView();
        }
    }
    // 添加控制滑动条（布局选择、尺寸调整、最大半径、ID显示控制）
    function controlGrid(toolbarContainer, isExpanded) {
        if (isExpanded) {
            const layoutSelector = document.createElement('div');
            layoutSelector.innerHTML = `
            <label for="layoutSelector">布局方式:</label>
            <select id="layoutSelector">
                <option value="pointy">尖顶</option>
                <option value="flat">平顶</option>
            </select>
            `;
            toolbarContainer.appendChild(layoutSelector);
            document.getElementById('layoutSelector').addEventListener('change', (event) => {
            hexGrid.setLayout(event.target.value);
            });
        
            const hexSizeSlider = document.createElement('div');
            hexSizeSlider.innerHTML = `
            <label for="hexSizeSlider">格子尺寸:</label>
            <input type="range" id="hexSizeSlider" min="24" max="80" value="30">
            <span id="hexSize">30</span>
            `;
            toolbarContainer.appendChild(hexSizeSlider);
            document.getElementById('hexSizeSlider').addEventListener('input', (event) => {
                const hexSize = Number(event.target.value);
                document.getElementById('hexSize').textContent = hexSize;
                hexGrid.setHexSize(Number(event.target.value));
            });
        
            const maxRadiusSlider = document.createElement('div');
            maxRadiusSlider.innerHTML = `
            <label for="maxRadiusSlider">最大半径:</label>
            <input type="range" id="maxRadiusSlider" min="1" max="30" value="6">
            <span id="maxRadiusValue">6</span>
            `;
            toolbarContainer.appendChild(maxRadiusSlider);
            document.getElementById('maxRadiusSlider').addEventListener('input', (event) => {
            const radius = Number(event.target.value);
            document.getElementById('maxRadiusValue').textContent = radius;
            hexGrid.setMaxRadius(radius);
            });
        
            const showIDButton = document.createElement('button');
            showIDButton.id = 'showIDButton';
            showIDButton.textContent = hexGrid.showID ? '隐藏 ID' : '显示 ID'; // 根据当前状态设置按钮文本
            toolbarContainer.appendChild(showIDButton);
            
            showIDButton.addEventListener('click', () => {
                hexGrid.setShowID(!hexGrid.showID);
                showIDButton.textContent = hexGrid.showID ? '隐藏 ID' : '显示 ID'; // 更新按钮文本
            });

            // 创建显示/隐藏标签按钮并添加功能
            const showLabelButton = document.createElement('button');
            showLabelButton.id = 'showLabelButton';
            showLabelButton.textContent = hexGrid.isShowRegionLabel ? '隐藏标签' : '显示标签'; // 根据当前状态设置按钮文本
            toolbarContainer.appendChild(showLabelButton);

            showLabelButton.addEventListener('click', () => {
                // 切换显示标签的状态
                hexGrid.isShowRegionLabel = !hexGrid.isShowRegionLabel;

                // 更新按钮文本
                showLabelButton.textContent = hexGrid.isShowRegionLabel ? '隐藏标签' : '显示标签';

                // 调用方法来显示或隐藏标签
                hexGrid.showRegionLabel(labelCtx);
                // FIX: 不能清除掉下方的格子，要不就跟显示ID一样启动重新绘制吧 hexGrid.setShowID(!hexGrid.showID);
                hexGrid.hexes.forEach(hex => {
                    hex.drawRegion(ctx, hexGrid.layout, hexGrid.isShowRegionLabel);
                });
            });

            const cleanGridButton = document.createElement('button');
            cleanGridButton.id = 'cleanGridButton';
            cleanGridButton.textContent = "清除所有格子"
            toolbarContainer.appendChild(cleanGridButton);
            
            cleanGridButton.addEventListener('click', () => {
                hexGrid.cleanGrid();
                cleanGridButton.textContent = "清除所有格子"
            });
        }


        const expandButton = document.createElement('button');
        expandButton.id = 'expandButton';
        expandButton.textContent = isExpanded ? '收起' : '更多';
        toolbarContainer.appendChild(expandButton);

        expandButton.addEventListener('click', () => {
            isExpanded = !isExpanded;
            updateToolbarView(isExpanded);
            expandButton.textContent = isExpanded ? '更多' : '收起';
        });

    }
}

// 设置工具栏容器的样式
function setToolbarStyle(toolbarContainer) {
    toolbarContainer.style.position = 'fixed';
    toolbarContainer.style.display = 'flex';
    toolbarContainer.style.flexDirection = 'column'; // 工具栏列排列
    toolbarContainer.style.gap = '20px'; // 控制行间距
    toolbarContainer.style.backgroundColor = 'rgba(255, 255, 255, 0.85)'; // 设置白色背景
    toolbarContainer.style.padding = '10px'; // 添加内边距
    // toolbarContainer.style.border = '2px solid #ccc'; // 添加一个浅色边框
    toolbarContainer.style.borderRadius = '8px'; // 让边角圆润一些
    // toolbarContainer.style.boxShadow = '0px 4px 10px rgba(0, 0, 0, 0.1)'; // 添加阴影效果
}

// 阈值指示区域
function updateDetectedHexListView() {
    let detectedContainer = document.getElementById('detectedHexListContainer');
    if (!detectedContainer) {
        detectedContainer = document.createElement('div');
        detectedContainer.id = 'detectedHexListContainer';
        document.body.appendChild(detectedContainer);
    }

    // 使用 setToolbarStyle 设置样式
    setToolbarStyle(detectedContainer);
    detectedContainer.style.right = '1%'; // 位置调整到右上角
    detectedContainer.style.left = ''; // 清除左边距的设置

    // 清空现有的内容
    detectedContainer.innerHTML = '';

    // 添加元素数量显示
    const countElement = document.createElement('div');
    countElement.innerHTML = `<strong>连续:</strong> ${detectedHexList.length} / ${brushMap[selectedBrush].threshold} <br>模式 ${isExpandArea ? "可拓展" : '建造'}`;
    detectedContainer.appendChild(countElement);

    // 添加每个元素的 ID 显示
    detectedHexList.forEach(hex => {
        const hexElement = document.createElement('div');
        hexElement.textContent = `${hex.id} `;
        // 设置居中样式
        hexElement.style.display = 'flex';
        hexElement.style.justifyContent = 'center';
        hexElement.style.alignItems = 'center';
        detectedContainer.appendChild(hexElement);
    });
}

// 区域信息显示
function updateRegionCards() {
    const parentToolbar = document.getElementById('toolbar2');
    let regionContainer = document.getElementById('regionContainer');
    let toggleButton = document.getElementById('toggleButton');

    //卡片容器样式
    if (!regionContainer) { 
        // 创建容器 
        regionContainer = document.createElement('div'); 
        regionContainer.id = 'regionContainer'; 
        regionContainer.style.position = 'fixed'; 
        regionContainer.style.bottom = '20px'; 
        regionContainer.style.left = '1%'; 
        // regionContainer.style.transform = 'translateX(-50%)'; 
        regionContainer.style.height = 'min-content';
        regionContainer.style.maxHeight = '20%'; // 调整高度适应更多内容
        regionContainer.style.width = 'min-content'; // 最小适应
        regionContainer.style.maxWidth = '95%'; // 最大宽度为页面的90%
        regionContainer.style.overflowX = 'auto'; // 确保容器在内容溢出时显示水平滚动条
        regionContainer.style.overflowY = 'auto'; // 禁止纵向滚动
        regionContainer.style.whiteSpace = 'nowrap'; // 确保卡片在同一行显示
        regionContainer.style.backgroundColor = 'rgba(255, 255, 255, 0.95)'; 
        regionContainer.style.border = '1px solid #ccc'; 
        regionContainer.style.padding = '15px'; 
        regionContainer.style.borderRadius = '12px'; 
        regionContainer.style.display = 'flex'; 
        regionContainer.style.alignItems = 'flex-start';  // 卡片相对于容器顶部对齐 
        regionContainer.style.boxShadow = '0px 8px 15px rgba(0, 0, 0, 0.2)'; // 增加阴影效果
        regionContainer.style.zIndex = '999';
        parentToolbar.appendChild(regionContainer); 
    }

    // 创建或获取切换按钮
    if (!toggleButton) {
        toggleButton = document.createElement('button');
        toggleButton.id = 'toggleButton';
        toggleButton.textContent = '收起';
        toggleButton.style.position = 'fixed';
        toggleButton.style.bottom = '22%';
        toggleButton.style.left = '1%';
        toggleButton.style.zIndex = '1000';
        toggleButton.style.padding = '8px 12px';
        toggleButton.style.border = 'none';
        toggleButton.style.borderRadius = '6px';
        toggleButton.style.backgroundColor = '#ecf1fe';
        toggleButton.style.color = '#7d8391';
        toggleButton.style.cursor = 'pointer';
        toggleButton.onclick = function () {
            if (regionContainer.style.display === 'none') {
                regionContainer.style.display = 'flex';
                toggleButton.textContent = '收起';
                toggleButton.style.bottom = '22%';
            } else {
                regionContainer.style.display = 'none';
                toggleButton.textContent = '查看区域信息';
                toggleButton.style.bottom = '5%';
            }
        };
        parentToolbar.appendChild(toggleButton);
    }

    // 封装一个用于创建垂直区域列表的函数
    function createVerticalList(titleText, items, param = 'p', titleFontSize = null) {
        // 创建标题元素
        const title = document.createElement(param);
        title.textContent = titleText;
        title.style.fontSize = titleFontSize;
        // 创建无序列表元素
        const list = document.createElement('ul');
        list.style.margin = '0';
        list.style.paddingLeft = '20px';

        // 为每个元素创建列表项
        items.forEach(item => {
            const listItem = document.createElement('li');
            listItem.textContent = item;
            listItem.style.fontSize = '14px';
            list.appendChild(listItem);
        });

        // 创建一个容器元素，用于将标题和列表组合
        const container = document.createElement('div');
        container.appendChild(title);
        container.appendChild(list);

        return container;
    }

    // 用于呈现 InnerEffect 的结果到 UI 上
    function renderInnerEffectUI(innerEffectData, param) {
        const container = document.createElement('div');
        let listData;
        if (param === 'd') {
            listData = innerEffectData('d');
            listData.forEach(detail => {
                let items = [];
                if (detail.pollution === null) {
                    items = [`${detail.heat}`];
                } else {
                    items = [`${detail.heat}`, `${detail.pollution}`];
                }
                const list = createVerticalList(`${detail.region}`, items);
                container.appendChild(list);
            });
        } else if (param === 'a') {
            listData = innerEffectData('a');
            listData.forEach(effect => {
                let items = [];
                if (effect.disease === null && effect.pollution === null) {
                    items = [`${effect.heat}`];
                } else if (effect.disease === null){
                    items = [`${effect.heat}`, `${effect.pollution}`];
                } else if (effect.pollution === null){
                    items = [`${effect.heat}`, `${effect.disease}`];
                } else {
                    items = [`${effect.heat}`, `${effect.pollution}`, `${effect.disease}`];
                }
                const list = createVerticalList(`${effect.type}`, items);
                container.appendChild(list);
            });
        } else if (param === 't') {
            const totalEffects = innerEffectData('t');
            const items = [
               
                `热能: ${totalEffects.heat}`,
                `脏污: ${totalEffects.pollution}`,
                `疾病: ${totalEffects.disease}`
            ];
            const title = `效应区域数: ${totalEffects.region}`;
            const list = createVerticalList(title, items);
            container.appendChild(list);
        }
        return container;
    }
    //卡片样式
    function createStyledCard(backgroundColor = '#f9f9c5') {
        const card = document.createElement('div');
        card.style.flex = '0 0 auto'; // 固定宽度，不被挤压
        card.style.width = '150px';
        card.style.marginRight = '15px';
        card.style.padding = '15px';
        card.style.border = '1px solid #ccc';
        card.style.borderRadius = '12px';
        card.style.backgroundColor = backgroundColor; // 使用略浅的颜色
        card.style.boxShadow = '0px 4px 8px rgba(0, 0, 0, 0.1)';
        return card;
    }
    regionContainer.innerHTML = ''; // 清空容器内容

    // 添加区域内容统计卡片
    const summaryCard = createStyledCard('#f9f9c5');
    const summaryTitle = document.createElement('h4');
    summaryTitle.textContent = `统计信息`;
    summaryTitle.style.marginBottom = '10px'; // 增加间距
    summaryCard.appendChild(summaryTitle);

    // 获取区域统计信息
    const regionStats = hexGrid.regionStatistics();
    const regionItems = Object.entries(regionStats).map(([type, count]) => `${type}: ${count}`);
    const regionStatList = createVerticalList(`总区域数: ${hexGrid.regions.length}`, regionItems);
    summaryCard.appendChild(regionStatList);

    // 获取枢纽统计信息
    const hubStats = hexGrid.hubsStatistics();
    const hubItems = Object.entries(hubStats).map(([type, count]) => `${type}: ${count}`);
    const hubStatList = createVerticalList(`总枢纽数: ${hexGrid.hubs.length}`, hubItems);
    summaryCard.appendChild(hubStatList);

    regionContainer.appendChild(summaryCard);

    // 每个区域的内容卡片
    hexGrid.regions.forEach(region => {
        const card = createStyledCard('white')

        const name = document.createElement('h4');
        name.textContent = `${region.name}`;
        name.style.marginBottom = '8px';
        card.appendChild(name);

        const type = document.createElement('p');
        type.textContent = `类型: ${region.type}`;
        type.style.fontSize = '10px';
        type.style.color = 'gray';
        card.appendChild(type);

        const hexCount = document.createElement('p');
        hexCount.textContent = `格子数量: ${region.hexes.length}`;
        card.appendChild(hexCount);

        const neighborCount = document.createElement('p');
        neighborCount.textContent = `邻居数量: ${region.getAreaOneRingHex().length}`;
        card.appendChild(neighborCount);

        if (region.innerEffectArea.length > 0 || region.totalHubsCount > 0) {
            const totalEffectsTitle = document.createElement('h4');
            totalEffectsTitle.textContent = `效应总计`;
            totalEffectsTitle.style.marginBottom = '8px';
            card.appendChild(totalEffectsTitle);

            const totalEffects = region.InnerEffect('t');
            let regionCount = totalEffects.region
            const title = document.createElement('p');
            title.textContent = `区域总数: ${regionCount}`;
            // title.style.fontSize = '20px';
            card.appendChild(title)
            let listTitle = `枢纽总数: ${region.totalHubsCount}`;
            let listItems = region.effectSummary;
            const effectSummaryList = createVerticalList(listTitle, listItems);
            card.appendChild(effectSummaryList);

        }
        if (region.innerEffectArea.length > 0) {

            
            // const totalEffectsList = renderInnerEffectUI(region.InnerEffect.bind(region), 't');
            // card.appendChild(totalEffectsList);


            const titleAcount = document.createElement('h4');
            titleAcount.textContent = `效应分类统计`;
            titleAcount.style.marginBottom = '8px';
            card.appendChild(titleAcount);
            
            const innerEffectCountList = renderInnerEffectUI(region.InnerEffect.bind(region), 'a');
            card.appendChild(innerEffectCountList);

            const titleDetail = document.createElement('h4');
            titleDetail.textContent = `效应细节`;
            titleDetail.style.marginBottom = '8px';
            card.appendChild(titleDetail);

            const innerEffectDetailList = renderInnerEffectUI(region.InnerEffect.bind(region), 'd');
            card.appendChild(innerEffectDetailList);
        }
        // 获取并显示枢纽效应统计
        const effectStats = region.hubsEffectStat;
        if (Object.keys(effectStats).length > 0) {
            const effectTitle = document.createElement('h4');
            effectTitle.textContent = `枢纽效应统计：`;
            effectTitle.style.marginBottom = '10px';
            card.appendChild(effectTitle);

            // 使用封装的函数创建“枢纽效应”列表
            Object.entries(effectStats).forEach(([brushType, data]) => {
                const listTitle = `${brushType}`;
                const listItems = [
                    `数量: ${data.count}`,
                    `${data.effectType}`,
                    `总效应: ${data.totalEffect}`
                ];
                const hubEffectList = createVerticalList(listTitle, listItems);
                card.appendChild(hubEffectList);
            });
        }
        if (region.outerEffect.length > 0) {
            const outerEffectList = createVerticalList('外馈区域:', region.outerEffect, 'h4');
            card.appendChild(outerEffectList);
        }




        // 动态调整卡片高度
        card.style.height = 'auto';

        regionContainer.appendChild(card);
    });
    // 枢纽的内容卡片
    hexGrid.hubs.forEach(hub => {
        const card = createStyledCard('white')

        const hubEffect = hub.hubEffect;
        const hubEffectArea = hub.findEffectedArea;

        const name = document.createElement('h4');
        name.textContent = `${hub.region}`;
        name.style.marginBottom = '8px';
        card.appendChild(name);

        const effect = document.createElement('p');
        effect.textContent = `${hubEffect.effect}`;
        effect.style.fontSize = '10px';
        effect.style.color = 'gray';
        card.appendChild(effect);

        // 使用封装的函数创建“内效区域”列表
        if (hub.effectedArea !== 0) {
            const hexCount = document.createElement('p');
            hexCount.textContent = `总效应: ${hubEffect.effectValue * hubEffectArea.length}`;
            card.appendChild(hexCount);

            const effectAreaList = createVerticalList(`覆盖数: ${hubEffectArea.length}`, hubEffectArea);
            card.appendChild(effectAreaList);
        }

        // 动态调整卡片高度
        card.style.height = 'auto';

        regionContainer.appendChild(card);
    });

}

//提示框
function toggleCustomPrompt(show = true, textContent = '是否执行操作？', confirmCallback = null) {
    const existingPrompt = document.getElementById('customPrompt');

    if (!show && existingPrompt) {
        document.body.removeChild(existingPrompt);
        customPromptShown = false;
        return;
    }

    if (show && customPromptShown) {
        return;
    }

    if (show) {
        const promptElement = document.createElement('div');
        promptElement.id = 'customPrompt';
        setToolbarStyle(promptElement);
        promptElement.style.position = 'fixed';
        promptElement.style.top = '50%';
        promptElement.style.left = '50%';
        promptElement.style.transform = 'translate(-50%, -50%)';
        promptElement.style.zIndex = '999';

        const text = document.createElement('span');
        text.textContent = textContent;
        promptElement.appendChild(text);

        const buttonContainer = document.createElement('div');
        buttonContainer.style.display = 'flex';
        buttonContainer.style.flexDirection = 'row';
        buttonContainer.style.marginTop = '10px';
        buttonContainer.style.justifyContent = 'center';
        buttonContainer.style.gap = '10px';

        const confirmButton = document.createElement('button');
        confirmButton.textContent = '✔';
        confirmButton.addEventListener('click', () => {
            if (confirmCallback) {
                confirmCallback();
            }
            document.body.removeChild(promptElement);
            customPromptShown = false;
        });
        buttonContainer.appendChild(confirmButton);

        const cancelButton = document.createElement('button');
        cancelButton.textContent = '✖';
        cancelButton.addEventListener('click', () => {
            document.body.removeChild(promptElement);
            customPromptShown = false;
        });
        buttonContainer.appendChild(cancelButton);

        promptElement.appendChild(buttonContainer);
        document.body.appendChild(promptElement);
        customPromptShown = true;
    }
}

// 调整画布
function resizeCanvas() {
    canvas.width = window.innerWidth * 2;
    canvas.height = window.innerHeight * 2;
    labelCanvas.width = window.innerWidth * 2;
    labelCanvas.height = window.innerHeight * 2;
    tipsCanvas.width = window.innerWidth * 2;
    tipsCanvas.height = window.innerHeight * 2;
        // 更新原点位置为画布中心
    hexGrid.layout.origin = new Point(canvas.width / 2, canvas.height / 2);
    // 将视窗滚动到画布的中心
    setTimeout(() => {
        // 将窗口滚动到画布的中心
        window.scrollTo({
            left: (canvas.width / 2) - (window.innerWidth / 2),
            top: (canvas.height / 2) - (window.innerHeight / 2),
            behavior: 'auto'  // 保证刷新后直接到达目标位置
        });
    }, 0);
    // 重新绘制格子
    hexGrid.drawHexagons();
}

// 封装右键拖动滚动的功能为一个类
class RightClickDragScroller {
    constructor() {
        this.isRightMouseDown = false;
        this.startX = 0;
        this.startY = 0;
        this.init();
    }

    init() {
        // 监听鼠标按下事件
        window.addEventListener('mousedown', this.onMouseDown.bind(this));
        // 监听鼠标移动事件
        window.addEventListener('mousemove', this.onMouseMove.bind(this));
        // 监听鼠标释放事件
        window.addEventListener('mouseup', this.onMouseUp.bind(this));
        // 取消默认的右键菜单事件
        window.addEventListener('contextmenu', this.onContextMenu.bind(this));
    }

    onMouseDown(event) {
        // 判断是否为右键
        if (event.button === 2) {
            this.isRightMouseDown = true;
            this.startX = event.clientX;
            this.startY = event.clientY;
            document.body.style.cursor = 'grab'; // 鼠标变为小手
        }
    }

    onMouseMove(event) {
        if (this.isRightMouseDown) {
            const deltaX = this.startX - event.clientX;
            const deltaY = this.startY - event.clientY;
            
            // 滚动窗口
            window.scrollBy(deltaX, deltaY);
            
            // 更新起始点
            this.startX = event.clientX;
            this.startY = event.clientY;
        }
    }

    onMouseUp(event) {
        // 当右键释放时，停止滚动
        if (event.button === 2) {
            this.isRightMouseDown = false;
            document.body.style.cursor = 'default'; // 恢复默认光标
        }
    }

    onContextMenu(event) {
        event.preventDefault();
    }
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

canvas.addEventListener('click', (event) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    const hexId = hexGrid.getHexIdFromMouse(mouseX, mouseY);
    console.log('Clicked Hex ID:', hexId);

    const hex = hexGrid.getHexById(hexId);

    if (hex) {
        hex.setbrush(selectedBrush, hexGrid);

        updateDetectedHexListView(); // 更新显示模块
        // 仅重绘这个被单击的 Hex
        hex.drawHex(ctx, hexGrid.layout);
    };

    // 如果点击了第6、9、12个格子 提示建立区域
    if ([6, 9, 12].includes(detectedHexList.length)) {
        toggleCustomPrompt(true, '是否建立区域？', () => {
            Region.createRegion();
            hexGrid.updateAllRegions();
            updateRegionCards();
        });
    } else {
        toggleCustomPrompt(false);
    }
});

// 鼠标移动事件监听器
canvas.addEventListener('mousemove', (event) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    const hexId = hexGrid.getHexIdFromMouse(mouseX, mouseY);

    // 更新当前悬停的格子
    const hoveredHex = hexGrid.getHexById(hexId);
    if (hoveredHex) {
        // 绘制新的高亮效果（如果 showID 为 false，则悬停时显示 ID）
        const showHoverId = !hexGrid.showID; // 悬停时如果 showID 为 false 则显示 ID
        tipsCtx.clearRect(0, 0, canvas.width, canvas.height); // 清除高亮层
        hoveredHex.drawHoverHex(tipsCtx, hexGrid.layout, '#EEFFB3', 0.5, showHoverId);
    }
});

// 鼠标离开画布时清除高亮
canvas.addEventListener('mouseleave', () => {
    tipsCtx.clearRect(0, 0, canvas.width, canvas.height); // 清除高亮层
});

hexGrid = new HexGrid();
// 在页面加载后立即调用 resizeCanvas，确保正确显示画布中心
window.addEventListener('load', resizeCanvas);
//窗口变动
window.addEventListener('resize', resizeCanvas);

// 初始化
resizeCanvas();
hexGrid.drawHexagons();
updateToolbarView();

// 创建一个 RightClickDragScroller 实例来启用功能
const rightClickDragScroller = new RightClickDragScroller();
// window.onload = function() {
//     const hexInfoDisplay = new HexInfoDisplay('hexCanvas', hexGrid, 'hexInfoBox');
// };


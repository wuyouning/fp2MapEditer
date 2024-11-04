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
// let selectedBrush = new Brush('居住区');
// let hexGrid = new HexGrid();
// let isPromptShow = false;

class Hex {
    constructor(q, r, s, brush = '擦除', regionName = null, type = '空白', size, ctx) {
        this.q = q;
        this.r = r;
        this.s = s;
        if (Math.round(q + r + s) !== 0) {
            throw "q + r + s 必为 0";
        }
        this.id = `${q}_${r}_${s}`; // 生成唯一ID
        this.brush = brush;
        this.regionBelond = regionName;
        this.type = type;
        this.size = size;
        this.ctx = ctx;
        this.intensifiedColor = 'white';
    }

    //以下是基础操作

    add(b) {
        return new Hex(this.q + b.q, this.r + b.r, this.s + b.s);
    }

    scale(k) {
        return new Hex(this.q * k, this.r * k, this.s * k);
    }
    //借用外部原点
    neighbor(direction) {
        return this.add(Hex.directions[direction]);
    }
    //不借用外部原点的生成邻居
    getRingHexs(radius) {
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
    getoneRing() {
        return this.getRingHexs(1);
    }

    // 获取半径为2的邻居
    gettwoRing() {
        return this.getRingHexs(2);
    }

    //以下是设定格子需要进行逻辑运作
    //建立枢纽
    createHub(hubs, brush) {
        let index = 1;
        let newName = `${brush}-${index}`;
    
        // 使用 while 循环来确保 newName 是唯一的
        while ([...hubs].some(hub => hub.region === newName)) {
            index++;
            newName = `${brush}-${index}`;
        }
        this.regionBelond = newName;
        this.type = "枢纽";
        hubs.add(this); 
    }
    //清理格子
    clearHex() {
        this.brush = '擦除';
        this.type = '空白';
        this.regionBelond = null;
        selectedBrush.removeHexFromPending(this);
        //TODO: 更新画面
    }

    // setbrush(selectedBrush, hexGrid) {
    //     if (!this.type || this.type === '空白') {
    //         this.brush = selectedBrush.brush;
    //         this.type = selectedBrush.type;
    //         if (selectedBrush.type === '自由') {
    //             selectedBrush.joinPedingHexes(this);
    //         } else if (selectedBrush.type === '枢纽') {
    //             this.createHub(hexGrid.hubs, selectedBrush.name)
    //             this.updateEffectedRegions();
    //             updateRegionCards(); 
    //             //TODO: 更新推送
    //             //TODO: 一旦枢纽清除会造成效应计算重新计算，需要启动计算区域和枢纽的效应
    //         } else {
    //             console.log(`空白格子配置了什么${selectedBrush.name}？什么别做`)
    //             alert("已擦除")
    //         }
    //     } else if (this.type === '属地') {
    //         let region = null;
    //         for (let r of hexGrid.regions) {
    //             if (r.name === this.regionBelond) {
    //                 region = r;
    //                 break; // 找到匹配项后立即退出循环
    //             }
    //         }
    //         if(region) {
    //             region.cleanRegion(this, hexGrid);
    //             hexGrid.removeRegionByName(this.regionBelond);
    //             updateRegionCards(); 
    //             //TODO: 一旦区域清除会造成效应计算重新计算，需要启动计算区域和枢纽的效应
    //             //TODO: 更新画面 重画标签
    //         } else {
    //             console.log(`无法找到指定的区域格子`);
    //             alert('删除了一个有了区域，但是区域没有被收录的格子，有BUG')
    //         }
    //         this.clearHex();
    //     } else if (this.type === '枢纽') {
    //         //从其他区域里面删除掉枢纽效应
    //         this.removeEffectFromRegion();
    //         //gridhex中删除
    //         hexGrid.removeHubById(this.id);
    //         //TODO: 一旦枢纽清除会造成效应计算重新计算，需要启动计算区域和枢纽的效应
    //         updateRegionCards(); //更新效应卡 换个名字会不会好一点
    //         this.clearHex();
    //     } else if (this.type === '自由') {
    //         this.clearHex();
    //     } else {
    //         console.warn(selectedBrush);
    //         alert(`居然怎么样找不到它是什么类型的格子，太危险了，有BUG`)
    //     }

    //     //推送到所有区域进行重新计算效应 1.区域建立 2.枢纽建立 3.区域删除 4.枢纽删除
    //     //更新画面
    // }

    // => 💪 setbrush精简版本，看看能不能顺利运行下去 核心代码 处理核心逻辑后，在外部使用绘制格子重绘此格子
    setBrush(selectedBrush, hexGrid) {
        const isTypeEmpty = !this.type || this.type === '空白';
    
        switch (selectedBrush.type) {
            case '自由':
                if (isTypeEmpty) {
                    this.applyFreeBrush(selectedBrush);
                } else if (this.type === '自由') {
                    this.clearHex();
                }
                break;
    
            case '枢纽':
                if (isTypeEmpty) {
                    this.applyHubBrush(selectedBrush, hexGrid);
                } else if (this.type === '枢纽') {
                    this.removeHub(hexGrid);
                }
                break;
    
            case '空白':
                if (this.type === '属地') {
                    this.clearRegion(hexGrid);
                } else if (this.type === '自由') {
                    this.clearHex();
                } else if (this.type === '枢纽') {
                    this.removeHub(hexGrid);
                }
                break;
    
            default:
                console.warn(`未知的 selectedBrush.type: ${selectedBrush.type}`);
        }
    
    }
    
    // 应用 '自由' 类型的笔刷
    applyFreeBrush(selectedBrush) {
        this.brush = selectedBrush.brush;
        this.type = selectedBrush.type;
        selectedBrush.joinPedingHexes(this);
    }
    
    // 应用 '枢纽' 类型的笔刷
    applyHubBrush(selectedBrush, hexGrid) {
        this.brush = selectedBrush.brush;
        this.type = selectedBrush.type;
        this.createHub(hexGrid.hubs, selectedBrush.name);
        this.updateEffectedRegions();
        updateRegionCards();
    }
    
    removeHub(hexGrid) {
        this.removeEffectFromRegion();
        hexGrid.removeHubById(this.id);
        updateRegionCards();
        this.clearHex();
    }
    

    clearRegion(hexGrid) {
        const region = this.findRegion(hexGrid);
        if (region) {
            region.cleanRegion(this, hexGrid);
        } else {
            console.warn(`未找到区域: ${this.regionBelond}`);
        }
        this.clearHex();
    }
    //TODO:  查找区域 和 下方移除和添加重复了，看看有没有必要处理呗
    findRegion(hexGrid) {
        for (let r of hexGrid.regions) {
            if (r.name === this.regionBelond) {
                return r;
            }
        }
        return null;
    }
    

    

    // =>  格子所产生的数据信息 🙂 
    // 没有和笔刷强链接，用了查询表，出了问题再看看怎么弄
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
                if (!effectedArea[hex.regionBelond]) {
                    effectedArea[hex.regionBelond] = 0;
                }
                effectedArea[hex.regionBelond]++;
            }
        }

        // 检查是否有三个或以上相同的区域格子
        const effectedAreaList = Object.keys(effectedArea)
            .filter(regionBelond => effectedArea[regionBelond] >= 3);

        // 返回找到的受影响区域列表
        return effectedAreaList;
    }


    updateEffectedRegions() {
        const effectedAreaList = this.findEffectedArea;
        if (effectedAreaList) {
            for (const areaName of effectedAreaList) {
                const region = this.findRegionByName(areaName);
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
                const region = this.findRegionByName(areaName);
                if (region) {
                    region.effectHubs.delete(this); // 使用 Set 的 delete 方法
                }
            }
        }
    }

    findRegionByName(name) {
        for (const region of hexGrid.regions) {
            if (region.name === name) {
                return region; // 找到匹配项，返回该区域
            }
        }
        return null; // 未找到匹配项，返回 null
    }

    // =>  绘制格子UI的一系列配合

    //主程 画ID、画边缘、画标签
    drawHex(ctx, IdCtx, labelCtx, layout, showID, showLabel) {
        // 使用通用绘制多边形的方法，指定线条宽度和颜色
        this.drawPolygon(
                        ctx, 
                        layout,
                        this.setFillColor.bind(this), 
                        2, 
                        'rgba(168, 177, 197, 0.1)'
                    );

        // 绘制ID信息
        if (showID) {
            this.drawId(IdCtx, layout, this.polygonCorners(layout));
        }

        if (showLabel) {
            this.drawHexLabel(labelCtx, layout, showLabel);
        }

        // 判断是否绘制边缘或区域标签
        if (this.type === '属地') {
            this.drawHexEdges(ctx, layout);
        }
    }

    drawHoverHex(ctx, IdCtx, layout, hoverColor = '#FFDD44', alpha = 0.5) {
        // 设置外发光效果的属性
        ctx.shadowBlur = 15; // 外发光模糊半径
        ctx.shadowColor = 'rgba(255, 221, 68, 0.6)'; // 外发光的颜色
    
        // 使用通用绘制多边形的方法，指定悬停状态的线条宽度和颜色
        this.drawPolygon(ctx, layout, () => {
            ctx.fillStyle = hoverColor;
            ctx.globalAlpha = alpha;
        }, 1.5, 'rgba(255, 221, 68, 0.8)'); // 使用更浅的线条
    
        ctx.globalAlpha = 1.0; // 恢复透明度
    
        // 绘制悬停状态的ID信息
        this.drawId(IdCtx, layout, this.polygonCorners(layout));
    
        // 清除外发光效果，以免影响后续绘制
        ctx.shadowBlur = 0;
        ctx.shadowColor = 'transparent';
    }

    // 通用多边形绘制方法，包含线条配置
    drawPolygon(
                ctx, 
                layout, 
                fillCallback, 
                lineWidth = 2, 
                strokeStyle = 'rgba(168, 177, 197, 0.1)'
                ) {
        ctx.beginPath();
        const corners = this.polygonCorners(layout);
        ctx.moveTo(corners[0].x, corners[0].y);
        for (let i = 1; i < corners.length; i++) {
            ctx.lineTo(corners[i].x, corners[i].y);
        }
        ctx.closePath();

        // 设置填充样式
        if (typeof fillCallback === 'function') {
            fillCallback(ctx);
        }

        ctx.fill();

        // 设置线条样式并绘制
        ctx.lineWidth = lineWidth;
        ctx.strokeStyle = strokeStyle;
        ctx.stroke();
    }

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
            if (neighbor && neighbor.regionBelond === this.regionBelond) {
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

    drawHexLabel(labelCtx, layout, isShowLabel) {
        // 如果 type 是空白，则不显示任何文本
        if (this.type === '空白') {
            return;
        }
        if (isShowLabel) {
            const center = this.hexToPixel(layout);
            labelCtx.fillStyle = "rgb(74, 81, 57)";
            labelCtx.font = `${Math.max(10, this.size / 3)}px Arial`; // 根据 size 调整字体大小
            labelCtx.textAlign = "center";
            labelCtx.textBaseline = "middle";

            // 如果 region 为 null，显示 "自由"，否则显示 region 信息
            const text = this.regionBelond === null ? "自由" : this.regionBelond;
            labelCtx.fillText(text, center.x, center.y);
        } else {
            this.setFillColor(labelCtx);
        }
    }

    drawId(IdCtx, layout, corners) {
        const center = this.hexToPixel(layout); //或许需要一点边缘靠近
        IdCtx.fillStyle = "#adbdcd";
        IdCtx.font = `${(this.size / 2.5)}px Arial`; // 根据 size 调整字体大小

        // 计算偏移量，确保文本在格子内部且与中心点距离合适
        const offset = Math.min(this.size / 3.5, 8);
        if (layout.orientation.name === 'pointy') {
            IdCtx.textAlign = "center";
            IdCtx.textBaseline = "bottom";
            // 底部s
            IdCtx.fillText(`${this.q}`, corners[1].x, corners[1].y - offset);

            IdCtx.textAlign = "left";
            IdCtx.textBaseline = "hanging";
            //左上角
            IdCtx.fillText(`${this.r}`, corners[3].x + offset, corners[3].y);

            //右上角
            IdCtx.textAlign = "right";
            IdCtx.textBaseline = "hanging";
            IdCtx.fillText(`${this.s}`, corners[5].x - offset, corners[5].y);
        } else {
            IdCtx.textAlign = "left";
            IdCtx.textBaseline = "bottom";
            // 底部s
            // ctx.fillStyle = 'red';
            IdCtx.fillText(`${this.q}`, corners[2].x, corners[2].y - offset);

            IdCtx.textAlign = "left";
            IdCtx.textBaseline = "hanging";
            //左上角
            // ctx.fillStyle = 'blue';
            IdCtx.fillText(`${this.r}`, corners[4].x, corners[4].y + offset);

            // //右上角
            IdCtx.textAlign = "right";
            IdCtx.textBaseline = "middle";
            // ctx.fillStyle = 'green';
            IdCtx.fillText(`${this.s}`, corners[0].x - offset, corners[0].y);
        }
        IdCtx.stroke();
    }
    //FIX: 这里和笔刷没有链接，查看是否会出问题，出了问题再解决一下
    setFillColor(ctx) {
        if (brushMap[this.brush]) {  // 将 this.hex.brush 修改为 this.brush
            ctx.fillStyle = brushMap[this.brush].color;
        } else {
            ctx.fillStyle = 'dbe4ff'; // 默认颜色
            console.warn(`笔刷查询失败，无法配置正确的颜色 ${brushMap[this.brush]}`)
        }
        ctx.fill();
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

    // 绘制六个角
    polygonCorners(layout) {
        const corners = [];
        const center = this.hexToPixel(layout);
        for (let i = 0; i < 6; i++) {
            const offset = this.hexCornerOffset(layout, i);
            corners.push(new Point(center.x + offset.x, center.y + offset.y));
        }
        return corners;
    }



}

//两个辅助类
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
    isNeighborOfPendingHexes(hex) {
        // 遍历 pedingHexes 中的每一个格子，判断传入的 hex 是否与它们相邻
        for (let pendingHex of this.pedingHexes) {
            let neighbors = pendingHex.oneRing; // 获取待建格子的一环内邻居
            for (let neighbor of neighbors) {
                if (neighbor.q === hex.q && neighbor.r === hex.r && neighbor.s === hex.s) {
                    return true; // 传入的 hex 是 pedingHexes 中某格子的一环内邻居
                }
            }
        }
        return false; // 传入的 hex 与 pedingHexes 中的所有格子都不相邻
    }

    joinPedingHexes(hex) {
        // 检查当前待建格子数量是否小于阈值，且 hex 是否是邻居
        if (this.getPendingHexesCount() < this.threshold && this.isNeighborOfPendingHexes(hex)) {
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
    }

    initializeLayers() {
        return initializeCanvasLayers();
    }


}
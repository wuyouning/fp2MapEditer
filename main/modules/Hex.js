import { brushMap } from "../module.js";

export class Hex {
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
    getRingHexs(radius, hexGrid) {
        const neighbors = [];
        for (let dq = -radius; dq <= radius; dq++) {
            for (let dr = Math.max(-radius, -dq - radius); dr <= Math.min(radius, -dq + radius); dr++) {
                const ds = -dq - dr;
                if (dq !== 0 || dr !== 0 || ds !== 0) {
                    const hexId = `${this.q + dq}_${this.r + dr}_${this.s + ds}`;
                    // const hexId = this.add(new Hex(dq, dr, ds)).id; // 获取目标坐标的 Hex ID
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
    getOneRing(hexGrid) {
        return this.getRingHexs(1, hexGrid);
    }

    // 获取半径为2的邻居
    getTwoRing(hexGrid) {
        return this.getRingHexs(2, hexGrid);
    }

    //以下是设定格子需要进行逻辑运作


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
                    this.applyFreeBrush(selectedBrush, hexGrid);
                } else if (this.type === '自由') {
                    this.clearHex(selectedBrush);
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
                    this.clearHex(selectedBrush);
                } else if (this.type === '枢纽') {
                    this.removeHub(hexGrid);
                }
                break;
    
            default:
                console.warn(`未知的 selectedBrush.type: ${selectedBrush.type}`);
        }
        console.log('现在的笔刷',this.brush)
    
    }
    
    // 应用 '自由' 类型的笔刷
    applyFreeBrush(selectedBrush, hexGrid) {
        this.brush = selectedBrush.name;
        this.type = selectedBrush.type;
        selectedBrush.joinPedingHexes(this, hexGrid);
    }
    
    // 应用 '枢纽' 类型的笔刷
    applyHubBrush(selectedBrush, hexGrid) {
        this.brush = selectedBrush.name;
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
    clearHex(selectedBrush) {
        this.brush = '擦除';
        this.type = '空白';
        this.regionBelond = null;
        selectedBrush.removeHexFromPending(this);
        //TODO: 更新画面
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
        // FIX: 如果不去限制呢？
        if (showID) {
            this.drawId(IdCtx, layout, this.polygonCorners(layout));
        }

        if (showLabel) {
            this.drawHexLabel(labelCtx, layout, showLabel);
        }

        // 判断是否绘制边缘或区域标签
        if (this.type === '属地') {
            this.drawHexEdges(labelCtx, layout);
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
        // 计算六边形的中心位置
        const center = this.hexToPixel(layout);
        
        // 清除当前六边形区域
        const padding = this.size * 0.6; // 添加一些 padding 以确保清除范围足够覆盖文本区域
        labelCtx.clearRect(center.x - padding, center.y - padding, padding * 2, padding * 2);
    
        // 如果 type 是空白，则不显示任何文本
        if (this.type === '空白' || this.type === '属地') {
            return;
        }
    
        // 如果 isShowLabel 为 true，绘制文本
        if (isShowLabel) {
            labelCtx.fillStyle = "rgb(74, 81, 57)";
            labelCtx.font = `${Math.max(10, this.size / 3)}px Arial`; // 根据 size 调整字体大小
            labelCtx.textAlign = "center";
            labelCtx.textBaseline = "middle";
    
            // 如果 region 为 null，显示 "自由"，否则显示 region 信息
            const text = this.regionBelond === null ? "自由" : this.regionBelond;
            labelCtx.fillText(text, center.x, center.y);
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

export class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}
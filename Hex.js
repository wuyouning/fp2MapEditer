class Hex {
    constructor(q, r, s, brush = '擦除', region = null, type = "空白") {
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
        this.showID = showID;
    }

    add(b) {
        return new Hex(this.q + b.q, this.r + b.r, this.s + b.s);
    }

    scale(k) {
        return new Hex(this.q * k, this.r * k, this.s * k);
    }
    // 获取N环内的邻居
    getRingHexs(radius = 1) {
        const neighbors = [];
        for (let dq = -radius; dq <= radius; dq++) {
          for (let dr = Math.max(-radius, -dq - radius); dr <= Math.min(radius, -dq + radius); dr++) {
            const ds = -dq - dr;
            if (dq !== 0 || dr !== 0 || ds !== 0) {
              neighbors.push(this.add(new Hex(dq, dr, ds)));
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

    setbrush(selectedBrush, hexGrid) {
        let selectedBrushType = this.getBrushType(selectedBrush);
        
        if (!this.hexType || this.hexType === '空白') {
            this.brush = selectedBrush;
            this.hexType = this.getBrushType(selectedBrush); // 更新hexType
        //设置模块
            if (selectedBrushType === "自由") {
                console.log(`区域模块上色逻辑`);
            } else if (selectedBrushType === "枢纽") {
                this.hubGetName(hexGrid.hubs,selectedBrush)
            } else {
                this.clearHex()
            }
        } else if (this.hexType === '属地') {
            // HexGrid.regions 找到对应此ID的值后删除对应元素
            hexGrid.regions = hexGrid.regions.filter(region => region.id !== this.id);
            // 同区域格子剪除此属性标签
            this.clearHex()

        } else if (this.hexType === '枢纽') {

            // HexGrid.hubs 找到对应此ID的值后删除对应元素
            hexGrid.hubs = hexGrid.hubs.filter(hub => hub.id !== this.id);
            this.clearHex();
        } else if (this.hexType === '自由') {
            this.clearHex();
        } else {
            this.brush = selectedBrush;
        }

    }

    clearHex() {
        this.brush = '擦除';
        this.type = '空白';
        this.region = null;
    }

    hubGetName(hubs, brush) {
        let index = 1;
        let newName = `${brush}-${index}`;
        while (hubs.includes(newName)) {
            index++;
            newName = `${brush}-${index}`;
        }
        this.region = newName;
        hubs.push(newName);
    }

    drawHex(ctx, layout) {
        ctx.beginPath();
        const corners = this.polygonCorners(layout);
        ctx.moveTo(corners[0].x, corners[0].y);
        for (let i = 1; i < corners.length; i++) {
            ctx.lineTo(corners[i].x, corners[i].y);
        }
        ctx.closePath();

        // 根据 brush 的不同设置填充颜色
        this.setFillColor(ctx);

        ctx.strokeStyle = 'lightgray';
        ctx.stroke();

        // 绘制ID信息
        if (this.showID) {
            this.drawId(ctx, layout, corners);
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

    hexCornerOffset(layout, corner) {
        const angle = 2.0 * Math.PI * (corner + layout.orientation.start_angle) / 6;
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
        ctx.fillStyle = "gray";
        ctx.font = `${Math.max(8, this.size / 2.5)}px Arial`; // 根据 size 调整字体大小

        // 计算偏移量，确保文本在格子内部且与中心点距离合适
        const offset = this.size / 3.5;
        if (layout.orientation === hexGridView.layoutPointy) {
            ctx.textAlign = "center";
            ctx.textBaseline = "bottom";
            // 底部s
            ctx.fillText(`${this.s}`, corners[1].x, corners[1].y - offset);
    
            ctx.textAlign = "left";
            ctx.textBaseline = "hanging";
            //左上角
            ctx.fillText(`${this.q}`, corners[3].x + offset, corners[3].y);
    
            //右上角
            ctx.textAlign = "right";
            ctx.textBaseline = "hanging";
            ctx.fillText(`${this.r}`, corners[5].x - offset, corners[5].y);
        } else {
            ctx.textAlign = "left";
            ctx.textBaseline = "bottom";
            // 底部s
            ctx.fillStyle = 'red';
            ctx.fillText(`${this.s}`, corners[2].x, corners[2].y - offset);

            ctx.textAlign = "left";
            ctx.textBaseline = "hanging";
            //左上角
            ctx.fillStyle = 'blue';
            ctx.fillText(`${this.q}`, corners[4].x , corners[4].y + offset);

            // //右上角
            ctx.textAlign = "right";
            ctx.textBaseline = "middle";
            ctx.fillStyle = 'green';
            ctx.fillText(`${this.r}`, corners[0].x - offset, corners[0].y);
        }
        ctx.stroke();
    }

    setFillColor(ctx) {
        if (brushMap[this.hex.brush]) {
            ctx.fillStyle = brushMap[this.hex.brush].color;
        } else {
            ctx.fillStyle = 'white'; // 默认颜色
        }
        ctx.fill();
    }
    
}

//原点的邻居们
Hex.directions = [
    new Hex(1, 0, -1), new Hex(1, -1, 0), new Hex(0, -1, 1),
    new Hex(-1, 0, 1), new Hex(-1, 1, 0), new Hex(0, 1, -1)
];
export default Hex;
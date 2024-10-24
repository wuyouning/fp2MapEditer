import Hex from "./Hex";
class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

class HexGrid {
    constructor(hexSize = 30, maxRadius = 6, showID = true) {
        this.hexes = {}; //新建后的格子存储
        this.regions = []; //存储区域
        this.hubs = []; //存储枢纽
        this.hexSize = hexSize;
        this.maxRadius = maxRadius;
        this.showID = showID;
        this.layoutPointy = {
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
        console.log(`鼠标点击位置 ${x}, ${y}`);
    
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
    
        console.log(`得到的 ${q}, ${r}, ${s}`);
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
        for (const hex of hexagons) {
            const hexView = new HexView(hex, this.hexSize, this.showID);
            hexView.drawHex(ctx, this.layout);
            this.hexGrid.addHex(hex);
        }
    }
}

exports.HexGrid = HexGrid;
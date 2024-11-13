class RegionLabel {
    constructor(hexes) {
        this.hexes = hexes;
    }

    // 边缘格子取样
    getEdgeHexes() {
        // 假设每个 Hex 有一个 `neighbors` 属性，可以返回相邻的 Hex
        let edgeHexes = [];
        this.hexes.forEach(hex => {
            if (hex.neighbors.some(neighbor => !this.hexes.has(neighbor))) {
                edgeHexes.push(hex);
            }
        });
        return edgeHexes;
    }

    // 计算重心（几何中心）
    getCentroid() {
        let xSum = 0, ySum = 0;
        this.hexes.forEach(hex => {
            xSum += hex.x;
            ySum += hex.y;
        });
        return { x: xSum / this.hexes.size, y: ySum / this.hexes.size };
    }

    // 均匀取样
    getUniformSample() {
        let sampledHexes = [];
        const totalHexes = Array.from(this.hexes);
        const step = Math.floor(totalHexes.length / 4); // 简单均匀取样
        for (let i = 0; i < totalHexes.length; i += step) {
            sampledHexes.push(totalHexes[i]);
        }
        return sampledHexes;
    }

    // 随机取样
    getRandomSample(sampleSize = 4) {
        const totalHexes = Array.from(this.hexes);
        let sampledHexes = [];
        while (sampledHexes.length < sampleSize) {
            const randomHex = totalHexes[Math.floor(Math.random() * totalHexes.length)];
            if (!sampledHexes.includes(randomHex)) {
                sampledHexes.push(randomHex);
            }
        }
        return sampledHexes;
    }

    // 凸包取样
    getConvexHull() {
        const points = Array.from(this.hexes).map(hex => ({ x: hex.x, y: hex.y }));
        const hull = convexHull(points); // 使用凸包算法
        return hull.map(point => this.hexes.find(hex => hex.x === point.x && hex.y === point.y));
    }

    // 选择取样策略
    selectSamplePoints(method = 'edge') {
        switch (method) {
            case 'edge':
                return this.getEdgeHexes();
            case 'centroid':
                const centroid = this.getCentroid();
                return this.hexes.sort((a, b) => {
                    const distA = Math.sqrt(Math.pow(a.x - centroid.x, 2) + Math.pow(a.y - centroid.y, 2));
                    const distB = Math.sqrt(Math.pow(b.x - centroid.x, 2) + Math.pow(b.y - centroid.y, 2));
                    return distA - distB;
                }).slice(0, 4); // 选取距离重心最接近的几个格子
            case 'uniform':
                return this.getUniformSample();
            case 'random':
                return this.getRandomSample();
            case 'convex':
                return this.getConvexHull();
            default:
                return this.getEdgeHexes();
        }
    }
}

// 凸包算法，返回一个点集的凸包（最小凸多边形）
function convexHull(points) {
    // 使用 Graham 扫描算法计算凸包
    points = points.sort((a, b) => a.x - b.x || a.y - b.y);
    const lower = [];
    for (let i = 0; i < points.length; i++) {
        while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], points[i]) <= 0) {
            lower.pop();
        }
        lower.push(points[i]);
    }
    const upper = [];
    for (let i = points.length - 1; i >= 0; i--) {
        while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], points[i]) <= 0) {
            upper.pop();
        }
        upper.push(points[i]);
    }
    lower.pop();
    upper.pop();
    return lower.concat(upper);
}

// 叉积
function cross(o, a, b) {
    return (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
}

import { mainView } from "../../index.js";
import { initRegionsCard } from "../../Component/regionInfoCard.js";
import { superSumCard } from "../../index.js";

export class Region {
    constructor(name, hexes, type) {
        this.hexes = new Set(hexes || []); // 使用 Set 来存储 hexes
        this.type = type; //就是笔刷brush

        // 如果没有传入 name，自动生成一个默认名称
        if (!name) {
            const sameTypeRegions = [...mainView.hexGrid.regions].filter(region => region.type === type);
            this.name = `${type}-${sameTypeRegions.length + 1}`;
            
        } else {
            this.name = name;
        }

        this.effectHubs = new Set(); // 传输效应区域，检验计算正确与否
        //TODO: 区域的外部效应和内部效应都放在之类，通过回传更新存储，确保准确性
        this.innerEffectArea = this.getInnerEffectArea();
    }
    //纯粹生成
    static createRegion2(hexGrid, selectedBrush) {
        // 获取待扩展的集合
        const hexes = hexGrid.hexes;
        const pedingHexes = selectedBrush.pedingHexes;
    
        // 检查是否有待扩展的格子
        if (!pedingHexes || pedingHexes.size === 0) {
            alert('没有待扩展的格子');
            return;
        }
    
        // 创建新的区域对象，name 为空，使用 selectedBrush 的 name
        const newRegion = new Region(null, null, selectedBrush.name);
        console.log('hexGrid:', hexGrid);
        console.log('selectedBrush:', selectedBrush);
    
        // 更新属于该区域的 hexes
        const updatedHexes = new Set();
        pedingHexes.forEach(hex => {
            if (hexes.has(hex)) {
                // 更新 hex 的属性
                hex.regionBelond = newRegion.name;
                hex.type = "属地";
    
                // 将修改的 hex 添加到 updatedHexes 中
                updatedHexes.add(hex);
            }
        });
        
        // 全部信息填充后再绘制，可以保证边缘不会出错
        updatedHexes.forEach(hex => {
            if (hexes.has(hex)) {
                // 绘制 hex
                hex.drawHex(hexGrid);
            }
        });
        
        // 更新新区域的 hexes 集合
        newRegion.hexes = new Set(updatedHexes); // 确保 newRegion.hexes 是一个独立的集合
    
        // 将新区域添加到 hexGrid.regions 中
        hexGrid.regions.add(newRegion);
        console.log('打印区域', hexGrid.regions);
        
        // 更新 selectedBrush 中的待扩展 hexes 为一个新的 Set，以避免共享引用
        selectedBrush.pedingHexes = new Set(updatedHexes);
        
        // 切换扩展模式
        selectedBrush.toggleExpandMode(newRegion);
        
        // newRegion.drawMaxInscribedCircle(hexGrid.labelCtx);
        newRegion.drawRegionLabel(hexGrid.labelCtx);
        // TODO: 更新传导数据给其他区域和枢纽
    }

    // 创建与拓展 新建区域 重要主程
    static createRegion(hexGrid, selectedBrush) {
        // 获取待扩展的集合
        const hexes = hexGrid.hexes;
        const pedingHexes = selectedBrush.pedingHexes;
    
        // 检查是否有待扩展的格子
        if (!pedingHexes || pedingHexes.size === 0) {
            alert('没有待扩展的格子');
            return;
        }
    
        // 查找已存在的区域
        let existingRegion = null;
        for (let hex of pedingHexes) {
            if (hex.regionBelond) {
                // 如果已经存在一个区域名，则在 hexGrid 中寻找对应的区域
                existingRegion = Array.from(hexGrid.regions).find(region => region.name === hex.regionBelond);
                break; // 找到一个后即可退出循环
            }
        }
    
        // 如果找到已存在的区域，将格子合并到该区域
        if (existingRegion) {
            pedingHexes.forEach(hex => {
                if (hexes.has(hex)) {
                    // 更新 hex 的属性
                    hex.regionBelond = existingRegion.name;
                    hex.type = "属地";
    
                    // 将 hex 添加到 existingRegion 的 hexes 中
                    existingRegion.hexes.add(hex);
                }
            });
    
            // 绘制更新后的格子
            pedingHexes.forEach(hex => {
                if (hexes.has(hex)) {
                    hex.drawHex(hexGrid);
                }
            });
            existingRegion.drawRegionLabel(hexGrid.labelCtx);
            //不是很完美的清除和重建方案
            hexGrid.regionEdgeRedraw();
            console.log(`已将格子合并到现有区域: ${existingRegion.name}`);
        } else {
            // 如果没有现有的区域，创建一个新的区域
            const newRegion = new Region(null, null, selectedBrush.name);
    
            const updatedHexes = new Set();
            pedingHexes.forEach(hex => {
                if (hexes.has(hex)) {
                    hex.regionBelond = newRegion.name;
                    hex.type = "属地";
                    updatedHexes.add(hex);
                }
            });
    
            // 绘制更新后的格子
            updatedHexes.forEach(hex => {
                if (hexes.has(hex)) {
                    hex.drawHex(hexGrid);
                }
            });
    
            // 更新新区域的 hexes 集合
            newRegion.hexes = new Set(updatedHexes);
    
            // 将新区域添加到 hexGrid.regions 中
            hexGrid.regions.add(newRegion);
    
            newRegion.drawRegionLabel(hexGrid.labelCtx);
        }
    
        // 更新 selectedBrush 中的待扩展 hexes 为一个新的 Set，以避免共享引用
        selectedBrush.pedingHexes = new Set(pedingHexes);
        mainView.hexGrid.hubs.forEach(hub => {
            hub.updateEffectedRegions();
        });
        initRegionsCard(hexGrid);
        superSumCard.updateCard();
        hexGrid.saveLocal();

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
        //FIX: 事实上是很不节省算力的行为，但是一直没有研究出来正确的局部处理方法，尤其是边缘，很难解决，所以没有办法只能用这个全局配置来解决了。
        hexGrid.regions.delete(this);
        hexGrid.drawHexagons();
        // this.updateRegion();
        // updateRegionCards();
    }

    clearSingleHex(hex, hexGrid) {
        for (let regionHex of this.hexes) {
            regionHex.regionBelond = null;
            if (regionHex.id === hex.id) {
                regionHex.brush = "擦除";
                regionHex.type = "空白";
            } else {
                regionHex.type = "自由";
            }
            regionHex.drawHex(hexGrid);
            this.hexes.delete(regionHex);
        }
    }

    clearAllHexes(hexGrid) {
        // 1. 清空当前区域的 hexes
        this.hexes.forEach(regionHex => {
            regionHex.brush = "擦除";
            regionHex.regionBelond = null;
            regionHex.type = "空白";
            regionHex.drawHex(hexGrid);
        });
    
        this.hexes.clear();
    
        // 2. 识别需要从 hexGrid 中删除的 hex，并将其收集到一个数组中
        const hexesToDelete = [];
        hexGrid.hexes.forEach(hex => {
            if (hex.regionBelond === this.name) {
                hexesToDelete.push(hex);
            }
        });
    
        // 3. 从 hexGrid.hexes 中逐一删除
        hexesToDelete.forEach(hex => hexGrid.hexes.delete(hex));
    
        // 4. 从 hexGrid 的 regions 中删除当前区域
        hexGrid.regions.delete(this);
        initRegionsCard(hexGrid);
    }

    //绘制区域标签
    drawMaxInscribedCircle(ctx) {
        // 获取所有 hex 的坐标
        const hexCenters = [...this.hexes].map(hex => hex.hexToPixel(mainView.hexGrid.layout));

        // 计算区域的外包矩形（bounding box）
        const minX = Math.min(...hexCenters.map(p => p.x));
        const maxX = Math.max(...hexCenters.map(p => p.x));
        const minY = Math.min(...hexCenters.map(p => p.y));
        const maxY = Math.max(...hexCenters.map(p => p.y));

        // 找到外包矩形中心，作为初始猜测的内心位置
        let centerX = (minX + maxX) / 2;
        let centerY = (minY + maxY) / 2;

        // 计算最大内接圆半径：取到边缘 hex 的最小距离
        let maxRadius = Math.min(
            ...hexCenters.map(p => Math.sqrt((p.x - centerX) ** 2 + (p.y - centerY) ** 2))
        );

        // 绘制最大内接圆和中心点
        ctx.beginPath();
        ctx.arc(centerX, centerY, maxRadius, 0, 2 * Math.PI);
        ctx.strokeStyle = 'blue';
        ctx.lineWidth = 2;
        ctx.stroke();

        // 绘制中心点
        ctx.beginPath();
        ctx.arc(centerX, centerY, 3, 0, 2 * Math.PI);
        ctx.fillStyle = 'red';
        ctx.fill();
    }
/* 标签算法，依然没有最好的方法
    drawRegionLabel2(ctx) {
        const layout = mainView.hexGrid.layout;
        const hexGrid = mainView.hexGrid;

        // 获取所有 hex 的中心坐标并生成邻居方向
        const hexCenters = [...this.hexes].map(hex => ({
            hex,
            center: hex.hexToPixel(layout)
        }));

        // 根据布局获取邻居方向列表
        const neighborDirections = layout.orientation.name === 'pointy'
            ? [
                { q: 0, r: 1, s: -1 },  // 右下
                { q: -1, r: 1, s: 0 },  // 正下
                { q: -1, r: 0, s: 1 },  // 左下
                { q: 0, r: -1, s: 1 },  // 正左
                { q: 1, r: -1, s: 0 },  // 右上
                { q: 1, r: 0, s: -1 }   // 正右
            ]
            : [
                { q: 1, r: 0, s: -1 },  // 右下
                { q: 0, r: 1, s: -1 },  // 正下
                { q: -1, r: 1, s: 0 },  // 左下
                { q: -1, r: 0, s: 1 },  // 左上
                { q: 0, r: -1, s: 1 },  // 正上
                { q: 1, r: -1, s: 0 }   // 右上
            ];

        // 路径构建：查找相邻 hex 并按优先级连接
        const path = [];
        const visited = new Set();
        let currentHex = hexCenters[0].hex;
        path.push(currentHex);
        visited.add(currentHex.id);

        while (true) {
            let foundNext = false;

            for (let i = 0; i < neighborDirections.length; i++) {
                const { q, r, s } = neighborDirections[i];
                const neighborId = `${currentHex.q + q}_${currentHex.r + r}_${currentHex.s + s}`;
                const neighborHex = hexGrid.getHexById(neighborId);

                if (neighborHex && this.hexes.has(neighborHex) && !visited.has(neighborId)) {
                    // 检查是否存在一个符合条件的邻居对
                    const adjacentDirectionIndex = (i + 1) % neighborDirections.length;
                    const adjacentDirection = neighborDirections[adjacentDirectionIndex];
                    const adjacentNeighborId = `${currentHex.q + adjacentDirection.q}_${currentHex.r + adjacentDirection.r}_${currentHex.s + adjacentDirection.s}`;
                    const adjacentNeighbor = hexGrid.getHexById(adjacentNeighborId);

                    if (adjacentNeighbor && this.hexes.has(adjacentNeighbor) && !visited.has(adjacentNeighborId)) {
                        // 计算两个相邻邻居的中点
                        const midX = (neighborHex.hexToPixel(layout).x + adjacentNeighbor.hexToPixel(layout).x) / 2;
                        const midY = (neighborHex.hexToPixel(layout).y + adjacentNeighbor.hexToPixel(layout).y) / 2;

                        // 将中点添加到路径
                        path.push({ x: midX, y: midY });
                        currentHex = adjacentNeighbor;
                        visited.add(adjacentNeighborId);
                        foundNext = true;
                        break;
                    } else {
                        // 没有符合条件的邻居对，直接连接到当前邻居
                        path.push(neighborHex);
                        visited.add(neighborId);
                        currentHex = neighborHex;
                        foundNext = true;
                        break;
                    }
                }
            }
            if (!foundNext) break;
        }

        // 画出路径
        ctx.beginPath();
        const firstPoint = path[0].hexToPixel ? path[0].hexToPixel(layout) : path[0];
        ctx.moveTo(firstPoint.x, firstPoint.y);
        for (let i = 1; i < path.length; i++) {
            const { x, y } = path[i].hexToPixel ? path[i].hexToPixel(layout) : path[i];
            ctx.lineTo(x, y);
        }
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 1;
        ctx.stroke();

        // 计算路径的总长度和中点位置
        let totalLength = 0;
        const segmentLengths = [];
        for (let i = 1; i < path.length; i++) {
            const p1 = path[i - 1].hexToPixel ? path[i - 1].hexToPixel(layout) : path[i - 1];
            const p2 = path[i].hexToPixel ? path[i].hexToPixel(layout) : path[i];
            const dx = p2.x - p1.x;
            const dy = p2.y - p1.y;
            const segmentLength = Math.sqrt(dx * dx + dy * dy);
            segmentLengths.push(segmentLength);
            totalLength += segmentLength;
        }

        const halfLength = totalLength / 2;
        let accumulatedLength = 0;
        let middleIndex = 0;

        // 找到路径中间的起点
        for (let i = 0; i < segmentLengths.length; i++) {
            accumulatedLength += segmentLengths[i];
            if (accumulatedLength >= halfLength) {
                middleIndex = i;
                break;
            }
        }

        // 标记路径的中心点为黄色
        const centerPoint = path[middleIndex].hexToPixel ? path[middleIndex].hexToPixel(layout) : path[middleIndex];
        ctx.beginPath();
        ctx.arc(centerPoint.x, centerPoint.y, 5, 0, 2 * Math.PI); // 绘制一个半径为 5 的黄色圆点
        ctx.fillStyle = 'yellow';
        ctx.fill();

        // 计算合适的字体大小，确保不超过单个六边形的尺寸
        const maxHexSize = Math.min(...[...this.hexes].map(hex => hex.size)) * 0.8;
        ctx.font = `${Math.min(16, maxHexSize)}px Arial`;
        ctx.fillStyle = 'black';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // 在路径上从中间开始绘制文本
        const text = this.name;
        const textWidth = ctx.measureText(text).width;
        const textHalfLength = textWidth / 2;

        let startX = centerPoint.x;
        let startY = centerPoint.y;

        // 调整文字位置，使其居中路径的中点
        if (middleIndex > 0) {
            const dx = path[middleIndex].x - path[middleIndex - 1].x;
            const dy = path[middleIndex].y - path[middleIndex - 1].y;
            const angle = Math.atan2(dy, dx);

            startX -= Math.cos(angle) * textHalfLength;
            startY -= Math.sin(angle) * textHalfLength;

            ctx.save();
            ctx.translate(startX, startY);
            ctx.rotate(angle);
            ctx.fillText(text, 0, 0);
            ctx.restore();
        } else {
            ctx.fillText(text, startX, startY);
        }
    }

    drawRegionLabel3(ctx) {
        const layout = mainView.hexGrid.layout;
        const hexGrid = mainView.hexGrid;

        // 获取所有 hex 的中心坐标并生成邻居方向
        const hexCenters = [...this.hexes].map(hex => ({
            hex,
            center: hex.hexToPixel(layout)
        }));

        // 根据布局获取邻居方向列表
        const neighborDirections = layout.orientation.name === 'pointy'
            ? [
                { q: 0, r: 1, s: -1 },  // 右下
                { q: -1, r: 1, s: 0 },  // 正下
                { q: -1, r: 0, s: 1 },  // 左下
                { q: 0, r: -1, s: 1 },  // 正左
                { q: 1, r: -1, s: 0 },  // 右上
                { q: 1, r: 0, s: -1 }   // 正右
            ]
            : [
                { q: 1, r: 0, s: -1 },  // 右下
                { q: 0, r: 1, s: -1 },  // 正下
                { q: -1, r: 1, s: 0 },  // 左下
                { q: -1, r: 0, s: 1 },  // 左上
                { q: 0, r: -1, s: 1 },  // 正上
                { q: 1, r: -1, s: 0 }   // 右上
            ];

        // 路径构建：查找相邻 hex 并按优先级连接
        const path = [];
        const visited = new Set();
        let currentHex = hexCenters[0].hex;
        path.push(currentHex);
        visited.add(currentHex.id);

        while (true) {
            let foundNext = false;

            for (let i = 0; i < neighborDirections.length; i++) {
                const { q, r, s } = neighborDirections[i];
                const neighborId = `${currentHex.q + q}_${currentHex.r + r}_${currentHex.s + s}`;
                const neighborHex = hexGrid.getHexById(neighborId);

                if (neighborHex && this.hexes.has(neighborHex) && !visited.has(neighborId)) {
                    path.push(neighborHex);
                    visited.add(neighborId);
                    currentHex = neighborHex;
                    foundNext = true;
                    break;
                }
            }
            if (!foundNext) break;
        }

        // 画出路径
        ctx.beginPath();
        const firstPoint = path[0].hexToPixel(layout);
        ctx.moveTo(firstPoint.x, firstPoint.y);
        for (let i = 1; i < path.length; i++) {
            const { x, y } = path[i].hexToPixel(layout);
            ctx.lineTo(x, y);
        }
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 1;
        ctx.stroke();

        // **改进中点计算：直接使用路径的中间点来确定黄点**
        const middleHex = path[Math.floor(path.length / 2)];
        const middlePoint = middleHex.hexToPixel(layout);

        // 标记路径的中心点为黄色
        ctx.beginPath();
        ctx.arc(middlePoint.x, middlePoint.y, 5, 0, 2 * Math.PI); // 绘制一个半径为 5 的黄色圆点
        ctx.fillStyle = 'yellow';
        ctx.fill();

        // 计算合适的字体大小，确保不超过单个六边形的尺寸
        const maxHexSize = Math.min(...[...this.hexes].map(hex => hex.size)) * 0.8;
        ctx.font = `${Math.min(16, maxHexSize)}px Arial`;
        ctx.fillStyle = 'black';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // 在路径上从中间开始绘制文本
        const text = this.name;
        const textWidth = ctx.measureText(text).width;
        const textHalfLength = textWidth / 2;

        let startX = middlePoint.x;
        let startY = middlePoint.y;

        // 调整文字位置，使其居中路径的中点
        if (path.length > 1) {
            const dx = path[1].hexToPixel(layout).x - path[0].hexToPixel(layout).x;
            const dy = path[1].hexToPixel(layout).y - path[0].hexToPixel(layout).y;
            const angle = Math.atan2(dy, dx);

            startX -= Math.cos(angle) * textHalfLength;
            startY -= Math.sin(angle) * textHalfLength;

            ctx.save();
            ctx.translate(startX, startY);
            ctx.rotate(angle);
            ctx.fillText(text, 0, 0);
            ctx.restore();
        } else {
            ctx.fillText(text, startX, startY);
        }
    }

    drawRegionLabel1(ctx) {
        const layout = mainView.hexGrid.layout;
        const hexGrid = mainView.hexGrid;
        
        // 获取邻居方向列表
        const neighborDirections = layout.orientation.name === 'pointy'
            ? [
                { q: 0, r: 1, s: -1 },  // 右下
                { q: -1, r: 1, s: 0 },  // 正下
                { q: -1, r: 0, s: 1 },  // 左下
                { q: 0, r: -1, s: 1 },  // 正左
                { q: 1, r: -1, s: 0 },  // 右上
                { q: 1, r: 0, s: -1 }   // 正右
            ]
            : [
                { q: 1, r: 0, s: -1 },  // 右下
                { q: 0, r: 1, s: -1 },  // 正下
                { q: -1, r: 1, s: 0 },  // 左下
                { q: -1, r: 0, s: 1 },  // 左上
                { q: 0, r: -1, s: 1 },  // 正上
                { q: 1, r: -1, s: 0 }   // 右上
            ];

        // 设置起点
        const hexCenters = [...this.hexes].map(hex => hex.hexToPixel(layout));
        const visited = new Set();
        const path = [];
        let currentHex = [...this.hexes][0];
        visited.add(currentHex.id);
        let stepIndex = 1;

        while (currentHex) {
            const currentCenter = currentHex.hexToPixel(layout);
            path.push(currentCenter);

            // 查找邻居
            const neighbors = [];
            for (const { q, r, s } of neighborDirections) {
                const neighborId = `${currentHex.q + q}_${currentHex.r + r}_${currentHex.s + s}`;
                const neighborHex = hexGrid.getHexById(neighborId);
                
                if (neighborHex && this.hexes.has(neighborHex) && !visited.has(neighborId)) {
                    neighbors.push({ hex: neighborHex, center: neighborHex.hexToPixel(layout) });
                }
            }

            if (neighbors.length === 1) {
                // 仅一个邻居，直接连接
                currentHex = neighbors[0].hex;
                visited.add(currentHex.id);
            } else if (neighbors.length > 1) {
                // 有多个邻居，查找相邻的两个，取连线的中点
                let foundPair = false;
                for (let i = 0; i < neighbors.length && !foundPair; i++) {
                    for (let j = i + 1; j < neighbors.length; j++) {
                        const hexA = neighbors[i];
                        const hexB = neighbors[j];
                        if (Math.abs(hexA.hex.q - hexB.hex.q) <= 1 &&
                            Math.abs(hexA.hex.r - hexB.hex.r) <= 1 &&
                            Math.abs(hexA.hex.s - hexB.hex.s) <= 1) {
                            // 找到一对相邻格子，计算中点
                            const midPoint = {
                                x: (hexA.center.x + hexB.center.x) / 2,
                                y: (hexA.center.y + hexB.center.y) / 2
                            };
                            path.push(midPoint);
                            currentHex = this._findClosestHex(midPoint, visited, hexGrid);
                            visited.add(currentHex?.id);
                            foundPair = true;
                            break;
                        }
                    }
                }
                if (!foundPair) break; // 如果没有相邻的两个格子，结束路径
            } else {
                // 无法连接更多格子
                currentHex = null;
            }

            // 标记每个连接点
            const point = path[path.length - 1];
            ctx.beginPath();
            ctx.arc(point.x, point.y, 3, 0, 2 * Math.PI);
            ctx.fillStyle = 'blue';
            ctx.fill();
            ctx.fillStyle = 'black';
            ctx.fillText(stepIndex++, point.x + 5, point.y - 5);
        }

        // 绘制路径
        ctx.beginPath();
        ctx.moveTo(path[0].x, path[0].y);
        for (let i = 1; i < path.length; i++) {
            ctx.lineTo(path[i].x, path[i].y);
        }
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 1;
        ctx.stroke();

        // 在路径的中心绘制文字
        this._drawCenteredText(ctx, path, this.name);
    }

    // 在路径上居中绘制文本
    _drawCenteredText1(ctx, path, text) {
        // 计算路径长度
        let totalLength = 0;
        const segmentLengths = [];
        for (let i = 1; i < path.length; i++) {
            const dx = path[i].x - path[i - 1].x;
            const dy = path[i].y - path[i - 1].y;
            const segmentLength = Math.sqrt(dx * dx + dy * dy);
            segmentLengths.push(segmentLength);
            totalLength += segmentLength;
        }

        const halfLength = totalLength / 2;
        let accumulatedLength = 0;
        let middleIndex = 0;

        // 找到路径中点位置
        for (let i = 0; i < segmentLengths.length; i++) {
            accumulatedLength += segmentLengths[i];
            if (accumulatedLength >= halfLength) {
                middleIndex = i;
                break;
            }
        }

        // 绘制文字
        const fontSize = Math.min(16, totalLength / text.length);
        ctx.font = `${fontSize}px Arial`;
        ctx.fillStyle = 'black';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        const centerPoint = path[middleIndex];
        ctx.fillText(text, centerPoint.x, centerPoint.y);
    }

    // 查找最接近指定点的未访问格子
    _findClosestHex1(point, visited, hexGrid) {
        let closestHex = null;
        let minDist = Infinity;
        for (const hex of this.hexes) {
            if (!visited.has(hex.id)) {
                const hexCenter = hex.hexToPixel(hexGrid.layout);
                const dist = Math.sqrt((hexCenter.x - point.x) ** 2 + (hexCenter.y - point.y) ** 2);
                if (dist < minDist) {
                    minDist = dist;
                    closestHex = hex;
                }
            }
        }
        return closestHex;
    }
*/
    drawRegionLabel(ctx) {
        const layout = mainView.hexGrid.layout;
        const hexGrid = mainView.hexGrid;
        
        // 获取邻居方向列表
        const neighborDirections = layout.orientation.name === 'pointy'
            ? [
                { q: 0, r: 1, s: -1 },  // 右下
                { q: -1, r: 1, s: 0 },  // 正下
                { q: -1, r: 0, s: 1 },  // 左下
                { q: 0, r: -1, s: 1 },  // 正左
                { q: 1, r: -1, s: 0 },  // 右上
                { q: 1, r: 0, s: -1 }   // 正右
            ]
            : [
                { q: 1, r: 0, s: -1 },  // 右下
                { q: 0, r: 1, s: -1 },  // 正下
                { q: -1, r: 1, s: 0 },  // 左下
                { q: -1, r: 0, s: 1 },  // 左上
                { q: 0, r: -1, s: 1 },  // 正上
                { q: 1, r: -1, s: 0 }   // 右上
            ];

        const visited = new Set();
        const path = [];
        let currentHex = [...this.hexes][0];
        visited.add(currentHex.id);
        let stepIndex = 1;

        while (currentHex && !this.isEndOfPath(currentHex, visited, hexGrid)) {
            const currentCenter = currentHex.hexToPixel(layout);
            path.push(currentCenter);

            // 查找邻居
            const neighbors = [];
            for (const { q, r, s } of neighborDirections) {
                const neighborId = `${currentHex.q + q}_${currentHex.r + r}_${currentHex.s + s}`;
                const neighborHex = hexGrid.getHexById(neighborId);
                
                if (neighborHex && this.hexes.has(neighborHex) && !visited.has(neighborId)) {
                    neighbors.push({ hex: neighborHex, center: neighborHex.hexToPixel(layout) });
                }
            }

            if (neighbors.length === 1) {
                // 仅一个邻居，直接连接
                currentHex = neighbors[0].hex;
                visited.add(currentHex.id);
            } else if (neighbors.length > 1) {
                // 有多个邻居，查找相邻的两个，取连线的中点
                let foundPair = false;
                for (let i = 0; i < neighbors.length && !foundPair; i++) {
                    for (let j = i + 1; j < neighbors.length; j++) {
                        const hexA = neighbors[i];
                        const hexB = neighbors[j];
                        if (Math.abs(hexA.hex.q - hexB.hex.q) <= 1 &&
                            Math.abs(hexA.hex.r - hexB.hex.r) <= 1 &&
                            Math.abs(hexA.hex.s - hexB.hex.s) <= 1) {
                            // 找到一对相邻格子，计算中点
                            const midPoint = {
                                x: (hexA.center.x + hexB.center.x) / 2,
                                y: (hexA.center.y + hexB.center.y) / 2
                            };
                            path.push(midPoint);
                            currentHex = this._findClosestHex(midPoint, visited, hexGrid);
                            if (currentHex) visited.add(currentHex.id);
                            foundPair = true;
                            break;
                        }
                    }
                }
                if (!foundPair) break; // 如果没有相邻的两个格子，结束路径
            } else {
                // 无法连接更多格子
                currentHex = null;
            }

            // 标记每个连接点
            const point = path[path.length - 1];
            ctx.beginPath();
            ctx.arc(point.x, point.y, 3, 0, 2 * Math.PI);
            ctx.fillStyle = 'rgba(0,0,0,0)';
            ctx.fill();
            ctx.fillStyle = 'rgba(0,0,0,0)';
            ctx.fillText(stepIndex++, point.x + 5, point.y - 5);
        }

        // 绘制路径
        ctx.beginPath();
        ctx.moveTo(path[0].x, path[0].y);
        for (let i = 1; i < path.length; i++) {
            ctx.lineTo(path[i].x, path[i].y);
        }
        ctx.strokeStyle = 'rgba(0,0,0,0)';
        ctx.lineWidth = 1;
        ctx.stroke();

        // 在路径的中心绘制文字
        this._drawCenteredText(ctx, path, this.name);
        
    }

    // 判断是否到达路径的尽头
    isEndOfPath(currentHex, visited, hexGrid) {
        const layout = hexGrid.layout;
        const neighborDirections = layout.orientation.name === 'pointy'
            ? [
                { q: 0, r: 1, s: -1 },
                { q: -1, r: 1, s: 0 },
                { q: -1, r: 0, s: 1 },
                { q: 0, r: -1, s: 1 },
                { q: 1, r: -1, s: 0 },
                { q: 1, r: 0, s: -1 }
            ]
            : [
                { q: 1, r: 0, s: -1 },
                { q: 0, r: 1, s: -1 },
                { q: -1, r: 1, s: 0 },
                { q: -1, r: 0, s: 1 },
                { q: 0, r: -1, s: 1 },
                { q: 1, r: -1, s: 0 }
            ];

        for (const { q, r, s } of neighborDirections) {
            const neighborId = `${currentHex.q + q}_${currentHex.r + r}_${currentHex.s + s}`;
            const neighborHex = hexGrid.getHexById(neighborId);
            if (neighborHex && this.hexes.has(neighborHex) && !visited.has(neighborId)) {
                return false; // 仍有未访问的邻居
            }
        }
        return true; // 没有未访问的邻居，达到路径尽头
    }

    // 在路径上居中绘制文本
    _drawCenteredText(ctx, path, text) {
        let totalLength = 0;
        const segmentLengths = [];
        for (let i = 1; i < path.length; i++) {
            const dx = path[i].x - path[i - 1].x;
            const dy = path[i].y - path[i - 1].y;
            const segmentLength = Math.sqrt(dx * dx + dy * dy);
            segmentLengths.push(segmentLength);
            totalLength += segmentLength;
        }

        const halfLength = totalLength / 2;
        let accumulatedLength = 0;
        let middleIndex = 0;

        for (let i = 0; i < segmentLengths.length; i++) {
            accumulatedLength += segmentLengths[i];
            if (accumulatedLength >= halfLength) {
                middleIndex = i;
                break;
            }
        }

        const fontSize = Math.min(16, totalLength / text.length);
        ctx.font = `${fontSize}px Arial`;
        ctx.fillStyle = 'black';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        const centerPoint = path[middleIndex];
        ctx.fillText(text, centerPoint.x, centerPoint.y);
    }

    // 查找最接近指定点的未访问格子
    _findClosestHex(point, visited, hexGrid) {
        let closestHex = null;
        let minDist = Infinity;
        for (const hex of this.hexes) {
            if (!visited.has(hex.id)) {
                const hexCenter = hex.hexToPixel(hexGrid.layout);
                const dist = Math.sqrt((hexCenter.x - point.x) ** 2 + (hexCenter.y - point.y) ** 2);
                if (dist < minDist) {
                    minDist = dist;
                    closestHex = hex;
                }
            }
        }
        return closestHex;
    }


    // ---------逻辑算法类-----------//
    getNeighborHex(hexList = this.hexes) {
        const oneRingHexes = new Map();
    
        // 遍历输入的所有格子
        hexList.forEach(hex => {
            // 获取每个格子的邻居格子
            const neighbors = hex.getOneRing(mainView.hexGrid);
    
            // 遍历邻居格子
            neighbors.forEach(neighbor => {
                // 检查邻居是否不在输入的 Set 中，且未被添加到 oneRingHexes 中
                if (!hexList.has(neighbor) && !oneRingHexes.has(neighbor.id)) {
                    oneRingHexes.set(neighbor.id, neighbor);
                }
            });
        });
        return Array.from(oneRingHexes.values());
    }
            
    //内效应 需要三个内部格子与其他区域接壤
    getInnerEffectArea() {
        const neighborRegionCount = new Map();
    
        this.hexes.forEach(hex => {
            const adjacentTerritoryHexes = hex.getOneRing(mainView.hexGrid).filter(
                neighbor => neighbor.type === '属地' && !this.hexes.has(neighbor)
            );
    
            adjacentTerritoryHexes.forEach(neighbor => {
                if (neighbor.regionBelond) {
                    neighborRegionCount.set(neighbor.regionBelond, (neighborRegionCount.get(neighbor.regionBelond) || 0) + 1);
                }
            });
        });
    
        const innerEffectArea = [];
        neighborRegionCount.forEach((count, regionBelond) => {
            if (count >= 3) {
                innerEffectArea.push(regionBelond);
            }
        });
        return innerEffectArea;
    }

    get innerEffectAreaCount() {
        return this.getInnerEffectArea().length;
    }

    getInnerEffectDetailList(formatted = false) {
        const innerEffectArea = this.getInnerEffectArea();
        const innerEffectDetailList = [];
        innerEffectArea.forEach(reg => {
            // let region = mainView.hexGrid.regions.find(r => r.name === reg);
            let region = null;
            for (let r of mainView.hexGrid.regions) {
                if (r.name === reg) {
                    region = r;
                    break;
                }
            }

            const regionType = region.type;
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
                heat: '20',
                pollution: pollutionEffect || null
            };
    
            innerEffectDetailList.push(effectDetail);
        });
    
        if (formatted) {
            return innerEffectDetailList.map(detail => {
                return {
                    title: detail.region,
                    items: [
                        `热能: ${detail.heat}`,
                        `脏污: ${detail.pollution || 0}` //这里定义一个更好的才行
                    ]
                };
            });
        }
    
        return innerEffectDetailList;
    }

    getInnerEffectCountList() {
        const innerEffectDetailList = this.getInnerEffectDetailList();
        const innerEffectCountMap = new Map();
    
        innerEffectDetailList.forEach(detail => {
            // 查找区域类型
            let regionType = null;
            for (let r of mainView.hexGrid.regions) {
                if (r.name === detail.region) {
                    regionType = r.type;
                    break;
                }
            }
    
            // 初始化或更新区域的效应统计
            if (!innerEffectCountMap.has(regionType)) {
                innerEffectCountMap.set(regionType, {
                    count: 1, // 初始化 count 属性为 1
                    heat: 20,
                    pollution: detail.pollution === '20 脏污' ? 20 : 0,
                    disease: detail.pollution === '20 疾病' ? 20 : 0
                });
            } else {
                const currentEffect = innerEffectCountMap.get(regionType);
                currentEffect.count += 1; // 增加 count 属性
                currentEffect.heat += 20;
                if (detail.pollution === '20 脏污') currentEffect.pollution += 20;
                if (detail.pollution === '20 疾病') currentEffect.disease += 20;
                innerEffectCountMap.set(regionType, currentEffect);
            }
        });
    
        // 将 Map 转换为所需格式的数组
        return Array.from(innerEffectCountMap.entries()).map(([type, effects]) => {
            return {
                title: `${type} X ${effects.count}`, // 使用 effects.count
                items: [`热能: ${effects.heat}`, `脏污: ${effects.pollution}`, `疾病: ${effects.disease}`]
            };
        });
    }

    getTotalInnerEffects() { 
        const innerEffectCountList = this.getInnerEffectCountList(); 
        let totalRegions = innerEffectCountList.length; 
        let totalHeat = 0; 
        let totalPollution = 0; 
        let totalDisease = 0; 
    
        innerEffectCountList.forEach(effect => {
            // 从 items 中提取数值
            const heatValue = parseInt(effect.items[0].split(': ')[1]); // 提取 "热能" 值
            const pollutionValue = parseInt(effect.items[1].split(': ')[1]); // 提取 "脏污" 值
            const diseaseValue = parseInt(effect.items[2].split(': ')[1]); // 提取 "疾病" 值
    
            totalHeat += heatValue;
            totalPollution += pollutionValue;
            totalDisease += diseaseValue;
        });
    
        return { 
            region: totalRegions, 
            heat: totalHeat, 
            pollution: totalPollution, 
            disease: totalDisease 
        }; 
    }

    //外反馈 外面有三个同类型区域的格子就生效
    getOuterEffectArea() { 
        // 获取环圈的所有格子 
        const oneRingHexes = this.getNeighborHex(); 
    
        // 过滤出类型为 "属地" 的格子 
        const filteredHexes = oneRingHexes.filter(hex => hex.type === "属地"); 
    
        // 统计每个区域的格子数量，并记录每个区域的刷子（brush）信息
        const regionCountMap = new Map(); 
        filteredHexes.forEach(hex => { 
            const region = hex.regionBelond; 
            if (region) {
                // 初始化区域计数和刷子信息
                if (!regionCountMap.has(region)) {
                    regionCountMap.set(region, { count: 0, brush: hex.brush });
                }
                // 更新区域计数
                regionCountMap.get(region).count += 1;
            } 
        }); 
    
        // 构造外部效果区域列表，区域格子数量大于等于 3 的保留 
        const outerEffectArea = []; 
        regionCountMap.forEach(({ count, brush }, region) => { 
            if (count >= 3) { 
                outerEffectArea.push({ region, brush }); 
            } 
        }); 
    
        return outerEffectArea; 
    }

    getOuterEffectDetailList(formatted = false) { 
        const outerEffectArea = this.getOuterEffectArea(); 
        const outerEffectDetailList = []; 
    
        outerEffectArea.forEach(({ region, brush }) => { 
            // 查找具体的区域对象
            let targetRegion = null; 
            for (let r of mainView.hexGrid.regions) { 
                if (r.name === region) { 
                    targetRegion = r; 
                    break; 
                } 
            } 
    
            const regionType = targetRegion.type; 
            let pollutionDirt = 0;
            let pollutionDisease = 0;
    
            // 根据区域类型设置污染效果
            if (['工业区', '开采区', '后勤区'].includes(regionType)) { 
                if (this.type === '居住区') { 
                    pollutionDirt = 20; 
                } else if (this.type === '食品区') { 
                    pollutionDisease = 20; 
                } 
            } 
    
            // 构建效果详情对象
            const effectDetail = { 
                region: targetRegion.name, 
                heat: 20, 
                pollutionDirt: pollutionDirt,
                pollutionDisease: pollutionDisease,
                brush: brush 
            }; 
    
            outerEffectDetailList.push(effectDetail); 
        }); 
    
        // 如果格式化输出
        if (formatted) { 
            return outerEffectDetailList.map(detail => { 
                return { 
                    title: detail.region, 
                    items: [ 
                        `热能: ${detail.heat}`, 
                        `脏污: ${detail.pollutionDirt}`, 
                        `疾病: ${detail.pollutionDisease}`, 
                        `刷子: ${detail.brush}`
                    ] 
                }; 
            }); 
        } 
    
        return outerEffectDetailList; 
    }

    summarizeOuterEffectDetails() {
        const outerEffectDetailList = this.getOuterEffectDetailList();
        // 初始化计数器
        let totalHeat = 0;
        let totalPollutionDirt = 0;
        let totalPollutionDisease = 0;
    
        // 遍历 outerEffectDetailList 统计信息
        outerEffectDetailList.forEach(detail => {
            // 累计热能值
            totalHeat += detail.heat;
    
            // 累计污染类型
            totalPollutionDirt += detail.pollutionDirt;
            totalPollutionDisease += detail.pollutionDisease;
        });
    
        // 返回统计结果
        return {
            totalHeat: totalHeat,
            pollutionDirtCount: totalPollutionDirt,
            pollutionDiseaseCount: totalPollutionDisease
        };
    }
    
    ///枢纽计算板块
    get totalHubsCount() {
        return this.effectHubs.size || 0;
    }

    hubEffectList(type, effectHubs = this.effectHubs) {
        // 初始化一个空数组，用于存储结果
        const hubDetails = [];
        const brushMap = new Map();
        const effectMap = new Map();
    
        // 遍历 effectHubs Set
        for (const hub of effectHubs) {
            // 提取 hub 的相关信息
            const regionBelond = hub.regionBelond;
            const brush = hub.brush;
            const hubEffect = hub.hubEffect;
    
            // 检查 hubEffect 是否有效
            if (!hubEffect) {
                console.warn(`Hub effect for ${hub} is not available`);
                continue; // 跳过此 hub，因为 hubEffect 无效
            }
    
            // 构建对象
            const hubDetailList = {
                titleText: regionBelond,
                items: [brush, hubEffect.effect, hubEffect.effectValue]
            };
    
            // 将对象添加到列表中
            hubDetails.push(hubDetailList);
    
            // 统计 brush 信息
            if (!brushMap.has(brush)) {
                brushMap.set(brush, {
                    count: 1,
                    effect: hubEffect.effect,
                    totalEffectValue: hubEffect.effectValue
                });
            } else {
                const current = brushMap.get(brush);
                current.count += 1;
                current.totalEffectValue += hubEffect.effectValue;
                brushMap.set(brush, current);
            }
    
            // 统计 effect 信息
            const effect = hubEffect.effect;
            const effectValue = hubEffect.effectValue;
            if (!effectMap.has(effect)) {
                effectMap.set(effect, {
                    totalEffectValue: effectValue
                });
            } else {
                const current = effectMap.get(effect);
                current.totalEffectValue += effectValue;
                effectMap.set(effect, current);
            }
        }
    
        // 构建 brush 统计结果列表
        const hubAcountList = [];
        brushMap.forEach((value, key) => {
            hubAcountList.push({
                titleText: `${key} X ${value.count}`,
                items: [ value.effect, value.totalEffectValue]
            });
        });
    
        // 构建 effect 统计结果列表
        const hubsTotalList = [];
        effectMap.forEach((value, key) => {
            hubsTotalList.push({
                effect: key,
                effectValue: value.totalEffectValue
            });
        });
        hubsTotalList.sort((a, b) => (a.effect === '热能增加' ? -1 : b.effect === '热能增加' ? 1 : 0));
        if (type === 'd'){
           return hubDetails
        } else if (type === 'a') {
           return hubAcountList
        } else if (type === 't') {
           return hubsTotalList
        } else {
            return { hubDetails, hubAcountList, hubsTotalList };
        }
        // 返回构建的列表
    }
}
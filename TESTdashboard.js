export class TestDashboardView {
    constructor(main) {
        this.main = main;
        this.initDashboard();
    }

    initDashboard() {
        const testDashboard = document.getElementById('testDashboard');
        this.createButton(testDashboard, '打印Brush', () => this.displayBrushInfo(testDashboard));
        this.createButton(testDashboard, '打印hexGrid', () => this.displayHexGridInfo(testDashboard));
        this.createButton(testDashboard, '打印hexGrid 筛选范围', () => this.displayHexGridSimpleInfo(testDashboard));
        this.createButton(testDashboard, '打印Hubs', () => this.displayHubsInfo(testDashboard));
        this.createButton(testDashboard, '打印region', () => this.displayRegionInfo(testDashboard));
        this.createButton(testDashboard, '打印region显示材料', () => this.displayRegionDetails(testDashboard));
        this.createButton(testDashboard, '打印本次存储的hexgrid', () => this.displayLocationHexGrid(testDashboard));
    }

    displayBrushInfo(parentElement) {
        const brushInfoContent = this.createDashboardSection(parentElement, '打印Brush 信息', '清除Brush', () => this.cleanMe(brushInfoContent));
        
        const brushInfo = [
            `笔刷形态: ${this.main.selectedBrush.name}`,
            `自动建造模式: ${this.main.autoBuildRegion ? "开" : "关"}`,
            `拓展模式: ${this.main.isExpandRegion ? "开" : "关"}`,
            `等待中的六边形数: ${this.main.selectedBrush.pedingHexes.size}`
        ];
        
        brushInfo.forEach(info => {
            const infoElement = document.createElement('div');
            infoElement.textContent = info;
            brushInfoContent.appendChild(infoElement);
        });

        this.main.selectedBrush.pedingHexes.forEach((hex, index) => {
            const hexElement = document.createElement('div');
            hexElement.textContent = `第 ${index + 1} 个六边形: ${JSON.stringify(hex)}`;
            brushInfoContent.appendChild(hexElement);
        });
    }

    displayHexGridInfo(parentElement) {
        const hexGridInfoContent = this.createDashboardSection(parentElement, '打印hexGrid 信息', '清除hexGrid', () => this.cleanMe(hexGridInfoContent));

        const hexCountText = `hexGrid存储的六边形数: ${this.main.hexGrid.hexes.size}`;
        const hexCountElement = document.createElement('div');
        hexCountElement.textContent = hexCountText;
        hexGridInfoContent.appendChild(hexCountElement);

        this.main.hexGrid.hexes.forEach((hex, index) => {
            const hexElement = this.createHexInfoElement(index, hex);
            hexGridInfoContent.appendChild(hexElement);
        });
    }

    displayHexGridSimpleInfo(parentElement) {
        const hexGridSimpleContent = this.createDashboardSection(parentElement, '打印hexGrid 筛选范围', '清除hexGrid简单筛选', () => this.cleanMe(hexGridSimpleContent));

        this.main.hexGrid.hexes.forEach((hex, index) => {
            if (hex.brush === '擦除' && hex.type === '空白' && hex.regionBelond === null) return;
            const hexElement = this.createHexInfoElement(index, hex);
            hexGridSimpleContent.appendChild(hexElement);
        });
    }

    displayHubsInfo(parentElement) {
        const hubsContent = this.createDashboardSection(parentElement, '打印Hubs 信息', '清除Hubs', () => this.cleanMe(hubsContent));

        this.main.hexGrid.hubs.forEach((hex, index) => {
            const hexElement = this.createHexInfoElement(index, hex);
            hubsContent.appendChild(hexElement);
        });
    }

    displayRegionInfo(parentElement) {
        const regionContent = this.createDashboardSection(parentElement, '打印region 信息', '清除region', () => this.cleanMe(regionContent));

        this.main.hexGrid.regions.forEach((region, index) => {
            const regionElement = document.createElement('div');
            regionElement.textContent = `Region ${index + 1}: ${JSON.stringify({
                name: region.name,
                type: region.type,
                hexCount: region.hexes.size,
                neighborCount: region.getNeighborHex().length
            })}`;
            regionContent.appendChild(regionElement);

            region.hexes.forEach(hex => {
                const hexElement = document.createElement('div');
                hexElement.textContent = ` - Hex: ${JSON.stringify({
                    id: hex.id,
                    brush: hex.brush,
                    regionBelond: hex.regionBelond,
                    type: hex.type
                })}`;
                regionContent.appendChild(hexElement);
            });
        });
    }

    displayRegionDetails(parentElement) {
        const regionDetailsContent = this.createDashboardSection(parentElement, '打印region 显示材料', '清除region', () => this.cleanMe(regionDetailsContent));

        this.main.hexGrid.regions.forEach((region, index) => {
            const regionDetail = {
                id: region.name,
                内效存储区: region.innerEffectArea,
                内效区: region.getInnerEffectArea(),
                内效细节: region.getInnerEffectDetailList(),
                内销分类: region.getInnerEffectCountList(),
                内效总计: region.getTotalInnerEffects()
            };
            const regionElement = document.createElement('div');
            regionElement.textContent = `Region ${index + 1}: ${JSON.stringify(regionDetail)}`;
            regionDetailsContent.appendChild(regionElement);
        });
    }

    createHexInfoElement(index, hex) {
        const hexElement = document.createElement('div');
        hexElement.textContent = `第 ${index + 1} 个六边形: ${JSON.stringify({
            id: hex.id,
            brush: hex.brush,
            regionBelond: hex.regionBelond,
            type: hex.type
        })}`;
        return hexElement;
    }

    createButton(parentElement, buttonText, onClickCallback) {
        const button = document.createElement('button');
        button.textContent = buttonText;
        button.onclick = onClickCallback;
        parentElement.appendChild(button);
        return button;
    }

    displayLocationHexGrid(parentElement) {
        // 使用变量接收 createDashboardSection 的返回值
        const locationHexGridContent = this.createDashboardSection(
            parentElement,
            '打印region 显示材料',
            '清除region',
            () => this.cleanMe(locationHexGridContent) // 使用 locationHexGridContent 作为参数
        );
    
        const hexGridData = localStorage.getItem('hexgrid_data');
        
        if (hexGridData) {
            const parsedData = JSON.parse(hexGridData);
    
            const properties = [
                { label: "画布名称", value: parsedData.name || "规划师的得意之作" },
                { label: "描述", value: parsedData.description || "" },
                { label: "是否公开", value: parsedData.isPublic ? "公开" : "私有" },
                { label: "所有者 ID", value: parsedData.ownerId || "" },
                { label: "画布 ID", value: parsedData.hexgrid_id || "" }
            ];
    
            properties.forEach(prop => {
                const propertyElement = document.createElement('div');
                propertyElement.textContent = `${prop.label}: ${prop.value}`;
                locationHexGridContent.appendChild(propertyElement);
            });
        } else {
            const noDataElement = document.createElement('div');
            noDataElement.textContent = "没有找到画布数据";
            locationHexGridContent.appendChild(noDataElement);
        }
    }

    cleanMe(content) {
        content.innerHTML = '';
    }

    createDashboardSection(parentElement, sectionTitle, buttonText, buttonCallback) {
        const sectionContainer = document.createElement('div');
        
        const sectionTitleElement = document.createElement('div');
        sectionTitleElement.textContent = `---- ${sectionTitle} ----`;
        sectionContainer.appendChild(sectionTitleElement);
        
        const actionButton = document.createElement('button');
        actionButton.textContent = buttonText;
        actionButton.onclick = () => buttonCallback(sectionContainer);
        sectionContainer.appendChild(actionButton);
        
        parentElement.appendChild(sectionContainer);
        return sectionContainer;
    }
}
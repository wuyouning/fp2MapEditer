export class TestDashboardView {
    constructor(main) {
        this.main = main;
        this.testButton();
        this.BrushInfo();
    }



    BrushInfo() {
        const testDashboard = document.getElementById('testDashboard')
        const brushInfoContent = document.createElement('div')
        testDashboard.appendChild(brushInfoContent);



        const fengexian = document.createElement('h1');
        fengexian.textContent = `-------------------}`
        brushInfoContent.appendChild(fengexian);

        const cleanhexGridInfoSimapleButton = document.createElement('button');
        cleanhexGridInfoSimapleButton.textContent = '清除brushInfo';
        cleanhexGridInfoSimapleButton.onclick = () => {
            this.cleanMe(brushInfoContent);
        };
        brushInfoContent.appendChild(cleanhexGridInfoSimapleButton);

        const selectedBrush = document.createElement('div');
        selectedBrush.textContent = `笔刷形态 ${this.main.selectedBrush.name}`
        brushInfoContent.appendChild(selectedBrush);

        const autoBuildRegion = document.createElement('div');
        let autoBuildRegiontEXT = this.main.autoBuildRegion ? "开" : '关'
        autoBuildRegion.textContent = `自动建造模式 ${autoBuildRegiontEXT}`
        brushInfoContent.appendChild(autoBuildRegion);

        const isExpandRegion = document.createElement('div');
        let isExpandRegionText = this.main.isExpandRegion ? "开" : '关'
        isExpandRegion.textContent = `拓展模式 ${isExpandRegionText}`
        brushInfoContent.appendChild(isExpandRegion);

        // 创建并显示 pedingHexes 中的所有元素
        const pendingHexesContainer = document.createElement('div');
        pendingHexesContainer.textContent = `正在等待的六边形数: ${this.main.selectedBrush.pedingHexes.size}`;

        // 遍历 Set 中的元素并逐个显示
        this.main.selectedBrush.pedingHexes.forEach((hex, index) => {
            const hexElement = document.createElement('div');
            hexElement.textContent = `第 ${index + 1} 个六边形: ${JSON.stringify(hex)}`;  // 假设 hex 是一个对象，如果是其他类型的数据，改成相应的格式
            pendingHexesContainer.appendChild(hexElement);
        });


        brushInfoContent.appendChild(pendingHexesContainer);
    };

    hexGridInfo() {
        const testDashboard = document.getElementById('testDashboard')
        const hexGridInfoContent = document.createElement('div');
        testDashboard.appendChild(hexGridInfoContent);

        const fengexian = document.createElement('h1');
        fengexian.textContent = `-------------------}`
        hexGridInfoContent.appendChild(fengexian);

        const cleanhexGridInfoSimapleButton = document.createElement('button');
        cleanhexGridInfoSimapleButton.textContent = '清除hexGrid';
        cleanhexGridInfoSimapleButton.onclick = () => {
            this.cleanMe(hexGridInfoContent);
        };
        hexGridInfoContent.appendChild(cleanhexGridInfoSimapleButton);

        const pendingHexesContainer = document.createElement('div');
        pendingHexesContainer.textContent = `hexGrid存储的六边形数: ${this.main.hexGrid.hexes.size}`;

        this.main.hexGrid.hexes.forEach((hex, index) => {
            const hexElement = document.createElement('div');
            hexElement.textContent = `第 ${index + 1} 个六边形: ${JSON.stringify(hex)}`;  // 假设 hex 是一个对象，如果是其他类型的数据，改成相应的格式
            pendingHexesContainer.appendChild(hexElement);
        });

        hexGridInfoContent.appendChild(pendingHexesContainer);
    };

    hexGridInfoSimaple() {
        const testDashboard = document.getElementById('testDashboard');
        const hexGridfilterContent = document.createElement('div');
        testDashboard.appendChild(hexGridfilterContent);
    
        const hexeslist = document.createElement('div');
        hexeslist.textContent = `---------------明确的分割线 打印筛选范围------------------`;
        hexGridfilterContent.appendChild(hexeslist);
        
        const cleanhexGridInfoSimapleButton = document.createElement('button');
        cleanhexGridInfoSimapleButton.textContent = '清除hexGrid简单筛选';
        cleanhexGridInfoSimapleButton.onclick = () => {
            this.cleanMe(hexGridfilterContent);
        };
        hexGridfilterContent.appendChild(cleanhexGridInfoSimapleButton);

        this.main.hexGrid.hexes.forEach((hex, index) => {
            // 如果 hex 的 brush 是 '擦除'，则跳过该 hex
            if (hex.brush === '擦除' && hex.type === '空白' && hex.regionBelond === null) {
                return; // 跳过当前 hex
            }
    
            // 仅显示 id, brush, regionbelond, 和 type 属性
            const hexElement = document.createElement('div');
            const hexInfo = {
                id: hex.id,
                brush: hex.brush,
                regionbelond: hex.regionBelond,
                type: hex.type
            };
    
            hexElement.textContent = `第 ${index + 1} 个六边形: ${JSON.stringify(hexInfo)}`;
            hexGridfilterContent.appendChild(hexElement);
        });
    }

    hubsContent() {
        const testDashboard = document.getElementById('testDashboard');
        const HubsContent = document.createElement('div');
        testDashboard.appendChild(HubsContent);
    
        const hexeslist = document.createElement('div');
        hexeslist.textContent = `---------------明确的分割线 打印筛选范围------------------`;
        HubsContent.appendChild(hexeslist);
        
        const cleanhexGridInfoSimapleButton = document.createElement('button');
        cleanhexGridInfoSimapleButton.textContent = '清除Hubs';
        cleanhexGridInfoSimapleButton.onclick = () => {
            this.cleanMe(HubsContent);
        };
        HubsContent.appendChild(cleanhexGridInfoSimapleButton);

        this.main.hexGrid.hubs.forEach((hex, index) => {
    
            // 仅显示 id, brush, regionbelond, 和 type 属性
            const hexElement = document.createElement('div');
            const hexInfo = {
                id: hex.id,
                brush: hex.brush,
                regionbelond: hex.regionBelond,
                type: hex.type
            };
    
            hexElement.textContent = `第 ${index + 1} 个六边形: ${JSON.stringify(hexInfo)}`;
            HubsContent.appendChild(hexElement);
        });
    }

    consoleRegions() {
        const testDashboard = document.getElementById('testDashboard');

        const regionContent = this.createDashboardSection(
            testDashboard,
            '---------------明确的分割线 打印筛选范围------------------',
            '清除region',
            (container) => this.cleanMe(container)
        );

        this.main.hexGrid.regions.forEach((region, index) => {
    
            // 仅显示 id, brush, regionbelond, 和 type 属性
            const hexElement = document.createElement('div');
            const hexInfo = {
                id: region.name,
                type: region.type,
                count: region.hexes.size,
                hexes: region.hexes,
                邻居情况: region.getNeighborHex().length,
            };
    
            hexElement.textContent = `第 ${index + 1} 个六边形: ${JSON.stringify(hexInfo)}`;
            regionContent.appendChild(hexElement);

            // 遍历 region.hexes 中的每个 hex
            region.hexes.forEach((hex) => {
                const hexElement = document.createElement('div');
                const hexInfo = {
                    id: hex.id,
                    笔刷: hex.brush,
                    归属区域: hex.regionBelond,
                    类型: hex.type
                };
                
                hexElement.textContent = `  - Hex: ${JSON.stringify(hexInfo)}`;
                regionContent.appendChild(hexElement);
            });
        });

    }

    consoleRegionsMore() {
        const testDashboard = document.getElementById('testDashboard');
        const regionContent = this.createDashboardSection(
            testDashboard,
            '---------------明确的分割线 打印筛选范围------------------',
            '清除region',
            (container) => this.cleanMe(container)
        );

        this.main.hexGrid.regions.forEach((region, index) => {
    
            // 仅显示 id, brush, regionbelond, 和 type 属性
            const hexElement = document.createElement('div');
            const hexInfo = {
                id: region.name,
                内效存储区: region.innerEffectArea,
                内效区: region.getInnerEffectArea(),
                内效细节: region.getInnerEffectDetailList(),
                内销分类: region.getInnerEffectCountList(),
                内效总计: region.getTotalInnerEffects(),
            };
    
            hexElement.textContent = `第 ${index + 1} 个六边形: ${JSON.stringify(hexInfo)}`;
            regionContent.appendChild(hexElement);
        });

    }

    consoleRegionsNebohor() {
        const testDashboard = document.getElementById('testDashboard');

        const regionContent = this.createDashboardSection(
            testDashboard,
            '---------------明确的分割线 打印筛选范围------------------',
            '清除region',
            (container) => this.cleanMe(container)
        );

        this.main.hexGrid.regions.forEach((region, index) => {
    
            // 仅显示 id, brush, regionbelond, 和 type 属性
            const hexElement = document.createElement('div');
            const hexInfo = {
                id: region.name,
                type: region.type,
                count: region.hexes.size,
                hexes: region.hexes,
                邻居情况: region.getNeighborHex().length,
            };
    
            hexElement.textContent = `第 ${index + 1} 个六边形: ${JSON.stringify(hexInfo)}`;
            regionContent.appendChild(hexElement);

            // 遍历 region.hexes 中的每个 hex
            region.hexes.forEach((hex) => {
                const hexElement = document.createElement('div');
                const hexInfo = {
                    id: hex.id,
                    笔刷: hex.brush,
                    归属区域: hex.regionBelond,
                    类型: hex.type
                };
                
                hexElement.textContent = `  - Hex: ${JSON.stringify(hexInfo)}`;
                regionContent.appendChild(hexElement);
            });
        });

    }


    testButton() {
        const testDashboard = document.getElementById('testDashboard')
        this.createButton(testDashboard, '打印Brush', () => this.BrushInfo());
        this.createButton(testDashboard, '打印hexGrid', () => this.hexGridInfo());
        this.createButton(testDashboard, '打印hexGrid 筛选范围', () => this.hexGridInfoSimaple());
        this.createButton(testDashboard, '打印Hubs', () => this.hubsContent());
        this.createButton(testDashboard, '打印region', () => this.consoleRegions());
        this.createButton(testDashboard, '打印region显示材料', () => this.consoleRegionsMore());
    }

    cleanMe(content) {
        content.innerHTML = '';
    }


    createDashboardSection(parentElement, sectionText, buttonText, buttonCallback) {
        const sectionContainer = document.createElement('div');
        parentElement.appendChild(sectionContainer);
    
        const sectionContent = document.createElement('div');
        sectionContent.textContent = sectionText;
        sectionContainer.appendChild(sectionContent);
    
        const actionButton = document.createElement('button');
        actionButton.textContent = buttonText;
        actionButton.onclick = () => buttonCallback(sectionContainer);
        sectionContainer.appendChild(actionButton);
    
        return sectionContainer;
    }

    createButton(parentElement, buttonText, onClickCallback) {
        const button = document.createElement('button');
        button.textContent = buttonText;
        button.onclick = onClickCallback;
        parentElement.appendChild(button);
        return button;
    }
}
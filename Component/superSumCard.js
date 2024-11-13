
export class SuperSumCard {
    constructor(hexGrid) {
        this.hubs = hexGrid.hubs;
        this.regions = hexGrid.regions;
    }

    updateCard() {
        const hubsResult = this.processList(this.hubs, hub => hub.findHubsEffectedRegion.length);
        console.log("hubsResult:", hubsResult);

        const regionsResult = this.processList(this.regions, region => region.totalHubsCount);
        console.log("regionsResult:", regionsResult);

        const regionsEffectResult = this.processList(this.regions, region => region.innerEffectAreaCount);
        console.log("regionsEffectResult:", regionsEffectResult);

        // 创建并插入卡片
        const hubsArea = this.numberListCard(hubsResult, '枢纽加成区域统计');
        const regionsToHubsArea = this.numberListCard(regionsResult, '区域拥有枢纽数量');
        const regionsEffectArea = this.numberListCard(regionsEffectResult, '区域相邻效应数量');

        const superSumCard = document.getElementById('superSumCard');
        superSumCard.innerHTML='';
        const refreshBtn = document.createElement('button');
        refreshBtn.textContent = "刷新";
        refreshBtn.classList.add('main-styled-button');
        refreshBtn.classList.add('supersumcard-container-button')
        refreshBtn.addEventListener('click', () => {
            
            this.updateCard();
        });  // 修复事件名称

        if (superSumCard) {
            superSumCard.append(hubsArea, regionsToHubsArea, regionsEffectArea, refreshBtn);
        } else {
            console.error("未找到 superSumCard 元素");
        }
    }

    processList(items, getValueFn) {
        const countMap = new Map();
    
        items.forEach(item => {
            const length = getValueFn(item);
            countMap.set(length, (countMap.get(length) || 0) + 1);
        });
    
        // 转换为数组并按 length 升序排序
        return Array.from(countMap.entries())
            .map(([length, count]) => ({ length, count }))
            .sort((a, b) => a.length - b.length);  // 按 length 从小到大排序
    }

    numberListCard(list, titleText) {
        const container = this.createElement('div', 'supersumcard-container');
        const title = this.createElement('h1');
        title.textContent = titleText;
    
        // 找到 count 最大的 entry
        const maxCount = Math.max(...list.map(info => info.count));
    
        const listArea = this.createElement('div', 'supersumcard-list-container');
        list.forEach(info => {
            const infoCard = this.numberInfoCard(info);
    
            // 如果该项是最大 count，添加特定的类名
            if (info.count === maxCount) {
                infoCard.classList.add('supersumcard-info-container-max');
            }
    
            listArea.append(infoCard);
        });
    
        container.append(title, listArea);
        console.log("numberListCard 生成的容器:", container);
        return container;
    }

    numberInfoCard(info) {
        const container = this.createElement('div', 'supersumcard-info-container');
        const topArea = this.createElement('p', 'supersumcard-info-container-top');
        topArea.textContent = info.length;

        const bottomArea = this.createElement('p', 'supersumcard-info-container-bottom');
        bottomArea.textContent = info.count;

        container.append(topArea, bottomArea);
        console.log("numberInfoCard 生成的卡片:", container);
        return container;
    }

    // 创建带有类名的元素，减少代码重复
    createElement(tag, className = '') {
        const element = document.createElement(tag);
        if (className) element.classList.add(className);
        return element;
    }
}


class RegionInfoCard { 
    constructor(region, regionsCard) { 
        this.region = region; 
        this.regionsCard = regionsCard; 
        this.totalInnerEffects = region.getTotalInnerEffects(); 
        this.innerEffectCountList = region.getInnerEffectCountList(); 
        this.innerEffectDetailList = region.getInnerEffectDetailList(true); 
    } 

    updateCard() { 

        const content = document.createElement('div'); 
        content.classList.add('regionInfoCard');
        // Create title
        const title = document.createElement('h1'); 
        title.textContent = this.region.name;
        title.classList.add('regioncard-region-title')
        content.append(title); 

        // Append label area
        const labelArea = this.labelArea();
        content.append(labelArea);

        const infoArea = document.createElement('div');
        infoArea.classList.add('regionInfoCard-infoArea')
        content.append(infoArea);

        const innerRegionContent = this.innerRegion();
        infoArea.append(innerRegionContent);

        const hubsTitle = document.createElement('h2'); 
        hubsTitle.textContent = `枢纽效应`; 
        infoArea.append(hubsTitle); 

        const outTitle = document.createElement('h2'); 
        outTitle.textContent = `外馈效应`; 
        infoArea.append(outTitle); 

        //区域信息更细节内容
        const detailExpandContent = this.detailExpand();
        detailExpandContent.classList.add('regionInfoCard-infoExpandArea');
        content.append(detailExpandContent);

        const expandBtn = document.createElement('button'); 
        expandBtn.textContent = `更多信息`; 
        content.append(expandBtn); 

        // Append the complete content to regionsCard
        this.regionsCard.append(content);
    } 

    labelArea() { 
        const labelArea = document.createElement('div'); 
        labelArea.classList.add('regionscard-label-content');

        const type = document.createElement('h4'); 
        type.textContent = `类型: ${this.region.type}`; 
        labelArea.append(type); 

        const count = document.createElement('h4'); 
        count.textContent = `格数: ${this.region.hexes.size}`; 
        labelArea.append(count); 

        const neighbors = document.createElement('h4'); 
        neighbors.textContent = `邻数: ${this.region.getNeighborHex().length}`; 
        labelArea.append(neighbors); 

        return labelArea; 
    } 

    innerRegion() { 
        const content = document.createElement('div');

        const innerTitle = document.createElement('h2'); 
        innerTitle.textContent = `内部效应`; 
        content.append(innerTitle); 

        const countContent = document.createElement('div'); 
        content.append(countContent); 

        const innerRegionCount = document.createElement('h3'); 
        innerRegionCount.textContent = `区域总数: ${this.region.innerEffectAreaCount}`; 
        countContent.append(innerRegionCount); 

        const effectHubsCount = document.createElement('h3'); 
        effectHubsCount.textContent = `枢纽总数: ${this.region.effectHubs.size}`; 
        countContent.append(effectHubsCount); 

        const totalHeat = document.createElement('p'); 
        totalHeat.textContent = `热能： ${this.totalInnerEffects.heat}`; 
        content.append(totalHeat); 

        const pollution = document.createElement('p'); 
        pollution.textContent = `脏污： ${this.totalInnerEffects.pollution}`; 
        content.append(pollution); 

        const disease = document.createElement('p'); 
        disease.textContent = `疾病： ${this.totalInnerEffects.disease}`; 
        content.append(disease); 

        return content; 
    } 

    detailExpand() { 
        const content = document.createElement('div');

        const acount = document.createElement('h2'); 
        acount.textContent = `区域分类效应`; 
        content.append(acount); 

        this.innerEffectCountList.forEach(t => { 
            const regionContainer = this.listArea(t.title, t.items, 'h3'); 
            content.append(regionContainer); 
        }); 

        const detail = document.createElement('h2'); 
        detail.textContent = `区域细节效应`; 
        content.append(detail); 

        this.innerEffectDetailList.forEach(detailItem => { 
            const container = this.listArea(detailItem.title, detailItem.items, 'h3'); 
            content.append(container); 
        }); 

        return content;
    } 

    listArea(titleText, items, tagName) { 
        const title = document.createElement(tagName); 
        title.textContent = titleText; 
        title.classList.add('regioninfo-listTitle'); 

        const list = document.createElement('ul'); 
        items.forEach(item => { 
            const listItem = document.createElement('li'); 
            listItem.textContent = item; 
            listItem.style.fontSize = '14px'; 
            list.appendChild(listItem); 
        }); 

        const container = document.createElement('div'); 
        container.appendChild(title); 
        container.appendChild(list); 

        return container; 
    } 
} 

export function initRegionsCard(hexGrid) { 
    const regionsCard = document.getElementById('regionsCard'); 
    regionsCard.innerHTML= '';
    const regions = hexGrid.regions; 
    regions.forEach(region => { 
        const regionCard = new RegionInfoCard(region, regionsCard); 
        regionCard.updateCard();
    }); 
}
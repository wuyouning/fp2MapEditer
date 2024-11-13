import { hexGrid } from "../main/module.js";

export class RegionInfoCard { 
    constructor(region, regionsCard) { 
        this.region = region; 
        this.regionsCard = regionsCard; 

        this.innerTotalEffects = region.getTotalInnerEffects(); 
        this.innerEffectCountList = region.getInnerEffectCountList(); 
        this.innerEffectDetailList = region.getInnerEffectDetailList(true);

        this.outerEffectDetailList = region.getOuterEffectDetailList();
        this.outerEffectTotalList = region.summarizeOuterEffectDetails();

        this.hubDetailList = region.hubEffectList('d');
        this.hubAcountList = region.hubEffectList('a');
        this.hubsTotalList = region.hubEffectList('t');

    } 

    updateCard() { 

        const content = document.createElement('div'); 
        content.classList.add('regionInfoCard');
        // 标题区
        const title = document.createElement('h1'); 
        title.textContent = this.region.name;
        title.classList.add('regioncard-region-title')
        content.append(title); 

        // 标签区
        const labelArea = this.labelArea();
        content.append(labelArea);

        // 信息区
        const infoArea = document.createElement('div');
        infoArea.classList.add('regionInfoCard-infoArea')
        content.append(infoArea);

        const innerRegionContent = this.innerRegion();
        infoArea.append(innerRegionContent);

        const hubEffectContent = this.hubsEffectArea();
        infoArea.append(hubEffectContent);

        const outRegionContent = this.outerEffectRegion();
        infoArea.append(outRegionContent); 

        // 区域信息更细节内容
        const detailExpandContent = document.createElement('div');
        detailExpandContent.classList.add('regionCard-DetailExpandArea');
        detailExpandContent.style.display = 'none';  // 默认隐藏


        // 获取详细信息并追加
        if (this.region.innerEffectAreaCount > 0 ) {
            const regionDetailExpandContent = this.detailExpand();
            regionDetailExpandContent.classList.add('regionInfoCard-infoExpandArea');
            detailExpandContent.appendChild(regionDetailExpandContent); 
        }


        if (this.region.effectHubs.size > 0) {
            const hubsdetailExpandContent = this.hubsdetailExpand();
            hubsdetailExpandContent.classList.add('regionInfoCard-infoExpandArea');
            detailExpandContent.appendChild(hubsdetailExpandContent); 
        }

        // 最后将父容器添加到主内容
        content.appendChild(detailExpandContent);

        // 创建扩展按钮（仅当 hubDetailList 和 innerEffectDetailList 有内容时显示）
        if (this.hubDetailList.length > 0 || this.innerEffectDetailList.length > 0) {
            const expandBtn = document.createElement('button'); 
            expandBtn.textContent = `更多信息`; 
            expandBtn.classList.add('region-styled-button');

            // 使用布尔变量管理按钮状态
            let isExpanded = false;
            expandBtn.addEventListener('click', () => {
                isExpanded = !isExpanded;
                detailExpandContent.style.display = isExpanded ? 'flex' : 'none';
                expandBtn.textContent = isExpanded ? '收起' : '更多信息';
            });

            // 将按钮追加到内容中
            content.appendChild(expandBtn);
        }


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

        const totalHeat = document.createElement('p'); 
        totalHeat.textContent = `热能： ${this.innerTotalEffects.heat}`; 
        content.append(totalHeat); 

        const pollution = document.createElement('p'); 
        pollution.textContent = `脏污： ${this.innerTotalEffects.pollution}`; 
        content.append(pollution); 

        const disease = document.createElement('p'); 
        disease.textContent = `疾病： ${this.innerTotalEffects.disease}`; 
        content.append(disease); 

        return content; 
    } 

    hubsEffectArea() {
        const content = document.createElement('div');

        const hubsTitle = document.createElement('h2'); 
        hubsTitle.textContent = `枢纽效应`; 
        content.append(hubsTitle); 

        const effectHubsCount = document.createElement('h3'); 
        effectHubsCount.textContent = `枢纽总数: ${this.region.effectHubs.size}`; 
        content.append(effectHubsCount); 

        this.hubsTotalList.forEach(r => {
            const title = document.createElement('p');
            title.textContent = `${r.effect}: ${r.effectValue} `
            content.append(title);
        });

        return content;
    }

    outerEffectRegion() { 
        const content = document.createElement('div');

        const innerTitle = document.createElement('h2'); 
        innerTitle.textContent = `外馈效应`; 
        content.append(innerTitle); 

        const countContent = document.createElement('div'); 
        content.append(countContent); 

        const innerRegionCount = document.createElement('h3'); 
        innerRegionCount.textContent = `区域总数: ${this.region.getOuterEffectArea().length}`; 
        countContent.append(innerRegionCount); 

        const totalHeat = document.createElement('p'); 
        totalHeat.textContent = `热能： ${this.outerEffectTotalList.totalHeat}`; 
        content.append(totalHeat); 

        const pollution = document.createElement('p'); 
        pollution.textContent = `脏污： ${this.outerEffectTotalList.pollutionDirtCount}`; 
        content.append(pollution); 

        const disease = document.createElement('p'); 
        disease.textContent = `疾病： ${this.outerEffectTotalList.pollutionDiseaseCount}`; 
        content.append(disease); 

        return content; 
    } 

    detailExpand() { 
        const content = document.createElement('div'); // 主容器
    
        // 创建 acountContent
        const acountContent = document.createElement('div');
        acountContent.classList.add('detailExpand-side');
    
        const acount = document.createElement('h2'); 
        acount.textContent = `对内效应分类`; 
        acountContent.append(acount); 
    
        this.innerEffectCountList.forEach(t => { 
            const container = listArea(t.title, t.items, 'h3'); 
            acountContent.append(container); 
        }); 
    
        // 创建 detailContent
        const detailContent = document.createElement('div');
        detailContent.classList.add('detailExpand-side');
    
        const detail = document.createElement('h2'); 
        detail.textContent = `对内效应明细`; 
        detailContent.append(detail); 
    
        this.innerEffectDetailList.forEach(detailItem => { 
            const container = listArea(detailItem.title, detailItem.items, 'h3'); 
            detailContent.append(container); 
        }); 
    
        // 将 acountContent 和 detailContent 追加到主容器 content
        content.append(acountContent);
        content.append(detailContent);
    
        return content;
    }

    hubsdetailExpand() { 
        const content = document.createElement('div'); // 主容器
    
        // 创建 acountContent
        const acountContent = document.createElement('div');
        acountContent.classList.add('detailExpand-side');
    
        const acount = document.createElement('h2'); 
        acount.textContent = `枢纽分类`; 
        acountContent.append(acount); 
    
        this.hubAcountList.forEach(t => { 
            const container = listArea(t.titleText, t.items, 'h3'); 
            acountContent.append(container); 
        }); 
    
        // 创建 detailContent
        const detailContent = document.createElement('div');
        detailContent.classList.add('detailExpand-side');
    
        const detail = document.createElement('h2'); 
        detail.textContent = `枢纽明细`; 
        detailContent.append(detail); 
    
        this.hubDetailList.forEach(detailItem => { 
            const container = listArea(detailItem.titleText, detailItem.items, 'h3'); 
            detailContent.append(container); 
        }); 
    
        // 将 acountContent 和 detailContent 追加到主容器 content
        content.append(acountContent);
        content.append(detailContent);
    
        return content;
    }


} 
//序列表
function listArea(titleText, items, tagName) { 
    const title = document.createElement(tagName); 
    title.textContent = titleText; 
    title.classList.add('regioninfo-listTitle'); 

    const list = document.createElement('ul');
    list.classList.add('regioninfo-ul')
    items.forEach(item => { 
        const listItem = document.createElement('li'); 
        listItem.textContent = item; 
        listItem.style.fontSize = '12px'; 
        list.appendChild(listItem); 
    }); 

    const container = document.createElement('div'); 
    container.appendChild(title); 
    container.appendChild(list); 

    return container; 
} 

export class HubCard {
    constructor(hub, regionsCard) {
        this.name = hub.regionBelond;
        this.type = hub.brush;
        this.hubEffect = hub.hubEffect;
        this.effect = this.hubEffect?.effect;
        this.effectValue = this.hubEffect?.effectValue;
        this.effectedAreaList = hub.findHubsEffectedRegion;
        this.regionsCard = regionsCard;
    }

    get acountEffectValue() {
        return this.effectedAreaList.length * this.effectValue
    }
    updateCard() {
        const content = document.createElement('div'); 
        content.classList.add('regionInfoCard');
        // Create title
        const title = document.createElement('h1'); 
        title.textContent = this.name;
        title.classList.add('regioncard-region-title')
        content.append(title); 

        // Append label area
        const labelArea = this.labelArea();
        content.append(labelArea);

        const hubEffectArea = this.hubEffectArea();
        content.append(hubEffectArea)

        this.regionsCard.append(content);
    }

    labelArea() { 
        const labelArea = document.createElement('div'); 
        labelArea.classList.add('regionscard-label-content');

        const type = document.createElement('h4'); 
        type.textContent = `类型: ${this.type}`; 
        labelArea.append(type); 

        const count = document.createElement('h4'); 
        count.textContent = `作用: ${this.effect}`; 
        labelArea.append(count); 

        const neighbors = document.createElement('h4'); 
        neighbors.textContent = `效应值: ${this.effectValue}`; 
        labelArea.append(neighbors); 

        return labelArea; 
    }

    hubEffectArea() { 
        const content = document.createElement('div');

        const leftContent = document.createElement('div'); 
        content.append(leftContent); 

        const regionEfecctedValueCount = document.createElement('h2'); 
        regionEfecctedValueCount.textContent = `总效应： ${this.acountEffectValue}`; 
        leftContent.append(regionEfecctedValueCount); 

        const rightcontent = document.createElement('div'); 
        content.append(rightcontent); 
            const regionList = listArea(`覆盖区域总数: ${this.effectedAreaList.length}`, this.effectedAreaList, 'h2');
            rightcontent.append(regionList);
        return content; 
    } 


}

export function initRegionsCard(hexGrid) { 
    const regionsCard = document.getElementById('regionsCard'); 
    regionsCard.innerHTML= '';
    const summaryCard = new SummaryCard(hexGrid);
    const suCard = summaryCard.updateCard();
    regionsCard.append(suCard);
    const regions = hexGrid.regions;
    regions.forEach(region => { 
        const regionCard = new RegionInfoCard(region, regionsCard); 
        regionCard.updateCard();
    }); 

    const hubs = hexGrid.hubs;
    hubs.forEach(hub => {
        const hubCard = new HubCard(hub, regionsCard);
        hubCard.updateCard();
    });
}

class SummaryCard {
    constructor(hexGrid) {
        this.hexesGrid = hexGrid;
        this.regionsCount = hexGrid.regions.size;
        this.hubsCount = hexGrid.hubs.size;
        this.hexes = hexGrid.hexes.size;
        this.drawedHexes = hexGrid.drwaedHexCount();
    }

    updateCard() {
        const content = document.createElement('div'); 
        content.classList.add('regionInfoCard');
        // 标题区
        const title = document.createElement('h1'); 
        title.textContent = `规划总计`;
        title.classList.add('regioncard-region-title')
        content.append(title); 

        const regionsCountText = document.createElement('h2');
        regionsCountText.textContent = `区域总数: ${this.regionsCount}`;
        const hubsCountText = document.createElement('h2');
        hubsCountText.textContent = `枢纽总数: ${this.hubsCount}`;
        const hexes = document.createElement('h2');
        hexes.textContent = `绘制 / 总格子数: ${this.drawedHexes} / ${this.hexes}`;

        content.append(regionsCountText, hubsCountText, hexes);

        return content;
    }
}


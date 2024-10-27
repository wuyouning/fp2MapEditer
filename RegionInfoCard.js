function updateRegionCards() {
    const parentToolbar = document.getElementById('toolbar2');
  
    // 封装一个用于创建垂直区域列表的函数
    function createVerticalList(titleText, items, param = 'p', titleFontSize = '14px') {
      const title = document.createElement(param);
      title.textContent = titleText;
      title.className = 'stat-title';
  
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
  
    function renderInnerEffectUI(innerEffectData, param) {
      const container = document.createElement('div');
      let listData;
      if (param === 'd') {
        listData = innerEffectData('d');
        listData.forEach(detail => {
          let items = detail.pollution === null ? [`${detail.heat}`] : [`${detail.heat}`, `${detail.pollution}`];
          const list = createVerticalList(`${detail.region}`, items);
          container.appendChild(list);
        });
      } else if (param === 'a') {
        listData = innerEffectData('a');
        listData.forEach(effect => {
          let items = [
            `${effect.heat}`,
            effect.pollution !== null ? `${effect.pollution}` : '',
            effect.disease !== null ? `${effect.disease}` : '',
          ].filter(Boolean);
          const list = createVerticalList(`${effect.type}`, items);
          container.appendChild(list);
        });
      } else if (param === 't') {
        const totalEffects = innerEffectData('t');
        const items = [
          `热能: ${totalEffects.heat}`,
          `脏污: ${totalEffects.pollution}`,
          `疾病: ${totalEffects.disease}`
        ];
        const title = `效应区域数: ${totalEffects.region}`;
        const list = createVerticalList(title, items);
        container.appendChild(list);
      }
      return container;
    }
  
    function createStyledCard(backgroundColor = '#f9f9c5') {
      const regionCard = document.createElement('div');
      regionCard.className = 'region-card';
      regionCard.style.backgroundColor = backgroundColor;
      return regionCard;
    }
  
    parentToolbar.innerHTML = '';
  
    // 添加区域内容统计卡片
    const summaryCard = createStyledCard('#f9f9c5');
    const summaryTitle = document.createElement('h4');
    summaryTitle.textContent = `统计信息`;
    summaryTitle.className = 'region-title';
    summaryCard.appendChild(summaryTitle);
  
    const regionStats = hexGrid.regionStatistics();
    const regionItems = Object.entries(regionStats).map(([type, count]) => `${type}: ${count}`);
    const regionStatList = createVerticalList(`总区域数: ${hexGrid.regions.length}`, regionItems);
    summaryCard.appendChild(regionStatList);
  
    const hubStats = hexGrid.hubsStatistics();
    const hubItems = Object.entries(hubStats).map(([type, count]) => `${type}: ${count}`);
    const hubStatList = createVerticalList(`总枢纽数: ${hexGrid.hubs.length}`, hubItems);
    summaryCard.appendChild(hubStatList);
  
    parentToolbar.appendChild(summaryCard);
  
    hexGrid.regions.forEach(region => {
      const card = createStyledCard('white');
  
      const name = document.createElement('h4');
      name.textContent = `${region.name}`;
      name.className = 'region-title';
      card.appendChild(name);
  
      const type = document.createElement('p');
      type.textContent = `类型: ${region.type}`;
      type.className = 'region-info';
      card.appendChild(type);
  
      const hexCount = document.createElement('p');
      hexCount.textContent = `格子数量: ${region.hexes.length}`;
      hexCount.className = 'region-info';
      card.appendChild(hexCount);
  
      const neighborCount = document.createElement('p');
      neighborCount.textContent = `邻居数量: ${region.getAreaOneRingHex().length}`;
      neighborCount.className = 'region-info';
      card.appendChild(neighborCount);
  
      if (region.innerEffectArea.length > 0 || region.totalHubsCount > 0) {
        const totalEffectsTitle = document.createElement('h4');
        totalEffectsTitle.textContent = `效应总计`;
        totalEffectsTitle.className = 'effect-title';
        card.appendChild(totalEffectsTitle);
  
        const totalEffects = region.InnerEffect('t');
        const listTitle = `区域总数: ${totalEffects.region} 枢纽总数: ${region.totalHubsCount}`;
        const listItems = region.effectSummary;
        const effectSummaryList = createVerticalList(listTitle, listItems);
        card.appendChild(effectSummaryList);
      }
  
      if (region.innerEffectArea.length > 0) {
        const titleAcount = document.createElement('h4');
        titleAcount.textContent = `效应分类统计`;
        titleAcount.className = 'effect-title';
        card.appendChild(titleAcount);
  
        const innerEffectCountList = renderInnerEffectUI(region.InnerEffect.bind(region), 'a');
        card.appendChild(innerEffectCountList);
  
        const titleDetail = document.createElement('h4');
        titleDetail.textContent = `效应细节`;
        titleDetail.className = 'effect-title';
        card.appendChild(titleDetail);
  
        const innerEffectDetailList = renderInnerEffectUI(region.InnerEffect.bind(region), 'd');
        card.appendChild(innerEffectDetailList);
      }
  
      const effectStats = region.hubsEffectStat;
      if (Object.keys(effectStats).length > 0) {
        const effectTitle = document.createElement('h4');
        effectTitle.textContent = `枢纽效应统计`;
        effectTitle.className = 'effect-title';
        card.appendChild(effectTitle);
  
        Object.entries(effectStats).forEach(([brushType, data]) => {
          const listTitle = `${brushType}`;
          const listItems = [
            `数量: ${data.count}`,
            `${data.effectType}`,
            `总效应: ${data.totalEffect}`
          ];
          const hubEffectList = createVerticalList(listTitle, listItems);
          card.appendChild(hubEffectList);
        });
      }
  
      if (region.outerEffect.length > 0) {
        const outerEffectListTitle = document.createElement('h4');
        outerEffectListTitle.textContent = `效应分类统计`;
        outerEffectListTitle.className = 'effect-title';
        card.appendChild(outerEffectListTitle);
  
        const outerEffectList = createVerticalList('', region.outerEffect, 'h4');
        card.appendChild(outerEffectList);
      }
  
      parentToolbar.appendChild(card);
    });
  
    hexGrid.hubs.forEach(hub => {
      const card = createStyledCard('white');
  
      const name = document.createElement('h4');
      name.textContent = `${hub.region}`;
      name.className = 'region-title';
      card.appendChild(name);
  
      const hubEffect = hub.hubEffect;
      const effect = document.createElement('p');
      effect.textContent = `${hubEffect.effect}`;
      effect.className = 'region-info';
      card.appendChild(effect);
  
      if (hub.effectedArea !== 0) {
        const hexCount = document.createElement('p');
        hexCount.textContent = `总效应: ${hubEffect.effectValue * hub.findEffectedArea.length}`;
        hexCount.className = 'region-info';
        card.appendChild(hexCount);
  
        const effectAreaList = createVerticalList(`覆盖数: ${hub.findEffectedArea.length}`, hub.findEffectedArea);
        card.appendChild(effectAreaList);
      }
  
      parentToolbar.appendChild(card);
    });
  }
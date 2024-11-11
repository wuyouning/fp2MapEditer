import { hexGrid } from "../main/module.js";
import { asideCard } from "../index.js";
import { selectedBrush } from "../main/module.js";
import { Hex } from "../main/modules/Hex.js";
import { initRegionsCard } from "./regionInfoCard.js";
import { Region } from "../main/modules/Region.js";
import { Popup } from "./loadingSpinner.js";
import { closeNavBarWithSlider } from "./buttonComponent.js";

class HexGridCard {
    
    constructor(hexGrid, isPrivate) {
        this.title = hexGrid.hexgrid_name;
        this.desc = hexGrid.description;
        this.ownName = hexGrid.owner_name;
        this.updateTime = this.formatDate(hexGrid.lastedit_at);
        this.creatTime = this.formatDate(hexGrid.created_at);
        this.isPrivate = isPrivate;
        this.newHexGrid = hexGrid;
        this.loadingPopup = new Popup();
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0'); // 月份从0开始，需要加1
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}/${month}/${day}`;
    }

    render() {
        const container = document.createElement('button');

        container.classList.add('hexgrid-card');
        if (this.isPrivate) {
            container.classList.add('hexgrid-card-private');
        } else {
            container.classList.add('hexgrid-card-public');
        }


        const inputArea = this.inputArea();
        const infoArea = this.infoArea();
        const buttonArea = this.buttonArea();

        container.append(inputArea, infoArea, buttonArea);
        return container;
    }

    inputArea() {
        const inputArea = document.createElement('div');

        const titleArea = document.createElement('input');
        titleArea.classList.add('gridCard-title');
        titleArea.value = this.title;
        titleArea.readOnly = !this.isPrivate;
        titleArea.disabled = !this.isPrivate;


        const descArea = document.createElement('textarea');
        descArea.classList.add('gridCard-desc');
        descArea.value = this.desc;
        descArea.readOnly = !this.isPrivate;
        descArea.disabled = !this.isPrivate;

        inputArea.append(titleArea, descArea);

        return inputArea;
    }

    infoArea() {
        const container = document.createElement('div');
        container.classList.add('gridCard-infoArea');

        const leftText = document.createElement('p');
        
        const rightText = document.createElement('p');
        
        if (this.isPrivate) {
            leftText.textContent = `创建日期：${this.creatTime}`;
            rightText.textContent = `更新日期：${this.updateTime}`;
        } else {
            leftText.textContent = this.ownName;
            rightText.textContent = `更新日期：${this.updateTime}`;
        }

        container.append(leftText, rightText);

        return container;
    }

    buttonArea(){
        const container = document.createElement('div');
        container.classList.add('gridCard-buttonArea');

        const importBtn = document.createElement('button');
        importBtn.textContent = '导入';
        importBtn.addEventListener('click',() => {
            console.log('导入被按到了', this.newHexGrid)
            this.importHexGrid();
            asideCard.updateBrushInfo();
            hexGrid.refreshMe();
            initRegionsCard(hexGrid);
        })
        
        const updateBtn = document.createElement('button');
        updateBtn.textContent = '更新';
        updateBtn.addEventListener('click',() => {
            console.log('更新被按到了')
        })

        const deletBtn = document.createElement('button');
        deletBtn.textContent = '删除';
        deletBtn.addEventListener('click',() => {
            console.log('删除被按到了')
        })

        if (this.isPrivate) {
            container.append(importBtn, updateBtn, deletBtn);
        } else {
            container.append(importBtn);
        };
        return container;
    }

    async importHexGrid() {
        try {
            this.loadingPopup.show('加载规划图中....', 'progress');

            const h = this.newHexGrid;
            // hexGrid.cleanGrid(selectedBrush);
            // hexGrid.drawHexagons();

            hexGrid.name = h.hexgrid_name;
            hexGrid.description = h.description;
            hexGrid.ownerId = '';
            hexGrid.hexGridid = '';

            this.importHexes(h.hexgrid_id);
            hexGrid.setHexSize(h.hexSize);
            hexGrid.setMaxRadius(h.maxRadius);

            console.log('成功更新了')
            this.loadingPopup.show('成功更新了', 'success', 2000)

        } catch (error) {
            this.loadingPopup.show(`出现错误导致终端了 ${error.message}`, 'error', 3000)
            console.error('下载hexGrid出错了', error);
        }
    }

    async importHexes(hexgrid_id) {
        try {

            this.loadingPopup.show('加载小格子中...', 'progress');

            const response = await fetch(`http://127.0.0.1:3000/api/hexes/${hexgrid_id}`);
            if (!response.ok) {
                throw new Error(`错误 ${response.statusText}`);
            }

            const hexData = await response.json();

            const hexList = hexData.map(data => new Hex(
                data.q,
                data.r,
                data.s,
                data.brush,
                data.region,
                data.type,
                hexGrid.hexSize,
            ));
            // hexGrid.orgazationHexes(hexList);


            this.ogana(hexList);
            this.loadingPopup.show('成功加载全部格子啦','success', 10000)
            setTimeout(() => {
                closeNavBarWithSlider();
            }, 1000);


        } catch (error) {
            this.loadingPopup.show(`加载小格子失败了: ${error.message}`, 'error', 5000);
            console.error('hexes下载失败', error);
        }
    }

    ogana(hexList) {
        hexGrid.hexes.clear();
        hexGrid.regions.clear();
        hexGrid.hubs.clear();

        const regionMap = {};
        const hubMap = [];
        hexList.forEach(hex => {
            hexGrid.hexes.add(hex);
            if (hex.type === '属地') {

                const region = hex.regionBelond;


                if (!regionMap[region]) {
                    regionMap[region] = [];
                }

                regionMap[region].push(hex);

            }

            if (hex.type === '枢纽') {
                hex.createHub(hexGrid.hubs, hex.brush);
                hubMap.push(hex);
            }
        })

        for (const region in regionMap) {
            const hexesList = regionMap[region];

            const newRegion = new Region(hexesList[0].region, hexesList, hexesList[0].brush);
            hexGrid.regions.add(newRegion);


        }

        hubMap.forEach(hex => {
            hex.updateEffectedRegions();
        })

        // hexGrid.updateAllRegions();
        initRegionsCard(hexGrid);

        hexGrid.drawHexagons();
    }

    ogana2(hexList) {
        const regionMap = {};
        const hubMap = [];
        hexList.forEach(hex => {
            if (hex.type === '属地') {
                console.log('处理的对象是', hex)
                const region = hex.regionBelond;
                console.log('排查 - 获得表名',region)

                if (!regionMap[region]) {
                    regionMap[region] = [];
                }

                regionMap[region].push(hex);
                console.log('排查 - 建立映射',regionMap[region])
                console.log('总表呢', regionMap)
            }

            if (hex.type === '枢纽') {
                hex.createHub(hexGrid.hubs, hex.brush);
                hubMap.push(hex);
            }
        });

        for (const region in regionMap) {
            const hexesList = regionMap[region];

            const newRegion = new Region(hexesList[0].region, hexesList, hexesList[0].brush);
            hexGrid.regions.add(newRegion);


        }

        hubMap.forEach(hex => {
            hex.updateEffectedRegions();
        })

        // hexGrid.updateAllRegions();
        initRegionsCard(hexGrid);
    }
}


class HexGridGalley {
    constructor() {
        this.currentOffsetPublic = 0;  // 公共画布的当前偏移量
        this.currentOffsetPrivate = 0; // 私有画布的当前偏移量
        this.limit = 20;  // 每页条数

        this.loadingPopup = new Popup();
    }

    async initPublic() {
        try {
            this.loadingPopup.show('数据加载中,请等待.....', 'progress');

            const response = await fetch(`http://127.0.0.1:3000/api/get-public-hexgrids?offset=${this.currentOffsetPublic}&limit=${this.limit}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('无法获取公共 HexGrid 数据');
            }

            const hexGrids = await response.json();

            this.loadingPopup.close();
            // 获取公共容器元素
            const publicCard = document.getElementById('publicCard');

            const galley = publicCard.querySelector('.hexgrid-galley') || document.createElement('div');
            galley.classList.add('hexgrid-galley');

            hexGrids.forEach(hexGrid => {
                const gridCard = new HexGridCard(hexGrid, false);
                galley.append(gridCard.render());
            });

            if (!publicCard.querySelector('.hexgrid-galley')) {
                publicCard.append(galley);
            }

            // 更新偏移量
            this.currentOffsetPublic += hexGrids.length;

            // 创建“加载更多”按钮
            let loadMoreBtn = publicCard.querySelector('.galley-pagenav');
            if (!loadMoreBtn) {
                loadMoreBtn = document.createElement('button');
                loadMoreBtn.classList.add('galley-pagenav');
                loadMoreBtn.textContent = '更多';
                loadMoreBtn.addEventListener('click', () => {
                    this.initPublic();  
                });
                publicCard.append(loadMoreBtn);
            }

            // 如果返回的数据量小于 limit，则隐藏“加载更多”按钮
            if (hexGrids.length < this.limit) {
                loadMoreBtn.style.display = 'none';
            } else {
                loadMoreBtn.style.display = 'block';
            }

        } catch (error) {
            this.loadingPopup.show(`出现错误: ${error.message}`, 'error', 3000);
            console.error('展示公共 HexGrid 时出错啦', error);
        }
    }

    async initPrivate() {
        try {
            this.loadingPopup.show('私有画廊加载中,请等待...', 'progress');

            const owner_id = localStorage.getItem('uuid');
            if (!owner_id) {
                console.log('前端无法获取 id');
                throw new Error('无法获取用户的 UUID');
            }

            const response = await fetch(`http://127.0.0.1:3000/api/get-private-hexgrids?owner_id=${owner_id}&offset=${this.currentOffsetPrivate}&limit=${this.limit}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('无法获取私有 HexGrid 数据');
            }

            const hexGrids = await response.json();

            this.loadingPopup.close();
            // 获取私有容器元素
            const privateCard = document.getElementById('privateCard');

            const galley = privateCard.querySelector('.hexgrid-galley') || document.createElement('div');
            galley.classList.add('hexgrid-galley');

            hexGrids.forEach(hexGrid => {
                const gridCard = new HexGridCard(hexGrid, true);
                galley.append(gridCard.render());
            });

            if (!privateCard.querySelector('.hexgrid-galley')) {
                privateCard.append(galley);
            }

            // 更新偏移量
            this.currentOffsetPrivate += hexGrids.length;

            // 创建“加载更多”按钮
            let loadMoreBtn = privateCard.querySelector('.galley-pagenav');
            if (!loadMoreBtn) {
                loadMoreBtn = document.createElement('button');
                loadMoreBtn.classList.add('galley-pagenav');
                loadMoreBtn.textContent = '更多';
                loadMoreBtn.addEventListener('click', () => {
                    this.initPrivate();  // 加载更多私有画布数据
                });
                privateCard.append(loadMoreBtn);
            }

            // 如果返回的数据量小于 limit，则隐藏“加载更多”按钮
            if (hexGrids.length < this.limit) {
                loadMoreBtn.style.display = 'none';
            } else {
                loadMoreBtn.style.display = 'block';
            }

        } catch (error) {
            this.loadingPopup.show(`加载出错: ${error.message}`, 'error', 3000);
            console.error('展示私有 HexGrid 时出错啦', error);
        }
    }
}

export const hexGridGalley = new HexGridGalley();
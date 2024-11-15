
import { asideCard } from "../index.js";
import { selectedBrush } from "../main/module.js";
import { Hex } from "../main/modules/Hex.js";
import { initRegionsCard } from "./regionInfoCard.js";
import { Region } from "../main/modules/Region.js";
import { Popup } from "./loadingSpinner.js";
import { closeNavBarWithSlider } from "./buttonComponent.js";
import { SliderToggleButton } from "./buttonComponent.js";
import { hexGrid } from "../main/module.js";
import { apiUrl } from "../index.js";

class HexGridCard {

    constructor(hexGridFromData, isPrivate) {
        this.title = hexGridFromData.hexgrid_name;
        this.desc = hexGridFromData.description;
        this.ownName = hexGridFromData.owner_name;
        this.updateTime = this.formatDate(hexGridFromData.lastedit_at);
        this.creatTime = this.formatDate(hexGridFromData.created_at);
        this.isPrivate = isPrivate;
        this.newHexGrid = hexGridFromData;

        this.loadingPopup = new Popup();

        this.isPublicGrid = this.booleanIt();

        // 保存初始值
        this.initialTitle = this.title;
        this.initialDesc = this.desc;
        this.initialIsPublic = this.isPublicGrid;
        this.myOwnid = localStorage.getItem('uuid');
    }

    //后端解决会不会好一点?
    booleanIt() {
        if (this.newHexGrid.is_public === 1) {
            return true;
        } else if (this.newHexGrid.is_public === 0) {
            return false;
        } else {
            return "没解出来"
        }
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
        const togglePublicBtn = this.togglePublicBtn();
        const infoArea = this.infoArea();
        const buttonArea = this.buttonArea();

        if (this.isPrivate) {
            container.append(inputArea, togglePublicBtn, infoArea, buttonArea);

        } else {
            container.append(inputArea, infoArea, buttonArea);

        }
        return container;
    }

    inputArea() {
        const inputArea = document.createElement('div');

        const titleArea = document.createElement('input');
        titleArea.classList.add('gridCard-title');
        titleArea.value = this.title;
        titleArea.readOnly = !this.isPrivate;
        titleArea.disabled = !this.isPrivate;

        // 添加更改监听
        titleArea.addEventListener('input', (e) => {
            this.title = e.target.value;
        });


        const descArea = document.createElement('textarea');
        descArea.classList.add('gridCard-desc');
        descArea.value = this.desc;
        descArea.readOnly = !this.isPrivate;
        descArea.disabled = !this.isPrivate;

        // 添加更改监听
        descArea.addEventListener('input', (e) => {
            this.desc = e.target.value;
        });

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

    togglePublicBtn() {
        const container = document.createElement('div');
        container.classList.add('gridCard-controlArea');
        container.id = 'containerId';

        const btn = new SliderToggleButton(
            container,
            '私有',
            '公开',
            this.isPublicGrid,
            (isOn) => {
                this.isPublicGrid = isOn;
            },
            'hexgrid-toggle-btn',
            'hexgrid-toggle-btn'
        );

        return container;
    }

    buttonArea() {
        const container = document.createElement('div');
        container.classList.add('gridCard-buttonArea');

        const importBtn = document.createElement('button');
        importBtn.textContent = '导入';
        importBtn.addEventListener('click', () => {
            console.log('导入被按到了', this.newHexGrid)
            this.importHexGrid();
            asideCard.updateBrushInfo();
            hexGrid.refreshMe();
            initRegionsCard(hexGrid);
            hexGrid.updateSliders();
        })

        const updateBtn = document.createElement('button');
        updateBtn.textContent = '更新';
        updateBtn.addEventListener('click', () => {
            this.handleUpdate();
        })

        const deletBtn = document.createElement('button');
        deletBtn.textContent = '删除';
        deletBtn.addEventListener('click', () => {
            console.log('删除被按到了')
            this.handleDelete();
        })

        if (this.isPrivate) {
            container.append(importBtn, updateBtn, deletBtn);
        } else {
            container.append(importBtn);
        };
        return container;
    }
    //主程: 导入 加载 画布
    async importHexGrid() {
        try {
            this.loadingPopup.show('加载规划图中....', 'progress');

            const h = this.newHexGrid;
            hexGrid.cleanGrid();

            hexGrid.name = h.hexgrid_name;
            hexGrid.description = h.description;

            const owner_id = localStorage.getItem('uuid')
            hexGrid.ownerId = owner_id;

            if (this.isPrivate) {
                console.log('私有域,我依然用原来的gridid',h.hexgrid_id)
                hexGrid.hexgrid_id = h.hexgrid_id;
            } else {
                hexGrid.hexgrid_id = await hexGrid.fetchUUID();
                console.log('公有域,我用新的grid', hexGrid.hexgrid_id)

            }

            hexGrid.saveLocal();

            this.importHexes(h.hexgrid_id);
            hexGrid.setHexSize(h.hexSize);
            hexGrid.setMaxRadius(h.maxRadius);

            console.log('成功更新了')
            this.loadingPopup.show('成功更新了', 'success', 2000)
            // hexGrid.drawHexagons();
        } catch (error) {
            this.loadingPopup.show(`出现错误导致终端了 ${error.message}`, 'error', 3000)
            console.error('下载hexGrid出错了', error);
        }
    }

    async importHexes(hexgrid_id) {
        try {
            this.loadingPopup.show('加载小格子中...', 'progress');

            const response = await fetch(`${apiUrl}/hexes/${hexgrid_id}`);
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

            this.loadingPopup.show('成功加载全部格子啦', 'success', 10000)
            setTimeout(() => {
                closeNavBarWithSlider();
            }, 1000);


        } catch (error) {
            this.loadingPopup.show(`加载小格子失败了: ${error.message}`, 'error', 5000);
            console.error('hexes下载失败', error);
        } finally {
            initRegionsCard(hexGrid);
            asideCard.updateBrushInfo();
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



    // 更新按钮点击事件
    async handleUpdate() {
        // 检查是否有更改
        const isModified = (
            this.title !== this.initialTitle ||
            this.desc !== this.initialDesc ||
            this.isPublicGrid !== this.initialIsPublic
        );
        const owner_id = localStorage.getItem('uuid');
        console.warn('我在这里获得了owner_id',owner_id)
        if (!isModified) {
            this.loadingPopup.show(
                '没有任何更改，无需更新。',
                'info',
                0,
                '确认',
                'default'
            );
            return;
        }

        try {
            this.loadingPopup.show('更新中,请稍后', 'progress');
            const response = await fetch(`${apiUrl}/update-hexgrid`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    hexgrid_id: this.newHexGrid.hexgrid_id,
                    owner_id: owner_id,
                    hexgrid_name: this.title,
                    description: this.desc,
                    is_public: this.isPublicGrid ? 1 : 0
                })
            });
            if (!response.ok) {
                this.loadingPopup.show('更新失败', 'error');
                throw new Error('更新失败');
            }

            const result = await response.json();
            this.loadingPopup.show(`更新成功: ${result.message}`, 'success', 5000);

            // 更新初始值
            this.initialTitle = this.title;
            this.initialDesc = this.desc;
            this.initialIsPublic = this.isPublicGrid;
        } catch (error) {
            this.loadingPopup.show(`更新出错: ${error}`, 'success');
            console.error('更新出错啦', error);
        } finally {
            // 刷新私有画廊数据，确保界面显示最新内容
            // hexGridGalley.currentOffsetPrivate = 0;  
            // hexGridGalley.initPrivate();
        }
    }

    async handleDelete() {
        this.loadingPopup.show(
            '您确认要删掉规划吗?',
            'warning',
            0,
            '确认删除',
            this.confirmDelete.bind(this)
        );
    }

    async confirmDelete() {
        try {
            this.loadingPopup.show('正在删除,请稍后...', 'progress');

            const response = await fetch(`${apiUrl}/update-hexgrid`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    hexgrid_id: this.newHexGrid.hexgrid_id,
                    owner_id: 0,  // 0 表示执行软删除，将 owner_id 设置为 -1
                    hexgrid_name: this.title,
                    description: this.desc,
                    is_public: 0  // 设置为私有
                })
            });

            if (!response.ok) {
                this.loadingPopup.show('删除失败', 'error');
                throw new Error('删除失败');
            }

            const result = await response.json();
            this.loadingPopup.show(`删除成功: ${result.message}`, 'success');

            // 更新本地状态
            this.newHexGrid.owner_id = -1;  // 标记为已删除
            this.isPublicGrid = false;

        } catch (error) {
            this.loadingPopup.show(`删除出错: ${error}`, 'error');
            console.error('删除出错啦', error);
        } finally {
            hexGridGalley.clearGallery();
            hexGridGalley.initPrivate();
            hexGridGalley.initPublic();
        }
    }
}


class HexGridGalley {
    constructor() {
        this.currentOffsetPublic = 0;  // 公共画布的当前偏移量
        this.currentOffsetPrivate = 0; // 私有画布的当前偏移量
        this.limit = 20;  // 每页条数

        this.loadingPopup = new Popup();
    }

    clearGallery() {
        const privateCard = document.getElementById('privateCard');
        const publicCard = document.getElementById('publicCard');
        privateCard.innerHTML = '';  // 清除私有画廊内容
        publicCard.innerHTML = '';
        this.currentOffsetPrivate = 0;  // 重置偏移量
        this.currentOffsetPublic = 0;
    }

    async initPublic() {
        try {
            this.loadingPopup.show(
                '数据加载中,请等待.....',
                'progress',
                0,
                null,
                null
            );

            const response = await fetch(`${apiUrl}/get-public-hexgrids?offset=${this.currentOffsetPublic}&limit=${this.limit}`, {
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
            this.loadingPopup.show(
                '画廊加载中,请等待...',
                'progress',
                0,
                null,
                null
            );

            const owner_id = localStorage.getItem('uuid');
            if (!owner_id) {
                console.log('前端无法获取 id');
                throw new Error('无法获取用户的 UUID');
            }

            const response = await fetch(`${apiUrl}/get-private-hexgrids?owner_id=${owner_id}&offset=${this.currentOffsetPrivate}&limit=${this.limit}`, {
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
            // 清除之前的内容
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
        } finally {
            console.log('刷新额')
        }
    }


}

export const hexGridGalley = new HexGridGalley();
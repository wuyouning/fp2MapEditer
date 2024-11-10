// import { hexGrid } from "../main/module";

class HexGridCard {
    constructor(hexGrid, isPrivate) {
        this.title = hexGrid.hexgrid_name;
        this.desc = hexGrid.description;
        this.ownName = hexGrid.owner_name;
        this.updateTime = this.formatDate(hexGrid.lastedit_at);
        this.creatTime = this.formatDate(hexGrid.created_at);
        this.isPrivate = isPrivate;
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

        const descArea = document.createElement('textarea');
        descArea.classList.add('gridCard-desc');
        descArea.value = this.desc;
        descArea.readOnly = !this.isPrivate; 

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
            console.log('导入被按到了')
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
}


class HexGridGalley {
    constructor(){

    }

    async initPublic() {
        try {
            const response = await fetch('http://127.0.0.1:3000/api/get-public-hexgrids', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if  (!response.ok) {
                throw new Error('无法获取公共HexGrid数据');
            }

            const hexGrids = await response.json();

            //获取公共容器元素

            const publicCard = document.getElementById('publicCard');
            publicCard.innerHTML = ''; //先清空
            const galley = document.createElement('div');
            galley.classList.add('hexgrid-galley');

            hexGrids.forEach(hexGrid => {
                const gridCard = new HexGridCard(hexGrid, false);
                galley.append(gridCard.render());
            });
            publicCard.append(galley);
            const pageNav = this.pageNav();
            publicCard.append(pageNav);
        } catch (error) {
            console.error('展示公共HexGrid时出错啦', error);
        }
    }


    async initPrivate() {
        try {
            const owner_id = localStorage.getItem('uuid');
            if (!owner_id) {
                console.log('前端无法获取id')

                throw new Error('无法获取用户的UUID');
            }

            const response = await fetch(`http://127.0.0.1:3000/api/get-private-hexgrids?owner_id=${owner_id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if  (!response.ok) {
                throw new Error('无法获取私有HexGrid数据');
            }

            const hexGrids = await response.json();

            //获取公共容器元素

            const privateCard = document.getElementById('privateCard');
            privateCard.innerHTML = ''; //先清空
            const galley = document.createElement('div');
            galley.classList.add('hexgrid-galley');

            hexGrids.forEach(hexGrid => {
                const gridCard = new HexGridCard(hexGrid, true);
                galley.append(gridCard.render());
            });
            privateCard.append(galley);
            const pageNav = this.pageNav();
            privateCard.append(pageNav);
        } catch (error) {
            console.error('展示私有HexGrid时出错啦', error);
        }
    }

    pageNav() {
        const container = document.createElement('div');
        container.classList.add('galley-pagenav');

        const preBtn = document.createElement('button');
        preBtn.classList.add('navpage-btn')
        preBtn.textContent = '上一页';

        const nextBtn = document.createElement('button');
        nextBtn.classList.add('navpage-btn')
        nextBtn.textContent = '下一页';

        container.append(preBtn, nextBtn);
        return container;
    }
}

export const hexGridGalley = new HexGridGalley();
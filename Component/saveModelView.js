import { SliderToggleButton } from '../Component/buttonComponent.js'
import { hexGrid } from './../main/module.js';
import { asideCard } from '../index.js';
import { loadingSpinner } from '../index.js';
class SaveModelView {
    constructor() {
        this.messageElement = null;
    }

    create() {
        // 创建并配置 saveModel 元素
        const saveModel = document.createElement('div');
        saveModel.classList.add('popup');
        saveModel.classList.add('save-model');
        saveModel.id = 'save-model';
        document.body.appendChild(saveModel);

        // 创建标题等元素
        const title = document.createElement('h1');
        title.classList.add('loginTitle');
        title.textContent = '保存法阵';

        const title2 = document.createElement('h2');
        title2.textContent = '法阵名称';

        const titleEdit = document.createElement('input');
        titleEdit.id = 'savemodel-titleEdit';
        titleEdit.maxLength = '60';
        titleEdit.minLength = '5';
        titleEdit.placeholder = "请输入五个字以上的名字";

        const title3 = document.createElement('h2');
        title3.textContent = '法阵描述';

        const desp = document.createElement('textarea');
        desp.id = 'saveModel-desp';
        desp.maxLength = '1000';
        desp.placeholder = "请输入描述，可以为空";

        // 创建按钮区域和信息提示
        let buttonArea;
        const hexGridId = localStorage.getItem('hexGridId');
        console.log('请求出来的hexGrid是？',hexGridId)
        if (hexGridId) {
            buttonArea = this.createButtonArea2();
        } else {
            buttonArea = this.createButtonArea();
            console.log('Area1我来执行')
        }

        // 创建并保存 message 元素的引用
        this.messageElement = document.createElement('p');
        this.messageElement.textContent = "保存后将自动覆盖，如果有需要可以选择另存为";
        this.messageElement.classList.add('login-message');
        this.messageElement.id = 'login-message';
        
        saveModel.append(title, title2, titleEdit, title3, desp);
        // 创建并添加 SliderToggleButton 实例
        const isPubilBtn = new SliderToggleButton('save-model', '私有', '公开', hexGrid.isPublic, (isOn) => {
            hexGrid.isPublic = isOn; // 同步更新 hexGrid 的 isPublic 属性
        });
        saveModel.append(this.messageElement, buttonArea)
        // 将所有元素依次加入 saveModel
    }

    show() {
        const saveModel = document.getElementById('save-model');
        if (saveModel) {
            saveModel.style.display = 'block'; // 或者直接 remove() 来移除元素
        }
    }

    hide() {
        // 隐藏或移除 saveModel 元素来关闭模型
        const saveModel = document.getElementById('save-model');
        if (saveModel) {
            saveModel.style.display = 'none'; // 或者直接 remove() 来移除元素
        }
    }

    showError(message, success = false) {
        if (this.messageElement) {
            this.messageElement.textContent = message;
            this.messageElement.classList.toggle('error-message', !success); // 添加错误样式
            this.messageElement.classList.toggle('success-message', success); // 添加成功样式
        }
    }

    createButtonArea() {
        const buttonArea = document.createElement('div');
        buttonArea.classList.add('savemodel-button-area');

        const saveBtn = document.createElement('button');
        saveBtn.textContent = "保存";
        // 添加保存按钮的点击事件，更新属性后保存 HexGrid
        saveBtn.addEventListener('click', async () => {
            try {
                const saveSuccessful = await hexGrid.save(false);

                loadingSpinner.show();
                // 先更新属性
                await hexGrid.updateProperties();

                // 然后保存 HexGrid
                await hexGrid.save(true);

                if (saveSuccessful) {
                    asideCard.updateBrushInfo();
                    setTimeout(() => {
                        this.hide();
                    }, 6000);
                }
            } catch (error) {
                console.error('保存 HexGrid 数据时出错：', error);
                this.showError(`保存 HexGrid 数据时出错：${error}`);
            } finally {
                loadingSpinner.hide();
            }
        });
    

        const cancelBtn = document.createElement('button');
        cancelBtn.textContent = "取消";
        cancelBtn.addEventListener('click', () => {
            this.hide();
        })


        buttonArea.append(saveBtn, cancelBtn)
        return buttonArea;
    }

    createButtonArea2() {
        const buttonArea = document.createElement('div');
        buttonArea.classList.add('savemodel-button-area');
    
        const saveBtn = document.createElement('button');
        saveBtn.textContent = "保存";
    
        // 添加保存按钮的点击事件，负责更新现有的 HexGrid
        saveBtn.addEventListener('click', async () => {
            try {
                loadingSpinner.show();
                // 更新现有的 HexGrid
                const saveSuccessful = await hexGrid.save(false);
                if (saveSuccessful) {
                    asideCard.updateBrushInfo();
                    setTimeout(() => {
                        this.hide();
                    }, 6000);
                }
            } catch (error) {
                console.error('保存 HexGrid 数据时出错：', error);
                this.showError(`保存 HexGrid 数据时出错：${error}`);
            } finally {
                loadingSpinner.hide();

            }
            
        });
    
        // 创建 "另存为" 按钮
        const saveAsBtn = document.createElement('button');
        saveAsBtn.textContent = "另存为";
    
        // 添加另存为按钮的点击事件，负责创建一个新的 HexGrid 并上传到服务器
        saveAsBtn.addEventListener('click', async () => {
            try {
                loadingSpinner.show();
                // 另存为新的 HexGrid
                const saveSuccessful = await hexGrid.save(true);
                if (saveSuccessful) {
                    asideCard.updateBrushInfo();
                    setTimeout(() => {
                        this.hide();
                    }, 6000);
                }
            } catch (error) {
                console.error('另存为 HexGrid 数据时出错：', error);
                this.showError(`另存为 HexGrid 数据时出错：${error}`);
            } finally {
                loadingSpinner.hide();
            }
        });
    
        const cancelBtn = document.createElement('button');
        cancelBtn.textContent = "取消";
        cancelBtn.addEventListener('click', () => {
            this.hide();
        })
    
        buttonArea.append(saveBtn, saveAsBtn, cancelBtn);
        return buttonArea;
    }

}

export const saveModelView = new SaveModelView();
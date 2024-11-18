import { SliderToggleButton } from '../Component/buttonComponent.js'
import { hexGrid } from './../main/module.js';
import { asideCard } from '../index.js';
import { loadingSpinner } from '../index.js';
import { MainStyledButton } from '../Component/buttonComponent.js';
import { setTranslatedText } from './i18next.js';
import i18next from './i18next.js';

class SaveModelView {
    constructor() {
        this.messageElement = null;
        this.saveModel = null;
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
        // title.textContent = '保存法阵';
        setTranslatedText(title,'保存法阵');
        

        const title2 = document.createElement('h2');
        // title2.textContent = '法阵名称';
        setTranslatedText(title2,'法阵名称')

        const titleEdit = document.createElement('input');
        titleEdit.id = 'savemodel-titleEdit';
        titleEdit.maxLength = '60';
        titleEdit.minLength = '5';
        titleEdit.placeholder = "请输入五个字以上的名字";
        setTranslatedText(
            titleEdit, 
            '请输入五个字以上的名字', 
            null,                  
            null,                
            ['placeholder']   
        );
        // setTranslatedText(inputName, '输入用户名', null, null, ['placeholder', 'title']);

        const title3 = document.createElement('h2');
        setTranslatedText(title3, '法阵描述');
        // title3.textContent = '法阵描述';

        const desp = document.createElement('textarea');
        desp.id = 'saveModel-desp';
        desp.maxLength = '1000';
        
        const value = i18next.t('请输入描述，可以为空');
        desp.placeholder = value;

        // 创建并保存 message 元素的引用
        this.messageElement = document.createElement('p');
        // this.messageElement.textContent = "保存后将自动覆盖，如果有需要可以选择另存为";
        setTranslatedText(this.messageElement, '保存后将自动覆盖，如果有需要可以选择另存为');
        this.messageElement.classList.add('login-message');
        this.messageElement.id = 'login-message';
        
        saveModel.append(title, title2, titleEdit, title3, desp);
        // 创建并添加 SliderToggleButton 实例
        const isPubilBtn = new SliderToggleButton('save-model', '私有', '公开', hexGrid.isPublic, (isOn) => {
            hexGrid.isPublic = isOn; // 同步更新 hexGrid 的 isPublic 属性
        });
        saveModel.append(this.messageElement)
        // 将所有元素依次加入 saveModel
    }

    show() {
        const saveModel = document.getElementById('save-model');
        if (saveModel) {
            saveModel.style.display = 'block';

            // 检查 `isNewGrid` 状态并动态创建或更新 buttonArea
            const isNewGrid = localStorage.getItem('isNewGrid');

            let buttonArea = document.getElementById('button-area'); // 检查是否已有 buttonArea

            if (buttonArea) {
                buttonArea.remove(); // 删除旧的 buttonArea
            }

            // 根据 `isNewGrid` 状态创建新的 buttonArea
            buttonArea = isNewGrid === 'true' ? this.createButtonArea() : this.createButtonArea2();
            buttonArea.id = 'button-area';

            // 添加新的 buttonArea 到 saveModel
            saveModel.append(buttonArea);
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
            // this.messageElement.textContent = message;
            setTranslatedText(this.messageElement, message)
            this.messageElement.classList.toggle('error-message', !success); // 添加错误样式
            this.messageElement.classList.toggle('success-message', success); // 添加成功样式
        }
    }

    createButtonArea() {
        const buttonArea = document.createElement('div');
        buttonArea.classList.add('savemodel-button-area');

        const saveBtn = new MainStyledButton(
            buttonArea,
            "保存",
            () => this.handleSaveClick(true),
        )
        saveBtn.id = 'saveBtn-saveMode'
    
        const cancelBtn = new MainStyledButton(
            buttonArea,
            "取消",
            () => this.hide(),
        )



        return buttonArea;
    }

    createButtonArea2() {
        const buttonArea = document.createElement('div');
        buttonArea.classList.add('savemodel-button-area');
    
        const saveBtn = new MainStyledButton(
            buttonArea,
            "保存",
            () => this.handleSaveClick(false),
        )
        saveBtn.id = 'saveBtn-saveMode'

        // 添加另存为按钮的点击事件，负责创建一个新的 HexGrid 并上传到服务器
        const saveAsBtn = new MainStyledButton(
            buttonArea,
            "另存为",
            async () => this.handleSaveClick(true),
        )
        saveAsBtn.id = 'saveBtnAsNew-saveMode'


        const cancelBtn = new MainStyledButton(
            buttonArea,
            "取消",
            () => this.hide(),
        )
    
        return buttonArea;
    }

    async handleSaveClick(isSaveAsNew) {
        try {
            loadingSpinner.show();
            const saveSuccessful = await hexGrid.save(isSaveAsNew);
            
            if (saveSuccessful) {
                asideCard.updateBrushInfo();
                setTimeout(() => {
                    this.hide();
                }, 6000);
            }
        } catch (error) {
            const errorMessage = isSaveAsNew ? '另存为规划图时出错：' : '保存 规划图时出错：';
            console.error(errorMessage, error);
            this.showError(`${errorMessage}${error}`);
        } finally {
            loadingSpinner.hide();
        }
    }

}

export const saveModelView = new SaveModelView();
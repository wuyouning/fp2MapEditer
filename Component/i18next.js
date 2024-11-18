import i18next from '../node_modules/i18next/dist/esm/i18next.js';
import { resources } from './context/translation.js';
import { initAnnouncementCard } from './AnnouncementCard.js';
// 初始化 i18next
export function initializeI18n() {
  
  const browserLanguage = navigator.language || navigator.languages[0]; // 获取浏览器语言，通常为 'en-US' 或 'zh-CN'
  const userLanguage = localStorage.getItem('userLanguage') || (browserLanguage.startsWith('zh') ? 'zh' : 'en'); // 检测本地存储或默认语言
  
  return i18next.init({
    lng: userLanguage, // 设置默认语言
    debug: false, // 用于调试翻译过程
    resources: resources
  }).then(() => {
    // 在初始化完成后进行页面的翻译更新
    updateTranslatedText();
    updateContent();
    // 监听语言切换事件
    i18next.on('languageChanged', () => {
        updateTranslatedText();
        updateContent();
    });
    // 添加语言切换按钮的点击事件
    document.getElementById('btn-en').addEventListener('click', () => changeLanguage('en'));
    document.getElementById('btn-zh').addEventListener('click', () => changeLanguage('zh'));
  });
}

// 切换语言
function changeLanguage(lng) {
    i18next.changeLanguage(lng);
    document.documentElement.lang = lng;
    localStorage.setItem('userLanguage', lng);
    initAnnouncementCard();
}
// 更新页面上所有需要翻译的文本
function updateTranslatedText() {
  document.querySelectorAll('[data-i18n]').forEach(element => {
      const key = element.getAttribute('data-i18n'); // 主翻译键
      const extraText = element.getAttribute('data-i18n-extra'); // 附加文本
      const extraKey = element.getAttribute('data-i18n-extra-key'); // 额外翻译键

      // 获取需要翻译的属性
      const attributes = Array.from(element.attributes)
          .map(attr => attr.name)
          .filter(attr => attr.startsWith('data-i18n-attr-'))
          .map(attr => attr.replace('data-i18n-attr-', ''));

      // 调用 setTranslatedText 方法进行翻译和设置
      setTranslatedText(element, key, extraText, extraKey, attributes);
  });
}

export function setTranslatedText(element, key, text, extraKey, attributes = []) {
  // 如果 key 是一个纯数字字符串或者数值类型，直接使用原始值，不进行翻译处理
  if (!isNaN(key)) {
      element.textContent = key;
      return element;
  }

  // 获取翻译文本
  let translatedText = i18next.t(key);
  element.setAttribute('data-i18n', key);

  if (extraKey) {
      translatedText += ` ${i18next.t(extraKey)}`;
      element.setAttribute('data-i18n-extra-key', extraKey); // 保存额外的翻译键
  } else {
      element.removeAttribute('data-i18n-extra-key'); // 如果没有额外键，移除该属性
  }

  if (text) {
      translatedText += ` ${text}`;
      element.setAttribute('data-i18n-extra', text); // 保存附加文本
  } else {
      element.removeAttribute('data-i18n-extra'); // 如果没有附加文本，移除该属性
  }

  element.textContent = translatedText;

  // 处理额外的属性翻译
  attributes.forEach(attr => {
    if (element.hasAttribute(attr)) {
        const attrKey = element.getAttribute(attr);
        if (attrKey) { // 确保attr有值
            const translatedAttrValue = i18next.t(attrKey);
            element.setAttribute(attr, translatedAttrValue);
            element.setAttribute(`data-i18n-${attr}`, attrKey); // 保存翻译键
        }
    }
});

  return element;
}


// 更新页面的内容
function updateContent() {
    document.querySelector('h1').innerText = i18next.t('冰汽时代2 - 区域规划器');
    document.getElementById('main-heading').innerText = i18next.t('冰汽时代2 - 区域规划器');
    document.getElementById('content-description').innerText = i18next.t('使用此工具可以进行冰汽时代2游戏中的区域规划和资源管理。');

    document.querySelector('.footer .beian span').innerText = i18next.t('冰汽时代2区域规划器©2014-2024 广州派拉披披科技有限公司');
    document.querySelector('.footer .beian-text').innerText = i18next.t('粤ICP备2024234219号');

    // 其他需要更新的元素
    document.getElementById('language-switcher-span').innerText = i18next.t('语言');

    // 更新 navbar 的文本
    const navbarButtons = document.querySelectorAll('.navBar-button');
    navbarButtons.forEach(button => {
        const span = button.querySelector('.navBar-button-text');
            switch (button.id) {
                case 'brushToolButton':
                span.textContent = i18next.t('笔刷工具');
                break;
                case 'regionButton':
                span.textContent = i18next.t('区域数据');
                break;
                case 'superSumButton':
                span.textContent = i18next.t('抽象数据');
                break;
                case 'toggleButton':
                span.textContent = i18next.t('公告');
                break;
                case 'publicHexGridsButton':
                span.textContent = i18next.t('规划广场');
                break;
                case 'PrivateHexGridsButton':
                span.textContent = i18next.t('我的规划');
                break;
                case 'loginButton':
                span.textContent = i18next.t('登录');
                break;
                case 'infoButton':
                span.textContent = i18next.t('个人信息');
                break;
                case 'testDashbutton':
                span.textContent = i18next.t('测试信息');
                break;
            }
    });
    
    // const allElements = [
    //   //抽象统计 - 初始化..好像没有作用上去
    //   ...document.querySelectorAll('.supersumcard-container h1'),
    //   //施工面板
    //   document.getElementById('asideCard')?.querySelector('h1')
    // ].filter(element => element !== null);

    // allElements.forEach(element => {
    //   const key = element.textContent.trim();
    //   console.log('内部翻译',key)
    //   const translatedText = i18next.t(key);
    //   if (translatedText !== key) {
    //     // element.textContent = setTranslatedText();
    //     setTranslatedText(element,key,null,null)
    //   }
    // })
}


  



export default i18next;


// 更新所有需要翻译的元素 性能要求高，又怕外溢，还是晚点再用吧，组件规范真的太重要了，用元素好危险的
function updateAllTranslations() {
  // 选择所有的 <p> 和 <p1> 元素
  const elementsToTranslate = document.querySelectorAll('p, p1, h1, h2, h3, h4, span');

  elementsToTranslate.forEach(element => {
      if (
          element.closest('#announcement') ||
          element.closest('.navBar-button-text') ||
          element.closest('.footer') ||
          element.closest('main-heading')
      ) {
          return; // 如果是卡片内的元素，跳过处理
          }
      const key = element.textContent.trim(); // 使用元素的文本内容作为翻译的 key
      // 如果 key 是全英文或全中文，则不进行处理
      if (isSingleLanguage(key)) {
          return; // 如果 key 已经是目标语言，则跳过翻译
      }
      const translatedText = i18next.t(key); // 获取翻译后的文本

      // 如果有翻译结果，更新元素的文本内容
      if (translatedText !== key) {
          element.textContent = translatedText;
      }
  });
}

// 判断文本是否为单一语言（全英文或全中文）
function isSingleLanguage(text) {
  const englishRegex = /^[A-Za-z\s.,!?'"-]+$/; // 仅包含英文字母和常见符号
  const chineseRegex = /^[\u4e00-\u9fa5\s.,!?'"-]+$/; // 仅包含中文字符和常见符号

  return englishRegex.test(text) || chineseRegex.test(text);
}
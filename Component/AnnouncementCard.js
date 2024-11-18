import { setTranslatedText } from "./i18next.js";
// 创建内容元素的通用函数
function createContentElement(tag, className, textContent) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (textContent) element.textContent = textContent;
  setTranslatedText(element, textContent)
  return element;
}

// 创建带链接的图片部分
function createImageSection(images) {
  const section = document.createElement('div');
  section.className = 'annc-image-section';
  images.forEach(imgData => {
      const img = document.createElement('img');
      img.src = imgData.src;
      img.alt = imgData.alt;
      img.className = 'annc-support-image';
      section.appendChild(img);
  });
  return section;
}

// 创建链接部分
function createLinkSection(links) {
  const container = document.createElement('div');
  container.className = 'annc-link-container';

  links.forEach(linkData => {
      const linkSection = document.createElement('div');
      linkSection.className = 'linkStyle content-section';

      const link = document.createElement('a');
      link.href = linkData.href;
      link.target = '_blank';

      const linkImage = document.createElement('img');
      linkImage.src = linkData.imgSrc;
      linkImage.alt = linkData.imgAlt;

      const linkText = createContentElement('p', null, linkData.text);
      
      link.appendChild(linkImage);
      link.appendChild(linkText);
      linkSection.appendChild(link);
      container.appendChild(linkSection);
  });

  return container;
}

export function initAnnouncementCard() {
  const annc = document.getElementById('announcement');

  // 创建介绍内容部分
  const introductionContent = document.createElement('div');
  introductionContent.id = 'introduction-content';
  introductionContent.className = 'annc-content-section';
  introductionContent.appendChild(createContentElement('h2', null, '亲爱的执政官'));
  introductionContent.appendChild(createContentElement('p', null, 
      '欢迎你来到执政官学院使用此区域模拟规划工具，在这里你可以通过绘制六边形来完成冰霜荒地的初步规划。在这个冰汽时代，谨慎选择和深思熟虑将为人民们获得光明温暖的未来。'));

  // 创建支持内容部分
  const additionalContent = document.createElement('div');
  additionalContent.id = 'additional-content';
  additionalContent.className = 'annc-content-section';
  additionalContent.appendChild(createContentElement('h2', null, '支持我们的工作'));
  additionalContent.appendChild(createContentElement('p', null, 
      '如果你喜欢这个工具并希望支持我们的持续开发，请考虑使用下方的赞赏码或收款码给予支持。非常感谢你的帮助！'));

  // 创建捐赠内容部分
  const donationContent = document.createElement('div');
  donationContent.id = 'donation-content';
  donationContent.className = 'annc-content-section';
  donationContent.appendChild(createContentElement('h2', null, '支持我们的工作'));
  donationContent.appendChild(createContentElement('p', null, 
      '维护服务器和域名不易，代码开发也是纯粹为爱发电！'));
  
  
  // 创建图片部分
  const imageSection = createImageSection([
      { src: 'images/我的赞善码.jpg', alt: '冰汽时代地图编辑器支持赞赏码' },
      { src: 'images/我的收款码.jpg', alt: '冰汽时代地图编辑器收款码' }
  ]);
  

  // 创建链接部分
  const linkContainer = createLinkSection([
      {
          href: 'https://space.bilibili.com/117133650',
          imgSrc: 'images/b站.png',
          imgAlt: 'bilibili网站上的我的频道',
          text: '我的B站'
      },
      {
          href: 'https://store.steampowered.com/app/1601580/2/?l=schinese',
          imgSrc: 'images/steam.png',
          imgAlt: '冰汽时代2 Steam购买链接',
          text: '冰汽时代2-Steam'
      },
      {
          href: 'https://frostpunk2.com/',
          imgSrc: 'images/fp2.jpg',
          imgAlt: '冰汽时代2 官网',
          text: '冰汽时代2'
      }
  ]);

  // 将所有部分添加到工具栏容器中
  annc.append(
      introductionContent,
      additionalContent,
      donationContent,
      imageSection,
      linkContainer
  );

  // 调用加载公告内容
  loadContent('./Component/context/annc.json', 'introduction-content', 'introduction');
  loadContent('./Component/context/annc.json', 'additional-content', 'additional');
  loadContent('./Component/context/annc.json', 'donation-content', 'donation');
}

// 文本内容导入
// 文本内容导入
function loadContent(url, elementId, jsonKey) {
  const userLanguage = localStorage.getItem('userLanguage') || 'zh'; // 默认中文
  fetch(url)
      .then(response => response.json())
      .then(data => {
          const contentData = data[jsonKey];
          if (contentData) {
              const title = userLanguage === 'en' ? contentData.title_en : contentData.title;
              const content = userLanguage === 'en' ? contentData.content_en : contentData.content;
              document.getElementById(elementId).innerHTML = `
                  <h2>${title}</h2>
                  <p>${content}</p>
              `;
          } else {
              document.getElementById(elementId).innerHTML = '<p>未找到指定的内容，请检查 key 是否正确。</p>';
          }
      })
      .catch(error => {
          console.error('Error loading content:', error);
          document.getElementById(elementId).innerHTML = '<p>内容加载失败，请稍后重试。</p>';
      });
}


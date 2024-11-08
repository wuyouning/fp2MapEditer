export function initAnnouncementCard() {
    // 创建工具栏容器
    const annc = document.getElementById('announcement');

    // 创建介绍内容部分
    const introductionContent = document.createElement('div');
    introductionContent.id = 'introduction-content';
    introductionContent.className = 'annc-content-section';
    const introHeading = document.createElement('h2');
    introHeading.textContent = '亲爱的执政官';
    const introParagraph = document.createElement('p');
    introParagraph.textContent = '欢迎你来到执政官学院使用此区域模拟规划工具，在这里你可以通过绘制六边形来完成冰霜荒地的初步规划。在这个冰汽时代，谨慎选择和深思熟虑将为人民们获得光明温暖的未来。';
    introductionContent.appendChild(introHeading);
    introductionContent.appendChild(introParagraph);

    // 创建支持内容部分
    const additionalContent = document.createElement('div');
    additionalContent.id = 'additional-content';
    additionalContent.className = 'annc-content-section';
    const additionalHeading = document.createElement('h2');
    additionalHeading.textContent = '支持我们的工作';
    const additionalParagraph = document.createElement('p');
    additionalParagraph.textContent = '如果你喜欢这个工具并希望支持我们的持续开发，请考虑使用下方的赞赏码或收款码给予支持。非常感谢你的帮助！';
    additionalContent.appendChild(additionalHeading);
    additionalContent.appendChild(additionalParagraph);

    // 创建捐赠内容部分
    const donationContent = document.createElement('div');
    donationContent.id = 'donation-content';
    donationContent.className = 'annc-content-section';
    const donationHeading = document.createElement('h2');
    donationHeading.textContent = '支持我们的工作';
    const donationParagraph = document.createElement('p');
    donationParagraph.textContent = '维护服务器和域名不易，代码开发也是纯粹为爱发电！';
    donationContent.appendChild(donationHeading);
    donationContent.appendChild(donationParagraph);

    // 创建图片部分
    const imageSection = document.createElement('div');
    imageSection.className = 'annc-image-section';
    const supportImage1 = document.createElement('img');
    supportImage1.src = 'images/我的赞善码.jpg';
    supportImage1.alt = '冰汽时代地图编辑器支持赞赏码';
    supportImage1.className = 'annc-support-image';
    const supportImage2 = document.createElement('img');
    supportImage2.src = 'images/我的收款码.jpg';
    supportImage2.alt = '冰汽时代地图编辑器收款码';
    supportImage2.className = 'annc-support-image';
    imageSection.appendChild(supportImage1);
    imageSection.appendChild(supportImage2);

    // 创建链接容器
    const linkContainer = document.createElement('div');
    linkContainer.className = 'annc-link-container';

    // 创建每个链接内容
    const links = [
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
    ];

    links.forEach(linkData => {
        const linkSection = document.createElement('div');
        linkSection.className = 'linkStyle content-section';

        const link = document.createElement('a');
        link.href = linkData.href;
        link.target = '_blank';

        const linkImage = document.createElement('img');
        linkImage.src = linkData.imgSrc;
        linkImage.alt = linkData.imgAlt;

        const linkText = document.createElement('p');
        linkText.textContent = linkData.text;
        link.appendChild(linkImage);
        link.appendChild(linkText);
        linkSection.appendChild(link);
        linkContainer.appendChild(linkSection);
    });

    // 将所有部分添加到工具栏容器中
    annc.appendChild(introductionContent);
    annc.appendChild(additionalContent);
    annc.appendChild(donationContent);
    annc.appendChild(imageSection);
    annc.appendChild(linkContainer);

    // 调用加载公告内容
    loadContent('./main/context/annc.json', 'introduction-content', 'introduction');
    loadContent('./main/context/annc.json', 'additional-content', `additional`);
    loadContent('./main/context/annc.json', 'donation-content', `donation`);
}

// 文本内容导入
function loadContent(url, elementId, jsonKey) {
    fetch(url)
      .then(response => response.json())
      .then(data => {
        const contentData = data[jsonKey];
        if (contentData) {
          document.getElementById(elementId).innerHTML = `
            <h2>${contentData.title}</h2>
            <p>${contentData.content}</p>
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
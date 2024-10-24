const brushMap = {
    '居住区': {
      color: 'rgb(96, 143, 130)',
      icon: '🏠',
      threshold: 12,
      type: '自由'
    },
    '食品区': {
      color: 'rgb(140, 148, 109)',
      icon: '🍽️',
      threshold: 9,
      type: '自由'
    },
    '开采区': {
      color: 'rgb(237, 200, 25)',
      icon: '⛏️',
      threshold: 9,
      type: '自由'
    },
    '工业区': {
      color: 'rgb(202, 51, 46)',
      icon: '🏭',
      threshold: 9,
      type: '自由'
    },
    '后勤区': {
      color: 'rgb(36, 212, 216)',
      icon: '🚚',
      threshold: 9,
      type: '自由'
    },
    '供热枢纽': {
      color: 'rgb(204, 102, 0)', // 暖橙色，和工业区有一定关联性
      icon: '🔥',
      threshold: 1,
      type: '枢纽',
      allowArea: ['开采区', '工业区', '食品区', '后勤区', '居住区'],
      effect: '热能增加',
      effectValue: 40,
    },
    '维护枢纽': {
      color: 'rgb(80, 80, 80)', // 深灰色，代表维护、修理的坚固感
      icon: '🔧',
      threshold: 1,
      type: '枢纽',
      allowArea: ['开采区', '工业区', '食品区', '后勤区', '居住区'],
      effect: '减少材料需求',
      effectValue: 40,
    },
    '铁路枢纽': {
      color: 'rgb(99, 71, 54)', // 棕色，象征铁轨和土地
      icon: '🚂',
      threshold: 1,
      type: '枢纽',
      allowArea: ['开采区', '工业区', '食品区'],
      effect: '减少材料需求',
      effectValue: 40,
    },
    '交通枢纽': {
      color: 'rgb(173, 216, 230)', // 浅蓝色，与天空的颜色相呼应
      icon: '✈️',
      threshold: 1,
      type: '枢纽',
      allowArea: ['开采区', '工业区', '食品区', '后勤区', '居住区'],
      effect: '劳动力需求减少',
      effectValue: 0.15,
    },
    '监控中心': {
      color: 'rgb(128, 0, 128)', // 紫色，代表科技感和神秘
      icon: '📹',
      threshold: 1,
      type: '枢纽',
      allowArea: ['居住区'],
      effect: '犯罪下降',
      effectValue: 2,
    },
    '医疗中心': {
      color: 'rgb(255, 0, 0)', // 红色，代表紧急医疗和紧急服务
      icon: '🚑',
      threshold: 1,
      type: '枢纽',
      allowArea: ['居住区'],
      effect: '医疗上升',
      effectValue: 2,
    },
    '交流中心': {
      color: 'rgb(0, 102, 204)', // 深蓝色，代表沟通和稳定
      icon: '💬',
      threshold: 1,
      type: '枢纽',
      allowArea: ['居住区'],
      effect: '信任上升',
      effectValue: 2,
    },
    '格斗中心': {
      color: 'rgb(165, 42, 42)', // 棕红色，象征力量和对抗
      icon: '🥊',
      threshold: 1,
      type: '枢纽',
      allowArea: ['居住区'],
      effect: '紧张下降',
      effectValue: 2,
    },
    '燃料储备': {
      color: 'rgb(255, 165, 0)', // 橙色，象征燃料和能量
      icon: '⛽',
      threshold: 1,
      type: '枢纽',
      allowArea: ['开采区'],
      effect: '劳动力需求减少',
      effectValue: 0.10,
    },
    '材料储备': {
      color: 'rgb(160, 82, 45)', // 棕色，代表材料和储存
      icon: '📦',
      threshold: 1,
      type: '枢纽',
      allowArea: ['开采区', '工业区'],
      effect: '劳动力需求减少',
      effectValue: 0.10,
    },
    '商品储备': {
      color: 'rgb(34, 139, 34)', // 深绿色，象征产品和繁荣
      icon: '🏷️',
      threshold: 1,
      type: '枢纽',
      allowArea: ['工业区'],
      effect: '劳动力需求减少',
      effectValue: 0.10,
    },
    '食物储备': {
      color: 'rgb(255, 215, 0)', // 金黄色，代表丰收和食物储存
      icon: '🥫',
      threshold: 1,
      type: '枢纽',
      allowArea: ['食品区'],
      effect: '劳动力需求减少',
      effectValue: 0.10,
    },
    '擦除': {
      color: '#FFF',
      icon: '🗑️',
      threshold: 0,
      type: '空白'
    }
}

export default brushMap;
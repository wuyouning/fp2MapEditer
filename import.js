async function importHexes(hexgrid_id) {
    try {
        const response = await fetch(`http://127.0.0.1:3000/api/hexes/${hexgrid_id}`);
        if (!response.ok) {
            throw new Error(`Error: ${response.statusText}`);
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
            ctx // Assuming the context for drawing is available
        ));

        // 假设 hexList 是一个包含所有六边形的数组
        const regionMap = {};
        const hubMap = [];
        hexGrid.hexes = hexList.reduce((acc, hex) => {
            // 将 hex 赋值给 hexGrid 的 hexes 属性
            acc[hex.id] = hex;

            // 仅处理 type 为 '属地' 的六边形
            if (hex.type === '属地') {
                const region = hex.region;

                // 如果 regionMap 中不存在该区域，则初始化一个空数组
                if (!regionMap[region]) {
                    regionMap[region] = [];
                }

                // 将当前六边形添加到相应区域的数组中
                regionMap[region].push(hex);
            }

            // 处理 '枢纽' 类型的六边形
            if (hex.type === '枢纽') {
                hex.hubGetName(hexGrid.hubs, hex.brush);
                hubMap.push(hex);
                // hex.refresh();
            } 
            return acc;
        }, {});

        // 遍历每个区域的 hexesList 并创建 Region 实例
        for (const region in regionMap) {
            const hexesList = regionMap[region];

            // 创建新的区域并更新
            const newRegion = new Region(hexesList[0].region, hexesList, hexesList[0].brush);
            hexGrid.regions.push(newRegion);
            // newRegion.updateRegion();
        }
        // 遍历刷新区域
        hubMap.forEach(hex => {
            hex.refresh();
        });
        

        console.log('HexGrid updated with imported hexes:', hexGrid.hexes);
    } catch (error) {
        console.error('Error importing hexes:', error);
    }
}

async function importHexGrid(id) {
    try {
        const response = await fetch(`http://127.0.0.1:3000/api/hexgrid/${id}`);
        if (!response.ok) {
            throw new Error(`Error: ${response.statusText}`);
        }
        const data = await response.json();

        // 更新 HexGrid 实例的属性
        hexGrid.setHexSize(data.hexSize);
        hexGrid.setMaxRadius(data.maxRadius);

        console.log(`HexGrid updated: hexSize = ${hexGrid.hexSize}, maxRadius = ${hexGrid.maxRadius}`);
    } catch (error) {
        console.error('Error importing hex grid:', error);
    }
}


function displayImportStatus(message, loading = true, error = false) {
    const modal = document.getElementById('importStatusModal');
    const statusText = document.getElementById('statusText');
    const loadingSpinner = document.getElementById('loadingSpinner');
    
    // 显示弹窗
    modal.style.display = 'block';
    
    // 更新状态文本
    statusText.innerText = message;

    if (loading) {
        loadingSpinner.style.display = 'block';
    } else {
        loadingSpinner.style.display = 'none';
    }

    if (error) {
        statusText.style.color = 'red';
    } else {
        statusText.style.color = 'black';
    }
}

// 关闭弹窗逻辑
document.getElementById('closeModal').onclick = function() {
    document.getElementById('importStatusModal').style.display = 'none';
};

// 处理导入过程的函数
async function importHexGridToCanvas(id) {
    try {
        hexGrid.cleanGrid();
        displayImportStatus('正在导入 HexGrid 数据...', true);
        await importHexGrid(id);

        displayImportStatus('正在导入 Hex 数据...', true);
        await importHexes(id);

        hexGrid.drawHexagons();

        // 成功后更新消息
        displayImportStatus('导入成功！', false);
        
        //关掉弹窗
        setTimeout(() => {
            const modal = document.getElementById('importStatusModal');
            modal.style.display = 'none';
            closeToolBar();
        }, 2000);

    } catch (error) {
        console.error('Error importing HexGrid to canvas:', error);
        
        displayImportStatus('导入失败，请稍后重试。', false, true);
    }
}

// 确保点击外部区域可以关闭弹窗
window.onclick = function(event) {
    const modal = document.getElementById('importStatusModal');
    if (event.target == modal) {
        modal.style.display = 'none';
    }
};
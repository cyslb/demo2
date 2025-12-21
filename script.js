// 全局状态管理
let giftData = [];
let userLists = [];

// 从JSON文件加载礼物数据的函数已定义在下方

// 清单模板定义
const listTemplates = {
    'basic': {
        name: '基础模板',
        description: '适合任何年龄段的基础生日礼物清单',
        items: []
    },
    'tech': {
        name: '科技爱好者',
        description: '适合喜欢科技产品的朋友',
        items: [
            { name: '智能手表', price: 1299.00, description: '多功能智能手表，支持运动追踪和健康监测' },
            { name: '无线耳机', price: 899.00, description: '高品质降噪无线耳机' },
            { name: '移动电源', price: 199.00, description: '大容量快充移动电源' },
            { name: '蓝牙音箱', price: 399.00, description: '便携式高音质蓝牙音箱' }
        ]
    },
    'fashion': {
        name: '时尚达人',
        description: '适合注重时尚和生活品质的朋友',
        items: [
            { name: '时尚手袋', price: 1599.00, description: '流行款式的时尚手袋' },
            { name: '名牌香水', price: 699.00, description: '经典持久的名牌香水' },
            { name: '太阳镜', price: 899.00, description: '潮流设计的太阳镜' },
            { name: '丝巾', price: 399.00, description: '高品质真丝丝巾' }
        ]
    },
    'bookworm': {
        name: '书虫必读',
        description: '适合喜欢阅读的朋友',
        items: [
            { name: '畅销书合集', price: 299.00, description: '年度畅销小说合集' },
            { name: '电子书阅读器', price: 999.00, description: '轻薄便携的电子书阅读器' },
            { name: '书签套装', price: 49.00, description: '精致的金属书签套装' },
            { name: '阅读灯', price: 149.00, description: '护眼LED阅读灯' }
        ]
    },
    'foodie': {
        name: '美食家',
        description: '适合喜欢美食和烹饪的朋友',
        items: [
            { name: '高级厨具套装', price: 1299.00, description: '专业级厨房用具套装' },
            { name: '高级茶叶', price: 399.00, description: '精选优质茶叶礼盒' },
            { name: '咖啡套装', price: 599.00, description: '进口咖啡豆和手冲咖啡套装' },
            { name: '烹饪书籍', price: 129.00, description: '世界美食烹饪大全' }
        ]
    }
};

// 检查浏览器是否支持WebP格式
function isWebPSupported() {
    // 创建一个canvas元素并尝试绘制WebP格式的图片
    const canvas = document.createElement('canvas');
    if (!canvas.getContext) return false;
    
    // 尝试将canvas转换为WebP格式的blob
    return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
}

// 全局变量：浏览器是否支持WebP
const webpSupported = isWebPSupported();
console.log('WebP支持情况:', webpSupported);

// DOM元素
const navLinks = document.querySelectorAll('.nav-link');
const sections = document.querySelectorAll('.section');
const modal = document.getElementById('modal');
const modalBody = document.getElementById('modalBody');
const closeModal = document.querySelector('.close');
const searchInput = document.getElementById('searchInput');
const categorySelect = document.getElementById('categorySelect');
const priceSelect = document.getElementById('priceSelect');
const sortSelect = document.getElementById('sortSelect');
const giftGrid = document.getElementById('giftGrid');
const createListBtn = document.getElementById('createListBtn');
const listsContainer = document.getElementById('listsContainer');
const listSort = document.getElementById('listSort');
const listFilter = document.getElementById('listFilter');
const cardTitle = document.getElementById('cardTitle');
const cardMessage = document.getElementById('cardMessage');
const textColor = document.getElementById('textColor');
const fontFamily = document.getElementById('fontFamily');
const fontSize = document.getElementById('fontSize');
const fontBold = document.getElementById('fontBold');
const fontItalic = document.getElementById('fontItalic');
const cardBgImage = document.getElementById('cardBgImage');
const cardImage = document.getElementById('cardImage');
const cardTemplate = document.getElementById('cardTemplate');
const saveCardBtn = document.getElementById('saveCardBtn');
const shareCardBtn = document.getElementById('shareCardBtn');
const cardPreview = document.getElementById('cardPreview');
const openStickerPanel = document.getElementById('openStickerPanel');
const stickerPanel = document.getElementById('stickerPanel');
const stickerPanelClose = document.querySelector('.sticker-panel-close');
const stickerCategoryBtns = document.querySelectorAll('.sticker-category-btn');
const stickerList = document.getElementById('stickerList');

// 图片加载优化：创建图片预加载器
class ImagePreloader {
    constructor() {
        this.cache = new Map();
    }
    
    // 预加载单个图片
    preloadImage(url) {
        if (this.cache.has(url)) {
            return this.cache.get(url);
        }
        
        const promise = new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                this.cache.set(url, img);
                resolve(img);
            };
            img.onerror = reject;
            img.src = url;
        });
        
        this.cache.set(url, promise);
        return promise;
    }
    
    // 批量预加载图片
    preloadImages(urls) {
        return Promise.all(urls.map(url => this.preloadImage(url)));
    }
}

// 创建图片预加载器实例
const imagePreloader = new ImagePreloader();


// 初始化应用
async function initApp() {
    // 设置forceReload为true，强制每次页面加载时都重新从文件加载数据
    await loadSampleData(true);
    loadUserData();
    setupEventListeners();
    renderGifts();
    renderUserLists();
    updateCardPreview();
    
    // 检查是否有分享链接
    checkForSharedList();
}

// 从JSON文件加载礼物数据
async function loadGiftsFromJSON() {
    console.log('开始从JSON文件加载礼物数据...');
    try {
        // 尝试使用相对路径加载
        console.log('正在发送请求获取douyin.json...');
        const response = await fetch('douyin.json');
        console.log('JSON请求状态:', response.status, response.statusText);
        
        if (!response.ok) {
            // 检查是否是跨域错误（直接打开HTML文件时会发生）
            if (response.status === 0) {
                console.error('JSON文件加载失败：跨域错误。请通过HTTP服务器访问应用程序，而不是直接打开HTML文件。');
                console.error('请使用命令 python server.py 启动本地服务器，然后访问 http://localhost:8000');
                throw new Error('跨域错误：无法从本地文件系统直接加载JSON文件');
            } else {
                throw new Error(`JSON文件加载失败，状态码: ${response.status}`);
            }
        }
        
        // 获取响应文本，检查是否为空
        const responseText = await response.text();
        console.log('JSON响应文本长度:', responseText.length, '字符');
        
        if (!responseText.trim()) {
            throw new Error('JSON响应文本为空');
        }
        
        // 尝试解析JSON
        const data = JSON.parse(responseText);
        console.log('成功解析JSON数据，共', Array.isArray(data) ? data.length : Object.keys(data).length, '个礼物');
        
        // 创建中文类别到英文类别的映射
        const categoryMapping = {
            // 电子产品
            '电子产品': 'electronics',
            '手机': 'electronics',
            '电脑': 'electronics',
            '平板': 'electronics',
            '耳机': 'electronics',
            '智能手表': 'electronics',
            '相机': 'electronics',
            '电子设备': 'electronics',
            
            // 时尚服饰
            '羽绒服': 'fashion',
            '夹克': 'fashion',
            '针织衫/毛衣': 'fashion',
            '裤子': 'fashion',
            '女士包袋': 'fashion',
            '派克服': 'fashion',
            '棉衣/棉服': 'fashion',
            '女装': 'fashion',
            '男装': 'fashion',
            '箱包': 'fashion',
            '毛呢外套': 'fashion',
            '短外套': 'fashion',
            '塑身衣': 'fashion',
            '保暖内衣': 'fashion',
            '内衣裤袜': 'fashion',
            '休闲裤': 'fashion',
            '靴子': 'fashion',
            '女鞋': 'fashion',
            '羊毛衫': 'fashion',
            '皮草': 'fashion',
            '中老年女装': 'fashion',
            '卫裤': 'fashion',
            '卫衣': 'fashion',
            '斜挎包': 'fashion',
            '棉衣': 'fashion',
            '设计师/潮牌女装': 'fashion',
            '奢品箱包': 'fashion',
            '男士包袋': 'fashion',
            '运动鞋': 'fashion',
            '运动服': 'fashion',
            '冲锋衣': 'fashion',
            
            // 家居用品
            '家居': 'home',
            '家具': 'home',
            '厨房用品': 'home',
            '床上用品': 'home',
            '家居装饰': 'home',
            '家居日用': 'home',
            '家用电器': 'home',
            
            // 书籍
            '书籍': 'books',
            '图书': 'books',
            '杂志': 'books',
            '文具': 'books',
            
            // 美妆护肤
            '面部护肤': 'beauty',
            '美容护肤': 'beauty',
            '彩妆/香水/美妆工具': 'beauty',
            '香水': 'beauty',
            '化妆品': 'beauty',
            
            // 运动户外
            '运动': 'sports',
            '户外': 'sports',
            '健身': 'sports',
            '运动鞋': 'sports',
            '运动服': 'sports',
            '运动器材': 'sports',
        };
        
        // 将抖音JSON数据转换为应用程序所需的格式
            const gifts = Array.isArray(data) ? (() => {
                const giftList = [];
                
                data.forEach((item, index) => {
                    // 提取字段并转换
                    const name = item['商品名称'] || '';
                    const priceStr = item['商品价格'] || '0';
                    const chineseCategory = item['商品类别'] || '';
                    const itemType = item['商品类目'] || '';
                    
                    // 解析价格
                    const price = parseFloat(priceStr);
                    
                    // 将中文类别映射到英文类别
                    let category = categoryMapping[chineseCategory];
                    
                    // 尝试根据商品类别自动使用真实图片
                    // 书籍相关的不需要导入图片
                    const bookCategories = ['历史', '哲学', '宗教', '小说', '散文', '科幻', '科普', '经济', '诗歌', '话剧'];
                    let image = bookCategories.includes(chineseCategory) ? '' : `images/${chineseCategory}.jpg`;
                    
                    // 如果没有找到直接映射，尝试根据商品名称或描述判断类别
                    if (!category) {
                        const itemText = (name + ' ' + itemType).toLowerCase();
                        
                        // 检查电子产品相关关键词
                        if (itemText.includes('手机') || itemText.includes('电脑') || itemText.includes('平板') || 
                            itemText.includes('耳机') || itemText.includes('智能手表') || itemText.includes('相机') ||
                            itemText.includes('电子') || itemText.includes('数码')) {
                            category = 'electronics';
                        }
                        // 检查家居用品相关关键词
                        else if (itemText.includes('家居') || itemText.includes('家具') || itemText.includes('厨房') || 
                                 itemText.includes('床上') || itemText.includes('装饰') || itemText.includes('日用') ||
                                 itemText.includes('家电')) {
                            category = 'home';
                        }
                        // 检查书籍相关关键词
                        else if (itemText.includes('书') || itemText.includes('杂志') || itemText.includes('文具')) {
                            category = 'books';
                        }
                        // 检查美妆护肤相关关键词
                        else if (itemText.includes('护肤') || itemText.includes('美容') || itemText.includes('彩妆') || 
                                 itemText.includes('香水') || itemText.includes('化妆品')) {
                            category = 'beauty';
                        }
                        // 检查运动户外相关关键词
                        else if (itemText.includes('运动') || itemText.includes('户外') || itemText.includes('健身') || 
                                 itemText.includes('跑步') || itemText.includes('器材')) {
                            category = 'sports';
                        }
                        // 检查时尚服饰相关关键词
                        else if (itemText.includes('衣') || itemText.includes('裤') || itemText.includes('鞋') || 
                                 itemText.includes('包') || itemText.includes('帽') || itemText.includes('时尚')) {
                            category = 'fashion';
                        }
                        // 如果仍然无法判断，使用一个通用的默认值
                        else {
                            category = 'fashion';
                        }
                    }
                    const description = itemType || '暂无描述';
                    
                    giftList.push({
                        id: giftList.length + 1, // 重新生成ID，确保连续
                        name: name,
                        price: price,
                        category: category,
                        likes: Math.floor(Math.random() * 300) + 50,
                        references: Math.floor(Math.random() * 100) + 10,
                        description: description,
                        image: image
                    });
                });
                
                return giftList;
            })() : [];
        
        console.log('JSON数据转换完成，共', gifts.length, '个礼物');
        return gifts;
    } catch (error) {
        console.error('加载JSON礼物数据时出错:', error);
        console.error('错误详情:', error.stack);
        return null;
    }
}

// 从CSV文件加载礼物数据
async function loadGiftsFromCSV() {
    console.log('开始从CSV文件加载礼物数据...');
    try {
        console.log('正在发送请求获取douyin.csv...');
        const response = await fetch('douyin.csv');
        console.log('CSV请求状态:', response.status, response.statusText);
        
        if (!response.ok) {
            // 检查是否是跨域错误（直接打开HTML文件时会发生）
            if (response.status === 0) {
                console.error('CSV文件加载失败：跨域错误。请通过HTTP服务器访问应用程序，而不是直接打开HTML文件。');
                console.error('请使用命令 python server.py 启动本地服务器，然后访问 http://localhost:8000');
                throw new Error('跨域错误：无法从本地文件系统直接加载CSV文件');
            } else {
                throw new Error(`CSV文件加载失败，状态码: ${response.status}`);
            }
        }
        
        const csvText = await response.text();
        console.log('成功获取CSV文件内容，长度:', csvText.length, '字符');
        
        if (!csvText.trim()) {
            throw new Error('CSV文件内容为空');
        }
        
        const rows = csvText.split('\n').filter(row => row.trim() !== '');
        console.log('CSV文件共有', rows.length, '行数据');
        
        if (rows.length === 0) {
            throw new Error('CSV文件没有有效数据行');
        }
        
        // 解析CSV，处理包含逗号的字段（假设字段值不包含引号）
        // 实际表头是：商品名称, 商品价格, 商品类别, 商品类目
        const gifts = [];
        
        // 创建中文类别到英文类别的映射
        const categoryMapping = {
            // 电子产品
            '电子产品': 'electronics',
            '手机': 'electronics',
            '电脑': 'electronics',
            '平板': 'electronics',
            '耳机': 'electronics',
            '智能手表': 'electronics',
            '相机': 'electronics',
            '电子设备': 'electronics',
            
            // 时尚服饰
            '羽绒服': 'fashion',
            '夹克': 'fashion',
            '针织衫/毛衣': 'fashion',
            '裤子': 'fashion',
            '女士包袋': 'fashion',
            '派克服': 'fashion',
            '棉衣/棉服': 'fashion',
            '女装': 'fashion',
            '男装': 'fashion',
            '箱包': 'fashion',
            '毛呢外套': 'fashion',
            '短外套': 'fashion',
            '塑身衣': 'fashion',
            '保暖内衣': 'fashion',
            '内衣裤袜': 'fashion',
            '休闲裤': 'fashion',
            '靴子': 'fashion',
            '女鞋': 'fashion',
            '羊毛衫': 'fashion',
            '皮草': 'fashion',
            '中老年女装': 'fashion',
            '卫裤': 'fashion',
            '卫衣': 'fashion',
            '斜挎包': 'fashion',
            '棉衣': 'fashion',
            '设计师/潮牌女装': 'fashion',
            '奢品箱包': 'fashion',
            '男士包袋': 'fashion',
            '运动鞋': 'fashion',
            '运动服': 'fashion',
            '冲锋衣': 'fashion',
            
            // 家居用品
            '家居': 'home',
            '家具': 'home',
            '厨房用品': 'home',
            '床上用品': 'home',
            '家居装饰': 'home',
            '家居日用': 'home',
            '家用电器': 'home',
            
            // 书籍
            '书籍': 'books',
            '图书': 'books',
            '杂志': 'books',
            '文具': 'books',
            
            // 美妆护肤
            '面部护肤': 'beauty',
            '美容护肤': 'beauty',
            '彩妆/香水/美妆工具': 'beauty',
            '香水': 'beauty',
            '化妆品': 'beauty',
            
            // 运动户外
            '运动': 'sports',
            '户外': 'sports',
            '健身': 'sports',
            '运动鞋': 'sports',
            '运动服': 'sports',
            '运动器材': 'sports',
        };
        
        // 打印表头信息
        console.log('CSV表头:', rows[0]);
        
        for (let i = 1; i < rows.length; i++) {
            const row = rows[i];
            
            // 跳过空行
            if (!row.trim()) {
                console.log('跳过空行:', i);
                continue;
            }
            
            // 简单可靠的CSV解析方法
            // 已知字段顺序：商品名称,商品价格,商品类别,商品类目
            // 假设只有商品名称可能包含逗号，而其他字段不包含逗号
            
            // 找到最后三个逗号的位置
            let lastCommaIndex = row.lastIndexOf(',');
            let secondLastCommaIndex = row.lastIndexOf(',', lastCommaIndex - 1);
            let thirdLastCommaIndex = row.lastIndexOf(',', secondLastCommaIndex - 1);
            
            if (thirdLastCommaIndex === -1) {
                console.warn('跳过格式不正确的行:', i, '内容:', row);
                continue;
            }
            
            // 提取字段（修复字段顺序映射）
            // 字段顺序：商品名称,商品价格,商品类别,商品类目
            const name = row.substring(0, thirdLastCommaIndex).trim();
            const priceStr = row.substring(thirdLastCommaIndex + 1, secondLastCommaIndex).trim();
            const chineseCategory = row.substring(secondLastCommaIndex + 1, lastCommaIndex).trim();
            const itemType = row.substring(lastCommaIndex + 1).trim();
            
            // 调试字段提取
            console.log(`行${i}解析结果:`);
            console.log(`  商品名称: "${name}"`);
            console.log(`  商品价格: "${priceStr}"`);
            console.log(`  商品类别: "${chineseCategory}"`);
            console.log(`  商品类目: "${itemType}"`);
            
            // 解析价格
            const price = parseFloat(priceStr);
            
            // 验证价格是否有效
            if (isNaN(price)) {
                console.warn('跳过价格无效的行:', i, '内容:', row);
                continue;
            }
            
            // 将中文类别映射到英文类别
            let category = categoryMapping[chineseCategory];
            
            // 如果没有找到直接映射，尝试根据商品名称或描述判断类别
            if (!category) {
                const itemText = (name + ' ' + itemType).toLowerCase();
                
                // 检查电子产品相关关键词
                if (itemText.includes('手机') || itemText.includes('电脑') || itemText.includes('平板') || 
                    itemText.includes('耳机') || itemText.includes('智能手表') || itemText.includes('相机') ||
                    itemText.includes('电子') || itemText.includes('数码')) {
                    category = 'electronics';
                }
                // 检查家居用品相关关键词
                else if (itemText.includes('家居') || itemText.includes('家具') || itemText.includes('厨房') || 
                         itemText.includes('床上') || itemText.includes('装饰') || itemText.includes('日用') ||
                         itemText.includes('家电')) {
                    category = 'home';
                }
                // 检查书籍相关关键词
                else if (itemText.includes('书') || itemText.includes('杂志') || itemText.includes('文具')) {
                    category = 'books';
                }
                // 检查美妆护肤相关关键词
                else if (itemText.includes('护肤') || itemText.includes('美容') || itemText.includes('彩妆') || 
                         itemText.includes('香水') || itemText.includes('化妆品')) {
                    category = 'beauty';
                }
                // 检查运动户外相关关键词
                else if (itemText.includes('运动') || itemText.includes('户外') || itemText.includes('健身') || 
                         itemText.includes('跑步') || itemText.includes('器材')) {
                    category = 'sports';
                }
                // 检查时尚服饰相关关键词
                else if (itemText.includes('衣') || itemText.includes('裤') || itemText.includes('鞋') || 
                         itemText.includes('包') || itemText.includes('帽') || itemText.includes('时尚')) {
                    category = 'fashion';
                }
                // 如果仍然无法判断，使用一个通用的默认值
                else {
                    category = 'fashion';
                }
            }
            const description = itemType || '暂无描述';
            
            console.log(`  映射后的英文类别: "${category}"`);
            console.log(`  价格数字: ${price}`);
            
            // 验证数据完整性
            if (!name || !chineseCategory) {
                console.warn('跳过数据不完整的行:', i, '内容:', row);
                continue;
            }

            const gift = {
                id: i,
                name: name,
                price: price,
                category: category,
                likes: Math.floor(Math.random() * 300) + 50,
                references: Math.floor(Math.random() * 100) + 10,
                description: description
            };
            
            gifts.push(gift);
            
            // 打印前几个礼物的数据，用于调试
            if (i <= 3) {
                console.log('解析的礼物数据:', {
                    原始中文类别: chineseCategory,
                    映射后的英文类别: category,
                    礼物名称: name,
                    价格: price
                });
            }
        }
        
        console.log('成功从CSV文件加载礼物数据，共', gifts.length, '个礼物');
        
        if (gifts.length === 0) {
            throw new Error('没有解析到有效的礼物数据');
        }
        
        return gifts;
    } catch (error) {
        console.error('加载CSV礼物数据时出错:', error);
        console.error('错误详情:', error.stack);
        return null;
    }
}

// 加载示例数据
async function loadSampleData(forceReload = false) {
    console.log('开始加载礼物数据，forceReload:', forceReload);
    
    // 检查localStorage状态
    const hasLocalData = localStorage.getItem('giftData') !== null;
    console.log('localStorage中有数据:', hasLocalData);
    
    // 如果forceReload为true，或者localStorage中没有数据，则重新加载
    if (forceReload || !hasLocalData) {
        console.log('从外部JSON文件加载礼物数据...');
        
        // 调用loadGiftsFromJSON函数从外部文件读取数据
        const newGiftData = await loadGiftsFromJSON();
        
        if (!newGiftData || newGiftData.length === 0) {
            console.error('从JSON文件加载礼物数据失败');
            return;
        }
        
        console.log('数据处理前，共', newGiftData.length, '个礼物');
        
        // 确保id唯一且连续
        newGiftData.forEach((gift, index) => {
            gift.id = index + 1;
            
            // 确保礼物数据包含所有必要字段
            gift.likes = gift.likes || Math.floor(Math.random() * 300) + 50;
            gift.references = gift.references || Math.floor(Math.random() * 100) + 10;
            gift.description = gift.description || '暂无描述';
        });
        
        // 保存到localStorage
        localStorage.setItem('giftData', JSON.stringify(newGiftData));
        giftData = newGiftData;
        
        console.log('数据加载成功，共加载了', newGiftData.length, '个礼物');
        console.log('礼物数据示例:', newGiftData.slice(0, 2));
    } else {
        giftData = JSON.parse(localStorage.getItem('giftData'));
        console.log('从localStorage加载数据，共', giftData.length, '个礼物');
        console.log('localStorage中的礼物数据示例:', giftData.slice(0, 2));
    }
}

// 加载用户数据
function loadUserData() {
    if (!localStorage.getItem('userLists')) {
        userLists = [];
        localStorage.setItem('userLists', JSON.stringify(userLists));
    } else {
        userLists = JSON.parse(localStorage.getItem('userLists'));
    }
}

// 贴纸数据
const stickers = [
    // 生日主题
    { id: 'sticker-birthday-1', category: 'birthday', type: 'emoji', content: '🎂', size: 60 },
    { id: 'sticker-birthday-2', category: 'birthday', type: 'emoji', content: '🎉', size: 60 },
    { id: 'sticker-birthday-3', category: 'birthday', type: 'emoji', content: '🎁', size: 60 },
    { id: 'sticker-birthday-4', category: 'birthday', type: 'emoji', content: '🎈', size: 60 },
    { id: 'sticker-birthday-5', category: 'birthday', type: 'emoji', content: '🥳', size: 60 },
    { id: 'sticker-birthday-6', category: 'birthday', type: 'emoji', content: '🎊', size: 60 },
    
    // 元旦主题
    { id: 'sticker-newyear-1', category: 'newyear', type: 'emoji', content: '🎆', size: 60 },
    { id: 'sticker-newyear-2', category: 'newyear', type: 'emoji', content: '🎇', size: 60 },
    { id: 'sticker-newyear-3', category: 'newyear', type: 'emoji', content: '🥂', size: 60 },
    { id: 'sticker-newyear-4', category: 'newyear', type: 'emoji', content: '🍾', size: 60 },
    { id: 'sticker-newyear-5', category: 'newyear', type: 'emoji', content: '🎊', size: 60 },
    { id: 'sticker-newyear-6', category: 'newyear', type: 'emoji', content: '✨', size: 60 },
    
    // 圣诞主题
    { id: 'sticker-christmas-1', category: 'christmas', type: 'emoji', content: '🎄', size: 60 },
    { id: 'sticker-christmas-2', category: 'christmas', type: 'emoji', content: '🎅', size: 60 },
    { id: 'sticker-christmas-3', category: 'christmas', type: 'emoji', content: '🎁', size: 60 },
    { id: 'sticker-christmas-4', category: 'christmas', type: 'emoji', content: '❄️', size: 60 },
    { id: 'sticker-christmas-5', category: 'christmas', type: 'emoji', content: '⛄', size: 60 },
    { id: 'sticker-christmas-6', category: 'christmas', type: 'emoji', content: '🎀', size: 60 },
    
    // 表情主题
    { id: 'sticker-emoji-1', category: 'emoji', type: 'emoji', content: '😊', size: 60 },
    { id: 'sticker-emoji-2', category: 'emoji', type: 'emoji', content: '❤️', size: 60 },
    { id: 'sticker-emoji-3', category: 'emoji', type: 'emoji', content: '💝', size: 60 },
    { id: 'sticker-emoji-4', category: 'emoji', type: 'emoji', content: '🌟', size: 60 },
    { id: 'sticker-emoji-5', category: 'emoji', type: 'emoji', content: '🎈', size: 60 },
    { id: 'sticker-emoji-6', category: 'emoji', type: 'emoji', content: '🎉', size: 60 },
];

// 存储当前贴纸
let currentStickers = [];

// 防抖函数
function debounce(func, delay) {
    let timeoutId;
    return function(...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
}

// 设置事件监听器
function setupEventListeners() {
    // 导航切换
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            showSection(targetId);
        });
    });

    // 为开始探索按钮添加点击事件监听器
    const startExploreBtn = document.querySelector('.hero-buttons .btn-primary');
    if (startExploreBtn) {
        startExploreBtn.addEventListener('click', function() {
            showUserQuestionnaire();
        });
    }

    // 为查看热门按钮添加点击事件监听器
    const viewPopularBtn = document.querySelector('.hero-buttons .btn-outline');
    if (viewPopularBtn) {
        viewPopularBtn.addEventListener('click', function() {
            showPopularGifts();
        });
    }

    // 模态框控制
    closeModal.addEventListener('click', closeModalWindow);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModalWindow();
    });

    // 礼物筛选和排序 - 添加防抖
    const debouncedFilterGifts = debounce(filterGifts, 300);
    searchInput.addEventListener('input', debouncedFilterGifts);
    categorySelect.addEventListener('change', filterGifts);
    priceSelect.addEventListener('change', filterGifts);
    sortSelect.addEventListener('change', filterGifts);

    // 清单管理
    createListBtn.addEventListener('click', showCreateListForm);
    setupListEventDelegation(); // 使用事件委托处理所有列表相关事件
    listSort.addEventListener('change', sortUserLists); // 清单排序事件
    listFilter.addEventListener('change', filterUserLists); // 清单筛选事件

    // 贺卡制作
    cardTitle.addEventListener('input', updateCardPreview);
    cardMessage.addEventListener('input', updateCardPreview);
    textColor.addEventListener('input', updateCardPreview);
    fontFamily.addEventListener('change', updateCardPreview);
    fontSize.addEventListener('change', updateCardPreview);
    fontBold.addEventListener('change', updateCardPreview);
    fontItalic.addEventListener('change', updateCardPreview);
    cardBgImage.addEventListener('change', handleCardBgImageChange);
    cardImage.addEventListener('change', handleCardImageChange);
    cardTemplate.addEventListener('change', updateCardPreview);
    saveCardBtn.addEventListener('click', saveCard);
    shareCardBtn.addEventListener('click', shareCard);
    
    // 贴纸事件监听器
    openStickerPanel.addEventListener('click', openStickerPanelModal);
    stickerPanelClose.addEventListener('click', closeStickerPanelModal);
    
    // 贴纸分类筛选
    stickerCategoryBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const category = btn.dataset.category;
            filterStickers(category);
            
            // 更新激活状态
            stickerCategoryBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });
    
    // 点击模态窗口外部关闭
    window.addEventListener('click', (e) => {
        if (e.target === stickerPanel) {
            closeStickerPanelModal();
        }
    });
}

// 显示指定区域
function showSection(sectionId) {
    // 更新导航状态
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === sectionId) {
            link.classList.add('active');
        }
    });

    // 更新显示的区域
    sections.forEach(section => {
        section.classList.remove('active');
        if (section.id === sectionId.substring(1)) {
            section.classList.add('active');
        }
    });

    // 特殊处理：当回到发现礼物页面时，重新渲染礼物列表
    if (sectionId === '#discover') {
        renderGifts();
    }
    
    // 特殊处理：当切换到清单页面时，重新渲染清单
    if (sectionId === '#lists') {
        renderUserLists();
    }
}

// 模态框控制
function openModal() {
    modal.classList.add('show');
}

function closeModalWindow() {
    modal.classList.remove('show');
    modalBody.innerHTML = '';
}

// 显示用户问卷
function showUserQuestionnaire() {
    modalBody.innerHTML = `
        <h2>让我们了解一下您的需求</h2>
        <form id="userQuestionnaire" class="form">
            <div class="form-group">
                <label for="recipientType">送礼对象</label>
                <select id="recipientType" required>
                    <option value="">请选择</option>
                    <option value="family">家人</option>
                    <option value="friend">朋友</option>
                    <option value="lover">恋人</option>
                    <option value="colleague">同事</option>
                    <option value="elder">长辈</option>
                    <option value="child">孩子</option>
                </select>
            </div>
            <div class="form-group">
                <label for="recipientAge">年龄范围</label>
                <select id="recipientAge" required>
                    <option value="">请选择</option>
                    <option value="0-12">0-12岁</option>
                    <option value="13-18">13-18岁</option>
                    <option value="19-25">19-25岁</option>
                    <option value="26-35">26-35岁</option>
                    <option value="36-50">36-50岁</option>
                    <option value="50+">50岁以上</option>
                </select>
            </div>
            <div class="form-group">
                <label for="recipientGender">性别</label>
                <select id="recipientGender" required>
                    <option value="">请选择</option>
                    <option value="male">男性</option>
                    <option value="female">女性</option>
                    <option value="other">其他/保密</option>
                </select>
            </div>
            <div class="form-group">
                <label for="budget">预算范围</label>
                <select id="budget" required>
                    <option value="">请选择</option>
                    <option value="0-100">0-100元</option>
                    <option value="101-300">101-300元</option>
                    <option value="301-500">301-500元</option>
                    <option value="501-1000">501-1000元</option>
                    <option value="1000+">1000元以上</option>
                </select>
            </div>
            <div class="form-group">
                <label for="occasion">送礼场合</label>
                <select id="occasion" required>
                    <option value="">请选择</option>
                    <option value="birthday">生日</option>
                    <option value="holiday">节日</option>
                    <option value="anniversary">纪念日</option>
                    <option value="wedding">婚礼</option>
                    <option value="graduation">毕业</option>
                    <option value="other">其他</option>
                </select>
            </div>
            <div class="form-group">
                <label for="interests">兴趣爱好（多选）</label>
                <div class="checkbox-group">
                    <label><input type="checkbox" name="interests" value="reading">阅读</label>
                    <label><input type="checkbox" name="interests" value="sports">运动</label>
                    <label><input type="checkbox" name="interests" value="music">音乐</label>
                    <label><input type="checkbox" name="interests" value="cooking">烹饪</label>
                    <label><input type="checkbox" name="interests" value="gaming">游戏</label>
                    <label><input type="checkbox" name="interests" value="travel">旅行</label>
                    <label><input type="checkbox" name="interests" value="art">艺术</label>
                    <label><input type="checkbox" name="interests" value="technology">科技</label>
                    <label><input type="checkbox" name="interests" value="fashion">时尚</label>
                    <label><input type="checkbox" name="interests" value="gardening">园艺</label>
                </div>
            </div>
            <button type="submit" class="btn btn-primary">获取推荐</button>
        </form>
    `;
    
    document.getElementById('userQuestionnaire').addEventListener('submit', handleQuestionnaireSubmit);
    openModal();
}

// 处理问卷提交
function handleQuestionnaireSubmit(e) {
    e.preventDefault();
    
    // 收集用户回答
    const userAnswers = {
        recipientType: document.getElementById('recipientType').value,
        recipientAge: document.getElementById('recipientAge').value,
        recipientGender: document.getElementById('recipientGender').value,
        budget: document.getElementById('budget').value,
        occasion: document.getElementById('occasion').value,
        interests: Array.from(document.querySelectorAll('input[name="interests"]:checked')).map(checkbox => checkbox.value)
    };
    
    // 关闭问卷模态框
    closeModalWindow();
    
    // 根据用户回答获取推荐礼物
    const recommendedGifts = getGiftRecommendations(userAnswers);
    
    // 显示推荐结果
    showGiftRecommendations(recommendedGifts);
}

// 根据用户回答获取礼物推荐
function getGiftRecommendations(userAnswers) {
    // 解析预算范围
    const [minBudget, maxBudget] = parseBudgetRange(userAnswers.budget);
    
    // 解析年龄范围
    const [minAge, maxAge] = parseAgeRange(userAnswers.recipientAge);
    
    // 为每个礼物计算匹配度得分
    const giftsWithScores = giftData.map(gift => {
        const score = calculateGiftScore(gift, userAnswers, minBudget, maxBudget, minAge, maxAge);
        return { ...gift, matchScore: score };
    });
    
    // 按匹配度得分排序，取前12个
    return giftsWithScores
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, 12);
}

// 解析预算范围
function parseBudgetRange(budgetStr) {
    if (budgetStr === '0-100') return [0, 100];
    if (budgetStr === '101-300') return [101, 300];
    if (budgetStr === '301-500') return [301, 500];
    if (budgetStr === '501-1000') return [501, 1000];
    if (budgetStr === '1000+') return [1000, Infinity];
    return [0, Infinity];
}

// 解析年龄范围
function parseAgeRange(ageStr) {
    if (ageStr === '0-12') return [0, 12];
    if (ageStr === '13-18') return [13, 18];
    if (ageStr === '19-25') return [19, 25];
    if (ageStr === '26-35') return [26, 35];
    if (ageStr === '36-50') return [36, 50];
    if (ageStr === '50+') return [50, Infinity];
    return [0, Infinity];
}

// 计算礼物与用户需求的匹配度
function calculateGiftScore(gift, userAnswers, minBudget, maxBudget, minAge, maxAge) {
    let score = 0;
    
    // 预算匹配度（30分）
    if (gift.price >= minBudget && gift.price <= maxBudget) {
        score += 30;
    } else if (gift.price < minBudget) {
        // 价格低于预算下限，按差距扣分
        const diff = (minBudget - gift.price) / minBudget;
        score += Math.max(0, 30 - diff * 30);
    } else {
        // 价格高于预算上限，按差距扣分
        const diff = (gift.price - maxBudget) / maxBudget;
        score += Math.max(0, 30 - diff * 30);
    }
    
    // 类别匹配度（20分）
    const categoryScore = getCategoryScore(gift.category, userAnswers);
    score += categoryScore;
    
    // 兴趣爱好匹配度（20分）
    const interestScore = getInterestScore(gift, userAnswers.interests);
    score += interestScore;
    
    // 场合匹配度（15分）
    const occasionScore = getOccasionScore(gift, userAnswers.occasion);
    score += occasionScore;
    
    // 评分和人气（15分） - 使用现有的likes和references字段
    const ratingScore = (gift.likes / 300) * 10; // 使用likes作为评分指标，满分10分
    const popularityScore = (gift.references / 100) * 5; // 使用references作为人气指标，满分5分
    score += ratingScore + popularityScore;
    
    return score;
}

// 获取类别匹配度
function getCategoryScore(giftCategory, userAnswers) {
    const categoryMapping = {
        'family': ['home', 'books', 'beauty', 'electronics'],
        'friend': ['electronics', 'sports', 'books', 'fashion'],
        'lover': ['fashion', 'beauty', 'electronics', 'home'],
        'colleague': ['electronics', 'books', 'home'],
        'elder': ['home', 'books', 'beauty'],
        'child': ['electronics', 'books', 'sports']
    };
    
    const preferredCategories = categoryMapping[userAnswers.recipientType] || [];
    
    if (preferredCategories.includes(giftCategory)) {
        return 20;
    }
    return 5; // 默认匹配度
}

// 获取兴趣爱好匹配度
function getInterestScore(gift, interests) {
    if (interests.length === 0) return 10; // 默认10分
    
    // 将礼物描述和名称转换为小写，便于匹配
    const giftText = (gift.name + ' ' + gift.description).toLowerCase();
    
    // 兴趣关键词映射
    const interestKeywords = {
        'reading': ['book', '阅读', '书籍', '小说', '文学'],
        'sports': ['sport', '运动', '健身', '篮球', '足球', '跑步'],
        'music': ['music', '音乐', '耳机', '音箱', '乐器'],
        'cooking': ['cook', '烹饪', '厨具', '厨房', '美食'],
        'gaming': ['game', '游戏', '电竞', '手柄', '键盘'],
        'travel': ['travel', '旅行', '旅游', '行李', '背包'],
        'art': ['art', '艺术', '绘画', '设计', '创意'],
        'technology': ['tech', '科技', '电子', '数码', '智能'],
        'fashion': ['fashion', '时尚', '服装', '鞋子', '配饰'],
        'gardening': ['garden', '园艺', '植物', '花盆', '种植']
    };
    
    let matchedInterests = 0;
    
    // 检查每个兴趣是否与礼物相关
    interests.forEach(interest => {
        const keywords = interestKeywords[interest] || [];
        if (keywords.some(keyword => giftText.includes(keyword))) {
            matchedInterests++;
        }
    });
    
    // 计算匹配度得分
    return (matchedInterests / interests.length) * 20;
}

// 获取场合匹配度
function getOccasionScore(gift, occasion) {
    // 场合关键词映射
    const occasionKeywords = {
        'birthday': ['生日', '生日快乐', '庆祝', '派对'],
        'holiday': ['节日', '圣诞', '新年', '春节'],
        'anniversary': ['纪念', '周年', '爱情', '永恒'],
        'wedding': ['婚礼', '结婚', '爱情', '幸福'],
        'graduation': ['毕业', '学位', '成就', '未来']
    };
    
    if (occasion === 'other') return 10; // 默认10分
    
    const keywords = occasionKeywords[occasion] || [];
    const giftText = (gift.name + ' ' + gift.description).toLowerCase();
    
    if (keywords.some(keyword => giftText.includes(keyword))) {
        return 15;
    }
    return 8; // 默认匹配度
}

// 显示礼物推荐结果
function showGiftRecommendations(recommendedGifts) {
    // 切换到发现礼物页面
    showSection('#discover');
    
    // 更新礼物网格，显示推荐结果
    renderGifts(recommendedGifts);
    
    // 显示推荐信息
    const heroSection = document.querySelector('.hero');
    
    // 先移除已存在的推荐信息
    const existingInfo = heroSection.querySelector('.recommendation-info');
    if (existingInfo) {
        existingInfo.remove();
    }
    
    // 创建新的推荐信息
    const recommendationInfo = document.createElement('div');
    recommendationInfo.className = 'recommendation-info';
    recommendationInfo.innerHTML = `
        <h3>为您推荐的礼物</h3>
        <p>根据您的需求，我们为您精选了以下礼物</p>
    `;
    
    // 添加到英雄区域
    heroSection.appendChild(recommendationInfo);
}

// 用户认证功能已简化移除

// 渲染礼物列表
function renderGifts(filteredGifts = giftData) {
    console.log('开始渲染礼物列表...');
    console.log('当前giftData:', giftData.length, '个礼物');
    console.log('传入的filteredGifts:', filteredGifts.length, '个礼物');
    console.log('filteredGifts示例:', filteredGifts.slice(0, 2));
    
    if (!giftGrid) {
        console.error('未找到giftGrid元素');
        return;
    }
    
    if (!filteredGifts || !Array.isArray(filteredGifts)) {
        console.error('filteredGifts不是有效的数组:', filteredGifts);
        giftGrid.innerHTML = '<p class="no-gifts-message">暂无礼物数据，请稍后再试。</p>';
        return;
    }
    
    if (filteredGifts.length === 0) {
        console.log('没有礼物数据可渲染');
        giftGrid.innerHTML = '<p class="no-gifts-message">暂无礼物数据，请稍后再试。</p>';
        return;
    }
    
    // 优化：将加载快的礼物（有WebP格式且文件小的）优先显示在前面
    // 图片大小映射表（字节）- 基于实际文件大小排序
    const imageSizes = {
        '破壁机.webp': 10848,
        '手机.webp': 11888,
        '美发电器.webp': 11558,
        '平板电脑.webp': 16188,
        '户外服装.webp': 17230,
        '腕表.webp': 17886,
        '短外套.webp': 19496,
        '瑜伽垫.webp': 20858,
        '餐桌.webp': 20468,
        '拉力器.webp': 21616,
        '羽绒服.webp': 21792,
        '数码相机.webp': 22332,
        '智能手表.webp': 23862,
        '袜子.webp': 24750,
        '运动羽绒服.webp': 25032,
        '羊毛衫.webp': 25874,
        '耳机.webp': 29590,
        '瑜伽裤.webp': 30900,
        '抽油烟机.webp': 30464,
        '扫地机器人.webp': 30808,
        '眉笔.webp': 28520,
        '设计师潮牌.webp': 28078,
        '手部护理.webp': 34354,
        '防护用品.webp': 33180,
        '面部美容仪器.webp': 33474,
        '无人机.webp': 35518,
        '洗碗机.webp': 35558,
        '面膜.webp': 34810,
        '面部彩妆.webp': 36204,
        '蔬菜.webp': 38428,
        '床架.webp': 41428,
        '棉衣.webp': 44594,
        '洗地机.webp': 44220,
        '游戏本.webp': 46562,
        '洗发护发.webp': 47160,
        '跑步机.webp': 14848,
        '笔记本电脑.webp': 14860,
        '毛针织衫.webp': 15138,
        '跑步鞋.webp': 47846,
        '游戏机.webp': 48110,
        '跳绳.webp': 56698,
        '篮球鞋.webp': 56692,
        '插排.webp': 60798,
        '沙发.webp': 60982,
        '篮球.webp': 67616,
        '茶几.webp': 67784,
        '靴子.webp': 68778,
        '随身wifi.webp': 53748,
        '散粉.webp': 32794,
        '运动背心.webp': 29836,
        '运动鞋.webp': 16462,
        '运动Tshirt.webp': 11460
    };
    
    const sortedGifts = [...filteredGifts].sort((a, b) => {
        // 为每个礼物生成图片路径，与renderGifts函数中使用的逻辑一致
        let imageA = a.image || `https://via.placeholder.com/300x200?text=No+Image`;
        let imageB = b.image || `https://via.placeholder.com/300x200?text=No+Image`;
        
        // 检查是否支持WebP并生成对应的图片路径
        if (webpSupported && imageA !== `https://via.placeholder.com/300x200?text=No+Image` && imageA.endsWith('.jpg')) {
            imageA = imageA.replace('.jpg', '.webp').replace('images/', 'images/webp/');
        }
        
        if (webpSupported && imageB !== `https://via.placeholder.com/300x200?text=No+Image` && imageB.endsWith('.jpg')) {
            imageB = imageB.replace('.jpg', '.webp').replace('images/', 'images/webp/');
        }
        
        // 优先显示有WebP格式的礼物
        const hasWebPA = imageA.endsWith('.webp');
        const hasWebPB = imageB.endsWith('.webp');
        
        if (hasWebPA && !hasWebPB) {
            return -1;
        } else if (!hasWebPA && hasWebPB) {
            return 1;
        }
        
        // 如果都有WebP，按文件大小排序（小文件优先）
        if (hasWebPA && hasWebPB) {
            const fileNameA = imageA.split('/').pop();
            const fileNameB = imageB.split('/').pop();
            
            const sizeA = imageSizes[fileNameA] || Infinity;
            const sizeB = imageSizes[fileNameB] || Infinity;
            
            // 小文件优先
            if (sizeA < sizeB) return -1;
            if (sizeA > sizeB) return 1;
        }
        
        // 如果都有WebP或都没有，使用占位符的礼物排在后面
        const isPlaceholderA = imageA.includes('placeholder');
        const isPlaceholderB = imageB.includes('placeholder');
        
        if (!isPlaceholderA && isPlaceholderB) {
            return -1;
        } else if (isPlaceholderA && !isPlaceholderB) {
            return 1;
        }
        
        // 如果都一样，保持原顺序
        return 0;
    });
    
    // 使用文档碎片减少DOM操作次数，提升性能
    const fragment = document.createDocumentFragment();
    
    console.log('开始渲染礼物卡片，共', sortedGifts.length, '个礼物');
    console.log('排序后的礼物示例:', sortedGifts.slice(0, 2));
    
    // 限制初始页面显示的礼物数量为9个（优化排版）
    const limitedGifts = sortedGifts.slice(0, 9);
    console.log('限制后显示的礼物数量:', limitedGifts.length, '个礼物');
    
    limitedGifts.forEach((gift, index) => {
        console.log(`渲染第${index + 1}个礼物:`, gift.name);
        
        // 验证礼物数据完整性
        if (!gift || !gift.id || !gift.name) {
            console.error(`礼物数据不完整:`, gift);
            return;
        }
        
        const giftCard = document.createElement('div');
        giftCard.className = 'gift-card';
        
        // 确保所有必要字段都存在
        const name = gift.name || '未命名礼物';
        const category = gift.category || 'other';
        const price = gift.price || 0;
        const description = gift.description || '暂无描述';
        const likes = gift.likes || 0;
        const references = gift.references || 0;
        let image = gift.image || `https://via.placeholder.com/300x200?text=No+Image`;
        
        // 如果浏览器支持WebP格式，并且图片路径不是占位符，则使用WebP格式
        if (webpSupported && image !== `https://via.placeholder.com/300x200?text=No+Image` && image.endsWith('.jpg')) {
            image = image.replace('.jpg', '.webp').replace('images/', 'images/webp/');
        }
        
        // 根据礼物类别选择图标
        const categoryIcons = {
            '电子产品': 'fa-mobile-alt',
            '时尚服饰': 'fa-tshirt',
            '家居用品': 'fa-home',
            '书籍': 'fa-book',
            '美妆护肤': 'fa-spa',
            '运动户外': 'fa-running'
        };
        const iconClass = categoryIcons[getCategoryName(category)] || 'fa-gift';
        
        giftCard.innerHTML = `
            <div class="gift-image">
                <span class="category-badge">${getCategoryName(category)}</span>
                <div class="image-container">
                    <div class="image-placeholder"></div>
                    <img src="${image}" alt="${name}" class="gift-img">
                </div>
            </div>
            <div class="gift-info">
                <h3 class="gift-name">${name}</h3>
                <p class="gift-price">¥${price}</p>
                <p class="gift-description">${description}</p>
                <div class="gift-actions">
                    <button class="action-btn reference-btn" data-id="${gift.id}">
                        <i class="fas fa-link"></i>
                        ${gift.references}
                    </button>
                    <button class="action-btn wishlist-btn ${isInWishlist(gift.id) ? 'in-wishlist' : ''}" data-id="${gift.id}">
                        <i class="fas fa-bookmark"></i>
                        ${getWishlistCount(gift.id)}
                    </button>
                </div>
            </div>
        `;
        
        // 为图片添加加载完成后的淡入效果
        const imgElement = giftCard.querySelector('.gift-img');
        imgElement.addEventListener('load', () => {
            // 图片加载完成后，显示图片并隐藏占位符
            imgElement.style.opacity = '1';
            const placeholder = giftCard.querySelector('.image-placeholder');
            if (placeholder) {
                placeholder.style.display = 'none';
            }
        });
        
        // 图片加载失败时的处理
        imgElement.addEventListener('error', () => {
            // 如果图片加载失败，显示占位符文字
            imgElement.style.opacity = '1';
            imgElement.src = `https://via.placeholder.com/300x200?text=No+Image`;
            const placeholder = giftCard.querySelector('.image-placeholder');
            if (placeholder) {
                placeholder.style.display = 'none';
            }
        });
        
        fragment.appendChild(giftCard);
    });
    
    // 清空容器并一次性添加所有卡片，减少重排重绘
    giftGrid.innerHTML = '';
    giftGrid.appendChild(fragment);
    
    console.log('礼物卡片渲染完成');
    
    // 添加礼物操作事件
    setupGiftActions();
}



// 设置礼物操作事件
function setupGiftActions() {
    document.querySelectorAll('.reference-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const giftId = parseInt(e.currentTarget.dataset.id);
            addReference(giftId);
        });
    });
    
    document.querySelectorAll('.wishlist-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const giftId = parseInt(e.currentTarget.dataset.id);
            addGiftToWishlist(giftId);
        });
    });
}

// 切换点赞状态
function toggleLike(giftId) {
    const gift = giftData.find(g => g.id === giftId);
    if (gift) {
        gift.liked = !gift.liked;
        gift.likes += gift.liked ? 1 : -1;
        localStorage.setItem('giftData', JSON.stringify(giftData));
        renderGifts();
    }
}

// 添加引用
function addReference(giftId) {
    const gift = giftData.find(g => g.id === giftId);
    if (gift) {
        gift.references += 1;
        localStorage.setItem('giftData', JSON.stringify(giftData));
        renderGifts();
    }
}

// 检查礼物是否在心愿清单中
function isInWishlist(giftId) {
    // 查找默认心愿清单
    const wishlist = userLists.find(list => list.title === '我的心愿清单');
    if (!wishlist) return false;
    
    // 检查礼物是否在清单中
    return wishlist.items.some(item => item.id === giftId);
}

// 计算礼物的收藏数量
function getWishlistCount(giftId) {
    let count = 0;
    
    // 遍历所有用户清单，统计包含该礼物的清单数量
    userLists.forEach(list => {
        if (list.items.some(item => item.id === giftId)) {
            count++;
        }
    });
    
    return count;
}

// 将礼物加入/移除心愿清单（切换功能）
function addGiftToWishlist(giftId) {
    // 查找礼物
    const gift = giftData.find(g => g.id === giftId);
    if (!gift) {
        console.error('未找到礼物:', giftId);
        return;
    }
    
    // 查找或创建默认心愿清单
    let wishlist = userLists.find(list => list.title === '我的心愿清单');
    
    if (!wishlist) {
        // 创建默认心愿清单
        wishlist = {
            id: Date.now(),
            title: '我的心愿清单',
            date: '',
            description: '我收藏的礼物',
            items: [],
            sharedWith: [],
            createdAt: new Date().toISOString()
        };
        userLists.push(wishlist);
    }
    
    // 检查礼物是否已经在清单中
    const isAlreadyInList = wishlist.items.some(item => item.id === gift.id);
    
    if (isAlreadyInList) {
        // 如果已经在清单中，则移除
        wishlist.items = wishlist.items.filter(item => item.id !== gift.id);
        alert('礼物已从心愿清单中移除！');
    } else {
        // 如果不在清单中，则添加
        const newItem = {
            id: gift.id,
            name: gift.name,
            price: gift.price,
            description: gift.description,
            claimed: false
        };
        wishlist.items.push(newItem);
        alert('礼物已成功添加到心愿清单！');
    }
    
    // 保存到localStorage
    localStorage.setItem('userLists', JSON.stringify(userLists));
    
    // 更新用户清单界面和礼物列表
    renderUserLists();
    renderGifts();
}

// 筛选和排序礼物
function filterGifts() {
    const searchTerm = searchInput.value.toLowerCase();
    const category = categorySelect.value;
    const priceRange = priceSelect.value;
    const sortBy = sortSelect.value;
    
    // 输出调试信息
    console.log('筛选条件:', { searchTerm, category, priceRange, sortBy });
    
    let filtered = giftData.filter(gift => {
        const matchesSearch = gift.name.toLowerCase().includes(searchTerm) || 
                             gift.description.toLowerCase().includes(searchTerm);
        const matchesCategory = category === 'all' || gift.category === category;
        
        // 价格筛选
        let matchesPrice = true;
        if (priceRange !== 'all') {
            if (priceRange.endsWith('+')) {
                // 处理 1000+ 这种格式
                const min = parseFloat(priceRange.replace('+', ''));
                matchesPrice = gift.price >= min;
            } else {
                // 处理 0-200 这种格式
                const [min, max] = priceRange.split('-').map(parseFloat);
                matchesPrice = gift.price >= min && gift.price <= max;
            }
        }
        
        return matchesSearch && matchesCategory && matchesPrice;
    });
    
    // 输出调试信息
    console.log('筛选结果:', filtered.length, '个礼物');
    
    // 排序
    filtered.sort((a, b) => {
        switch (sortBy) {
            case 'popularity':
                return b.likes - a.likes;
            case 'rating':
                return (b.likes + b.references * 2) - (a.likes + a.references * 2);
            case 'price-asc':
                return a.price - b.price;
            case 'price-desc':
                return b.price - a.price;
            default:
                return 0;
        }
    });
    
    renderGifts(filtered);
}

// 显示热门礼物
function showPopularGifts() {
    // 按热度排序礼物（结合点赞数和引用数）
    const popularGifts = [...giftData].sort((a, b) => {
        // 计算热度分数：点赞数 + 引用数 * 2（引用权重更高）
        const scoreA = a.likes + a.references * 2;
        const scoreB = b.likes + b.references * 2;
        return scoreB - scoreA;
    });
    
    // 只显示前20个最热门的礼物
    const top20Gifts = popularGifts.slice(0, 20);
    
    // 更新筛选条件，确保界面显示正确
    searchInput.value = '';
    categorySelect.value = 'all';
    priceSelect.value = 'all';
    sortSelect.value = 'rating'; // 设置为评分排序，因为热度计算方式类似
    
    // 渲染热门礼物
    renderGifts(top20Gifts);
}

// 显示创建清单表单
function showCreateListForm() {
    modalBody.innerHTML = `
        <h2>创建生日清单</h2>
        <form id="createListForm" class="form">
            <div class="form-group">
                <label for="listTitle">送礼对象</label>
                <input type="text" id="listTitle" required>
            </div>
            <div class="form-group">
                <label for="birthdayDate">生日日期</label>
                <input type="date" id="birthdayDate" required>
            </div>
            <div class="form-group">
                <label for="listTemplate">选择模板</label>
                <select id="listTemplate" class="select-input">
                    <option value="none">不使用模板</option>
                    ${Object.entries(listTemplates).map(([key, template]) => 
                        `<option value="${key}">${template.name} - ${template.description}</option>`
                    ).join('')}
                </select>
            </div>
            <div class="form-group">
                <label for="listDescription">描述</label>
                <textarea id="listDescription" rows="3"></textarea>
            </div>
            <button type="submit" class="btn btn-primary">创建</button>
        </form>
    `;
    
    document.getElementById('createListForm').addEventListener('submit', handleCreateList);
    openModal();
}

// 处理创建清单
function handleCreateList(e) {
    e.preventDefault();
    const title = document.getElementById('listTitle').value;
    const date = document.getElementById('birthdayDate').value;
    const description = document.getElementById('listDescription').value;
    const template = document.getElementById('listTemplate').value;
    
    // 应用选定的模板
    const templateItems = template && template !== 'none' ? 
        listTemplates[template].items.map(item => ({
            ...item,
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            claimed: false
        })) : 
        [];
    
    const newList = {
        id: Date.now(),
        title,
        date,
        description,
        items: templateItems,
        sharedWith: [],
        createdAt: new Date().toISOString()
    };
    
    userLists.push(newList);
    localStorage.setItem('userLists', JSON.stringify(userLists));
    
    closeModalWindow();
    renderUserLists();
    alert('清单创建成功！');
}

// 对用户清单进行排序
function sortUserLists() {
    const sortBy = listSort.value;
    
    switch (sortBy) {
        case 'date':
            userLists.sort((a, b) => new Date(a.date) - new Date(b.date));
            break;
        case 'title':
            userLists.sort((a, b) => a.title.localeCompare(b.title));
            break;
        case 'items':
            userLists.sort((a, b) => b.items.length - a.items.length);
            break;
    }
    
    // 排序后应用当前筛选
    filterUserLists();
}

// 筛选用户清单
function filterUserLists() {
    const filterValue = listFilter.value;
    let filteredLists = [...userLists];
    
    switch (filterValue) {
        case 'completed':
            // 只显示全部礼物都已完成的清单
            filteredLists = userLists.filter(list => 
                list.items.length > 0 && list.items.every(item => item.claimed)
            );
            break;
        case 'incomplete':
            // 只显示全部礼物都未完成的清单
            filteredLists = userLists.filter(list => 
                list.items.length > 0 && list.items.every(item => !item.claimed)
            );
            break;
        case 'mixed':
            // 显示包含混合状态礼物的清单
            filteredLists = userLists.filter(list => 
                list.items.length > 0 && 
                list.items.some(item => item.claimed) && 
                list.items.some(item => !item.claimed)
            );
            break;
        default: // 'all'
            break;
    }
    
    renderUserLists(filteredLists);
}

// 渲染用户清单
function renderUserLists(filteredLists = userLists) {
    if (filteredLists.length === 0) {
        listsContainer.innerHTML = '<p style="text-align: center; color: #718096;">没有符合条件的清单</p>';
        return;
    }
    
    listsContainer.innerHTML = '';
    
    filteredLists.forEach(list => {
        // 计算统计信息
        const totalItems = list.items.length;
        const completedItems = list.items.filter(item => item.claimed).length;
        const remainingItems = totalItems - completedItems;
        const totalAmount = list.items.reduce((sum, item) => sum + (item.price || 0), 0);
        
        const listCard = document.createElement('div');
        listCard.className = 'list-card creator-list-card';
        listCard.innerHTML = `
            <h3 class="list-title">${list.title}</h3>
            <p class="list-date">生日：${formatDate(list.date)}</p>
            
            <!-- 清单统计信息 -->
            <div class="list-stats">
                <div class="stat-item">
                    <span class="stat-label">礼物总数：</span>
                    <span class="stat-value">${totalItems}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">已完成：</span>
                    <span class="stat-value completed">${completedItems}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">未完成：</span>
                    <span class="stat-value remaining">${remainingItems}</span>
                </div>
                ${totalAmount > 0 ? `
                    <div class="stat-item">
                        <span class="stat-label">总金额：</span>
                        <span class="stat-value amount">¥${totalAmount.toFixed(2)}</span>
                    </div>
                ` : ''}
            </div>
            
            <div class="list-items">
                ${list.items.length > 0 ? 
                    list.items.map(item => `
                        <div class="list-item">
                            <div class="item-info">
                                <input type="checkbox" class="item-checkbox" ${item.claimed ? 'checked' : ''} data-item-id="${item.id}" data-list-id="${list.id}">
                                <div class="item-details">
                                    <strong>${item.name}</strong>
                                    ${item.price > 0 ? `<span class="item-price">¥${item.price.toFixed(2)}</span>` : ''}
                                    ${item.description ? `<p class="item-description">${item.description}</p>` : ''}
                                </div>
                            </div>
                            <div class="item-actions">
                                <button class="btn btn-sm btn-danger delete-item-btn" data-item-id="${item.id}" data-list-id="${list.id}">删除</button>
                            </div>
                        </div>
                    `).join('') : 
                    '<p style="color: #718096; font-style: italic;">还没有添加礼物</p>'
                }
            </div>
            <div class="list-actions">
                <button class="btn btn-sm btn-outline add-item-btn" data-id="${list.id}">添加礼物</button>
                <button class="btn btn-sm btn-primary share-btn" data-id="${list.id}">分享</button>
                <button class="btn btn-sm btn-danger delete-btn" data-id="${list.id}">删除</button>
            </div>
        `;
        listsContainer.appendChild(listCard);
    });
}

// 设置事件委托处理所有列表相关事件
function setupListEventDelegation() {
    // 处理点击事件
    listsContainer.addEventListener('click', (e) => {
        // 添加礼物按钮
        if (e.target.classList.contains('add-item-btn')) {
            const listId = parseInt(e.target.dataset.id);
            showAddItemForm(listId);
            return;
        }
        
        // 分享按钮
        if (e.target.classList.contains('share-btn')) {
            const listId = parseInt(e.target.dataset.id);
            shareList(listId);
            return;
        }
        
        // 删除清单按钮
        if (e.target.classList.contains('delete-btn')) {
            const listId = parseInt(e.target.dataset.id);
            deleteList(listId);
            return;
        }
        
        // 删除单个礼物按钮
        if (e.target.classList.contains('delete-item-btn')) {
            const listId = parseInt(e.target.dataset.listId);
            const itemId = parseInt(e.target.dataset.itemId);
            deleteItemFromList(listId, itemId);
            return;
        }
    });
    
    // 处理复选框变化事件
    listsContainer.addEventListener('change', (e) => {
        if (e.target.classList.contains('item-checkbox')) {
            const listId = parseInt(e.target.dataset.listId);
            const itemId = parseInt(e.target.dataset.itemId);
            toggleItemClaimed(listId, itemId, e.target.checked);
        }
    });
}

// 显示添加礼物表单
function showAddItemForm(listId) {
    modalBody.innerHTML = `
        <h2>添加礼物</h2>
        <form id="addItemForm" class="form">
            <div class="form-group">
                <label for="itemName">礼物名称</label>
                <input type="text" id="itemName" required>
            </div>
            <div class="form-group">
                <label for="itemPrice">价格</label>
                <input type="number" id="itemPrice" step="0.01" min="0">
            </div>
            <div class="form-group">
                <label for="itemDescription">描述</label>
                <textarea id="itemDescription" rows="2"></textarea>
            </div>
            <button type="submit" class="btn btn-primary">添加</button>
        </form>
    `;
    
    document.getElementById('addItemForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('itemName').value;
        const price = parseFloat(document.getElementById('itemPrice').value) || 0;
        const description = document.getElementById('itemDescription').value;
        
        addItemToList(listId, { name, price, description });
    });
    
    openModal();
}

// 添加礼物到清单
function addItemToList(listId, item) {
    const list = userLists.find(l => l.id === listId);
    if (list) {
        const newItem = {
            id: Date.now(),
            ...item,
            claimed: false
        };
        list.items.push(newItem);
        localStorage.setItem('userLists', JSON.stringify(userLists));
        
        // 清空表单但保持模态框打开，方便继续添加礼物
        document.getElementById('addItemForm').reset();
        renderUserLists();
        alert('礼物添加成功！\n\n模态框保持打开状态，您可以继续添加其他礼物。');
    }
}

// 切换礼物领取状态
function toggleItemClaimed(listId, itemId, isClaimed) {
    const list = userLists.find(l => l.id === listId);
    if (list) {
        const item = list.items.find(i => i.id === itemId);
        if (item) {
            item.claimed = isClaimed;
            localStorage.setItem('userLists', JSON.stringify(userLists));
            
            // 直接更新DOM元素，避免重新渲染整个列表
            const checkbox = document.querySelector(`.item-checkbox[data-list-id="${listId}"][data-item-id="${itemId}"]`);
            if (checkbox) {
                checkbox.checked = isClaimed;
            }
        }
    }
}

// 分享清单
function shareList(listId) {
    // 生成分享链接（简单模拟）
    const shareUrl = `${window.location.origin}${window.location.pathname}?list=${listId}`;
    
    // 复制到剪贴板
    navigator.clipboard.writeText(shareUrl).then(() => {
        alert('分享链接已复制到剪贴板！\n\n' + shareUrl);
    }).catch(err => {
        alert('分享链接：\n\n' + shareUrl);
    });
}

// 删除清单
function deleteList(listId) {
    if (confirm('确定要删除这个清单吗？此操作不可恢复。')) {
        userLists = userLists.filter(l => l.id !== listId);
        localStorage.setItem('userLists', JSON.stringify(userLists));
        renderUserLists();
        alert('清单已删除！');
    }
}

// 删除单个礼物
function deleteItemFromList(listId, itemId) {
    if (confirm('确定要删除这个礼物吗？此操作不可恢复。')) {
        const list = userLists.find(l => l.id === listId);
        if (list) {
            list.items = list.items.filter(i => i.id !== itemId);
            localStorage.setItem('userLists', JSON.stringify(userLists));
            
            // 直接从DOM中删除元素，避免重新渲染整个列表
            const listItem = document.querySelector(`.delete-item-btn[data-list-id="${listId}"][data-item-id="${itemId}"]`)
                ?.closest('.list-item');
            if (listItem) {
                listItem.remove();
                
                // 如果删除后清单为空，显示空状态
                const listCard = listItem.closest('.list-card');
                const listItemsContainer = listCard.querySelector('.list-items');
                if (listItemsContainer.children.length === 0) {
                    listItemsContainer.innerHTML = '<p style="color: #718096; font-style: italic;">还没有添加礼物</p>';
                }
            } else {
                // 如果找不到元素，重新渲染列表
                renderUserLists();
            }
            
            alert('礼物已删除！');
        }
    }
}

// 更新贺卡预览
function updateCardPreview() {
    const selectedTemplate = cardTemplate.value;
    const previewImage = cardPreview.querySelector('.preview-image') ? cardPreview.querySelector('.preview-image').outerHTML : '';
    const stickersHTML = renderStickersInPreview();
    
    cardPreview.className = `card-preview-area ${selectedTemplate}`;
    
    // 处理字号，确保正确获取和应用单位
    const baseFontSize = parseInt(fontSize.value);
    const fontSizeUnit = fontSize.value.replace(/\d+/, '');
    
    cardPreview.innerHTML = `
        <h2 class="preview-title" style="color: ${textColor.value}; font-family: ${fontFamily.value}; font-size: ${baseFontSize * 1.5}${fontSizeUnit}; font-weight: ${fontBold.checked ? 'bold' : 'normal'}; font-style: ${fontItalic.checked ? 'italic' : 'normal'};">${cardTitle.value || '贺卡标题'}</h2>
        <p class="preview-message" style="color: ${textColor.value}; font-family: ${fontFamily.value}; font-size: ${fontSize.value}; font-weight: ${fontBold.checked ? 'bold' : 'normal'}; font-style: ${fontItalic.checked ? 'italic' : 'normal'};">${cardMessage.value || '写下你的祝福...'}</p>
        ${previewImage}
        ${stickersHTML}
    `;
}

// 处理贺卡背景图片上传
function handleCardBgImageChange(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            cardPreview.style.backgroundImage = `url(${event.target.result})`;
            cardPreview.style.backgroundSize = 'cover';
            cardPreview.style.backgroundPosition = 'center';
            updateCardPreview();
        };
        reader.readAsDataURL(file);
    }
}

// 处理贺卡配图上传
function handleCardImageChange(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            const img = document.createElement('img');
            img.src = event.target.result;
            img.className = 'preview-image';
            
            // 移除现有图片
            const existingImg = cardPreview.querySelector('.preview-image');
            if (existingImg) {
                existingImg.remove();
            }
            
            cardPreview.appendChild(img);
            updateCardPreview();
        };
        reader.readAsDataURL(file);
    }
}

// 打开贴纸面板
function openStickerPanelModal() {
    stickerPanel.style.display = 'flex';
    
    // 渲染贴纸
    renderStickers();
    
    // 添加事件委托处理贴纸点击
    stickerList.addEventListener('click', stickerClickHandler);
    
    // 添加拖拽功能
    stickerList.addEventListener('dragstart', stickerDragStartHandler);
}

// 关闭贴纸面板
function closeStickerPanelModal() {
    stickerPanel.style.display = 'none';
    
    // 移除事件监听器以避免重复绑定
    stickerList.removeEventListener('click', stickerClickHandler);
    stickerList.removeEventListener('dragstart', stickerDragStartHandler);
}

// 贴纸点击事件处理函数
function stickerClickHandler(e) {
    const stickerItem = e.target.closest('.sticker-item');
    if (stickerItem) {
        const sticker = JSON.parse(stickerItem.dataset.sticker);
        addStickerToPreview(sticker);
    }
}

// 贴纸拖拽开始事件处理函数
function stickerDragStartHandler(e) {
    const stickerItem = e.target.closest('.sticker-item');
    if (stickerItem) {
        const sticker = JSON.parse(stickerItem.dataset.sticker);
        e.dataTransfer.setData('sticker', JSON.stringify(sticker));
    }
}

// 筛选贴纸
function filterStickers(category) {
    let filteredStickers = stickers;
    if (category !== 'all') {
        filteredStickers = stickers.filter(sticker => sticker.category === category);
    }
    renderStickers(filteredStickers);
}

// 渲染贴纸
function renderStickers(filteredStickers = stickers) {
    // 使用文档片段减少DOM操作
    const fragment = document.createDocumentFragment();
    
    filteredStickers.forEach(sticker => {
        const stickerItem = document.createElement('div');
        stickerItem.className = 'sticker-item';
        stickerItem.innerHTML = sticker.content;
        stickerItem.style.fontSize = `${sticker.size}px`;
        stickerItem.dataset.sticker = JSON.stringify(sticker); // 存储贴纸数据
        
        // 添加拖拽功能
        stickerItem.draggable = true;
        
        fragment.appendChild(stickerItem);
    });
    
    stickerList.innerHTML = '';
    stickerList.appendChild(fragment);
}

// 添加贴纸到预览
function addStickerToPreview(sticker) {
    const newSticker = {
        ...sticker,
        stickerId: Date.now(),
        left: 100,
        top: 100,
        rotation: 0
    };
    
    currentStickers.push(newSticker);
    updateCardPreview();
    closeStickerPanelModal();
}

// 渲染预览中的贴纸
function renderStickersInPreview() {
    const stickersHTML = currentStickers.map(sticker => {
        return `
            <div class="preview-sticker" 
                 style="left: ${sticker.left}px; top: ${sticker.top}px; transform: rotate(${sticker.rotation}deg);"
                 data-sticker-id="${sticker.stickerId}">
                <div class="sticker-controls">
                    <button class="sticker-control-btn rotate" onclick="rotateSticker(${sticker.stickerId})" title="旋转">&circlearrowright;</button>
                    <button class="sticker-control-btn" onclick="deleteSticker(${sticker.stickerId})" title="删除">&times;</button>
                </div>
                <div style="font-size: ${sticker.size}px; cursor: move;">${sticker.content}</div>
            </div>
        `;
    }).join('');
    
    return stickersHTML;
}

// 旋转贴纸
function rotateSticker(stickerId) {
    const sticker = currentStickers.find(s => s.stickerId === stickerId);
    if (sticker) {
        sticker.rotation += 15;
        updateCardPreview();
    }
}

// 删除贴纸
function deleteSticker(stickerId) {
    currentStickers = currentStickers.filter(s => s.stickerId !== stickerId);
    updateCardPreview();
}

// 初始化贴纸拖拽功能
function initStickerDragAndDrop() {
    cardPreview.addEventListener('dragover', (e) => {
        e.preventDefault();
    });
    
    cardPreview.addEventListener('drop', (e) => {
        e.preventDefault();
        const stickerData = e.dataTransfer.getData('sticker');
        if (stickerData) {
            const sticker = JSON.parse(stickerData);
            const rect = cardPreview.getBoundingClientRect();
            const left = e.clientX - rect.left;
            const top = e.clientY - rect.top;
            
            const newSticker = {
                ...sticker,
                stickerId: Date.now(),
                left: left,
                top: top,
                rotation: 0
            };
            
            currentStickers.push(newSticker);
            updateCardPreview();
        }
    });
    
    // 实现贴纸移动
    cardPreview.addEventListener('mousedown', (e) => {
        const stickerElement = e.target.closest('.preview-sticker');
        if (stickerElement && e.target.closest('.sticker-controls') === null) {
            const stickerId = parseInt(stickerElement.dataset.stickerId);
            const sticker = currentStickers.find(s => s.stickerId === stickerId);
            
            if (sticker) {
                const rect = cardPreview.getBoundingClientRect();
                const offsetX = e.clientX - sticker.left - rect.left;
                const offsetY = e.clientY - sticker.top - rect.top;
                
                function handleMouseMove(e) {
                    sticker.left = e.clientX - rect.left - offsetX;
                    sticker.top = e.clientY - rect.top - offsetY;
                    updateCardPreview();
                }
                
                function handleMouseUp() {
                    document.removeEventListener('mousemove', handleMouseMove);
                    document.removeEventListener('mouseup', handleMouseUp);
                }
                
                document.addEventListener('mousemove', handleMouseMove);
                document.addEventListener('mouseup', handleMouseUp);
            }
        }
    });
}

// 更新贺卡预览
function updateCardPreview() {
    const selectedTemplate = cardTemplate.value;
    const previewImage = cardPreview.querySelector('.preview-image') ? cardPreview.querySelector('.preview-image').outerHTML : '';
    const fontStyle = `${fontBold.checked ? 'bold' : 'normal'} ${fontItalic.checked ? 'italic' : 'normal'}`;
    
    cardPreview.className = `card-preview-area ${selectedTemplate}`;
    cardPreview.innerHTML = `
        <h2 class="preview-title" style="color: ${textColor.value}; font-family: ${fontFamily.value}; font-size: ${parseInt(fontSize.value) * 1.5}px; font-weight: ${fontBold.checked ? 'bold' : 'normal'}; font-style: ${fontItalic.checked ? 'italic' : 'normal'};">${cardTitle.value || '贺卡标题'}</h2>
        <p class="preview-message" style="color: ${textColor.value}; font-family: ${fontFamily.value}; font-size: ${fontSize.value}; font-weight: ${fontBold.checked ? 'bold' : 'normal'}; font-style: ${fontItalic.checked ? 'italic' : 'normal'};">${cardMessage.value || '写下你的祝福...'}</p>
        ${previewImage}
        ${renderStickersInPreview()}
    `;
    
    // 重新初始化拖拽功能
    initStickerDragAndDrop();
}

// 保存贺卡
function saveCard() {
    const card = {
        id: Date.now(),
        title: cardTitle.value || '未命名贺卡',
        message: cardMessage.value || '没有祝福语',
        template: cardTemplate.value,
        textColor: textColor.value,
        fontFamily: fontFamily.value,
        fontSize: fontSize.value,
        fontBold: fontBold.checked,
        fontItalic: fontItalic.checked,
        image: cardPreview.querySelector('.preview-image') ? cardPreview.querySelector('.preview-image').src : null,
        stickers: currentStickers,
        createdAt: new Date().toISOString()
    };
    
    const cards = JSON.parse(localStorage.getItem('cards') || '[]');
    cards.push(card);
    localStorage.setItem('cards', JSON.stringify(cards));
    
    // 使用html2canvas将贺卡转换为图片
    html2canvas(cardPreview, {
        scale: 2, // 提高图片清晰度
        useCORS: true, // 允许跨域图片
        logging: false,
        backgroundColor: null // 保持透明背景（如果有）
    }).then(canvas => {
        // 创建下载链接
        const link = document.createElement('a');
        link.download = `贺卡_${card.title}_${new Date().getTime()}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        
        alert('贺卡已保存并下载为图片！');
    }).catch(error => {
        console.error('保存图片失败:', error);
        alert('贺卡数据已保存，但图片下载失败。请检查浏览器设置或稍后重试。');
    });
}

// 辅助函数：格式化日期
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN');
}

// 辅助函数：获取类别名称
function getCategoryName(category) {
    const categories = {
        electronics: '电子产品',
        fashion: '时尚服饰',
        home: '家居用品',
        books: '书籍',
        beauty: '美妆护肤',
        sports: '运动户外'
    };
    return categories[category] || category;
}

// 检查是否有分享链接
function checkForSharedList() {
    const urlParams = new URLSearchParams(window.location.search);
    const listId = urlParams.get('list');
    if (listId) {
        showSharedList(parseInt(listId));
    }
}

// 显示分享的清单
function showSharedList(listId) {
    const list = userLists.find(l => l.id === listId);
    if (list) {
        // 创建分享视图
        const sharedView = `
            <div class="shared-list-view">
                <h2>${list.title}</h2>
                <p class="list-date">生日：${formatDate(list.date)}</p>
                ${list.description ? `<p class="list-description">${list.description}</p>` : ''}
                <div class="list-items">
                    ${list.items.map(item => `
                        <div class="shared-list-item">
                            <div class="item-info">
                                ${item.claimed ? `<span class="claimed-mark">✓</span>` : ''}
                                <h4>${item.name}</h4>
                                ${item.description ? `<p>${item.description}</p>` : ''}
                                ${item.price > 0 ? `<p class="item-price">¥${item.price}</p>` : ''}
                            </div>
                            <button class="btn btn-sm btn-primary claim-btn" data-item-id="${item.id}" ${item.claimed ? 'disabled' : ''}>
                                ${item.claimed ? '已有人认领' : '我要认领'}
                            </button>
                        </div>
                    `).join('')}
                </div>
                <div class="share-list-again">
                    <button class="btn btn-primary share-again-btn" data-list-id="${listId}">分享给其他人</button>
                </div>
            </div>
        `;
        
        // 替换发现礼物内容为分享视图
        const discoverSection = document.getElementById('discover');
        discoverSection.innerHTML = `<div class="container">${sharedView}</div>`;
        
        // 确保发现礼物部分是激活状态
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        document.querySelector('.nav-link[href="#discover"]').classList.add('active');
        
        document.querySelectorAll('.section').forEach(section => {
            section.classList.remove('active');
        });
        discoverSection.classList.add('active');
        
        // 添加认领按钮事件
        setupClaimButtons();
        
        // 添加再次分享按钮事件
        document.querySelector('.share-again-btn').addEventListener('click', (e) => {
            const listIdToShare = parseInt(e.target.dataset.listId);
            shareList(listIdToShare);
        });
    } else {
        alert('该清单不存在或已被删除');
    }
}

// 设置认领按钮事件
function setupClaimButtons() {
    document.querySelectorAll('.claim-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const itemId = parseInt(e.currentTarget.dataset.itemId);
            claimGift(itemId);
        });
    });
}

// 认领礼物
function claimGift(itemId) {
    // 查找包含该礼物的清单
    for (const list of userLists) {
        const item = list.items.find(i => i.id === itemId);
        if (item && !item.claimed) {
            item.claimed = true;
            localStorage.setItem('userLists', JSON.stringify(userLists));
            alert('礼物选择成功！');
            // 重新加载页面以更新状态
            window.location.reload();
            return;
        }
    }
    alert('选择失败，该礼物可能已被他人选择或不存在');
}

// 分享贺卡
function shareCard() {
    const cardPreviewHTML = cardPreview.outerHTML;
    const shareText = '我制作了一张精美的生日贺卡，快来看看吧！';
    
    if (navigator.share) {
        navigator.share({
            title: '生日贺卡',
            text: shareText,
            url: window.location.href
        }).then(() => {
            console.log('分享成功');
        }).catch((error) => {
            console.log('分享失败', error);
            fallbackShare(cardPreviewHTML, shareText);
        });
    } else {
        fallbackShare(cardPreviewHTML, shareText);
    }
}

// 分享贺卡的后备方案
function fallbackShare(cardPreviewHTML, shareText) {
    alert('您的浏览器不支持分享功能，您可以截图保存贺卡或复制链接分享。\n\n贺卡预览已复制到剪贴板，您可以粘贴到邮件或聊天中分享。');
}

// 页面加载完成后初始化
window.addEventListener('DOMContentLoaded', initApp);
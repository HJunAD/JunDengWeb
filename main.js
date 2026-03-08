// 等待 HTML 文档加载完毕后执行
document.addEventListener('DOMContentLoaded', () => {
    
    // 获取汉堡菜单按钮和导航链接列表
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('nav-links');

    // 如果当前页面存在汉堡菜单（防错处理）
    if (hamburger && navLinks) {
        // 监听点击事件
        hamburger.addEventListener('click', () => {
            // 切换 'active' 类名，控制菜单的显示和隐藏
            navLinks.classList.toggle('active');
        });
    }
});

// 等待文档加载完毕
document.addEventListener('DOMContentLoaded', () => {
    
    // --- 图片放大 (Lightbox) 功能 ---
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxCaption = document.getElementById('lightbox-caption');
    const closeBtn = document.querySelector('.close-lightbox');
    
    // 获取所有的照片卡片
    const photoItems = document.querySelectorAll('.photo-item');

    // 如果当前页面有照片卡片才执行
    if (photoItems.length > 0 && lightbox) {
        
        // 给每个卡片绑定点击事件
        photoItems.forEach(item => {
            item.addEventListener('click', () => {
                // 获取被点击图片和文字
                const img = item.querySelector('.gallery-img');
                const caption = item.querySelector('.photo-caption').innerText;
                
                // 把数据塞进灯箱并显示出来
                lightbox.style.display = 'block';
                lightboxImg.src = img.src;
                lightboxCaption.innerText = caption;
            });
        });

        // 点击 X 按钮关闭
        closeBtn.addEventListener('click', () => {
            lightbox.style.display = 'none';
        });

        // 点击黑底背景也能关闭
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) {
                lightbox.style.display = 'none';
            }
        });
    }
});
// --- 歌单页面：胶囊标签切换功能 ---
    const tabBtns = document.querySelectorAll('.tab-btn');
    const musicGrids = document.querySelectorAll('.music-grid');
    const defaultMsg = document.getElementById('default-msg');

    if (tabBtns.length > 0) {
        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                // 1. 移除所有按钮的激活状态，给当前点击的按钮加上
                tabBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                // 2. 隐藏默认的“请选择”提示语
                if (defaultMsg) defaultMsg.style.display = 'none';

                // 3. 隐藏所有的唱片墙
                musicGrids.forEach(grid => grid.style.display = 'none');

                // 4. 根据按钮绑定的 data-target，显示对应的唱片墙
                const targetId = btn.getAttribute('data-target');
                document.getElementById(targetId).style.display = 'grid';
            });
        });
    }

    // --- 歌单页面：黑胶唱片点击弹出 B站播放器功能 ---
    const musicModal = document.getElementById('music-modal');
    const closeMusicBtn = document.getElementById('close-music-modal');
    const biliPlayer = document.getElementById('bili-player');
    const modalSongTitle = document.getElementById('modal-song-title');
    const modalSongDesc = document.getElementById('modal-song-desc');
    const recordCards = document.querySelectorAll('.record-card');

    if (recordCards.length > 0 && musicModal) {
        recordCards.forEach(card => {
            card.addEventListener('click', () => {
                // 从 HTML 中抓取存好的数据
                const bvid = card.getAttribute('data-bvid');
                const title = card.getAttribute('data-title');
                const desc = card.getAttribute('data-desc');

                // 拼接 B站 iframe 专用链接（加入 autoplay=1 尝试自动播放）
                biliPlayer.src = `https://player.bilibili.com/player.html?bvid=${bvid}&page=1&high_quality=1&danmaku=0`;
                
                // 替换右侧文字
                modalSongTitle.innerText = title;
                modalSongDesc.innerText = desc;
                
                //获取被点击唱片的封面图，并设为弹窗的模糊背景 ---
                const coverImgSrc = card.querySelector('.album-cover').src;
                document.getElementById('modal-blur-bg').style.backgroundImage = `url('${coverImgSrc}')`;
                
                // 显示弹窗
                musicModal.style.display = 'flex';

                // 显示弹窗
                musicModal.style.display = 'flex';
            });
        });

        // 核心逻辑：关闭弹窗时，必须清空 iframe 的 src，否则音乐会在后台一直放
        const closeMusicModal = () => {
            musicModal.style.display = 'none';
            biliPlayer.src = ""; 
        };

        if (closeMusicBtn) {
            closeMusicBtn.addEventListener('click', closeMusicModal);
        }
        
        // 点击黑底也能关闭
        musicModal.addEventListener('click', (e) => {
            if (e.target === musicModal) {
                closeMusicModal();
            }
        });
    }

    document.addEventListener('DOMContentLoaded', () => {
    // ==========================================
    // Jun.AI 核心逻辑 (滚轮调参 + 真实 API)
    // ==========================================

    // --- 1. 旋钮滚轮精密控制逻辑 ---
    const knobs = document.querySelectorAll('.knob');
    if (knobs.length > 0) {
        knobs.forEach(knob => {
            knob.addEventListener('wheel', (e) => {
                e.preventDefault(); // 阻止页面跟随滚轮上下滑动

                let currentVal = parseFloat(knob.dataset.value);
                // 除以 5000 控制灵敏度，数值越大越精细
                let change = -e.deltaY / 5000; 
                let newValue = Math.max(0, Math.min(1, currentVal + change));

                knob.dataset.value = newValue;
                const id = knob.id.split('-')[1];

                // 更新指针旋转角度 (从 -150度 到 150度)
                knob.querySelector('.knob-pointer').style.transform = `rotate(${(newValue * 300) - 150}deg)`;
                
                // 更新横向进度条
                const bar = document.getElementById(`bar-${id}`);
                if(bar) bar.style.width = `${newValue * 100}%`;
                
                // 更新高精度百分比文字 (00.00%)
                const valText = document.getElementById(`val-${id}`);
               if(valText) valText.innerText = `${(newValue * 100).toFixed(2)}%`;

            }, { passive: false }); // 必须设置为 false 才能拦截页面滚动
        });
    }

    // --- 2. 真实 API 接入逻辑 ---
    const sendBtn = document.getElementById('send-btn');
    const userInput = document.getElementById('user-input');
    const chatHistory = document.getElementById('chat-history');
    const statusLed = document.getElementById('status-led');
    const systemPromptInput = document.getElementById('system-prompt');

    const API_URL = "/api/chat";

    if (sendBtn && userInput && chatHistory) { // 确保只在 AI 页面执行
        
        // 支持按下回车键发送
        userInput.addEventListener('keypress', (e) => { 
            if(e.key === 'Enter') sendBtn.click(); 
        });

        sendBtn.addEventListener('click', async () => {
            const text = userInput.value.trim();
            if (!text) return;
            
            // 获取面板参数
            const tempKnob = document.getElementById('knob-temp');
            const currentTemp = tempKnob ? parseFloat(tempKnob.dataset.value) * 2 : 1.4; 
            
            // 获取人设，如果为空则使用你指定的默认人设
            const currentSystemPrompt = systemPromptInput && systemPromptInput.value.trim() !== "" 
                ? systemPromptInput.value.trim() 
                : "你是一个名叫 Jun.AI 的助手，热爱听1990-2019年的华语乐坛音乐、知道小部分乐理知识、尤其喜欢听R&B音乐、热爱摄影的低调的数学学霸，回复温柔幽默。";

            // 渲染用户气泡
            const uB = document.createElement('div');
            uB.className = 'chat-bubble user';
            uB.innerHTML = `<div class="avatar user-avatar"><svg viewBox="0 0 24 24" fill="#888"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg></div><div class="bubble-content">${text}</div>`;
            chatHistory.appendChild(uB);
            userInput.value = '';
            chatHistory.scrollTop = chatHistory.scrollHeight;

            // 状态灯与日志
            statusLed.classList.add('active');
            console.log(`> Jun.AI: 正在请求大模型神经网络 (当前创造力: ${currentTemp / 2 * 100}%)...`);

                try {
                // 向你的个人云端后端发送请求
                const response = await fetch(API_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        model: "llama-3.3-70b-versatile", 
                        messages: [
                            {"role": "system", "content": currentSystemPrompt},
                            {"role": "user", "content": text}
                        ],
                        temperature: currentTemp 
                    })
                });

                // 核心排错：如果报错，把具体原因抓出来
                if (!response.ok) {
                    const errorDetails = await response.json();
                    console.error("> Jun.AI 抓到的详细错误信息:", errorDetails);
                    throw new Error(errorDetails.error?.message || "服务器拒绝了请求");
                }

                const data = await response.json();
                
                const aiReply = data.choices[0].message.content;

                statusLed.classList.remove('active');
                const aB = document.createElement('div');
                aB.className = 'chat-bubble ai';
                aB.innerHTML = `<div class="avatar ai-avatar"><svg viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg></div><div class="bubble-content">${aiReply}</div>`;
                chatHistory.appendChild(aB);
                chatHistory.scrollTop = chatHistory.scrollHeight;

            } catch (error) {
                statusLed.classList.remove('active');
                console.error("> Jun.AI: 连接失败", error);
                const errB = document.createElement('div');
                errB.className = 'chat-bubble ai';
                errB.innerHTML = `<div class="avatar ai-avatar"><svg viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg></div><div class="bubble-content" style="color: #ff4444;">[系统错误] ${error.message}</div>`;
                chatHistory.appendChild(errB);
                chatHistory.scrollTop = chatHistory.scrollHeight;
            }
        });
    }

    // --- 3. 手机端设置抽屉切换逻辑 ---
    const settingsToggle = document.getElementById('settings-toggle');
    const controlPanel = document.getElementById('control-panel');
    
    if (settingsToggle && controlPanel) {
        settingsToggle.addEventListener('click', () => {
            controlPanel.classList.toggle('open');
        });
    }
});

// ==========================================
// 全栈进化：从云端数据库动态加载照片
// ==========================================
document.addEventListener('DOMContentLoaded', async () => {
    const galleryContainer = document.getElementById('gallery-container');
    if (!galleryContainer) return; // 如果不在闲拍页面，就不执行

    try {
        const response = await fetch('/api/photos');
        const photos = await response.json();
        
        galleryContainer.innerHTML = ''; // 清空原本的内容
        
        photos.forEach(photo => {
            const item = document.createElement('div');
            item.className = 'photo-item';
            // 利用 JS 动态拼接 HTML
            item.innerHTML = `
                <img src="${photo.image_url}" alt="${photo.caption}" class="gallery-img">
                <div class="photo-caption">${photo.caption}</div>
            `;
            galleryContainer.appendChild(item);

            // 给刚生成的照片绑定点击放大(Lightbox)事件
            item.addEventListener('click', () => {
                const lightbox = document.getElementById('lightbox');
                document.getElementById('lightbox-img').src = photo.image_url;
                document.getElementById('lightbox-caption').innerText = photo.caption;
                lightbox.style.display = 'block';
            });
        });
    } catch (error) {
        console.error("获取照片失败:", error);
        galleryContainer.innerHTML = '<p class="empty-state" style="color:red;">云端照片加载失败</p>';
    }
});

// ==========================================
// 全栈进化：从云端数据库动态加载音乐（支持无限歌手）
// ==========================================
document.addEventListener('DOMContentLoaded', async () => {
    const tabsContainer = document.getElementById('tabs-container');
    const gridsContainer = document.getElementById('music-grids-container');
    if (!tabsContainer || !gridsContainer) return;

    try {
        const response = await fetch('/api/music');
        const songs = await response.json();

        // 1. 核心魔法：提取出所有不重复的歌手名字！
        const singers = [...new Set(songs.map(song => song.singer))];

        tabsContainer.innerHTML = '';
        gridsContainer.innerHTML = '';

        // 2. 循环每个歌手，生成他的专属按钮和唱片墙
        singers.forEach((singer, index) => {
            const targetId = `singer-${index}`;

            // 生成顶部胶囊按钮
            const btn = document.createElement('button');
            btn.className = 'tab-btn';
            btn.innerText = singer;
            btn.setAttribute('data-target', targetId);
            tabsContainer.appendChild(btn);

            // 生成对应的唱片墙隐藏容器
            const gridDiv = document.createElement('div');
            gridDiv.id = targetId;
            gridDiv.className = 'music-grid';
            gridDiv.style.display = 'none';

            // 挑出属于这个歌手的所有歌，塞进他的墙里
            const singerSongs = songs.filter(s => s.singer === singer);
            singerSongs.forEach(song => {
                const card = document.createElement('div');
                card.className = 'record-card';
                card.innerHTML = `
                    <div class="album-cover-wrapper">
                        <img src="${song.cover_url}" alt="${song.title}" class="album-cover">
                        <div class="vinyl-disc"><div class="vinyl-center"></div></div>
                    </div>
                    <h3 class="song-title">${song.title}</h3>
                `;
                
                // 绑定点击弹出 B站播放器的事件
                card.addEventListener('click', () => {
                    const musicModal = document.getElementById('music-modal');
                    document.getElementById('bili-player').src = `https://player.bilibili.com/player.html?bvid=${song.bvid}&page=1&high_quality=1&danmaku=0`;
                    document.getElementById('modal-song-title').innerText = song.title;
                    document.getElementById('modal-song-desc').innerText = song.description;
                    document.getElementById('modal-blur-bg').style.backgroundImage = `url('${song.cover_url}')`;
                    musicModal.style.display = 'flex';
                });
                
                gridDiv.appendChild(card);
            });
            gridsContainer.appendChild(gridDiv);
        });

        // 3. 重新激活标签切换功能
        const newTabBtns = document.querySelectorAll('.tab-btn');
        newTabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                newTabBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                document.getElementById('default-msg').style.display = 'none';
                document.querySelectorAll('.music-grid').forEach(grid => grid.style.display = 'none');
                document.getElementById(btn.getAttribute('data-target')).style.display = 'grid';
            });
        });

    } catch (error) {
        console.error("音乐加载失败:", error);
    }
});
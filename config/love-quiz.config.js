/**
 * 模块化题库、视觉主题与变现配置文件
 * ------------------------------------------------------------
 * 只需复制并修改本文件（meta / theme / icons / paywall / dimensions / chapters / questions / archetypes），
 * 无需改动 index.html / styles.css / app.js，即可衍生另一款全新主题的测评产品。
 */
window.QUIZ_CONFIG = {
  meta: {
    id: "love-personality-v1",
    brandTitle: "心动频率研究所",
    badge: "VOL. 01 · 40 LIFE SLICES · SOLO & COUPLE",
    title: "测测你的恋爱人格\n与你们的心动适配度",
    subtitle:
      "不考晦涩理论，只聊消息回复、约会细节、争吵反应与隐秘心动。\n三分钟看清你在爱里的真实模样，亦可生成专属口令或直接对照双方人格。",
    disclaimer:
      "趣味人格探索与情侣互动测试 · 非专业心理诊断或婚恋评估 · 全部运算均在本地完成，不上传任何隐私数据",
    passcodePrefix: "LOVE"
  },

  theme: {
    bgPage: "#f5efe7",
    bgSurface: "#fcfaf6",
    bgSurfaceMuted: "#f2ebe2",
    textPrimary: "#231d1f",
    textSecondary: "#5c5052",
    textMuted: "#908284",
    accent: "#9e424d",
    accentDeep: "#7f2f39",
    gold: "#a78254",
    inkBtn: "#231d1f"
  },

  /* 可选的卡密解锁开关：上架小红书/闲鱼做 0.99 元完整报告售卖时可将 enabled 改为 true */
  paywall: {
    enabled: false,
    title: "解锁完整恋爱深度档案 & 情侣对照分析",
    desc: "当前展示为核心原型海报与六维雷达图。输入店铺发放的兑换口令，即可展开全部隐藏优势、盲区与双人保鲜处方。",
    validCodes: ["LOVE2026", "XHS099", "VIP888"],
    hint: "测试阶段若开启门禁，可在 config 中自定义 validCodes"
  },

  /* 8 枚细线矢量图腾（同时供网页 SVG 与导出 Canvas 3:4 PNG 海报绘制） */
  icons: {
    harbor: {
      paths: ["M12 3v3M8.5 7.5h7l1 11h-9l1-11Z", "M6 18.5h12M12 11v4"]
    },
    dreamer: {
      paths: ["M15.5 4.5a7.5 7.5 0 1 0 4 13.8A6.5 6.5 0 0 1 15.5 4.5Z", "M17.5 6.5v3M16 8h3"]
    },
    sunshine: {
      paths: [
        "M16.2 12a4.2 4.2 0 1 1-8.4 0 4.2 4.2 0 0 1 8.4 0Z",
        "M12 3v2.5M12 18.5V21M3 12h2.5M18.5 12H21M5.6 5.6l1.8 1.8M16.6 16.6l1.8 1.8M18.4 5.6l-1.8 1.8M7.4 16.6l-1.8 1.8"
      ]
    },
    cat: {
      paths: [
        "M5 10V5.5L8.8 8.2a7.5 7.5 0 0 1 6.4 0L19 5.5V10a7 7 0 0 1-14 0Z",
        "M9.5 12.2v.6M14.5 12.2v.6M11 15l1 .9 1-.9"
      ]
    },
    explorer: {
      paths: ["M16.5 12a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0Z"],
      ellipses: [{ cx: 12, cy: 12, rx: 10, ry: 3.8, rotate: -24 }]
    },
    partner: {
      paths: [
        "M20.5 12a8.5 8.5 0 1 1-17 0 8.5 8.5 0 0 1 17 0Z",
        "M14.8 9.2 13.2 13.2 9.2 14.8 10.8 10.8 14.8 9.2Z"
      ]
    },
    spark: {
      paths: ["M6 5h12l-1.2 4.5a5 5 0 0 1-9.6 0L6 5Z", "M12 13.2V19M8.5 19h7"]
    },
    ocean: {
      paths: [
        "M3 10.5c2.2-2 4.3-2 6.5 0s4.3 2 6.5 0 3.5-1.6 5 0",
        "M3 15c2.2-2 4.3-2 6.5 0s4.3 2 6.5 0 3.5-1.6 5 0"
      ]
    }
  },

  dimensions: [
    {
      key: "intimacy",
      label: "依恋浓度",
      shortLabel: "亲密依恋",
      highDesc: "渴望高频连接与及时回应，喜欢把日常细节都分享给对方",
      lowDesc: "享受亲密也珍视独处留白，舒服的呼吸感对你很重要"
    },
    {
      key: "romance",
      label: "浪漫表达",
      shortLabel: "浪漫仪式",
      highDesc: "擅长把爱意变成具象的氛围、惊喜和文字温度",
      lowDesc: "偏爱踏实可靠的陪伴，更相信行动胜过甜言蜜语"
    },
    {
      key: "rational",
      label: "情绪稳态",
      shortLabel: "理性定力",
      highDesc: "遇事不易失控，习惯先理清情绪再冷静沟通解决",
      lowDesc: "情感雷达极其敏锐，容易随着对方的态度起伏心动或委屈"
    },
    {
      key: "devotion",
      label: "偏爱投入",
      shortLabel: "偏爱守护",
      highDesc: "认定一人就会倾力托底，习惯把对方放进未来规划里",
      lowDesc: "对关系保持轻盈松弛，不喜欢过早背负太沉重的承诺"
    },
    {
      key: "playful",
      label: "松弛玩心",
      shortLabel: "松弛玩心",
      highDesc: "谈恋爱像和最好的朋友一起冒险，爱接梗也爱制造新鲜感",
      lowDesc: "在感情里偏沉静认真，更看重细水长流的安稳与笃定"
    },
    {
      key: "empathy",
      label: "共情洞察",
      shortLabel: "共情读心",
      highDesc: "很会捕捉对方的微表情与潜台词，能接住没说出口的脆弱",
      lowDesc: "直球坦荡型选手，比起猜心思更喜欢有话直说"
    }
  ],

  chapters: [
    { id: 1, title: "第一篇 · 日常习惯与微瞬间", start: 1, end: 8, milestone: "" },
    { id: 2, title: "第二篇 · 处事方式与边界感", start: 9, end: 16, milestone: "已完成 20% · 接下来看看你在决定与边界上的态度" },
    { id: 3, title: "第三篇 · 社交模式与偏爱信号", start: 17, end: 24, milestone: "已完成 40% · 进入社交场与表达偏爱的真实细节" },
    { id: 4, title: "第四篇 · 情绪反应与摩擦现场", start: 25, end: 32, milestone: "已过半 · 聊聊起争执或心情低落时的真实反应" },
    { id: 5, title: "第五篇 · 兴趣偏好与亲密想象", start: 33, end: 40, milestone: "最后八题 · 关于约会氛围与理想关系的长期想象" }
  ],

  questions: [
    // ==================== 第一篇：日常习惯与微瞬间 (Q1-Q8) ====================
    {
      id: 1,
      chapter: 1,
      text: "刚在一起不久，如果对方隔了三四个小时才回你消息，你的第一反应通常是？",
      options: [
        { key: "A", text: "大概率在忙正事吧，先做自己的事，等回复了再顺便调侃两句", weights: { rational: 2, intimacy: -1, playful: 1 } },
        { key: "B", text: "会忍不住点开对话框看两眼，琢磨 TA 是不是累了或情绪不太对", weights: { intimacy: 2, rational: -2, empathy: 1 } },
        { key: "C", text: "直接补发个可爱表情包或分享件刚遇到的小事，把天续上", weights: { intimacy: 1, playful: 2, devotion: 1 } },
        { key: "D", text: "没太留意时间，各自忙各自的挺正常，等有空再聊就好", weights: { intimacy: -2, rational: 2, empathy: -1 } }
      ]
    },
    {
      id: 2,
      chapter: 1,
      text: "难得两个人都休息的周六早晨，你最期待的睁眼剧本是？",
      options: [
        { key: "A", text: "窝在被窝里赖床抱一会儿，再一起慢悠悠做顿早午餐", weights: { intimacy: 2, romance: 2, devotion: 1 } },
        { key: "B", text: "睡到自然醒后各看各的手机或书，中午约着出门吃点好吃的", weights: { intimacy: -1, rational: 2, playful: 1 } },
        { key: "C", text: "提前悄悄买好对方喜欢的早餐放桌上，等 TA 醒来收获小惊喜", weights: { devotion: 2, romance: 2, empathy: 1 } },
        { key: "D", text: "突然一拍脑门：走！去没去过的菜市场或郊区公园逛逛", weights: { playful: 2, romance: 1, intimacy: 1 } }
      ]
    },
    {
      id: 3,
      chapter: 1,
      text: "晚上点外卖拿不定主意吃什么时，你的惯常操作是？",
      options: [
        { key: "A", text: "先翻一圈收藏夹，再问问对方今天胃口偏清淡还是重口", weights: { empathy: 2, devotion: 1, rational: 1 } },
        { key: "B", text: "直接拍板：“今晚吃寿喜锅/麻辣香锅，不合胃口下次听你的！”", weights: { devotion: 1, playful: 1, rational: 1, empathy: -1 } },
        { key: "C", text: "各自点各自最想吃的，再互相夹几筷子交换尝尝", weights: { intimacy: -1, rational: 2, playful: 1 } },
        { key: "D", text: "拉着对方一起刷外卖软件笑半天，最后点了一堆夜宵配奶茶", weights: { intimacy: 2, playful: 2, romance: 1 } }
      ]
    },
    {
      id: 4,
      chapter: 1,
      text: "下班通勤路上看到晚霞特别好看，你下意识会怎么做？",
      options: [
        { key: "A", text: "立刻拍下来发给喜欢的人，配一句“今天的云像不像棉花糖”", weights: { romance: 2, intimacy: 2, playful: 1 } },
        { key: "B", text: "自己静静看一会儿拍一张存相册，晚上见面或睡前顺嘴提起", weights: { romance: 1, rational: 1, playful: -1 } },
        { key: "C", text: "顺手拍了发朋友圈，顺便看看 TA 会不会来点赞评论", weights: { intimacy: 1, empathy: 1, rational: -1 } },
        { key: "D", text: "心里感叹一句“真好看”，然后戴好耳机继续赶路想晚饭", weights: { rational: 2, romance: -1, intimacy: -1 } }
      ]
    },
    {
      id: 5,
      chapter: 1,
      text: "关于恋爱中的“早安晚安”打卡，你内心的真实感受更接近？",
      options: [
        { key: "A", text: "很有安全感的小仪式，每天开头和结尾都想和对方打个照面", weights: { intimacy: 2, romance: 1, devotion: 1 } },
        { key: "B", text: "想发的时候发，没必要像上班打卡一样变成负担", weights: { intimacy: -2, rational: 2, playful: 1 } },
        { key: "C", text: "早安可以随缘，但睡前聊几句今天发生的事会觉得很踏实", weights: { devotion: 2, empathy: 1, intimacy: 1 } },
        { key: "D", text: "比起干巴巴的“早安”，更喜欢发个沙雕图或语音撒个娇", weights: { playful: 2, romance: 2, intimacy: 1 } }
      ]
    },
    {
      id: 6,
      chapter: 1,
      text: "一起逛超市或便利店时，最容易体现你恋爱性格的细节是？",
      options: [
        { key: "A", text: "顺手把对方随口提过想吃的零食偷偷放进推车里", weights: { devotion: 2, empathy: 2, romance: 1 } },
        { key: "B", text: "认真看配料表、比价格算分量，把家里的日用品顺带囤齐", weights: { rational: 2, devotion: 2, romance: -1 } },
        { key: "C", text: "在零食区互相安利奇葩新口味，像小朋友一样挑花眼", weights: { playful: 2, intimacy: 1, romance: 1 } },
        { key: "D", text: "两人分头拿自己需要的东西，结账台碰头迅速搞定", weights: { intimacy: -2, rational: 2, playful: -1 } }
      ]
    },
    {
      id: 7,
      chapter: 1,
      text: "如果另一半最近工作忙到飞起、回复明显变少，你会？",
      options: [
        { key: "A", text: "点杯热饮或小夜宵送到 TA 手边，留一句“忙完再找我”", weights: { devotion: 2, empathy: 2, romance: 1 } },
        { key: "B", text: "体谅对方忙，自己也正好专心搞自己的事，不打扰就是最好的支持", weights: { rational: 2, intimacy: -1, devotion: 1 } },
        { key: "C", text: "理解归理解，但心里还是会有点落寞，希望 TA 抽空抱一下说明天见", weights: { intimacy: 2, rational: -2, romance: 1 } },
        { key: "D", text: "偶尔发个搞笑短视频帮 TA 解压，顺便说“等你下班我请你吃顿好的”", weights: { playful: 2, empathy: 1, devotion: 1 } }
      ]
    },
    {
      id: 8,
      chapter: 1,
      text: "睡前聊天时，对方突然发来一段长长的“今天好累啊”的吐槽，你会？",
      options: [
        { key: "A", text: "先顺着 TA 的情绪一起吐槽，“太过分了！抱抱，今天受委屈了”", weights: { empathy: 2, intimacy: 2, rational: -1 } },
        { key: "B", text: "先安抚情绪，等 TA 说完再温柔问一句：“需要我帮你参谋下怎么处理吗？”", weights: { rational: 2, empathy: 2, devotion: 1 } },
        { key: "C", text: "直接打个电话过去，听声音哄两句或者讲个冷笑话逗 TA 开心", weights: { devotion: 2, playful: 2, intimacy: 1 } },
        { key: "D", text: "认真帮 TA 拆解问题卡点在哪、明天第一步可以怎么做", weights: { rational: 2, empathy: -1, devotion: 1 } }
      ]
    },

    // ==================== 第二篇：处事方式与边界感 (Q9-Q16) ====================
    {
      id: 9,
      chapter: 2,
      text: "两人计划一次 4 天 3 晚的跨城旅行，分工做攻略时你更倾向？",
      options: [
        { key: "A", text: "我来把交通酒店和动线全盘理好，只挑几个必选项让 TA 拍板", weights: { devotion: 2, rational: 2, playful: -1 } },
        { key: "B", text: "大框架订好机酒就行，到了当地看心情随性溜达才好玩", weights: { playful: 2, rational: -1, intimacy: 1 } },
        { key: "C", text: "拉个共享文档一起添想去的小店和拍照点，过程本身就很甜", weights: { intimacy: 2, romance: 2, empathy: 1 } },
        { key: "D", text: "谁擅长哪部分谁负责，比如我订票找路，TA 负责挑餐厅", weights: { rational: 2, intimacy: -1, devotion: 1 } }
      ]
    },
    {
      id: 10,
      chapter: 2,
      text: "对于“互相查看手机”这件事，你心里的理想边界是？",
      options: [
        { key: "A", text: "可以知道彼此锁屏密码方便应急，但不会主动去翻聊天记录", weights: { rational: 2, devotion: 1, intimacy: 1 } },
        { key: "B", text: "手机属于绝对私人领地，互不留密码也是彼此信任的体现", weights: { intimacy: -2, rational: 2, playful: 1 } },
        { key: "C", text: "我手机随便给 TA 看，也希望对方对我坦诚无秘密，这样心里踏实", weights: { intimacy: 2, devotion: 1, rational: -1 } },
        { key: "D", text: "经常互相拿对方手机点外卖、拍照或刷同一只沙雕视频，根本分不清谁是谁的", weights: { intimacy: 2, playful: 2, romance: 1 } }
      ]
    },
    {
      id: 11,
      chapter: 2,
      text: "突然遇到一件棘手的麻烦（比如租房出问题或行程泡汤），你希望伴侣怎么配合？",
      options: [
        { key: "A", text: "先别急着指责“我早就说过”，能和我站在一起稳住局面最重要", weights: { rational: 2, devotion: 2, empathy: 1 } },
        { key: "B", text: "第一时间抱住我哄一句“没事有我在”，哪怕还没想到办法我就不慌了", weights: { intimacy: 2, romance: 1, rational: -2 } },
        { key: "C", text: "各自快速查方案补救，把损失降到最低，晚上再一起喝一杯复盘", weights: { rational: 2, intimacy: -1, playful: 1 } },
        { key: "D", text: "能一边吐槽倒霉一边陪我笑出声，坏事也瞬间没那么糟了", weights: { playful: 2, empathy: 1, romance: 1 } }
      ]
    },
    {
      id: 12,
      chapter: 2,
      text: "恋爱里的消费与花钱习惯，哪一种最接近你的真实态度？",
      options: [
        { key: "A", text: "心里有本大概的账，互相有来有往，不会让对方觉得占便宜或吃力", weights: { rational: 2, empathy: 1, intimacy: -1 } },
        { key: "B", text: "遇到喜欢的东西或纪念日很舍得为 TA 花钱，让对方开心比数字重要", weights: { romance: 2, devotion: 2, rational: -1 } },
        { key: "C", text: "不搞绝对AA，这顿我请、下顿你请，或者搞个共同的约会小基金", weights: { devotion: 1, intimacy: 1, rational: 1 } },
        { key: "D", text: "日常小钱随手就付了，更喜欢花心思挑性价比高又戳中对方的小礼物", weights: { empathy: 2, playful: 1, devotion: 1 } }
      ]
    },
    {
      id: 13,
      chapter: 2,
      text: "当你和伴侣在某个重要决定上（比如换城市、买大件）意见完全相反时，你会？",
      options: [
        { key: "A", text: "拿纸笔或备忘录把利弊一条条列出来，用事实和长期规划来对齐", weights: { rational: 2, devotion: 1, romance: -1 } },
        { key: "B", text: "先弄清楚对方为什么这么坚持，很多时候分歧背后其实是各自的不安", weights: { empathy: 2, rational: 1, devotion: 1 } },
        { key: "C", text: "会先情绪上头或委屈一会儿，觉得“你怎么不站在我这边”，冷静后才谈", weights: { rational: -2, intimacy: 2, empathy: 1 } },
        { key: "D", text: "先各自保留意见放两天，不硬碰硬，找个轻松的饭局再慢慢磨", weights: { playful: 1, rational: 1, intimacy: -1 } }
      ]
    },
    {
      id: 14,
      chapter: 2,
      text: "周末原本约好见面的当天早上，对方临时家里有急事来不了，你会？",
      options: [
        { key: "A", text: "立刻关心家里严不严重，顺便自己无缝切换成宅家追剧/独处充电日", weights: { rational: 2, empathy: 1, intimacy: -1 } },
        { key: "B", text: "虽然嘴上说“正事要紧”，但还是会有点小失落，希望晚上能语音补偿一下", weights: { intimacy: 2, romance: 1, rational: -1 } },
        { key: "C", text: "看能不能帮上什么忙（比如帮寄东西、查资料），让 TA 别一个人扛", weights: { devotion: 2, empathy: 2, rational: 1 } },
        { key: "D", text: "开玩笑说“好吧放你一马，下次得补顿双倍火锅”，迅速调整好心情", weights: { playful: 2, rational: 1, romance: 1 } }
      ]
    },
    {
      id: 15,
      chapter: 2,
      text: "面对“另一半想自己去参加一个你不太感兴趣的独处活动/朋友局”，你的态度是？",
      options: [
        { key: "A", text: "太好了！各自有自己的小世界，我也正好享受一整晚自由时间", weights: { intimacy: -2, rational: 2, playful: 1 } },
        { key: "B", text: "完全支持去玩，只需要大概说一声几点散场、安全到家报个平安", weights: { devotion: 1, rational: 2, empathy: 1 } },
        { key: "C", text: "如果方便的话还是想偷偷黏着一起去，或者让 TA 中场给我拍两张照", weights: { intimacy: 2, romance: 1, rational: -1 } },
        { key: "D", text: "叮嘱一句“玩得开心，带点好吃的回来”，自己在家美美点个平时 TA 不吃的菜", weights: { playful: 2, intimacy: -1, devotion: 1 } }
      ]
    },
    {
      id: 16,
      chapter: 2,
      text: "如果你们一起养一只宠物（或者共同完成一个长期小目标），你通常扮演的角色是？",
      options: [
        { key: "A", text: "操心全局的“家长担当”：打疫苗、记账单、查注意事项一个不落", weights: { devotion: 2, rational: 2, playful: -1 } },
        { key: "B", text: "情绪价值拉满的“宠溺担当”：狂拍一万张照片、起无数个肉麻外号", weights: { romance: 2, playful: 2, intimacy: 1 } },
        { key: "C", text: "敏锐观察状态的“雷达担当”：它一打蔫或一闹脾气我最先发现", weights: { empathy: 2, devotion: 1, rational: 1 } },
        { key: "D", text: "不干涉细节的“搭子担当”：轮到我干活绝不推辞，其余时间佛系欣赏", weights: { intimacy: -1, rational: 1, playful: 1 } }
      ]
    },

    // ==================== 第三篇：社交模式与偏爱信号 (Q17-Q24) ====================
    {
      id: 17,
      chapter: 3,
      text: "关于在朋友圈/社交平台公开恋情，你更倾向哪种方式？",
      options: [
        { key: "A", text: "仪式感拉满地官宣一次，偶尔分享好看的合照或日常小甜饼", weights: { romance: 2, devotion: 2, intimacy: 1 } },
        { key: "B", text: "不刻意官宣，但熟悉的朋友都知道，发合照随缘不藏着也不营业", weights: { rational: 2, intimacy: -1, playful: 1 } },
        { key: "C", text: "喜欢在暗戳戳的细节里秀（比如影子、两杯咖啡、对方的手）", weights: { romance: 2, empathy: 1, playful: 1 } },
        { key: "D", text: "本来就不太发朋友圈，但手机壁纸、头像或线下一定会把偏爱给足", weights: { devotion: 2, playful: -1, rational: 1 } }
      ]
    },
    {
      id: 18,
      chapter: 3,
      text: "带你去参加TA最好朋友们的聚会，你现场的状态通常是？",
      options: [
        { key: "A", text: "很快和大家打成一片接梗聊天，偶尔趁人不注意给 TA 夹口菜", weights: { playful: 2, devotion: 1, intimacy: 1 } },
        { key: "B", text: "礼貌微笑倾听为主，帮着递茶倒水给足面子，心里默默观察大家关系", weights: { empathy: 2, rational: 2, playful: -1 } },
        { key: "C", text: "有点认生，下意识挨在 TA 身边坐，希望 TA 别冷落我太久", weights: { intimacy: 2, rational: -1, empathy: 1 } },
        { key: "D", text: "落落大方聊几句后就各自轻松社交，不会因为是情侣就时刻绑在一起", weights: { intimacy: -2, rational: 2, playful: 1 } }
      ]
    },
    {
      id: 19,
      chapter: 3,
      text: "你在一段关系里最直观的“偏爱表达方式”是什么？",
      options: [
        { key: "A", text: "把 TA 随口一提的小愿望记在备忘录里，某天不动声色实现", weights: { devotion: 2, romance: 2, empathy: 1 } },
        { key: "B", text: "有什么好玩的梗、八卦、奇葩见闻，永远第一个转发给 TA", weights: { playful: 2, intimacy: 2, romance: 1 } },
        { key: "C", text: "关键时刻永远稳稳兜底：接送、看病、扛事、给清醒的建议", weights: { devotion: 2, rational: 2, romance: -1 } },
        { key: "D", text: "在 TA 面前卸下所有防备，只把最真实、甚至有点幼稚脆弱的一面给 TA 看", weights: { intimacy: 2, empathy: 2, rational: -1 } }
      ]
    },
    {
      id: 20,
      chapter: 3,
      text: "怎么看恋爱后“与异性朋友保持距离”这件事？",
      options: [
        { key: "A", text: "不需要对方催，自己心里自然有一道清清楚楚的分寸线", weights: { rational: 2, devotion: 2, empathy: 1 } },
        { key: "B", text: "希望彼此都能主动报备、避嫌，有些小醋吃了是真的会不舒服", weights: { intimacy: 2, devotion: 1, rational: -2 } },
        { key: "C", text: "只要大大方方介绍认识、不搞暧昧私聊，正常朋友往来完全OK", weights: { rational: 2, intimacy: -1, playful: 1 } },
        { key: "D", text: "我谈恋爱后注意力全在对象身上，自动懒得和别人社交了", weights: { intimacy: 2, devotion: 2, playful: -1 } }
      ]
    },
    {
      id: 21,
      chapter: 3,
      text: "在人群中收到喜欢的人发来的一条撩人/夸赞消息，你会？",
      options: [
        { key: "A", text: "表面冷静装作无事发生，其实嘴角已经悄悄翘起来，回家再回撩", weights: { empathy: 1, romance: 2, playful: -1 } },
        { key: "B", text: "立刻回一个更夸张更甜的表情包或土味情话反击回去", weights: { playful: 2, romance: 1, intimacy: 1 } },
        { key: "C", text: "直接抬头在人群里找 TA 的眼神，用眼神锁定互动", weights: { romance: 2, intimacy: 2, devotion: 1 } },
        { key: "D", text: "笑一下回句“别闹，正干正事呢”，心里觉得挺可爱", weights: { rational: 2, playful: 1, intimacy: -1 } }
      ]
    },
    {
      id: 22,
      chapter: 3,
      text: "什么瞬间会让你觉得“天啊，这人也太适合谈恋爱了吧”？",
      options: [
        { key: "A", text: "吵架或忙碌时也没丢掉教养和耐心，情绪稳得像定海神针", weights: { rational: 2, devotion: 2, empathy: 1 } },
        { key: "B", text: "我不说话只叹了口气，TA 就秒懂我在难过什么并递来拥抱", weights: { empathy: 2, intimacy: 2, romance: 1 } },
        { key: "C", text: "不管在一起多久，突然买一束路边小花或写张便利贴藏进我包里", weights: { romance: 2, devotion: 1, playful: 1 } },
        { key: "D", text: "深夜两点突然陪我下楼吃碗路边摊，还能一起哈哈大笑讲冷笑话", weights: { playful: 2, intimacy: 1, romance: 1 } }
      ]
    },
    {
      id: 23,
      chapter: 3,
      text: "对方把自己的脆弱和过往窘事悄悄告诉你时，你心里会？",
      options: [
        { key: "A", text: "格外珍惜这份信任，既心疼又会认真思考怎么给 TA 长期的安全感", weights: { devotion: 2, empathy: 2, rational: 1 } },
        { key: "B", text: "跟着一起眼眶发酸或心软到不行，恨不得立刻把 TA 抱进怀里", weights: { intimacy: 2, empathy: 2, rational: -1 } },
        { key: "C", text: "安静听完不急着评判，最后轻轻说一句“难怪你以前会那样，现在有我了”", weights: { romance: 2, empathy: 2, devotion: 1 } },
        { key: "D", text: "先用轻松一点的幽默帮 TA 卸下羞耻感，让对方知道“这没啥大不了的”", weights: { playful: 2, rational: 1, empathy: 1 } }
      ]
    },
    {
      id: 24,
      chapter: 3,
      text: "在朋友圈看到别人晒超豪华浪漫求婚/周年大礼，你内心的真实想法是？",
      options: [
        { key: "A", text: "好甜！我也很期待未来某天拥有属于我们两个人的高光时刻", weights: { romance: 2, intimacy: 1, devotion: 1 } },
        { key: "B", text: "看看挺美好，但我更看重日常三餐和低谷时谁真的站在我旁边", weights: { rational: 2, devotion: 2, romance: -1 } },
        { key: "C", text: "更羡慕那些只有两个人懂的私密小浪漫，不需要太张扬给外人看", weights: { romance: 1, empathy: 2, playful: -1 } },
        { key: "D", text: "会顺手截图发给对象调侃一句“快记笔记（doge）”", weights: { playful: 2, intimacy: 1, romance: 1 } }
      ]
    },

    // ==================== 第四篇：情绪反应与摩擦现场 (Q25-Q32) ====================
    {
      id: 25,
      chapter: 4,
      text: "两个人因为一件小事起了摩擦，气氛突然变冷，你的第一本能是？",
      options: [
        { key: "A", text: "最怕冷战拖过夜，哪怕先低头也要把话当天晚上摊开聊清楚", weights: { intimacy: 2, devotion: 1, rational: 1 } },
        { key: "B", text: "情绪上头时怕说出伤人的话，需要先各自冷静半小时再好好谈", weights: { rational: 2, intimacy: -1, empathy: 1 } },
        { key: "C", text: "嘴硬心软地闷着不吭声，但其实一直在等对方先来抱我或递个台阶", weights: { rational: -2, intimacy: 1, romance: 1 } },
        { key: "D", text: "实在绷不住气氛，用搞笑表情包或装可怜先破冰，再顺势复盘", weights: { playful: 2, empathy: 1, rational: 1 } }
      ]
    },
    {
      id: 26,
      chapter: 4,
      text: "吵架时对方哪一种反应最容易让你瞬间破防（或彻底熄火）？",
      options: [
        { key: "A", text: "只讲大道理不理我的委屈，像在开复盘会一样冰冷", weights: { intimacy: 2, romance: 1, rational: -2 } },
        { key: "B", text: "一吵架就翻旧账、说狠话，完全不就事论事", weights: { rational: 2, devotion: 1, empathy: -1 } },
        { key: "C", text: "直接挂电话、已读不回玩消失，把我晾在半空中", weights: { intimacy: 2, devotion: 1, rational: -1 } },
        { key: "D", text: "明明心里在乎却死要面子，连一句软话都不肯说", weights: { empathy: 2, romance: 1, playful: 1 } }
      ]
    },
    {
      id: 27,
      chapter: 4,
      text: "如果另一半忙糊涂了，彻底忘了一个重要的纪念日或你的生日，你会？",
      options: [
        { key: "A", text: "直接坦白说“我今天其实有点小失落”，周末找机会一起补过就好", weights: { rational: 2, devotion: 1, intimacy: 1 } },
        { key: "B", text: "会难过一整晚，忍不住怀疑“是不是我没以前重要了”", weights: { rational: -2, intimacy: 2, romance: 2 } },
        { key: "C", text: "嘴上大度说没事，但可能会记在小本本上观察 TA 后续怎么补偿", weights: { empathy: 1, rational: -1, playful: -1 } },
        { key: "D", text: "主动发个提示：“恭喜你成功错过一个重要节日，惩罚今晚请吃大餐！”", weights: { playful: 2, rational: 1, intimacy: 1 } }
      ]
    },
    {
      id: 28,
      chapter: 4,
      text: "你自己工作/生活上心情跌到谷底时，最希望伴侣怎么对待你？",
      options: [
        { key: "A", text: "什么都不用问，安静过来抱住我或者就待在同一个房间里", weights: { intimacy: 2, empathy: 1, playful: -1 } },
        { key: "B", text: "让我先自己消化安静一会，不要一直追问“怎么了怎么了”", weights: { intimacy: -2, rational: 2, empathy: 1 } },
        { key: "C", text: "带我去吃顿热乎的、看场电影或兜兜风，用行动把我拉出低气压", weights: { playful: 2, devotion: 2, romance: 1 } },
        { key: "D", text: "耐心听我把所有烦心事倒出来，陪我骂几句再一起理理思路", weights: { empathy: 2, rational: 1, intimacy: 1 } }
      ]
    },
    {
      id: 29,
      chapter: 4,
      text: "对方不小心误解了你的好意，语气有点冲地说了句重话，你会？",
      options: [
        { key: "A", text: "当场先解释清楚原委：“我刚刚其实是想……”不让误会留到下一秒", weights: { rational: 2, empathy: -1, devotion: 1 } },
        { key: "B", text: "心里瞬间被刺到一下，不太想解释了，只想先安静缩回壳里", weights: { rational: -2, empathy: 2, playful: -1 } },
        { key: "C", text: "反问一句“你是不是今天太累了？我刚才其实是想帮你呀”", weights: { empathy: 2, rational: 2, devotion: 1 } },
        { key: "D", text: "先回敬一句“哟，谁惹我们大王生气啦”，顺势把话说明白", weights: { playful: 2, rational: 1, intimacy: 1 } }
      ]
    },
    {
      id: 30,
      chapter: 4,
      text: "发现对象最近情绪明显低落却说“没事”，你的观察与反应是？",
      options: [
        { key: "A", text: "几乎一秒就能察觉异常，会默默端杯水放旁边：“不想说也没事，我在呢”", weights: { empathy: 2, devotion: 2, romance: 1 } },
        { key: "B", text: "尊重 TA 说没事，就顺着先放一放，等 TA 想说时自然会开口", weights: { intimacy: -1, rational: 2, empathy: -1 } },
        { key: "C", text: "会反复温柔试探，因为对方不开心却不告诉我，我会有点慌", weights: { intimacy: 2, rational: -2, empathy: 1 } },
        { key: "D", text: "发个搞笑视频或者买点小甜品放到桌上，先逗笑再慢慢聊", weights: { playful: 2, devotion: 1, empathy: 1 } }
      ]
    },
    {
      id: 31,
      chapter: 4,
      text: "关于“向伴侣示弱认错”，你在亲密关系里的真实状态是？",
      options: [
        { key: "A", text: "只要确认自己真错了，道个歉哄哄对方一点也不丢人", weights: { rational: 2, devotion: 2, empathy: 1 } },
        { key: "B", text: "口头上很难直白说“我错了”，但会用倒水、买吃的、贴贴来求和", weights: { playful: 1, intimacy: 1, romance: 1, rational: -1 } },
        { key: "C", text: "容易在对方还没开口前就先反思是不是自己做得不够好", weights: { empathy: 2, rational: -2, devotion: 1 } },
        { key: "D", text: "分得清谁对谁错：我错了马上认，不是我的锅也会温和但坚定地说清楚", weights: { rational: 2, intimacy: -1, empathy: 1 } }
      ]
    },
    {
      id: 32,
      chapter: 4,
      text: "在热恋期过去、关系进入平淡期时，你最容易感到焦虑的信号是？",
      options: [
        { key: "A", text: "聊天的分享欲肉眼可见地变少，好像只剩“吃饭没、睡了”", weights: { intimacy: 2, romance: 2, empathy: 1 } },
        { key: "B", text: "对方开始频繁敷衍承诺、对未来计划避而不谈", weights: { devotion: 2, rational: 2, romance: -1 } },
        { key: "C", text: "在一起越来越像搭伙过日子的室友，没了以前那种好玩的火花", weights: { playful: 2, romance: 2, intimacy: 1 } },
        { key: "D", text: "其实平淡挺舒服的，只要彼此心里笃定，我反而不怎么焦虑", weights: { rational: 2, intimacy: -1, devotion: 1 } }
      ]
    },

    // ==================== 第五篇：兴趣偏好与亲密想象 (Q33-Q40) ====================
    {
      id: 33,
      chapter: 5,
      text: "挑一个你最心动的周日晚间约会剧本：",
      options: [
        { key: "A", text: "关灯窝在沙发上点香薰看一部老电影，看完一起复盘剧情到深夜", weights: { romance: 2, empathy: 2, intimacy: 1 } },
        { key: "B", text: "去江边或公园压马路散步，风吹过来有一搭没一搭地聊近期想法", weights: { rational: 1, devotion: 1, intimacy: 1, playful: -1 } },
        { key: "C", text: "打卡夜市/电玩城/桌游吧，笑得前仰后合再买杯热奶茶走回家", weights: { playful: 2, intimacy: 2, romance: 1 } },
        { key: "D", text: "一个看书/打游戏、一个在旁边写东西，偶尔抬头碰个杯或喂口水果", weights: { intimacy: -1, rational: 2, devotion: 1 } }
      ]
    },
    {
      id: 34,
      chapter: 5,
      text: "选礼物送给喜欢的人时，哪种路线最像你的手笔？",
      options: [
        { key: "A", text: "观察好几个月选出的实用好物（比如护颈枕、好耳机），天天都能用上我送的", weights: { devotion: 2, rational: 2, romance: -1 } },
        { key: "B", text: "带有强烈专属记忆点的礼物：定制手写信、胶片相册或刻字小物", weights: { romance: 2, empathy: 2, intimacy: 1 } },
        { key: "C", text: "直接带 TA 去店里挑，或者提前套话买准心头好，保证零踩雷", weights: { rational: 2, devotion: 1, playful: 1 } },
        { key: "D", text: "搞怪又可爱的小东西配上一束鲜花，主打一个拆盒瞬间笑出声", weights: { playful: 2, romance: 2, intimacy: 1 } }
      ]
    },
    {
      id: 35,
      chapter: 5,
      text: "两个人一起看电影/追剧，遇到风格完全不一样的时候，你通常会？",
      options: [
        { key: "A", text: "这次看 TA 想看的，下次看我想看的，互相安利新世界也挺有趣", weights: { playful: 1, rational: 2, empathy: 1 } },
        { key: "B", text: "边看边疯狂吐槽或科普彩蛋，重点不是片子而是有人一起叽叽喳喳", weights: { playful: 2, intimacy: 2, romance: 1 } },
        { key: "C", text: "更喜欢找能聊出深度的文艺/悬疑片，看完交流彼此的价值观", weights: { empathy: 2, romance: 1, playful: -1 } },
        { key: "D", text: "懒得凑一起勉强，各看各的喜欢的片子反而更自在高效", weights: { intimacy: -2, rational: 2, empathy: -1 } }
      ]
    },
    {
      id: 36,
      chapter: 5,
      text: "如果用一种天气来形容你在爱里最舒服的状态，你会选？",
      options: [
        { key: "A", text: "雨夜亮着暖黄落地灯的屋子：外面世界很吵，但这里永远安稳", weights: { devotion: 2, rational: 1, romance: 1 } },
        { key: "B", text: "初夏傍晚粉紫色的微风天：空气里有橘子汽水味，让人忍不住想牵手", weights: { romance: 2, playful: 2, intimacy: 1 } },
        { key: "C", text: "秋高气爽的晴朗午后：通透明亮、不黏腻，走在一起步调刚好一致", weights: { rational: 2, intimacy: -1, playful: 1 } },
        { key: "D", text: "下雪天揣在同一只大衣口袋里：话不多，但心口一直热烘烘的", weights: { devotion: 2, empathy: 2, playful: -1 } }
      ]
    },
    {
      id: 37,
      chapter: 5,
      text: "在亲密关系里，最让你觉得“被爱击中”的一句情话是？",
      options: [
        { key: "A", text: "“别怕，出了事有我兜着，你只管往前走。”", weights: { devotion: 2, rational: 1, intimacy: 1 } },
        { key: "B", text: "“你不用在我面前硬撑着懂事，在我这可以随时做小孩。”", weights: { empathy: 2, intimacy: 2, romance: 1 } },
        { key: "C", text: "“我今天路过那家店，一下子就想到你了。”", weights: { romance: 2, intimacy: 1, devotion: 1 } },
        { key: "D", text: "“我喜欢你本来就自由自在的样子，不用为了我改变什么。”", weights: { rational: 2, intimacy: -2, empathy: 1 } }
      ]
    },
    {
      id: 38,
      chapter: 5,
      text: "想象你们在一起五年后的某个普通晚上，最打动你的画面是？",
      options: [
        { key: "A", text: "厨房锅里炖着汤，一个人切菜一个人从背后抱住腰说今天的事", weights: { intimacy: 2, devotion: 2, romance: 1 } },
        { key: "B", text: "窝在沙发上抢最后一包薯片，为了一个老梗笑到停不下来", weights: { playful: 2, intimacy: 1, romance: 1 } },
        { key: "C", text: "书桌两头各自忙着热爱的事业，累了抬头相视一笑倒杯茶", weights: { rational: 2, intimacy: -1, devotion: 1 } },
        { key: "D", text: "阳台吹风喝点小酒，聊起当年刚认识时的心动细节依然会脸红", weights: { romance: 2, empathy: 2, playful: -1 } }
      ]
    },
    {
      id: 39,
      chapter: 5,
      text: "如果能给爱情加上一条只属于你的“作弊 buff”，你最想选？",
      options: [
        { key: "A", text: "读心术：一眼看穿对方没说出口的小委屈与真实想法", weights: { empathy: 2, intimacy: 1, rational: 1 } },
        { key: "B", text: "情绪恒温器：永远不会因为一时冲动说出不可挽回的气话", weights: { rational: 2, devotion: 1, empathy: 1 } },
        { key: "C", text: "保鲜永动机：不管第几年，看彼此的眼神依然有第一年夏天的火花", weights: { romance: 2, playful: 2, intimacy: 1 } },
        { key: "D", text: "并肩护盾：无论遇到多大的现实风浪，两个人的心永远拧在同一边", weights: { devotion: 2, rational: 1, playful: -1 } }
      ]
    },
    {
      id: 40,
      chapter: 5,
      text: "最后一题：如果把“好的爱情”浓缩成四个字，此刻你第一眼会选？",
      options: [
        { key: "A", text: "双向奔赴 —— 热烈回应，彼此偏爱", weights: { intimacy: 2, devotion: 2, romance: 1 } },
        { key: "B", text: "久处不厌 —— 松弛好玩，永远有话聊", weights: { playful: 2, empathy: 1, intimacy: 1 } },
        { key: "C", text: "并肩同频 —— 独立清醒，互相成就", weights: { rational: 2, intimacy: -2, devotion: 1 } },
        { key: "D", text: "岁岁安稳 —— 细水长流，互为归宿", weights: { devotion: 2, rational: 2, romance: -1 } }
      ]
    }
  ],

  archetypes: [
    {
      id: "harbor",
      code: "LP-01",
      name: "恒温港湾守望者",
      en: "The Steady Harbor",
      emblem: "🕯️",
      target: { intimacy: 58, romance: 52, rational: 80, devotion: 84, playful: 36, empathy: 68 },
      tags: ["情绪稳定", "行动托底", "长择天花板"],
      quote: "“热恋时我替你挡风，平淡时我把灯留到最晚。”",
      miniSummary: "你给的爱不靠轰轰烈烈刷存在感，而是用稳定、笃定和细节托底，让对方越爱越安心。",
      traits:
        "你在亲密关系里自带一种珍贵的“恒温感”。不会因为对方少回两条消息就胡思乱想，也不会在发生分歧时用冷暴力或狠话伤人。你擅长把爱落实在具体的小事上——记住忌口、接住坏情绪、遇事永远站在伴侣同一阵线，是很多人谈过几段恋爱后最想嫁/最想娶的类型。",
      strength:
        "极高的情绪定力与抗风险能力。在关系进入平淡期或遇到现实压力时，别人容易动摇，你却能稳稳把两个人的日子托住，给伴侣稀缺的“确定感”。",
      blindspot:
        "有时太过习惯“照顾人、顾大局”，反而会把自己那点小委屈藏起来；偶尔也会因为表现得太稳重，让偏浪漫型的伴侣误以为你不够上头。",
      bestMatches: [
        { id: "dreamer", reason: "TA 的浪漫与高甜正好点亮你的日常，而你的稳重恰好接住 TA 的敏感。" },
        { id: "spark", reason: "你能治好 TA 的忽冷忽热与患得患失，TA 能让你的生活多出许多鲜活火花。" }
      ],
      growthMatch: {
        id: "cat",
        reason: "两个人都太客气、太克制了，容易把“尊重彼此”谈成相敬如宾，记得多主动表达撒娇与需求。"
      },
      easterEggs: {
        bgm: "《慢慢喜欢你》—— 越往后越动听的耐听派",
        replyHabit: "不一定会秒回长篇大论，但看到重要事永远认真回复不敷衍",
        quarrelOS: "表面冷静找解法，心里其实已经盘算好等下怎么去买你爱吃的哄你",
        dateScene: "雨夜一起逛温暖的家居店，顺手买两只配套马克杯"
      }
    },
    {
      id: "dreamer",
      code: "LP-02",
      name: "高甜氛围造梦师",
      en: "The Velvet Dreamer",
      emblem: "🌹",
      target: { intimacy: 80, romance: 86, rational: 26, devotion: 62, playful: 58, empathy: 78 },
      tags: ["仪式感满级", "细节控", "一眼心软"],
      quote: "“我不是在谈一场普通恋爱，我在和你共同拍摄一部限定浪漫电影。”",
      miniSummary: "你是天生的浪漫主义者，能把晚霞、咖啡香和一句不经意的情话都变成闪闪发光的记忆。",
      traits:
        "你的爱意是有温度、有画面、有呼吸感的。你非常在意恋爱里的情绪连接与专属仪式，对方随口提过一次的小花、看电影时悄悄递来的纸巾、节日里的一封手写信，都能让你心动很久。同时你也很会照顾伴侣的感受，只要认定一个人，就恨不得把全世界的温柔都打包送过去。",
      strength:
        "极强的“把日常过成诗”的能力。和你谈恋爱几乎不会觉得无聊或冷漠，你总能敏锐接住对方的情绪，让爱人感受到自己被深深珍视和需要。",
      blindspot:
        "浪漫雷达太敏锐有时也是一把双刃剑：对方的粗线条或无心疏忽，很容易被你解读成“热情减退”，从而在心里独自上演十集苦情戏。",
      bestMatches: [
        { id: "harbor", reason: "稳稳接住你的全部敏感与仪式感，让你的浪漫有处安放不再落空。" },
        { id: "sunshine", reason: "双倍高甜浓度！你负责制造氛围，TA 负责炽热回应，热恋期能续费十年。" }
      ],
      growthMatch: {
        id: "partner",
        reason: "对方更信“做了什么”而不是“说了什么”，别因为 TA 不擅长嘴甜就误会 TA 不爱你。"
      },
      easterEggs: {
        bgm: "《永不失联的爱》—— 细节与氛围感拉满",
        replyHabit: "喜欢发小作文、语音和精致表情包，连标点符号都在传递想念",
        quarrelOS: "其实只要一个抱抱和一句“是我不好，别气了好不好”就能一秒融化",
        dateScene: "傍晚江边落日配微醺小酒馆，或者一起拍一套复古胶片照"
      }
    },
    {
      id: "sunshine",
      code: "LP-03",
      name: "直球热恋小太阳",
      en: "The Radiant Lover",
      emblem: "☀️",
      target: { intimacy: 76, romance: 64, rational: 58, devotion: 80, playful: 82, empathy: 44 },
      tags: ["明目张胆偏爱", "高能量", "行动力MAX"],
      quote: "“喜欢你这件事我藏不住，不仅我要知道，路过的晚风也要知道。”",
      miniSummary: "不搞猜心游戏也不吊胃口，你的爱意热烈、坦荡、像盛夏晴天一样耀眼。",
      traits:
        "在暧昧和恋爱里，你最讨厌的就是拐弯抹角和内耗拉扯。你喜欢一个人，眼神、语气、朋友圈和行动力都会明明白白告诉对方：“我就是偏心你”。和你在一起时常会有一种被高能量充电的快乐，你既愿意陪对方疯闹，也愿意在关键时刻第一时间冲出来护短。",
      strength:
        "坦荡真诚、零阴暗面，极少让人猜来猜去。你的快乐和热情自带传染力，很容易把一段关系里枯燥或闷沉的部分瞬间盘活。",
      blindspot:
        "直球型选手偶尔会忽略那些“需要细细体会的潜台词”——有时伴侣叹气不是需要你立刻讲笑话逗乐，而是想被安静抱着听一会儿。",
      bestMatches: [
        { id: "ocean", reason: "你的炽热能融化 TA 的慢热防御，而 TA 的深情细腻会让你格外着迷。" },
        { id: "dreamer", reason: "一个敢爱敢追、一个会接梗会造梦，走到哪都是高甜偶像剧。" }
      ],
      growthMatch: {
        id: "cat",
        reason: "你越热情靠近，猫系人格越容易本能往后退半步，记得给 TA 留一点独处喘息的角落。"
      },
      easterEggs: {
        bgm: "《Mojito》—— 扑面而来的夏日明快节奏",
        replyHabit: "消息弹窗一亮就秒回，外加一串感叹号和哈哈哈哈",
        quarrelOS: "气不过三分钟，转身看到个好笑的梗还是忍不住先发给你看",
        dateScene: "游乐园夜场烟花、热闹夜市扫街、或者双人自驾去海边"
      }
    },
    {
      id: "cat",
      code: "LP-04",
      name: "猫系清醒鉴爱官",
      en: "The Lucid Cat",
      emblem: "🐈",
      target: { intimacy: 22, romance: 36, rational: 82, devotion: 40, playful: 56, empathy: 58 },
      tags: ["边界感极强", "清醒独立", "慢熟但长情"],
      quote: "“我可以很爱你，但我首先依然是我自己。”",
      miniSummary: "不黏腻、不画饼、不盲从，只有真正懂你留白和分寸感的人，才能走进你的心里。",
      traits:
        "你对亲密关系有着极高的审美与清醒度。热恋期也不会把全部人生重心丢给对方，依然保持着自己的节奏、爱好与社交边界。很多人初见会觉得你有点高冷或难捂热，但其实你心里明镜似的——谁是真心、谁在敷衍，你一清二楚，只是懒得拆穿。",
      strength:
        "从不把伴侣当成情绪垃圾桶，也不进行道德绑架。和你谈恋爱会感到特别轻松体面，因为你懂得尊重一个完整独立的灵魂。",
      blindspot:
        "太怕麻烦或太怕失控时，容易下意识开启“冷处理防卫机制”。明明心里也在乎，嘴上却偏偏表现得像无所谓，容易让另一半产生孤单感。",
      bestMatches: [
        { id: "explorer", reason: "精神世界同频、彼此尊重自由空间，既能热聊宇宙也能安心各自独处。" },
        { id: "partner", reason: "两个清醒独立的大人强强联合，不内耗、不拖泥带水，相处极其舒服。" }
      ],
      growthMatch: {
        id: "sunshine",
        reason: "一个需要高频贴贴，一个需要留白呼吸，学会提前约定“独处信号”就能少吵很多架。"
      },
      easterEggs: {
        bgm: "《Mojito》之外的深夜爵士 Lo-Fi —— 清冷又高级",
        replyHabit: "轮回型选手，不秒回不代表不爱，单纯在享受当下的专注",
        quarrelOS: "最怕情绪轰炸，给我半小时安静，我能自己把逻辑理顺回来哄你",
        dateScene: "安静的独立书店、美术馆看展，结束后各点一杯美式聊一聊"
      }
    },
    {
      id: "explorer",
      code: "LP-05",
      name: "灵魂共振探索家",
      en: "The Soul Explorer",
      emblem: "🪐",
      target: { intimacy: 42, romance: 64, rational: 62, devotion: 36, playful: 82, empathy: 80 },
      tags: ["精神共鸣", "有趣灵魂", "反套路恋爱"],
      quote: "“比起千篇一律的早安晚安，我更着迷于和你在凌晨两点聊尽奇思妙想。”",
      miniSummary: "你找的不是搭伙过日子的室友，而是一个能一起对世界保持好奇的最佳拍档。",
      traits:
        "对你而言，性吸引力与外在条件或许能决定第一眼，但“灵魂有共鸣、说话接得住梗”才决定你能不能长久爱下去。你拥有很强的共情力与想象力，厌倦刻板的恋爱套路。最理想的关系，是两个人既像恋人，又像无话不谈的死党和冒险同伙。",
      strength:
        "极高的情绪包容度与思维趣味性。跟你在一起永远不会陷入死气沉沉的重复日常，你总能发现生活里好玩、荒诞又动人的角落。",
      blindspot:
        "有时太追求“精神同频与新鲜感”，在面对柴米油盐的琐碎责任或枯燥沟通时，容易产生轻微的逃避或倦怠。",
      bestMatches: [
        { id: "cat", reason: "既懂你的奇思妙想，又不会用琐碎控制欲把你绑住，堪称神仙搭子。" },
        { id: "spark", reason: "两个脑洞大开的人碰在一起，连买菜都能玩出电影感。" }
      ],
      growthMatch: {
        id: "harbor",
        reason: "对方更看重落地计划与日常安稳，记得偶尔配合一下 TA 的“确定感需求”。"
      },
      easterEggs: {
        bgm: "《City of Stars》—— 带点浪漫、自由和微光感",
        replyHabit: "消息常常从一条奇葩新闻聊到童年回忆，能瞬间歪楼八百米",
        quarrelOS: "刚吵完两句突然发现一个共同槽点，两个人忍不住同时笑场破功",
        dateScene: "午夜小众电影院、城市盲盒漫步、或者一起去学个奇怪的新手工"
      }
    },
    {
      id: "partner",
      code: "LP-06",
      name: "默契并肩同路人",
      en: "The Pragmatic Ally",
      emblem: "🧭",
      target: { intimacy: 32, romance: 24, rational: 84, devotion: 78, playful: 40, empathy: 36 },
      tags: ["少说多做", "并肩作战", "务实深情"],
      quote: "“我不擅长把爱挂在嘴边，但我人生每一张未来蓝图里都留好了你的位置。”",
      miniSummary: "恋爱对你不是消耗精力的表演，而是两个靠谱的人结成同盟，把生活越过越好。",
      traits:
        "你属于典型的“行动大于口号”派。在别人还在绞尽脑汁想土味情话时，你已经默默查好了路线、修好了坏掉的家电、算好了下个月的旅行预算。你看重效率、坦诚与共同成长，讨厌没来由的作闹和试探；一旦确认彼此同路，你的忠诚度和担当感非常惊人。",
      strength:
        "极其靠谱的“战友感”。无论人生走到哪个阶段——备考、转行、搬家还是见家长，有你在身旁就会瞬间稳下来。",
      blindspot:
        "有时候过于直男/直女式解决问题：伴侣其实只是想听你抱抱哄一句“好心疼”，你却立刻掏出三点改进建议，容易让人觉得少了一点温柔。",
      bestMatches: [
        { id: "cat", reason: "都不喜欢情绪内耗与无意义的折腾，效率高、尊重强，越处越稳。" },
        { id: "ocean", reason: "你不爱花哨但胜在实在，正好对上 TA 不图虚名只求长久的深情。" }
      ],
      growthMatch: {
        id: "dreamer",
        reason: "多给对方一点肉眼可见的小惊喜和口头夸奖，别让务实变成“看起来不够在乎”。"
      },
      easterEggs: {
        bgm: "《平凡之路》—— 沉稳、笃定、自有力量",
        replyHabit: "言简意赅高效率，但“到楼下了”“药买好了”出现频率极高",
        quarrelOS: "就事论事绝不翻旧账，解决完问题立刻恢复正常甚至比刚才更好",
        dateScene: "一起制定年度旅行清单、逛宜家、或者周末高效大扫除后吃顿烧烤"
      }
    },
    {
      id: "spark",
      code: "LP-07",
      name: "微醺心动捕捉手",
      en: "The Spark Chaser",
      emblem: "🥂",
      target: { intimacy: 70, romance: 78, rational: 24, devotion: 30, playful: 84, empathy: 42 },
      tags: ["气氛高手", "审美敏感", "上头很快"],
      quote: "“世界或许平平无奇，但与你对视那三秒，连路灯都替我们起雾。”",
      miniSummary: "你拥有极高的恋爱魅力与心动敏锐度，总能轻易制造让人脸红心跳的瞬间。",
      traits:
        "你是人群里很会制造“撩人氛围”的存在。眼神拉丝、接梗速度、微妙的肢体靠近、恰到好处的若即若离……你天生懂得爱情里那种“微微醉意”的魅力。你谈恋爱非常看重感觉与心动值，只要氛围到了，整个人会变得极其可爱热烈；但一旦觉得无趣或被敷衍，热度也会降得比较快。",
      strength:
        "极强的情绪张力与魅力指数，和你暧昧或热恋简直是一种艺术享受，永远不缺心动故事。",
      blindspot:
        "情绪容易大起大落，且对“新鲜感与反馈速度”很敏感，有时会把磨合期的正常降温误判为“不爱了”。",
      bestMatches: [
        { id: "harbor", reason: "只有足够稳定偏爱的人，才能让你彻底卸下不安、安心留在原地。" },
        { id: "explorer", reason: "两个高玩心玩家强强相遇，聊天永远接得住招，默契爆棚。" }
      ],
      growthMatch: {
        id: "ocean",
        reason: "对方慢热而内敛，你快热而敏锐，前期记得多给彼此一点解码时间。"
      },
      easterEggs: {
        bgm: "《Love Story》/ 爵士微醺情歌 —— 空气里都是粉红气泡",
        replyHabit: "看心情和氛围回复，兴致来了连发十几条语音，低落时只想被秒哄",
        quarrelOS: "嘴上傲娇说着“随你便”，其实手机一直握在手里看你什么时候回消息",
        dateScene: "微暗灯光的清吧、夜风吹拂的天台露台、或者深夜一起逛便利店"
      }
    },
    {
      id: "ocean",
      code: "LP-08",
      name: "慢热深海潜行者",
      en: "The Deep Ocean",
      emblem: "🌊",
      target: { intimacy: 48, romance: 52, rational: 60, devotion: 80, playful: 26, empathy: 84 },
      tags: ["外冷内热", "深度共情", "越爱越深"],
      quote: "“刚认识时我像安静的海岸线，等真正把心交给你，整片深海都是你的。”",
      miniSummary: "你不轻易交出真心，一旦跨越了慢热期的防线，你的深情与温柔几乎无人能及。",
      traits:
        "在陌生的暧昧期里，你往往显得克制、安静甚至有点被动，因为你害怕草率付出换来失望。但实际上你的内心世界极其丰沛细腻：你记得伴侣所有的偏好、心软于对方的每一次叹息、甚至愿意在很多人退缩的时候默默守在最底层撑住关系。你从不追求浅层热闹，只渴望一段真正深沉长久的链接。",
      strength:
        "顶级的“长情专一”与灵魂级共情力。很少有人比你更懂陪伴的重量，你给的爱沉静而厚重，能治愈伴侣许多隐秘的不安。",
      blindspot:
        "太容易把心事往深海里咽，不善于大声索取或直接撒娇，有时容易让粗心一点的伴侣根本没意识到你已经受了委屈。",
      bestMatches: [
        { id: "sunshine", reason: "TA 的直球热恋会一步步敲开你的心门，你们刚好一冷一热完美互补。" },
        { id: "partner", reason: "都不喜欢浮夸套路，在平静踏实的日子里互相看见彼此的深情。" }
      ],
      growthMatch: {
        id: "spark",
        reason: "对方需要即时的热闹回应与氛围刺激，你稳重的爱意要记得大声说出来让 TA 听见。"
      },
      easterEggs: {
        bgm: "《海底》之外的温柔钢琴曲 —— 安静却很有余韵",
        replyHabit: "不爱水群式闲聊，但只要是认真发来的长消息，你每句都会仔细接住",
        quarrelOS: "很少大喊大叫，难过时往往突然安静下来，最需要对方主动拉住你的手",
        dateScene: "人少的海边淡季民宿、深夜煮一锅热汤、或者两个人安静看一场烟火"
      }
    }
  ]
};

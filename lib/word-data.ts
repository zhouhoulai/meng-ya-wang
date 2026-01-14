import type { Word } from "./types"

export const PRESET_WORDS: Word[] = [
  // 数字类
  { id: "w001", word: "一个", pinyin: "yí gè", example: "我有一个苹果。" },
  { id: "w002", word: "两个", pinyin: "liǎng gè", example: "桌上有两个杯子。" },
  { id: "w003", word: "三天", pinyin: "sān tiān", example: "还有三天就放假了。" },
  { id: "w004", word: "四季", pinyin: "sì jì", example: "一年有四季。" },
  { id: "w005", word: "五颜六色", pinyin: "wǔ yán liù sè", example: "花园里五颜六色的花真美。" },

  // 方位类
  { id: "w006", word: "上面", pinyin: "shàng miàn", example: "书在桌子上面。" },
  { id: "w007", word: "下面", pinyin: "xià miàn", example: "小猫躲在床下面。" },
  { id: "w008", word: "左右", pinyin: "zuǒ yòu", example: "请看看左右两边。" },
  { id: "w009", word: "前后", pinyin: "qián hòu", example: "排队要前后站好。" },
  { id: "w010", word: "中间", pinyin: "zhōng jiān", example: "我坐在中间的位置。" },

  // 自然类
  { id: "w011", word: "太阳", pinyin: "tài yáng", example: "太阳从东边升起。" },
  { id: "w012", word: "月亮", pinyin: "yuè liang", example: "月亮弯弯像小船。" },
  { id: "w013", word: "星星", pinyin: "xīng xing", example: "天上有很多星星。" },
  { id: "w014", word: "白云", pinyin: "bái yún", example: "白云在天上飘。" },
  { id: "w015", word: "下雨", pinyin: "xià yǔ", example: "今天下雨了。" },
  { id: "w016", word: "大风", pinyin: "dà fēng", example: "外面刮大风了。" },
  { id: "w017", word: "高山", pinyin: "gāo shān", example: "远处有一座高山。" },
  { id: "w018", word: "河水", pinyin: "hé shuǐ", example: "河水清清的。" },
  { id: "w019", word: "大海", pinyin: "dà hǎi", example: "大海又大又蓝。" },
  { id: "w020", word: "土地", pinyin: "tǔ dì", example: "农民在土地上种菜。" },

  // 植物类
  { id: "w021", word: "花朵", pinyin: "huā duǒ", example: "花朵开得真美。" },
  { id: "w022", word: "小草", pinyin: "xiǎo cǎo", example: "小草绿油油的。" },
  { id: "w023", word: "大树", pinyin: "dà shù", example: "大树长得很高。" },
  { id: "w024", word: "树叶", pinyin: "shù yè", example: "秋天树叶变黄了。" },
  { id: "w025", word: "竹子", pinyin: "zhú zi", example: "熊猫爱吃竹子。" },
  { id: "w026", word: "水果", pinyin: "shuǐ guǒ", example: "我喜欢吃水果。" },
  { id: "w027", word: "苹果", pinyin: "píng guǒ", example: "苹果又红又甜。" },
  { id: "w028", word: "西瓜", pinyin: "xī guā", example: "夏天吃西瓜真凉快。" },

  // 动物类
  { id: "w029", word: "小鸟", pinyin: "xiǎo niǎo", example: "小鸟在树上唱歌。" },
  { id: "w030", word: "小鱼", pinyin: "xiǎo yú", example: "小鱼在水里游。" },
  { id: "w031", word: "小狗", pinyin: "xiǎo gǒu", example: "小狗是我的好朋友。" },
  { id: "w032", word: "小猫", pinyin: "xiǎo māo", example: "小猫喜欢玩毛线球。" },
  { id: "w033", word: "小鸡", pinyin: "xiǎo jī", example: "小鸡跟着妈妈走。" },
  { id: "w034", word: "小鸭", pinyin: "xiǎo yā", example: "小鸭在池塘里游泳。" },
  { id: "w035", word: "小羊", pinyin: "xiǎo yáng", example: "小羊在山坡上吃草。" },
  { id: "w036", word: "小牛", pinyin: "xiǎo niú", example: "小牛在田里帮忙。" },
  { id: "w037", word: "虫子", pinyin: "chóng zi", example: "小鸡爱吃虫子。" },

  // 人物称呼类
  { id: "w038", word: "爸爸", pinyin: "bà ba", example: "爸爸工作很辛苦。" },
  { id: "w039", word: "妈妈", pinyin: "mā ma", example: "妈妈做的饭真香。" },
  { id: "w040", word: "爷爷", pinyin: "yé ye", example: "爷爷给我讲故事。" },
  { id: "w041", word: "奶奶", pinyin: "nǎi nai", example: "奶奶很疼爱我。" },
  { id: "w042", word: "哥哥", pinyin: "gē ge", example: "哥哥带我去公园。" },
  { id: "w043", word: "姐姐", pinyin: "jiě jie", example: "姐姐教我写字。" },
  { id: "w044", word: "弟弟", pinyin: "dì di", example: "弟弟在玩玩具。" },
  { id: "w045", word: "妹妹", pinyin: "mèi mei", example: "妹妹笑得真甜。" },
  { id: "w046", word: "老师", pinyin: "lǎo shī", example: "老师教我们知识。" },
  { id: "w047", word: "同学", pinyin: "tóng xué", example: "同学们一起玩。" },
  { id: "w048", word: "朋友", pinyin: "péng you", example: "他是我的好朋友。" },

  // 身体类
  { id: "w049", word: "眼睛", pinyin: "yǎn jīng", example: "眼睛是心灵的窗户。" },
  { id: "w050", word: "耳朵", pinyin: "ěr duo", example: "耳朵能听声音。" },
  { id: "w051", word: "鼻子", pinyin: "bí zi", example: "鼻子能闻味道。" },
  { id: "w052", word: "嘴巴", pinyin: "zuǐ ba", example: "嘴巴能说话。" },
  { id: "w053", word: "小手", pinyin: "xiǎo shǒu", example: "小手真灵巧。" },
  { id: "w054", word: "脚丫", pinyin: "jiǎo yā", example: "脚丫踩在沙滩上。" },

  // 动作类
  { id: "w055", word: "看见", pinyin: "kàn jiàn", example: "我看见一只蝴蝶。" },
  { id: "w056", word: "听见", pinyin: "tīng jiàn", example: "我听见小鸟叫。" },
  { id: "w057", word: "说话", pinyin: "shuō huà", example: "上课不能说话。" },
  { id: "w058", word: "走路", pinyin: "zǒu lù", example: "小心走路。" },
  { id: "w059", word: "跑步", pinyin: "pǎo bù", example: "我喜欢跑步。" },
  { id: "w060", word: "跳舞", pinyin: "tiào wǔ", example: "姐姐在跳舞。" },
  { id: "w061", word: "唱歌", pinyin: "chàng gē", example: "小鸟在唱歌。" },
  { id: "w062", word: "画画", pinyin: "huà huà", example: "我喜欢画画。" },
  { id: "w063", word: "写字", pinyin: "xiě zì", example: "我在学写字。" },
  { id: "w064", word: "读书", pinyin: "dú shū", example: "我爱读书。" },
  { id: "w065", word: "吃饭", pinyin: "chī fàn", example: "该吃饭了。" },
  { id: "w066", word: "喝水", pinyin: "hē shuǐ", example: "多喝水身体好。" },
  { id: "w067", word: "睡觉", pinyin: "shuì jiào", example: "晚上要早点睡觉。" },
  { id: "w068", word: "起床", pinyin: "qǐ chuáng", example: "早上要早点起床。" },

  // 学习类
  { id: "w069", word: "学校", pinyin: "xué xiào", example: "我在学校上学。" },
  { id: "w070", word: "上学", pinyin: "shàng xué", example: "我每天上学。" },
  { id: "w071", word: "放学", pinyin: "fàng xué", example: "放学后我回家。" },
  { id: "w072", word: "上课", pinyin: "shàng kè", example: "上课要认真听讲。" },
  { id: "w073", word: "作业", pinyin: "zuò yè", example: "我做完作业了。" },
  { id: "w074", word: "书本", pinyin: "shū běn", example: "书本要爱护。" },
  { id: "w075", word: "铅笔", pinyin: "qiān bǐ", example: "铅笔要削尖。" },

  // 颜色类
  { id: "w076", word: "红色", pinyin: "hóng sè", example: "国旗是红色的。" },
  { id: "w077", word: "黄色", pinyin: "huáng sè", example: "香蕉是黄色的。" },
  { id: "w078", word: "蓝色", pinyin: "lán sè", example: "天空是蓝色的。" },
  { id: "w079", word: "绿色", pinyin: "lǜ sè", example: "树叶是绿色的。" },
  { id: "w080", word: "白色", pinyin: "bái sè", example: "白云是白色的。" },

  // 时间类
  { id: "w081", word: "今天", pinyin: "jīn tiān", example: "今天天气真好。" },
  { id: "w082", word: "明天", pinyin: "míng tiān", example: "明天我们去公园。" },
  { id: "w083", word: "昨天", pinyin: "zuó tiān", example: "昨天下雨了。" },
  { id: "w084", word: "早上", pinyin: "zǎo shang", example: "早上好！" },
  { id: "w085", word: "中午", pinyin: "zhōng wǔ", example: "中午吃什么？" },
  { id: "w086", word: "晚上", pinyin: "wǎn shang", example: "晚上月亮出来了。" },
  { id: "w087", word: "春天", pinyin: "chūn tiān", example: "春天花儿开了。" },
  { id: "w088", word: "夏天", pinyin: "xià tiān", example: "夏天很热。" },
  { id: "w089", word: "秋天", pinyin: "qiū tiān", example: "秋天落叶了。" },
  { id: "w090", word: "冬天", pinyin: "dōng tiān", example: "冬天下雪了。" },

  // 生活用品类
  { id: "w091", word: "桌子", pinyin: "zhuō zi", example: "书放在桌子上。" },
  { id: "w092", word: "椅子", pinyin: "yǐ zi", example: "请坐在椅子上。" },
  { id: "w093", word: "电视", pinyin: "diàn shì", example: "我在看电视。" },
  { id: "w094", word: "电话", pinyin: "diàn huà", example: "妈妈在打电话。" },
  { id: "w095", word: "衣服", pinyin: "yī fu", example: "我穿新衣服。" },
  { id: "w096", word: "鞋子", pinyin: "xié zi", example: "鞋子要放整齐。" },

  // 交通类
  { id: "w097", word: "汽车", pinyin: "qì chē", example: "汽车在路上跑。" },
  { id: "w098", word: "火车", pinyin: "huǒ chē", example: "火车跑得很快。" },
  { id: "w099", word: "飞机", pinyin: "fēi jī", example: "飞机在天上飞。" },
  { id: "w100", word: "自行车", pinyin: "zì xíng chē", example: "哥哥骑自行车。" },
]

const fs = require('fs');
const path = require('path');

function classifyChapter(questionText) {
    const questionLower = questionText.toLowerCase();

    // 职业道德
    if (questionLower.includes('职业道德') ||
        questionLower.includes('职业纪律') ||
        questionLower.includes('职业责任') ||
        questionLower.includes('爱岗敬业') ||
        questionLower.includes('职业守则') ||
        questionLower.includes('职业良心') ||
        questionLower.includes('职业作风')) {
        return "职业道德";
    }

    // 办公软件
    if (questionLower.includes('word') ||
        questionLower.includes('excel') ||
        questionLower.includes('powerpoint') ||
        questionLower.includes('快捷键') ||
        questionLower.includes('函数') ||
        questionLower.includes('五笔') ||
        questionLower.includes('输入法') ||
        questionLower.includes('浏览器') ||
        questionLower.includes('标签页') ||
        questionLower.includes('格式刷') ||
        questionLower.includes('样式') ||
        questionLower.includes('宏') ||
        questionLower.includes('工作簿')) {
        return "办公软件";
    }

    // 人工智能
    if (questionLower.includes('人工智能') ||
        questionLower.includes('机器学习') ||
        questionLower.includes('算法') ||
        questionLower.includes('模型') ||
        questionLower.includes('数据') ||
        questionLower.includes('标注') ||
        questionLower.includes('训练') ||
        questionLower.includes('神经网络') ||
        questionLower.includes('深度学习') ||
        questionLower.includes('预测') ||
        questionLower.includes('分类') ||
        questionLower.includes('聚类') ||
        questionLower.includes('特征') ||
        questionLower.includes('准确率') ||
        questionLower.includes('召回率')) {
        return "人工智能";
    }

    // 法律法规
    if (questionLower.includes('法律') ||
        questionLower.includes('法规') ||
        questionLower.includes('劳动法') ||
        questionLower.includes('安全法') ||
        questionLower.includes('专利') ||
        questionLower.includes('著作权') ||
        questionLower.includes('知识产权') ||
        questionLower.includes('劳动合同') ||
        questionLower.includes('网络') ||
        questionLower.includes('安全') ||
        questionLower.includes('侵权') ||
        questionLower.includes('权利') ||
        questionLower.includes('义务') ||
        questionLower.includes('规范') ||
        questionLower.includes('资质')) {
        return "法律法规";
    }

    // 计算机基础
    if (questionLower.includes('计算机') ||
        questionLower.includes('系统') ||
        questionLower.includes('网络') ||
        questionLower.includes('硬件') ||
        questionLower.includes('软件') ||
        questionLower.includes('操作系统') ||
        questionLower.includes('内存') ||
        questionLower.includes('cpu') ||
        questionLower.includes('存储') ||
        questionLower.includes('备份') ||
        questionLower.includes('维护') ||
        questionLower.includes('调试') ||
        questionLower.includes('代码')) {
        return "计算机基础";
    }

    // 默认分类
    return "计算机基础";
}

function finalFix() {
    const filePath = path.join(__dirname, '人工智能训练师单选题-章节版.html');

    console.log('正在进行最终修复...');

    // 读取文件
    let content = fs.readFileSync(filePath, 'utf8');

    // 找到数组开始位置（在 [ 后）
    const arrayStart = content.indexOf('[', content.indexOf('// ===================================================================================='));
    const arrayEnd = content.indexOf('];', arrayStart);

    if (arrayStart === -1 || arrayEnd === -1) {
        console.log('未找到数组位置');
        return;
    }

    // 提取数组内容
    let arrayContent = content.substring(arrayStart + 1, arrayEnd);

    // 清理格式
    arrayContent = arrayContent.trim();

    // 分割题目
    const questions = arrayContent.split('},').map(q => q.trim()).filter(q => q);

    const newQuestions = [];
    const chapterCounts = {
        '职业道德': 0,
        '办公软件': 0,
        '人工智能': 0,
        '法律法规': 0,
        '计算机基础': 0
    };

    questions.forEach((q, index) => {
        // 移除开头的 {
        let cleanQ = q.replace(/^\{/, '').trim();

        // 确保以 { 开头
        cleanQ = '{\n        ' + cleanQ;

        // 提取题目内容
        const questionMatch = cleanQ.match(/question:\s*"([^"]*)"/);
        if (questionMatch) {
            const questionText = questionMatch[1];
            const chapter = classifyChapter(questionText);

            // 更新计数
            chapterCounts[chapter]++;

            // 检查是否已有chapter字段
            if (!cleanQ.includes('chapter:')) {
                // 在answer后添加chapter
                const answerMatch = cleanQ.match(/answer:\s*(\d+)/);
                if (answerMatch) {
                    const answerEnd = cleanQ.indexOf(',', cleanQ.indexOf('answer:'));
                    if (answerEnd !== -1) {
                        cleanQ = cleanQ.substring(0, answerEnd) + ',\n        chapter: "' + chapter + '"' + cleanQ.substring(answerEnd);
                    }
                }
            } else {
                // 更新现有chapter字段
                cleanQ = cleanQ.replace(/chapter:\s*"([^"]*)"/, `chapter: "${chapter}"`);
            }

            // 添加适当的结尾
            cleanQ += '\n    }';
            if (index < questions.length - 1) {
                cleanQ += ',';
            }

            newQuestions.push(cleanQ);
        }
    });

    // 重建数组
    const newArrayContent = 'const questions = [\n    ' + newQuestions.join('\n    ') + '\n    ];';

    // 替换旧数组
    content = content.substring(0, arrayStart) + newArrayContent + content.substring(arrayEnd);

    // 添加章节数据统计
    const statsCode = `
    // 章节统计
    const chapterStats = {
        '职业道德': {count: ${chapterCounts['职业道德']}, percentage: ${(chapterCounts['职业道德']/302*100).toFixed(1)}%},
        '办公软件': {count: ${chapterCounts['办公软件']}, percentage: ${(chapterCounts['办公软件']/302*100).toFixed(1)}%},
        '人工智能': {count: ${chapterCounts['人工智能']}, percentage: ${(chapterCounts['人工智能']/302*100).toFixed(1)}%},
        '法律法规': {count: ${chapterCounts['法律法规']}, percentage: ${(chapterCounts['法律法规']/302*100).toFixed(1)}%},
        '计算机基础': {count: ${chapterCounts['计算机基础']}, percentage: ${(chapterCounts['计算机基础']/302*100).toFixed(1)}%}
    };
    `;

    // 插入统计代码
    const insertPos = content.indexOf('// 练习错题');
    if (insertPos !== -1) {
        content = content.substring(0, insertPos) + statsCode + '\n\n' + content.substring(insertPos);
    }

    // 写回文件
    fs.writeFileSync(filePath, content, 'utf8');

    console.log('最终修复完成！');
    console.log('\n各章节题目数量：');
    for (const [chapter, count] of Object.entries(chapterCounts)) {
        console.log(`${chapter}: ${count}题 (${(count/302*100).toFixed(1)}%)`);
    }
}

finalFix();
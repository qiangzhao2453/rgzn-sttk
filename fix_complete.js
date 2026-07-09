const fs = require('fs');
const path = require('path');

function classifyChapter(questionText) {
    const questionLower = questionText.toLowerCase();

    // 职业道德
    const moralityKeywords = ['职业道德', '职业纪律', '职业责任', '爱岗敬业', '职业守则', '职业良心', '职业作风', '职业理想', '职业要求'];
    if (moralityKeywords.some(keyword => questionLower.includes(keyword))) {
        return "职业道德";
    }

    // 办公软件
    const officeKeywords = ['word', 'excel', 'powerpoint', '快捷键', '函数', '五笔', '输入法', '系统', '小工具', '浏览器', '标签页', '格式刷', '样式', '宏', '工作簿', '工作表'];
    if (officeKeywords.some(keyword => questionLower.includes(keyword))) {
        return "办公软件";
    }

    // 人工智能
    const aiKeywords = ['人工智能', '机器学习', '算法', '模型', '数据', '标注', '训练', '神经网络', '深度学习', '预测', '分类', '聚类', '特征', '准确率', '召回率'];
    if (aiKeywords.some(keyword => questionLower.includes(keyword))) {
        return "人工智能";
    }

    // 法律法规
    const lawKeywords = ['法律', '法规', '劳动法', '安全法', '专利', '著作权', '知识产权', '劳动合同', '网络', '安全', '侵权', '权利', '义务', '规范', '标准', '资质'];
    if (lawKeywords.some(keyword => questionLower.includes(keyword))) {
        return "法律法规";
    }

    // 计算机基础
    const computerKeywords = ['计算机', '系统', '网络', '硬件', '软件', '操作系统', '内存', 'cpu', '存储', '备份', '维护', '调试', '代码', '编程'];
    if (computerKeywords.some(keyword => questionLower.includes(keyword))) {
        return "计算机基础";
    }

    // 默认分类
    return "计算机基础";
}

function fixComplete() {
    const filePath = path.join(__dirname, '人工智能训练师单选题-章节版.html');

    console.log('正在完整修复文件...');

    // 读取文件
    let content = fs.readFileSync(filePath, 'utf8');

    // 找到questions数组
    const arrayStart = content.indexOf('const questions = [');
    const arrayEnd = content.indexOf('];', arrayStart);

    if (arrayStart === -1 || arrayEnd === -1) {
        console.log('未找到questions数组');
        return;
    }

    // 提取数组内容
    let arrayContent = content.substring(arrayStart + 18, arrayEnd);

    // 清理格式
    arrayContent = arrayContent.replace(/\s*\[\s*/, '').replace(/\s*\]\s*/, '');
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

        // 提取题目内容
        const questionMatch = cleanQ.match(/question:\s*"([^"]*)"/);
        if (questionMatch) {
            const questionText = questionMatch[1];
            const chapter = classifyChapter(questionText);

            // 更新计数
            chapterCounts[chapter]++;

            // 如果已经有chapter字段，更新它；否则添加
            const chapterMatch = cleanQ.match(/chapter:\s*"([^"]*)"/);
            if (chapterMatch) {
                cleanQ = cleanQ.replace(/chapter:\s*"([^"]*)"/, `chapter: "${chapter}"`);
            } else {
                // 在answer后添加chapter
                const answerMatch = cleanQ.match(/answer:\s*(\d+)/);
                if (answerMatch) {
                    const answerPos = cleanQ.indexOf('answer:');
                    const answerEnd = cleanQ.indexOf(',', answerPos);
                    const afterAnswer = cleanQ.substring(answerEnd);
                    cleanQ = cleanQ.substring(0, answerEnd) + ',\n        chapter: "' + chapter + '"' + afterAnswer;
                }
            }

            // 添加适当的结尾
            if (index < questions.length - 1) {
                cleanQ = cleanQ + ',\n    }';
            } else {
                cleanQ = cleanQ + '\n    }';
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

    console.log('完整修复完成！');
    console.log('\n各章节题目数量：');
    for (const [chapter, count] of Object.entries(chapterCounts)) {
        console.log(`${chapter}: ${count}题 (${(count/302*100).toFixed(1)}%)`);
    }
}

fixComplete();
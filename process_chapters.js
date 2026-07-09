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

function processHtmlFile() {
    const filePath = path.join(__dirname, '人工智能训练师单选题-章节版.html');

    console.log('正在读取文件...');

    // 读取文件
    const content = fs.readFileSync(filePath, 'utf8');

    // 统计章节数量
    const chapterCounts = {
        '职业道德': 0,
        '办公软件': 0,
        '人工智能': 0,
        '法律法规': 0,
        '计算机基础': 0
    };

    // 使用正则表达式匹配每个题目
    const questionRegex = /{\s*question:\s*"([^"]*)"[^}]*answer:\s*(\d+)[^}]*\}/gs;
    let match;
    let questionIndex = 0;

    // 找到questions数组
    const arrayStart = content.indexOf('const questions = [');
    if (arrayStart === -1) {
        console.log('未找到questions数组');
        return;
    }

    const arrayEnd = content.indexOf('];', arrayStart);
    if (arrayEnd === -1) {
        console.log('未找到questions数组结束位置');
        return;
    }

    // 提取数组内容
    const arrayContent = content.substring(arrayStart + 18, arrayEnd);

    // 找到第一个题目
    const firstQuestionStart = arrayContent.indexOf('{');
    const lastQuestionEnd = arrayContent.lastIndexOf('}');

    if (firstQuestionStart === -1 || lastQuestionEnd === -1) {
        console.log('未找到题目');
        return;
    }

    const rawQuestionsText = arrayContent.substring(firstQuestionStart, lastQuestionEnd + 1);

    // 分割每个题目
    const questionTexts = rawQuestionsText.split('}').filter(q => q.trim() && q.trim() !== ',');

    // 处理每个题目
    const newQuestions = [];
    questionTexts.forEach((qText, index) => {
        let cleanText = qText.trim().replace(/,$/, '');

        // 提取题目内容
        const questionMatch = cleanText.match(/question:\s*"([^"]*)"/);
        if (questionMatch) {
            const questionText = questionMatch[1];
            const chapter = classifyChapter(questionText);

            // 更新章节数量
            chapterCounts[chapter]++;

            // 添加chapter字段
            const answerMatch = cleanText.match(/answer:\s*(\d+)/);
            if (answerMatch) {
                const answerPos = cleanText.indexOf('answer:');
                const answerEnd = cleanText.indexOf(',', answerPos);

                let beforeAnswer = cleanText.substring(0, answerEnd);
                let afterAnswer = cleanText.substring(answerEnd);

                if (!afterAnswer.startsWith(',') && !afterAnswer.startsWith('}')) {
                    afterAnswer = ',' + afterAnswer;
                }

                let newQText = beforeAnswer + ',\n        chapter: "' + chapter + '"' + afterAnswer;

                // 处理最后一个题目的结尾
                if (index === questionTexts.length - 1) {
                    newQText = newQText.replace(/,$/, '');
                }

                newQuestions.push(newQText);
            }
        }
    });

    // 重新构建数组
    const newArrayContent = '[\n    ' + newQuestions.join(',\n    ') + '\n    ];';

    // 更新内容
    const newContent = content.substring(0, arrayStart) + newArrayContent + content.substring(arrayEnd);

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
    const insertPos = newContent.indexOf('// 练习错题');
    if (insertPos !== -1) {
        const finalContent = newContent.substring(0, insertPos) + statsCode + '\n\n' + newContent.substring(insertPos);

        // 写回文件
        fs.writeFileSync(filePath, finalContent, 'utf8');

        console.log('章节分类完成！');
        console.log('\n各章节题目数量：');
        for (const [chapter, count] of Object.entries(chapterCounts)) {
            console.log(`${chapter}: ${count}题 (${(count/302*100).toFixed(1)}%)`);
        }
    } else {
        console.log('未找到插入统计代码的位置');
    }
}

processHtmlFile();
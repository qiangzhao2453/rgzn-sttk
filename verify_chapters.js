const fs = require('fs');
const path = require('path');

function verifyChapters() {
    const filePath = path.join(__dirname, '人工智能训练师单选题-章节版.html');

    console.log('正在验证章节分类...');

    // 读取文件
    const content = fs.readFileSync(filePath, 'utf8');

    // 找到questions数组
    const arrayStart = content.indexOf('const questions = [');
    const arrayEnd = content.indexOf('];', arrayStart);

    if (arrayStart === -1 || arrayEnd === -1) {
        console.log('未找到questions数组');
        return;
    }

    // 提取数组内容
    const arrayContent = content.substring(arrayStart + 18, arrayEnd);

    // 统计章节数量
    const chapterCounts = {
        '职业道德': 0,
        '办公软件': 0,
        '人工智能': 0,
        '法律法规': 0,
        '计算机基础': 0
    };

    // 查找所有chapter字段
    const chapterRegex = /chapter:\s*"([^"]*)"/g;
    let match;
    let totalQuestions = 0;

    while ((match = chapterRegex.exec(arrayContent)) !== null) {
        const chapter = match[1];
        if (chapterCounts.hasOwnProperty(chapter)) {
            chapterCounts[chapter]++;
        }
        totalQuestions++;
    }

    console.log(`总共找到 ${totalQuestions} 道题目有chapter字段`);
    console.log('\n各章节题目数量：');
    for (const [chapter, count] of Object.entries(chapterCounts)) {
        const percentage = (count / totalQuestions * 100).toFixed(1);
        console.log(`${chapter}: ${count}题 (${percentage}%)`);
    }

    // 检查章节数据统计代码是否存在
    const statsExists = content.includes('const chapterStats =');
    console.log(`\n章节统计代码${statsExists ? '已添加' : '未添加'}`);

    if (!statsExists) {
        // 添加章节数据统计
        const statsCode = `
    // 章节统计
    const chapterStats = {
        '职业道德': {count: ${chapterCounts['职业道德']}, percentage: ${(chapterCounts['职业道德']/totalQuestions*100).toFixed(1)}%},
        '办公软件': {count: ${chapterCounts['办公软件']}, percentage: ${(chapterCounts['办公软件']/totalQuestions*100).toFixed(1)}%},
        '人工智能': {count: ${chapterCounts['人工智能']}, percentage: ${(chapterCounts['人工智能']/totalQuestions*100).toFixed(1)}%},
        '法律法规': {count: ${chapterCounts['法律法规']}, percentage: ${(chapterCounts['法律法规']/totalQuestions*100).toFixed(1)}%},
        '计算机基础': {count: ${chapterCounts['计算机基础']}, percentage: ${(chapterCounts['计算机基础']/totalQuestions*100).toFixed(1)}%}
    };
    `;

        // 插入统计代码
        const insertPos = content.indexOf('// 练习错题');
        if (insertPos !== -1) {
            const newContent = content.substring(0, insertPos) + statsCode + '\n\n' + content.substring(insertPos);
            fs.writeFileSync(filePath, newContent, 'utf8');
            console.log('已添加章节统计代码');
        }
    }

    // 验证数组格式
    const hasProperFormat = arrayContent.includes('const questions = [' && '];');
    console.log(`\n数组格式${hasProperFormat ? '正确' : '不正确'}`);
}

verifyChapters();
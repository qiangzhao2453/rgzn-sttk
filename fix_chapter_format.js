const fs = require('fs');
const path = '人工智能训练师单选题-章节版.html';

// 读取HTML文件
const content = fs.readFileSync(path, 'utf8');

// 查找questions数组开始和结束位置
const questionsStart = content.indexOf('const questions = [');
const questionsEnd = content.indexOf('];', questionsStart) + 2;

if (questionsStart === -1 || questionsEnd === -1) {
    console.error('未找到questions数组');
    process.exit(1);
}

// 提取questions部分
const questionsContent = content.substring(questionsStart, questionsEnd);

// 修复缺少逗号的问题
const fixedContent = questionsContent
    .replace(/\},\s*\n\s*\{/g, '},\n    {')  // 确保对象之间有逗号
    .replace(/\}\s*\n\s*\{/g, '},\n    {')   // 处理换行符分隔的情况
    .replace(/}\s*,\s*\{/g, '},\n    {')     // 处理逗号的情况
    .replace(/}\s*,\s*\n\s*{/g, '},\n    {')  // 处理逗号+换行的情况
    .replace(/,\s*\n\s*\{/g, ',\n    {');    // 处理只有逗号的情况

// 重新构建完整内容
const newContent = content.substring(0, questionsStart) +
                   'const questions = [' +
                   fixedContent.substring(19, fixedContent.length - 2) +
                   '\n];' +
                   content.substring(questionsEnd);

// 验证JSON格式
try {
    const testQuestions = JSON.parse('[' + fixedContent.substring(19, fixedContent.length - 2) + '\n]');
    console.log(`成功修复！共修复 ${testQuestions.length} 道题目`);

    // 统计各章节题目数量
    const chapterStats = {};
    testQuestions.forEach(q => {
        chapterStats[q.chapter] = (chapterStats[q.chapter] || 0) + 1;
    });

    console.log('章节数量统计：');
    Object.entries(chapterStats).forEach(([chapter, count]) => {
        console.log(`  ${chapter}: ${count}题`);
    });

} catch (error) {
    console.error('JSON格式验证失败:', error.message);
    process.exit(1);
}

// 保存修复后的文件
fs.writeFileSync(path, newContent, 'utf8');
console.log('文件已保存: 人工智能训练师单选题-章节版.html');
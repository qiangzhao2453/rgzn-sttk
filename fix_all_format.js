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
let questionsContent = content.substring(questionsStart + 19, questionsEnd - 2); // 去掉 "const questions = [" 和 "];"

// 修复各种格式问题
console.log('开始修复格式...');

// 1. 修复缺少逗号的情况
let lines = questionsContent.split('\n');
let correctedLines = [];
let i = 0;

while (i < lines.length) {
    let line = lines[i];

    // 检查是否是题目对象开始（以 { 开头）
    if (line.trim() === '{') {
        correctedLines.push(line);

        // 收集对象的所有行
        let objectLines = [line];
        let j = i + 1;

        // 找到对象的结束
        while (j < lines.length && !lines[j].trim().endsWith('},') && !lines[j].trim().endsWith('}')) {
            objectLines.push(lines[j]);
            j++;
        }

        if (j < lines.length) {
            objectLines.push(lines[j]);

            // 检查最后一行是否以 }, 结束
            if (!lines[j].trim().endsWith('},')) {
                // 修复，添加逗号
                if (lines[j].trim().endsWith('}')) {
                    objectLines[objectLines.length - 1] = lines[j].replace('}', '},');
                }
            }

            // 将修复后的对象添加到结果
            correctedLines = correctedLines.concat(objectLines.slice(1));

            // 如果不是最后一个对象，添加逗号
            if (j < lines.length - 1) {
                correctedLines.push(','); // 添加逗号分隔符
            }

            i = j + 1;
        } else {
            i++;
        }
    } else {
        correctedLines.push(line);
        i++;
    }
}

// 重新组合内容
let fixedContent = correctedLines.join('\n');

// 清理多余的空行和格式
fixedContent = fixedContent
    .replace(/\n\s*\n\s*\n/g, '\n\n')  // 减少多余空行
    .replace(/,\s*\n\s*,/g, ',\n,')    // 修复连续逗号
    .replace(/\[\s*,/g, '[,');         // 修复数组开头

// 尝试解析验证
try {
    const testQuestions = JSON.parse('[' + fixedContent + ']');
    console.log(`成功修复！共修复 ${testQuestions.length} 道题目`);

    // 统计各章节题目数量
    const chapterStats = {};
    testQuestions.forEach((q, index) => {
        if (!q.question) {
            console.log(`警告：第${index + 1}个题目缺少question字段`);
        }
        chapterStats[q.chapter] = (chapterStats[q.chapter] || 0) + 1;
    });

    console.log('\n章节数量统计：');
    Object.entries(chapterStats)
        .sort((a, b) => b[1] - a[1])
        .forEach(([chapter, count]) => {
            console.log(`  ${chapter}: ${count}题`);
        });

} catch (error) {
    console.error('JSON格式验证失败:', error.message);
    console.error('错误位置:', error.message.match(/position (\d+)/)?.[1]);

    // 保存中间结果供调试
    fs.writeFileSync('debug_questions.json', '[' + fixedContent + ']', 'utf8');
    console.log('已保存调试文件: debug_questions.json');
    process.exit(1);
}

// 重新构建完整内容
const newContent = content.substring(0, questionsStart) +
                   'const questions = [' +
                   fixedContent +
                   '\n];' +
                   content.substring(questionsEnd);

// 保存修复后的文件
fs.writeFileSync(path, newContent, 'utf8');
console.log('\n文件已保存: 人工智能训练师单选题-章节版.html');
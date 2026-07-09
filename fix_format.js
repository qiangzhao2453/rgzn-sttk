const fs = require('fs');
const path = require('path');

function fixHtmlFormat() {
    const filePath = path.join(__dirname, '人工智能训练师单选题-章节版.html');

    console.log('正在修复格式问题...');

    // 读取文件
    let content = fs.readFileSync(filePath, 'utf8');

    // 修复分隔符问题
    content = content.replace(/},\s*\n\s*,\s*\n\s*{/g, '},\n\n    {');
    content = content.replace(/},\s*\n\s*,/g, '},\n    ,');
    content = content.replace(/,\s*\n\s*}\s*;/g, '\n    };');

    // 确保每个对象以 { 开头和 } 结尾
    content = content.replace(/,\s*\n\s*([a-zA-Z_])/g, ',\n        $1');
    content = content.replace(/\{\s*question:/g, '{\n        question:');

    // 修复可能的语法错误
    content = content.replace(/}\s*,\s*}/g, '},\n    }');

    // 检查并修复最后的数组
    const arrayEnd = content.indexOf('];');
    if (arrayEnd !== -1) {
        const beforeEnd = content.substring(0, arrayEnd);
        const lastBrace = beforeEnd.lastIndexOf('}');

        if (lastBrace !== -1) {
            const lastQuestion = beforeEnd.substring(lastBrace);
            if (lastQuestion.includes('chapter:') && !lastQuestion.includes('explanation:')) {
                // 确保最后一个题目有正确的结构
                content = beforeEnd.substring(0, lastBrace) +
                         lastQuestion.replace(/\}$/, ',\n        explanation: ""\n    }');
            }
        }
    }

    // 写回文件
    fs.writeFileSync(filePath, content, 'utf8');

    console.log('格式修复完成！');
}

fixHtmlFormat();
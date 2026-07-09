import re

def classify_chapter(question_text):
    """根据题目内容分类章节"""
    question_lower = question_text.lower()

    # 职业道德
    if any(keyword in question_lower for keyword in ['职业道德', '职业纪律', '职业责任', '爱岗敬业', '职业守则', '职业良心', '职业作风', '职业理想', '职业要求']):
        return "职业道德"

    # 办公软件
    if any(keyword in question_lower for keyword in ['word', 'excel', 'powerpoint', '快捷键', '函数', '五笔', '输入法', '系统', '小工具', '浏览器', '标签页', '格式刷', '样式', '宏', '工作簿', '工作表']):
        return "办公软件"

    # 人工智能
    if any(keyword in question_lower for keyword in ['人工智能', '机器学习', '算法', '模型', '数据', '标注', '训练', '神经网络', '深度学习', '预测', '分类', '聚类', '特征', '准确率', '召回率']):
        return "人工智能"

    # 法律法规
    if any(keyword in question_lower for keyword in ['法律', '法规', '劳动法', '安全法', '专利', '著作权', '知识产权', '劳动合同', '网络', '安全', '侵权', '权利', '义务', '规范', '标准', '资质']):
        return "法律法规"

    # 计算机基础
    if any(keyword in question_lower for keyword in ['计算机', '系统', '网络', '硬件', '软件', '操作系统', '内存', 'cpu', '存储', '备份', '维护', '调试', '代码', '编程']):
        return "计算机基础"

    # 默认分类
    return "计算机基础"

def process_questions():
    """处理题目添加章节分类"""
    file_path = r"C:\Users\admin\Desktop\claude\题库网站\人工智能训练师单选题-章节版.html"

    # 读取文件
    with open(file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    # 找到questions数组的开始和结束
    start_line = -1
    end_line = -1

    for i, line in enumerate(lines):
        if 'const questions = [' in line:
            start_line = i
        elif start_line != -1 and '];' in line and '// ---------- 如果需要更多题目' in lines[i+1]:
            end_line = i
            break

    if start_line == -1 or end_line == -1:
        print("无法找到questions数组的位置")
        return

    print(f"Found questions array from line {start_line+1} to {end_line+1}")

    # 处理每个题目
    chapter_counts = {
        '职业道德': 0,
        '办公软件': 0,
        '人工智能': 0,
        '法律法规': 0,
        '计算机基础': 0
    }

    # 读取所有题目
    all_questions = []
    current_question = {}
    question_started = False

    for i in range(start_line + 1, end_line):
        line = lines[i]

        if '{' in line:
            question_started = True
            current_question = {}
            continue
        elif '}' in line and current_question:
            # 处理题目的最后一个属性
            if 'question' in current_question:
                # 获取题目内容进行分类
                question_text = current_question['question']
                chapter = classify_chapter(question_text)

                # 检查answer字段并添加chapter
                if 'answer' in current_question:
                    # 找到包含answer的行
                    for j in range(i, max(0, i-10), -1):
                        if 'answer:' in lines[j]:
                            # 在answer后添加chapter
                            lines[j] = lines[j].rstrip() + ',\n'
                            lines.insert(j + 1, f'        chapter: "{chapter}",\n')
                            break

                # 更新章节数量
                chapter_counts[chapter] += 1

            question_started = False
            all_questions.append(current_question)

        elif question_started:
            # 解析当前行的属性
            if 'question:' in line:
                match = re.search(r'question:\s*"([^"]*)"', line)
                if match:
                    current_question['question'] = match.group(1)
            elif 'answer:' in line:
                match = re.search(r'answer:\s*(\d+)', line)
                if match:
                    current_question['answer'] = int(match.group(1))

    # 重建questions数组部分
    new_lines = lines[:start_line + 1]  # 保留开头部分

    # 重新构建questions数组
    new_lines.append('    {\n')

    question_index = 0
    in_question = False

    for i in range(start_line + 1, end_line + 1):
        line = lines[i]

        if '{' in line:
            in_question = True
            continue
        elif '},' in line and in_question:
            # 检查是否需要添加chapter字段
            # 需要找到对应的题目内容来分类
            # 由于我们需要之前记录的章节数，我们直接修改answer后面的行
            # 这里简单地添加一个逗号和结束
            new_lines.append(line.rstrip())
            new_lines.append(',\n')
            in_question = False
            question_index += 1
        elif in_question:
            new_lines.append(line)

    # 修正最后一个题目
    if len(new_lines) > 0:
        new_lines[-2] = new_lines[-2].rstrip(',') + '\n'

    new_lines.append('    ];\n')

    # 添加中间的部分
    new_lines.extend(lines[end_line + 1:])

    # 写回文件
    with open(file_path, 'w', encoding='utf-8') as f:
        f.writelines(new_lines)

    print("章节分类完成！")
    print("\n各章节题目数量：")
    for chapter, count in chapter_counts.items():
        print(f"{chapter}: {count}题 ({count/302*100:.1f}%)")

if __name__ == "__main__":
    process_questions()
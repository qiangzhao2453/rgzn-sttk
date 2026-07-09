import re
import sys

def classify_chapter(question_text):
    """根据题目内容分类章节"""
    question_lower = question_text.lower()

    # 职业道德
   职业道德关键词 = ['职业道德', '职业纪律', '职业责任', '爱岗敬业', '职业守则', '职业良心', '职业作风', '职业理想', '职业要求']
    if any(keyword in question_lower for keyword in 职业道德关键词):
        return "职业道德"

    # 办公软件
    办公软件关键词 = ['word', 'excel', 'powerpoint', '快捷键', '函数', '五笔', '输入法', '系统', '小工具', '浏览器', '标签页', '格式刷', '样式', '宏', '工作簿', '工作表']
    if any(keyword in question_lower for keyword in 办公软件关键词):
        return "办公软件"

    # 人工智能
    人工智能关键词 = ['人工智能', '机器学习', '算法', '模型', '数据', '标注', '训练', '神经网络', '深度学习', '预测', '分类', '聚类', '特征', '准确率', '召回率']
    if any(keyword in question_lower for keyword in 人工智能关键词):
        return "人工智能"

    # 法律法规
    法律法规关键词 = ['法律', '法规', '劳动法', '安全法', '专利', '著作权', '知识产权', '劳动合同', '网络', '安全', '侵权', '权利', '义务', '规范', '标准', '资质']
    if any(keyword in question_lower for keyword in 法律法规关键词):
        return "法律法规"

    # 计算机基础
    计算机基础关键词 = ['计算机', '系统', '网络', '硬件', '软件', '操作系统', '内存', 'cpu', '存储', '备份', '维护', '调试', '代码', '编程']
    if any(keyword in question_lower for keyword in 计算机基础关键词):
        return "计算机基础"

    # 默认分类
    return "计算机基础"

def process_html_file():
    """处理HTML文件添加章节分类"""
    file_path = r"C:\Users\admin\Desktop\claude\题库网站\人工智能训练师单选题-章节版.html"

    print("正在读取文件...")

    # 读取整个文件
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # 统计章节数量
    chapter_counts = {
        '职业道德': 0,
        '办公软件': 0,
        '人工智能': 0,
        '法律法规': 0,
        '计算机基础': 0
    }

    # 使用正则表达式匹配每个题目
    # 匹配从 { 到 } 的整个题目对象
    question_pattern = re.compile(r'\{\s*question:\s*"([^"]*)"[^}]*answer:\s*(\d+)[^}]*\}', re.DOTALL)

    # 找到所有题目
    questions = question_pattern.findall(content)
    print(f"找到 {len(questions)} 个题目")

    # 找到数组开始位置
    array_start = content.find('const questions = [')
    if array_start == -1:
        print("未找到questions数组")
        return

    # 找到数组结束位置
    array_end = content.find('];', array_start)
    if array_end == -1:
        print("未找到questions数组结束位置")
        return

    # 提取数组内容
    array_content = content[array_start + len('const questions = ['):array_end]

    # 找到第一个题目开始
    first_question_start = array_content.find('{')
    if first_question_start == -1:
        print("未找到第一个题目")
        return

    # 找到最后一个题目结束
    last_question_end = array_content.rfind('}')

    # 获取原始题目文本（不包括数组头尾）
    raw_questions_text = array_content[first_question_start:last_question_end + 1]

    # 将每个题目分割
    # 先按 } 分割，然后去掉空项
    raw_questions = [q.strip() for q in raw_questions_text.split('}') if q.strip()]

    # 处理每个题目
    new_questions = []
    for q_text in raw_questions:
        if not q_text or q_text == ',':
            continue

        # 移除可能的逗号
        q_text = q_text.rstrip(',').strip()

        # 提取题目内容
        q_match = re.search(r'question:\s*"([^"]*)"', q_text, re.DOTALL)
        if q_match:
            question_text = q_match.group(1)
            chapter = classify_chapter(question_text)

            # 更新章节数量
            chapter_counts[chapter] += 1

            # 添加chapter字段
            # 找到answer字段的位置
            answer_pos = q_text.find('answer:')
            if answer_pos != -1:
                # 找到answer行的结束
                answer_end = q_text.find(',', answer_pos)
                if answer_end == -1:
                    answer_end = q_text.find('}', answer_pos)

                # 在answer后插入chapter
                before_answer = q_text[:answer_end]
                after_answer = q_text[answer_end:]

                # 确保后面有逗号
                if after_answer and after_answer[0] != ',' and after_answer[0] != '}':
                    after_answer = ',' + after_answer

                new_q_text = before_answer + ',\n        chapter: "' + chapter + '"' + after_answer
            else:
                new_q_text = q_text.rstrip() + ',\n        chapter: "' + chapter + '"}'

            # 如果这是最后一个题目，去掉最后的逗号
            if q == raw_questions[-1]:
                new_q_text = new_q_text.rstrip(',')
                if new_q_text.endswith(','):
                    new_q_text = new_q_text[:-1]

            new_questions.append(new_q_text)

    # 重新构建数组
    new_array_content = '[\n    ' + ',\n    '.join(new_questions) + '\n    ];'

    # 更新内容
    new_content = content[:array_start] + new_array_content + content[array_end:]

    # 添加章节数据统计
    stats_code = f'''
    // 章节统计
    const chapterStats = {{
        '职业道德': {{count: {chapter_counts['职业道德']}, percentage: {chapter_counts['职业道德']/302*100:.1f}%}},
        '办公软件': {{count: {chapter_counts['办公软件']}, percentage: {chapter_counts['办公软件']/302*100:.1f}%}},
        '人工智能': {{count: {chapter_counts['人工智能']}, percentage: {chapter_counts['人工智能']/302*100:.1f}%}},
        '法律法规': {{count: {chapter_counts['法律法规']}, percentage: {chapter_counts['法律法规']/302*100:.1f}%}},
        '计算机基础': {{count: {chapter_counts['计算机基础']}, percentage: {chapter_counts['计算机基础']/302*100:.1f}%}}
    }};
    '''

    # 插入统计代码
    insert_pos = new_content.find('// 练习错题')
    if insert_pos != -1:
        new_content = new_content[:insert_pos] + stats_code + '\n\n' + new_content[insert_pos:]

    # 写回文件
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(new_content)

    print("章节分类完成！")
    print("\n各章节题目数量：")
    for chapter, count in chapter_counts.items():
        print(f"{chapter}: {count}题 ({count/302*100:.1f}%)")

if __name__ == "__main__":
    process_html_file()
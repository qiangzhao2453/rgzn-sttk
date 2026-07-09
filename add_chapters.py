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

def add_chapters_to_html():
    """读取HTML文件，为每个题目添加chapter字段"""
    file_path = r"C:\Users\admin\Desktop\claude\题库网站\人工智能训练师单选题-章节版.html"

    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # 找到questions数组的开始和结束
    start_pattern = r'const questions = \['
    end_pattern = r'\];\s*\n\s*// ---------- 如果需要更多题目'

    start_match = re.search(start_pattern, content)
    end_match = re.search(end_pattern, content)

    if not start_match or not end_match:
        print("无法找到questions数组的位置")
        return

    start_pos = start_match.start()
    end_pos = end_match.start()

    # 提取原始questions部分
    questions_part = content[start_pos:end_pos]

    # 按题目对象分割
    questions = re.split(r'},\s*\n\s*{', questions_part)
    questions[0] = questions[0].replace('const questions = [', '')  # 移除开始标记
    questions[-1] = questions[-1].replace(']', '')  # 移除结束标记

    # 处理每个题目
    chapter_counts = {
        '职业道德': 0,
        '办公软件': 0,
        '人工智能': 0,
        '法律法规': 0,
        '计算机基础': 0
    }

    processed_questions = []

    for i, question in enumerate(questions):
        # 提取题目内容
        question_match = re.search(r'question:\s*"([^"]*)"', question)
        if question_match:
            question_text = question_match.group(1)
            chapter = classify_chapter(question_text)

            # 更新章节计数
            if chapter in chapter_counts:
                chapter_counts[chapter] += 1

            # 在answer字段后添加chapter字段
            new_question = question.replace(
                f'answer: {re.search(r"answer:\s*(\d+)", question).group(1)},',
                f'answer: {re.search(r"answer:\s*(\d+)", question).group(1)},\n        chapter: "{chapter}",'
            )

            # 添加逗号分隔（如果不是最后一个）
            if i < len(questions) - 1:
                new_question = new_question.rstrip() + ','

            processed_questions.append(new_question)

    # 重新构建questions部分
    new_questions_part = '[\n    ' + ',\n    '.join(processed_questions) + '\n    ];'

    # 更新HTML内容
    new_content = content[:start_pos] + new_questions_part + content[end_pos:]

    # 更新章节数量统计
    stats_update = '''
    // 章节统计
    const chapterStats = {
        '职业道德': {count: {职业道德}, percentage: {职业道德_percent}%},
        '办公软件': {count: {办公软件}, percentage: {办公软件_percent}%},
        '人工智能': {count: {人工智能}, percentage: {人工智能_percent}%},
        '法律法规': {count: {法律法规}, percentage: {法律法规_percent}%},
        '计算机基础': {count: {计算机基础}, percentage: {计算机基础_percent}%}
    };
    '''.format(
        职业道德=chapter_counts['职业道德'],
        办公软件=chapter_counts['办公软件'],
        人工智能=chapter_counts['人工智能'],
        法律法规=chapter_counts['法律法规'],
        计算机基础=chapter_counts['计算机基础'],
        职业道德_percent=round(chapter_counts['职业道德']/3.02, 1),
        办公软件_percent=round(chapter_counts['办公软件']/3.02, 1),
        人工智能_percent=round(chapter_counts['人工智能']/3.02, 1),
        法律法规_percent=round(chapter_counts['法律法规']/3.02, 1),
        计算机基础_percent=round(chapter_counts['计算机基础']/3.02, 1)
    )

    # 找到合适的位置插入章节统计
    stats_insert_pos = new_content.find('    // 练习错题')
    if stats_insert_pos != -1:
        new_content = new_content[:stats_insert_pos] + stats_update + '\n' + new_content[stats_insert_pos:]

    # 保存更新后的文件
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(new_content)

    # 打印分类结果
    print("章节分类完成！")
    print("\n各章节题目数量：")
    for chapter, count in chapter_counts.items():
        print(f"{chapter}: {count}题 ({count/3.02:.1f}%)")

if __name__ == "__main__":
    add_chapters_to_html()
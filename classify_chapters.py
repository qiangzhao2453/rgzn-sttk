#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
题库章节分类脚本
为302道题目添加章节分类
"""

import re

def classify_question(question_text):
    """根据题目内容自动分类"""
    text = question_text.lower()

    # 职业道德类
    if any(keyword in text for keyword in ['职业道德', '职业纪律', '职业责任', '职业守则',
                                          '爱岗敬业', '诚实守信', '职业良心', '保密']):
        return "职业道德"

    # 办公软件类
    if any(keyword in text for keyword in ['word', 'excel', 'powerpoint', 'ppt', '办公软件',
                                          '快捷键', '函数', '图表', '格式', '数据透视表']):
        return "办公软件"

    # 人工智能类
    if any(keyword in text for keyword in ['人工智能', 'ai', '机器学习', '深度学习',
                                          '神经网络', '数据挖掘', '算法', '模型']):
        return "人工智能"

    # 法律法规类
    if any(keyword in text for keyword in ['法律', '法规', '合同', '劳动法', '安全法',
                                          '隐私保护', '数据安全']):
        return "法律法规"

    # 计算机基础类
    if any(keyword in text for keyword in ['计算机', '系统', '网络', '操作系统', '软件',
                                          '硬件', '内存', 'cpu', '文件', '目录']):
        return "计算机基础"

    # 默认分类
    return "职业道德"

def process_questions_file():
    """处理HTML文件，添加章节分类"""
    file_path = "人工智能训练师单选题-章节版.html"

    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # 找到questions数组的开始位置
    start_match = re.search(r'const questions = \[', content)
    if not start_match:
        print("未找到questions数组")
        return

    start_pos = start_match.start()

    # 找到第一个题目的开始位置
    first_question_match = re.search(r'{\s*question:\s*', content[start_pos:])
    if not first_question_match:
        print("未找到第一个题目")
        return

    first_question_pos = start_pos + first_question_match.start()
    question_text_match = re.search(r'question:\s*"([^"]+)"', content[first_question_pos:])
    if not question_text_match:
        print("未找到题目文本")
        return

    # 现在我们手动处理每个题目
    lines = content.split('\n')
    in_questions = False
    question_count = 0
    chapter_stats = {
        "全部": 0,
        "职业道德": 0,
        "办公软件": 0,
        "人工智能": 0,
        "法律法规": 0,
        "计算机基础": 0
    }

    # 逐行处理
    output_lines = []
    i = 0
    while i < len(lines):
        line = lines[i]
        output_lines.append(line)

        if 'const questions = [' in line:
            in_questions = True
            i += 1
            continue

        if in_questions and '{' in line and 'question:' not in line:
            # 这是下一个题目，跳过
            i += 1
            continue

        if in_questions and 'question:' in line:
            # 找到题目文本
            question_match = re.search(r'question:\s*"([^"]+)"', line)
            if question_match:
                question_text = question_match.group(1)
                chapter = classify_question(question_text)
                chapter_stats[chapter] += 1
                chapter_stats["全部"] += 1
                question_count += 1
                print(f"处理题目 {question_count}: {chapter}")

                # 找到当前题目的结束位置
                j = i
                in_question = True
                brace_count = line.count('{') - line.count('}')

                while j < len(lines) and (in_question or brace_count > 0):
                    if j > i:
                        brace_count += lines[j].count('{') - lines[j].count('}')
                        if brace_count == 0 and '},' in lines[j]:
                            # 找到题目的结束
                            break
                    j += 1

                # 在answer后添加chapter字段
                found_answer = False
                k = i
                while k <= j:
                    if 'answer:' in lines[k] and not found_answer:
                        # 在这行后面添加chapter
                        indent = ' ' * (len(lines[k]) - len(lines[k].lstrip()))
                        lines.insert(k + 1, f'{indent}        chapter: "{chapter}",')
                        found_answer = True
                        break
                    k += 1

                # 如果没找到answer，在explanation后添加
                if not found_answer:
                    k = i
                    while k <= j:
                        if 'explanation:' in lines[k]:
                            indent = ' ' * (len(lines[k]) - len(lines[k].lstrip()))
                            lines.insert(k + 1, f'{indent}        chapter: "{chapter}",')
                            break
                        k += 1

                i = j
        i += 1

    # 重新构建内容
    new_content = '\n'.join(lines)

    # 更新HTML中的统计数字
    new_content = new_content.replace(
        'id="allCount">0',
        f'id="allCount">{chapter_stats["全部"]}'
    )
    new_content = new_content.replace(
        'id="道德Count">0',
        f'id="道德Count">{chapter_stats["职业道德"]}'
    )
    new_content = new_content.replace(
        'id="办公Count">0',
        f'id="办公Count">{chapter_stats["办公软件"]}'
    )
    new_content = new_content.replace(
        'id="AICount">0',
        f'id="AICount">{chapter_stats["人工智能"]}'
    )
    new_content = new_content.replace(
        'id="法律Count">0',
        f'id="法律Count">{chapter_stats["法律法规"]}'
    )
    new_content = new_content.replace(
        'id="基础Count">0',
        f'id="基础Count">{chapter_stats["计算机基础"]}'
    )

    # 保存新文件
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(new_content)

    print(f"\n章节分类完成！")
    print("章节数量统计：")
    for chapter, count in chapter_stats.items():
        print(f"  {chapter}: {count}题")

if __name__ == "__main__":
    process_questions_file()
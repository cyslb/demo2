# -*- coding: utf-8 -*-
import json
import sys

# 检查Python版本
if sys.version_info[0] < 3:
    # Python 2
    import codecs
    
    # 读取CSV文件
    with codecs.open('douyin.csv', 'r', 'utf-8') as csv_file:
        # 读取所有行
        lines = csv_file.readlines()
        
        # 获取表头
        headers = lines[0].strip().split(',')
        
        # 初始化数据列表
        data = []
        
        # 处理每一行数据
        for line in lines[1:]:
            # 分割行数据
            values = line.strip().split(',')
            
            # 创建字典
            item = {}
            for i in range(len(headers)):
                item[headers[i]] = values[i]
            
            # 添加到数据列表
            data.append(item)

    # 将数据写入JSON文件
    with codecs.open('douyin.json', 'w', 'utf-8') as json_file:
        # 写入JSON数据，使用indent参数使JSON文件更易读
        json.dump(data, json_file, ensure_ascii=False, indent=2)
else:
    # Python 3
    import csv
    
    # 读取CSV文件
    with open('douyin.csv', 'r', encoding='utf-8') as csv_file:
        # 创建CSV读取器
        csv_reader = csv.DictReader(csv_file)
        
        # 将CSV数据转换为列表
        data = list(csv_reader)

    # 将数据写入JSON文件
    with open('douyin.json', 'w', encoding='utf-8') as json_file:
        # 写入JSON数据，使用indent参数使JSON文件更易读
        json.dump(data, json_file, ensure_ascii=False, indent=2)

print('CSV文件已成功转换为JSON文件！')
---
title: "Git 分支：一次小实验也值得隔离"
date: "2026-09-20 00:00:00"
slug: "git-small-experiments"
permalink: "posts/git-small-experiments/"
summary: "把尝试放进单独分支，能让临时方案更容易比较、回退，也更放心地试错。"
read: "3 分钟"
layout: post
tags:
  - "Git"
  - "工具"
---
不确定的重构、依赖升级，甚至只是一个样式方向，都可以先放进独立分支。这样主线保持稳定，实验结果也能通过提交记录被清楚地审视。

## 一个简单流程

```
git switch -c experiment/idea
# 完成尝试后检查变更
git diff
# 保留成果或回到主线
```

如果实验值得保留，就用清晰的提交说明保存它；如果不合适，切回主分支即可。分支的创建成本很低，心理负担也会因此小很多。

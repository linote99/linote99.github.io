---
title: "Lino迷你输入法：一款轻量离线的 Android 拼音输入法"
date: 2026-10-14 22:00:00
description: "介绍 Lino迷你输入法 1.0.5 的离线中文拼音、英文前缀候选、符号页和键盘更新。"
summary: "介绍 Lino迷你输入法 1.0.5 的离线中文拼音、英文前缀候选、符号页和键盘更新。"
categories:
  - 工具
tags:
  - Android
  - 输入法
slug: "lino-mini-pinyin-ime"
permalink: "posts/lino-mini-pinyin-ime/"
layout: post
---

# Lino迷你输入法：一款轻量离线的 Android 拼音输入法

我做了一个小巧的 Android 拼音输入法，叫 **Lino迷你输入法**。它希望把常用中文拼音、英文、数字和标点放在一个简单的键盘里：不依赖云端候选，也不需要大型语言模型。

## 中文拼音与常用候选

在中文模式下输入拼音，候选词由设备本地词典查找。词典里约有 44,300 条候选词条，除了拼音候选，也提供一小组常见词语联想。它的定位是轻量、离线和够用；词库规模与候选能力并不追求替代大型输入法。

## 英文前缀候选

英文模式新增约 5,000 词的离线核心词库。输入英文前缀时，键盘按词频提供候选；点选候选即可替换当前已输入的前缀。

## 中英文、数字与标点

键盘上的「中/英」可切换输入模式，当前模式会在键盘上突出显示。英文模式支持 Shift 大小写；「符号」和「123」可以切换到数字与常用符号页面，符号页可通过 `#+=` 切换。回车键里的 `↵` 字形更大，但按键尺寸和键盘布局保持不变。

## 离线处理与词库说明

应用清单没有声明联网权限，拼音候选由本机词典处理。中文词库来源于万象词库（RIME-LMDG，amzxyz），经 [Ipseamor/rime_wanxiang](https://github.com/Ipseamor/rime_wanxiang) 项目收录。应用筛选其中的 `chars` 单字表和 `base` 2–3 字基础词库（上游权重不低于 500），再统一简体、去除声调、合并音节并转换为应用格式；没有包含扩展词库或语言模型。该修改版不代表上游背书。中文词库数据采用 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)。

英文核心词库改编自 Allison Parrish 的 [wordfreq 英文 25,000 词频表](https://github.com/aparrish/wordfreq-en-25000)，基于 Robyn Speer 的 [wordfreq](https://github.com/rspeer/wordfreq) 数据。应用筛选词频顺序靠前的 5,000 个唯一字母/撇号词项，统一小写并转换为本地列表，用于离线前缀候选。修改后的英文词库数据采用 [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/)；详细来源和修改说明见 GitHub 仓库的 [THIRD_PARTY_NOTICES.md](https://github.com/linote99/linote-pinyin-ime/blob/main/THIRD_PARTY_NOTICES.md)。

应用自身源码采用 MIT License；这与中文词库的 CC BY 4.0、英文词库的 CC BY-SA 4.0 分别适用。

## 安装与使用

初次使用时，在 Android 系统设置中启用「Lino迷你输入法」，然后从输入法选择器切换到它。不同品牌手机的设置菜单名称可能不同。

**下载：** [下载 v1.0.5（GitHub Releases）](https://github.com/linote99/linote-pinyin-ime/releases/tag/v1.0.5)。

## 当前状态

当前版本为 **1.0.5**。中文词库较小，候选覆盖和联想能力仍有限；欢迎反馈具体的机型与输入问题。

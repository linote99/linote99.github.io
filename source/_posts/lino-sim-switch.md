---
title: "Lino SIM Switch：让 UFI 随身 Wi-Fi 按单卡或双卡启动"
date: "2026-11-21 00:00:00"
slug: "lino-sim-switch"
permalink: "posts/lino-sim-switch/"
summary: "一个 Magisk 模块配合 UFI-TOOLS 插件，在 U30 Air 上切换单卡或双卡启动模式，适合处理内置厂商卡没有流量却参与移动数据选择的情况。"
read: "5 分钟"
layout: post
tags:
  - "Android"
  - "UFI-TOOLS"
  - "Magisk"
  - "SIM卡"
description: "Lino SIM Switch 用 Magisk 模块在启动早期设置多卡属性，再由 UFI-TOOLS 插件切换单卡或双卡模式。"
categories:
  - 工具
---

# Lino SIM Switch：让 UFI 随身 Wi-Fi 按单卡或双卡启动

有些随身 Wi-Fi 设备除了用户自己插入的 SIM 卡，还带着一张内置厂商卡。厂商卡未必有可用流量，但 Android 仍可能把它当成第二张卡一起启动：开机时弹出“要使用哪张卡上网”的提示，或让这张卡参与移动数据选择。

**Lino SIM Switch** 是一套 Magisk 模块和 UFI-TOOLS 插件：模块负责在开机早期设置系统的多卡模式，插件提供一个可以随时切换的控制面板。它不是通用的 SIM 管理 App，而是针对特定随身 Wi-Fi 场景做的启动配置工具。

## 单卡与双卡两种模式

| 模式 | 系统设置 | 适合什么时候 |
|---|---|---|
| 单卡模式 | 清空 `persist.radio.multisim.config`，让电话框架按单卡方式初始化 | 内置厂商卡没有流量，只想使用 SIM 卡 1 |
| 双卡双待 | 将属性设为 `dsds` | 需要两张 SIM 卡都参与工作时 |

首次安装模块时默认使用单卡模式。插件里的两个选项互斥，切换会立即生效；所选模式也会写入 `/data/local/tmp/lino_sim_switch_mode`，让模块在下次启动时继续按这个选择设置。

## 为什么要配 Magisk 模块

只在 Android 启动后用 `setprop` 改值，重启时可能又被只读分区里的 `build.prop` 覆盖。仓库针对 U30 Air 的做法是用 Magisk 的 `post-fs-data.sh` 在启动早期读取模式文件并设置属性；插件本身运行在用户态，负责切换选择和即时应用。

两部分各司其职：模块让模式跨重启保留，插件让操作不必每次都进设置或手敲命令。

## 安装与使用

1. 在 Magisk 中选择“模块 → 从本地安装”，刷入发行版里的模块 ZIP，然后重启设备。
2. 打开 UFI-TOOLS 的插件编辑器，粘贴发行版中的插件文件全文，保留 `[KANO_PLUGIN_START]` 和 `[KANO_PLUGIN_END]` 标记，再保存。
3. 在 UFI-TOOLS 中打开“**双卡双待控制**”，按需要选择“单卡模式”或“双卡双待”。

插件负责控制面板，模块负责开机时应用模式；建议先安装模块并重启，再添加插件。若只单独使用插件而没有模块，切换不能由模块在重启时恢复。

## 适用范围与注意事项

目前仓库明确列出的实测环境是 **ZTE U30 Air、UNISOC UMS9620、Android 13（API 33）和 Magisk**。其他型号、芯片或 Android 版本没有得到同等验证，不建议把这个实现当作通用双卡开关。

单卡模式会让系统按一张卡处理；以后要使用第二张卡时，先切回双卡双待。因为它修改的是电话栈启动时读取的系统属性，其他设备可能出现 RIL 与配置不匹配等问题。若遇到异常，可切回双卡模式；卸载模块时脚本会恢复 `dsds`。不熟悉 Magisk 模块恢复方式的话，先不要在没有备份和恢复方案的设备上尝试。

## 下载与源码

发行标签为 `v2.1`：插件版本是 v2.1，随包 Magisk 模块本身仍为 v2.0。

- [下载 Magisk 模块 v2.0](https://github.com/linote99/Lino-SIM-Switch/releases/download/v2.1/Lino-SIM-Switch-v2.0.zip)
- [下载 UFI-TOOLS 插件 v2.1](https://github.com/linote99/Lino-SIM-Switch/releases/download/v2.1/Lino-SIM-Switch-plugin-v2.1.js)
- [查看 GitHub Release v2.1](https://github.com/linote99/Lino-SIM-Switch/releases/tag/v2.1)
- 项目源码、构建说明和变更记录见 [linote99/Lino-SIM-Switch](https://github.com/linote99/Lino-SIM-Switch)。

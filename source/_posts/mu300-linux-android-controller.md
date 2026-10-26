---
title: MU300 Linux OTG 控制器 0.4.0：用 Android 手机通过 OTG 控制目标设备
date: 2026-10-27 01:40:00
layout: post
slug: mu300-linux-android-controller
permalink: posts/mu300-linux-android-controller/
summary: MU300 Linux OTG 控制器 0.4.0 发布：独立 Android 控制手机通过 USB OTG/ADB 控制目标设备，不需要控制手机 root；本版修复推送锁，并加入目标与本机清理入口。
categories:
  - 工具
tags:
  - Android
  - USB OTG
  - MU300 Linux
  - Magisk
---

## 用一部 Android 手机做 OTG 控制端

MU300 Linux OTG 控制器把上游网页安装器的主要流程搬进了独立 Android APK：用一部手机完成 Linux 安装 ZIP 的下载、校验、推送、计划预览和安装。它是非官方客户端，安装在支持 USB Host/OTG 的手机或平板上，通过 USB ADB 控制另一台 ZTE MU300、F50 或 U30 Air。控制手机本机不需要 root；目标设备需要开启 USB 调试、允许 ADB 主机密钥、具备 root，并使用 Magisk 26+。

0.4.0 重点修复了推送锁：现在只有实际处于 `running` 的 helper job 才会锁定传输，已经结束的 dry-run（包括 rc=3）不会挡住新的 ZIP 推送。同时新增目标暂存清理和本机占用清理入口，帮助处理 `/data/local/tmp/mu300-web` 的临时文件、缓存与运行日志。清理会先检查任务状态、目录条目和恢复事务；ADB 主机密钥、未完成事务及恢复所需资料会保留。

## 四步开始

1. **连接设备**：在 Android 8.0 或更新版本的控制手机安装 APK，用可靠 OTG 线连接目标，授予 USB/ADB 权限并扫描设备。
2. **选择系统与 ZIP**：选择上游 MU300 Linux 的 Magisk 安装 ZIP，填写安装问卷。应用会展示目标版本、系统、内核、设备、启动槽、region 和启动偏好等信息。
3. **传输与校验**：应用推送内置 helper 和上游安装 ZIP，在控制端与目标端复核 SHA-256。USB 中断后重新连接会跟随原任务，而不是自动开启第二个安装。
4. **预览并安装**：先运行 dry-run 查看计划。只有计划完整通过，并由用户明确输入 `INSTALL` 后，才会执行正式安装。

安装或写入期间不要强制停止应用、拔线或断电。无屏幕目标需要预先解决 ADB 主机密钥授权和 OTG 供电问题。

## 实验性 userdata 清空路径

高级入口默认隐藏，连续点击应用顶部“MU300 Linux”标题 5 次可打开。32GB 机型的 userdata 缩容/清空会删除 Android 上的应用、照片、下载、账户和设置，是高风险实验性操作，不属于普通安装步骤。

开始前请独立备份照片、下载和其他个人文件，并准备好 Magisk 与需要恢复的应用 APK。应用 APK 备份不包含 App 数据；控制手机保存的 15 项 GPT/分区备份也不是完整 eMMC 备份。应用会先检查 root、Magisk、启动状态、加密状态、GPT 双表/CRC、目标设备、空闲区和恢复条件；写入前需要输入 `ERASE`，重启还要单独确认。

如果准备或写入异常，不要清除应用数据或卸载应用；保留事务记录和所有备份，按恢复流程处理。清除完成后，需要重新完成 Android 初始设置、开启 ADB、恢复 Magisk/应用并重新授权目标 Shell root，才能继续恢复。

## 下载与致谢

- GitHub Release：<https://github.com/linote99/mu300-linux-android-controller/releases/tag/v0.4.0>
- APK：<https://github.com/linote99/mu300-linux-android-controller/releases/download/v0.4.0/MU300-Linux-OTG-Controller-0.4.0.apk>
- 源码 ZIP：<https://github.com/linote99/mu300-linux-android-controller/releases/download/v0.4.0/MU300-Linux-OTG-Controller-0.4.0-source.zip>
- 夸克下载：<https://pan.quark.cn/s/d2c91b254022>

本项目的 helper、安装自动化协议以及实验性 make-room/恢复逻辑参考并致谢 [dikeckaan/mu300-linux](https://github.com/dikeckaan/mu300-linux)。上游代码的 MIT 许可证和来源说明随项目保留；本 APK 不包含 GPL 内核补丁、内核源代码或内核二进制。

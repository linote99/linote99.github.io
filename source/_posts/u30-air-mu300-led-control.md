---
title: "给 U30 Air / MU300 加一个 LuCI LED 控制面板"
date: "2026-11-20 00:00:00"
slug: "u30-air-mu300-led-control"
summary: "用一个面向中兴 U30 Air / MU300 系列的 LuCI 插件，集中管理指示灯开关、分组、亮度、自动熄灭和电源联动。"
read: "3 分钟"
layout: post
tags:
  - "OpenWrt"
  - "MU300"
  - "LuCI"
  - "LED"
description: 给中兴 U30 Air / MU300 系列 OpenWrt 固件使用的 LuCI LED 控制插件介绍。
categories:
  - 工具
---
# 给 U30 Air / MU300 加一个 LuCI LED 控制面板

中兴 U30 Air / MU300 系列上有多组状态灯。平时想关掉某一组灯，或者调整自动熄灭时间，往往得直接改系统配置。这个 LuCI 插件把常用操作集中到“系统 → LED 控制”页面里，不用每次都进终端敲命令。

## 总开关、分组和亮度

页面可以一键点亮或熄灭所有 LED，也能分别控制信号灯、Wi-Fi 灯和电源灯。需要更细致调整时，可以给三组灯分别设置亮度，范围为 0–255，并提供恢复默认亮度的操作。自动熄灭时间也能在页面设置：设为 0 表示常亮，默认值为 15 秒。

如果只是临时需要灯亮一下或暂时熄灭，可以使用临时点亮 / 熄灭操作，不必改动保存的配置。页面还会显示灯位状态，方便分辨每一组控制对应哪些硬件灯。

## 让电源状态联动指示灯

开启“接入电源时关闭 LED”后，接入充电器会关闭信号、Wi-Fi 和电源灯；拔掉电源时则恢复为开启状态。这里的“恢复”是把各组设为开启，并不是记住插电前每一组灯原来的开关状态。

这个功能由插件按需写入 `/etc/hotplug.d/power_supply/99-ledctl-power` 热插拔脚本，并根据设备的 `power_supply` 状态判断是否接电。脚本会记录状态，避免电源状态抖动时反复执行。关闭联动选项后，插件会移除该脚本。

## 为什么通过系统配置控制

插件调用设备上的厂商 LED 管理逻辑，并修改 `system.mu300_leds` 中的分组、亮度和超时配置，而不是只直接写 `/sys/class/leds/*/brightness`。后者可能很快被厂商后台服务覆盖；通过系统配置修改，更贴近这类固件原本的 LED 管理方式。

## 安装与适用范围

这个插件不是适用于所有 OpenWrt 路由器的通用 LED 控制器。它面向中兴 U30 Air / MU300 系列固件，依赖设备上的 `/opt/mu300/bin/mu300-led` 以及相应的电源状态节点。缺少厂商组件时，配置仍可能写入，但灯光不会按预期立即变化；不同定制固件的 `power_supply` 节点也可能不同。

本次 APK 使用 OpenWrt 25.12.5 `armsr/armv8` SDK 构建，并检查了包元数据及安装文件；包架构为 `noarch`、未签名，依赖 `luci-base`、`rpcd` 和 `ucode`。目前尚未在真实路由器上安装验证，安装前建议确认固件依赖并备份原配置。

**下载 APK：**[luci-app-ledctl-1.0.0-r1.apk](https://github.com/linote99/luci-app-ledctl/releases/download/luci-app-ledctl-v1.0.0/luci-app-ledctl-1.0.0-r1.apk)；[Release 说明](https://github.com/linote99/luci-app-ledctl/releases/tag/luci-app-ledctl-v1.0.0)（含源码链接）。先把 APK 上传到路由器的 `/tmp` 目录，再执行：

```sh
apk add --allow-untrusted /tmp/luci-app-ledctl-1.0.0-r1.apk
```

安装后可从 LuCI 的“系统 → LED 控制”进入。

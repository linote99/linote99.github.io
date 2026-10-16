---
title: "Lino eUICC Control：让 UFI 上的 eSIM 配置能在网页里管"
date: "2026-10-16 02:00:00"
slug: "lino-euicc-control"
permalink: "posts/lino-euicc-control/"
summary: "一个 UFI-TOOLS 插件加配套 Magisk 模块，在高级后台的网页界面里查询、切换、改名、下载和删除设备的 eSIM 配置。"
read: "6 分钟"
layout: post
tags:
  - "UFI-TOOLS"
  - "eSIM"
  - "Android"
description: "一个 UFI-TOOLS 插件加配套 Magisk 模块，在高级后台的网页界面里查询、切换、改名、下载和删除设备的 eSIM 配置。"
categories:
  - 工具
---

# Lino eUICC Control：让 UFI 上的 eSIM 配置能在网页里管

我的 UFI（荣悦 E5，Unisoc UMS9621）里插的是一张可插拔 eSIM（ESTK 类卡片）。换配置这件事本来只能靠 OpenEUICC 这个 App 在设备屏幕上点，或者插到手机上用另一台设备操作——设备放在角落当热点用的时候，专门去点它很不方便。

于是做了一套东西：一个 **UFI-TOOLS 插件**（在高级后台网页里操作）+ 一个 **Magisk 模块**（提供特权能力）。装完在网页里就能看配置、切卡、改名、下载和删除。

## 界面

面板顶上一行四个状态格子：卡槽与运营商、配置数量、当前启用的配置、卡片是否可访问。下面依次是卡片信息（EID）、配置列表、下载新配置。

每个配置显示昵称、状态标签（已启用/已禁用）、提供商和 ICCID，右侧三个按钮：启用/禁用、改名、删除。

![](https://github.com/linote99/lino-euicc-control/raw/main/docs/images/plugin-ui.jpg)

## 都能做什么

| 功能 | 说明 |
|---|---|
| 查看配置列表 | 昵称、提供方、ICCID、启用状态 |
| 启用 / 禁用 | 切换配置。禁用会断网，这是卡片行为 |
| 自定义名称 | 给配置起个自己认得出的名字，留空则清除 |
| 下载新配置 | 粘贴激活码，或扫码识别，直接下载并安装 |
| 删除配置 | 需要手动输入该配置的 ICCID 二次确认 |
| 卡槽识别 | 双卡时显示选择器，指明操作哪一张 |

## 操作方式：走 root shell，不做界面自动化

插件所有操作都是通过 root shell 把命令发给特权应用，返回结果读文件回显。

一开始试过用界面自动化去点 OpenEUICC，但很快放弃了——**UIF 的屏幕会随方向在 320×480 和 480×320 之间切换**，任何写死的坐标都会失效；息屏、锁屏也会打断流程。改成走 shell 之后，屏幕状态和方向都无关了。

## 为什么需要一个特权应用

设备的 eUICC 是**可插拔**的实体卡，系统把它当成「可移除 eSIM」（`isEmbedded=false`）。这个身份带来两个限制：

- 系统的 `EuiccCardManager` 写接口直接返回 `-3`（卡片无效），不认这种卡
- 从命令行 `app_process` 调 OMAPI 会被拒，报 `SecurityException`——因为缺应用身份

所以需要一个安装在 `/system/priv-app/` 下的特权应用，配合白名单拿到 `WRITE_EMBEDDED_SUBSCRIPTIONS`、`SECURE_ELEMENT_PRIVILEGED_OPERATION` 等权限，再去直连卡片。

## 下载配置为什么绕了一圈

这一步走了几条弯路，记录下来。

**第一条路：调用系统接口。** 系统有个 `EuiccService`，理论上下发下载请求即可。但实际上 OpenEUICC 的 `OpenEuiccService` **没有实现** `onDownloadSubscription`（上游源码里就没有这个方法），调用只会得到 `UnsupportedOperationException`。这条路走不通，换任何版本都一样。

**第二条路：唤起它自己的下载向导。** OpenEUICC 有 `DownloadWizardActivity`，但它在**冷启动时会崩**——内部有个竞态：服务绑定的回调晚于 Activity 的 `onSaveInstanceState`，接着提交 Fragment 事务就抛 `IllegalStateException`。我试过各种启动参数、预热进程、先唤醒屏幕，成功率在 0/5 到 3/4 之间飘，没法稳定用。

**最终方案：直接驱动 lpac。** OpenEUICC 的 LPA 能力来自 `liblpac-jni.so`，它是自包含的（只依赖 libc/libm/libdl，TLS 是静态链接的），而且接口是**依赖注入式**设计——协议逻辑在 C 库里，eUICC 通道和 HTTP 通道由调用方提供。

所以我自己实现了两个桥接：一个把 APDU 接到 OMAPI，一个用 HTTPS 访问 SM-DP+。**协议部分完全复用 lpac**，不用自己写一遍 SGP.22。这样绕开了那个会崩的界面，也做到了无界面下载。

## 扫码填入激活码

手册上的激活码通常是二维码。插件支持唤起系统相机拍一张，本地解出内容后自动填入输入框。

这里有一个细节：**没有做摄像头实时预览扫码**。因为插件页面是 `http://` 的（非安全上下文），浏览器不允许调用摄像头；而且这台设备没有 Google 服务，Android 版的 `BarcodeDetector` 后端也不可用。所以走的是「拍照 → 本地解码」这条路。

解码器用的是 jsQR。**v1.7 起插件不再内嵌它**——之前内嵌让插件体积有 282 KB，其中解码器占了 251 KB（88%）。现在改成按需下载：需要扫码功能时在插件里点一下「下载扫码组件」，组件会存到设备本地，不用的时候可以卸载。插件本体因此降到 40 KB。

## 安装

需要两部分：模块（提供特权能力）和插件（提供界面）。

**第一步：刷模块并重启。**

模块是 Magisk 格式，里面有特权应用和权限白名单。刷入后重启生效。重启后可以用 `pm path kano.euiccctl` 确认应用在 `/system/priv-app/` 下。

**第二步：装插件。**

把插件文件拖进 UFI-TOOLS 即可，不需要重启。

**第三步（可选）：下载扫码组件。** 需要扫码时再点，约 251 KB，只下一次。

## 下载

GitHub——[下载模块 v2.8](https://github.com/linote99/lino-euicc-control/releases/download/module-v2.8/Lino-euicc-control-v2.8.zip)

GitHub——[下载插件 v1.7](https://github.com/linote99/lino-euicc-control/releases/download/plugin-v1.7/Lino-euicc-control_v1.7.js)

仓库（含源码、各版本历史与开发记录）——[linote99/lino-euicc-control](https://github.com/linote99/lino-euicc-control)

## 已知限制

- **删除不可逆**。我测试过二次确认的拦截逻辑（ICCID 输错会被拒绝），但没有真的执行过删除操作。
- **切换配置后会短暂断网**，这是卡片本身的刷新行为，不是插件的 bug。
- **双卡场景没在真机验证过**。我的设备只有一张 eUICC，槽位选择功能是按 reader 名映射推演的。
- 切换配置后，系统层面的 eSIM 状态缓存可能滞后，表现为「下载」短暂不可用，等一下或重启即恢复。
- 模块里包含第三方的 OpenEUICC（LPA 实现），版权归其作者，仓库 LICENSE 里有说明。

## 适用范围

面向 Android 13 + Magisk 的 UFI 设备（实测荣悦 E5 / Unisoc UMS9621）。原理上要求卡片遵循 SGP.22 标准，其他支持 OMAPI 的机型可能也可用，但未验证。

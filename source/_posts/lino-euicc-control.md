---
title: "Lino eUICC Control：让 UFI 上的 eSIM 配置能在网页里管"
date: "2026-10-16 02:00:00"
slug: "lino-euicc-control"
permalink: "posts/lino-euicc-control/"
summary: "一个 UFI-TOOLS 插件加配套 Magisk 模块，在高级后台的网页界面里查询、切换、改名、下载和删除设备的 eSIM 配置。"
read: "9 分钟"
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

我的 UFI（荣悦 E5，Unisoc UMS9621）里插的是一张可插拔 eSIM（ESTK 类卡片）。换配置这件事本来只能靠 OpenEUICC 这个 App 在设备屏幕上点，或者把卡插到手机上用另一台设备操作——设备放在角落当热点用的时候，专门去点它很不方便。

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
| 卡槽识别 | 双卡时显示选择器，指明操作哪一张（已双卡实测） |

## 操作方式：走 root shell，不做界面自动化

插件所有操作都是通过 root shell 把命令发给特权应用，返回结果读文件回显。

一开始试过用界面自动化去点 OpenEUICC，但很快放弃了——**UFI 的屏幕会随方向在 320×480 和 480×320 之间切换**，任何写死的坐标都会失效；息屏、锁屏也会打断流程。改成走 shell 之后，屏幕状态和方向都无关了。

## 为什么需要一个特权应用

设备的 eUICC 是**可插拔**的实体卡，系统把它当成「可移除 eSIM」（`isEmbedded=false`）。这个身份带来两个限制：

- 系统的 `EuiccCardManager` 写接口直接返回 `-3`（卡片无效），不认这种卡
- 从命令行 `app_process` 调 OMAPI 会被拒，报 `SecurityException`——因为缺应用身份

所以需要一个安装在 `/system/priv-app/` 下的特权应用，配合白名单拿到 `WRITE_EMBEDDED_SUBSCRIPTIONS`、`SECURE_ELEMENT_PRIVILEGED_OPERATION` 等权限，再去直连卡片。

## 下载配置为什么绕了一圈

这一步走了几条弯路，记录下来。

**第一条路：调用系统接口。** 系统有个 `EuiccService`，理论上下发下载请求即可。但实际上 OpenEUICC 的 `OpenEuiccService` **没有实现** `onDownloadSubscription`（上游源码里就没有这个方法），调用只会得到 `UnsupportedOperationException`。这条路走不通，换任何版本都一样。

**第二条路：唤起它自己的下载向导。** OpenEUICC 有 `DownloadWizardActivity`，但它在**冷启动时会崩**——内部有个竞态：服务绑定的回调晚于 Activity 的 `onSaveInstanceState`，接着提交 Fragment 事务就抛 `IllegalStateException`。我试过各种启动参数、预热进程、先唤醒屏幕，成功率在 0/5 到 3/4 之间飘，没法稳定用。

> 补充一点：屏幕息屏时必然复现（Activity 一启动就进入不可见状态），亮屏时也仍不稳定。这不是我能从外部修好的问题。

**最终方案：直接驱动 lpac。** OpenEUICC 的 LPA 能力来自 `liblpac-jni.so`，它是自包含的（只依赖 libc/libm/libdl，TLS 是静态链接的），而且接口是**依赖注入式**设计——协议逻辑在 C 库里，eUICC 通道和 HTTP 通道由调用方提供。

所以我自己实现了两个桥接：一个把 APDU 接到 OMAPI，一个用 HTTPS 访问 SM-DP+。**协议部分完全复用 lpac**，不用自己写一遍 SGP.22。这样绕开了那个会崩的界面，也做到了无界面下载。

### 顺带说几个这一步踩的坑

**Kotlin object 的反射。** `LpacJni` 是 Kotlin `object`（单例），它的 `external fun` 编译出来是**实例方法**而不是静态方法。用反射 `invoke(null, ...)` 会得到 `NullPointerException: null receiver`，必须经 `INSTANCE` 字段取单例。

**原生库与 ClassLoader 绑定。** `.so` 一旦被某个 ClassLoader 打开，就不能再被另一个加载，报 `UnsatisfiedLinkError: already opened by ClassLoader`。所以加载器必须是进程内单例，且类与 `.so` 要用同一个加载器。

**逻辑通道额度。** 我的 OMAPI 封装会先占一个逻辑通道，如果直接把这个会话交给 lpac，lpac 初始化时再开通道就会超出卡片额度，返回 `null`，表现为 `euiccInit rc=-1`。修法是交给 lpac 之前先让出自己占的通道（保留会话本身）。

**TLS 那一层。** SM-DP+ 用的是 GSMA 专属 PKI（`GSM Association - RSP2 Root CI1`），不在公共信任库里，默认校验会失败。更麻烦的是：同一份请求体，用 Python 和设备的 curl 发都是 HTTP 200，用 Java 的 `HttpsURLConnection` 装自定义 `SSLSocketFactory` 发却得到 HTTP 500（空响应）。最后改成用 `SSLSocket` 手写 HTTP 并显式设置 SNI 才通。

## 扫码填入激活码

手册上的激活码通常是二维码。插件支持唤起系统相机拍一张，本地解出内容后自动填入输入框。

这里有一个细节：**没有做摄像头实时预览扫码**。因为插件页面是 `http://` 的（非安全上下文），浏览器不允许调用摄像头；而且这台设备没有 Google 服务，Android 版的 `BarcodeDetector` 后端也不可用。所以走的是「拍照 → 本地解码」这条路。

解码器用的是 jsQR。**v1.7 起插件不再内嵌它**——之前内嵌让插件体积有 282 KB，其中解码器占了 251 KB（88%）。现在改成按需下载：需要扫码功能时在插件里点一下「下载扫码组件」，组件会存到设备本地，不用的时候可以卸载。插件本体因此降到 40 KB。

### 组件管理里的两个实际问题

**下载源不能想当然。** 我测了几处地址，发现 `raw.githubusercontent.com` 和 `staticaly` **返回 HTTP 200 但内容被截断到 32 KB**——静默损坏，比直接失败更危险。所以插件里放的 5 个源都是实测比对过校验值的（jsDelivr 的三个节点、GitHub Release、ghproxy 镜像），每处用固定 tag 而非分支名，避免上游改动导致校验失败。

**读大文件不能用单行。** 组件有 342 KB 的 base64，我最初用 `base64 -w0`（输出一整行）。而 UFI-TOOLS 的 shell 接口是**逐行读取**并对每行打日志的，单行过大会被截断，导致组件读进来不完整、注入必然失败。改成 `base64 -w 76`（每行 76 字符）就正常了。

### 「检测」按钮

因为上面这类问题靠现象很难判断，我在插件里加了个**检测**按钮，把每一步的实测结果直接列出来：

```
✅ 设备端同步: ok（已读取设备状态）
✅ root shell 可用: 是
✅ 文件存在: /sdcard/ufitools/lib/jsQR.min.js
   实测大小 256885 / 期望 256885 字节
✅ sha256 校验: bc40c8a15196236b…
✅ shell 读取: 342516 / 342516 字符
✅ 注入到页面: 成功
✅ 解码器可用性: jsQR 可正常调用
```

哪一步失败会明确指出来，不用猜。

## 关于「网页里弹窗」

一个容易被忽略的限制：UFI-TOOLS 的 WebView **没有设置 `WebChromeClient`**。这导致 `window.prompt()` 直接返回 `null`、`window.confirm()` 返回 `false`，而且**不显示任何界面**。

我最初用它们做「改名输入」和「删除确认」，结果在设备上表现为**点了没反应**——不报错、不弹窗，只是什么都不发生。后来改成自己画弹层才正常。

这个问题值得单独提一句：同一环境下的其他插件都自建了弹层，我一开始没注意这个约定。

## 双卡的情况

后来我插了两张 eUICC 一起测，这块之前只有单卡，现在说清楚实测结果。

两张卡各有独立的 EID，`--ei slot` 能正确隔离，互不干扰：

| 槽位 | reader | EID | 卡内配置 |
|---|---|---|---|
| slot 0 | `SIM1` | `…7994986` | `…96086` Facebookk（启用）、`…99932` 3300361766（禁用） |
| slot 1 | `SIM2` | `…4370872` | `…64167` kingking99（启用）、`…64068` liulihong9999（禁用） |

reader 名和槽位的对应关系也验证了：**`SIM<N>` 里的 N 就是 1-based 物理卡槽号**，而 `simSlotIndex` 是 0-based，所以 `simSlotIndex = N - 1`。

### 两个要注意的地方

**默认会选第一张。** 两槽都是 eUICC 时，如果不指定槽位，程序会命中检测顺序里靠前的那张（实测是 slot 0）。插件检测到两个 eUICC 时会显示「卡槽」选择器——**操作前先确认选的是哪一张**，否则可能改到另一张卡。

**卡槽位置会变，但配置跟卡走。** 我把卡换了个槽再插回去，`simSlotIndex` 就从 1 变成了 0。所以想稳定识别一张卡，看 **EID** 而不是槽位号——EID 是每张卡唯一的，槽位号只是它当前插在哪。

### 一个容易误判的现象

`dumpsys isub` 里 slot 0 那张卡报的是 `isEmbedded=false`、`profileClass=-1`，看起来不像 eSIM。但它**确实是 eUICC**——`cardString` 字段就等于它的 EID，用 APDU 直读也能取到卡内配置。

这是系统或卡片侧的标记问题，插件只是如实反映框架给出的值。判断一张卡是不是 eUICC，看能不能打开 ISD-R 逻辑通道比看 `isEmbedded` 可靠。

## 安装

需要两部分：模块（提供特权能力）和插件（提供界面）。

**第一步：刷模块并重启。**

模块是 Magisk 格式，里面有特权应用和权限白名单。刷入后重启生效。重启后可以用 `pm path kano.euiccctl` 确认应用在 `/system/priv-app/` 下。

**第二步：装插件。**

把插件文件拖进 UFI-TOOLS 即可，不需要重启。

**第三步（可选）：下载扫码组件。** 需要扫码时再点，约 251 KB，只下一次。

组件安装状态会记在设备端 `/data/lino_euicc_ctl/scan_state.json`（含版本、大小、校验值、来源、时间），逻辑参考了同目录的《插件综合收纳箱》——用 base64 编解码避免 shell 解析问题，原子写避免写坏，逐键时间戳合并让多端互不覆盖。

## 下载

GitHub——[下载模块 v2.9](https://github.com/linote99/lino-euicc-control/releases/download/module-v2.9/Lino-euicc-control-v2.9.zip)

GitHub——[下载插件 v1.8](https://github.com/linote99/lino-euicc-control/releases/download/plugin-v1.8/Lino-euicc-control_v1.8.js)

仓库（含源码、各版本历史与开发记录）——[linote99/lino-euicc-control](https://github.com/linote99/lino-euicc-control)

模块与插件需要配套使用：模块提供特权能力与 lpac 桥接，插件负责界面与命令下发。

## 已知限制

- **删除不可逆**。我测试过二次确认的拦截逻辑（ICCID 输错会被拒绝），但没有真的执行过删除操作。
- **切换配置后会短暂断网**，这是卡片本身的刷新行为，不是插件的 bug。
- **双卡默认选中第一张**。两槽都是 eUICC 且未指定槽位时会命中靠前那张，操作前请确认插件里选中的卡槽。详见上面「双卡的情况」。
- 切换配置后，系统层面的 eSIM 状态缓存可能滞后，表现为「下载」短暂不可用，等一下或重启即恢复。
- 模块里包含第三方的 OpenEUICC（LPA 实现），版权归其作者，仓库 LICENSE 里有说明。

## 适用范围

面向 Android 13 + Magisk 的 UFI 设备（实测荣悦 E5 / Unisoc UMS9621）。原理上要求卡片遵循 SGP.22 标准，其他支持 OMAPI 的机型可能也可用，但未验证。

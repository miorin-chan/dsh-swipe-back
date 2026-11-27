# dsh-swipe-back

[English](README.en.md) · [项目文档](docs/README.md)

手机端 Web UI 的左边缘右滑手势：**先做返回，能返回才不打开会话列表。**

- 抽屉（会话列表）开着 → 关闭抽屉；此时从任意位置起手、向左或向右滑都可以（iOS 的「把抽屉甩掉」）
- 插件或计划任务开在子页 → 返回当前页的上一级，例如插件配置 → 插件详情 → 来源列表
- 全局面板在顶层 → 回到会话
- 右侧栏展开着 → 收起
- 以上都没有 → 打开会话列表抽屉

只在手机宽度（<768px，侧栏为抽屉）下生效。弹窗或菜单打开时暂停手势。
关抽屉这一步不受下面限制：系统返回手势只从边缘向右，向左甩不会撞车，所以 Safari 标签页里也能用。
其余各步只在「添加到主屏幕」的 PWA，或没有历史记录的标签页里启用；有上一页的 Safari 标签页仍归系统返回手势，
避免双重动作。

## 界面实拍

截图来自移动视口中的 Chromium。测试通过真实触摸输入打开、关闭会话抽屉，不是 iOS 系统返回手势的截图。

| 操作结果 | 浅色 | 深色 |
| --- | --- | --- |
| 从左边缘右滑，打开会话抽屉 | ![浅色会话抽屉打开](docs/assets/screenshots/main-light.png) | ![深色会话抽屉打开](docs/assets/screenshots/main-dark.png) |
| 在已打开的抽屉上左滑，回到会话 | ![浅色会话抽屉收起](docs/assets/screenshots/dismiss-light.png) | ![深色会话抽屉收起](docs/assets/screenshots/dismiss-dark.png) |

## 本地安装

在新检出的目录中运行 `pnpm install --frozen-lockfile` 安装依赖并构建插件。
然后在 DSH 的**插件 → 添加插件**中选择该目录。

## 依赖的公开面

- `ctx.layout.toggleSidebar()` / `ctx.layout.panelInfo` / `ctx.layout.selectPanel(null)`
- `ctx.sidebarRight.toggleExpanded()`
- 布局写出的 DOM 状态：`data-sidebar-drawer`、`data-sidebar-collapsed`、`data-rightbar-collapsed`

抽屉是否打开没有公开 getter，因此用布局自己打在框架上的 `data-sidebar-collapsed` 判断；
DSH 升级后若改了这几个属性，需要复验。

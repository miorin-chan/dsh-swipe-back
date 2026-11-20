# dsh-swipe-back

[English](README.en.md) · [项目文档](docs/README.md)

手机端 Web UI 的左边缘右滑手势：**先做返回，能返回才不打开会话列表。**

- 抽屉（会话列表）开着 → 关闭抽屉；此时从任意位置起手、向左或向右滑都可以（iOS 的「把抽屉甩掉」）
- 全局面板（设置/插件等）开着 → 回到会话
- 右侧栏展开着 → 收起
- 以上都没有 → 打开会话列表抽屉

只在手机宽度（<768px，侧栏为抽屉）下生效。关抽屉这一步不受下面限制：系统返回手势只从边缘向右，向左甩不会撞车，所以 Safari 标签页里也能用。其余各步只在「添加到主屏幕」的 PWA，或没有历史记录的标签页里启用；有上一页的 Safari 标签页仍归系统返回手势，避免双重动作。

## 依赖的公开面

- `ctx.layout.toggleSidebar()` / `ctx.layout.panelInfo` / `ctx.layout.selectPanel(null)`
- `ctx.sidebarRight.toggleExpanded()`
- 布局写出的 DOM 状态：`data-sidebar-drawer`、`data-sidebar-collapsed`、`data-rightbar-collapsed`

抽屉是否打开没有公开 getter，因此用布局自己打在框架上的 `data-sidebar-collapsed` 判断；DSH 升级后若改了这几个属性，需要复验。

# 项目文档

- [产品设计](../DESIGN.md)：用户问题、手势优先级、系统手势边界与成功标准。
- [中文 README](../README.md) · [English README](../README.en.md)：手势顺序、适用范围与布局依赖。
- [浏览器源码](../src/client/index.ts)：手势判定、页面返回动作和触摸监听器的生命周期。
- [通用约定](../AGENTS.md) · [项目约定](../AGENTS.local.md)：维护与验证方法。

## 依赖的公开面与 DOM 状态

- `ctx.layout.toggleSidebar()`、`ctx.layout.panelInfo` 与 `ctx.layout.selectPanel(null)`
- `ctx.sidebarRight.toggleExpanded()`
- 布局 DOM 状态属性：`data-sidebar-drawer`、`data-sidebar-collapsed`、
  `data-rightbar-collapsed`（因抽屉开启状态无公开 getter，故读取 `data-sidebar-collapsed`；
  DSH 升级后若修改这些属性需复验）。

# AGENTS.local

本文件补充 [AGENTS.md](AGENTS.md)，记录左边缘返回手势的项目约定。
两者冲突时以本文件为准。

## 范围与结构

- 本 bundle 独立安装和启停。[client.js](client.js) 是浏览器模块，文件头记录手势优先级与系统返回的边界。
  [index.js](index.js) 是供 [bundle patch](cordis.patch.yml) 加载的空 Host 模块。
- 依赖 `layout`、`sidebarRight` 服务和 frame 的布局属性。
  手势按抽屉、全局面板、右侧栏的顺序返回，最后才打开会话列表。
  抽屉打开时可从任意位置双向滑动关闭。
  其余动作限独立 PWA 或无历史的标签页，并从左边缘向右滑。
- 通过 `ctx.effect` 注册触摸监听器并在卸载时清理。
  谨慎处理系统返回手势、触摸滚动和 DOM 属性变更。
- `locale/*.json` 仅保存 Plugin Manager 的展示文案，八种语言为 `en`、`zh`、`ja`、`de`、`es`、`fr`、`pt`、`ru`。
  [icon.svg](icon.svg) 是 bundle 图标。

## 开发约束

- 新增实现用 TypeScript，复用与目标 DSH 版本匹配的官方类型，在接口、配置和事件中保留类型信息，并同步维护类型依赖。
- 只用 DSH 支持的插件 API 和扩展点实现新行为。
  禁止修改 DSH 源码或安装产物，也禁止用全局猴子补丁或覆写内部实现绕过边界。
  扩展点不足时说明缺口，并将实现限制在插件能力内。

## 文档与验证

- [README.md](README.md) 是中文用户文档，[README.en.md](README.en.md) 是英文版。
  设计与验证记录用中文，入口见 [文档索引](docs/README.md)。
- 在项目目录运行 `node --check client.js && node --check index.js` 及 `npm pack --dry-run --json`。
  从工作区运行 `node tools/new-dsh-plugin/cli.mjs --check plugins/dsh-swipe-back`。
- 如需设备验证，用临时 profile 确认手机宽度下的返回顺序和抽屉双向关闭。
  对照独立 PWA、有历史和无历史的 Safari 标签页，验证手势与系统返回的边界。
- 用 `docs/scripts/reflow md <path>` 重排修改过的英文 Markdown。
  命令需要 Python 3.11 或更新版本。
- 在项目根运行 `prek install`，之后提交时会自动重排暂存的 Markdown。
- 在 DSH 沙箱内提交时，用 `PREK_HOME="${TMPDIR:?}/prek-dsh" git commit -m "<commit message>"`，
  让 reflow 钩子照常运行，并把 `prek` 的缓存和日志写到可写的临时目录。

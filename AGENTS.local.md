# AGENTS.local

本文件补充 [AGENTS.md](AGENTS.md)，记录左边缘返回手势的项目约定。
两者冲突时以本文件为准。

## 范围与结构

- 本 bundle 可独立安装和启停。
  [浏览器源码](src/client/index.ts) 生成 `client.js`，[Host 源码](src/host/index.ts) 生成 `index.js`。
  Git 忽略这两个产物。
- 依赖 `layout`、`sidebarRight` 服务和 frame 的布局属性。
  手势按抽屉、面板内上一级、全局面板、右侧栏的顺序返回，最后才打开会话列表。
  插件页复用页面的返回按钮，计划任务页复用 Escape 返回动作；升级 DSH 后复验相应的 DOM 标记。
  抽屉打开时可从任意位置双向滑动关闭。
  其余动作限独立 PWA 或无历史的标签页，并从左边缘向右滑。
- 通过 `ctx.effect` 注册触摸监听器并在卸载时清理。
  谨慎处理系统返回手势、触摸滚动和 DOM 属性变更。
- `locale/*.json` 仅保存 Plugin Manager 的展示文案，八种语言为 `en`、`zh`、`ja`、`de`、`es`、`fr`、`pt`、`ru`。
  [icon.svg](icon.svg) 是 bundle 图标。

## 复用 DSH 原生界面

- 优先复用 DSH 原生组件、行为、主题 token 和同类界面布局，以减少自写代码和维护成本。
- 当前版本有受支持的运行时入口且性能可接受时，优先通过公开插槽、
  组件工厂或宿主提供的可加载模块动态复用，让宿主提供组件实现。
  只有现有组件和扩展点无法满足需求时，才补足必要的插件实现。
- 静态引入或打包官方代码或资源时，在引用处标注上游包名、版本或提交、源码路径及符号名，便于升级时回看和同步，
  并保留适用的许可证与署名。

## 开发约束

- 常见操作按钮优先使用易识别的图标，仅在图标无法明确表达操作含义时使用可见文字。
- 编写插件时，除非有特殊说明，否则使用 TypeScript。
  复用与目标 DSH 版本匹配的官方类型，在接口、配置和事件中保留类型信息，并同步维护类型依赖。
- 只用 DSH 支持的插件 API 和扩展点实现新行为。
  禁止修改 DSH 源码或安装产物，也禁止用全局猴子补丁或覆写内部实现绕过边界。
  扩展点不足时说明缺口，并将实现限制在插件能力内。

## 文档与验证

- [README.md](README.md) 是中文用户文档，[README.en.md](README.en.md) 是英文版。
- [DESIGN.md](DESIGN.md) 是产品设计入口，变更产品行为前先阅读；它说明用户问题、预期体验、边界范围与可观察的成功标准。
- 实现契约、方案与验证记录与产品设计分开存放，以 [文档索引](docs/README.md) 为索引；验证记录写明实际测试内容。
- 进度、排期与调试笔记留在任务记录；任务收尾前将已确认的产品决定同步更新到 [DESIGN.md](DESIGN.md)，
  并在任务记录中留链接。
- 插件详情页要整体短、每项一眼能懂。
  只展示用户当下需要知道或操作的内容，细节按需展开。
- 在新检出的项目目录运行 `pnpm install --frozen-lockfile` 安装开发依赖并构建，随后运行 `npm run check`。
  打包检查用 `npm pack --dry-run --json`。
  从工作区运行 `node tools/new-dsh-plugin/cli.mts --check plugins/dsh-swipe-back`。
- 如需设备验证，用临时 profile 确认手机宽度下的返回顺序和抽屉双向关闭。
  对照独立 PWA、有历史和无历史的 Safari 标签页，验证手势与系统返回的边界。
- 用 `docs/scripts/reflow md <path>` 重排修改过的英文 Markdown。
  命令需要 Python 3.11 或更新版本。
- 在项目根运行 `prek install`，之后提交时会自动重排暂存的 Markdown。
- 在 DSH 沙箱内提交时，用 `PREK_HOME="${TMPDIR:?}/prek-dsh" git commit -m "<commit message>"`，
  让 reflow 钩子照常运行，并把 `prek` 的缓存和日志写到可写的临时目录。

`npm run build:tools` 从 `scripts/` 下的 `.mts` 生成同路径 `.mjs`，Git 跟踪 TypeScript 源码。
Node.js 22.18 或更新版本直接运行 `.test.mts`。

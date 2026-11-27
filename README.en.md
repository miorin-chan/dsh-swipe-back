# dsh-swipe-back

[简体中文](README.md) · [Project documentation](docs/README.md)

On the phone Web UI, swipe right from the left edge to take the first available step in this order.

1. Close the session list drawer if it is open.
   You can dismiss an open drawer with a left or right swipe starting anywhere.
2. Return one level within Plugins or Schedules, such as from plugin configuration to the bundle details.
3. Leave a top-level global panel to return to the conversation.
4. Collapse the right sidebar if it is expanded.
5. Open the session list drawer if none of the above applies.

The gesture works at phone widths below 768px, where the sidebar is a drawer.
It pauses while a modal or menu is open. Drawer dismissal also works in Safari tabs.
The remaining steps work in an app added to the Home Screen or a browser tab with no previous history entry.
When a page has a previous history entry, Safari handles the system back gesture.

## Screenshots

Captured with touch input in Chromium's mobile viewport, with the DSH interface in Chinese.
These screenshots do not show the iOS system back gesture.

| Result | Light | Dark |
| --- | --- | --- |
| Open the drawer with an edge swipe | ![Light theme, session drawer open](docs/assets/screenshots/main-light.png) | ![Dark theme, session drawer open](docs/assets/screenshots/main-dark.png) |
| Swipe left across the drawer to dismiss it | ![Light theme, session drawer closed](docs/assets/screenshots/dismiss-light.png) | ![Dark theme, session drawer closed](docs/assets/screenshots/dismiss-dark.png) |

## Local installation

Run `pnpm install --frozen-lockfile` in a fresh checkout to install dependencies and build the plugin.
Then select the directory in DSH under **Plugins → Add plugin**.

## Layout dependencies

- `ctx.layout.toggleSidebar()`, `ctx.layout.panelInfo`, and `ctx.layout.selectPanel(null)`
- `ctx.sidebarRight.toggleExpanded()`
- The layout’s DOM state attributes `data-sidebar-drawer`, `data-sidebar-collapsed`, and `data-rightbar-collapsed`

The drawer has no public getter for its open state, so the plugin reads the frame’s `data-sidebar-collapsed` attribute.
Recheck the gesture after a DSH upgrade if any of the three attributes change.

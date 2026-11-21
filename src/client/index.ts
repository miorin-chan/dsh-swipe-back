import type { Context } from '@deepseek-ai/cordis'
import type {} from '@deepseek-ai/dsh-client-ui-layout/client'
import type {} from '@deepseek-ai/dsh-client-ui-sidebar-right/client'

export const inject = ['layout', 'sidebarRight']

const EDGE = 20
const DISTANCE = 50
const SLOP = 45
const LOCK = 8

const PLUGIN_DETAIL = '[data-plugin-detail], [data-plugin-row-detail], [data-plugin-item-detail], [data-market-detail]'
// The shipped Plugins page has no back service. Match its own button within the
// appropriate view by CSS module local name, independent of build hash and locale.
const PLUGIN_CRUMB = 'button:is([class$="_crumb"], [class*="_crumb "])'
const PLUGIN_MORE_BACK = 'header > button:is([class$="_moreBack"], [class*="_moreBack "])'

function visible(element: Element): boolean {
  return element.getClientRects().length > 0 && window.getComputedStyle(element).visibility === 'visible'
}

/** Handle a nested page, including one whose return control is temporarily unavailable. */
function backWithinPanel(panel: Element): boolean {
  const plugins = panel.querySelector('[data-plugin-panel]')
  if (plugins !== null) {
    const detail = [...plugins.querySelectorAll(PLUGIN_DETAIL)].find(visible)
    const more = plugins.querySelector('[data-plugin-group="more"]')
    const button = detail !== undefined
      ? detail.querySelector<HTMLButtonElement>(PLUGIN_CRUMB)
      : plugins.querySelector<HTMLButtonElement>(PLUGIN_MORE_BACK)
    if (button !== null && visible(button)) {
      if (!button.matches(':disabled, [aria-disabled="true"]') && !button.closest('[inert], [aria-hidden="true"]')) {
        button.click()
      }
      return true
    }
    return detail !== undefined || (more !== null && visible(more))
  }

  // Schedules already treats Escape as return from a task or its create form.
  // It only consumes that key while handling a nested view.
  const schedules = panel.querySelector('[data-testid="task-manager-page"]')
  if (schedules === null) return false
  const detail = schedules.querySelector('aside[tabindex="-1"]')
  if (detail === null || !visible(detail)) return false
  detail.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }))
  return true
}

export function apply(ctx: Context): void {
  // A browser tab with history behind it belongs to the system gesture.
  const standalone = (window.navigator as Navigator & { standalone?: boolean }).standalone === true
    || window.matchMedia('(display-mode: standalone)').matches
  const backEnabled = standalone || window.history.length <= 1
  let start: { x: number; y: number; close: boolean } | null = null

  const frame = () => document.querySelector('[data-sidebar-drawer]')
  const drawerOpen = (el: Element) => !el.hasAttribute('data-sidebar-collapsed')
  const overlayOpen = () => [...document.querySelectorAll('[aria-modal="true"], [role="menu"]')].some(visible)

  const back = (el: Element) => {
    if (drawerOpen(el)) {
      ctx.layout.toggleSidebar()
      return
    }
    if (ctx.layout.panelInfo.getSnapshot().activePanelId !== null) {
      const panel = el.querySelector('[data-global-panel]:not([data-global-panel="false"])')
      if (panel !== null && !backWithinPanel(panel)) ctx.layout.selectPanel(null)
      return
    }
    if (!el.hasAttribute('data-rightbar-collapsed')) {
      ctx.sidebarRight.toggleExpanded()
      return
    }
    ctx.layout.toggleSidebar()
  }

  const reset = () => { start = null }

  const onStart = (event: TouchEvent) => {
    reset()
    if (event.touches.length !== 1) return
    const el = frame()
    if (el === null || overlayOpen()) return
    const touch = event.touches[0]
    // An open drawer accepts dismissal from anywhere, in either direction.
    const close = drawerOpen(el)
    if (!close && (!backEnabled || touch.clientX > EDGE)) return
    start = { x: touch.clientX, y: touch.clientY, close }
  }

  const onMove = (event: TouchEvent) => {
    if (start === null) return
    if (event.touches.length !== 1) {
      reset()
      return
    }
    const touch = event.touches[0]
    const dx = touch.clientX - start.x
    const dy = touch.clientY - start.y
    const travel = start.close ? Math.abs(dx) : dx
    if (travel <= 0 || Math.abs(dy) > SLOP) {
      reset()
      return
    }
    if (travel > LOCK && event.cancelable) event.preventDefault()
    if (travel >= DISTANCE) {
      const close = start.close
      reset()
      const el = frame()
      if (el !== null && drawerOpen(el) === close && !overlayOpen()) back(el)
    }
  }

  ctx.effect(() => {
    document.addEventListener('touchstart', onStart, { capture: true, passive: true })
    document.addEventListener('touchmove', onMove, { capture: true, passive: false })
    document.addEventListener('touchend', reset, { capture: true, passive: true })
    document.addEventListener('touchcancel', reset, { capture: true, passive: true })
    return () => {
      document.removeEventListener('touchstart', onStart, true)
      document.removeEventListener('touchmove', onMove, true)
      document.removeEventListener('touchend', reset, true)
      document.removeEventListener('touchcancel', reset, true)
    }
  }, 'dsh-swipe-back: edge swipe')
}

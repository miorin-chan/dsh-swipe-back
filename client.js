/**
 * Browser half of `dsh-swipe-back`.
 *
 * On a phone the Web UI is a single screen: below 768px the left sidebar is a
 * modal drawer (`data-sidebar-drawer` on the frame, `data-sidebar-collapsed`
 * while closed), the right panel is a track (`data-rightbar-collapsed`), and a
 * global panel replaces the Conversation (`ctx.layout.panelInfo`).
 *
 * A left-edge swipe therefore means "back" first — close the drawer, leave the
 * global panel, or collapse the right panel — and only when nothing is open it
 * opens the session-list drawer. While the drawer is open it also accepts a
 * leftward swipe from anywhere (the iOS "throw the drawer away" move), and that
 * dismissal is safe in any context because the system back gesture only ever
 * runs rightwards from the edge. iOS never hands the system edge gesture to a
 * page, so the remaining steps are enabled in the standalone PWA and in a tab
 * with no history behind it, and stay out of the way everywhere else.
 */

window.__ModuleLoader__.load({
  id: 'dsh-swipe-back',
  factory() {
    const NS = 'dsh-swipe-back'
    /** Touch starting this close to the left edge begins a back gesture. */
    const EDGE = 20
    /** Horizontal travel that triggers it. */
    const DISTANCE = 50
    /** Vertical drift that cancels it (the gesture must stay horizontal). */
    const SLOP = 45
    /** Travel before the page stops scrolling under the finger. */
    const LOCK = 8

    const standalone = window.navigator.standalone === true
      || (typeof window.matchMedia === 'function'
        && window.matchMedia('(display-mode: standalone)').matches)

    // A browser tab with history behind it belongs to the system gesture.
    const backEnabled = standalone || window.history.length <= 1

    return {
      inject: ['layout', 'sidebarRight'],
      apply(ctx) {
        let start = null

        /** The frame element when the narrow drawer layout is active. */
        const frame = () => document.querySelector('[data-sidebar-drawer]')

        /** Whether the session-list drawer is currently open. */
        const drawerOpen = () => {
          const el = frame()
          return el !== null && !el.hasAttribute('data-sidebar-collapsed')
        }

        /** Close the topmost thing that a back gesture can close. */
        const back = () => {
          const el = frame()
          if (el === null) return false
          if (!el.hasAttribute('data-sidebar-collapsed')) {
            ctx.layout.toggleSidebar()
            return true
          }
          let panel = null
          try {
            panel = ctx.layout.panelInfo.getSnapshot()?.activePanelId ?? null
          } catch {
            panel = null
          }
          if (panel !== null) {
            ctx.layout.selectPanel(null)
            return true
          }
          if (!el.hasAttribute('data-rightbar-collapsed')) {
            ctx.sidebarRight.toggleExpanded()
            return true
          }
          return false
        }

        /** Back when possible; otherwise open the session list. */
        const decide = () => {
          if (back()) return
          if (frame() !== null) ctx.layout.toggleSidebar()
        }

        const reset = () => { start = null }

        const onStart = (event) => {
          reset()
          if (event.touches.length !== 1) return
          const touch = event.touches[0]
          // An open drawer takes a dismissal swipe from anywhere; the other
          // steps stay an edge gesture and only where the system leaves it be.
          const close = drawerOpen()
          if (!close && !backEnabled) return
          if (!close && touch.clientX > EDGE) return
          start = { x: touch.clientX, y: touch.clientY, close }
        }

        const onMove = (event) => {
          if (start === null) return
          if (event.touches.length !== 1) {
            reset()
            return
          }
          const touch = event.touches[0]
          const dx = touch.clientX - start.x
          const dy = touch.clientY - start.y
          // Dismissing the drawer accepts either direction; opening it and the
          // other back steps run rightwards from the left edge.
          const travel = start.close ? Math.abs(dx) : dx
          if (travel <= 0 || Math.abs(dy) > SLOP) {
            reset()
            return
          }
          if (travel > LOCK && event.cancelable) event.preventDefault()
          if (travel >= DISTANCE) {
            const close = start.close
            reset()
            if (close) ctx.layout.toggleSidebar()
            else decide()
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
        }, `${NS}: edge swipe`)
      },
    }
  },
})

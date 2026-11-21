import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import { runInNewContext } from 'node:vm'

const artifact = readFileSync(new URL('../client.js', import.meta.url), 'utf8')

function fixture({ panel = 'plugins', drawerOpen = false, rightOpen = false, history = 1, standalone = false } = {}) {
  const actions = []
  const listeners = new Map()
  const element = { getClientRects: () => [{}] }
  const state = { panel, drawerOpen, rightOpen, overlay: false, pages: [] }
  const button = Object.assign({}, element, {
    click() { actions.push(`back:${state.pages.pop()}`) },
    closest: () => null,
    matches: () => state.disabled === true,
  })
  const view = { ...element, querySelector: () => state.missingButton ? null : button }
  const plugins = {
    querySelectorAll: () => state.pages.length && state.pages.at(-1) !== 'more' ? [view] : [],
    querySelector: (selector) => state.pages.at(-1) === 'more' && (!state.missingButton || selector.includes('data-plugin-group')) ? button : null,
  }
  class KeyboardEvent {
    constructor(key, options) { this.type = key; Object.assign(this, options) }
  }
  const schedules = { querySelector: () => state.pages.length ? { ...element, dispatchEvent(event) {
    assert.equal(event.type, 'keydown')
    assert.equal(event.key, 'Escape')
    assert.equal(event.bubbles, true)
    actions.push(`back:${state.pages.pop()}`)
  } } : null }
  const main = { querySelector: (selector) => ({ '[data-plugin-panel]': state.panel === 'plugins' ? plugins : null,
    '[data-testid="task-manager-page"]': state.panel === 'schedules' ? schedules : null })[selector] ?? null }
  const frame = {
    hasAttribute: (name) => name === 'data-sidebar-collapsed' ? !state.drawerOpen : !state.rightOpen,
    querySelector: () => main,
  }
  const document = {
    querySelector: () => frame,
    querySelectorAll: () => state.overlay ? [element] : [],
    addEventListener: (name, listener) => listeners.set(name, listener),
    removeEventListener: (name) => listeners.delete(name),
  }
  let dispose
  runInNewContext(artifact, { document, KeyboardEvent, window: {
    navigator: { standalone }, matchMedia: () => ({ matches: false }), history: { length: history },
    getComputedStyle: () => ({ visibility: 'visible' }),
    __ModuleLoader__: { load({ factory }) { factory().apply({
      layout: {
        panelInfo: { getSnapshot: () => ({ activePanelId: state.panel }) },
        selectPanel: (panelId) => { state.panel = panelId; actions.push('conversation') },
        toggleSidebar: () => { state.drawerOpen = !state.drawerOpen; actions.push('drawer') },
      },
      sidebarRight: { toggleExpanded: () => { state.rightOpen = false; actions.push('rightbar') } },
      effect: (effect) => { dispose = effect() },
    }) } },
  } })
  return { actions, state, listeners, dispose, swipe({ x = 5, dx = 55, dy = 0 } = {}) {
    listeners.get('touchstart')({ touches: [{ clientX: x, clientY: 0 }] })
    const event = { touches: [{ clientX: x + dx, clientY: dy }], cancelable: true, preventDefault() {} }
    listeners.get('touchmove')(event)
    listeners.get('touchmove')(event)
    listeners.get('touchend')()
  } }
}

test('one swipe returns one Plugins level before returning to the conversation', () => {
  const { actions, state, swipe, dispose, listeners } = fixture()
  state.pages.push('more', 'bundle', 'row')
  swipe()
  assert.deepEqual(actions, ['back:row'])
  swipe()
  swipe()
  swipe()
  swipe()
  assert.deepEqual(actions, ['back:row', 'back:bundle', 'back:more', 'conversation', 'drawer'])
  dispose()
  assert.equal(listeners.size, 0)
})

test('market detail uses its own return control and a modal blocks the gesture', () => {
  const { actions, state, swipe } = fixture({ history: 3, standalone: true })
  state.pages.push('market')
  state.overlay = true
  swipe()
  state.overlay = false
  state.missingButton = true
  swipe()
  state.missingButton = false
  state.disabled = true
  swipe()
  assert.deepEqual(actions, [])
  state.disabled = false
  swipe()
  assert.deepEqual(actions, ['back:market'])
})

test('Schedules detail uses the page Escape handler before the panel closes', () => {
  const { actions, state, swipe } = fixture({ panel: 'schedules' })
  state.pages.push('schedule')
  swipe()
  assert.deepEqual(actions, ['back:schedule'])
  swipe()
  assert.deepEqual(actions, ['back:schedule', 'conversation'])
})

test('drawer dismissal, right sidebar, and system history retain their priorities', () => {
  const system = fixture({ history: 2, drawerOpen: true })
  system.swipe({ x: 180, dx: -55 })
  system.swipe()
  assert.deepEqual(system.actions, ['drawer'])
  const chat = fixture({ panel: null, rightOpen: true })
  chat.swipe({ x: 60 })
  chat.swipe({ dy: 70 })
  chat.swipe({ dx: -55 })
  assert.deepEqual(chat.actions, [])
  chat.swipe()
  chat.swipe()
  assert.deepEqual(chat.actions, ['rightbar', 'drawer'])
})

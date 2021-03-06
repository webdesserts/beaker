import { webFrame, ipcRenderer } from 'electron'
import * as tabs from './ui/tabs'
import * as navbar from './ui/navbar'
import * as win32Titlebar from './ui/win32-titlebar'
import * as sidebar from './ui/sidebar'
import * as pages from './pages'
import * as commandHandlers from './command-handlers'
import * as swipeHandlers from './swipe-handlers'

export function setup (cb) {
  if (window.process.platform == 'darwin') {
    document.body.classList.add('darwin')
  }
  if (window.process.platform == 'win32') {
    document.body.classList.add('win32')
  }

  // wire up event handlers
  ipcRenderer.on('window-event', onWindowEvent)
  document.addEventListener('dragover', preventDragDrop, false)
  document.addEventListener('drop', preventDragDrop, false)
  function preventDragDrop (event) {
    // important - dont allow drag/drop in the shell window, only into the webview
    if (!event.target || event.target.tagName != 'WEBVIEW') {
      event.preventDefault()
      return false
    }
  }

  // disable zooming in the shell window
  webFrame.setVisualZoomLevelLimits(1, 1)
  webFrame.setLayoutZoomLevelLimits(0, 0)

  // attach some window globals
  window.pages = pages

  // setup subsystems
  tabs.setup()
  navbar.setup()
  if (window.process.platform == 'win32') {
    win32Titlebar.setup()
  }
  sidebar.setup()
  commandHandlers.setup()
  swipeHandlers.setup()
  pages.setup()
  pages.setActive(pages.create(pages.FIRST_TAB_URL))
  cb()
}

function onWindowEvent (event, type) {
  if (type == 'blur') { document.body.classList.add('window-blurred') }
  if (type == 'focus') {
    document.body.classList.remove('window-blurred')
    try { pages.getActive().webviewEl.focus() } catch (e) {}
  }
  if (type == 'enter-full-screen') { document.body.classList.add('fullscreen') }
  if (type == 'leave-full-screen') { document.body.classList.remove('fullscreen') }
}

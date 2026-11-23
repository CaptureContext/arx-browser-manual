/*
  The state an animated Arx preview draws from.

  A scene builds one of these with `demoWorld()`, changes it step by step from its
  script, and the `Arx*` components under components/arx draw it the way Arx does.
  Sizes are Arx's own, in points, on a 1280 × 800 window (see BrowserMetrics in
  arx-browser's design system).
*/

export type ArxIcon =
  | { kind: 'arx' }
  | { kind: 'brand', name: string, color?: string }
  | { kind: 'letter', letter: string, bg: string, fg: string, serif?: boolean }
  | { kind: 'symbol', name: string }

export type ArxPage =
  | { kind: 'landing' }
  | { kind: 'article', title: string, lead: string, links?: string[], scroll?: number, selected?: boolean, corner?: boolean }
  | { kind: 'repo', org: string }
  | { kind: 'trailhead' }
  | { kind: 'chat', question: string, answer: string }
  /** Developer mode's explanation when nothing answers on a local port. */
  | { kind: 'error', host: string }
  /** A site's sign-in form; `signedIn` shows the account page instead. */
  | { kind: 'signin', site: string, user: string, password: string, signedIn: boolean, account: string }
  /** A site as a signed-in account sees it. */
  | { kind: 'account', site: string, account: string, color: string }
  | { kind: 'video', title: string, playing: boolean }
  /** An extension's page in the Chrome Web Store. */
  | { kind: 'store', name: string, installed: boolean }
  | { kind: 'meet' }
  /** A news site: a promo banner, a column of ads, a box of suggestions and a cookie banner. */
  | { kind: 'news', french: boolean, cookies: boolean, ads: boolean, hidden: string[], scroll?: number }
  /** A shop's checkout form. The number shows masked: a preview never shows a whole card number. */
  | { kind: 'checkout', number: string, name: string, expiry: string, focused?: string }
  /** A design file that asks you to sign in, and the same file signed in. */
  | { kind: 'design', signedIn: boolean }
  /** An account chooser, as a "Sign in with" popup shows. */
  | { kind: 'chooser', site: string, account: string }
  /** A streaming site, shown in WebKit. */
  | { kind: 'stream' }
  /** An extension's own unlock window. `typed` is how many dots its password field shows. */
  | { kind: 'unlock', name: string, typed: number }
  /** A page that asks for a permission from a button. */
  | { kind: 'ask', site: string }
  | { kind: 'blank' }

export interface ArxTab {
  id: string
  title: string
  url: string
  icon: ArxIcon
  page: ArxPage
  /** A tab on this computer: the sidebar tapes it and shows its host. */
  local?: boolean
  /** Shown in WebKit: the sidebar badges its icon with a compass. */
  webkit?: boolean
  /** What the hover card of a page that isn't loaded shows: a saved picture, the site's own preview image, or none. */
  unloaded?: { picture: 'saved' | 'site' | 'none', description: string, when: string }
  /** What a Favorite's preview card lists: unread mail, or recent pages. */
  preview?: { kind: 'mail' | 'recent', items: { title: string, detail: string, time?: string }[] }
}

export type ArxItem =
  | { type: 'tab', id: string }
  | { type: 'folder', id: string, name: string, open: boolean, children: ArxItem[] }

export interface ArxSpace {
  id: string
  name: string
  icon: string
  profile: string
  favorites: string[]
  pinned: ArxItem[]
  open: string[]
}

export interface ArxMenuItem {
  label?: string
  icon?: string
  shortcut?: string
  danger?: boolean
  checked?: boolean
  submenu?: boolean
  separator?: boolean
  disabled?: boolean
  bold?: boolean
}

export interface ArxMenu {
  /** Top-left corner, in window points. */
  x: number
  y: number
  items: ArxMenuItem[]
  highlighted?: number
  sub?: { items: ArxMenuItem[], highlighted?: number }
}

export interface ArxCommandAction {
  title: string
  shortcut: string
  icon: string
  danger?: boolean
}

export interface ArxHistoryEntry {
  id: string
  day: string
  time: string
  title: string
  address: string
  icon: ArxIcon
}

/** The colors editor of a space, a profile or Arx as a whole. */
export interface ArxThemeEditor {
  level: 'space' | 'profile' | 'global'
  dots: { x: number, y: number, color: string }[]
  intensity: number
  matchSite?: { on: boolean, inherited: boolean | null }
  accent?: { inherited: boolean | null, selected: string | null }
}

export const ACCENTS: Record<string, string> = {
  Indigo: 'rgb(81 71 232)',
  Blue: 'rgb(10 122 255)',
  Purple: 'rgb(155 81 224)',
  Pink: 'rgb(235 76 145)',
  Red: 'rgb(233 66 63)',
  Orange: 'rgb(240 136 46)',
  Yellow: 'rgb(222 170 20)',
  Green: 'rgb(46 178 87)',
  Teal: 'rgb(0 165 174)',
  Graphite: 'rgb(128 128 134)',
}

export interface ArxCommandRow {
  title: string
  subtitle?: string
  icon: ArxIcon
  action?: string
}

export interface ArxChatMessage {
  role: 'user' | 'assistant'
  text: string
  attachments?: ArxAttachment[]
}

export interface ArxAttachment {
  id: string
  name: string
  kind: 'image' | 'screenshot' | 'capture'
}

export interface ArxWorld {
  tabs: Record<string, ArxTab>
  spaces: ArxSpace[]
  /** The space on screen. During a swipe it moves by fractions. */
  space: number
  selected: string | null
  sidebarHidden: boolean
  /** A sidebar row drawn as hovered. */
  hovered: string | null
  /** The preview card beside a sidebar row; `query` is typed into a folder card's search field. */
  card: { id: string, kind: 'tab' | 'folder', query?: string } | null
  commandBar: {
    query: string
    completion: string
    rows: ArxCommandRow[]
    highlighted: number
    agent: boolean
    /** A site search or bang in progress, shown as a chip before the text. */
    chip?: { label: string, icon: ArxIcon }
    /** Actions ⌘K in the corner, and the highlighted result's actions once it's open. */
    actions?: { open: boolean, query: string, items: ArxCommandAction[], highlighted: number }
  } | null
  chat: {
    width: number
    title: string
    model: string
    messages: ArxChatMessage[]
    suggestions: string[]
    thinking: boolean
    pinned?: boolean
    /** Files and captures waiting in the message box, and a drag hovering over it. */
    attachments?: ArxAttachment[]
    dropping?: boolean
    draft?: string
  } | null
  peek: { tab: string, origin: [number, number], open: boolean } | null
  /** Two panes side by side, or stacked; `ratio` is the first pane's share. */
  split: { panes: [string, string], focused: 0 | 1, ratio: number, vertical: boolean } | null
  /** The page's zoom, and the level badge Arx shows for a moment after a change. */
  pageZoom: number
  zoomBadge: string | null
  /** With the sidebar hidden, it slides back over the page while the pointer is at the left edge. */
  sidebarFloating: boolean
  dropZone: 'right' | null
  drag: { id: string, x: number, y: number } | null
  menu: ArxMenu | null
  toast: { text: string, action?: string } | null
  /** A folder whose name is being edited in place. */
  renaming: { id: string, text: string } | null
  /** Favorites being dragged: `index` is the tile that's lifted. */
  tileDrag: { index: number } | null
  /** The Library, in place of the sidebar. */
  library: { section: 'archive' | 'media' | 'history' | null, query: string, archive: ArxArchived[], restoring: string | null, media?: string[], history?: ArxHistoryEntry[], scroll?: number } | null
  /** The site menu under the address bar. */
  siteMenu: ArxSiteMenu | null
  /** Capture Area: the outlined block or drawn area, and the menu beside it. */
  capture: { rect: [number, number, number, number], picking: boolean, menu: boolean, highlighted?: number, device?: { portrait: boolean, hue: number } } | null
  /** A save panel, as a sheet from the window's top. */
  saveSheet: { name: string } | null
  /** Developer mode: the developer header on local pages, and DevTools docked in a page. */
  developerMode: boolean
  devtools: {
    tab: string
    panel: 'Elements' | 'Console'
    picked: boolean
    highlight: [number, number, number, number] | null
    /** Docked on the right (with its width), at the bottom, or in its own window. */
    dock?: 'right' | 'bottom' | 'window'
    width?: number
  } | null
  /** The Settings window over the browser window. */
  settings: ArxSettings | null
  /** A two-finger swipe back: the arrow's progress, then the history list beside it. */
  backSwipe: { progress: number, list: { rows: { title: string, host: string }[], selected: number } | null } | null
  /** The address bar shows the whole address instead of the site's name. */
  fullUrl: boolean
  /** Dialogs, other apps' windows and system panels over the Arx window, back to front. */
  overlays: ArxOverlay[]
  /** Hides the Arx window, for scenes that start in another app. */
  windowHidden: boolean
  /** The label at the page's bottom corner that says where a link goes. */
  linkStatus: { verb?: string, address: string, action?: string, side: 'left' | 'right' } | null
  /** The address bar's second line, such as Translation Available. */
  addressNote: string | null
  /** Reading mode: the page button in the address bar, and the article over the page. */
  readerButton: boolean
  reader: { theme: 'Light' | 'Sepia' | 'Gray' | 'Dark', size: number } | null
  /** Tabs with sound: their volume, and the tab whose volume popover is open. */
  audio: Record<string, { level: number, muted: boolean }>
  volume: string | null
  /** The homepage, when a space has no tab open. `turn` restarts the tip's progress bar. */
  homepage: { tip: number, total: number, text: string, turn: number } | null
  /** Hide Element: the outline under the pointer, the toast, and its list of hidden elements. */
  picker: {
    outline: { rect: [number, number, number, number], label: string } | null
    list: boolean
    site: string
    entries: { id: string, title: string, detail: string }[]
    canUndo: boolean
    note: boolean
  } | null
  /** How the window is colored: what shows behind it, how solid it is, its tint, and accents by level. */
  look: {
    wallpaper: boolean
    opacity: number
    tint: string | null
    ink: 'light' | 'dark' | null
    accent: { global: string | null, profiles: Record<string, string>, spaces: Record<string, string> }
  }
}

export interface ArxDialogRow {
  label: string
  detail?: string
  icon?: string
  value?: string
  toggle?: boolean
  check?: boolean
  popup?: string
}

/** A row of a settings-style card: a label with whatever controls it carries. */
export interface ArxFormRow {
  label: string
  detail?: string
  icon?: string
  favicon?: ArxIcon
  tone?: 'orange' | 'green' | 'red'
  toggle?: boolean
  check?: boolean
  value?: string
  popup?: string
  button?: string
  link?: string
  spinner?: boolean
  progress?: number
  field?: string
  placeholder?: string
  focused?: boolean
  mark?: boolean
  selected?: boolean
  dim?: boolean
  fresh?: boolean
  mono?: boolean
  slider?: number
  swatches?: { color: string, on?: boolean }[]
}

export interface ArxFormSection {
  header?: string
  caption?: string
  editor?: ArxThemeEditor
  action?: string
  rows: ArxFormRow[]
  footer?: string
}

export interface ArxFormButton {
  label: string
  primary?: boolean
  danger?: boolean
  plain?: boolean
  left?: boolean
  disabled?: boolean
  hint?: string
}

/** A sheet, popover or assistant window built the way Arx builds its settings. */
export interface ArxForm {
  id: string
  chrome?: 'sheet' | 'window' | 'popover' | 'plain'
  title?: string
  subtitle?: string
  icon?: ArxIcon
  close?: boolean
  trailing?: string
  hero?: { title: string, message: string }
  tiles?: { name: string, status: string, color: string, on?: boolean, disabled?: boolean }[]
  lead?: string
  sections: ArxFormSection[]
  note?: string
  buttons?: ArxFormButton[]
  /** Icon buttons at the right of the header bar. */
  tools?: { icon: string, id: string, spinning?: boolean }[]
  /** A list beside the sections, as the Extensions sheet has. */
  aside?: { title: string, detail: string, warning?: string, mark?: boolean, selected?: boolean, color: string }[]
}

export type ArxOverlay =
  | { kind: 'form', form: ArxForm, width: number, height?: number, at?: [number, number], dim?: boolean }
  /** The list under a form field: saved accounts or cards, then Chromium's manage row. */
  | { kind: 'autofill', x: number, y: number, w: number, icon: string, rows: { title: string, subtitle?: string }[], manage: string, selected: number | null }
  /** A prompt card on a window: an icon, a question, and stacked buttons with the main one last. */
  | {
      kind: 'prompt'
      id: string
      icon: ArxIcon
      badge?: { icon: string }
      title: string
      body?: string
      link?: string
      note?: string
      check?: { label: string, on: boolean }
      buttons: { label: string, primary?: boolean, hint?: string }[]
      busy?: string
      /** The card's center, in window points; the window's center when missing. */
      at?: [number, number]
    }
  /** The Runway: Air Traffic Control's list of profiles for a link from another app. */
  | { kind: 'runway', x: number, y: number, link: string, rows: { profile: string, space: string, icon: string }[], selected: number }
  /** Another app's window, drawn as a title and a few lines. */
  | {
      kind: 'app'
      id: string
      x: number
      y: number
      w: number
      h: number
      title: string
      heading?: string
      lines: { text: string, detail?: string, link?: boolean, toggle?: boolean, value?: string, tone?: 'green', icon?: string, button?: string }[]
    }
  /** Device capture's popover under the developer header's Capture button. */
  | { kind: 'devicecapture', x: number, y: number, portrait: boolean, hue: number }
  | {
      kind: 'dialog'
      id: string
      title: string
      subtitle?: string
      icon?: ArxIcon
      body?: string
      fields?: { label: string, value: string, secure?: boolean, focused?: boolean }[]
      rows?: ArxDialogRow[]
      list?: { title: string, detail?: string, icon?: ArxIcon, badge?: string }[]
      buttons?: { label: string, primary?: boolean, danger?: boolean }[]
      note?: string
      /** Top-left in window points; centered when missing. */
      at?: [number, number]
      width?: number
      dim?: boolean
    }
  | { kind: 'terminal', x: number, y: number, w: number, h: number, lines: string[], typing: string }
  | { kind: 'messages', x: number, y: number, w: number, h: number }
  | { kind: 'calendar', x: number, y: number, w: number, h: number, popover: boolean }
  | { kind: 'finder', x: number, y: number, w: number, h: number, files: { name: string, kind: 'image' | 'csv' | 'pdf' }[], lifted?: string }
  | { kind: 'panel', title: string, items: string[], selected: number, action: string }
  | { kind: 'touchid', reason: string }
  | { kind: 'little', x: number, y: number, w: number, h: number, tab: string, space?: string, profile?: string }
  | { kind: 'pip', x: number, y: number, w: number, h: number, title: string }
  | { kind: 'banner', text: string, action: string }
  | { kind: 'onboarding', step: 'welcome' | 'browsers' | 'review' | 'done', selected?: string, title?: string }
  | { kind: 'download', file: string, folder: string }

export interface ArxArchived {
  id: string
  when: string
}

export interface ArxSiteMenu {
  /** Block ads and trackers, for this site. Shown as the first row of Site Settings when set. */
  blocking?: boolean
  /** The profile's extensions as tiles; the demo three when missing. */
  extensions?: { name: string, color: string, dot?: boolean }[]
  /** An extension's own popup, under its tile. */
  popup?: { name: string, color: string }
  host: string
  /** Each permission's pop-up shows the value the site gets, such as Ask; `set` when it's the site's own. */
  permissions: { label: string, icon: string, value: string, set?: boolean }[]
  confirmClear: boolean
  /** The Open in WebKit and Dark page buttons' states; off when missing. */
  webKit?: boolean
  darkPage?: boolean
}

export interface ArxSettingsRow {
  label: string
  detail: string
  count: string
  checked: boolean
}

/** An App Links handler card in Settings → Links, with its app picker. */
export interface ArxAppLinks {
  /** Whether a handler card is there yet. */
  card: boolean
  name: string
  scheme: string
  saved: boolean
  picker: { query: string, apps: { name: string, scheme: string, color: string }[], highlighted: number } | null
  routes: { title: string, handling: string, script?: { text: string, focused: boolean } }[]
}

export interface ArxSettings {
  /** A pane drawn from sections, as most of Settings is: General, Appearance & Sound and so on. */
  custom?: { pane: string, title: string, subtitle?: string, back?: boolean, sections: ArxFormSection[], scroll?: number }
  appLinks?: ArxAppLinks
  /** The pane on show: a profile's page, or Links, Passwords, Agents, Developer. */
  pane: 'profile' | 'links' | 'passwords' | 'agents' | 'developer' | 'custom' | 'applinks'
  /** How far the profile pane is scrolled, in points; 230 puts Downloads at the top. */
  scroll: number
  downloadsFolder: string
  askWhereToSave: boolean
  fullUrl: boolean
  developerMode: boolean
  routes: { host: string, space: string, open: string }[]
  tester: { text: string, result: string }
  passwords: { site: string, user: string, shown: boolean }[]
  passwordQuery: string
  agents: { name: string, detail: string }[]
  sheet: null | 'site' | 'clear'
  addSite: { text: string } | null
  defaults: { label: string, value: string }[]
  sites: { host: string, permission: string, value: string }[]
  defaultZoom: string
  range: string
  rows: ArxSettingsRow[]
}

export const ICON = {
  arx: { kind: 'arx' } as ArxIcon,
  github: { kind: 'brand', name: 'brand-github' } as ArxIcon,
  google: { kind: 'brand', name: 'brand-google', color: '#4285f4' } as ArxIcon,
  apple: { kind: 'brand', name: 'brand-apple' } as ArxIcon,
  youtube: { kind: 'brand', name: 'brand-youtube', color: '#ff0033' } as ArxIcon,
  x: { kind: 'brand', name: 'brand-x' } as ArxIcon,
  figma: { kind: 'brand', name: 'brand-figma', color: '#a259ff' } as ArxIcon,
  slack: { kind: 'brand', name: 'brand-slack', color: '#e01e5a' } as ArxIcon,
  swift: { kind: 'brand', name: 'brand-swift', color: '#f05138' } as ArxIcon,
  jira: { kind: 'brand', name: 'brand-jira', color: '#2684ff' } as ArxIcon,
  linkedin: { kind: 'brand', name: 'brand-linkedin', color: '#0a66c2' } as ArxIcon,
  vercel: { kind: 'brand', name: 'brand-vercel' } as ArxIcon,
  wiki: { kind: 'letter', letter: 'W', bg: '#fff', fg: '#111', serif: true } as ArxIcon,
  trailhead: { kind: 'letter', letter: 'T', bg: '#1f3d2b', fg: '#fff' } as ArxIcon,
  gmail: { kind: 'letter', letter: 'M', bg: '#fff', fg: '#ea4335' } as ArxIcon,
  linear: { kind: 'letter', letter: 'L', bg: '#5e6ad2', fg: '#fff' } as ArxIcon,
  shop: (letter: string, bg: string): ArxIcon => ({ kind: 'letter', letter, bg, fg: '#fff' }),
}

function tab(id: string, title: string, url: string, icon: ArxIcon, page: ArxPage = { kind: 'blank' }, local = false): ArxTab {
  return { id, title, url, icon, page, local }
}

const article = (title: string, lead: string): ArxPage => ({ kind: 'article', title, lead })

/** The demo browser every scene starts from: three spaces, each in its own profile. */
export function demoWorld(): ArxWorld {
  const tabs: ArxTab[] = [
    tab('arx', 'Arx: a free, open-source browser for Mac', 'arxbrowser.net', ICON.arx, { kind: 'landing' }),
    tab('browser', 'Web browser - Wikipedia', 'en.wikipedia.org/wiki/Web_browser', ICON.wiki, article('Web browser', 'A web browser is an application for accessing websites. When a user requests a web page from a particular website, the browser retrieves its files from a web server and then displays the page on the screen.')),
    tab('swift', 'Swift.org', 'swift.org', ICON.swift, article('Swift', 'Swift is a general-purpose programming language that’s approachable for newcomers and powerful for experts. It is fast, modern, safe, and a joy to write.')),
    tab('apple-dev', 'Apple Developer', 'developer.apple.com', ICON.apple, article('Apple Developer', 'There’s never been a better time to develop for Apple platforms. Explore the latest tools, frameworks and sessions.')),
    tab('repos', 'capturecontext · GitHub', 'github.com/capturecontext', ICON.github, { kind: 'repo', org: 'capturecontext' }),
    tab('forums', 'Swift Forums', 'forums.swift.org', ICON.swift, article('Swift Forums', 'Discussion about the Swift language, its evolution and the projects around it.')),
    tab('talks', 'WWDC sessions', 'youtube.com/@apple', ICON.youtube, article('WWDC sessions', 'Sessions and labs from Apple’s Worldwide Developers Conference.')),
    tab('trailers', 'Trailers', 'youtube.com/feed/trailers', ICON.youtube, article('Trailers', 'The newest trailers, all in one place.')),
    // Favorites, Personal
    tab('fav-cc', 'CaptureContext', 'capturecontext.dev', ICON.arx, { kind: 'landing' }),
    tab('fav-github', 'GitHub', 'github.com', ICON.github, { kind: 'repo', org: 'capturecontext' }),
    tab('fav-youtube', 'YouTube', 'youtube.com', ICON.youtube),
    tab('fav-x', 'X', 'x.com', ICON.x),
    tab('fav-figma', 'Figma', 'figma.com', ICON.figma),
    tab('fav-slack', 'Slack', 'app.slack.com', ICON.slack),
    tab('fav-swift', 'Swift', 'swift.org', ICON.swift),
    tab('fav-google', 'Google', 'google.com', ICON.google),
    // Shops
    tab('boots', 'Hiking boots', 'trailgear.example/boots', ICON.shop('T', '#2f7d4f')),
    tab('jackets', 'Rain jackets', 'trailgear.example/jackets', ICON.shop('T', '#2f7d4f')),
    tab('boards', 'Snowboards', 'snowshop.example', ICON.shop('S', '#2a6fdb')),
    tab('bindings', 'Bindings', 'snowshop.example/bindings', ICON.shop('S', '#2a6fdb')),
    tab('rings', 'Silver rings', 'silverhouse.example', ICON.shop('S', '#9a7b4f')),
    tab('snowboard', 'Snowboard - Wikipedia', 'en.wikipedia.org/wiki/Snowboard', ICON.wiki, article('Snowboard', 'Snowboards are boards where both feet are secured to the same board, which are wider than skis, with the ability to glide on snow.')),
    // Work
    tab('w-slack', 'Slack', 'app.slack.com', ICON.slack),
    tab('w-jira', 'Jira', 'jira.example', ICON.jira),
    tab('w-figma', 'Figma', 'figma.com', ICON.figma),
    tab('w-github', 'GitHub', 'github.com', ICON.github, { kind: 'repo', org: 'capturecontext' }),
    tab('w-vercel', 'Vercel', 'vercel.com', ICON.vercel),
    tab('w-linkedin', 'LinkedIn', 'linkedin.com', ICON.linkedin),
    tab('pr-mine', 'Pull requests · Mine', 'github.com/pulls', ICON.github),
    tab('pr-review', 'Pull requests · Review', 'github.com/pulls/review-requested', ICON.github),
    tab('dashboard', 'Status dashboard', 'status.example', ICON.vercel),
    tab('w-repos', 'capturecontext · GitHub', 'github.com/capturecontext', ICON.github, { kind: 'repo', org: 'capturecontext' }),
    // Opened during scenes
    tab('app-software', 'Application software - Wikipedia', 'en.wikipedia.org/wiki/Application_software', ICON.wiki, article('Application software', 'Application software is any computer program intended for end-user use, such as a word processor, a game or a browser.')),
    tab('web-page', 'Web page - Wikipedia', 'en.wikipedia.org/wiki/Web_page', ICON.wiki, article('Web page', 'A web page is a document on the World Wide Web, delivered by a web server and displayed in a browser.')),
    tab('browser-utm', 'Web browser - Wikipedia', 'en.wikipedia.org/wiki/Web_browser?utm_source=newsletter&utm_medium=email', ICON.wiki, article('Web browser', 'A web browser is an application for accessing websites. When a user requests a web page from a particular website, the browser retrieves its files from a web server and then displays the page on the screen.')),
    tab('gh-search', 'Search · swift-composable-architecture', 'github.com/search?q=swift-composable-architecture', ICON.github, { kind: 'repo', org: 'pointfreeco' }),
    tab('chromium', 'Chromium (web browser) - Wikipedia', 'en.wikipedia.org/wiki/Chromium_(web_browser)', ICON.wiki, article('Chromium', 'Chromium is a free and open-source web browser project, mainly developed and maintained by Google. Its source code is the basis of many browsers.')),
    tab('hiking', 'Hiking - Wikipedia', 'en.wikipedia.org/wiki/Hiking', ICON.wiki, article('Hiking', 'Hiking is a long, vigorous walk, usually on trails or footpaths in the countryside.')),
    tab('chat-tab', 'Summarize this page', 'chat', { kind: 'symbol', name: 'stars' }, { kind: 'chat', question: 'Summarize this page', answer: '' }),
    tab('w-gmail', 'Gmail', 'mail.google.com', ICON.gmail),
    tab('w-linear', 'Linear', 'linear.app', ICON.linear),
    tab('gh-personal', 'GitHub', 'github.com', ICON.github, { kind: 'account', site: 'GitHub', account: 'max-krouk', color: '#2da44e' }),
    tab('gh-work', 'GitHub', 'github.com', ICON.github, { kind: 'account', site: 'GitHub', account: 'max-capturecontext', color: '#8250df' }),
    tab('signin', 'Sign in to GitHub', 'github.com/login', ICON.github, { kind: 'signin', site: 'GitHub', user: '', password: '', signedIn: false, account: 'max-krouk' }),
    tab('talk', 'Swift concurrency, explained', 'youtube.com/watch?v=swift', ICON.youtube, { kind: 'video', title: 'Swift concurrency, explained', playing: false }),
    tab('store', 'Focus Reader - Chrome Web Store', 'chromewebstore.google.com/detail/focus-reader', ICON.google, { kind: 'store', name: 'Focus Reader', installed: false }),
    tab('meet', 'Design review - Meet', 'meet.google.com/abc-defg-hij', { kind: 'letter', letter: 'M', bg: '#00897b', fg: '#fff' }, { kind: 'meet' }),
    tab('release', 'Arx 0.9 release notes', 'capturecontext.dev/blog/arx-0-9', ICON.arx, article('Arx 0.9', 'Spaces sync their order, Peek opens from Favorites, and the command bar finds closed tabs.')),
    // Sites for the newer scenes
    tab('news', 'The Daily Ledger', 'dailyledger.example', { kind: 'letter', letter: 'D', bg: '#111', fg: '#fff', serif: true }, { kind: 'news', french: false, cookies: false, ads: false, hidden: [] }),
    tab('checkout', 'Checkout · Trailgear', 'trailgear.example/checkout', ICON.shop('T', '#2f7d4f'), { kind: 'checkout', number: '', name: '', expiry: '' }),
    tab('design', 'Onboarding flow – Figma', 'figma.com/design/onboarding-flow', ICON.figma, { kind: 'design', signedIn: false }),
    tab('chooser', 'Sign in – Google Accounts', 'accounts.google.com', ICON.google, { kind: 'chooser', site: 'Figma', account: 'max.krouk@example.com' }),
    tab('stream', 'Netflix', 'netflix.com', { kind: 'symbol', name: 'play-filled' }, { kind: 'stream' }),
    tab('unlock', '1Password', '1Password', { kind: 'letter', letter: '1', bg: '#1a66d6', fg: '#fff' }, { kind: 'unlock', name: '1Password', typed: 0 }),
    tab('ask', 'Notifications · GitHub', 'github.com/settings/notifications', ICON.github, { kind: 'ask', site: 'GitHub' }),
    // Developer
    tab('local', 'Trailhead — local', 'localhost:3000', ICON.trailhead, { kind: 'trailhead' }, true),
  ]
  const t = (id: string): ArxItem => ({ type: 'tab', id })
  return {
    tabs: Object.fromEntries(tabs.map(item => [item.id, item])),
    spaces: [
      {
        id: 'personal', name: 'Personal', icon: 'house', profile: 'Personal',
        favorites: ['fav-cc', 'fav-github', 'fav-youtube', 'fav-x', 'fav-figma', 'fav-slack', 'fav-swift', 'fav-google'],
        pinned: [
          { type: 'folder', id: 'code', name: 'Swift', open: true, children: [t('swift'), t('forums')] },
          { type: 'folder', id: 'watch', name: 'Watch later', open: true, children: [t('talks'), t('trailers')] },
          t('apple-dev'),
        ],
        open: ['arx', 'browser', 'repos'],
      },
      {
        id: 'shops', name: 'Shops', icon: 'cart', profile: 'Shops',
        favorites: [],
        pinned: [
          { type: 'folder', id: 'hiking', name: 'Hiking', open: true, children: [t('boots'), t('jackets')] },
          { type: 'folder', id: 'snow', name: 'Snowboarding', open: true, children: [t('boards'), t('bindings')] },
          t('rings'),
        ],
        open: ['snowboard'],
      },
      {
        id: 'work', name: 'Work', icon: 'monitor', profile: 'Work',
        favorites: ['w-gmail', 'w-slack', 'w-linear', 'w-figma', 'w-github', 'w-jira'],
        pinned: [
          { type: 'folder', id: 'prs', name: 'Pull Requests', open: true, children: [t('pr-mine'), t('pr-review')] },
          t('dashboard'),
        ],
        open: ['w-repos'],
      },
    ],
    space: 0,
    selected: 'arx',
    sidebarHidden: false,
    hovered: null,
    card: null,
    commandBar: null,
    chat: null,
    peek: null,
    split: null,
    pageZoom: 1,
    zoomBadge: null,
    sidebarFloating: false,
    dropZone: null,
    drag: null,
    menu: null,
    toast: null,
    renaming: null,
    tileDrag: null,
    library: null,
    siteMenu: null,
    capture: null,
    saveSheet: null,
    developerMode: false,
    devtools: null,
    settings: null,
    backSwipe: null,
    fullUrl: false,
    overlays: [],
    windowHidden: false,
    linkStatus: null,
    addressNote: null,
    readerButton: false,
    reader: null,
    audio: {},
    volume: null,
    homepage: null,
    picker: null,
    look: { wallpaper: false, opacity: 1, tint: null, ink: null, accent: { global: null, profiles: {}, spaces: {} } },
  }
}

// A tab's speaker: more waves the louder it is, crossed out when muted.
const SPEAKERS = [{ icon: 'speaker-off' }, { icon: 'speaker-low' }, { icon: 'speaker-on' }, { icon: 'speaker-high' }]
export function speakerIcon(audio: { level: number, muted: boolean }) {
  return SPEAKERS[audio.muted ? 0 : audio.level < 1 / 3 ? 1 : audio.level < 2 / 3 ? 2 : 3]!.icon
}

/** The tab a space shows: its selected tab when it's in that space, otherwise its first open tab. */
export function selectedIn(world: ArxWorld, space: ArxSpace): string | null {
  if (world.homepage) return null
  const ids = new Set<string>([...space.favorites, ...space.open])
  const walk = (items: ArxItem[]) => items.forEach(item => item.type === 'tab' ? ids.add(item.id) : walk(item.children))
  walk(space.pinned)
  if (world.selected && ids.has(world.selected)) return world.selected
  return space.open[0] ?? space.favorites[0] ?? null
}

/** Selects a tab, adding it to the current space's open tabs when it isn't in the sidebar yet. */
export function openTab(world: ArxWorld, id: string) {
  const space = world.spaces[Math.round(world.space)]!
  const ids = new Set<string>([...space.favorites, ...space.open])
  const walk = (items: ArxItem[]) => items.forEach(item => item.type === 'tab' ? ids.add(item.id) : walk(item.children))
  walk(space.pinned)
  if (!ids.has(id)) space.open.push(id)
  world.selected = id
}

/** Settings as a fresh demo profile has them. */
export function demoSettings(): ArxSettings {
  return {
    pane: 'profile',
    scroll: 230,
    downloadsFolder: 'Downloads',
    askWhereToSave: false,
    fullUrl: false,
    developerMode: false,
    routes: [{ host: 'figma.com', space: 'Work', open: 'Tab' }],
    tester: { text: '', result: '' },
    passwords: [
      { site: 'github.com', user: 'max@capturecontext.dev', shown: false },
      { site: 'linear.app', user: 'max@capturecontext.dev', shown: false },
      { site: 'figma.com', user: 'max@capturecontext.dev', shown: false },
      { site: 'swift.org', user: 'maxk', shown: false },
    ],
    passwordQuery: '',
    agents: [{ name: 'Claude Code', detail: 'Personal · Read tabs' }],
    sheet: null,
    addSite: null,
    defaults: [
      { label: 'Camera', value: 'Ask' },
      { label: 'Microphone', value: 'Ask' },
      { label: 'Location', value: 'Ask' },
      { label: 'Notifications', value: 'Ask' },
      { label: 'Pop-ups and redirects', value: 'Block' },
      { label: 'Clipboard', value: 'Ask' },
    ],
    sites: [],
    defaultZoom: '100%',
    range: 'Last hour',
    rows: [
      { label: 'Browsing history', detail: 'Pages you visited, as Arx lists them in History and suggestions.', count: 'Pages: 4', checked: true },
      { label: 'Download history', detail: 'Finished downloads in the Downloads list. The files stay where they are.', count: 'Downloads: 0', checked: false },
      { label: 'Cookies and other site data', detail: 'Signs you out of most sites.', count: 'Sites: 3', checked: true },
      { label: 'Cached images and files', detail: 'Some sites may load more slowly the next time you visit.', count: '1.2 MB', checked: true },
      { label: 'Autofill form data', detail: 'Saved form entries, addresses and payment cards.', count: 'Entries: 0', checked: false },
      { label: 'Site settings', detail: 'Permissions and page zoom you set for sites.', count: 'Sites: 0', checked: false },
    ],
  }
}

/** Removes a tab from wherever it is in a space's sidebar. */
export function removeTab(space: ArxSpace, id: string) {
  space.open = space.open.filter(item => item !== id)
  space.favorites = space.favorites.filter(item => item !== id)
  // In place, so a scene's references to folders stay valid.
  const walk = (items: ArxItem[]) => {
    for (let index = items.length - 1; index >= 0; index--) {
      const item = items[index]!
      if (item.type === 'tab' && item.id === id) items.splice(index, 1)
      else if (item.type === 'folder') walk(item.children)
    }
  }
  walk(space.pinned)
}

/** Finds a folder anywhere in a space's pinned items. */
export function findFolder(items: ArxItem[], id: string): Extract<ArxItem, { type: 'folder' }> | undefined {
  for (const item of items) {
    if (item.type !== 'folder') continue
    if (item.id === id) return item
    const found = findFolder(item.children, id)
    if (found) return found
  }
}

/** Unread mail and recent pages for the Work Favorites' preview cards. */
export function withPreviews(world: ArxWorld) {
  world.tabs['w-gmail']!.preview = {
    kind: 'mail',
    items: [
      { title: 'Design review moved to 3 pm', detail: 'Anna Petrova', time: '10:42' },
      { title: 'Your invoice for November', detail: 'Vercel', time: '9:15' },
      { title: 'Re: Arx beta feedback', detail: 'Jonas Weber', time: 'Yesterday' },
    ],
  }
  world.tabs['w-linear']!.preview = {
    kind: 'recent',
    items: [
      { title: 'DEV-796 Prepare the manual\u2019s clips', detail: 'Arx · In Progress' },
      { title: 'DEV-809 Site icons for unloaded tabs', detail: 'Arx · Done' },
      { title: 'Public beta', detail: 'Project · 72%' },
    ],
  }
}

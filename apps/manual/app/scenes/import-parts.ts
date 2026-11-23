/* The welcome window's "Make it yours" page and the full migration assistant, shared by the import scenes. */
import type { ArxForm, ArxFormRow } from '~/utils/arxModel'

const TILES = [
  { name: 'Arc', status: 'Used most recently', color: '#fb4f4f' },
  { name: 'Google Chrome', status: 'On this Mac', color: '#4285f4' },
  { name: 'Safari', status: 'Your default browser', color: '#1e90ff' },
  { name: 'Firefox', status: 'On this Mac', color: '#ff7139' },
]

/** The welcome window with a browser picked and its card of rows. */
export function welcome(browser: string, rows: ArxFormRow[], bring = true): ArxForm {
  return {
    id: 'welcome', chrome: 'window',
    hero: { title: 'Make it yours.', message: 'Bring tabs, bookmarks and history from the browser you use now. It all stays on this Mac.' },
    tiles: TILES.map(tile => ({ ...tile, on: tile.name === browser })),
    sections: [{ rows }],
    note: `Arx only reads ${browser}. Nothing there changes. Customize…`,
    buttons: [{ label: 'Start Fresh', plain: true }, { label: `Bring from ${browser}`, primary: true, hint: '↩', disabled: !bring }],
  }
}

/** The full assistant on its first step: the source and the kinds of data. */
export function assistant(source: string, kinds: string[], clear = false): ArxForm {
  return {
    id: 'assistant', chrome: 'window', title: 'Import Browser Data', subtitle: source, close: true, trailing: 'Choose a File…',
    sections: [
      { rows: [{ label: 'Source', popup: source }], footer: 'Arx only reads the other browser. Nothing there changes.' },
      {
        header: 'Data to Import',
        rows: [
          ...kinds.map(label => ({ label, toggle: true })),
          { label: 'Passwords and sign-ins', detail: 'Each profile\'s passwords go where its tabs go.', toggle: false },
        ],
      },
      ...(clear ? [{ rows: [{ label: 'Clear Arx Data First', toggle: false }], footer: 'Start from a clean Arx: each imported profile becomes a fresh Arx profile. You\'ll see what gets removed first.' }] : []),
    ],
    buttons: [{ label: 'Continue', primary: true, hint: '↩' }],
  }
}

export const WINDOW = { width: 760, height: 540, dim: true }

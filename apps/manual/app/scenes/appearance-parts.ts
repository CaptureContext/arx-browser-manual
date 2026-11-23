/* The Appearance panel and Settings → Appearance & Sound, shared by the scenes about colors. */
import type { ArxForm, ArxFormSection, ArxSettings, ArxThemeEditor } from '~/utils/arxModel'
import { demoSettings } from '~/utils/arxModel'

/** A space's or profile's floating Appearance panel. */
export function panel(editor: ArxThemeEditor): ArxForm {
  return { id: 'appearance', chrome: 'popover', sections: [{ editor, rows: [] }] }
}

/** Settings → Appearance & Sound, with the Window background editor. */
export function appearanceSettings(editor: ArxThemeEditor): ArxSettings {
  const settings = demoSettings()
  settings.pane = 'custom'
  settings.custom = { pane: 'Appearance & Sound', title: 'Appearance & Sound', sections: [windowBackground(editor), { header: 'Sidebar', rows: [{ label: 'Position', popup: 'Left' }] }, { header: 'Sound', rows: [{ label: 'Sound feedback', toggle: true }] }] }
  return settings
}

export function windowBackground(editor: ArxThemeEditor, caption = 'Colors the sidebar and window frame. Profiles and spaces can choose their own.'): ArxFormSection {
  return { header: 'Window background', caption, editor, rows: [] }
}

export const PANEL = { width: 328, at: [296, 150] as [number, number] }

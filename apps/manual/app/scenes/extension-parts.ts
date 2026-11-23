/* The Extensions sheet and its review sheet, shared by the scenes about installing and updating. */
import type { ArxForm } from '~/utils/arxModel'

const ID = 'kpbdccifjmnagohhfmoflemdbjdkheok'

/** A profile's Extensions sheet with Focus Reader selected. */
export function extensionsSheet(profile: string, version: string | null): ArxForm {
  return {
    id: 'extensions', title: 'Extensions', subtitle: profile, close: true,
    tools: [{ icon: 'cart', id: 'store' }, { icon: 'arrow-clockwise', id: 'updates' }, { icon: 'box', id: 'package' }, { icon: 'rotate-clockwise', id: 'refresh' }],
    lead: 'Extensions belong to this profile and are shared by its Spaces.',
    aside: [
      { title: 'Color Picker', detail: 'Enabled', color: '#3c7bf6', selected: !version },
      ...(version ? [{ title: 'Focus Reader', detail: 'Enabled', color: '#5a52d6', selected: true }] : []),
    ],
    sections: [details(version ? 'Focus Reader' : 'Color Picker', version ?? '1.8.0')],
  }
}

export function details(name: string, version: string) {
  return {
    header: name,
    rows: [
      { label: 'Version', value: version },
      { label: 'Extension ID', value: name === 'Focus Reader' ? ID : 'hgmhmanijnjhaffoampdlllchpolkdnj', mono: true },
      { label: 'Install origin', value: 'Installed from the Chrome Web Store' },
      { label: 'Allow in private windows', detail: 'Lets this extension see and change pages in private windows. Off by default.', toggle: false },
    ],
  }
}

/** The review before an extension installs or updates. `asker` is the assistant that asked for it. */
export function reviewSheet(kind: 'install' | 'update', version: string, profile: string, asker?: string): ArxForm {
  return {
    id: 'review',
    title: kind === 'install' ? 'Review Extension Installation' : 'Review Extension Update',
    lead: `${asker ? `${asker} asked to install this extension. Install it only if you want it in this profile. ` : ''}Review the verified package and permissions before continuing. Installation applies only to this profile.`,
    sections: [
      {
        header: 'Focus Reader',
        rows: [
          { label: 'Publisher', value: 'Focus Labs' },
          { label: 'Version', value: version },
          { label: 'Extension ID', value: ID, mono: true },
          { label: 'Package SHA-256', value: '9f2c41ab…e07d', mono: true },
          { label: profile, icon: 'person-circle' },
        ],
      },
      {
        header: 'Permission warnings',
        rows: kind === 'install'
          ? [{ label: 'Read and change your data on all websites', icon: 'shield-01' }]
          : [{ label: 'Read and change your data on all websites', icon: 'shield-01' }, { label: 'Read your browsing history', icon: 'shield-01', fresh: true }],
      },
    ],
    buttons: [{ label: 'Cancel' }, { label: kind === 'install' ? 'Install' : 'Update', primary: true }],
  }
}

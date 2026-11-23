/*
  Every animated preview, by name. In Markdown: ::preview{scene="<name>"}, which shows
  the scene's caption under it unless `caption` overrides it.
*/
import type { ArxScene } from '~/utils/arxScene'
import home from './home'
import assistant_sign_in from './assistant-sign-in'
import saved_password_sign_in from './saved-password-sign-in'
import connect from './connect'
import grants from './grants'
import little_arx from './little-arx'
import favorite_previews from './favorite-previews'
import downloads from './downloads'
import media from './media'
import developer_explain from './developer-explain'
import devtools_docking from './devtools-docking'
import first_launch from './first-launch'
import migration_assistant from './migration-assistant'
import full_url from './full-url'
import profiles from './profiles'
import extensions from './extensions'
import chat_attachments from './chat-attachments'
import air_traffic_control from './air-traffic-control'
import save_password from './save-password'
import passwords from './passwords'
import gestures from './gestures'
import tab_archive from './tab-archive'
import site_menu from './site-menu'
import capture_area from './capture-area'
import developer_header from './developer-header'
import sidebar_folders from './sidebar-folders'
import favorites_grid from './favorites-grid'
import chat_panel from './chat-panel'
import site_settings from './site-settings'
import clear_browsing_data from './clear-browsing-data'
import spaces from './spaces'
import hover_cards from './hover-cards'
import command_bar from './command-bar'
import chat_start from './chat-start'
import peek from './peek'
import keyboard_shortcuts from './keyboard-shortcuts'
import local_tabs from './local-tabs'
import clean_link from './clean-link'
import bangs from './bangs'
import zoom from './zoom'
import split_view from './split-view'
import password_fill from './password-fill'
import card_fill from './card-fill'
import permission_prompt from './permission-prompt'
import runway from './runway'
import import_safari_access from './import-safari-access'
import import_clear_first from './import-clear-first'
import import_arc_extensions from './import-arc-extensions'
import import_chrome_passwords from './import-chrome-passwords'
import import_safari_csv from './import-safari-csv'
import page_context_menus from './page-context-menus'
import appearance_intensity from './appearance-intensity'
import accent_color from './accent-color'
import match_site from './match-site'
import sidebar_motion from './sidebar-motion'
import link_status from './link-status'
import saved_previews from './saved-previews'
import tab_volume from './tab-volume'
import homepage from './homepage'
import little_arx_sign_in from './little-arx-sign-in'
import history from './history'
import command_bar_glass from './command-bar-glass'
import command_bar_actions from './command-bar-actions'
import content_blocking from './content-blocking'
import hide_element from './hide-element'
import webkit_page_menu from './webkit-page-menu'
import translate from './translate'
import reading_mode from './reading-mode'
import app_link_handler from './app-link-handler'
import app_link_prompt from './app-link-prompt'
import extension_window from './extension-window'
import extension_assistant_install from './extension-assistant-install'
import extension_update from './extension-update'
import extension_update_review from './extension-update-review'
import device_capture from './device-capture'

export const scenes: Record<string, ArxScene> = {
  home,
  'assistant-sign-in': assistant_sign_in,
  'saved-password-sign-in': saved_password_sign_in,
  'connect': connect,
  'grants': grants,
  'little-arx': little_arx,
  'favorite-previews': favorite_previews,
  'downloads': downloads,
  'media': media,
  'developer-explain': developer_explain,
  'devtools-docking': devtools_docking,
  'first-launch': first_launch,
  'migration-assistant': migration_assistant,
  'full-url': full_url,
  'profiles': profiles,
  'extensions': extensions,
  'chat-attachments': chat_attachments,
  'air-traffic-control': air_traffic_control,
  'save-password': save_password,
  'passwords': passwords,
  'gestures': gestures,
  'tab-archive': tab_archive,
  'site-menu': site_menu,
  'capture-area': capture_area,
  'developer-header': developer_header,
  'sidebar-folders': sidebar_folders,
  'favorites-grid': favorites_grid,
  'chat-panel': chat_panel,
  'site-settings': site_settings,
  'clear-browsing-data': clear_browsing_data,
  'spaces': spaces,
  'hover-cards': hover_cards,
  'command-bar': command_bar,
  'chat-start': chat_start,
  'peek': peek,
  'keyboard-shortcuts': keyboard_shortcuts,
  'local-tabs': local_tabs,
  'clean-link': clean_link,
  'bangs': bangs,
  'zoom': zoom,
  'split-view': split_view,
  'password-fill': password_fill,
  'card-fill': card_fill,
  'permission-prompt': permission_prompt,
  'runway': runway,
  'import-safari-access': import_safari_access,
  'import-clear-first': import_clear_first,
  'import-arc-extensions': import_arc_extensions,
  'import-chrome-passwords': import_chrome_passwords,
  'import-safari-csv': import_safari_csv,
  'page-context-menus': page_context_menus,
  'appearance-intensity': appearance_intensity,
  'accent-color': accent_color,
  'match-site': match_site,
  'sidebar-motion': sidebar_motion,
  'link-status': link_status,
  'saved-previews': saved_previews,
  'tab-volume': tab_volume,
  'homepage': homepage,
  'little-arx-sign-in': little_arx_sign_in,
  'history': history,
  'command-bar-glass': command_bar_glass,
  'command-bar-actions': command_bar_actions,
  'content-blocking': content_blocking,
  'hide-element': hide_element,
  'webkit-page-menu': webkit_page_menu,
  'translate': translate,
  'reading-mode': reading_mode,
  'app-link-handler': app_link_handler,
  'app-link-prompt': app_link_prompt,
  'extension-window': extension_window,
  'extension-assistant-install': extension_assistant_install,
  'extension-update': extension_update,
  'extension-update-review': extension_update_review,
  'device-capture': device_capture,
}

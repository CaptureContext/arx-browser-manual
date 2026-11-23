<script setup lang="ts">
import type { ArxMenu } from '~/utils/arxModel'

// A macOS menu, as Arx's context menus show, with an optional submenu beside the
// highlighted item.
defineProps<{ menu: ArxMenu }>()
</script>

<template>
  <div class="menus" :style="{ left: `${menu.x}px`, top: `${menu.y}px` }">
    <ul class="menu">
      <template v-for="(item, index) in menu.items" :key="index">
        <li v-if="item.separator" class="menu__separator" />
        <li v-else class="menu__item" :class="{ 'is-on': menu.highlighted === index, 'is-danger': item.danger, 'is-disabled': item.disabled, 'is-bold': item.bold }" :data-arx="`menu:${item.label}`">
          <span class="menu__check">{{ item.checked ? '✓' : '' }}</span>
          <span class="menu__label">{{ item.label }}</span>
          <span v-if="item.shortcut" class="menu__shortcut">{{ item.shortcut }}</span>
          <Icon v-if="item.submenu" class="menu__more" name="raycast:chevron-right-small" />
        </li>
      </template>
    </ul>
    <ul v-if="menu.sub" class="menu is-sub" :style="{ top: `${(menu.highlighted ?? 0) * 24}px` }">
      <li v-for="(item, index) in menu.sub.items" :key="index" class="menu__item" :class="{ 'is-on': menu.sub.highlighted === index }" :data-arx="`submenu:${item.label}`">
        <span class="menu__check">{{ item.checked ? '✓' : '' }}</span>
        <span class="menu__label">{{ item.label }}</span>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.menus {
  position: absolute;
  display: flex;
  align-items: flex-start;
  gap: 2px;
  animation: menu-in .12s ease-out;
}

.menu {
  position: relative;
  min-width: 190px;
  margin: 0;
  padding: 5px;
  border-radius: 10px;
  background: var(--arx-menu);
  box-shadow: 0 0 0 .5px var(--arx-hairline-strong), 0 10px 30px rgb(0 0 0 / .2);
  backdrop-filter: blur(20px);
  color: var(--arx-text);
  font-size: 13px;
  list-style: none;
}

.menu.is-sub {
  min-width: 140px;
}

.menu__item {
  display: flex;
  align-items: center;
  height: 24px;
  padding: 0 8px 0 4px;
  border-radius: 5px;
  white-space: nowrap;
}

.menu__item.is-on {
  background: #0a63e0;
  color: #fff;
}

.menu__item.is-danger {
  color: #e5484d;
}

.menu__check {
  width: 16px;
  font-size: 11px;
  text-align: center;
}

.menu__label {
  flex: 1;
  padding-right: 18px;
}

.menu__shortcut {
  opacity: .55;
}

.menu__more {
  width: 12px;
  opacity: .7;
}

.menu__separator {
  height: 1px;
  margin: 5px 8px;
  background: var(--arx-hairline-strong);
}

@keyframes menu-in {
  from { opacity: 0; }
}

.menu__item.is-disabled {
  opacity: .45;
}

.menu__item.is-bold .menu__label {
  font-weight: 700;
}
</style>

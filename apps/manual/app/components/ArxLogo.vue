<template>
  <NuxtLink to="/" class="arx-logo" aria-label="Arx Manual, home">
    <img src="/brand/arx-icon.png" alt="" width="24" height="24" draggable="false">
    <span class="arx-logo__name arx-wordmark">arx</span>
    <span class="arx-logo__tag">Manual</span>
  </NuxtLink>
</template>

<style scoped>
.arx-logo {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--text-primary);
  font-weight: 600;
  font-size: 15px;
  letter-spacing: -.01em;
}

.arx-logo img {
  border-radius: 6px;
  filter: drop-shadow(0 2px 6px rgb(0 0 0 / .25));
}

.arx-logo__name {
  font-size: 19px;
  line-height: 1;
  /* Comfortaa sits low; lift it onto the tag's baseline. */
  transform: translateY(-1px);
}

.arx-logo__tag {
  color: var(--text-tertiary);
  font-weight: 500;
}
</style>

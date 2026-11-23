<script setup lang="ts">
import type { ArxTab } from '~/utils/arxModel'

// A stand-in for the web page a tab shows. Pages are simple and quiet on purpose:
// the preview is about Arx, not the site. They stay light, as most sites do.
const props = defineProps<{ tab: ArxTab }>()
const chat = computed(() => props.tab.page.kind === 'chat'
  ? { width: 0, title: props.tab.page.question, model: 'Claude Opus', thinking: false, suggestions: [], messages: [{ role: 'user' as const, text: props.tab.page.question }, { role: 'assistant' as const, text: props.tab.page.answer }] }
  : null)
</script>

<template>
  <div class="web" :class="`is-${tab.page.kind}`">
    <template v-if="tab.page.kind === 'landing'">
      <header class="landing__nav"><strong>CaptureContext</strong><span>Blog</span><span>Apps</span><span>Packages</span><span>Tools</span><Icon name="raycast:brand-github" data-arx="link:github" /></header>
      <div class="landing__hero">
        <div class="landing__brand"><img src="/brand/arx-icon.png" alt=""><span>arx</span><em>Public beta</em></div>
        <h1>The browser<br>you get to keep.</h1>
        <p>Spaces for each part of your day, one bar for everything, and a sidebar that remembers. Native on the Mac, Chromium underneath, and open to the assistants you choose. <b>Free. Forever.</b></p>
        <div class="landing__actions"><span class="is-primary" data-arx="link:tour">Take the tour ↓</span><span>Get notified</span></div>
      </div>
    </template>

    <template v-else-if="tab.page.kind === 'article'">
      <header class="article__bar"><span class="article__logo">Encyclopedia</span><i /><span>Search</span></header>
      <div class="article__body" :style="{ transform: `translateY(${-(tab.page.scroll ?? 0)}px)` }">
        <h1>{{ tab.page.title }}</h1>
        <p class="article__from">From the free encyclopedia · <a data-arx="link:download">Download as PDF</a></p>
        <p data-arx="paragraph:lead">{{ tab.page.lead }} <a data-arx="link:application">Applications</a> and <a data-arx="link:web-page">web pages</a> are covered in their own articles.</p>
        <figure class="article__figure" data-arx="figure"><i /><figcaption>A browser showing a page</figcaption></figure>
        <h2>History</h2>
        <p>The first browsers ran on workstations and showed text with simple links. <span data-arx="sentence" :class="{ 'is-selected': tab.page.selected }">Graphical browsers followed</span>, adding images, styles and, later, <a>scripts</a> that let pages behave like applications.</p>
        <p>Today most browsers share a handful of rendering engines, and set themselves apart by how they organize tabs, protect privacy and fit in with the rest of the computer.</p>
        <h2>Features</h2>
        <p>A browser keeps a history of visited pages, lets the reader bookmark the ones worth keeping, and remembers passwords and form entries when asked to.</p>
        <p>Most let people add extensions, which change how pages look or behave, and keep separate profiles for work and home.</p>
        <h2>Privacy</h2>
        <p>Pages can store cookies and other data on the computer. Browsers let people see and clear that data, and limit what one site can learn about visits to another.</p>
      </div>
      <a v-if="tab.page.corner" class="article__corner" data-arx="link:corner">Help</a>
    </template>

    <template v-else-if="tab.page.kind === 'repo'">
      <header class="repo__bar"><Icon name="raycast:brand-github" /><span>{{ tab.page.org }}</span></header>
      <div class="repo__body">
        <div class="repo__org"><span class="repo__avatar">[self]</span><div><h1>{{ tab.page.org }}</h1><p>Swift enthusiasts</p></div></div>
        <nav><b>Overview</b><span>Repositories 59</span><span>Projects</span><span>Packages</span><span>People</span></nav>
        <div class="repo__grid">
          <article v-for="name in ['swift-declarative-configuration', 'swift-foundation-extensions', 'composable-architecture-extensions', 'swift-keypaths-extensions']" :key="name">
            <b>{{ name }}</b><span>Public</span><p>Swift utilities with care for API design.</p><small>● Swift</small>
          </article>
        </div>
      </div>
    </template>

    <template v-else-if="tab.page.kind === 'trailhead'">
      <header class="trail__bar">Trailhead</header>
      <div class="trail__body">
        <h1>Plan your next hike</h1>
        <p>Trails near you, with distance, elevation and the best season to go.</p>
        <div class="trail__card" data-arx="card:ridge"><b>Ridge Loop</b> · 8.4 km · 520 m up</div>
        <div class="trail__card"><b>Lake Trail</b> · 5.1 km · 140 m up</div>
        <span class="trail__button">Save a trail</span>
      </div>
    </template>

    <ArxChatPanel v-else-if="chat" :chat="chat" embedded />

    <template v-else-if="tab.page.kind === 'error'">
      <div class="error">
        <span class="error__icon"><Icon name="raycast:power" /></span>
        <h1>Nothing is running on {{ tab.page.host }}</h1>
        <p>Arx reached your computer, but no server answered on that port. Start your development server, then try again.</p>
        <ul>
          <li>Run your project's start command, such as <code>npm run dev</code>.</li>
          <li>Check the port it prints. It may not be 3000.</li>
        </ul>
        <span class="error__retry" data-arx="error:retry">Try Again</span>
      </div>
    </template>

    <template v-else-if="tab.page.kind === 'signin' && !tab.page.signedIn">
      <div class="signin">
        <Icon name="raycast:brand-github" class="signin__logo" />
        <h1>Sign in to {{ tab.page.site }}</h1>
        <div class="signin__card">
          <label data-arx="signin:user"><small>Username or email address</small><span>{{ tab.page.user }}</span></label>
          <label data-arx="signin:password"><small>Password</small><span>{{ '•'.repeat(tab.page.password.length) }}</span></label>
          <span class="signin__submit" data-arx="signin:submit">Sign in</span>
        </div>
      </div>
    </template>

    <template v-else-if="tab.page.kind === 'account' || (tab.page.kind === 'signin' && tab.page.signedIn)">
      <div class="account">
        <header class="repo__bar"><Icon name="raycast:brand-github" /><span>Dashboard</span><i class="account__avatar" :style="{ background: tab.page.kind === 'account' ? tab.page.color : '#2da44e' }" /></header>
        <div class="account__body">
          <div class="account__who">
            <i class="account__avatar is-large" :style="{ background: tab.page.kind === 'account' ? tab.page.color : '#2da44e' }" />
            <span><b>{{ tab.page.account }}</b><small>Signed in</small></span>
          </div>
          <div class="account__feed">
            <p v-for="line in ['Recent activity', 'Your repositories', 'Pull requests to review']" :key="line"><b>{{ line }}</b><i /><i /></p>
          </div>
        </div>
      </div>
    </template>

    <template v-else-if="tab.page.kind === 'video'">
      <div class="video">
        <header class="video__bar"><Icon name="raycast:brand-youtube" /><b>YouTube</b></header>
        <div class="video__player" data-arx="video:player">
          <div class="video__frame"><Icon name="raycast:brand-swift" /></div>
          <span v-if="!tab.page.playing" class="video__play" data-arx="video:play"><Icon name="raycast:play-filled" /></span>
          <span v-else class="video__progress"><i /></span>
        </div>
        <h1>{{ tab.page.title }}</h1>
        <p>Apple Developer · 1.2M views</p>
      </div>
    </template>

    <template v-else-if="tab.page.kind === 'store'">
      <div class="store">
        <header class="store__bar"><Icon name="raycast:brand-google" /><b>chrome web store</b></header>
        <div class="store__body">
          <span class="store__icon">F</span>
          <div class="store__text"><h1>{{ tab.page.name }}</h1><p>Reader view for any page, with your own fonts. · Featured · 4.8 ★</p></div>
          <span class="store__button" :class="{ 'is-installed': tab.page.installed }" data-arx="store:add">{{ tab.page.installed ? 'Remove from Arx' : 'Add to Arx' }}</span>
        </div>
      </div>
    </template>

    <template v-else-if="tab.page.kind === 'meet'">
      <div class="meet">
        <div class="meet__tile"><i />You</div>
        <div class="meet__tile"><i style="background:#e07a5f" />Anna</div>
        <div class="meet__bar"><span>Design review</span><b>Leave call</b></div>
      </div>
    </template>

    <ArxSites v-else-if="['news', 'checkout', 'design', 'chooser', 'stream', 'unlock', 'ask'].includes(tab.page.kind)" :tab="tab" />

    <div v-else class="blank"><ArxFavicon :icon="tab.icon" :size="40" /><span>{{ tab.url }}</span></div>
  </div>
</template>

<style scoped>
.web {
  position: absolute;
  inset: 0;
  overflow: hidden;
  background: #fff;
  color: #1d1d1f;
  font-family: -apple-system, "SF Pro Text", Inter, system-ui, sans-serif;
  font-size: 15px;
  line-height: 1.5;
}

/* Web pages keep their own colors whatever the manual's theme does to text. */
.web :where(b, strong, h1, h2) {
  color: inherit;
}

.web :where(a) {
  color: #3366cc;
}

/* arxbrowser.net */
.is-landing {
  background: radial-gradient(120% 70% at 50% 100%, #efeafc 0%, #faf9f7 55%);
}

.landing__nav {
  display: flex;
  align-items: center;
  gap: 22px;
  margin: 14px 18px;
  padding: 14px 20px;
  border-radius: 14px;
  background: #fff;
  box-shadow: 0 1px 3px rgb(0 0 0 / .08);
  font-size: 14px;
}

.landing__nav strong { margin-right: auto; font-size: 17px; }
.landing__nav :deep(svg) { width: 18px; }

.landing__hero {
  display: grid;
  justify-items: center;
  padding: 50px 60px 0;
  text-align: center;
}

.landing__brand {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 26px;
  font-size: 30px;
  font-weight: 600;
}

.landing__brand img { width: 52px; border-radius: 12px; }

.landing__brand em {
  padding: 4px 12px;
  border: 1px solid #e3e1ea;
  border-radius: 999px;
  font-size: 13px;
  font-style: normal;
  font-weight: 500;
}

.landing__hero h1 {
  margin: 0 0 22px;
  font-size: 62px;
  line-height: 1;
  letter-spacing: -.045em;
}

.landing__hero p {
  max-width: 620px;
  margin: 0 0 28px;
  color: #5b5966;
  font-size: 18px;
}

.landing__hero p b { color: #1d1d1f; }

.landing__actions { display: flex; gap: 12px; }

.landing__actions span {
  padding: 12px 22px;
  border: 1px solid #d9d7e0;
  border-radius: 10px;
  font-size: 16px;
}

.landing__actions .is-primary { background: #3a3a3c; border-color: #3a3a3c; color: #fff; }

/* Encyclopedia article */
.article__body {
  transition: transform .6s cubic-bezier(.3, .7, .2, 1);
}

/* A link in the page's bottom-left corner, where the link label usually sits. */
.article__corner {
  position: absolute;
  bottom: 12px;
  left: 16px;
  font-size: 13px;
}

.article__body .is-selected {
  background: #b4d5fe;
}

.article__bar {
  position: relative;
  z-index: 1;
  background: #fff;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px 40px;
  border-bottom: 1px solid #eaecf0;
  color: #54595d;
  font-size: 13px;
}

.article__logo {
  color: #202122;
  font-family: "Linux Libertine", Georgia, serif;
  font-size: 22px;
  letter-spacing: .02em;
}

.article__bar i {
  flex: 1;
}

.article__body {
  max-width: 820px;
  padding: 18px 40px;
}

.article__body h1 {
  margin: 0;
  padding-bottom: 6px;
  border-bottom: 1px solid #a2a9b1;
  font-family: "Linux Libertine", Georgia, serif;
  font-size: 30px;
  font-weight: 400;
}

.article__body h2 {
  margin: 18px 0 6px;
  padding-bottom: 4px;
  border-bottom: 1px solid #a2a9b1;
  font-family: "Linux Libertine", Georgia, serif;
  font-size: 22px;
  font-weight: 400;
}

.article__from { margin: 6px 0 12px; color: #54595d; font-size: 13px; }
.article__body p { margin: 0 0 12px; }
.article__body a { color: #3366cc; }

.article__figure {
  float: right;
  width: 200px;
  margin: 0 0 12px 18px;
  padding: 4px;
  border: 1px solid #c8ccd1;
  background: #f8f9fa;
  font-size: 12px;
}

.article__figure i {
  display: block;
  height: 120px;
  background: linear-gradient(135deg, #dfe6f5, #c5d3ee 60%, #e9edf5);
}

/* GitHub-like org page */
.repo__bar {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 24px;
  background: #0d1117;
  color: #fff;
  font-weight: 600;
}

.repo__bar :deep(svg) { width: 26px; }

.repo__body { padding: 24px 32px; }

.repo__org { display: flex; align-items: center; gap: 18px; }

.repo__avatar {
  display: grid;
  place-items: center;
  width: 88px;
  height: 88px;
  border: 1px solid #d0d7de;
  border-radius: 14px;
  color: #e5534b;
  font-family: ui-monospace, Menlo, monospace;
  font-size: 22px;
  font-weight: 700;
}

.repo__org h1 { margin: 0; font-size: 26px; }
.repo__org p { margin: 0; color: #59636e; }

.repo__body nav {
  display: flex;
  gap: 22px;
  margin: 22px 0;
  border-bottom: 1px solid #d0d7de;
  color: #59636e;
  font-size: 14px;
}

.repo__body nav b { padding-bottom: 10px; border-bottom: 2px solid #fd8c73; color: #1f2328; }

.repo__grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}

.repo__grid article {
  padding: 14px 16px;
  border: 1px solid #d0d7de;
  border-radius: 8px;
  font-size: 13px;
}

.repo__grid b { color: #0969da; }
.repo__grid span { margin-left: 6px; padding: 0 7px; border: 1px solid #d0d7de; border-radius: 99px; color: #59636e; font-size: 11px; }
.repo__grid p { margin: 6px 0; color: #59636e; }
.repo__grid small { color: #59636e; }

/* localhost:3000 */
.is-trailhead { background: #f6f5f2; }

.trail__bar {
  padding: 18px 40px;
  background: #1f3d2b;
  color: #fff;
  font-size: 20px;
  font-weight: 600;
}

.trail__body { max-width: 720px; margin: 36px auto; padding: 0 24px; }
.trail__body h1 { margin: 0 0 10px; font-size: 40px; }

.trail__card {
  margin: 16px 0;
  padding: 18px 22px;
  border-radius: 14px;
  background: #fff;
  box-shadow: 0 1px 3px rgb(0 0 0 / .07);
}

.trail__button {
  display: inline-block;
  padding: 10px 18px;
  border-radius: 10px;
  background: #2f7d4f;
  color: #fff;
}

/* Developer mode's localhost explanation */
.error {
  display: grid;
  justify-items: start;
  max-width: 560px;
  margin: 110px auto 0;
  padding: 0 24px;
}

.error__icon {
  display: grid;
  place-items: center;
  width: 46px;
  height: 46px;
  margin-bottom: 14px;
  border-radius: 12px;
  background: #fff4e5;
  color: #c76a00;
}

.error__icon :deep(svg) {
  width: 22px;
}

.error h1 {
  margin: 0 0 10px;
  font-size: 26px;
}

.error p,
.error li {
  color: #5b5966;
}

.error code {
  padding: 1px 5px;
  border-radius: 5px;
  background: #f1f0f4;
  font-size: 13px;
}

.error__retry {
  margin-top: 8px;
  padding: 8px 16px;
  border-radius: 9px;
  background: #1d1d1f;
  color: #fff;
}

/* A sign-in form */
.signin {
  display: grid;
  justify-items: center;
  /* Rows keep their own heights: without this the form stretches to fill the page. */
  align-content: start;
  padding-top: 70px;
  background: #f6f8fa;
  height: 100%;
}

.signin__logo {
  width: 48px;
  height: 48px;
}

.signin h1 {
  margin: 14px 0 18px;
  font-size: 24px;
  font-weight: 400;
}

.signin__card {
  display: grid;
  gap: 14px;
  width: 320px;
  padding: 20px;
  border: 1px solid #d0d7de;
  border-radius: 8px;
  background: #fff;
}

.signin__card label {
  display: grid;
  gap: 6px;
  font-size: 13px;
}

.signin__card label span {
  height: 32px;
  padding: 0 10px;
  border: 1px solid #d0d7de;
  border-radius: 6px;
  line-height: 32px;
}

.signin__submit {
  padding: 7px;
  border-radius: 6px;
  background: #1f883d;
  color: #fff;
  font-weight: 600;
  text-align: center;
}

/* A signed-in account */
.account__avatar {
  width: 26px;
  height: 26px;
  margin-left: auto;
  border-radius: 50%;
  box-shadow: inset 0 0 0 2px rgb(255 255 255 / .6);
}

.account__avatar.is-large {
  width: 64px;
  height: 64px;
  margin: 0;
}

.account__body {
  padding: 28px 32px;
}

.account__who {
  display: flex;
  align-items: center;
  gap: 16px;
}

.account__who span {
  display: grid;
}

.account__who b {
  font-size: 22px;
}

.account__who small {
  color: #59636e;
}

.account__feed p {
  display: grid;
  gap: 8px;
  margin: 22px 0 0;
}

.account__feed i {
  display: block;
  height: 12px;
  border-radius: 6px;
  background: #eef0f3;
}

.account__feed i + i {
  width: 70%;
}

/* A video page */
.video {
  padding: 0 0 20px;
}

.video__bar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
}

.video__bar :deep(svg) {
  width: 26px;
  color: #ff0033;
}

.video__player {
  position: relative;
  height: 430px;
  margin: 0 24px;
  overflow: hidden;
  border-radius: 12px;
  background: #000;
}

.video__frame {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  background: radial-gradient(circle at 30% 30%, #f05138, #7a1f12 70%);
}

.video__frame :deep(svg) {
  width: 120px;
  height: 120px;
  color: #fff;
  opacity: .9;
}

.video__play {
  position: absolute;
  top: 50%;
  left: 50%;
  display: grid;
  place-items: center;
  width: 72px;
  height: 50px;
  translate: -50% -50%;
  border-radius: 14px;
  background: #ff0033;
  color: #fff;
}

.video__play :deep(svg) {
  width: 24px;
}

.video__progress {
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  height: 4px;
  background: rgb(255 255 255 / .3);
}

.video__progress i {
  display: block;
  width: 30%;
  height: 100%;
  background: #ff0033;
}

.video h1 {
  margin: 14px 24px 2px;
  font-size: 20px;
}

.video p {
  margin: 0 24px;
  color: #606060;
}

/* An extension in the Chrome Web Store */
.store__bar {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 28px;
  border-bottom: 1px solid #e3e3e3;
}

.store__bar :deep(svg) {
  width: 22px;
}

.store__bar b {
  color: #5f6368;
  font-weight: 500;
}

.store__body {
  display: flex;
  align-items: center;
  gap: 22px;
  padding: 40px 48px;
}

.store__icon {
  display: grid;
  place-items: center;
  width: 84px;
  height: 84px;
  border-radius: 20px;
  background: linear-gradient(135deg, #6c63ff, #3f3d9e);
  color: #fff;
  font-size: 40px;
  font-weight: 800;
}

.store__text {
  flex: 1;
}

.store__text h1 {
  margin: 0 0 6px;
  font-size: 26px;
}

.store__text p {
  margin: 0;
  color: #5f6368;
}

.store__button {
  padding: 10px 20px;
  border-radius: 20px;
  background: #1a73e8;
  color: #fff;
  font-weight: 600;
}

.store__button.is-installed {
  background: #fff;
  box-shadow: inset 0 0 0 1px #dadce0;
  color: #1a73e8;
}

/* Google Meet */
.meet {
  position: relative;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  height: 100%;
  padding: 14px 14px 64px;
  background: #202124;
  color: #fff;
}

.meet__tile {
  display: grid;
  place-items: center;
  align-content: center;
  gap: 10px;
  border-radius: 12px;
  background: #3c4043;
}

.meet__tile i {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: #8ab4f8;
}

.meet__bar {
  position: absolute;
  right: 0;
  bottom: 12px;
  left: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
}

.meet__bar b {
  padding: 8px 16px;
  border-radius: 20px;
  background: #ea4335;
}

.blank {
  display: grid;
  place-items: center;
  align-content: center;
  gap: 14px;
  height: 100%;
  background: #fbfbfd;
  color: #86868b;
  font-size: 14px;
}
</style>

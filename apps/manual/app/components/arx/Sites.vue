<script setup lang="ts">
import type { ArxTab } from '~/utils/arxModel'

// More stand-in web pages: a news site, a checkout form, a design file, an account
// chooser, a streaming site, an extension's unlock window and a page that asks for a
// permission. Like the pages in Page.vue they are quiet on purpose.
defineProps<{ tab: ArxTab }>()

const news = {
  en: {
    banner: 'Subscribe for $1 a week and read without limits.',
    section: 'Technology',
    title: 'Small browsers are having a moment',
    lead: 'A new wave of browsers is betting that people want fewer tabs, calmer windows and more say over their own data.',
    body: [
      'For a decade the browser barely changed. Now a handful of small teams are rethinking the window itself: where tabs live, how work and home stay apart, and what a page is allowed to know about you.',
      'Most of them share one engine with the giants, and compete on everything around it.',
    ],
    link: 'Read the full report',
    most: 'Most read',
    items: ['Why your tabs keep multiplying', 'The quiet return of the sidebar', 'What a profile really separates'],
    letter: 'Get the morning letter',
    cookies: 'We use cookies to personalize content and ads.',
    accept: 'Accept all',
  },
  fr: {
    banner: 'Abonnez-vous pour 1 € par semaine et lisez sans limite.',
    section: 'Technologie',
    title: 'Les petits navigateurs ont le vent en poupe',
    lead: 'Une nouvelle vague de navigateurs parie que l’on veut moins d’onglets, des fenêtres plus calmes et la maîtrise de ses données.',
    body: [
      'Pendant dix ans, le navigateur n’a presque pas changé. Aujourd’hui, quelques petites équipes repensent la fenêtre elle-même : où vivent les onglets, comment séparer le travail de la maison.',
      'La plupart partagent un moteur avec les géants, et se distinguent par tout ce qui l’entoure.',
    ],
    link: 'Lire le rapport complet',
    most: 'Les plus lus',
    items: ['Pourquoi vos onglets se multiplient', 'Le retour discret de la barre latérale', 'Ce qu’un profil sépare vraiment'],
    letter: 'Recevez la lettre du matin',
    cookies: 'Nous utilisons des cookies pour personnaliser le contenu.',
    accept: 'Tout accepter',
  },
}
</script>

<template>
  <div class="site" :class="`is-${tab.page.kind}`">
    <template v-if="tab.page.kind === 'news'">
      <div class="news" :style="{ transform: `translateY(${-(tab.page.scroll ?? 0)}px)` }">
        <Transition name="gone"><div v-if="!tab.page.hidden.includes('banner')" class="news__banner" data-arx="news:banner">{{ news[tab.page.french ? 'fr' : 'en'].banner }}</div></Transition>
        <header class="news__head"><b>The Daily Ledger</b><span>World</span><span>Business</span><span>{{ news[tab.page.french ? 'fr' : 'en'].section }}</span><span>Culture</span></header>
        <div class="news__columns">
          <article>
            <small>{{ news[tab.page.french ? 'fr' : 'en'].section }}</small>
            <h1>{{ news[tab.page.french ? 'fr' : 'en'].title }}</h1>
            <p class="news__lead">{{ news[tab.page.french ? 'fr' : 'en'].lead }}</p>
            <div class="news__photo" data-arx="news:photo" />
            <p v-for="line in news[tab.page.french ? 'fr' : 'en'].body" :key="line">{{ line }}</p>
            <p><a data-arx="news:link">{{ news[tab.page.french ? 'fr' : 'en'].link }}</a></p>
          </article>
          <aside>
            <Transition name="gone"><div v-if="tab.page.ads" class="news__ad" data-arx="news:ad"><small>Advertisement</small><b>Mega Sale</b><span>Up to 70% off</span></div></Transition>
            <Transition name="gone">
              <div v-if="!tab.page.hidden.includes('most')" class="news__box" data-arx="news:most">
                <b>{{ news[tab.page.french ? 'fr' : 'en'].most }}</b>
                <span v-for="(item, index) in news[tab.page.french ? 'fr' : 'en'].items" :key="item"><i>{{ index + 1 }}</i>{{ item }}</span>
              </div>
            </Transition>
            <Transition name="gone"><div v-if="!tab.page.hidden.includes('letter')" class="news__box is-letter" data-arx="news:letter"><b>{{ news[tab.page.french ? 'fr' : 'en'].letter }}</b><em>you@example.com</em></div></Transition>
            <Transition name="gone"><div v-if="tab.page.ads" class="news__ad is-tall"><small>Advertisement</small><b>Fly for less</b><span>Book by Friday</span></div></Transition>
          </aside>
        </div>
      </div>
      <Transition name="gone"><div v-if="tab.page.cookies" class="news__cookies" data-arx="news:cookies"><span>{{ news[tab.page.french ? 'fr' : 'en'].cookies }}</span><i>Manage</i><b>{{ news[tab.page.french ? 'fr' : 'en'].accept }}</b></div></Transition>
    </template>

    <template v-else-if="tab.page.kind === 'checkout'">
      <header class="shop__bar"><b>Trailgear</b><span>Checkout</span></header>
      <div class="shop">
        <div class="shop__form">
          <h1>Payment</h1>
          <label :class="{ 'is-focused': tab.page.focused === 'number' }" data-arx="card:number"><small>Card number</small><span>{{ tab.page.number }}</span></label>
          <label data-arx="card:name"><small>Name on card</small><span>{{ tab.page.name }}</span></label>
          <div class="shop__pair">
            <label data-arx="card:expiry"><small>Expiry</small><span>{{ tab.page.expiry }}</span></label>
            <label data-arx="card:code"><small>Security code</small><span /></label>
          </div>
          <span class="shop__pay">Pay $184.00</span>
        </div>
        <div class="shop__order"><b>Your order</b><span>Ridge hiking boots<em>$159.00</em></span><span>Wool socks, 2 pairs<em>$25.00</em></span><span class="is-total">Total<em>$184.00</em></span></div>
      </div>
    </template>

    <template v-else-if="tab.page.kind === 'design'">
      <header class="design__bar"><Icon name="raycast:brand-figma" /><b>Onboarding flow</b>
        <span v-if="tab.page.signedIn" class="design__me"><i />Max</span>
        <span v-else class="design__viewer">Viewing as a guest</span>
      </header>
      <div class="design__canvas">
        <div class="design__frame"><i /><i /><i /></div>
        <div class="design__frame"><i /><i /></div>
        <div class="design__frame"><i /><i /><i /></div>
        <a class="design__link" data-arx="design:link">Open the design spec ↗</a>
        <div v-if="!tab.page.signedIn" class="design__gate">
          <b>Sign in to comment and edit</b>
          <span data-arx="design:google"><Icon name="raycast:brand-google" />Sign in with Google</span>
        </div>
      </div>
    </template>

    <template v-else-if="tab.page.kind === 'chooser'">
      <div class="chooser">
        <Icon name="raycast:brand-google" class="chooser__logo" />
        <h1>Choose an account</h1>
        <p>to continue to {{ tab.page.site }}</p>
        <div class="chooser__row" data-arx="chooser:account"><i>M</i><span><b>Max Krouk</b><small>{{ tab.page.account }}</small></span></div>
        <div class="chooser__row is-other"><Icon name="raycast:person-circle" /><span>Use another account</span></div>
      </div>
    </template>

    <template v-else-if="tab.page.kind === 'stream'">
      <header class="stream__bar"><b>▶</b><span>Home</span><span>Series</span><span>Films</span><span>My List</span></header>
      <div class="stream__hero"><div><small>Series</small><h1>The Long Way North</h1><span><Icon name="raycast:play-filled" />Play</span></div></div>
      <div class="stream__row"><i v-for="n in 7" :key="n" :style="{ background: `hsl(${n * 47} 35% 28%)` }" /></div>
    </template>

    <template v-else-if="tab.page.kind === 'unlock'">
      <div class="unlock">
        <span class="unlock__icon">1</span>
        <h1>{{ tab.page.name }} is locked</h1>
        <label data-arx="unlock:field"><span>{{ '•'.repeat(tab.page.typed) }}<i /></span></label>
        <small>Enter your account password to unlock.</small>
      </div>
    </template>

    <template v-else-if="tab.page.kind === 'ask'">
      <header class="ask__bar"><Icon name="raycast:brand-github" /><span>Settings</span></header>
      <div class="ask">
        <h1>Notifications</h1>
        <p>Get a notification on this Mac when someone mentions you or reviews your pull request.</p>
        <span class="ask__button" data-arx="ask:button"><Icon name="raycast:bell" />Turn on browser notifications</span>
      </div>
    </template>
  </div>
</template>

<style scoped>
.site {
  position: absolute;
  inset: 0;
  overflow: hidden;
  background: #fff;
  color: #1d1d1f;
  font-size: 14px;
  line-height: 1.5;
}

.site :where(b, strong, h1, h2) {
  color: inherit;
}

.site :where(h1) {
  margin: 0;
}

.site :where(p) {
  margin: 0;
}

/* Hidden elements fade and drift away; shown again, they fade back. */
.gone-enter-active { transition: opacity .22s; }
.gone-leave-active { transition: opacity .26s, transform .26s, filter .26s; }
.gone-enter-from { opacity: 0; }
.gone-leave-to { opacity: 0; transform: translate(6px, -6px); filter: blur(4px); }

/* News */
.news {
  transition: transform .5s cubic-bezier(.3, .7, .2, 1);
}

.news__banner {
  padding: 10px 40px;
  background: #fde68a;
  font-size: 13px;
  font-weight: 600;
  text-align: center;
}

.news__head {
  display: flex;
  align-items: baseline;
  gap: 22px;
  padding: 16px 40px 12px;
  border-bottom: 2px solid #111;
  font-size: 13px;
}

.news__head b {
  margin-right: auto;
  font: 700 26px Georgia, "Times New Roman", serif;
}

.news__columns {
  display: grid;
  grid-template-columns: 1fr 250px;
  gap: 36px;
  padding: 22px 40px;
}

.news article {
  display: grid;
  align-content: start;
  gap: 10px;
}

.news article small {
  color: #b42318;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: .08em;
  text-transform: uppercase;
}

.news h1 {
  font: 700 34px/1.12 Georgia, "Times New Roman", serif;
}

.news__lead {
  color: #444;
  font-size: 17px;
}

.news__photo {
  height: 190px;
  border-radius: 4px;
  background: linear-gradient(135deg, #9db4c0, #5c6b73 60%, #253237);
}

.news a {
  color: #1a4fb4;
  text-decoration: underline;
}

.news aside {
  display: grid;
  align-content: start;
  gap: 16px;
}

.news__ad {
  display: grid;
  place-content: center;
  justify-items: center;
  height: 130px;
  border: 1px solid #e3e3e3;
  background: repeating-linear-gradient(45deg, #fff7ed 0 12px, #ffedd5 12px 24px);
  color: #9a3412;
}

.news__ad.is-tall {
  height: 170px;
}

.news__ad small {
  color: #a8a29e;
  font-size: 9px;
  letter-spacing: .1em;
  text-transform: uppercase;
}

.news__ad b {
  font-size: 22px;
}

.news__box {
  display: grid;
  gap: 8px;
  padding: 14px;
  border: 1px solid #e3e3e3;
  font-size: 13px;
}

.news__box b {
  font: 700 16px Georgia, serif;
}

.news__box span {
  display: flex;
  gap: 8px;
}

.news__box i {
  color: #b42318;
  font-style: normal;
  font-weight: 700;
}

.news__box em {
  padding: 5px 8px;
  border: 1px solid #d4d4d4;
  color: #a3a3a3;
  font-style: normal;
}

.news__cookies {
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px 40px;
  background: #1f2937;
  color: #fff;
  font-size: 13px;
}

.news__cookies span {
  flex: 1;
}

.news__cookies i {
  font-style: normal;
  text-decoration: underline;
}

.news__cookies b {
  padding: 7px 16px;
  border-radius: 4px;
  background: #fff;
  color: #111;
}

/* Checkout */
.shop__bar {
  display: flex;
  align-items: baseline;
  gap: 14px;
  padding: 16px 40px;
  border-bottom: 1px solid #e5e7eb;
  color: #6b7280;
}

.shop__bar b {
  color: #2f7d4f;
  font-size: 20px;
}

.shop {
  display: grid;
  grid-template-columns: 380px 260px;
  gap: 60px;
  align-items: start;
  justify-content: center;
  padding-top: 44px;
}

.shop__form {
  display: grid;
  gap: 14px;
}

.shop h1 {
  font-size: 24px;
}

.shop label {
  display: grid;
  gap: 5px;
  font-size: 13px;
}

.shop label span {
  height: 36px;
  padding: 0 11px;
  border: 1px solid #d1d5db;
  border-radius: 7px;
  font-size: 15px;
  line-height: 36px;
}

.shop label.is-focused span {
  border-color: #2f7d4f;
  box-shadow: 0 0 0 3px rgb(47 125 79 / .2);
}

.shop__pair {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}

.shop__pay {
  padding: 10px;
  border-radius: 7px;
  background: #2f7d4f;
  color: #fff;
  font-weight: 600;
  text-align: center;
}

.shop__order {
  display: grid;
  gap: 10px;
  padding: 18px;
  border-radius: 10px;
  background: #f6f7f5;
  font-size: 13px;
}

.shop__order span {
  display: flex;
  justify-content: space-between;
}

.shop__order em {
  font-style: normal;
}

.shop__order .is-total {
  padding-top: 10px;
  border-top: 1px solid #d9dcd6;
  font-weight: 700;
}

/* Design file */
.is-design {
  display: flex;
  flex-direction: column;
  background: #f0f0f0;
}

.design__bar {
  display: flex;
  flex: none;
  align-items: center;
  gap: 10px;
  height: 44px;
  padding: 0 16px;
  background: #2c2c2c;
  color: #fff;
  font-size: 13px;
}

.design__bar :deep(svg) {
  width: 16px;
}

.design__bar b {
  flex: 1;
  color: #fff;
  font-weight: 500;
}

.design__viewer {
  color: #b3b3b3;
}

.design__me {
  display: inline-flex;
  align-items: center;
  gap: 7px;
}

.design__me i {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: #a259ff;
}

.design__canvas {
  position: relative;
  display: flex;
  flex: 1;
  align-items: flex-start;
  justify-content: center;
  gap: 26px;
  padding-top: 46px;
}

.design__frame {
  display: grid;
  align-content: start;
  gap: 10px;
  width: 150px;
  height: 250px;
  padding: 14px;
  border-radius: 14px;
  background: #fff;
  box-shadow: 0 1px 4px rgb(0 0 0 / .14);
}

.design__frame i {
  height: 26px;
  border-radius: 6px;
  background: #ece6ff;
}

.design__frame i:first-child {
  height: 70px;
  background: #a259ff;
}

.design__link {
  position: absolute;
  bottom: 96px;
  left: 50%;
  translate: -50% 0;
  color: #0d6efd;
  font-size: 13px;
  text-decoration: underline;
}

.design__gate {
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  height: 64px;
  background: #fff;
  box-shadow: 0 -1px 0 #e0e0e0;
}

.design__gate > span {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 7px 14px;
  border: 1px solid #c9c9c9;
  border-radius: 8px;
  font-weight: 500;
}

.design__gate :deep(svg) {
  width: 15px;
  color: #4285f4;
}

/* Account chooser */
.chooser {
  display: grid;
  align-content: start;
  justify-items: center;
  gap: 4px;
  height: 100%;
  padding-top: 70px;
}

.chooser__logo {
  width: 36px;
  height: 36px;
  color: #4285f4;
}

.chooser h1 {
  margin-top: 12px;
  font-size: 24px;
  font-weight: 400;
}

.chooser p {
  margin-bottom: 22px;
  color: #5f6368;
}

.chooser__row {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 340px;
  padding: 12px 6px;
  border-top: 1px solid #e0e0e0;
}

.chooser__row.is-other {
  border-bottom: 1px solid #e0e0e0;
  color: #3c4043;
}

.chooser__row i {
  display: grid;
  place-items: center;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: #7b61ff;
  color: #fff;
  font-style: normal;
  font-weight: 600;
}

.chooser__row > span:not(.iconify) {
  display: grid;
  line-height: 1.3;
}

.chooser__row small {
  color: #5f6368;
}

.chooser__row :deep(svg) {
  width: 30px;
  height: 22px;
  color: #5f6368;
}

/* Streaming */
.is-stream {
  background: #141414;
  color: #fff;
}

.stream__bar {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 14px 36px;
  color: #d4d4d4;
  font-size: 13px;
}

.stream__bar b {
  color: #e50914;
  font-size: 26px;
  font-weight: 800;
}

.stream__hero {
  display: flex;
  align-items: flex-end;
  height: 330px;
  margin: 0 36px;
  padding: 30px;
  border-radius: 8px;
  background: linear-gradient(110deg, #0b1d2c 20%, #1f4a5c 60%, #5d8a8f);
}

.stream__hero small {
  color: #e5e5e5;
  letter-spacing: .12em;
  text-transform: uppercase;
}

.stream__hero h1 {
  margin: 4px 0 14px;
  color: #fff;
  font-size: 38px;
}

.stream__hero div > span {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 7px 20px;
  border-radius: 5px;
  background: #fff;
  color: #111;
  font-weight: 700;
}

.stream__hero :deep(svg) {
  width: 14px;
}

.stream__row {
  display: flex;
  gap: 10px;
  margin: 20px 36px;
}

.stream__row i {
  flex: 1;
  height: 110px;
  border-radius: 6px;
}

/* An extension's unlock window */
.unlock {
  display: grid;
  align-content: start;
  justify-items: center;
  gap: 12px;
  height: 100%;
  padding-top: 110px;
  background: #f4f7fb;
}

.unlock__icon {
  display: grid;
  place-items: center;
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: #1a66d6;
  color: #fff;
  font-size: 30px;
  font-weight: 700;
}

.unlock h1 {
  font-size: 20px;
}

.unlock label span {
  display: flex;
  align-items: center;
  width: 300px;
  height: 40px;
  padding: 0 14px;
  border: 2px solid #1a66d6;
  border-radius: 10px;
  background: #fff;
  font-size: 18px;
  letter-spacing: .1em;
}

.unlock label i {
  width: 1.5px;
  height: 20px;
  background: #1a66d6;
}

.unlock small {
  color: #6b7280;
}

/* A page that asks for a permission */
.ask__bar {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 40px;
  background: #24292f;
  color: #fff;
  font-weight: 600;
}

.ask__bar :deep(svg) {
  width: 22px;
  height: 22px;
}

.ask {
  display: grid;
  justify-items: start;
  gap: 12px;
  max-width: 620px;
  padding: 34px 40px;
}

.ask h1 {
  font-size: 24px;
  font-weight: 600;
}

.ask p {
  color: #57606a;
}

.ask__button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 7px 14px;
  border: 1px solid #d0d7de;
  border-radius: 6px;
  background: #f6f8fa;
  font-weight: 500;
}

.ask__button :deep(svg) {
  width: 14px;
}

.design__bar :deep(.iconify) { font-size: 16px; }
.chooser__logo { font-size: 36px; }
.chooser__row :deep(.iconify) { font-size: 22px; color: #5f6368; }
.ask__bar :deep(.iconify) { font-size: 22px; }

</style>

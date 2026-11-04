// システム構成図（architecture.svg / architecture.png）を作るスクリプト
//
// GUI のツールで描くと、構成が変わったときの差分がレビューできないので、座標をコードで持つ。
// 実行: node docs/architecture/generate.mjs
// PNG はヘッドレス Chrome で撮る（CHROME に実行ファイルの場所を渡す。未指定なら SVG だけ作る）。
// ARCH_FONT_CSS に @font-face の CSS を渡すと、PC に入っていないフォントでも描画できる（複数はカンマ区切り）
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const DIR = dirname(fileURLToPath(import.meta.url));
const WIDTH = 1680;
const HEIGHT = 1180;
const CARD = 74; // カードの一辺
const R = CARD / 2;

const BLUE = '#1a73e8'; // 利用者のリクエスト
const GRAY = '#4b5563'; // Worker から先の通信
const ORANGE = '#f38020'; // Cloudflare
const PURPLE = '#7c3aed'; // ISR: ページを見るとき
const TEAL = '#0d9488'; // ISR: 記事を更新するとき
const MARKER = { [BLUE]: 'blue', [GRAY]: 'gray', [PURPLE]: 'purple', [TEAL]: 'teal' };

// ブランドのロゴ（simple-icons）。単色の SVG なので、ここで色を付ける
const brand = (file, color) => {
  const svg = readFileSync(join(DIR, 'icons', `${file}.svg`), 'utf8');
  const d = svg.match(/ d="([^"]+)"/)[1];
  return `<svg x="-22" y="-22" width="44" height="44" viewBox="0 0 24 24"><path fill="${color}" d="${d}"/></svg>`;
};

// ロゴがないもの（Cloudflare の各機能・利用者）は線の絵にする。全部同じ雲のロゴだと見分けがつかないため
const line = (body, color = ORANGE) =>
  `<svg x="-20" y="-20" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`;

const ICON = {
  workers: brand('cloudflareworkers', ORANGE),
  next: brand('nextdotjs', '#111827'),
  hono: brand('hono', '#e36002'),
  neon: brand('neon', '#00c483'),
  github: brand('github', '#181717'),
  actions: brand('githubactions', '#2088ff'),
  globe: line('<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3.6 6 3.6 9s-.6 6-3.6 9c-3-3-3.6-6-3.6-9S9 6 12 3z"/>'),
  files: line('<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 13h6M9 17h6"/>'),
  bucket: line('<path d="M4 7h16l-2 13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1z"/><ellipse cx="12" cy="7" rx="8" ry="3"/>'),
  db: line('<ellipse cx="12" cy="5.5" rx="8" ry="3"/><path d="M4 5.5v13c0 1.7 3.6 3 8 3s8-1.3 8-3v-13M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3"/>'),
  bolt: line('<path d="M13 2 4 14h7l-1 8 10-13h-7z"/>'),
  shield: line('<path d="M12 3l8 3v6c0 4.5-3.2 7.7-8 9-4.8-1.3-8-4.5-8-9V6z"/><path d="M8.5 12l2.5 2.5 4.5-5"/>', '#374151'),
  user: line('<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-6.5 8-6.5s8 2.5 8 6.5"/>', '#374151'),
  admin: line('<circle cx="10" cy="8" r="4"/><path d="M2.5 21c0-4 3.4-6.5 7.5-6.5 1.3 0 2.5.2 3.6.7"/><path d="M18 14l3.5 1.3v2.5c0 1.8-1.4 3-3.5 3.7-2.1-.7-3.5-1.9-3.5-3.7v-2.5z"/>', '#374151'),
  bot: line('<rect x="4" y="8" width="16" height="12" rx="3"/><path d="M12 8V4M9 13h.01M15 13h.01M9 17h6"/><circle cx="12" cy="3" r="1"/>', '#374151'),
  laptop: line('<rect x="5" y="4" width="14" height="11" rx="1.5"/><path d="M2.5 19.5h19l-2.5-4.5H5z"/>', '#374151'),
};

// カード: 中心の座標、題名、補足（補足には「何をするものか」を書く）
const NODES = [
  { x: 110, y: 200, icon: 'user', title: '訪問者', sub: 'ブラウザ' },
  { x: 110, y: 375, icon: 'admin', title: '管理者', sub: '記事の編集・公開' },
  { x: 110, y: 550, icon: 'bot', title: 'クローラー・SNS', sub: '検索・リンク共有' },

  { x: 320, y: 375, icon: 'globe', title: 'wadawataru.me', sub: '独自ドメイン' },
  { x: 320, y: 725, icon: 'files', title: 'JS・CSS・写真', sub: '静的ファイル / Assets' },

  { x: 520, y: 375, icon: 'shield', title: 'ログイン確認', sub: 'Auth.js / middleware' },
  { x: 760, y: 200, icon: 'next', title: '公開ページ', sub: 'ISR / Next.js 16' },
  { x: 760, y: 375, icon: 'next', title: '管理画面', sub: '記事の保存 / Server Actions' },
  { x: 760, y: 550, icon: 'hono', title: '画像 API', sub: '保存・配信 / Hono' },
  { x: 760, y: 725, icon: 'next', title: 'SNS 共有画像', sub: '自動生成 / next/og' },

  { x: 1130, y: 200, icon: 'bucket', title: 'ISR キャッシュ', sub: '生成済みページ / R2' },
  { x: 1130, y: 375, icon: 'db', title: '更新の記録', sub: '古くなった時刻 / D1' },
  { x: 1130, y: 550, icon: 'bucket', title: '画像の保管', sub: 'アップロード画像 / R2' },
  { x: 1130, y: 725, icon: 'bolt', title: '拠点キャッシュ', sub: '画像の再利用 / Cache API' },

  { x: 1530, y: 130, icon: 'github', title: 'GitHub OAuth', sub: '管理者ログイン' },
  { x: 1530, y: 300, icon: 'neon', title: 'Neon', sub: '記事データの原本' },

  { x: 320, y: 975, icon: 'laptop', title: '開発 PC', sub: '開発・DB 変更' },
  { x: 560, y: 975, icon: 'github', title: 'GitHub', sub: 'コード管理' },
  { x: 800, y: 975, icon: 'actions', title: 'GitHub Actions', sub: 'lint・型チェック・デプロイ' },
];

// 矢印: 折れ線の点、色、破線か、ラベル（lx, ly はラベルの中央下）、badge は ISR の流れの番号
const EDGES = [
  // 利用者 → ドメイン
  { p: [[147, 200], [190, 200], [190, 365], [283, 365]], c: BLUE, label: 'HTTPS', lx: 168, ly: 192 },
  { p: [[147, 375], [283, 375]], c: BLUE },
  { p: [[147, 550], [190, 550], [190, 385], [283, 385]], c: BLUE },

  // ドメイン → 静的ファイル（Worker を起動せずに返す）
  { p: [[320, 468], [320, 688]], c: BLUE, label: 'Worker を起動せず返す', lx: 320, ly: 575 },

  // ドメイン → Worker の各ルート
  { p: [[357, 375], [483, 375]], c: BLUE },
  { p: [[420, 375], [420, 200], [723, 200]], c: BLUE, label: '/blogs など', lx: 625, ly: 192 },
  { p: [[420, 375], [420, 560], [723, 560]], c: BLUE, label: '/api/images', lx: 625, ly: 578 },
  { p: [[420, 560], [420, 725], [723, 725]], c: BLUE, label: '/api/og', lx: 625, ly: 717 },

  // ログイン確認 → 保護されたルート
  { p: [[557, 375], [723, 375]], c: BLUE, label: '/admin', lx: 640, ly: 367 },
  { p: [[520, 468], [520, 540], [723, 540]], c: BLUE, label: '/api/upload', lx: 625, ly: 532 },
  { p: [[520, 338], [520, 118], [1493, 118]], c: GRAY, label: 'ログイン認証', lx: 1230, ly: 110 },

  // ISR: ページを見るとき（OpenNext の cacheInterceptor の順。先に R2 を読み、そのあと D1 で確かめる）
  { p: [[797, 188], [1093, 188]], c: PURPLE, badge: '1', label: '生成済みページを読む', lx: 990, ly: 180 },
  { p: [[797, 216], [900, 216], [900, 365], [1093, 365]], c: PURPLE, badge: '2', label: '古くないか確認', lx: 1010, ly: 357 },
  { p: [[760, 163], [760, 134], [1410, 134], [1410, 288], [1493, 288]], c: PURPLE, dash: true, badge: '3', label: 'ない・古いときだけ読む', lx: 1190, ly: 152 },
  { p: [[797, 204], [1093, 204]], c: PURPLE, dash: true, badge: '4', label: '作り直して保存', lx: 1010, ly: 224 },

  // ISR: 記事を更新するとき
  { p: [[760, 338], [760, 300], [1493, 300]], c: TEAL, badge: 'A', label: '記事を読み書き', lx: 990, ly: 292 },
  { p: [[797, 385], [1093, 385]], c: TEAL, badge: 'B', label: '古くなったと記録', lx: 965, ly: 403 },

  // 画像
  { p: [[797, 540], [1093, 540]], c: GRAY, label: '画像の保存・読み出し', lx: 975, ly: 532 },
  { p: [[797, 560], [925, 560], [925, 712], [1093, 712]], c: GRAY, label: '配信画像を保持', lx: 1010, ly: 704 },
  { p: [[797, 725], [1093, 725]], c: GRAY, label: '生成画像を保持', lx: 1010, ly: 743 },

  // 開発・デプロイ
  { p: [[357, 975], [523, 975]], c: GRAY, dash: true, label: 'git push', lx: 440, ly: 967 },
  { p: [[597, 975], [763, 975]], c: GRAY, dash: true, label: 'master で起動', lx: 680, ly: 967 },
  { p: [[800, 938], [800, 827]], c: GRAY, dash: true, label: 'チェック通過後にデプロイ', lx: 892, ly: 920 },
  { p: [[320, 1068], [320, 1110], [1630, 1110], [1630, 300], [1567, 300]], c: GRAY, dash: true, label: 'スキーマ変更・データ投入（drizzle-kit・scripts）', lx: 700, ly: 1102 },
];

// 枠: 実線は事業者、破線はまとまり
const GROUPS = [
  { x: 225, y: 30, w: 1125, h: 840, fill: 'rgba(243,128,32,.055)', stroke: '#e08a4a', color: '#b45309', title: 'Cloudflare', bold: true, icon: true },
  { x: 395, y: 80, w: 560, h: 745, fill: 'rgba(255,255,255,.45)', stroke: '#c8ced6', dash: true, color: '#4b5563', title: 'Worker: wadawataru-me（OpenNext）' },
  { x: 1440, y: 50, w: 180, h: 370, fill: 'rgba(100,116,139,.07)', stroke: '#d3d9e0', color: '#4b5563', title: '外部サービス' },
  { x: 225, y: 895, w: 880, h: 190, fill: 'rgba(255,255,255,.35)', stroke: '#c8ced6', dash: true, color: '#4b5563', title: '開発・デプロイ' },
];

// 文字の下の線や方眼が透けないよう、背景色の縁取りを付ける
const HALO = 'paint-order="stroke" stroke="#f8fafc" stroke-width="5" stroke-linejoin="round"';
const SANS = `'Hiragino Sans','Noto Sans JP Variable','Noto Sans JP',sans-serif`;
const MONO = `'JetBrains Mono','Hiragino Sans','Noto Sans JP Variable','Noto Sans JP',monospace`;
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');

const renderGroup = (g) => `
  <rect x="${g.x}" y="${g.y}" width="${g.w}" height="${g.h}" rx="16" fill="${g.fill}" stroke="${g.stroke}" stroke-width="1.5"${g.dash ? ' stroke-dasharray="5 4"' : ''}/>
  <text x="${g.x + 16}" y="${g.y + 28}" font-family="${SANS}" font-size="15" font-weight="${g.bold ? 700 : 600}" fill="${g.color}">${esc(g.title)}</text>`;

// 番号の丸
const badge = (x, y, text, color) =>
  `<circle cx="${x}" cy="${y}" r="10" fill="${color}"/><text x="${x}" y="${y + 4.5}" text-anchor="middle" font-family="${MONO}" font-size="13" font-weight="700" fill="#fff">${text}</text>`;

// ラベルの幅の目安（全角 13px、半角 8px）。番号の丸をラベルのすぐ左に置くために使う
const labelWidth = (s) => [...s].reduce((w, ch) => w + (ch.charCodeAt(0) > 255 ? 13 : 8), 0);

const renderEdge = (e) => {
  const d = e.p.map(([x, y], i) => `${i ? 'L' : 'M'}${x} ${y}`).join(' ');
  const path = `<path d="${d}" fill="none" stroke="${e.c}" stroke-width="2"${e.dash ? ' stroke-dasharray="6 5"' : ''} marker-end="url(#${MARKER[e.c]})"/>`;
  if (!e.label) return path;
  const mark = e.badge ? badge(e.lx - labelWidth(e.label) / 2 - 15, e.ly - 5, e.badge, e.c) : '';
  return `${path}<text x="${e.lx}" y="${e.ly}" text-anchor="middle" font-family="${MONO}" font-size="13" fill="${e.c}" ${HALO}>${esc(e.label)}</text>${mark}`;
};

const renderNode = (n) => `
  <g transform="translate(${n.x} ${n.y})">
    <rect x="${-R}" y="${-R}" width="${CARD}" height="${CARD}" rx="16" fill="#fff" stroke="#cdd3da" filter="url(#shadow)"/>
    ${ICON[n.icon]}
    <text y="${R + 27}" text-anchor="middle" font-family="${SANS}" font-size="16" font-weight="600" fill="#111827" ${HALO}>${esc(n.title)}</text>
    <text y="${R + 47}" text-anchor="middle" font-family="${MONO}" font-size="12" fill="#6b7280" ${HALO}>${esc(n.sub)}</text>
  </g>`;

// 凡例
const legendItem = (x, color, dash, text) => `
  <path d="M${x} 1148 h46" stroke="${color}" stroke-width="2"${dash ? ' stroke-dasharray="6 5"' : ''} marker-end="url(#${MARKER[color]})"/>
  <text x="${x + 58}" y="1153" font-family="${SANS}" font-size="14" fill="#374151">${text}</text>`;
const legend = [
  legendItem(225, BLUE, false, '利用者からのリクエスト'),
  legendItem(505, PURPLE, false, 'ISR: ページを見るとき'),
  legendItem(775, TEAL, false, 'ISR: 記事を更新するとき'),
  legendItem(1055, GRAY, false, 'その他の通信'),
  legendItem(1255, GRAY, true, '条件つき・開発時だけの通信'),
].join('');

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">
  <defs>
    <pattern id="minor" width="30" height="30" patternUnits="userSpaceOnUse"><path d="M30 0H0V30" fill="none" stroke="#e8edf3"/></pattern>
    <pattern id="major" width="150" height="150" patternUnits="userSpaceOnUse"><path d="M150 0H0V150" fill="none" stroke="#dbe2ea"/></pattern>
    <marker id="blue" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill="${BLUE}"/></marker>
    <marker id="gray" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill="${GRAY}"/></marker>
    <marker id="purple" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill="${PURPLE}"/></marker>
    <marker id="teal" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill="${TEAL}"/></marker>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="150%"><feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#0f172a" flood-opacity=".1"/></filter>
  </defs>
  <rect width="100%" height="100%" fill="#f8fafc"/>
  <rect width="100%" height="100%" fill="url(#minor)"/>
  <rect width="100%" height="100%" fill="url(#major)"/>
  ${GROUPS.map(renderGroup).join('')}
  ${EDGES.map(renderEdge).join('\n  ')}
  ${NODES.map(renderNode).join('')}
  ${legend}
</svg>
`;

writeFileSync(join(DIR, 'architecture.svg'), svg);

const chrome = process.env.CHROME;
if (chrome) {
  // フォント用の CSS を読ませるため、SVG を HTML に埋め込んで撮る
  const links = (process.env.ARCH_FONT_CSS ?? '')
    .split(',')
    .filter(Boolean)
    .map((css) => `<link rel="stylesheet" href="${pathToFileURL(css)}">`)
    .join('');
  const page = join(mkdtempSync(join(tmpdir(), 'arch-')), 'page.html');
  writeFileSync(page, `<!DOCTYPE html><meta charset="utf-8">${links}<style>html,body{margin:0}svg{display:block}</style>${svg}`);
  execFileSync(chrome, [
    '--headless=new',
    '--no-sandbox',
    '--hide-scrollbars',
    '--allow-file-access-from-files',
    '--virtual-time-budget=8000',
    '--force-device-scale-factor=2',
    `--window-size=${WIDTH},${HEIGHT}`,
    `--screenshot=${join(DIR, 'architecture.png')}`,
    pathToFileURL(page).href,
  ], { stdio: 'ignore' });
}

# Project: wadawataru-me

個人ポートフォリオ兼ブログサイト。

## Tech Stack

- **Framework**: Next.js 16.3 (App Router)
- **Runtime**: Cloudflare Workers via `@opennextjs/cloudflare`
- **DB**: Neon (PostgreSQL) + Drizzle ORM
- **Storage**: Cloudflare R2（画像）
- **Auth**: Auth.js v5 beta（GitHub OAuth）
- **Validation**: Zod v4
- **Styling**: Tailwind CSS v4
- **Markdown Editor**: react-simplemde-editor（EasyMDE）
- **Package Manager**: pnpm

## 開発コマンド

```bash
pnpm preview   # ローカル開発（Cloudflare Workers, port 8787）
pnpm run deploy    # 本番デプロイ（最後に scripts/warm-cache.mjs で作り置きを温める）。普段は CI が実行する
pnpm lint      # ESLint（src 配下。整形ルール Prettier も含む）
pnpm lint:fix  # 自動修正できる lint エラー・整形を直す
```

**`pnpm dev` は使わない。** 必ず `pnpm preview` を使うこと。

`master` へ push すると、`.github/workflows/ci.yml` が lint と型チェックを行い、通れば本番へデプロイする（文書だけの変更では動かない）。DB のスキーマ変更は自動で適用されないので、新しいスキーマを使うコードを push する前に手元で適用する。

秘密情報の混入は gitleaks で 2 段階に確かめる。コミット前は `.githooks/pre-commit`（クローンごとに `git config core.hooksPath .githooks` で有効にする。`gitleaks` が未導入なら警告だけ出して通す）、push 後は `.github/workflows/secret-scan.yml`（文書だけの変更でも履歴全体を調べる。デプロイは止めない）。リポジトリは公開なので、見つかったら履歴から消す前に、まずそのキーを再発行する。

## 環境変数

- ローカル: `.dev.vars`（`.env.local` ではない）
- 本番: `wrangler secret put <KEY>`
- ローカルも DB は本番の Neon を読むため、画像の R2（`R2` バインディング）は `wrangler.jsonc` の `"remote": true` で本番のバケットにつないでいる（`wrangler login` が必要。ローカルでアップロードした画像も本番のバケットに入る）。作り置きの R2・D1 はローカルのまま

## 主要ファイル

| ファイル | 役割 |
|---|---|
| `src/components/BlogEditor.tsx` | 記事作成・編集エディタ（メインコンポーネント）|
| `src/app/admin/actions.ts` | 記事の Server Actions（下書き保存・公開・アーカイブ）|
| `src/lib/schemas.ts` | Zod バリデーションスキーマ |
| `src/auth.ts` | Auth.js 設定（GitHub OAuth）|
| `src/middleware.ts` | 認証ミドルウェア（`/admin/**`, `/api/upload` を保護）。`/api/upload` はルート内でも `isAuthenticated()` で確認する（多層防御）|
| `src/app/api/upload/route.ts` | 画像アップロード API（R2）。形式は `src/lib/imageType.ts` でファイルの中身から判定 |
| `src/app/api/images/[key]/route.ts` | 画像配信 API（R2）。nosniff・CSP sandbox・1年キャッシュのヘッダーを付け、Cloudflare の拠点にも Cache API で保存する |
| `src/lib/imageType.ts` | マジックナンバーによる画像形式判定（PNG / JPEG / GIF / WebP / SVG の許可リスト）|
| `src/lib/uploadImage.ts` | クライアント側のアップロード関数と、EasyMDE への貼り付け・ドロップのアップロード処理。送信前に `convertToWebp` を通す |
| `src/lib/convertToWebp.ts` | アップロード前にブラウザで WebP（長い辺 1920px・比率維持・品質 0.85）へ変換する。SVG・GIF・WebP は変換しない |
| `scripts/migrate-github-images.mjs` | GitHub 上の画像を WebP にして R2 へ移すスクリプト（既定は下見のみ、`--apply` で実行。バックアップは `backups/`）|
| `src/app/api/og/route.tsx` | サムネイル未設定記事の OG 画像を自動生成（`next/og`）|
| `src/lib/generatePostMetadata.ts` | 記事ページの metadata（OGP）生成 |
| `src/lib/siteMetadata.ts` | 記事以外の公開ページの題名・説明・SNS 用画像（本人の写真 `public/og-profile.jpg`）。独自の題名を持つページは `pageMetadata` / `siteOpenGraph` を使う（title だけ書くと og:title がサイト名のままになる）。公開ページには `canonical(path)` で正式な URL を付ける（layout には書かない）。トップの題名・説明は `HOME_TITLE` / `HOME_DESCRIPTION`、トップには本人とサイトの構造化データ（JSON-LD）がある|
| `src/app/robots.ts` / `src/app/sitemap.ts` | robots.txt（sitemap.xml の場所を書く）とサイトマップ |
| `src/app/admin/tag-actions.ts` | タグの Server Actions（作成・編集・削除・ジャンル追加/除外・並べ替え）|
| `src/components/TagManagementPage.tsx` | タグ管理画面（`/admin/tags`）。dnd-kit で並べ替え |
| `src/components/TagSelectOverlay.tsx` | 記事エディタ内のタグ選択・新規作成オーバーレイ |
| `src/app/admin/diary-actions.ts` | 日記の Server Action（保存）|
| `src/components/DiaryEditor.tsx` / `DiaryBook.tsx` | 日記の編集（`/admin/diary/[date]`）と本のような表示 |
| `src/db/queries/select.ts` | DB 参照クエリ（管理画面はこちらを直接使う）|
| `src/db/queries/cached.ts` | 公開ページ用の、DB の結果を R2 に作り置きする参照（`unstable_cache`）|
| `src/lib/publicRouteGuards.ts` | 記事・年表の出来事があるかを `[slug]` / `[id]` の `layout.tsx` で確かめる（ローディング画面より手前で 404 を決めるため）|
| `src/lib/revalidatePublic.ts` | 保存・公開したときに公開ページの作り置きを捨てる関数（`revalidatePath` / `updateTag`）|
| `open-next.config.ts` | 作り置きの保存先（R2 `wadawataru-me-cache`。404 のページは保存しない。30日で自動削除のライフサイクルルールあり）と「古くなった」記録（D1 `wadawataru-me-tag-cache`）|
| `scripts/warm-cache.mjs` | デプロイ直後に公開ページを開いて作り置きを作っておくスクリプト（`pnpm run deploy` の最後に実行）|
| `src/app/globals.css` | グローバルスタイル（CSS変数含む）|
| `wrangler.jsonc` | Cloudflare Workers 設定 |
| `src/components/PostListPage.tsx` / `PostListSkeleton.tsx` | 公開側の一覧ページ（ページごと作り置き）と、その読み込み中の骨組み（`(public)/{products,blogs,books}/(list)/loading.tsx` から使う）|
| `src/components/PublicPostList.tsx` | 公開側の一覧の絞り込み・ページ送り。全記事を受け取り、URL の `?tags=` `?page=` に合うものをブラウザ側で表示する（`history.pushState` で URL だけ変える）|
| `src/app/(public)/history/` | 年表（古い順は `(list)/page.tsx`、新しい順は `(list)/newest/page.tsx`、詳細は `[id]/`）。本体は `src/components/HistoryTimelinePage.tsx`。データは `history_events_table` |
| `src/components/HistoryEventEditor.tsx` | 年表の出来事の作成・編集エディタ（`/admin/history`）|
| `scripts/seed-history.mjs` | 年表の初期データ投入スクリプト（テーブルが空のときだけ投入）|
| `src/lib/history.ts` | 年表の時代・種類の定義と、期間（`end_date` / `ongoing`）をブランチ状の線に並べる `buildHistoryGraph` |

## 認証

- GitHub OAuth で `hig270` アカウントのみ許可
- 未認証アクセスは `/login` にリダイレクト

## 主要な制約・注意点

- CSS import（`easymde/dist/easymde.min.css`）は `src/global.d.ts` で型宣言済み
- 画像は外部（GitHub など）を参照せず、必ず管理画面から R2 にアップロードする（GitHub の添付画像は遅く、キャッシュも効かないため）
- トップ・経歴・受賞・資格ページの固定の写真は `public/images/` に WebP（長い辺 1920px・品質 85）で置き、各ページのデータの `image` にパスを書く。元の写真は `picture/`（git 管理外）。用意できない写真は `imageHint` を省いて枠ごと出さない
- 画像アップロードのキーは `{timestamp}-{6文字ランダム}.{ext}` 形式。拡張子と Content-Type はファイル名・申告値ではなく中身の判定結果から決める
- Client Component で async 関数をイベントに渡すときは `onClick={() => void handleX()}` とし、ハンドラー内は try/catch/finally で例外とローディング解除を処理する（Server Action を catch する場合は `unstable_rethrow` で redirect を投げ直す）
- スマホは画面幅 360px 以上を対応範囲とする（360px 以上でレイアウトが崩れないことを保証する。360px 未満は内容が読めて操作できれば十分とし、細かな見た目の崩れは許容する）
- 既存の見た目（記事カードなど）は、依頼された変更以外は変えない。不具合修正でデザイン変更が必要になったら先に確認する
- 公開ページの見た目は `src/components/PageSection.tsx` の部品・定数にそろえる（見出し帯 `PageHero`、見出しつきセクション `Section`、カードの影 `CARD_SHADOW`、カード下端 `CARD_FOOTER`、「〇〇 ›」の `ReadMore`、横余白 `PX`）。ボタン・タグ・ページ送りは丸いピル型、アクセントはオレンジ
- モーダルは `src/lib/useDialog.ts` を使い、`role="dialog"`・`aria-modal`・見出し（`aria-labelledby`）を付ける（フォーカス移動・トラップ・復帰、Esc、背後のスクロール停止はフックが行う）
- `SquareButton` / `RoundButton` の `state` は色だけ。押せなくするのは `disabled`、選択中のタブは `pressed`（aria-pressed）。入力欄は `InputField` か、`FormLabel` の `htmlFor` と入力欄の `id` で結び付ける
- サーバーで描画するページへの移動は、`loading.tsx`（`PageLoading` か専用の骨組み）を置く。`loading.tsx` の内側で `notFound()` を呼ぶとステータスが 200 のままになるので、「ページがあるか」の確認は同じフォルダの `layout.tsx` で作り置きを使って行う（`publicRouteGuards.ts`）。公開ページは URL の検索パラメータをサーバーで読まない（読むとページごとの作り置きができなくなる）。一覧の絞り込み・ページ送りはブラウザ側（`PublicPostList`）、年表の並び順は別のページ（`/history/newest`）。管理画面の一覧で検索パラメータだけ変える移動（絞り込み・ページ送り・状態タブ）は `startTransition` の `isPending` で `data-list-pending` を付ける
- 例外: 記事一覧のカードは、何枚も並ぶので影を控えめにする（薄い暖色の枠線＋オレンジ 10% の小さな影）。記事ページは読みやすさを優先し、中央寄せ・白地の元のデザインを保つ（見出し帯 `PageHero` は使わない）
- `<img>` を使ってよい（next/image は IMAGES バインディング経由で Cloudflare Images の変換料金が発生しうるため、意図的に `<img>` を使う方針。`@next/next/no-img-element` は無効化済み）
- バリデーションエラーはフィールド別にインライン表示（Zod + BlogEditor の `fieldErrors` state）
- エラーメッセージは `この要素は必須です。` / `文字数が超過しています。最大文字数は〇〇字です。` / `使用できない文字が含まれています。`
- slug は英数字・ハイフン・アンダースコアのみ許可（`/^[a-zA-Z0-9_-]+$/`）。**作成後は変更できない**（画面は読み取り専用、`actions.ts` も保存済みの slug を使う）
- 公開ページは作り置き（R2）を返し、アクセスのたびに Neon を読まない。公開ページが DB を読むときは `cached.ts` を使う（記事ページはページごと作り置き）。公開ページの見た目が変わる Server Action では、必ず `revalidatePublic.ts` の関数で作り置きを捨てる（捨て忘れると、非公開にした記事が見え続ける）。管理画面は `admin/layout.tsx` の `force-dynamic` で毎回作る（詳細: `documents/2026-10-04-static-like-caching.md`）
- `Genre` 型は `'blogs' | 'products' | 'books'`（DB の enum と統一。`'blog'` ではない）
- ブログの URL は `/blogs/`、管理画面は `/admin/blogs/`

import type { NextConfig } from "next";

// 全ページ・全 API に付けるセキュリティヘッダー
const SECURITY_HEADERS = [
	// HTTPS だけで接続するようブラウザに覚えさせる（HTTP→HTTPS の転送は Cloudflare の Always Use HTTPS が行う）
	// 一度覚えると max-age の間は取り消せないので、問題が出ないことを確かめるまで 1 日にしておく。
	// includeSubDomains と preload はサブドメインにも影響し、取り消しにも時間がかかるので付けない
	{ key: "Strict-Transport-Security", value: "max-age=86400" },
	// 他サイトの iframe に埋め込ませない（透明な iframe でボタンを押させるクリックジャッキングを防ぐ）
	// CSP の frame-ancestors でも書けるが、画像 API が独自の CSP を返すので、重ならないこちらを使う
	{ key: "X-Frame-Options", value: "DENY" },
	// Content-Type を無視して中身から形式を推測させない（スクリプトとして誤って実行されるのを防ぐ）
	{ key: "X-Content-Type-Options", value: "nosniff" },
	// 外部サイトへ移動するときに、ページのパスや検索パラメータを伝えない（オリジンだけ伝える）
	{ key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
	// このサイトで使わないブラウザの機能を止める（万一スクリプトを埋め込まれても使えないように）
	{ key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
	// x-powered-by: Next.js を出さない（使っている技術をわざわざ知らせない）
	poweredByHeader: false,
	async headers() {
		return [{ source: "/:path*", headers: SECURITY_HEADERS }];
	},
};

export default nextConfig;

// Enable calling `getCloudflareContext()` in `next dev`.
// See https://opennext.js.org/cloudflare/bindings#local-access-to-bindings.
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
initOpenNextCloudflareForDev();

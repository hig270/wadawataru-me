// GitHub のユーザー名変更（higuchi-learn → hig270）に合わせて、DB に入っている記事・年表・タグの本文中の旧 URL を置き換えるスクリプト
//
// なぜ必要か:
//   リポジトリへのリンク（github.com/higuchi-learn/xxx）は GitHub が今は自動で転送してくれるが、
//   旧ユーザー名を別の人が取って同じ名前のリポジトリを作ると転送が止まる。
//   プロフィール（github.com/higuchi-learn）と GitHub Pages（higuchi-learn.github.io）はそもそも転送されず 404 になる。
//   scripts/ の元データは直したが、本番の記事は DB に入っているので、DB 側も置き換える必要がある。
//
// やること:
//   posts_table（content / thumbnail）・history_events_table（content / thumbnail）・tags_table（image_url）から
//   旧ユーザー名を含む URL を探し、--apply のときだけバックアップを取ってから置き換える
//
// 実行:
//   node scripts/replace-github-username.mjs          … 下見のみ（DB には一切書き込まない）
//   node scripts/replace-github-username.mjs --apply  … 実際に置き換える
// （.env.local の DATABASE_URL に接続する）
import { config } from 'dotenv';
import { neon } from '@neondatabase/serverless';
import { mkdirSync, writeFileSync } from 'node:fs';

config({ path: '.env.local' });
const sql = neon(process.env.DATABASE_URL);
const APPLY = process.argv.includes('--apply');

// 旧 → 新。URL の一部として現れる形だけを置き換える（本文中のただの文字列「higuchi-learn」は触らない）
const REPLACEMENTS = [
  ['github.com/higuchi-learn', 'github.com/hig270'],
  ['higuchi-learn.github.io', 'hig270.github.io'],
  ['raw.githubusercontent.com/higuchi-learn/', 'raw.githubusercontent.com/hig270/'],
];

const TARGETS = [
  { table: 'posts_table', label: (r) => `${r.genre}/${r.slug}（${r.status}）`, columns: ['content', 'thumbnail'] },
  { table: 'history_events_table', label: (r) => `年表「${r.title}」`, columns: ['content', 'thumbnail'] },
  { table: 'tags_table', label: (r) => `タグ「${r.name}」`, columns: ['image_url'] },
];

const replaceAll = (text) => {
  if (text == null) return text;
  let out = text;
  for (const [from, to] of REPLACEMENTS) out = out.split(from).join(to);
  return out;
};

async function main() {
  console.log(APPLY ? '=== 置き換えを実行します（--apply）===' : '=== 下見（書き込みは行いません）===');
  const rowsByTable = {
    posts_table: await sql`select id, genre, slug, status, content, thumbnail from posts_table`,
    history_events_table: await sql`select id, title, content, thumbnail from history_events_table`,
    tags_table: await sql`select id, name, image_url from tags_table`,
  };

  // 置き換えが必要な行を集める
  const changes = []; // { table, row, next, label }
  for (const { table, label, columns } of TARGETS) {
    for (const row of rowsByTable[table]) {
      const next = Object.fromEntries(columns.map((c) => [c, replaceAll(row[c])]));
      const changed = columns.filter((c) => next[c] !== row[c]);
      if (changed.length === 0) continue;
      changes.push({ table, row, next, label: label(row) });
      console.log(`\n${label(row)}`);
      for (const c of changed) {
        for (const [from] of REPLACEMENTS) {
          const count = row[c].split(from).length - 1;
          if (count > 0) console.log(`  ${c}: 「${from}」× ${count}`);
        }
      }
    }
  }

  if (changes.length === 0) {
    console.log('旧ユーザー名を含む URL は見つかりませんでした。');
    return;
  }
  console.log(`\n合計: ${changes.length} 行`);

  if (!APPLY) {
    console.log('\n下見のみのため、DB には何も書き込んでいません。');
    return;
  }

  // バックアップ: 書き換える行の、書き換え前の全列を保存する（問題があればこれで元に戻せる）
  const backup = {};
  for (const { table } of TARGETS) backup[table] = changes.filter((c) => c.table === table).map((c) => c.row);
  mkdirSync('backups', { recursive: true });
  const backupPath = `backups/github-username-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
  writeFileSync(backupPath, JSON.stringify(backup, null, 2));
  console.log(`\nバックアップ: ${backupPath}`);

  // updated_at は変えない（リンク先の表記を変えただけで、記事の内容は更新していないため）
  const queries = changes.map(({ table, row, next }) => {
    if (table === 'posts_table') {
      return sql`update posts_table set content = ${next.content}, thumbnail = ${next.thumbnail} where id = ${row.id}`;
    }
    if (table === 'history_events_table') {
      return sql`update history_events_table set content = ${next.content}, thumbnail = ${next.thumbnail} where id = ${row.id}`;
    }
    return sql`update tags_table set image_url = ${next.image_url} where id = ${row.id}`;
  });
  // transaction でまとめて実行し、途中で失敗したらどの行も書き換わらないようにする
  await sql.transaction(queries);
  console.log(`DB を更新: ${queries.length} 行`);
}

await main();

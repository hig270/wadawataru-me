// 年表（history_events_table）の初期データを投入するスクリプト
// もともと /history ページに直書きしていた出来事を DB に移すために一度だけ実行する
//
// 実行: node scripts/seed-history.mjs
// （.env.local の DATABASE_URL に接続する。テーブルが空でなければ二重投入を防ぐため何もしない）
// events の badge はラベル名で書いておき、投入時に history_badges_table を作ってその id で紐付ける
import { randomUUID } from 'node:crypto';
import { config } from 'dotenv';
import { neon } from '@neondatabase/serverless';

config({ path: '.env.local' });

const events = [
  {
    "era": "elementary",
    "sortDate": "2012-04-01",
    "dateLabel": "2012年4月",
    "kind": "life",
    "badge": null,
    "title": "小学校入学",
    "summary": null,
    "content": "",
    "thumbnail": null
  },
  {
    "era": "elementary",
    "sortDate": "2018-03-01",
    "dateLabel": "2018年3月",
    "kind": "life",
    "badge": null,
    "title": "小学校卒業",
    "summary": null,
    "content": "",
    "thumbnail": null
  },
  {
    "era": "junior_high",
    "sortDate": "2018-04-01",
    "dateLabel": "2018年4月",
    "kind": "life",
    "badge": null,
    "title": "中学校入学",
    "summary": null,
    "content": "",
    "thumbnail": null
  },
  {
    "era": "junior_high",
    "sortDate": "2019-04-01",
    "dateLabel": "中学時代",
    "kind": "tech",
    "badge": null,
    "title": "ガジェット・家電に興味を持つ",
    "summary": "YouTuber のガジェット動画に影響を受ける。ラムダ技術部に憧れ、電子工作・プログラミングを学びたいと感じるように。",
    "content": "",
    "thumbnail": null
  },
  {
    "era": "junior_high",
    "sortDate": "2020-09-01",
    "dateLabel": "中学3年",
    "kind": "life",
    "badge": null,
    "title": "工業高校 電子工学科への進学を決断",
    "summary": "「電子工作を本格的に学びたい」という動機から、自ら進路を選んだ。",
    "content": "",
    "thumbnail": null
  },
  {
    "era": "junior_high",
    "sortDate": "2021-03-01",
    "dateLabel": "2021年3月",
    "kind": "tech",
    "badge": null,
    "title": "人生初の自作PC",
    "summary": "中学時代のプレゼントをすべて放棄し、13万円分のパーツで初めてのPCを組み上げる。",
    "content": "",
    "thumbnail": null
  },
  {
    "era": "high_school",
    "sortDate": "2021-04-01",
    "dateLabel": "2021年4月",
    "kind": "life",
    "badge": null,
    "title": "岐阜工業高等学校 電子工学科 入学",
    "summary": "授業で初めてプログラミングに触れる。アルゴリズムや数学的手法を C で実装して自主的に学習した。",
    "content": "",
    "thumbnail": null
  },
  {
    "era": "high_school",
    "sortDate": "2021-10-01",
    "dateLabel": "2021年10月",
    "kind": "life",
    "badge": null,
    "title": "生徒会役員に就任",
    "summary": "以降 4期連続で役員を務め、会計・書記を経て生徒会長に。",
    "content": "",
    "thumbnail": null
  },
  {
    "era": "high_school",
    "sortDate": "2021-10-02",
    "dateLabel": "2021年10月",
    "kind": "tech",
    "badge": "資格",
    "title": "リスニング英語検定 1級",
    "summary": null,
    "content": "",
    "thumbnail": null
  },
  {
    "era": "high_school",
    "sortDate": "2021-12-01",
    "dateLabel": "2021年12月",
    "kind": "life",
    "badge": null,
    "title": "セブン‐イレブンでアルバイト開始",
    "summary": "1年で約1,000時間勤務し、実質的な学生スタッフのリーダーに。",
    "content": "",
    "thumbnail": null
  },
  {
    "era": "high_school",
    "sortDate": "2022-06-01",
    "dateLabel": "2022年6月",
    "kind": "tech",
    "badge": "資格",
    "title": "基本情報技術者試験 合格",
    "summary": null,
    "content": "",
    "thumbnail": null
  },
  {
    "era": "high_school",
    "sortDate": "2022-07-01",
    "dateLabel": "2022年7月",
    "kind": "life",
    "badge": null,
    "title": "全国高校総合文化祭 生徒実行委員に",
    "summary": "清流の国ぎふ総文2024 の広報イベント委員長として、PRイベントの企画・グッズ制作を担当。",
    "content": "",
    "thumbnail": null
  },
  {
    "era": "high_school",
    "sortDate": "2022-12-01",
    "dateLabel": "2022年12月",
    "kind": "tech",
    "badge": "資格",
    "title": "応用情報技術者試験 合格",
    "summary": null,
    "content": "",
    "thumbnail": null
  },
  {
    "era": "high_school",
    "sortDate": "2023-06-01",
    "dateLabel": "2023年6月",
    "kind": "tech",
    "badge": "資格",
    "title": "情報処理安全確保支援士試験 合格",
    "summary": "高校3年で取得。同月に情報セキュリティマネジメント試験にも合格。",
    "content": "",
    "thumbnail": null
  },
  {
    "era": "high_school",
    "sortDate": "2023-08-01",
    "dateLabel": "2023年8月 – 12月",
    "kind": "tech",
    "badge": "資格",
    "title": "通信・電気系の国家資格を次々取得",
    "summary": "電気通信主任技術者・第一級陸上無線技術士・消防設備士 甲種4類・工事担任者 総合通信。",
    "content": "",
    "thumbnail": null
  },
  {
    "era": "high_school",
    "sortDate": "2024-01-01",
    "dateLabel": "高校3年",
    "kind": "tech",
    "badge": null,
    "title": "課題研究で入退室管理システムを開発",
    "summary": "Raspberry Pi と NFC を使った教員の入退室管理システムで、開発リーダーを担当。",
    "content": "",
    "thumbnail": null
  },
  {
    "era": "high_school",
    "sortDate": "2024-03-01",
    "dateLabel": "2024年3月",
    "kind": "life",
    "badge": "受賞",
    "title": "ジュニアマイスター顕彰 経済産業大臣賞",
    "summary": "在学中に15資格を取得し、歴代最高得点 270pt で受賞。同月、高校を卒業。",
    "content": "",
    "thumbnail": null
  },
  {
    "era": "university",
    "sortDate": "2024-04-01",
    "dateLabel": "2024年4月",
    "kind": "life",
    "badge": null,
    "title": "愛知工業大学 電子情報工学専攻 入学",
    "summary": "システム工学研究会に所属。HTML・CSS で初めての Web ページを制作。",
    "content": "",
    "thumbnail": null
  },
  {
    "era": "university",
    "sortDate": "2024-06-01",
    "dateLabel": "2024年6月",
    "kind": "life",
    "badge": null,
    "title": "エクステンションセンター 地域連携スタッフ",
    "summary": "小中学生向けイベント「まるごと体験ワールド」の運営補助や出張講義のお手伝い。",
    "content": "",
    "thumbnail": null
  },
  {
    "era": "university",
    "sortDate": "2024-08-01",
    "dateLabel": "2024年8月",
    "kind": "tech",
    "badge": null,
    "title": "日立ソリューションズ・テクノロジー インターン",
    "summary": "ドライブレコーダー画像を C 言語で変換・保存する組み込み業務を体験。",
    "content": "",
    "thumbnail": null
  },
  {
    "era": "university",
    "sortDate": "2024-10-01",
    "dateLabel": "2024年10月",
    "kind": "tech",
    "badge": "受賞",
    "title": "工科展 優秀賞「SysPay」",
    "summary": "TypeScript・React で模擬店向け注文システムの注文ページを担当。",
    "content": "",
    "thumbnail": null
  },
  {
    "era": "university",
    "sortDate": "2024-12-01",
    "dateLabel": "2024年12月",
    "kind": "tech",
    "badge": "受賞",
    "title": "技育CAMP ハッカソン vol.19 優秀賞",
    "summary": "Raspberry Pi Pico W と MicroPython で魔法の杖型コントローラー「ステキなステッキ」を制作。",
    "content": "## ステキなステッキ\n\nRaspberry Pi Pico W を搭載した杖型コントローラーを使って、2人のプレイヤーが動きで対戦するゲームです。杖で「MPを溜める・攻撃する・守る」の行動を選び、相手のHPを0にしたら勝ち。コントローラーのセンサー値をサーバーへ送信し、Webアプリ側でゲームの判定を行います。\n\n技育CAMP ハッカソン vol.19 で優秀賞（2位）、技育博2024 vol.6 で株式会社ゆめみ企業賞を受賞しました。\n\n![](https://github.com/user-attachments/assets/a09384c2-9828-4d07-ab33-7206d0b33fa4)\n\n### 背景\n\nハッカソンで「見ている人が楽しめるもの」を作ろうという方針から着想。ハードウェアとWebアプリを組み合わせることで、デモとして映えるプロダクトを目指しました。\n\n### 担当\n\n- Raspberry Pi Pico W を用いたコントローラーの電子回路設計・実装\n- センサー値を JSON 形式でサーバーへ送信する通信処理の設計・実装\n\n### 技術的な工夫\n\n当初 WebSocket を使用する予定でしたが、MicroPython 環境では利用可能な WebSocket ライブラリが存在しないことが判明しました。そこで **毎秒 HTTP 通信＋レスポンスの条件分岐** によって擬似リアルタイム通信を実装しました。\n\n### 技術スタック\n\nMicroPython / Raspberry Pi Pico W / HTTP（擬似リアルタイム）/ センサー回路設計・実装\n\n### リンク\n\n- [GitHub](https://github.com/hig270/lovely-stick)\n- [発表スライド](https://www.canva.com/design/DAGeeEF3T2U/qEBiPbFmTjxi5IjgVbHxjg/view)\n",
    "thumbnail": "https://github.com/user-attachments/assets/328c6f28-cc6a-489e-abb4-9fd2ea641dde"
  },
  {
    "era": "university",
    "sortDate": "2025-02-01",
    "dateLabel": "2025年2月",
    "kind": "tech",
    "badge": "受賞",
    "title": "技育博 2024 株式会社ゆめみ 企業賞",
    "summary": "「ステキなステッキ」が技育博でも評価される。",
    "content": "",
    "thumbnail": null
  },
  {
    "era": "university",
    "sortDate": "2025-03-01",
    "dateLabel": "2025年3月",
    "kind": "tech",
    "badge": "受賞",
    "title": "SysHack STECH 協賛賞「Bingo!2」",
    "summary": "Next.js・Firebase で、スマホだけで大人数のビンゴ大会ができるアプリを開発。",
    "content": "## Bingo!2\n\n大人数のビンゴ大会をデジタル化した Web アプリです。紙のビンゴカードをスマートフォン・PC で代替し、ビンゴカードの自動生成・リアルタイム判定・リーチ/ビンゴ確率の表示まで行えます。ルームを作成して複数人で参加でき、1台のパソコンと参加者のスマホがあればすぐにビンゴ大会を開けます。\n\n![](https://github.com/user-attachments/assets/2c6cb1e8-21a5-4316-90e0-730f1314dfb9)\n\n### 背景\n\n大人数のビンゴ大会では紙のカードの配布・回収・判定が煩雑になるという課題がありました。デジタル化によって効率化するだけでなく、「今何%でビンゴになるか」という確率表示を加えることで、紙では実現できない付加価値を持たせることを目指しました。\n\n### 実装内容（ほぼ個人開発）\n\n- ルーム・ビンゴカードの自動生成処理\n- 抽選番号確定時のリアルタイムカード判定\n- リーチ・ビンゴ確率算出アルゴリズムの実装\n- Firestore の onSnapshot を活用したリアルタイム更新\n- DB 設計\n\n### 学び・反省\n\nFirestore をリアルタイム DB として使用しましたが、多人数が同時参加するケースでは読み取り・書き込み回数が急増し、無料枠をすぐに超えることが判明しました。**そもそもデータを永続化する必要があるのか** という設計の根本を問い直す必要があると気づき、再設計を計画しています。\n\n### 技術スタック\n\nTypeScript / Next.js / Tailwind CSS / Shadcn UI / Firebase（Firestore）\n\n### リンク\n\n- [GitHub](https://github.com/hig270/syshack-bingo)\n- [発表スライド](https://www.canva.com/design/DAGjQ4RHnYU/YvluRIHCfkngv1QldyFMLQ/view)\n",
    "thumbnail": "https://github.com/user-attachments/assets/a7d897d0-75ec-4964-b8a7-b4e453a13c73"
  },
  {
    "era": "university",
    "sortDate": "2025-04-15",
    "dateLabel": "大学2年",
    "kind": "tech",
    "badge": null,
    "title": "Wii リモコンの再現に挑戦",
    "summary": "Raspberry Pi Zero と Python で、BLE 通信を使った Wii リモコンの再現に取り組む。",
    "content": "",
    "thumbnail": null
  },
  {
    "era": "university",
    "sortDate": "2025-05-01",
    "dateLabel": "2025年5月",
    "kind": "life",
    "badge": null,
    "title": "ピアサポーター / Matsuriba で LT 登壇",
    "summary": "後輩が専門科目を気軽に質問できる学習支援を開始。東海の学生エンジニアコミュニティで初登壇。",
    "content": "",
    "thumbnail": null
  },
  {
    "era": "university",
    "kind": "life",
    "badge": null,
    "content": "",
    "thumbnail": null,
    "sortDate": "2025-06-20",
    "dateLabel": "2025年6月 – 7月",
    "title": "28Tech で LT 登壇・シス研で Web 勉強会を主催",
    "summary": "28Tech vol.2 で自己紹介 LT。サークルでは HTML・CSS 勉強会を開き、資料を Web ページとして公開した。"
  },
  {
    "era": "university",
    "sortDate": "2025-07-01",
    "dateLabel": "2025年夏",
    "kind": "tech",
    "badge": null,
    "title": "物体検出ゲーム「ChickenShooting」に挑戦",
    "summary": "CVAT でアノテーションし YOLO で独自モデルを学習。顔の向きでゲームを操作する仕組みを開発。",
    "content": "## ChickenShooting\n\n顔の動きでゲームを操作する、物体検出連携ゲームです。Web カメラで顔を検出し、顔の向き・角度をリアルタイムで Unity に送信することで、体を使ってゲームを操作する仕組みを目指しました。Tokyo Game Show への出展を目標に開発を始め、2026年9月の東京ゲームショウに出展しました。\n\n### 背景\n\n「コントローラーを持たずに体の動きだけでゲームを操作できたら面白い」という着想から、物体検出とゲームエンジンを組み合わせる技術的な挑戦として取り組みました。\n\n### 実装内容\n\n- YOLO による独自学習モデルの作成（CVAT でアノテーション）\n- Web カメラ映像からの特徴点検出\n- 特徴点座標から顔の角度を算出するロジックの設計\n- Unity へのリアルタイムデータ送信処理\n\n### 開発中の課題\n\n物体検出・特徴点検出には成功しました。一方で顔の角度算出は、プログラミングの問題というよりも **数学的な知識（ベクトル・回転行列など）が必要な領域** であることが分かりました。\n\n### 技術スタック\n\nPython / YOLO / CVAT / Unity (C#) / ソケット通信\n\n### リンク\n\n- [GitHub](https://github.com/hig270/chicken_send)\n",
    "thumbnail": "https://github.com/user-attachments/assets/3117f3aa-4d19-4185-887a-b6a40601406c"
  },
  {
    "era": "university",
    "sortDate": "2025-08-01",
    "dateLabel": "2025年8月",
    "kind": "tech",
    "badge": "受賞",
    "title": "技育CAMP ハッカソン 最優秀賞「Gesture Audio」",
    "summary": "XIAO BLE と Next.js で、腕に着けて音楽を操作するコントローラーを制作。",
    "content": "## Gesture Audio\n\n腕のジェスチャーで音楽を操作するウェアラブルコントローラーです。腕に装着したコントローラーのセンサー値を BLE で Web アプリへ送信し、ジェスチャーによって音楽の再生・停止・スキップを操作できます。技育CAMP2025 ハッカソン Vol.10 で最優秀賞を受賞しました。\n\n![](https://github.com/user-attachments/assets/94a34dba-6ce4-47c0-89f9-0fd50d92efd0)\n\n### 背景\n\n作業中にスマートフォンに手を伸ばして音楽を操作する手間が集中力を妨げる、という経験から着想。ジェスチャーだけで操作できれば集中を維持できると考え、開発しました。\n\n### 担当（ハードウェア側）\n\n- 腕装着型コントローラーの電子回路設計・実装\n- センサー値の取得処理\n- BLE による Web アプリへのデータ送信処理\n- 受信データを用いた再生／停止／スキップのイベント発火ロジック実装\n\n### 学び\n\n苦労して作ったプロダクトよりも、遊び感覚で作ったこのプロダクトの方が高く評価されました。**ユーザーから評価されるものは技術的な難しさではなく、体験の面白さや直感的な楽しさにある** という気づきを得ました。\n\n### 技術スタック\n\nXIAO BLE Sense / C++ / BLE / 6軸加速度センサー\n\n### リンク\n\n- [GitHub（ハードウェア）](https://github.com/hig270/GestureAudio)\n- [GitHub（フロントエンド）](https://github.com/rinyaaa/Music)\n- [発表スライド](https://www.canva.com/design/DAGvlxQLaRw/8fbZ3A8wx9VI0na9Rp_ppA/view)\n",
    "thumbnail": "https://github.com/user-attachments/assets/835ad999-86c3-4a2c-b9d5-56ca0634a356"
  },
  {
    "era": "university",
    "sortDate": "2025-10-01",
    "dateLabel": "2025年10月",
    "kind": "tech",
    "badge": "出展",
    "title": "工科展 2025 に入退室管理システムを出展",
    "summary": "Raspberry Pi・FastAPI・MariaDB・Next.js で、カメラで部室の入退室を記録するシステムを開発。",
    "content": "## 入退室管理システム\n\nカメラ映像から顔を認識して、部室の入退室を管理するシステムです。Raspberry Pi に接続したカメラで人物を検出・識別し、入退室の記録をリアルタイムで Web アプリに反映します。部室の利用状況を可視化することで、オープンで活気ある空間の雰囲気づくりを目的に開発しました。\n\n![](https://github.com/user-attachments/assets/3ba55c67-f945-4396-82d5-c8f6883192c6)\n\n### 担当\n\n- FastAPI によるサーバー通信設計・実装\n- MariaDB との連携・DB 設計\n- 特徴量比較による入退室者判定処理の実装\n- Next.js によるフロントエンド\n\n### 学び・反省\n\nシステムとしては動作しましたが、`face_recognition` ライブラリの内部動作を十分に理解しないまま使用したため、認識精度に課題が生じました。**ライブラリをブラックボックスのまま使うことの危険性** を身をもって学び、使用するライブラリの仕組みを理解してから採用することの重要性を認識しました。\n\n### 技術スタック\n\nRaspberry Pi / Python / FastAPI / MariaDB / face_recognition / TypeScript / Next.js\n\n### リンク\n\n- [GitHub（バックエンド）](https://github.com/hig270/koukaten)\n- [GitHub（フロントエンド）](https://github.com/hig270/koukaten2025)\n- [発表資料](https://www.canva.com/design/DAG1Mb6DHuk/p7vP5TPRKIIREpATK6HkZQ/view)\n",
    "thumbnail": "https://github.com/user-attachments/assets/ae659b3b-a792-4f6f-b57d-2aef67df926e"
  },
  {
    "era": "university",
    "sortDate": "2026-01-01",
    "dateLabel": "2026年1月",
    "kind": "tech",
    "badge": null,
    "title": "23ビット加算器表示器を制作",
    "summary": "自ら企画した小学生向け電子工作講座の教材として、全加算器 23 個と 7セグ LED で動く加算器を自作。",
    "content": "## 23ビット加算器表示器\n\n23個の全加算器を用いて、最大 (2^23 - 1) + (2^23 - 1) の加算結果を 7 セグメント LED で表示する電子回路です。全加算器をブレッドボード上に組み上げ、2つの入力値の加算結果を 8 桁の 7 セグメント LED に表示します。\n\n### 背景\n\n大学のエクステンションセンターで自ら企画した小学生向け電子工作講座（2026年8月「まるごと体験ワールド」で開催）の教材として制作しました。「コンピュータがどうやって足し算をするのか」を実物で体験してもらうことが目的です。半加算器・全加算器を自分で作り、それを繋げていくと大きな桁の計算ができるという加算器の原理を、実際に手で触れながら学べる教材を目指しました。\n\n### 回路の構成\n\n- 半加算器 × 1、全加算器 × 22 をブレッドボード上に実装\n- シフトレジスタ（TC74HC165AP）を用いて Arduino の出力ピン数を拡張\n- ダイナミック点灯とトランジスタ（2SC1815）のスイッチングにより 8 桁の 7 セグメント LED を制御\n\n### 学び\n\nトランジスタによるスイッチング、ダイナミック点灯、シフトレジスタを用いた出力拡張など、電子回路設計技術を実装を通じて習得しました。論理回路の理論が実際の電子部品として動作する体験は、大学の講義で学んだアナログ回路の知識と直結するものでした。\n\n### 技術スタック\n\nArduino Nano Every / C++ / トランジスタ / シフトレジスタ / 7 セグメント LED\n\n### リンク\n\n- [GitHub](https://github.com/hig270/20adder)\n",
    "thumbnail": "https://github.com/user-attachments/assets/65ef704e-9428-45f1-9998-69bb117951fb"
  },
  {
    "era": "university",
    "sortDate": "2026-02-01",
    "dateLabel": "2026年2月",
    "kind": "tech",
    "badge": null,
    "title": "ポートフォリオサイト「わだわたる」制作開始",
    "summary": "Next.js + Cloudflare Workers + Neon で、ブログ・制作物・読書記録を管理できるサイトを構築。",
    "content": "## わだわたる（このサイト）\n\n自分に関する情報を共有するための、ブログ投稿サイト兼ポートフォリオです。CMS を自作し、ポートフォリオを通して技術力を示すことも目的にしています。\n\n### 制作背景\n\n- 技術発信は Qiita・Zenn、思想ははてなブログ……と、内容ごとに媒体を使い分けるのが面倒だった\n- 自分専用のタグで記事を絞り込めるようにしたかった\n- 就活や人との交流で、自分のサイト1つで自分に関する色々な情報を共有したかった\n\n### v1 での失敗\n\nNext.js + Cloudflare Workers + D1 + Drizzle + Hono + LiftKit で作り始めましたが、UI ライブラリ（LiftKit）のスタイルの読み解きやレスポンシブ対応が難しすぎたことが決定打となり、作り直しを決めました。\n\n### v2 での改善\n\nNext.js + Cloudflare Workers + Neon + Drizzle + Hono + Tailwind CSS に変更しました。\n\n- **Neon**: SQLite（D1）は型が甘いと感じ、データベース設計や認証設計を自分で実装する経験を重視して PostgreSQL を選択\n- **UI ライブラリを使わない**: Tailwind CSS だけで作りたいスタイルを実装する力を付けるため\n- **実装手順**: まず使いたい技術で基本的な処理が書けること、OpenNext・Workers 上で動作することを確かめてから制作に移り、v1 より開発速度が上がった\n\nこの構成でプロダクトを開発した記事が見当たらなかったため、実装できることを示す記事を Qiita で公開しました。\n\n- [Next.js + Neon + Drizzle + R2 を使ったプロダクトを Cloudflare Workers で公開する.](https://qiita.com/wada_wataru/items/014b7db9635988ba1281)\n- [【Hyperdrive】Next.js+Neon を Workers にデプロイするときの注意点](https://qiita.com/wada_wataru/items/0f2fa279a8b86a629a37)\n\n### リンク\n\n- [GitHub](https://github.com/hig270/wadawataru-me)\n",
    "thumbnail": null
  },
  {
    "era": "university",
    "sortDate": "2026-03-01",
    "dateLabel": "2026年3月",
    "kind": "tech",
    "badge": null,
    "title": "ミニスポット共有サービス「micro-spot」を開発",
    "summary": "「わざわざ紹介するほどでもない小さな発見」を共有し、旅行に新しい価値を届けるサービス。React・TypeScript・Supabase で開発。",
    "content": "",
    "thumbnail": null
  },
  {
    "era": "university",
    "sortDate": "2026-04-01",
    "dateLabel": "2026年4月 – 9月",
    "kind": "life",
    "badge": null,
    "title": "複数企業のインターンに参加",
    "summary": "ジーニー・GA technologies・オープンハウスグループ・SmartHR・PLAY・レバレジーズ・クイック・kubell・ディップ。",
    "content": "",
    "thumbnail": null
  },
  {
    "era": "university",
    "sortDate": "2026-04-01",
    "dateLabel": "2026年4月",
    "kind": "life",
    "badge": null,
    "title": "コムスクエア インターン",
    "summary": "フルリモートで Web エンジニアとして業務に従事。",
    "content": "",
    "thumbnail": null
  },
  {
    "era": "university",
    "kind": "life",
    "badge": "登壇",
    "content": "",
    "thumbnail": null,
    "sortDate": "2026-08-08",
    "dateLabel": "2026年8月",
    "title": "小学生向けの自主企画講座を開催",
    "summary": "まるごと体験ワールドで「コンピューターに『1+1＝10』って言わせてみよう！」を開催。自作の加算器を教材に、2進数と論理回路を体験してもらった。"
  },
  {
    "era": "university",
    "sortDate": "2026-09-01",
    "dateLabel": "2026年9月",
    "kind": "tech",
    "badge": "出展",
    "title": "東京ゲームショウに「ChickenShooting」を出展",
    "summary": "2025年夏から開発してきた、顔の動きで操作する物体検出ゲームを東京ゲームショウに出展。",
    "content": "",
    "thumbnail": null
  }
];

const sql = neon(process.env.DATABASE_URL);

const [{ count }] = await sql`
  select cast((select count(*) from history_events_table) + (select count(*) from history_badges_table) as int) as count
`;
if (count > 0) {
  console.log('history_events_table / history_badges_table にすでにデータがあるため、投入をスキップしました。');
  process.exit(0);
}

// ラベルの id はここで発行しておく（transaction 内のクエリは互いの結果を参照できないため、
// INSERT ... RETURNING で受け取った id を後続の INSERT に使う、ということができない）
const badgeIds = new Map(
  [...new Set(events.map((e) => e.badge).filter(Boolean))].map((name) => [name, randomUUID()]),
);
const badgeQueries = [...badgeIds].map(
  ([name, id]) => sql`insert into history_badges_table (id, name) values (${id}, ${name})`,
);

// createdAt をずらしておくことで、同じ sortDate の出来事もこの配列の順番で並ぶ
const base = Date.now();
const eventQueries = events.map((e, i) => {
  const now = new Date(base + i);
  return sql`
    insert into history_events_table
      (era, sort_date, date_label, kind, badge_id, title, summary, content, thumbnail, created_at, updated_at)
    values
      (${e.era}, ${e.sortDate}, ${e.dateLabel}, ${e.kind}, ${badgeIds.get(e.badge) ?? null}, ${e.title}, ${e.summary}, ${e.content}, ${e.thumbnail}, ${now}, ${now})
  `;
});
// transaction で全件まとめて投入し、途中で失敗したら1件も入らないようにする
// ラベルを先に入れないと、出来事の badge_id が外部キー違反になる
await sql.transaction([...badgeQueries, ...eventQueries]);
console.log(`ラベル ${badgeIds.size} 件、出来事 ${events.length} 件を投入しました。`);

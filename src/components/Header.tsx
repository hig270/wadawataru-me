'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import SelectBar, { ADMIN_NAV_ITEMS } from '@/components/SelectBar';
import SideBar from '@/components/SideBar';

type HeaderProps = {
  variant?: 'public' | 'admin';
};

export default function Header({ variant = 'public' }: HeaderProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navItems = variant === 'admin' ? ADMIN_NAV_ITEMS : undefined;

  return (
    <>
      <header className="bg-white flex items-center justify-between gap-4 px-1 2xl:px-8 w-full shrink-0 print:hidden">
        <div className="flex items-center gap-6">
          {/* ロゴ */}
          <Link href="/" className="shrink-0">
            <Image src="/logo-long.webp" alt="わだわたる" width={200} height={50} priority />
          </Link>

          {/* デスクトップ: ナビゲーション
              ロゴ（200px）＋タブ8つ（約460px）＋SNS アイコン（約74px）で約760px あり、md（768px）では右端の GitHub アイコンと重なるため、
              タブを横に並べるのは lg（1024px）以上にしている。管理画面のタブ10個（約880px）でも lg なら収まる */}
          <SelectBar items={navItems} className="hidden lg:flex items-center gap-2" />

          {/* モバイル・タブレット（lg 未満）: SNSアイコン */}
          <div className="flex lg:hidden items-center gap-2.5">
            <SocialIcons />
          </div>
        </div>

        {/* デスクトップ（lg 以上）: SNSアイコン */}
        <div className="hidden lg:flex items-center gap-2.5">
          <SocialIcons />
        </div>

        {/* モバイル・タブレット（lg 未満）: ハンバーガーメニュー */}
        {/* aria-expanded・aria-controls: メニューが開いているか、どのメニューを開くボタンかを読み上げソフトに伝える */}
        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          className="flex lg:hidden size-8 items-center justify-center cursor-pointer"
          aria-label="メニューを開く"
          aria-expanded={sidebarOpen}
          aria-controls="site-menu"
        >
          <svg viewBox="0 0 24 24" className="size-5 fill-current text-[var(--lighttext)]" aria-hidden="true">
            <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
          </svg>
        </button>
      </header>

      {/* モバイル: サイドバー */}
      <SideBar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} items={navItems} />
    </>
  );
}

function SocialIcons() {
  return (
    <>
      <a
        href="https://github.com/hig270"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="GitHub"
        className="size-8 flex items-center justify-center"
      >
        <svg viewBox="0 0 32 32" className="size-8 fill-current">
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M16 2C8.27 2 2 8.27 2 16c0 6.19 4.008 11.43 9.572 13.288.7.13.956-.304.956-.674 0-.332-.013-1.43-.018-2.61-3.893.847-4.714-1.677-4.714-1.677-.636-1.617-1.553-2.047-1.553-2.047-1.271-.869.096-.852.096-.852 1.404.099 2.144 1.441 2.144 1.441 1.25 2.14 3.277 1.523 4.075 1.164.127-.905.49-1.523.89-1.872-3.108-.354-6.375-1.554-6.375-6.916 0-1.527.546-2.776 1.44-3.754-.144-.355-.625-1.777.138-3.703 0 0 1.174-.376 3.847 1.434A13.396 13.396 0 0116 8.958c1.19.006 2.387.161 3.506.473 2.67-1.81 3.843-1.434 3.843-1.434.764 1.926.284 3.348.14 3.703.896.978 1.438 2.227 1.438 3.754 0 5.376-3.272 6.558-6.39 6.904.503.433.95 1.286.95 2.593 0 1.872-.017 3.38-.017 3.84 0 .373.251.81.962.672C25.996 27.424 30 22.187 30 16 30 8.27 23.73 2 16 2z"
          />
        </svg>
      </a>
      <a
        href="https://x.com/hig270"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="X (Twitter)"
        className="size-8 flex items-center justify-center"
      >
        <svg viewBox="0 0 24 24" className="size-8 fill-current">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.168-5.394 6.168H2.746l7.73-8.835L2 2.25h6.944l4.26 5.632L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
        </svg>
      </a>
    </>
  );
}

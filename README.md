# MindTravel3D

3D迷路の楽しさを最大化し、世界中のユーザーに届ける3D迷路体験プラットフォーム

テストページ
https://maskin.github.io/MindTravel3D/

## 🎮 概要

MindTravel3Dは、Three.jsを使用したWebベースの3D迷路ゲームです。直感的な操作で没入感のある3D迷路体験を提供し、1000万人のユーザーに3D迷路の楽しさを伝えることを目標としています。

## 🚀 特徴

- **3D迷路体験**: リアルタイム3D描画による没入感ある迷路探索
- **グリッドベース移動**: クラシック迷路ゲームの直感的操作感
- **マルチプラットフォーム**: PC・スマートフォン・タブレット対応
- **プログレッシブWebアプリ**: インストール可能でオフライン対応
- **統一操作体験**: 3D視点と俯瞰視点の完全同期
- **高性能**: 60fps・3秒読み込み・500MB以下メモリ使用

## 🛠 技術スタック

- **フロントエンド**: HTML5, CSS3, JavaScript (ES6+)
- **3Dエンジン**: Three.js
- **PWA**: Service Worker, Web App Manifest
- **デプロイ**: 静的サイトホスティング

## 🎯 開発フェーズ

### MVP (✅ 完了 - 2025年8月4日)
- ✅ 基本的な3D迷路ゲーム
- ✅ マルチプラットフォーム対応
- ✅ PWA機能
- ✅ 迷路生成アルゴリズム
- ✅ **重要改善**: グリッドベース移動系統実装
- ✅ 3D・俯瞰ビューの完全同期
- ✅ 直感的操作システム（90度回転スナップ）

### 1stフェーズ (準備完了)
- 📋 [詳細な要件定義書](./docs/requirements-phase1.md)
- 📊 [開発進捗レポート](./docs/development-progress-report.md)
- 🎯 目標: 100万ユーザー獲得
- 📅 期間: 6ヶ月
- 🚀 技術基盤: 完全準備済み

## 🎮 プレイ方法

### PC
- **W/↑**: 前進（グリッド単位移動）
- **S/↓**: 後退（グリッド単位移動）
- **A/←**: 左回転（90度スナップ）
- **D/→**: 右回転（90度スナップ）
- **マウス**: 視点操作（ポインターロック）
- **R**: 新しい迷路生成
- **Esc**: メニュー表示
- **Ctrl+D**: デバッグパネル

### スマートフォン・タブレット
- **タッチスワイプ**: グリッド移動・90度回転
- **画面下部ボタン**: 方向操作（統一インターフェース）
- **レスポンシブUI**: デバイスサイズ自動調整

## 📁 プロジェクト構造

```
MindTravel3D/
├── index.html          # メインHTML
├── manifest.json       # PWA設定
├── sw.js              # Service Worker
├── three.min.js       # Three.js ライブラリ
├── js/                # ゲームロジック
│   ├── main.js        # メイン制御
│   ├── game-engine.js # 3Dエンジン
│   ├── maze-generator.js # 迷路生成
│   ├── controls.js    # 操作制御
│   └── ui-manager.js  # UI管理
└── docs/              # 設計書類
    ├── README.md
    └── requirements-phase1.md
```

## 🚀 開発・実行

```bash
# リポジトリクローン
git clone https://github.com/maskin/MindTravel3D.git
cd MindTravel3D

# ローカルサーバー起動
python3 -m http.server 8000
# または
npx serve

# ブラウザでアクセス
open http://localhost:8000
```

## 📖 ドキュメント

- [開発進捗レポート](./docs/development-progress-report.md) - 最新の成果・課題・次期計画
- [1stフェーズ要件定義書](./docs/requirements-phase1.md) - 詳細な機能要件・技術要件  
- [プロジェクト指針書](./CLAUDE.md) - 開発ガイドライン・技術詳細
- [設計書類](./docs/) - 技術仕様・UI設計等

## 🤝 コントリビューション

プロジェクトへの貢献を歓迎します！

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 ライセンス

このプロジェクトは MIT License の下で公開されています。

## 📧 お問い合わせ

プロジェクトに関するご質問・ご提案は、Issue または Discussion をご利用ください。

---

**🎯 ビジョン**: 3D迷路の楽しさを世界中の1000万人に届ける

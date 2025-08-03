# MindTravel3D 開発ワークフロー例

## 🎯 実際の開発フロー例

### 1. Issue作成（GitHub）
```
タイトル: 迷路の難易度選択機能を追加
ラベル: enhancement, ui, user-experience

## 概要
プレイヤーが迷路の難易度を選択できる機能を追加したい
- 初級：15×15
- 中級：25×25（現在のデフォルト）
- 上級：40×40
- 専門家：60×60

## ユーザーストーリー
「初心者の友達にゲームを紹介したいが、現在の迷路は難しすぎる」

## 受け入れ基準
- [ ] 難易度選択UI
- [ ] 選択に応じた迷路サイズ変更
- [ ] 設定の保存（localStorage）
- [ ] モバイル対応

@claude この機能の実装方針と、UI設計について助言をお願いします
```

### 2. AI相談（GitHub Issue内）
Claude が以下のような回答を自動投稿：

```
🤖 Claude による技術提案:

## 実装方針
1. **UI設計**: スライダー + プリセットボタンの組み合わせ
2. **データフロー**: UIManager → MazeGenerator → GameEngine
3. **保存方法**: localStorage でユーザー設定永続化

## 推奨実装順序
1. MazeGenerator の拡張（サイズ可変対応）
2. 設定管理クラスの作成
3. UI要素の追加
4. 既存システムとの統合

## パフォーマンス考慮
- 大きな迷路（60×60）でのメモリ使用量監視
- モバイルでの最大サイズ制限
- 適応的品質調整

プロトタイプ作成から始めますか？
```

### 3. 実装（Claude CLI）
```bash
$ claude

> Issue #47の難易度選択機能を実装してください。まずは設定管理から始めましょう。

🤖 Claude: 
難易度選択機能を実装します。

段階的実装プラン：
1. ⚙️  設定管理システム
2. 🎮 MazeGenerator拡張
3. 🎨 UI要素追加
4. 🔗 システム統合

js/settings-manager.js を作成中...

class SettingsManager {
    constructor() {
        this.settings = {
            difficulty: 'medium',
            mazeSize: { width: 25, height: 25 },
            customSettings: {}
        };
        this.loadSettings();
    }
    
    // 設定の読み込み・保存
    loadSettings() { /* localStorage から読み込み */ }
    saveSettings() { /* localStorage に保存 */ }
    
    // 難易度プリセット
    getDifficultyPresets() {
        return {
            easy: { width: 15, height: 15, name: '初級' },
            medium: { width: 25, height: 25, name: '中級' },
            hard: { width: 40, height: 40, name: '上級' },
            expert: { width: 60, height: 60, name: '専門家' }
        };
    }
}

✅ 設定管理システム完成

次に MazeGenerator を拡張しますか？
```

### 4. 段階的開発
```bash
> はい、MazeGeneratorを可変サイズに対応させてください

🤖 Claude:
MazeGenerator を拡張中...

maze-generator.js を更新：
- コンストラクタでサイズ指定可能に
- メモリ使用量の最適化
- 大きな迷路用の効率的アルゴリズム

// 変更例
class MazeGenerator {
    constructor(width = 25, height = 25) {
        this.width = Math.min(width, this.getMaxSize());
        this.height = Math.min(height, this.getMaxSize());
        // ...
    }
    
    getMaxSize() {
        // モバイルでは制限
        return this.isMobile() ? 35 : 60;
    }
}

✅ MazeGenerator 拡張完了

UIを追加しますか？
```

### 5. UI実装とテスト
```bash
> 難易度選択UIを追加して、全体をテストしてください

🤖 Claude:
UI要素を作成中...

index.html と ui-manager.js を更新：
- 難易度選択ダイアログ
- スライダーとプリセットボタン
- リアルタイムプレビュー

実装完了！テスト実行中...

🧪 テスト結果：
✅ 初級（15×15）: 快適
✅ 中級（25×25）: 良好  
✅ 上級（40×40）: 許容範囲
⚠️  専門家（60×60）: モバイルで重い

モバイル最適化を追加しました：
- 自動品質調整
- メモリ使用量監視
- 大きな迷路での警告表示

全ての機能が正常に動作しています！
```

### 6. PR作成とレビュー
```bash
$ git add .
$ git commit -m "feat: 迷路の難易度選択機能を実装

- 4段階の難易度プリセット（初級〜専門家）
- 設定の永続化（localStorage）
- モバイル最適化と品質調整
- リアルタイムプレビュー機能

Closes #47"

$ git push origin feature/difficulty-selection
```

PR作成後、自動的に：
- ✅ コード品質チェック実行
- ✅ JavaScript構文チェック
- ✅ パフォーマンステスト
- 📊 開発状況レポート生成

### 7. 自動デプロイ
PR が main にマージされると：
- 🔄 自動ビルド・デプロイ
- 🚀 GitHub Pages 更新
- 📢 デプロイ完了通知

## 💡 効率化のコツ

### Issue活用
- 具体的なユーザーストーリーを書く
- @claude で技術相談を活発に行う
- ラベルで分類・優先順位管理

### Claude CLI活用  
- 段階的な実装を心がける
- テストを毎段階で実行
- 問題があれば即座に修正依頼

### PR活用
- 自動チェックを信頼する
- 問題があれば @claude でレビュー依頼
- マージ前の最終確認を怠らない

## 🎯 プロジェクト目標との連携
- 各Issue で「1000万ユーザー目標への貢献」を明記
- データ駆動での改善判断
- ユーザーフィードバックの迅速な反映
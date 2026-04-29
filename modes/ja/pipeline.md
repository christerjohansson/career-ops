# モード: pipeline -- URL インボックス（Second Brain）

`data/pipeline.md` に蓄積された求人 URL を処理する。候補者がいつでも URL を追加し、後から `/career pipeline` を実行してまとめて処理する。

## ワークフロー

1. **読み取り** `data/pipeline.md` → 「未処理」セクションの `- [ ]` アイテムを検索
2. **各未処理 URL に対して**：
   a. **JD を抽出** Playwright（browser_navigate + browser_snapshot）→ WebFetch → WebSearch の順で
   b. URL にアクセスできない場合 → `- [!]` にマークし注記、次へ進む
   c. **JD の保存と正規化**: 抽出したコンテンツを `jds/` フォルダに保存（例: `jds/company-role.md`）。すでに `local:` プレフィックスの場合、ファイルの存在を確認。
   d. **「未処理」から「処理済み」へ移動**：`- [x] local:jds/filename.md | 企業名 | 求人タイトル`
3. **複数の URL がある場合**、エージェントを並列起動（Agent tool の `run_in_background`）して速度を最大化。
4. **完了後**、サマリーテーブルを表示：

```
| 企業 | 求人 | ローカルファイル | ステータス |
```

## pipeline.md のフォーマット

```markdown
## 未処理
- [ ] https://jobs.example.com/posting/123
- [ ] https://boards.greenhouse.io/company/jobs/456 | Company Inc | Senior PM
- [!] https://private.url/job — エラー: ログインが必要

## 処理済み
- [x] local:jds/acme-corp-ai-pm.md | Acme Corp | AI PM
- [x] local:jds/bigco-sa.md | BigCo | SA
```

> 注：セクション見出しは EN（「Pending」/「Processed」）、ES（「Pendientes」/「Procesadas」）、DE（「Offen」/「Verarbeitet」）、PT-BR（「Pendentes」/「Processadas」）、または JA（「未処理」/「処理済み」）のいずれでも可。読み取り時は柔軟に、書き込み時は既存ファイルのスタイルを維持。

## URL からの JD インテリジェント検出

1. **Playwright（推奨）：** `browser_navigate` + `browser_snapshot`。すべての SPA で動作。
2. **WebFetch（フォールバック）：** 静的ページ、または Playwright が利用できない場合。
3. **WebSearch（最終手段）：** JD をインデックスしているセカンダリポータルで検索。

**特殊ケース：**
- **LinkedIn**：ログインが必要な場合あり → `[!]` にマークし、候補者にテキストを貼り付けてもらう
- **PDF**：URL が PDF を指す場合、Read tool で直接読む
- **`local:` プレフィックス**：ローカルファイルを読む。例：`local:jds/linkedin-pm-ai.md` → `jds/linkedin-pm-ai.md` を読む
- **Wantedly / Green / Findy**：日本の主要プラットフォーム。Playwright でうまく動作
- **doda / リクナビNEXT / マイナビ転職**：日本の大手求人ポータル。通常 WebFetch でアクセス可能
- **ビズリーチ**：ハイクラス求人。ログインが必要な場合あり
- **LinkedIn JP**：グローバル LinkedIn と同じ制約 — ログインが必要な場合あり


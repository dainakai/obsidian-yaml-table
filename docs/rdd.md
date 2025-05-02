# Obsidian YAML Table プラグイン 要件定義書

## 1. 概要

Obsidianノート内の指定された言語（デフォルト: `yaml-table`）を持つYAMLコードブロックからデータを読み取り、HTMLテーブルとしてリアルタイムにプレビュー表示するプラグイン。ユーザーはYAMLデータを視覚的に理解しやすくなる。

## 2. 機能要件

### 2.1. データソース

-   指定された言語（例: `yaml-table`）を持つYAMLコードブロックのみを対象とする。

### 2.2. テーブル生成

-   指定されたYAMLデータを解析し、HTMLテーブルを生成して表示する。
-   基本的な動作として、YAMLのトップレベルのキーと値を2列（キー列、値列）を持つHTMLテーブル (`<table>`) として表示する。
-   値が単純な文字列や数値の場合は、対応する `<td>` 内にそのまま表示する。
-   値がオブジェクトやリストの場合は、その構造を展開したHTML（リストの場合は `<ul>` や `<ol>`、オブジェクトやオブジェクトのリストの場合はネストした `<table>`）を対応する `<td>` 内に生成する。

### 2.3. 対応するYAML構造

-   **キー・バリューペア:** 最も基本的な形式。
    ```yaml
    title: blog_idea_parking_lot
    ```
    これを以下のようなHTMLテーブルに変換する。
    ```html
    <table>
      <thead>
        <tr><th>Key</th><th>Value</th></tr>
      </thead>
      <tbody>
        <tr><td>title</td><td>blog_idea_parking_lot</td></tr>
      </tbody>
    </table>
    ```

    <table>
      <thead>
        <tr><th>Key</th><th>Value</th></tr>
      </thead>
      <tbody>
        <tr><td>title</td><td>blog_idea_parking_lot</td></tr>
      </tbody>
    </table>
    
-   **リスト:** 各要素が単純な値であれば `<ul>` リストとして、オブジェクトであればネストしたテーブルとして値のセル (`<td>`) 内に表示する。
    ```yaml
    points:
      - point1
      - point2
    ```
    これを以下のように変換する。
    ```html
    <table>
      <thead>
        <tr><th>Key</th><th>Value</th></tr>
      </thead>
      <tbody>
        <tr>
          <td>points</td>
          <td>
            <ul>
              <li>point1</li>
              <li>point2</li>
            </ul>
          </td>
        </tr>
      </tbody>
    </table>
    ```

    <table>
      <thead>
        <tr><th>Key</th><th>Value</th></tr>
      </thead>
      <tbody>
        <tr>
          <td>points</td>
          <td>
            <ul>
              <li>point1</li>
              <li>point2</li>
            </ul>
          </td>
        </tr>
      </tbody>
    </table>

    ```yaml
    schedule:
      - time: 5月中旬
        action: ブログ公開
      - time: 5月下旬
        action: イベント実施
    ```
    これを以下のように変換する。
    ```html
    <table>
      <thead>
        <tr><th>Key</th><th>Value</th></tr>
      </thead>
      <tbody>
        <tr>
          <td>schedule</td>
          <td>
            <table>
              <thead>
                <tr><th>time</th><th>action</th></tr>
              </thead>
              <tbody>
                <tr><td>5月中旬</td><td>ブログ公開</td></tr>
                <tr><td>5月下旬</td><td>イベント実施</td></tr>
              </tbody>
            </table>
          </td>
        </tr>
      </tbody>
    </table>
    ```

    <table>
      <thead>
        <tr><th>Key</th><th>Value</th></tr>
      </thead>
      <tbody>
        <tr>
          <td>schedule</td>
          <td>
            <table>
              <thead>
                <tr><th>time</th><th>action</th></tr>
              </thead>
              <tbody>
                <tr><td>5月中旬</td><td>ブログ公開</td></tr>
                <tr><td>5月下旬</td><td>イベント実施</td></tr>
              </tbody>
            </table>
          </td>
        </tr>
      </tbody>
    </table>

-   **オブジェクト:** ネストしたオブジェクトは、キーと値を持つテーブルとして値のセル (`<td>`) 内に表示する。
    ```yaml
    key: value
    concept:
      basic_plan: CursorのHow + PMの進め方の基本的なレクチャーも今回する
      point1: 仮説検証フローが大事
    ```
    これを以下のように変換する。
    ```html
    <table>
      <thead>
        <tr><th>Key</th><th>Value</th></tr>
      </thead>
      <tbody>
        <tr>
          <td>concept</td>
          <td>
            <table>
              <thead>
                <tr><th>Key</th><th>Value</th></tr>
              </thead>
              <tbody>
                <tr><td>basic_plan</td><td>CursorのHow + PMの進め方の基本的なレクチャーも今回する</td></tr>
                <tr><td>point1</td><td>仮説検証フローが大事</td></tr>
              </tbody>
            </table>
          </td>
        </tr>
      </tbody>
    </table>
    ```

    <table>
      <thead>
        <tr><th>Key</th><th>Value</th></tr>
      </thead>
      <tbody>
        <tr>
          <td>concept</td>
          <td>
            <table>
              <thead>
                <tr><th>Key</th><th>Value</th></tr>
              </thead>
              <tbody>
                <tr><td>basic_plan</td><td>CursorのHow + PMの進め方の基本的なレクチャーも今回する</td></tr>
                <tr><td>point1</td><td>仮説検証フローが大事</td></tr>
              </tbody>
            </table>
          </td>
        </tr>
      </tbody>
    </table>

### 2.4. UI/UX (リアルタイムプレビューと編集)

-   `yaml-table` コードブロックがアクティブでない（編集モードでない）場合、コードブロックの内容はレンダリングされたテーブル表示に置き換わる (Live Preview / Reading View)。
-   レンダリングされたテーブル表示をクリックすると、元のYAMLコードブロックが編集可能な状態（Source Mode / Live Previewの編集状態）に戻る。
-   YAMLコードブロック編集中（またはファイル保存時）にリアルタイムでテーブルプレビューが更新される。
-   このリアルタイムプレビューが主要な利用方法であり、コマンドパレットからの生成は補助的な機能（または不要）とする。

### 2.5. カスタマイズ (オプション)

-   プラグイン設定画面で以下の設定を可能にする。
    -   テーブル生成の対象（コードブロックのみ / フロントマターも含む）。
    -   デフォルトのコードブロック言語名 (`yaml-table`) の変更。
    -   テーブル表示に関するスタイル調整（CSSスニペットでの対応も考慮）。

### 2.6. エラーハンドリング

-   不正なYAML構文の場合、エラーメッセージを表示する。
-   テーブル生成に適さないデータ構造の場合、適切なメッセージを表示する。

## 3. 非機能要件

-   **パフォーマンス**: 大量のデータ（例: 1000行以上）でも妥当な時間内にテーブルを生成できること。
-   **ユーザビリティ**: コマンドや設定が直感的で理解しやすいこと。

## 4. UI/UX (追加詳細)

-   生成されたHTMLテーブルはObsidianの標準テーマと互換性のあるスタイルを持つべきである。

## 5. 将来的な拡張

-   テーブルのソート、フィルタリング機能。
-   CSSによるテーブルスタイリングのカスタマイズ。
-   他のデータソース（CSV, JSON）への対応。
-   ライブプレビューでのリアルタイム更新。

## 6. 疑問点・確認事項

-   HTMLテーブルのスタイリングはどの程度カスタマイズ可能にするか？（CSS変数や設定項目など）
-   ネストしたテーブルのデフォルト表示（罫線、パディング等）はどのようにするか？
-   巨大なYAMLデータを扱った場合のパフォーマンス（特にリアルタイムプレビュー）。

## 7. 再現例

以下の `yaml-table` コードブロックは、提示された画像を再現したものです。

```yaml-table
title: blog_idea_parking_lot
concept:
  basic_plan: CursorのHow + PMの進め方の基本的なレクチャーも今回する
  point1: 仮説検証フローが大事
  point2: AIに発散（仮説出し）と収束（情報整理）のアシストさせる
  point3:
    Quality: ユーザー視点のアウトカムを意識すること
    Cost: ステークホルダーとビジネス条件など合意をとること
    Delivery: アウトプットを制約条件の中できっちり作ること
How:
  表現方法: なるべくシンプルに、中学生でも読めるように
  アウトプット: Githubで、Rulesやフォルダ構成のスターターキットを作成して公開する -> 手を動かしてもらう
  アウトプット2: プロダクトマネジメントのベーシックな進め方ハンドブックも公開する
schedule:
  - time: 5月中旬
    action: ブログ公開
  - time: 5月下旬
    action: イベント実施
action: イベント実施
```

これが以下のHTMLテーブルに変換されます。

```html
<table>
  <thead>
    <tr><th>Key</th><th>Value</th></tr>
  </thead>
  <tbody>
    <tr><td>title</td><td>blog_idea_parking_lot</td></tr>
    <tr>
      <td>concept</td>
      <td>
        <table>
          <thead><tr><th>Key</th><th>Value</th></tr></thead>
          <tbody>
            <tr><td>basic_plan</td><td>CursorのHow + PMの進め方の基本的なレクチャーも今回する</td></tr>
            <tr><td>point1</td><td>仮説検証フローが大事</td></tr>
            <tr><td>point2</td><td>AIに発散（仮説出し）と収束（情報整理）のアシストさせる</td></tr>
            <tr>
              <td>point3</td>
              <td>
                <table>
                  <thead><tr><th>Key</th><th>Value</th></tr></thead>
                  <tbody>
                    <tr><td>Quality</td><td>ユーザー視点のアウトカムを意識すること</td></tr>
                    <tr><td>Cost</td><td>ステークホルダーとビジネス条件など合意をとること</td></tr>
                    <tr><td>Delivery</td><td>アウトプットを制約条件の中できっちり作ること</td></tr>
                  </tbody>
                </table>
              </td>
            </tr>
          </tbody>
        </table>
      </td>
    </tr>
    <tr>
      <td>How</td>
      <td>
        <table>
          <thead><tr><th>Key</th><th>Value</th></tr></thead>
          <tbody>
            <tr><td>表現方法</td><td>なるべくシンプルに、中学生でも読めるように</td></tr>
            <tr><td>アウトプット</td><td>Githubで、Rulesやフォルダ構成のスターターキットを作成して公開する -> 手を動かしてもらう</td></tr>
            <tr><td>アウトプット2</td><td>プロダクトマネジメントのベーシックな進め方ハンドブックも公開する</td></tr>
          </tbody>
        </table>
      </td>
    </tr>
    <tr>
      <td>schedule</td>
      <td>
        <table>
          <thead><tr><th>time</th><th>action</th></tr></thead>
          <tbody>
            <tr><td>5月中旬</td><td>ブログ公開</td></tr>
            <tr><td>5月下旬</td><td>イベント実施</td></tr>
          </tbody>
        </table>
      </td>
    </tr>
    <tr><td>action</td><td>イベント実施</td></tr>
  </tbody>
</table>
```

<table>
  <thead>
    <tr><th>Key</th><th>Value</th></tr>
  </thead>
  <tbody>
    <tr><td>title</td><td>blog_idea_parking_lot</td></tr>
    <tr>
      <td>concept</td>
      <td>
        <table>
          <thead><tr><th>Key</th><th>Value</th></tr></thead>
          <tbody>
            <tr><td>basic_plan</td><td>CursorのHow + PMの進め方の基本的なレクチャーも今回する</td></tr>
            <tr><td>point1</td><td>仮説検証フローが大事</td></tr>
            <tr><td>point2</td><td>AIに発散（仮説出し）と収束（情報整理）のアシストさせる</td></tr>
            <tr>
              <td>point3</td>
              <td>
                <table>
                  <thead><tr><th>Key</th><th>Value</th></tr></thead>
                  <tbody>
                    <tr><td>Quality</td><td>ユーザー視点のアウトカムを意識すること</td></tr>
                    <tr><td>Cost</td><td>ステークホルダーとビジネス条件など合意をとること</td></tr>
                    <tr><td>Delivery</td><td>アウトプットを制約条件の中できっちり作ること</td></tr>
                  </tbody>
                </table>
              </td>
            </tr>
          </tbody>
        </table>
      </td>
    </tr>
    <tr>
      <td>How</td>
      <td>
        <table>
          <thead><tr><th>Key</th><th>Value</th></tr></thead>
          <tbody>
            <tr><td>表現方法</td><td>なるべくシンプルに、中学生でも読めるように</td></tr>
            <tr><td>アウトプット</td><td>Githubで、Rulesやフォルダ構成のスターターキットを作成して公開する -> 手を動かしてもらう</td></tr>
            <tr><td>アウトプット2</td><td>プロダクトマネジメントのベーシックな進め方ハンドブックも公開する</td></tr>
          </tbody>
        </table>
      </td>
    </tr>
    <tr>
      <td>schedule</td>
      <td>
        <table>
          <thead><tr><th>time</th><th>action</th></tr></thead>
          <tbody>
            <tr><td>5月中旬</td><td>ブログ公開</td></tr>
            <tr><td>5月下旬</td><td>イベント実施</td></tr>
          </tbody>
        </table>
      </td>
    </tr>
    <tr><td>action</td><td>イベント実施</td></tr>
  </tbody>
</table> 
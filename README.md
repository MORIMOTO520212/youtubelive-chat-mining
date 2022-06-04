# YouTube Live Chat Mining
## YouTubeライブのチャットを解析

### 特長
・単語をいつまで記憶しておくかを考慮する  
・古い単語は表示しない  
・ワードクラウドの散らばり具合を調整する  
・関連する単語同士を線を引いて表す  

### TODO
・言語フィルター

## get_chat.js
### continuationキーを取得する
```bash
GET "http://localhost:3000/continuation?id=<video Id>"
```

### チャット情報を取得する
```bash
GET "http://localhost:3000/chat?id=<video Id>&continuation=<continuation key>"
```

## 変数情報
**node_words**  
node_wordsには取得した単語が500個格納されている。
その中から、ノードの表示は時間順に指定数表示される。
```js
var node_words = [
    {
        word: "word",
        count: 10,
        time: 16429033,
    },
    { ... },
    { ... },
];
```

## 除外文字
意味の持たない文字はワードクラウドに表示しない。
```js
var exception_words = [
    '？', '?', '～', '・', '！', '!', 
    '「', '」', '（', '）', '(', ')',
    '[', ']', '/', '、', '【', '】']
```

## 単語の関係を検出する
node_wordsの単語から2つの組み合わせを作り、chatItems[..]['text']にどれくらい含まれるのかを調べる。  
含まれた数が10個以上となる場合、ノード間にエッジを付ける。


### live_chat ライブ終了後のレスポンス内容
```js
{
    responseContext: {
        mainAppWebResponseContext: {loggedOut: true}
    },
    serviceTrackingParams: Array(4),
    visitorData: "CgtVMGF1Mmd6TnQ4MCjHkqmUBg%3D%3D",
    webResponseContextExtensionData: {
        hasDecorated: true
    }
}
```
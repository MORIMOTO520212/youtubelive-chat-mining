# YouTube Live Chat Mining
## YouTubeライブのチャットを解析

### TODO
・言語指定

## get_chat.js
### continuationキーを取得する
```bash
curl "http://localhost:3000/continuation?id=<video Id>"
```

### チャット情報を取得する
```bash
curl "http://localhost:3000/chat?id=<video Id>&continuation=<continuation key>"
```

### 変数情報
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

### 除外ワード
['？', '?', '～', '・', '！', '!', '「', '」', '（', '）', '(', ')']
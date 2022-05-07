# YouTube Live Chat Mining
## YouTubeライブのチャットを解析

## get_chat.js
### continuationキーを取得する
```bash
curl "http://localhost:3000/continuation?id=<video Id>"
```

### チャット情報を取得する
```bash
curl "http://localhost:3000/chat?id=<video Id>&continuation=<continuation key>"
```

### 除外ワード
['？', '?', '～', '・', '！']
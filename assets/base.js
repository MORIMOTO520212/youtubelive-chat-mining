/* * * * * * * * * * * * * * * * *
    ~ YouTube Live Chat Mining ~
           Yuma.Morimoto
 * * * *  * * * *  * * * *  * * * */

var xhr = new XMLHttpRequest();
/* APIサーバーポート */
var server_port = 3000;
var live_chat;

function get_continuation(videoId){
    return new Promise((resolve, reject) => {
        xhr.open('GET', `http://localhost:${server_port}/continuation?id=${videoId}`);
        xhr.send();
        xhr.onreadystatechange = () => {
            if(xhr.readyState == 4 && xhr.status == 200){
                let continuation_key = xhr.responseText;
                resolve(continuation_key);
            }
        }
    });
}

function get_chat(videoId, continuation_key){
    return new Promise((resolve, reject) => {
        xhr.open('GET', `http://localhost:${server_port}/chat?id=${videoId}&continuation=${continuation_key}`);
        xhr.send();
        xhr.onreadystatechange = () => {
            if(xhr.readyState == 4 && xhr.status == 200){
                var live_chat = JSON.parse(xhr.responseText);
                resolve(live_chat);
            }
        }
    });
}

/* ワードのフォントカラー生成 */
var colorList = [
    "#2ca02c", "#ffbb78", "#9263bb",
    "#97de89", "#dbdb8d", "#baba12",
    "#06b9cd", "#d41820", "#14bdcd",
    "#f6b3d0", "#1f77b4", "#767472"
];
function generate_color(){
    return colorList[Math.floor(Math.random() * colorList.length)]
}





/* kuromoji.js 初期化 */
var builder = kuromoji.builder({ dicPath: "dict" });
var tokenizer;
builder.build((err, _tokenizer) => {
    if(err) {
        reject(err);
    }else{
        tokenizer = _tokenizer;
        console.log("load tokenizer.");
    }
});

/*
    kuromoji.js 形態素解析
*/
async function tokenize(text){
    return new Promise((resolve, reject) => {
        // テキストが空白の場合
        if(!text){resolve([])}
        // 1文字の場合
        if(1 == text.length){
            resolve([text]);    
        // 形態素解析
        }else{
            let tokens = tokenizer.tokenize(text);
            resolve(tokens.map(obj=>obj.surface_form));
        }
    });
}

/*
    形態素解析
    morphological(['text1', 'text2'...])
    引数：テキストをまとめた1次元配列
    戻り値：単語をまとめた1次元配列
*/
// 除外文字
var exception_words = [
    '？', '?', '～', '・', '！', '!', 
    '「', '」', '（', '）', '(', ')',
    '[', ']', '/', '、', '【', '】']

function morphological(textlst) {
    return new Promise(async (resolve) => {
        let wordslst = await Promise.all(textlst.map(async text => await tokenize(text)));
        let words = [];
        for(let i=0; i < wordslst.length; i++){
            for(let j=0; j < wordslst[i].length; j++){
                // 1文字の「あ～ん」でなければ
                // !(wordslst[i][j].length==1 && wordslst[i][j].match(/[ぁ-んー]/g)))
                if(1<wordslst[i][j].length){
                    // 除外単語が含まれていなければ
                    if(-1 == exception_words.indexOf(wordslst[i][j])){
                        words.push(wordslst[i][j]);
                    }
                }
            }
        }
        resolve(words);
    });
}





var id_queue = [];
var id_queue_limit = 100;

/*
    node_wordsには取得した単語が500個格納されている。
    その中から、ノードの表示は時間順に指定数表示される。
    var node_words = [
        {
            word: "word",
            count: 10,
            time: 16429033,
        },
        { ... },
        { ... },
    ];
*/
var node_words = [];

/*
    時間順に並び替えし50個の配列にする
    単語の時間は取得するごとに自動的に更新される
*/
function sort_words(sortType) {
    if("time" == sortType){
        node_words.sort((a, b) => {
            if(a.time < b.time) return 1;
            if(a.time > b.time) return -1;
            return 0;
        });
        
    }else if("count" == sortType){
        node_words.sort((a, b) => {
            if(a.count < b.count) return 1;
            if(a.count > b.count) return -1;
            return 0;
        });
    }
    // node_words_limitの範囲で切り落とし返す
    return node_words.slice(0, node_words_limit);
}

/*
    単語の関連性からノードにエッジ線を引く
    word_relevance(['text1', 'text2'...])
    引数：textlist [text1, text2...]

*/
var relevance_words = []; // [{word: ['単語1', '単語2'], count: 1}...]
function choose(text, type){
    if(type=="front"){
        if(text.length){
            return text[text.length-1];
        }
    }
    if(type=="back"){
        if(text.length){
            return text[0];
        }
    }
    return false;
}
function word_relevance(textlist){
    // 前後の単語を見つける
    let labels = nodes.map(obj=>obj.label);
    labels.forEach(label=>{
        textlist.forEach(text=>{
            let splitText = text.split(label);
            if(1 < splitText.length){ // 単語が見つかれば
                (async() =>{
                    let frontWord = choose(await morphological([splitText[0]]), "front"); // 前の単語を取得
                    let backWord = choose(await morphological([splitText[1]]), "back");   // 後ろの単語を取得
                    if(frontWord){
                        // [front word] + [position word]のインデックス番号を返す
                        let index = relevance_words.map(obj=>obj.word.join('')).indexOf(frontWord+label);
                        if(0 <= index){
                            relevance_words[index].count += 1; // カウント
                        }else{
                            relevance_words.push({word: [frontWord,label], count: 1}); // 新規追加
                        }
                    }
                    if(backWord){
                        //[position word] + [back word]のインデックス番号を返す
                        let index = relevance_words.map(obj=>obj.word.join('')).indexOf(label+backWord);
                        if(0 <= index){
                            relevance_words[index].count += 1;
                        }else{
                            relevance_words.push({word: [label,backWord], count: 1});
                        }
                    }
                })();
            }
        });
    });
    // エッジ線を引く
    let nodelst = nodes.map(obj=>[obj.id, obj.label]);    // 確保している単語リスト
    relevance_words.forEach(rlv => {
        // ２つの関係単語を１つずつ取り出してnodesに含まれているかを調べる
        let tf = rlv.word.map(obj => nodelst.map(n=>n[1]).indexOf(obj));
        // 関係単語がどちらもtrueだった場合
        if(tf.every(indexOf=> 0 <= indexOf)){
            console.log(nodelst[tf[0]], nodelst[tf[1]]);
        }
    });
            //nodes.update([{}]); // ノード更新


}


/*
    var chatItems = {
        text: (String) ChatbText,
        timeStamp: (Int),
        id: (String) ChatbID
    }
*/
async function main(videoId, continuation_key) {
    /* ライブチャット レスポンスデータ */
    live_chat = await get_chat(videoId, continuation_key);

    /* エラーチェック */
    if(live_chat['error']){
        alert(live_chat);
        console.log(live_chat)
        return 0;
    }
    else if(live_chat['errno'] == "ETIMEDOUT"){
        alert("ETIMEDOUT");
        // continuationキーを取得してリトライ
        var continuation_key = await get_continuation(videoId);
        console.log("continuation key: "+continuation_key);
        setTimeout(()=>main(videoId, continuation_key), 5000);
    }
    else if(! live_chat['continuationContents']['liveChatContinuation']){
        alert("Live Chat Continuation not found.");
        console.log("['liveChatContinuation'] not found.")
        return 0;
    }
    else if(! live_chat['continuationContents']['liveChatContinuation']['actions']){
        console.log("['actions'] not found.");
        // continuationキーを取得してリトライ
        var continuation_key = await get_continuation(videoId);
        console.log("continuation key: "+continuation_key);
        setTimeout(()=>main(videoId, continuation_key), 5000);
        return 0;
    }

    // text_limit テキスト処理数を制限
    var chatItems = live_chat['continuationContents']['liveChatContinuation']['actions'].slice(0, text_limit);
    /* timedContinuationDataとinvalidationContinuationData 2つのタイプがある */
    var continuation = live_chat['continuationContents']['liveChatContinuation']['continuations'][0];
    if(continuation['invalidationContinuationData']){
        var continuation_key = continuation['invalidationContinuationData']['continuation'];
        var timeoutMs = Number(continuation['invalidationContinuationData']['timeoutMs']);
    }else{
        var continuation_key = continuation['timedContinuationData']['continuation'];
        var timeoutMs = Number(continuation['timedContinuationData']['timeoutMs']);
    }

    console.log("timeout: " + timeoutMs);
    if(chatItems){
        // チャット一覧を配列化, キューにプッシュ
        chatItems = chatItems.map(obj=>{
            try{
                let text = obj['addChatItemAction']['item']['liveChatTextMessageRenderer']['message']['runs'][0]['text'];
                let timeStamp = Number(obj['addChatItemAction']['item']['liveChatTextMessageRenderer']['timestampUsec']) / 1000000;
                let id = obj['addChatItemAction']['item']['liveChatTextMessageRenderer']['id'];
                if( !(id in id_queue) ){ // id_queueに含まれていないか
                    if(text){ // textが存在するか
                        id_queue.push(id);
                        return {text: text, timeStamp: timeStamp, id: id};
                    }
                }
            }catch{}
            return false;
        });
    }
    // chatItemsのfalseを消す
    chatItems = chatItems.filter(x=>{return x != false});
    if(chatItems){
        console.log(chatItems);
        /* morphological([チャットテキスト...]) */
        morphological(chatItems.map(obj=>obj['text']))
            .then(wordslst => {
                wordslst.forEach(word => {
                    // ノードを更新する
                    let index = node_words.map(obj=>obj.word).indexOf(word);
                    if(0 <= index){
                        node_words[index].count = node_words[index].count + 1;
                        node_words[index].time = Date.now();
                    }else{
                        // 新しいノードを追加する
                        node_words.push({
                            word: word, 
                            count: 1, 
                            color: generate_color(), 
                            time: Date.now()
                        });
                    }
                });
            });
        node_words = sort_words('time'); // 時間でソート
        node_words = sort_words('count'); // カウント数でソート
        word_relevance(chatItems.map(obj=>obj['text'])) // 単語の関連性からエッジ線を引く
        draw(); // ワードクラウド生成
    }

    /* チャットのキューを100に制限する */
    if(100 < id_queue.length){
        id_queue = id_queue.slice(id_queue.length-100, id_queue.length);
    }

    setTimeout(()=>main(videoId, continuation_key), timeoutMs);
}

/* メイン処理 */
(async()=>{
    var continuation_key = await get_continuation(videoId);
    console.log("continuation key: "+continuation_key);
    main(videoId, continuation_key);
})();


// create a network
var container = document.getElementById('mynetwork');
/*
    create an array with nodes
    
    var nodes = new vis.DataSet([
        {
            id: <random int>,
            label: <text string>,
            font: {
                size: 50 * <min-max>,
            }
        },
        { ... },
        { ... },
    ]);
*/
var nodes = new vis.DataSet();

var data = {
    nodes: nodes
};
var options = {
    autoResize: true,
    width: "100%",
    height: "100%",
    nodes: {
        color: {
            background: "#ffffff00",
            border: "#ffffff00",
            highlight: {
                background: "#ffffff00",
                border: "#ffffff00"
            },
        },
    },
    edges: {},
    physics: {
        barnesHut: {
            centralGravity: 0.8,
            springLength: 170,
            springConstant: 0.08
        },
        maxVelocity: 81,
        minVelocity: 0.18
    }
};

var network = new vis.Network(container, data, options);

function update_node(word, fontSize, fontColor){
    let li_nodes = nodes.map(obj=> [obj.id, obj.label]);
    /* 既存のノードラベルにwordが含まれている場合 */
    if(0 <= li_nodes.map(obj=>obj[1]).indexOf(word)) {
        li_nodes.forEach(li_node => {
            if(word == li_node[1]){
                nodes.update([{
                    id: li_node[0],
                    font: { 
                        size: fontSize, /* min-maxを当てる */
                        color: fontColor, 
                        strokeColor: fontColor,
                        strokeWidth: 1
                    }, 
                }]);
            }
        });
    /* 含まれていない場合は新しく追加 */
    }else{
        let randInt = Math.floor(Math.random()*9999);
        nodes.update([{
            id: randInt,
            label: word,
            font: {size: fontSize}, /* min-maxを当てる */
        }]);
    }
}

function draw(){
    /* 単語カウントmax値 */
    let max = Math.max(...node_words.slice(0,node_limit).map(obj=>obj.count));
    let i = 0;
    let delay = 120; // ms

    /* ノード追加 */
    node_words.slice(0,node_limit).forEach(obj=>{
        /* フォントサイズを決定 */
        // 最大フォントサイズ 40px
        let fontSize = 100 * (obj.count / max);
        // 最小フォントサイズ 16px
        if(16 > fontSize) fontSize = 20;
        // ノード更新
        // 遅延させ順番に表示
        setTimeout(()=>{update_node(obj.word, fontSize, obj.color)}, delay * i);
        i += 1;
    });

    /* ノード削除 */
    i = 0;
    let lst = node_words.slice(0,node_limit).map(obj=>obj.word);
    nodes.forEach(obj=>{
        if(0 > lst.indexOf(obj.label)){ // lstにnodes.labelが無ければ
            setTimeout(()=>{nodes.remove(obj.id)}, delay * i);
            i += 1;
        }
    });
}
/* * * * * * * * * * * * * * * * *
    ~ YouTube Live Chat Mining ~
           Yuma.Morimoto
 * * * *  * * * *  * * * *  * * * */

var xhr = new XMLHttpRequest();
/* API SERVER PORT */
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

function morphological(textlst){
    return new Promise((resolve, reject) => {
        xhr.open('POST', `http://localhost:${server_port}/morphological`);
        xhr.setRequestHeader("Content-Type", "application/json");
        let data = JSON.stringify(textlst);
        xhr.send(data);
        xhr.onreadystatechange = () => {
            if(xhr.readyState == 4 && xhr.status == 200){
                var morphological = JSON.parse(xhr.responseText);
                console.log(morphological);
                resolve(morphological);
            }
        }
    });
}

var id_queue = [];
var id_queue_limit = 100;

/*
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

/* 頻出度順に並び替えし50個の配列にする */
function update_words(){
    node_words.sort((a, b) => {
        if(a.time < b.time) return 1;
        if(a.time > b.time) return -1;
        return 0;
    });
    return node_words.slice(0, node_limit);
}

async function main(videoId, continuation_key){
    /* ライブチャット レスポンスデータ */
    live_chat = await get_chat(videoId, continuation_key);

    /* 負荷軽減のため、1回の処理は10件まで */
    /* actionsがあるかどうか */
    if(live_chat['continuationContents']['liveChatContinuation']['actions']){
        // テキスト処理数を制限
        var chatItems = live_chat['continuationContents']['liveChatContinuation']['actions'].slice(0,text_limit);
    }else{
        var chatItems = false;
    }

    /* timedContinuationDataとinvalidationContinuationData 2つのタイプがある */
    var continuation = live_chat['continuationContents']['liveChatContinuation']['continuations'][0];
    if(continuation['invalidationContinuationData']){
        var continuation_key = continuation['invalidationContinuationData']['continuation'];
        var timeoutMs = Number(continuation['invalidationContinuationData']['timeoutMs']);
    }else{
        var continuation_key = continuation['timedContinuationData']['continuation'];
        var timeoutMs = Number(continuation['timedContinuationData']['timeoutMs']);
    }

    console.log("timeout: "+timeoutMs);
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
    if(chatItems){
        console.log(chatItems);
        morphological(chatItems.map(obj=>obj['text']))
            .then(wordslst => {
                wordslst.forEach(word => {
                    // node_wordsにwordが含まれていた場合
                    let index = node_words.map(obj=>obj.word).indexOf(word);
                    if(0 <= index){
                        node_words[index].count = node_words[index].count + 1;
                        node_words[index].time = Date.now();
                    }else{
                        node_words.push({
                            word: word, 
                            count: 1,
                            time: Date.now()
                        });
                    }
                });
            });
        node_words = update_words();
        draw();
    }

    /* チャットのキューを100に制限する */
    if(100 < id_queue.length){
        id_queue = id_queue.slice(id_queue.length-100, id_queue.length);
    }

    setTimeout(()=>main(videoId, continuation_key), timeoutMs);
}


(async()=>{
    var continuation_key = await get_continuation(videoId);
    console.log("continuation key: "+continuation_key);
    main(videoId, continuation_key);
})();


function draw(){
    /* 単語カウントmax値 */
    let max = Math.max(...node_words.map(obj=>obj.count));
    /* ノード追加 */
    node_words.forEach(obj=>{
        /* フォントサイズを決定 */
        // 最大フォントサイズ 40px
        let fontSize = 40 * (obj.count / max);
        // 最小フォントサイズ 16px
        if(16 > fontSize) fontSize = 16;
        // ノード更新
        update_node(obj.word, fontSize);
    });
    /* ノード削除 */
    let lst = node_words.map(obj=>obj.word);
    nodes.forEach(obj=>{
        if(0 > lst.indexOf(obj.label)){
            nodes.remove(obj.id);
        }
    });
}
//setInterval(draw, 10000);
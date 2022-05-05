/* * * * * * * * * * * * * * * * *
    ~ YouTube Live Chat Mining ~
           Yuma.Morimoto
 * * * *  * * * *  * * * *  * * * */

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
            }
        },
    },
    edges: {
        color: "lightgray",
    },
    physics: {}
};

var network = new vis.Network(container, data, options);


function update_node(word){
    let li_nodes = nodes.map(obj=> [obj.id, obj.label]);
    /* 既存のノードラベルにwordが含まれている場合 */
    if(0 <= li_nodes.map(obj=>obj[1]).indexOf(word)) {
        li_nodes.forEach(li_node => {
            if(word == li_node[1]){
                nodes.update([{
                    id: li_node[0],
                    font: {size: 16}, /* min-maxを当てる */
                }]);
            }
        });
    /* 含まれていない場合は新しく追加 */
    }else{
        let randInt = Math.floor(Math.random()*9999);
        nodes.update([{
            id: randInt,
            label: word,
            font: {size: 16}, /* min-maxを当てる */
        }]);
    }
}

/* 
    ノード削除
    引数: ノード数の閾値
*/
function nodeRemove(stack) {
    while(stack < nodes.length){
        // 最初の要素を削除
        let removeId = nodes.map(obj=>obj)[0].id;
        nodes.remove(removeId);
    }
}

/*
    var analyzed = [
        {text: text, array: [word1, word2,...]},
        { ... },
        { ... },
    ];
*/
var analyzed = [];

function morphological(text) {
    return new Promise((resolve, reject) => {
        // 1文字の場合
        if(1 == text.length){
            resolve([text]);
        // 20文字以上の場合
        }else if(20 < text.length){
            resolve([]);
        // 解析済みワードがある場合
        }else if(0 <= analyzed.map(obj=>obj.text).indexOf(text)){
            resolve( analyzed[ analyzed.map(obj=>obj.text).indexOf(text) ].array );
        // 形態素解析
        }else{
            kuromoji.builder({ dicPath: "/youtubelive-chat-mining/dict" })
            .build((err, tokenizer) => {
                if(err) {
                    console.log(err);
                }else{
                    /*
                        let li_nodes = [
                            [id, label, count],
                            [id, label, count]...
                        ]
                    */
                    let tokens = tokenizer.tokenize(text);
                    /* analyzed 記録 */
                    if(-1 == analyzed.map(obj=>obj.text).indexOf(text)){
                        analyzed.push({
                            text: text,
                            array: tokens.map(obj=>obj.surface_form),
                        });
                    }
                    /* analyzed 削除 */
                    if(500 < analyzed.length){
                        analyzed = analyzed.slice(analyzed.length-500, analyzed.length);
                    }
                    resolve(tokens.map(obj=>obj.surface_form));
                }
            });
        }
    });
}

//update_node(word);
//nodeRemove(10);
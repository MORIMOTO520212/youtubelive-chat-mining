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
    edges: {},
    physics: {
        barnesHut: {
            centralGravity: 0.6,
            springLength: 170,
            springConstant: 0.08
        },
        maxVelocity: 81,
        minVelocity: 0.18
    }
};

var network = new vis.Network(container, data, options);


function update_node(word, fontSize){
    let li_nodes = nodes.map(obj=> [obj.id, obj.label]);
    /* 既存のノードラベルにwordが含まれている場合 */
    if(0 <= li_nodes.map(obj=>obj[1]).indexOf(word)) {
        li_nodes.forEach(li_node => {
            if(word == li_node[1]){
                nodes.update([{
                    id: li_node[0],
                    font: {size: fontSize}, /* min-maxを当てる */
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
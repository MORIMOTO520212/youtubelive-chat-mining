// レンジバーの数値を表示する
var range_node = document.getElementById('range_node');
var range_word = document.getElementById('range_word');
var range_node_value = document.getElementById('range_node_value');
var range_word_value = document.getElementById('range_word_value');

var rangeValue = (elem, target) => {
  return () => {
    target.innerHTML = elem.value;
  }
}
range_node.addEventListener('input', rangeValue(range_node, range_node_value));
range_word.addEventListener('input', rangeValue(range_word, range_word_value));

/* プログラムを実行する */
var videoId;
var run_button = document.getElementById('run_button'); // 「実行する」ボタン
var input_ytlink = document.getElementById('ytlink');   // URL入力ボックス
var div_top = document.getElementById('div_top');
// ボタンを押したら実行
run_button.addEventListener('click', () => {
    console.log("run program");
    videoId = input_ytlink.value;
    videoId = videoId.replace("https://www.youtube.com/watch?v=", "");
    (async()=>{
        var continuation_key = await get_continuation(videoId);
        console.log("continuation key: "+continuation_key);
        main(videoId, continuation_key);
    })();
    div_top.style.top = "-100%";
});
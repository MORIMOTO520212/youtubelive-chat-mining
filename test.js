import kuromoji from 'kuromoji';

/*
    var analyzed = [
        {text: text, array: [word1, word2,...]},
        { ... },
        { ... },
    ];
*/
var analyzed = [];
var builder = kuromoji.builder({ dicPath: "node_modules/kuromoji/dict" });

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
            builder.build((err, tokenizer) => {
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

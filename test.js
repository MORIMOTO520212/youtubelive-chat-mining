import fetch from 'node-fetch';

async function test(){
    var a = await fetch("http://example.com/");
    await a.text().then((text) => {
        console.log("res1");
    });
    var b = await fetch("http://example.com/");
    await b.text().then((text) => {
        console.log("res2");
    });
};

test();
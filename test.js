
var edges = [
    { from: 1, to: 2 },
    { from: 3, to: 4 }
];

var res = edges.filter(obj => {
    console.log(`${obj.from} == ${1} && ${obj.to} == ${2}`);
    return (obj.from ==1) && (obj.to == 2);
});

if(res == false){
    console.log("t");
}
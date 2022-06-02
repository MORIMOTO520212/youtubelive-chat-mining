
var edges = [
    { from: 1, to: 2 },
    { from: 3, to: 4 }
];

var res = edges.filter(obj => {
    return (obj.from ==21) && (obj.to == 2);
});

console.log(res);
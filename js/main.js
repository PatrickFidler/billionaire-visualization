
let educationVis;


let promise = [
    d3.csv("data/cleaned_forbes_billionaires.csv", row => {
        // Age, Children, Rank, Self_made
        row.NetWorth = +row.NetWorth;
        row.Age = +row.Age;
        row.Children = +row.Children;
        row.Rank = +row.Rank;
        row.Self_made = +row.Self_made;
        return row;
    })
]

Promise.all(promise)
    .then(function (data) {
        initMain(data)
    })
    .catch(function (err) {
        console.log(err)
    });

function initMain(data) {
    console.log(data);

    educationVis = new barChart("education", data);
}

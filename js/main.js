
/**
 * billionaireSelected
 *
 *
 *  (`Name: ${d.Name}`);
 *  (`Net Worth: $${d.NetWorth}B`);
 *  (`Country: ${d.Country}`);
 *  (`Industry: ${d.Source}`);
 *  (`Rank: ${d.Rank}`);
 *  (`Age: ${d.Age}`);
 *  (`Residence: ${d.Residence}`);
 *  (`Citizenship: ${d.Citizenship}`);
 *  (`Marital Status: ${d.Status}`);
 *  (`Children: ${d.Children}`);
 *  (`Self-Made: ${d.Self_made}`);
 *  (`Education: ${d.degree}`);
 *  `Coordinates: Latitude ${d.lat}, Longitude ${d.lon}`);
 */

// dispatch the billionaire selected
const eventDispatcher = d3.dispatch("billionaireSelected");
window.allowed_scroll = 0;
eventDispatcher.on("billionaireSelected", function(billionaire) {
    console.log("Billionaire selected:", billionaire);
});


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
    console.log(data[0]);

    educationVis = new barChart("education", data[0]);
    industryVis = new bubbleChart2("industry", data[0]);
    infoVis = new textChart("info", data[0]);

    const wealthApp = new window.WealthComparison('#wealth');
    wealthApp.init();
}

// helper for scroll button
function scrollDown() {
    console.log(allowed_scroll);
    if (window.allowed_scroll === 0 || window.allowed_scroll === 2) {
        window.scrollBy({
            top: window.innerHeight, 
            behavior: 'smooth' 
        });
        if (window.allowed_scroll === 0) {
            window.allowed_scroll = 1;
        }
    }
}

let educationVis, industryVis, infoVis;

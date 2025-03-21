
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

// start at the top of the page every time
window.onload = function () {
    window.scrollTo(0, 0);
};

// for determining scrolling permissions
window.stage = 0;
window.bil_selected = 0;

// prevent positioning from breaking if window is resized
window.addEventListener('resize', function() {
    // scroll to the correct stage position
    window.scrollTo(0, window.stage * window.innerHeight);
});

// dispatch the billionaire selected
const eventDispatcher = d3.dispatch("billionaireSelected");
eventDispatcher.on("billionaireSelected", function(billionaire) {
    console.log("Billionaire selected:", billionaire.name);
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

// helpers for scroll buttons
function scrollDown() {
    if ((window.stage != 1 || window.bil_selected === 1) && window.stage != 5) {
        window.scrollBy({
            top: window.innerHeight, 
            behavior: 'smooth' 
        });
        window.stage = window.stage + 1;
        if ((window.stage === 1 && window.bil_selected === 0) || window.stage === 5) {
            let button = document.getElementById('down-button');
            button.style.setProperty('background-color', 'rgb(128, 128, 128, 0)');
            button.style.setProperty('border', 'none');
            button.style.setProperty('font-size', '0');
        }
        if (window.stage === 1) {
            let button = document.getElementById('up-button');
            button.style.setProperty('background-color', 'rgb(128, 128, 128, 1)');
            button.style.setProperty('border', 'solid');
            button.style.setProperty('font-size', '16px');
        }
    }
}
function scrollUp() {
    if (window.stage != 0) {
        window.scrollBy({
            top: -window.innerHeight, 
            behavior: 'smooth' 
        });
        window.stage = window.stage - 1;
        if (window.stage === 0) {
            let button = document.getElementById('up-button');
            button.style.setProperty('background-color', 'rgb(128, 128, 128, 0)');
            button.style.setProperty('border', 'none');
            button.style.setProperty('font-size', '0');
            button = document.getElementById('down-button');
            button.style.setProperty('background-color', 'rgb(128, 128, 128, 1)');
            button.style.setProperty('border', 'solid');
            button.style.setProperty('font-size', '16px');
        }
        if (window.stage === 4) {
            let button = document.getElementById('down-button');
            button.style.setProperty('background-color', 'rgb(128, 128, 128, 1)');
            button.style.setProperty('border', 'solid');
            button.style.setProperty('font-size', '16px');
        }
    }
}

let educationVis, industryVis, infoVis;

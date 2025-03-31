
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

// complete the "fade in" from the intro page's fade out
const overlay = document.getElementById('overlay');
overlay.style.backgroundColor = "rgba(0, 0, 0, 0)";

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
    if ((window.stage != 0 || window.bil_selected === 1) && window.stage != 4) {
        window.scrollBy({
            top: window.innerHeight, 
            behavior: 'instant' 
        });
        window.stage = window.stage + 1;
        if ((window.stage === 0 && window.bil_selected === 0) || window.stage === 4) {
            let button = document.getElementById('down-button');
            button.style.setProperty('background-color', 'rgba(124, 104, 238, 0)');
            button.style.setProperty('font-size', '0');
        }
        if (window.stage === 1) {
            let button = document.getElementById('up-button');
            button.style.setProperty('background-color', 'rgba(124, 104, 238, 1)');
            button.style.setProperty('font-size', '16px');
        }
    }
}
function scrollUp() {
    if (window.stage != 0) {
        window.scrollBy({
            top: -window.innerHeight, 
            behavior: 'instant' 
        });
        window.stage = window.stage - 1;
        if (window.stage === 0) {
            let button = document.getElementById('up-button');
            button.style.setProperty('background-color', 'rgba(124, 104, 238, 0)');
            button.style.setProperty('font-size', '0');
            button = document.getElementById('down-button');
            button.style.setProperty('background-color', 'rgba(124, 104, 238, 1)');
            button.style.setProperty('font-size', '16px');
        }
        if (window.stage === 3) {
            let button = document.getElementById('down-button');
            button.style.setProperty('background-color', 'rgba(124, 104, 238, 1)');
            button.style.setProperty('font-size', '16px');
        }
    }
}
function restart() {
    window.scroll({
        top: 0,
        behavior: 'instant'
    });
    window.stage = 0;
    window.bil_selected = 0;
    let button = document.getElementById('down-button');
    button.style.setProperty('background-color', 'rgba(124, 104, 238, 0)');
    button.style.setProperty('font-size', '0');
    button = document.getElementById('up-button');
    button.style.setProperty('background-color', 'rgba(124, 104, 238, 0)');
    button.style.setProperty('font-size', '0');


    if (window.map) {
        window.map.setView([20, 0], 2);
        window.map.closePopup();
    }


    if (window.clippy) {
        window.clippy.showRelativeToElement(randomBtn, { offsetX: -10, offsetY: -600 });
        window.clippy.setImage('css/images/clippy.gif');
        window.clippy.setText("Hey there! Ready to explore? Click an icon on the map to pick a billionaire, you might need to zoom in a bit because there are so many of them! You can also filter them by net worth, search for your favorite, or hit the random button and I'll pick one for you!");
        window.clippy.show();
    }
}

let educationVis, industryVis, infoVis;

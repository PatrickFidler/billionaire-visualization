
class textChart {

    constructor(parentElement, data) {
        this.parentElement = parentElement;
        this.data = data;
        this.displayData = data;

        window.addEventListener("resize", () => this.resize());

        this.initVis();
    }


    initVis() {
        let vis = this;

        // svg margins
        vis.margin = {top: 40, right: 20, bottom: 20, left: 40};
        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height - vis.margin.top - vis.margin.bottom;

        // init svg
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append('g')
            .attr('transform', `translate (${vis.margin.left}, ${vis.margin.top})`);

        vis.bilimage = vis.svg.append('image')
            .attr('x', vis.width / 2 - 70 - 250)
            .attr('y', vis.height / 4 + 20)
            .attr('width', 250)
            .attr('height', 250)

        vis.svg.append('text')
            .attr('id', 'info-title')
            .attr('font-size', 30)
            .attr('x', vis.width / 2)
            .attr('y', vis.height / 4)
            .attr('text-anchor', 'middle')
            .text("Your Billionaire");
        
        vis.text_x = vis.width / 2 + 70;
        vis.text_y = vis.height / 4 + 30;
        
        vis.svg.append('text')
            .attr('id', 'info-name')
            .attr('text-decoration', "underline")
            .attr('x', vis.text_x)
            .attr('y', vis.text_y)
            .text("Empty");
        
        let name_width = document.getElementById('info-name').getBoundingClientRect().width;
        vis.svg.append('text')
            .attr('id', 'info-rank')
            .attr('x', vis.text_x)
            .attr('y', vis.text_y)
            .attr('dx', name_width + 10)
            .attr('dy', 0)
            .text("Empty")
            .attr("stroke", "black")
            .attr("stroke-width", "1px");
        
        vis.svg.append('text')
            .attr('id', 'info-age')
            .attr('x', vis.text_x)
            .attr('y', vis.text_y)
            .attr('dy', 30)
            .text("Empty");

        vis.svg.append('text')
            .attr('id', 'info-networth')
            .attr('x', vis.text_x)
            .attr('y', vis.text_y)
            .attr('dy', 60)
            .text("Empty");

        vis.svg.append('text')
            .attr('id', 'info-country')
            .attr('x', vis.text_x)
            .attr('y', vis.text_y)
            .attr('dy', 90)
            .text("Empty");

        vis.svg.append('text')
            .attr('id', 'info-marital')
            .attr('x', vis.text_x)
            .attr('y', vis.text_y)
            .attr('dy', 120)
            .text("Empty");

        vis.svg.append('text')
            .attr('id', 'info-children')
            .attr('x', vis.text_x)
            .attr('y', vis.text_y)
            .attr('dy', 150)
            .text("Empty");
            
        this.wrangleData();

    }

    wrangleData() {
        let vis = this;

        this.updateVis();
    }

    // redraw the chart with new dimensions if screen is resized
    resize() {
        let vis = this;

        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height - vis.margin.top - vis.margin.bottom;
    
        vis.svg.attr("width", vis.width + vis.margin.left + vis.margin.right)
               .attr("height", vis.height + vis.margin.top + vis.margin.bottom);
    
        vis.text_x = vis.width / 2 + 70;
        vis.text_y = vis.height / 4 + 30;
    
        vis.svg.select("#info-title")
            .attr('x', vis.width / 2)
            .attr('y', vis.height / 4);
    
        vis.svg.select("#info-name")
            .attr('x', vis.text_x)
            .attr('y', vis.text_y);
        
        let name_width = document.getElementById('info-name').getBoundingClientRect().width;
        vis.svg.select("#info-rank")
            .attr('x', vis.text_x)
            .attr('y', vis.text_y)
            .attr('dx', name_width + 10);
    
        vis.svg.select("#info-age")
            .attr('x', vis.text_x)
            .attr('y', vis.text_y)
            .attr('dy', 30);
    
        vis.svg.select("#info-networth")
            .attr('x', vis.text_x)
            .attr('y', vis.text_y)
            .attr('dy', 60);
    
        vis.svg.select("#info-country")
            .attr('x', vis.text_x)
            .attr('y', vis.text_y)
            .attr('dy', 90);
    
        vis.svg.select("#info-marital")
            .attr('x', vis.text_x)
            .attr('y', vis.text_y)
            .attr('dy', 120);
    
        vis.svg.select("#info-children")
            .attr('x', vis.text_x)
            .attr('y', vis.text_y)
            .attr('dy', 150);

        vis.bilimage
            .attr('x', vis.width / 2 - 70 - 250)
            .attr('y', vis.height / 4 + 20);
    }
    

    updateVis() {
        let vis = this;

        // listen for selected billionaire
        eventDispatcher.on("billionaireSelected", function(selected){
            window.bil_selected = 1; // disgusting but it works for now
            let button = document.getElementById('down-button');
            button.style.setProperty('background-color', 'rgb(128, 128, 128, 1)');
            button.style.setProperty('border', 'solid');
            button.style.setProperty('font-size', '16px');


            let cleanedName = cleanName(selected.Name);
            let profileUrl = `https://forbes-api.vercel.app/profile/${cleanedName}`;
            let proxyUrl = 'https://corsproxy.io/?url='; // cors restrictions

            fetch(proxyUrl + encodeURIComponent(profileUrl))
                .then(response => response.json())
                .then(apiData => {
                    let photoUrl = apiData && apiData.name ? apiData.photo : null;
                    vis.bilimage.attr('href', `${photoUrl}`);
                })
                .catch(error => {
                    console.error("Error fetching image:", error);
                });


            vis.bname = selected.Name;
            vis.brank = selected.Rank;
            vis.bage = selected.Age;
            vis.bnw = selected.NetWorth;
            vis.bcountry = selected.Country;
            vis.bmarital = selected.Status;
            vis.bnumchild = selected.Children;

            document.getElementById('info-name').textContent = vis.bname;
            document.getElementById('info-rank').textContent = "#" + vis.brank;
            document.getElementById('info-age').textContent = "Age: " + vis.bage;
            document.getElementById('info-networth').textContent = "Net Worth: " + vis.bnw;
            document.getElementById('info-country').textContent = "Country: " + vis.bcountry;
            document.getElementById('info-marital').textContent = "Marital Status: " + vis.bmarital;
            document.getElementById('info-children').textContent = "Number of Children: " + vis.bnumchild;

            let name_width = document.getElementById('info-name').getBoundingClientRect().width;
            vis.svg.select("#info-rank")
                .attr('dx', name_width + 10);
        })

    }

}

// A utility function to clean names for the forbes-api
function cleanName(name) {
    return name
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Remove accents
        .replace(/&.*$/, "") // Remove "& family"
        .replace(/[^a-zA-Z0-9\s-]/g, "") // Remove special characters
        .trim() // Remove extra spaces
        .toLowerCase() // Convert to lowercase
        .replace(/\s+/g, "-"); // Replace spaces with hyphens
}
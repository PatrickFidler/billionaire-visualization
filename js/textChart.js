
class textChart {

    constructor(parentElement, data) {
        this.parentElement = parentElement;
        this.data = data;
        this.displayData = data;

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

        // chart title
        // vis.svg.append('g')
        //     .attr('class', 'title')
        //     .append('text')
        //     .text("Your Billionaire")
        //     .attr('transform', `translate(${vis.width / 2}, 10)`)
        //     .attr('text-anchor', 'middle');

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
        
        vis.svg.append('text')
            .attr('id', 'info-rank')
            .attr('x', vis.text_x)
            .attr('y', vis.text_y)
            .attr('dx', 140)
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


    updateVis() {
        let vis = this;

        // listen for selected billionaire
        eventDispatcher.on("billionaireSelected", function(selected){
            window.allowed_scroll = 2; // disgusting but it works for now
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

            vis.wrangleData();
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
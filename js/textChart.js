
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
            .attr('x', vis.width / 2 - 420)
            .attr('y', vis.height / 4 - 25)
            .attr('clip-path', 'inset(0% round 15px)')
            .attr('width', 300)
            .attr('height', 300)

        vis.text_x = vis.width / 2 - 90;
        vis.text_y = vis.height / 4 + 5;
        vis.base_font_size = 20;

        vis.svg.append('text')
            .attr('id', 'info-title')
            .attr('font-size', 40)
            .attr('x', vis.text_x)
            .attr('y', vis.text_y)
            .text("About Your Billionaire");
        
        vis.svg.append('text')
            .attr('id', 'info0')
            .attr('fill', 'mediumslateblue')
            .attr('font-size', 25)
            .attr('x', vis.text_x)
            .attr('y', vis.text_y)
            .attr('dy', 30)
            .text("Empty");
        
        vis.svg.append('text')
            .attr('id', 'info1')
            .attr('font-size', vis.base_font_size)
            .attr('x', vis.text_x)
            .attr('y', vis.text_y)
            .attr('dy', 50)
            .text("Empty");
        
        vis.svg.append('text')
            .attr('id', 'info2')
            .attr('font-size', vis.base_font_size)
            .attr('x', vis.text_x)
            .attr('y', vis.text_y)
            .attr('dy', 70)
            .text("Empty");

        vis.svg.append('text')
            .attr('id', 'info3')
            .attr('font-size', vis.base_font_size)
            .attr('x', vis.text_x)
            .attr('y', vis.text_y)
            .attr('dy', 90)
            .text("Empty");

        let info3_width = vis.svg.select('#info3').node().getBoundingClientRect().width;
        vis.info3Image = vis.svg.append('image')
            .attr('id', 'flag')
            .attr('x', vis.text_x + info3_width + 5)
            .attr('y', vis.text_y + 90 - 13)
            .attr('width', 16)
            .attr('height', 16)
            .attr('filter', 'drop-shadow(0px 0px 1px black)')
            .attr('href', '');

        vis.svg.append('text')
            .attr('id', 'info4')
            .attr('font-size', vis.base_font_size)
            .attr('x', vis.text_x)
            .attr('y', vis.text_y)
            .attr('dy', 110)
            .text("Empty");

        vis.svg.append('text')
            .attr('id', 'info5')
            .attr('font-size', vis.base_font_size)
            .attr('x', vis.text_x)
            .attr('y', vis.text_y)
            .attr('dy', 130)
            .text("Empty");

        vis.svg.append('text')
            .attr('id', 'info6')
            .attr('font-size', vis.base_font_size)
            .attr('x', vis.text_x)
            .attr('y', vis.text_y)
            .attr('dy', 150)
            .text("Empty");
        
        vis.wiki_button = vis.svg.append('a')
            .attr('id', 'wiki-button')
            .attr('target', '_blank');
        vis.wiki_button.append('rect')
            .attr('fill', 'mediumslateblue')
            .attr('stroke', 'none')
            .attr('rx', 5)
            .attr('x', vis.text_x)
            .attr('y', vis.text_y + 169)
            .attr('width', 41)
            .attr('height', 21);
        vis.wiki_button.append('text')
            .text("Wiki")
            .attr('font-size', vis.base_font_size)
            .attr('x', vis.text_x + 5)
            .attr('y', vis.text_y)
            .attr('dy', 185)
            .attr('fill', 'white')
            .style('text-decoration', 'none')
            .style('cursor', 'pointer');
        
        vis.svg.append('text')
            .attr('id', 'info7')
            .attr('font-size', vis.base_font_size)
            .attr('x', vis.text_x)
            .attr('y', vis.text_y)
            .attr('dy', 220)
            .text("Empty");
        
        vis.forbes_button = vis.svg.append('a')
            .attr('id', 'forbes-button')
            .attr('target', '_blank');
        vis.forbes_button.append('rect')
            .attr('fill', 'mediumslateblue')
            .attr('stroke', 'none')
            .attr('rx', 5)
            .attr('x', vis.text_x)
            .attr('y', vis.text_y + 239)
            .attr('width', 57)
            .attr('height', 21);
        vis.forbes_button.append('text')
            .text("Forbes")
            .attr('font-size', vis.base_font_size)
            .attr('x', vis.text_x + 5)
            .attr('y', vis.text_y)
            .attr('dy', 255)
            .attr('fill', 'white')
            .style('text-decoration', 'none')
            .style('cursor', 'pointer');
            
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
    
        vis.text_x = vis.width / 2 - 90;
        vis.text_y = vis.height / 4 + 5;
    
        vis.svg.select("#info-title")
            .attr('x', vis.width / 2)
            .attr('y', vis.height / 4);
    
        vis.svg.select("#info0")
            .attr('x', vis.text_x)
            .attr('y', vis.text_y)
            .attr('dy', 30);
        
        vis.svg.select("#info1")
            .attr('x', vis.text_x)
            .attr('y', vis.text_y)
            .attr('dy', 50);
    
        vis.svg.select("#info2")
            .attr('x', vis.text_x)
            .attr('y', vis.text_y)
            .attr('dy', 70);
    
        vis.svg.select("#info3")
            .attr('x', vis.text_x)
            .attr('y', vis.text_y)
            .attr('dy', 90);
        
        let info3_width = vis.svg.select('#info3').node().getBoundingClientRect().width;
        vis.svg.select("#flag")
            .attr('x', vis.text_x + info3_width + 5)
            .attr('y', vis.text_y + 90 - 13);
    
        vis.svg.select("#info4")
            .attr('x', vis.text_x)
            .attr('y', vis.text_y)
            .attr('dy', 110);
    
        vis.svg.select("#info5")
            .attr('x', vis.text_x)
            .attr('y', vis.text_y)
            .attr('dy', 130);
    
        vis.svg.select("#info6")
            .attr('x', vis.text_x)
            .attr('y', vis.text_y)
            .attr('dy', 150);
        
        vis.svg.select("#info7")
            .attr('x', vis.text_x)
            .attr('y', vis.text_y)
            .attr('dy', 220);
        
        vis.wiki_button.selectAll('rect')
            .attr('x', vis.text_x)
            .attr('y', vis.text_y + 169);
        vis.wiki_button.selectAll('text')
            .attr('x', vis.text_x + 5)
            .attr('y', vis.text_y)
            .attr('dy', 185);

        vis.forbes_button.selectAll('rect')
            .attr('x', vis.text_x)
            .attr('y', vis.text_y + 239);
        vis.forbes_button.append('text')
            .attr('x', vis.text_x + 5)
            .attr('y', vis.text_y)
            .attr('dy', 255);

        vis.bilimage
            .attr('x', vis.width / 2 - 420)
            .attr('y', vis.height / 4 - 25);
    }
    

    updateVis() {
        let vis = this;

        // listen for selected billionaire
        eventDispatcher.on("billionaireSelected", function(selected){
            window.bil_selected = 1; // disgusting but it works for now
            let button = document.getElementById('down-button');
            button.style.setProperty('background-color', 'rgba(124, 104, 238, 1)');
            button.style.setProperty('font-size', '16px');


            let cleanedName = cleanName(selected.Name);
            let profileUrl = `https://forbes-api.vercel.app/profile/${cleanedName}`;
            let proxyUrl = 'https://corsproxy.io/?url='; // cors restrictions

            fetch(proxyUrl + encodeURIComponent(profileUrl))
                .then(response => response.json())
                .then(apiData => {
                    let photoUrl = apiData && apiData.name ? apiData.photo : null;
                    if (photoUrl == null) {
                        vis.bilimage.attr('href', 'data/pfp.png'); 
                    } else {
                        vis.bilimage.attr('href', `${photoUrl}`);
                    }
                })
                .catch(error => {
                    console.error("Error fetching image:", error);
                });


            vis.bname = selected.Name;
            vis.brank = selected.Rank;
            vis.bage = selected.Age;
            vis.bnw = selected.NetWorth;
            vis.bcountry = selected.Country;
            vis.bres = selected.Residence;
            vis.bmarital = selected.Status;
            vis.bnumchild = selected.Children;

            document.getElementById('info0').textContent = vis.bname + " is...";
            let suffix = "";
            switch (vis.brank % 10) {
                case 1:
                    suffix = "st";
                    break;
                case 2:
                    suffix = "nd";
                    break;
                case 3:
                    suffix = "rd";
                    break;
                default:
                    suffix = "th";
            }
            document.getElementById('info1').textContent = (
                "The " + vis.brank + suffix + " richest billionaire, with a net worth of " + vis.bnw + " billion!"
            );
            let child_type = "";
            let no_child = "";
            switch (vis.bnumchild) {
                case "":
                    no_child = "no";
                    child_type = "children";
                    break;
                case "1":
                    child_type = "child";
                    break;
                default:
                    child_type = "children";
            }
            document.getElementById('info2').textContent = (
                vis.bage + " years old, " + vis.bmarital.toLowerCase() + ", and has " + vis.bnumchild + no_child + " " + child_type + "."
            );
            fetch("https://restcountries.com/v3.1/name/" + vis.bcountry + "?fullText=true")
                .then(response => response.json())
                .then(apiData => {
                    let flag_link = "https://flagsapi.com/" + apiData[0].cca2 + "/flat/16.png";
                    vis.svg.select("#flag").attr('href', flag_link);
                })
            document.getElementById('info3').textContent = (
                "Living in " + vis.bres + ", and is a citizen of " + vis.bcountry + "."
            )

            let info3_width = vis.svg.select('#info3').node().getBoundingClientRect().width;
            vis.svg.select("#flag")
                .attr('x', vis.text_x + info3_width + 10);
            
            document.getElementById('info4').textContent = "";
            document.getElementById('info5').textContent = "";
            document.getElementById('info6').textContent = "Want to learn more details? Visit their wiki below...";

            let names = vis.bname.split(" ");
            console.log(names[0]);
            console.log(names[1]);
            let wiki_link = "http://en.wikipedia.org/wiki/" + names[0] + "_" + names[1];

            vis.svg.select('#wiki-button')
                .attr('href', wiki_link)
                .style('text-decoration', 'none')
                .selectAll('text')
                .style('text-decoration', 'none');
            
            document.getElementById('info7').textContent = "... or visit their Forbes page (where our data is sourced)!"
            let forbes_link = "https://www.forbes.com/profile/" + cleanName(vis.bname) + "/";

            vis.svg.select('#forbes-button')
                .attr('href', forbes_link)
                .style('text-decoration', 'none')
                .selectAll('text')
                .style('text-decoration', 'none');
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
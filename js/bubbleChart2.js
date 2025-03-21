
class bubbleChart2 {

    constructor(parentElement, data) {
        this.parentElement = parentElement;
        this.data = data;
        this.displayData = data;

        this.initVis();
    }


    initVis() {
        let vis = this;

        // svg margins
        vis.margin = {top: 40, right: 40, bottom: 40, left: 40};
        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height - vis.margin.top - vis.margin.bottom;

        // init svg
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append('g')
            .attr('transform', `translate (${vis.margin.left}, ${vis.margin.top})`);

        // chart title
        vis.svg.append('g')
            .attr('class', 'title')
            .attr("id", "bubble-title")
            .append('text')
            .text("Billionaire Industries")
            .attr('transform', `translate(${vis.width / 2}, 10)`)
            .attr('text-anchor', 'middle');

        // scales
        vis.r = d3.scaleSqrt()
            .range([1, 20]);

        // define zoom behavior
        vis.zoomFunction = function(event) {
            vis.svg.attr("transform", event.transform);
        }

        vis.zoom = d3.zoom()
            .scaleExtent([1, 20])
            .translateExtent([[0, 0], [vis.width, vis.height]])
            .on("zoom", vis.zoomFunction);

        vis.svg.call(vis.zoom);

        // zoom surface
        vis.svg.append("rect")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", vis.width)
            .attr("height", vis.height)
            .attr("opacity", 0)

        // tooltip
        vis.tooltip = d3.select("body").append('div')
            .attr('id', 'bubble-tooltip');

        this.wrangleData();

    }


    wrangleData() {
        let vis = this;

        // generate counts by industry
        vis.counts = d3.rollup(vis.data, leaves => leaves.length, d => d.Source);

        // convert to array
        vis.counts = Array.from(vis.counts, ([source, count]) => ({
            source: source,
            count: count
        }));

        vis.counts.forEach((d, i) => {
            d.x = 0;
            d.y = 0;
        })

        vis.displayData = vis.counts;

        this.updateVis();
    }


    updateVis() {
        let vis = this;

        vis.r
            .domain([0, d3.max(vis.displayData, d => d.count)])

        vis.simulation = d3.forceSimulation(vis.displayData)
            .force("x", d3.forceX(vis.width / 2).strength(0.05)) // Centered X
            .force("y", d3.forceY(vis.height / 2).strength(0.05)) // Centered Y
            .force("collide", d3.forceCollide(d => vis.r(d.count) + 4)) // Prevent overlap
            .on("tick", ticked);

        function ticked() {
            vis.svg.selectAll("circle")
                .data(vis.displayData)
                .join("circle")
                .attr("class", "bubble")
                .attr("cx", d => d.x)
                .attr("cy", d => d.y)
                .attr("r", d => vis.r(d.count))
                .attr("fill", (d, i) => {
                    if (d.source === selectedSource) {
                        return "purple";
                    } else {
                        return "grey";
                    }
                })
                .attr("opacity", 1.0)     // NOTE: Setting opacity=1.0 here increases loading speed.
                .attr("stroke", "black")
                .on('mouseover', function(event, d){
                    d3.select(this)
                        .attr('fill', 'black');

                    vis.tooltip
                        .style("opacity", 1)
                        .style("left", event.pageX + 20 + "px")
                        .style("top", event.pageY + "px")
                        .html(`
                         <div style="border: thin solid black; border-radius: 5px; background: white; padding: 0.5em">
                             <text>${d.source}</text>
                         </div>`);
                })
                .on('mouseout', function(event, d){
                    d3.select(this)
                        .attr("fill", d => {
                            if (d.source === selectedSource) {
                                return "purple";
                            } else {
                                return "grey";
                            }
                        })

                    vis.tooltip
                        .style("opacity", 0)
                        .style("left", 0)
                        .style("top", 0)
                        .html(``);
                })
        }

        // listen for selected billionaire
        let selectedSource = "software";
        eventDispatcher.on("billionaireSelected.industry", function(selected){
            selectedSource = selected.Source;
            // console.log("SOURCE:", selectedSource);
            vis.svg.selectAll(".bubble")
                .attr("fill", (d, i) => {
                    if (d.source === selectedSource) {
                        return "purple"
                    }
                    else {
                        return "grey"
                    }
                })
                .attr("opacity", (d, i) => {
                    if (d.source === selectedSource) {
                        return 1.0;
                    } else {
                        return 0.5;
                    }
                })

            d3.select("#industry-intro").select("p")
                .html(
                    `Your selected billionaire, <b>${selected.Name}</b>, is in the <b>${selectedSource}</b> industry!<br>
                     Explore billionaires' industries below. There are so many ways to make a billion dollars!`
                )
        })

    }

}
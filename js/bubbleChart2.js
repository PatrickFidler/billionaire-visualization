
class bubbleChart2 {

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
        vis.margin = {top: 40, right: 40, bottom: 40, left: 40};
        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height - vis.margin.top - vis.margin.bottom;

        // init svg
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append('g')
            .attr('transform', `translate (${vis.margin.left}, ${vis.margin.top})`);

        // scales
        vis.r = d3.scaleSqrt()
            .range([1, 20]);

        // define zoom behavior
        vis.zoomFunction = function (event) {
            vis.svg.attr("transform", event.transform);
        };

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
            .attr("opacity", 0);

        // tooltip
        vis.tooltip = d3.select("body").append('div')
            .attr('id', 'bubble-tooltip');

        // default selection (upon loading)
        vis.selectedSource = "software";

        // define force simulation
        vis.simulation = d3.forceSimulation();

        let legend_x = vis.width / 7 - 50;
        let legend_y = vis.height / 2;
        vis.svg.append("circle")
            .attr("cx", legend_x)
            .attr("cy", legend_y - 50)
            .attr("r", vis.r(1))
            .attr("fill", "grey")
            .attr("opacity", 0.5)
            .attr("stroke", "black");
        vis.svg.append("text")
            .attr("x", legend_x + 30)
            .attr("y", legend_y - 47)
            .attr("font-size", "small")
            .attr("fill", "grey")
            .text("1 billionaire");
        vis.svg.append("circle")
            .attr("cx", legend_x)
            .attr("cy", legend_y)
            .attr("r", vis.r(25))
            .attr("fill", "grey")
            .attr("opacity", 0.5)
            .attr("stroke", "black");
        vis.svg.append("text")
            .attr("x", legend_x + 30)
            .attr("y", legend_y + 3)
            .attr("font-size", "small")
            .attr("fill", "grey")
            .text("25 billionaires");
        vis.svg.append("circle")
            .attr("cx", legend_x)
            .attr("cy", legend_y + 50)
            .attr("r", vis.r(100))
            .attr("fill", "grey")
            .attr("opacity", 0.5)
            .attr("stroke", "black");
        vis.svg.append("text")
            .attr("x", legend_x + 30)
            .attr("y", legend_y + 53)
            .attr("font-size", "small")
            .attr("fill", "grey")
            .text("100 billionaires");

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

        // define random (x, y) positions for nodes in force simulation
        vis.counts.forEach(d => {
            d.x = Math.random() * vis.width;
            d.y = Math.random() * vis.height;
        });

        vis.displayData = vis.counts;

        this.updateVis();
    }


    // redraw the chart with new dimensions if screen is resized
    resize() {
        let vis = this;

        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height - vis.margin.top - vis.margin.bottom;

        vis.svg.attr("width", vis.width + vis.margin.left + vis.margin.right)
               .attr("height", vis.height + vis.margin.top + vis.margin.bottom);

        vis.zoom.translateExtent([[0, 0], [vis.width, vis.height]]);
        vis.svg.call(vis.zoom);

        vis.svg.select("rect")
            .attr("width", vis.width)
            .attr("height", vis.height);

        // restart force simulation
        vis.simulation
            .force("x", d3.forceX(vis.width / 2).strength(0.03)) // Centered X
            .force("y", d3.forceY(vis.height / 2).strength(0.03)) // Centered Y
            .alpha(0.5)
            .restart();
    }


    updateVis() {
        let vis = this;

        // add drag physics
        function dragstarted(event, d) {
            event.sourceEvent.stopPropagation();
            if (!event.active) vis.simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
        }
        function dragged(event, d) {
            event.sourceEvent.stopPropagation();
            d.fx = event.x;
            d.fy = event.y;
        }
        function dragended(event, d) {
            event.sourceEvent.stopPropagation();
            if (!event.active) vis.simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
        }

        // define circle radii
        vis.r.domain([0, d3.max(vis.displayData, d => d.count)]);

        // run force simulation
        vis.simulation.nodes(vis.displayData)
            .force("charge", d3.forceManyBody().strength(-2))
            .force("x", d3.forceX(vis.width / 2).strength(0.03)) // Centered X
            .force("y", d3.forceY(vis.height / 2).strength(0.03)) // Centered Y
            .force("collide", d3.forceCollide(d => vis.r(d.count) + 5)) // Prevent overlap
            .on("tick", ticked);

        // draw circles
        let circles = vis.svg.selectAll("circle")
            .data(vis.displayData)
            .join("circle")
            .attr("class", "bubble")
            .attr("r", d => vis.r(d.count))
            .attr("fill", d => d.source === vis.selectedSource ? "magenta" : "grey")
            .attr("opacity", d => d.source === vis.selectedSource ? 1.0 : 0.5 )
            .attr("stroke", "black")
            .call(d3.drag()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended))
            .on('mouseover', function (event, d) {
                d3.select(this).attr('fill', 'black');
                vis.tooltip
                    .style("opacity", 1)  // NOTE: Setting opacity=1.0 here increases loading speed.
                    .style("left", event.pageX + 20 + "px")
                    .style("top", event.pageY + "px")
                    .html(`
                  <div style="border: thin solid black; border-radius: 5px; background: white; padding: 0.5em">
                      <text>${d.source}</text>
                  </div>`);
            })
            .on('mouseout', function (event, d) {
                d3.select(this)
                    .attr("fill", d => d.source === vis.selectedSource ? "magenta" : "grey");
                vis.tooltip
                    .style("opacity", 0)
                    .style("left", 0)
                    .style("top", 0)
                    .html(``);
            });

        function ticked() {
            circles
                .attr("cx", d => d.x)
                .attr("cy", d => d.y);
        }

        // listen for selected billionaire
        eventDispatcher.on("billionaireSelected.industry", function (selected) {
            vis.selectedSource = selected.Source;
            // console.log("SOURCE:", selectedSource);
            circles.attr("fill", d => d.source === vis.selectedSource ? "magenta" : "grey")
                .attr("opacity", d => d.source === vis.selectedSource ? 1.0 : 0.5);

            d3.select("#industry-intro").select("p")
                .html(
                    `Your selected billionaire, <b>${selected.Name}</b>, is in the <b>${vis.selectedSource}</b> industry!<br>
                 Explore billionaires' industries below. Can you find the ${vis.selectedSource} industry?! HINT: It's <b>magenta</b>! <br>
                 THE TAKEAWAY: There are so many ways to make a billion dollars! By the way, you can drag the circles around to compare different catagories!`
                );
        });
    }
}
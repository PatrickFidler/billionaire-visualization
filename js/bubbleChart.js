
class bubbleChart {

    constructor(parentElement, data) {
        this.parentElement = parentElement;
        this.data = data;
        this.displayData = data;

        this.initVis();
    }


    initVis() {
        let vis = this;

        // svg margins
        vis.margin = {top: 40, right: 40, bottom: 20, left: 40};
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
            .attr('transform', `translate(${vis.width / 2}, ${-vis.margin.top/2})`)
            .attr('text-anchor', 'middle');

        // scales
        vis.x = d3.scaleLinear()
            .range([0, vis.width]);

        vis.y = d3.scaleLinear()
            .range([vis.height, 0]);

        vis.r = d3.scaleSqrt()
            .range([1, 20]);

        // y-axis
        vis.yAxis = d3.axisLeft()
            .scale(vis.y);

        vis.svg.append("g")
            .attr("class", "y-axis axis")
            .call(vis.yAxis);

        // define zoom behavior
        vis.zoomFunction = function(event) {
            vis.svg.attr("transform", event.transform);
            // vis.svg.select(".y-axis").call(vis.yAxis.scale(event.transform.rescaleY(vis.y)))
            // vis.svg.selectAll(".bubble").attr("cy", (d, i) => vis.y(d.count))

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

        vis.displayData = vis.counts;

        this.updateVis();
    }


    updateVis() {
        let vis = this;

        // listen for selected billionaire
        let selectedSource = "software";
        eventDispatcher.on("billionaireSelected.industry", function(selected){
            selectedSource = selected.Source;
            // console.log("SOURCE:", selectedSource);
            vis.svg.selectAll(".bubble").attr("fill", (d, i) => {
                if (d.source === selectedSource) {
                    return "red"
                }
                else {
                    return "grey"
                }
            })
        })

        // update scales and axis
        vis.y
            .domain([0, d3.max(vis.displayData, d => d.count)])

        vis.x
            .domain([0, 100])

        vis.r
            .domain([0, d3.max(vis.displayData, d => d.count)])

        vis.svg.select(".y-axis").call(vis.yAxis);

        // draw bubbles
        vis.bubbles = vis.svg.selectAll(".bubble")
            .data(vis.displayData);

        vis.bubbles.exit().remove();

        vis.bubbles.enter().append("circle")
            .merge(vis.bubbles)
            // .transition()
            .attr("class", "bubble")
            .attr("cx", (d, i) => vis.x(
                d3.randomUniform(0, 100)()
            ))
            .attr("r", (d, i) => vis.r(d.count) )
            .attr("cy", (d, i) => vis.y(d.count) )
            .attr("fill", (d, i) => {
                if (d.source === selectedSource) {
                    return "red";
                } else {
                    return "grey";
                }
            })
            .on('mouseover', function(event, d){
                d3.select(this)
                    .attr('fill', 'orange');

                vis.tooltip
                    .style("opacity", 1)
                    .style("left", event.pageX + 20 + "px")
                    .style("top", event.pageY + "px")
                    .html(`
                         <div style="border: thin solid black; border-radius: 5px; background: white; padding: 0.5em">
                             <h4>${d.source}<h4>
                         </div>`);
            })
            .on('mouseout', function(event, d){
                d3.select(this)
                    .attr("fill", d => {
                        if (d.source === selectedSource) {
                            return "red";
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

}
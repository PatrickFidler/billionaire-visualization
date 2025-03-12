
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
            .attr('class', 'title bubble-title')
            .append('text')
            .text("Billionaire Industries")
            .attr('transform', `translate(${vis.width / 2}, -20)`)
            .attr('text-anchor', 'middle');

        // scales
        vis.x = d3.scaleLinear()
            .range([0, vis.width]);

        vis.y = d3.scaleLinear()
            .range([vis.height, 0]);

        vis.r = d3.scaleSqrt()
            .range([0, 20]);

        // axes
        // vis.xAxis = d3.axisBottom()
        //     .scale(vis.x);
        //
        // vis.yAxis = d3.axisLeft()
        //     .scale(vis.y);
        //
        // vis.svg.append("g")
        //     .attr("class", "x-axis axis")
        //     .attr("transform", "translate(0," + vis.height + ")")
        //     .call(vis.xAxis);
        //
        // vis.svg.append("g")
        //     .attr("class", "y-axis axis")
        //     .call(vis.yAxis);

        // vis.xOrig = vis.x;
        // vis.yOrig = vis.y;

        // vis.zoomed = vis.svg.call(d3.zoom()
        //     .scaleExtent([1, 20])
        //     .translateExtent([[0, 0], [vis.width, vis.height]])
        //     .on("zoom", vis.zoomFunction))
        //     .append("g");

        vis.zoomFunction = function(event) {
            // Update x-scale and x-axis.
            // vis.x = event.transform.rescaleX(vis.xOrig);
            // vis.y = event.transform.rescaleY(vis.yOrig);
            // vis.xAxis.scale(vis.x);
            // vis.zoomed.attr("transform", event.transform);
            // vis.updateVis();
            vis.svg.attr("transform", event.transform);

        } // function that is being called when user zooms

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

        // generate normalized counts by degree
        vis.counts = d3.rollup(vis.data, leaves => leaves.length, d => d.Source);
        // console.log(vis.counts);
        // vis.total = d3.sum(vis.counts.values());
        // console.log(vis.total);

        vis.counts = Array.from(vis.counts, ([source, count]) => ({
            source: source,
            count: count
        }));

        // sort in descending order
        // vis.normalizedCounts.sort((a,b)=> b.normalized - a.normalized);
        // console.log(vis.counts);

        vis.displayData = vis.counts;

        this.updateVis();
    }


    updateVis() {
        let vis = this;

        // update scales
        vis.y
            .domain([0, d3.max(vis.displayData, d => d.count)])

        vis.x
            .domain([0, 100])

        vis.r
            .domain([0, d3.max(vis.displayData, d => d.count)])

        // draw bubbles
        vis.bubbles = vis.svg.selectAll(".bubble")
            .data(vis.displayData);

        vis.bubbles.enter().append("circle")
            .merge(vis.bubbles)
            // .transition()
            .attr("class", "bubble")
            .attr("cx", (d, i) => vis.x(
                d3.randomUniform(0, 100)()
            ))
            .attr("r", (d, i) => {
                return vis.r(d.count)
                // if (d.count < 20) { return 1; }
                // else { return 10; }
            } )
            .attr("cy", (d, i) => vis.y(d.count) )
            .attr("fill", "black")
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
                    .attr("fill", "black")

                vis.tooltip
                    .style("opacity", 0)
                    .style("left", 0)
                    .style("top", 0)
                    .html(``);
            })

        vis.bubbles.exit().remove();

        // draw bar labels
        // vis.barLabels = vis.svg.select(".x-axis").selectAll("text")
        //     .data(vis.displayData)
        //
        // vis.barLabels.exit().remove();
        //
        // vis.barLabels.enter().append("text")
        //     .merge(vis.barLabels)
        //     .text(d => d.degree);

    }

}
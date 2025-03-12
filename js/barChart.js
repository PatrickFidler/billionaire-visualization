
class barChart {

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
        vis.svg.append('g')
            .attr('class', 'title bar-title')
            .append('text')
            .text("Normalized Histogram of Billionaires' Highest Attained Education")
            .attr('transform', `translate(${vis.width / 2}, 10)`)
            .attr('text-anchor', 'middle');

        // scales
        vis.x = d3.scaleBand()
            .rangeRound([0, vis.width])
            .paddingInner(0)
            .domain(d3.range(0, 5));

        vis.y = d3.scaleLinear()
            .domain([0, 1])
            .range([vis.height, 0]);

        // axes
        vis.xAxis = d3.axisBottom()
            .scale(vis.x);

        vis.yAxis = d3.axisLeft()
            .scale(vis.y);

        vis.svg.append("g")
            .attr("class", "x-axis axis")
            .attr("transform", "translate(0," + vis.height + ")")
            .call(vis.xAxis);

        vis.svg.append("g")
            .attr("class", "y-axis axis")
            .call(vis.yAxis);

        this.wrangleData();

    }


    wrangleData() {
        let vis = this;

        // TODO: Add toggle for education/self-made

        // generate normalized counts by degree
        vis.counts = d3.rollup(vis.data, leaves => leaves.length, d => d.degree);
        // console.log(vis.counts);
        vis.total = d3.sum(vis.counts.values());
        // console.log(vis.total);

        vis.normalizedCounts = Array.from(vis.counts, ([degree, count]) => ({
            degree: degree,
            normalized: count / vis.total
        }));

        // sort in descending order
        vis.normalizedCounts.sort((a,b)=> b.normalized - a.normalized);
        // console.log(vis.normalizedCounts);

        vis.displayData = vis.normalizedCounts;

        this.updateVis();
    }


    updateVis() {
        let vis = this;

        // draw bars
        vis.bars = vis.svg.selectAll(".bar")
            .data(vis.displayData);

        vis.bars.exit().remove();

        vis.bars.enter().append("rect")
            .merge(vis.bars)
            .transition()
            .attr("class", "bar")
            .attr("x", (d, i) => vis.x(i) )
            .attr("width", vis.x.bandwidth() )
            .attr("y", d => vis.y(d.normalized) )
            .attr("height", d => vis.height - vis.y(d.normalized) );

        // draw bar labels
        vis.barLabels = vis.svg.select(".x-axis").selectAll("text")
            .data(vis.displayData)

        vis.barLabels.exit().remove();

        vis.barLabels.enter().append("text")
            .merge(vis.barLabels)
            .text(d => d.degree);

    }

}
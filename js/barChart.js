
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
            .append('text')
            .attr("id", "bar-title")
            .text("Billionaires' Highest Attained Education")
            .attr('transform', `translate(${vis.width / 2}, 10)`)
            .attr('text-anchor', 'middle');

        // self-made chart sub-title
        vis.svg.select('.title')
            .append('text')
            .attr("id", "bar-subtitle")
            .attr("opacity", 0)
            .text("\"Self-made\": Having become successful or rich by one's own efforts.")
            .attr('transform', `translate(${vis.width / 2}, 35)`)
            .attr('text-anchor', 'middle');

        // scales
        vis.x = d3.scaleBand()
            .rangeRound([0, vis.width])
            .paddingInner(0);

        vis.y = d3.scaleLinear()
            .domain([0, 1])
            .range([vis.height, 0]);

        // axes
        vis.xAxis = d3.axisBottom()
            .scale(vis.x);

        vis.yAxis = d3.axisLeft()
            .scale(vis.y)
            .tickFormat(d3.format(".0%"));

        vis.svg.append("g")
            .attr("class", "x-axis axis")
            .attr("transform", "translate(0," + vis.height + ")")

        vis.svg.append("g")
            .attr("class", "y-axis axis")
            .call(vis.yAxis);

        // y-axis label
        vis.svg.select(".y-axis")
            .append("text")
            .attr("x", 0)
            .attr("y", 20)
            .attr("fill", "black")
            .attr("transform", "rotate(-90,0,0)")
            .text("Percentage of Billionaires")

        // react to button
        vis.selectedDegree = "bachelor";
        vis.selectedSelfMade = 1;
        vis.toggle = true;
        d3.select("#bar-button")
            .on("click", function() {
                vis.toggle = !vis.toggle;
                if (vis.toggle) {
                    vis.svg.select("#bar-title")
                        .text("Billionaires' Highest Attained Education")
                    vis.svg.select("#bar-subtitle")
                        .attr("opacity", 0)
                }
                else {
                    vis.svg.select("#bar-title")
                        .text("Self-made Billionaires")
                    vis.svg.select("#bar-subtitle")
                        .attr("opacity", 100)
                }
                vis.wrangleData();
            })

        this.wrangleData();

    }

    wrangleData() {
        let vis = this;

        if (vis.toggle === true) {
            // generate counts by degree
            vis.counts = d3.rollup(vis.data, leaves => leaves.length, d => d.degree);
        }
        else {
            // generate counts by self made
            vis.counts = d3.rollup(vis.data, leaves => leaves.length, d => d.Self_made);
        }

        vis.total = d3.sum(vis.counts.values());

        // generate normalized counts
        vis.normalizedCounts = Array.from(vis.counts, ([key, value]) => ({
            key: key,
            value: value / vis.total
        }));

        // sort in descending order
        vis.normalizedCounts.sort((a,b)=> b.value - a.value);

        vis.displayData = vis.normalizedCounts;

        this.updateVis();
    }


    updateVis() {
        let vis = this;

        // listen for selected billionaire
        eventDispatcher.on("billionaireSelected.education", function(selected){
            vis.selectedDegree = selected.degree
            vis.selectedSelfMade = parseInt(selected.Self_made);    // TODO: Remove parseInt when dispatcher connected to real data.
            vis.svg.selectAll(".bar").attr("fill", (d, i) => {
                if (d.degree === vis.selectedDegree || parseInt(d.Self_made) === vis.selectedSelfMade) { // TODO: Remove parseInt when dispatcher connected to real data.
                    return "red"
                }
                else {
                    return "grey"
                }
            })

            if (vis.selectedSelfMade === 1) { vis.printSelectedSelfMade =  "self-made"; }
            else { vis.printSelectedSelfMade =  "not self-made"; }

            d3.select("#education-intro").append("p")
                .html(function() {
                    if (vis.selectedDegree === "drop out") {
                        return `Your selected billionaire, <b>${selected.Name}</b>, is a <b>${vis.selectedDegree}</b>!
                        Moreover, <b>${selected.Name}</b> is <b>${vis.printSelectedSelfMade}</b>!<br> 
                        Learn more about billionaires' education below, and make sure to click on the button
                        that says Click Me! to see whether most billionaires are self-made or not?!`
                    }
                    else if (vis.selectedDegree === "high school") {
                        return `Your selected billionaire, <b>${selected.Name}</b>, only went to <b>${vis.selectedDegree}</b>!
                        Moreover, <b>${selected.Name}</b> is <b>${vis.printSelectedSelfMade}</b>!<br>
                        Learn more about billionaires' education below, and make sure to click on the button
                        that says Click Me! to see whether most billionaires are self-made or not?!`
                    }
                    else {
                        return `Your selected billionaire, <b>${selected.Name}</b>, has a <b>${vis.selectedDegree}</b> degree!
                        Moreover, <b>${selected.Name}</b> is <b>${vis.printSelectedSelfMade}</b>!<br>
                        Learn more about billionaires' education below, and make sure to click on the button
                        that says Click Me! to see whether most billionaires are self-made or not?!`
                    }
                })

            vis.wrangleData();
        })

        // set scales and draw axes
        vis.x.domain(d3.range(vis.displayData.length))
        vis.svg.select(".x-axis").call(vis.xAxis)

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
            .attr("y", d => vis.y(d.value) )
            .attr("height", d => vis.height - vis.y(d.value) )
            .attr("fill", (d, i) => {
                if (d.key === vis.selectedDegree || parseInt(d.key) === vis.selectedSelfMade) {
                    return "purple";
                } else {
                    return "grey";
                }
            });

        // draw bar labels
        vis.barLabels = vis.svg.select(".x-axis").selectAll("text")
            .data(vis.displayData)

        vis.barLabels.exit().remove();

        vis.barLabels.enter().append("text")
            .merge(vis.barLabels)
            .text(d => {
                if (vis.toggle) {
                    return d.key;
                }
                else {
                    if (d.key) { return "self-made"; }
                    return "not self-made";
                }
            });



    }

}
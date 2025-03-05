window.WealthComparison = class WealthComparison {
    constructor(containerSelector) {
        this.container = d3.select(containerSelector);
        this.conversionFactor = 1000;
        this.wealthItems = [];
        this.selectedBillionaire = "Elon Musk"; // Default

        this.zoom = d3.zoom().on("zoom", (event) => {
            this.updateZoom(event.transform.k);
        });

        this.svg = null;
        this.width = 1000;
        this.height = 1000;
        this.containerGroup = null;
    }

    init() {
        this.createInputForm();
        this.createSVG();
        this.loadBillionaires();
    }

    createInputForm() {
        const inputContainer = this.container.append("div")
            .attr("class", "input-container")
            .style("margin-bottom", "10px");

        inputContainer.append("label")
            .text("Enter your wealth ($): ");

        inputContainer.append("input")
            .attr("type", "number")
            .attr("id", "wealth-input")
            .attr("placeholder", "e.g. 50000")
            .style("margin-right", "5px");

        inputContainer.append("button")
            .attr("id", "generate-btn")
            .text("Generate Square")
            .on("click", () => {
                const wealthValue = +document.getElementById("wealth-input").value;
                if (wealthValue > 0) {
                    this.wrangleData(wealthValue);
                } else {
                    alert("Please enter a valid wealth amount.");
                }
            });

        // Dropdown to select billionaire
        inputContainer.append("label")
            .text("Compare with: ");

        const billionaireDropdown = inputContainer.append("select")
            .attr("id", "billionaire-select")
            .style("margin-left", "5px")
            .on("change", () => {
                this.selectedBillionaire = billionaireDropdown.node().value;
                this.wrangleData(+document.getElementById("wealth-input").value);
            });

        this.billionaireDropdown = billionaireDropdown;
    }

    createSVG() {
        this.svg = this.container.append("svg")
            .attr("width", this.width)
            .attr("height", this.height)
            .attr("viewBox", `0 0 ${this.width} ${this.height}`)
            .style("border", "1px solid #ccc");

        this.containerGroup = this.svg.append("g");
        this.svg.call(this.zoom);
    }
    //placeholder data
    loadBillionaires() {
        this.billionaireOptions = [
            { name: "Elon Musk", wealth: 250e9 },
            { name: "Jeff Bezos", wealth: 190e9 },
            { name: "Bill Gates", wealth: 130e9 },
            { name: "Mark Zuckerberg", wealth: 120e9 },
            { name: "Warren Buffett", wealth: 110e9 }
        ];

        // Populate the dropdown
        this.billionaireDropdown
            .selectAll("option")
            .data(this.billionaireOptions)
            .enter()
            .append("option")
            .attr("value", d => d.name)
            .text(d => d.name);
    }

    /**
     * wrangleData()
     * - Processes the selected billionaire's wealth.
     * - Sorts and updates the dataset dynamically.
     * - Calls updateVis() to refresh the visualization.
     */
    wrangleData(userWealth) {
        let selectedBillionaireData = this.billionaireOptions.find(b => b.name === this.selectedBillionaire);

        this.wealthItems = [
            { name: selectedBillionaireData.name, wealth: selectedBillionaireData.wealth, color: "red", fill: "none" },
            { name: "Ontario Budget", wealth: 14e9, color: "orange", fill: "none" },
            { name: "Cost of a Building", wealth: 1e9, color: "purple", fill: "none" },
            { name: "Cost of a Plane", wealth: 100e6, color: "green", fill: "none" },
            { name: "Your Wealth", wealth: userWealth, color: "blue", fill: "blue", opacity: 0.5 }
        ];

        this.wealthItems.sort((a, b) => b.wealth - a.wealth);

        this.updateVis();
    }

    /**
     * updateVis()
     * - Clears the visualization and redraws wealth squares.
     * - Scales based on zoom level.
     */
    updateVis() {
        let vis = this;

        this.containerGroup.selectAll("*").remove();

        this.wealthItems.forEach(item => {
            const area = item.wealth / this.conversionFactor;
            const side = Math.sqrt(area);

            this.containerGroup.append("rect")
                .attr("class", "wealth-square")
                .attr("x", 0)
                .attr("y", 0)
                .attr("width", side)
                .attr("height", side)
                .attr("stroke", item.color)
                .attr("stroke-width", 2)
                .attr("fill", item.fill)
                .attr("opacity", item.opacity || 1)
                .datum(item)
                .append("title")
                .text(`${item.name}: $${item.wealth.toLocaleString()}`);

            this.containerGroup.append("text")
                .attr("id", `label-${item.name.replace(/\s+/g, '-')}`)
                .attr("x", side + 10)
                .attr("y", 15)
                .style("fill", "black")
                .style("font-size", "12px")
                .style("font-weight", "bold")
                .text(item.name);
        });

        const userSide = Math.sqrt(this.wealthItems.find(d => d.name === "Your Wealth").wealth / this.conversionFactor);
        this.zoomToUserSquare(userSide);
    }

    zoomToUserSquare(userSide) {
        const margin = 20;
        const scale = Math.min((this.width - margin) / userSide, (this.height - margin) / userSide);
        this.svg.transition()
            .duration(750)
            .call(this.zoom.scaleTo, scale);
    }

    updateZoom(scale) {
        this.containerGroup.selectAll(".wealth-square").each((event, i, nodes) => {
            const d = d3.select(nodes[i]).datum();
            const side = Math.sqrt(d.wealth / this.conversionFactor) * scale;

            d3.select(nodes[i])
                .attr("width", side)
                .attr("height", side);

            d3.select(`#label-${d.name.replace(/\s+/g, '-')}`)
                .attr("x", side + 10)
                .attr("y", Math.max(15, 15 * scale))
                .style("font-size", `${Math.max(10, 12 * scale)}px`);
        });
    }
};

window.WealthComparison = class WealthComparison {
    constructor(containerSelector) {
        this.container = d3.select(containerSelector);
        this.conversionFactor = 1000;
        this.wealthItems = [];
        this.selectedBillionaire = "Elon Musk"; // Default
        this.planeTriviaAnimated = false;
        this.skipAnimation = false;

        // Define multiple zoom messages with their thresholds.
        this.zoomMessages = [
            { threshold: 49, message: "The average US house costs around $400,000!", triggered: false },
            { threshold: 5, message: "A luxury sports car can cost about $300,000!", triggered: false },
            { threshold: 2.86, message: "Did you know a Boeing 767 costs $300 million?", triggered: false },
            { threshold: 1, message: "The average college tuition is roughly $35,000 per year!", triggered: false },
            { threshold: 0.2, message: "The Titanic cost about $7.5 million to build (1912)!", triggered: false },
            { threshold: 0.27, message: "the budget of Ontario in 2024 is 214.5 Billion", triggered: false }
        ];

        // Set up zoom behavior.
        this.zoom = d3.zoom()
            .wheelDelta((event) => -event.deltaY * 0.0002)  // Adjusts zoom sensitivity
            .on("zoom", (event) => {
                this.updateZoom(event.transform.k);
            });

        this.svg = null;
        this.width = 1000;
        this.height = 1000;
        this.containerGroup = null;
        this.textGroup = null;
        this.triviaDisplay = null; // For trivia text and animation
    }

    init() {
        this.container
            .style("margin", "20px")
            .style("padding", "200px")
            .style("box-sizing", "border-box");
        this.createInputForm();
        this.createSVG();
        this.createTriviaDisplay();  // Create the animated trivia container
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
        // Create the main SVG.
        this.svg = this.container.append("svg")
            .attr("viewBox", `0 0 ${this.width} ${this.height}`)
            .attr("preserveAspectRatio", "xMidYMid meet")
            .style("border", "1px solid #ccc")
            .style("width", "100%")
            .style("height", "auto");

        // Create a group for zoomable content
        this.zoomGroup = this.svg.append("g").attr("class", "zoom-group");

        this.containerGroup = this.zoomGroup.append("g").attr("class", "squares-group");
        this.textGroup = this.zoomGroup.append("g").attr("class", "labels-group");

        // Create a legend group for static elements (not affected by zoom).
        this.legendGroup = this.svg.append("g").attr("class", "legend-group");

        // Create the wealth scale label at the top center.
        this.xAxisLabel = this.legendGroup.append("text")
            .attr("class", "x-axis-label")
            .attr("x", this.width / 2)
            .attr("y", 20)
            .attr("text-anchor", "middle")
            .style("font-size", "14px")
            .text(`Wealth scale: $${(this.conversionFactor).toFixed(2)} per pixel`);

        // Create a sample pixel
        this.pixelSample = this.legendGroup.append("rect")
            .attr("class", "pixel-sample")
            .attr("x", this.width / 2 - 60)
            .attr("y", 30)
            .attr("width", 20)
            .attr("height", 20)
            .attr("fill", "lightgray")
            .attr("stroke", "black")
            .attr("stroke-width", 1);

        // Label for the sample pixel.
        this.pixelSampleLabel = this.legendGroup.append("text")
            .attr("class", "pixel-sample-label")
            .attr("x", this.width / 2 - 30)
            .attr("y", 45)
            .attr("text-anchor", "start")
            .style("font-size", "12px")
            .text(`= $${(this.conversionFactor).toFixed(2)} per pixel`);


        this.svg.call(this.zoom);
    }
    // Create a trivia display
    createTriviaDisplay() {
        this.triviaDisplay = d3.select("body").append("div")
            .attr("class", "trivia-display")
            .style("position", "fixed")
            .style("bottom", "10px")
            .style("left", "50%")
            .style("transform", "translateX(-50%)")
            .style("padding", "10px")
            .style("background", "#222")
            .style("color", "#fff")
            .style("border-radius", "8px")
            .style("border", "1px solid #999")
            .style("font-size", "16px")
            .style("text-align", "center")
            .style("width", "auto")
            .style("min-width", "300px")
            .style("visibility", "hidden");
    }

    // Placeholder data for billionaires and other wealth items.
    loadBillionaires() {
        this.billionaireOptions = [
            { name: "Elon Musk", wealth: 250e9 },
            { name: "Jeff Bezos", wealth: 190e9 },
            { name: "Bill Gates", wealth: 130e9 },
            { name: "Mark Zuckerberg", wealth: 120e9 },
            { name: "Warren Buffett", wealth: 110e9 }
        ];

        this.billionaireDropdown
            .selectAll("option")
            .data(this.billionaireOptions)
            .enter()
            .append("option")
            .attr("value", d => d.name)
            .text(d => d.name);
    }

    /**
     * Processes the selected billionaire's wealth and user wealth.
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

        // Sort in descending order so the largest square is drawn first.
        this.wealthItems.sort((a, b) => b.wealth - a.wealth);

        this.updateVis();
    }

    /**
     * Draws the squares and labels.
     */
    updateVis() {
        this.containerGroup.selectAll("*").remove();
        this.textGroup.selectAll("*").remove();

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
        });

        this.wealthItems.forEach(item => {
            this.textGroup.append("text")
                .attr("id", `label-${item.name.replace(/\s+/g, '-')}`)
                .attr("x", 0)
                .attr("y", 0)
                .style("fill", "black")
                .style("font-size", "12px")
                .style("font-weight", "bold")
                .text(item.name)
                .datum(item);
        });

        // Zoom to the "Your Wealth" square.
        const userItem = this.wealthItems.find(d => d.name === "Your Wealth");
        if (userItem) {
            const userSide = Math.sqrt(userItem.wealth / this.conversionFactor);
            this.zoomToUserSquare(userSide);
        }
    }

    /**
     * Zooms to the "Your Wealth" square.
     */
    zoomToUserSquare(userSide) {
        const margin = 20;
        const scale = Math.min((this.width - margin) / userSide, (this.height - margin) / userSide);
        const translateX = (this.width - userSide * scale) / 2;
        const translateY = (this.height - userSide * scale) / 2;
        this.skipAnimation = true; // Skip animation during programmatic zoom.
        this.svg.transition()
            .duration(750)
            .call(this.zoom.transform, d3.zoomIdentity.translate(translateX, translateY).scale(scale))
            .on("end", () => {
                this.skipAnimation = false;
            });
    }

    /**
     * Updates squares and labels on zoom, and triggers animated trivia based solely on zoom level.
     */
    updateZoom(scale) {
        // Apply zoom transform only to the zoomable group.

        // Update each square’s dimensions.
        this.containerGroup.selectAll(".wealth-square").each((d, i, nodes) => {
            const side = Math.sqrt(d.wealth / this.conversionFactor) * scale;
            d3.select(nodes[i])
                .attr("width", side)
                .attr("height", side);
        });

        // Update label positions
        this.textGroup.selectAll("text").each((d, i, nodes) => {
            const side = Math.sqrt(d.wealth / this.conversionFactor) * scale;
            let x, y, fontSize;
            if (scale >= 4) {
                x = side;
                y = Math.max(15, side / 2);
                fontSize = 15;
            } else if (scale >= 3.99) {
                x = side;
                y = Math.max(15, side / 2);
                fontSize = Math.max(15, scale);
            } else if (scale >= 3.98) {
                x = side;
                y = Math.max(15, side / 2);
                fontSize = Math.max(15, 10 * scale);
            } else {
                x = side + 10;
                const totalLabels = this.wealthItems.length;
                y = 15 + (totalLabels - 1 - i) * 20;
                fontSize = 15;
            }
            d3.select(nodes[i])
                .attr("x", x)
                .attr("y", y)
                .style("font-size", `${fontSize}px`);
        });

        // Handle trivia messages
        if (!this.skipAnimation) {
            let triggeredMessage = null;
            for (let msg of this.zoomMessages) {
                if (scale < msg.threshold && !msg.triggered) {
                    triggeredMessage = msg.message;
                    msg.triggered = true;
                } else if (scale >= msg.threshold) {
                    msg.triggered = false;
                }
            }
            if (triggeredMessage) {
                this.animateTriviaMessage(triggeredMessage);
            }
        }

        // Calculate wealth per pixel.
        const wealthPerPixel = this.conversionFactor / (scale * scale);


        // Update the static legend texts.
        this.xAxisLabel.text(
            `Zoom: ${scale.toFixed(2)} | Wealth scale: $${wealthPerPixel.toFixed(2)} per pixel`
        );
        const rectArea = 20 * 20;   // 400 px²
        const rectValue = rectArea * wealthPerPixel;
        this.pixelSampleLabel.text(`= $${rectValue.toFixed(2)}`);
    }

    /**
     * Creates and animates a trivia message that slides from right to left.
     * Accepts a custom message as a parameter.
     */
    animateTriviaMessage(message) {
        this.triviaDisplay
            .html(message)
            .style("visibility", "visible")
            .style("opacity", "1")
            .style("right", "-400px")
            .transition()
            .duration(2000)
            .style("right", "0px")
            .transition()
            .delay(3000)
            .duration(1000)
            .style("opacity", "0")
            .on("end", () => {
                this.triviaDisplay.style("visibility", "hidden");
            });
    }
};

window.WealthComparison = class WealthComparison {
    constructor(containerSelector) {
        this.container = d3.select(containerSelector);
        this.conversionFactor = 1000; // Dollars per pixel conversion factor
        this.wealthItems = [];
        this.selectedBillionaire = null;
        this.planeTriviaAnimated = false;
        this.skipAnimation = false;

        // Currency conversion: 1 CAD = 0.75 USD
        const CAD_TO_USD = 0.75;

        // Array of zoom threshold messages for trivia
        this.zoomMessages = [
            {
                threshold: 6500 * CAD_TO_USD,
                message: "The average Canadian university tuition is about $4,875 per year!",
                triggered: false
            },
            {
                threshold: 40000 * CAD_TO_USD,
                message: "The average Canadian car costs about $30,000!",
                triggered: false
            },
            {
                threshold: 2e9 * CAD_TO_USD,
                message: "The tallest building in Canada currently under construction in Toronto Costs about 1.4 billion!",
                triggered: false
            },
            {
                threshold: 57700* CAD_TO_USD,
                message: "The Average Canadian income is about $43,275",
                triggered: false
            },
            {
                threshold: 100000 * CAD_TO_USD,
                message: "A 'luxury' Canadian car can easily be $75,000!",
                triggered: false
            },
            {
                threshold: 329900 * CAD_TO_USD,
                message: "The typical Canadian household has a median net worth of about $247,425!",
                triggered: false
            },
            {
                threshold: 800000 * CAD_TO_USD,
                message: "The average Canadian home costs around $600,000!",
                triggered: false
            },
            {
                threshold: 1.5e6 * CAD_TO_USD,
                message: "A cottage in Muskoka might run you about $1.125 million!",
                triggered: false
            },
            {
                threshold: 63e6 * CAD_TO_USD,
                message: "The CN Tower was built for about $47 million in 1976!",
                triggered: false
            },
            {
                threshold: 70e6,
                message: "A Bombardier Global 7500 private jet built in Ontario costs around $70 million!",
                triggered: false
            },
            {
                threshold: 250e6,
                message: "Drake's net worth is around $250 million!",
                triggered: false
            },
            {
                threshold: 1e9 * CAD_TO_USD,
                message: "The average NHL franchise is worth about $750 million!",
                triggered: false
            },
            // {
            //     threshold: 2.12e9 * CAD_TO_USD,
            //     message: "The Toronto Maple Leafs are valued at about $1.59 billion!",
            //     triggered: false
            // },
            {
                threshold: 40e9 * CAD_TO_USD,
                message: "the richest Canadian, David Thomson is worth around $30 billion!",
                triggered: false
            },
            {
                threshold: 214.5e9 * CAD_TO_USD,
                message: "Ontario's 2024 budget is approximately $161 billion!",
                triggered: false
            }
            // A new message for the selected billionaire will be added dynamically in wrangleData()
        ];

        // Set up D3 zoom behavior
        this.zoom = d3.zoom()
            .scaleExtent([0.01, 99999])
            .wheelDelta((event) => -event.deltaY * 0.0002)
            .on("zoom", (event) => {
                if (this.containerGroup && !this.containerGroup.selectAll("rect").empty()) {
                    this.updateZoom(event.transform.k);
                }
            });

        // Initialize SVG and layout groups
        this.svg = null;
        this.width = 1000;
        this.height = 1000;
        this.containerGroup = null;
        this.textGroup = null;
        this.triviaDisplay = null;

        // Listen for a selected billionaire event
        eventDispatcher.on("billionaireSelected.wealth", (billionaire) => {
            console.log("Billionaire selected:", billionaire);

            // Convert net worth from billions to dollars
            this.selectedBillionaire = {
                Name: billionaire.Name,
                NetWorth: billionaire.NetWorth * 1e9
            };

            const wealthValue = +document.getElementById("wealth-input")?.value;
            if (wealthValue > 0) {
                this.wrangleData(wealthValue);
            }

            // Update Clippy’s introductory message with the new billionaire
            this.updateClippyIntro();
        });
    }

    /**
     * Initialize the visualization by setting up Clippy, input form, SVG, trivia display, and loading billionaires.
     */
    init() {
        const billionaireName = this.selectedBillionaire ? this.selectedBillionaire.Name : "Elon Musk";

        // Create Clippy instance
        this.clippyWealth = new Clippy({
            defaultImage: 'css/images/clippy.gif',
            defaultText: `
                Wow, what a journey we've had learning about <strong>${billionaireName}</strong>!
                Now let's do something fun: compare <em>your</em> wealth to theirs.
                Enter an amount below and press <em>Compare Wealth</em> to see how you stack up!
            `,
            bubblePosition: 'top'
        });

        this.container.style("box-sizing", "border-box");

        this.createInputForm();
        this.createSVG();
        this.createTriviaDisplay();
        this.loadBillionaires();
    }

    /**
     * Update Clippy's introductory text when a new billionaire is selected.
     */
    updateClippyIntro() {
        if (!this.clippyWealth) return;
        const billionaireName = this.selectedBillionaire ? this.selectedBillionaire.Name : "Elon Musk";

        this.clippyWealth.setText(`
            Wow, what a journey we've had learning about <strong>${billionaireName}</strong>!
            Now let's do something fun: compare <em>your</em> wealth to theirs.
            Enter an amount below and press <em>Compare Wealth</em> to see how you stack up!
        `);
        // Optionally reposition Clippy relative to the "Compare Wealth" button
        const generateBtn = document.getElementById("generate-btn");
        if (generateBtn) {
            this.clippyWealth.showRelativeToElement(generateBtn, { offsetX: 60, offsetY: -350 });
        } else {
            this.clippyWealth.show();
        }
    }

    /**
     * Create the input form for users to enter their wealth and trigger comparison.
     */
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

        // Button to trigger wealth comparison
        inputContainer.append("button")
            .attr("id", "generate-btn")
            .text("Compare Wealth")
            .on("click", () => {
                const wealthValue = +document.getElementById("wealth-input").value;
                if (wealthValue > 0) {
                    this.wrangleData(wealthValue);

                    const billionaireName = this.selectedBillionaire ? this.selectedBillionaire.Name : "Elon Musk";

                    // Update Clippy's message after user clicks the button
                    this.clippyWealth.setText(`
                        Notice these squares? Each pixel in the chart corresponds to a specific amount of money, so the 
                        bigger the square, the more wealth it represents. Everything here is to scale,
                        meaning if one square is twice as wide, it’s showing four times the money! That’s why billionaire 
                        fortunes take up so much space—they’re massive when you visualize every dollar.
                        Try zooming out to see just how huge those bigger squares are and see how you compare to <strong>${billionaireName}</strong>.
                        It's <em>a lot</em> of money, so it may take a bit of zooming!
                    `);
                    // Ensure Clippy is visible again
                    this.clippyWealth.show();
                } else {
                    alert("Please enter a valid wealth amount.");
                }
            });

        // Position Clippy
        setTimeout(() => {
            const generateBtn = document.getElementById("generate-btn");
            if (generateBtn) {
                this.clippyWealth.showRelativeToElement(generateBtn, { offsetX: 60, offsetY: -350 });
            }
        }, 0);
    }

    /**
     * Create the main SVG element and associated groups for the visualization and legend.
     */
    createSVG() {
        this.svg = this.container.append("svg")
            .attr("viewBox", `0 0 ${this.width} ${this.height}`)
            .style("border", "1px solid #ccc")
            .style("width", "100%")
            .style("height", "100%");

        // Create groups for zoomable content, squares, labels, and legend
        this.zoomGroup = this.svg.append("g").attr("class", "zoom-group");
        this.containerGroup = this.zoomGroup.append("g").attr("class", "squares-group");
        this.textGroup = this.zoomGroup.append("g").attr("class", "labels-group");
        this.legendGroup = this.svg.append("g").attr("class", "legend-group");

        // Create legend elements
        this.xAxisLabel = this.legendGroup.append("text")
            .attr("class", "x-axis-label")
            .attr("x", this.width / 2)
            .attr("y", 20)
            .attr("text-anchor", "middle")
            .style("font-size", "14px")
            .text(`Wealth scale: $${this.conversionFactor.toFixed(2)} per pixel`);

        this.pixelSample = this.legendGroup.append("rect")
            .attr("class", "pixel-sample")
            .attr("x", this.width / 2 - 60)
            .attr("y", 30)
            .attr("width", 20)
            .attr("height", 20)
            .attr("fill", "lightgray")
            .attr("stroke", "black")
            .attr("stroke-width", 1);

        this.pixelSampleLabel = this.legendGroup.append("text")
            .attr("class", "pixel-sample-label")
            .attr("x", this.width / 2 - 30)
            .attr("y", 45)
            .attr("text-anchor", "start")
            .style("font-size", "12px")
            .text(`= $${this.conversionFactor.toFixed(2)} per pixel`);

        // Attach zoom behavior to the SVG
        this.svg.call(this.zoom);
    }

    /**
     * Create a fixed-position trivia display for showing zoom messages.
     */
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

    /**
     * Load a default list of billionaire options if none is selected.
     */
    loadBillionaires() {
        this.billionaireOptions = [
            { name: "Elon Musk", wealth: 151e9 },
            { name: "Jeff Bezos", wealth: 190e9 },
            { name: "Bill Gates", wealth: 130e9 },
            { name: "Mark Zuckerberg", wealth: 120e9 },
            { name: "Warren Buffett", wealth: 110e9 }
        ];
    }

    /**
     * Process user input wealth and selected billionaire to create a list of wealth items,
     * sort them, and update the visualization.
     *
     * @param {number} userWealth - The wealth amount entered by the user.
     */
    wrangleData(userWealth) {
        // Determine selected billionaire data; default to Elon Musk if none selected
        let selectedBillionaireData;
        if (this.selectedBillionaire) {
            selectedBillionaireData = {
                name: this.selectedBillionaire.Name,
                wealth: this.selectedBillionaire.NetWorth
            };
        } else {
            selectedBillionaireData = this.billionaireOptions.find(b => b.name === "Elon Musk");
        }

        // Remove any existing billionaire message and add a new one for the selected billionaire
        this.zoomMessages = this.zoomMessages.filter(msg => !msg.isBillionaireMsg);
        this.zoomMessages.push({
            threshold: selectedBillionaireData.wealth,
            message: `Your selected billionaire ${selectedBillionaireData.name} is worth around $${selectedBillionaireData.wealth.toLocaleString()}!`,
            triggered: false,
            isBillionaireMsg: true
        });

        const CAD_TO_USD = 0.75;

        // Prepare the array of wealth items to display
        this.wealthItems = [
            {
                name: "Ontario Budget (2024)",
                wealth: 214.5e9 * CAD_TO_USD,
                color: "orange",
                fill: "none"
            },
            // {
            //     name: "Toronto Maple Leafs (Franchise Value)",
            //     wealth: 2.12e9 * CAD_TO_USD,
            //     color: "darkblue",
            //     fill: "none"
            // },
            {
                name: "Drake's Net Worth",
                wealth: 250e6,
                color: "darkgreen",
                fill: "none"
            },
            {
                name: "Richest Canadian (David Thomson)",
                wealth: 41.8e9 * CAD_TO_USD,
                color: "black",
                fill: "none"
            },
            // Selected billionaire
            {
                name: selectedBillionaireData.name,
                wealth: selectedBillionaireData.wealth,
                color: "red",
                fill: "none"
            },
            {
                name: "Bombardier Global 7500",
                wealth: 70e6,
                color: "green",
                fill: "none"
            },
            {
                name: "Average NHL Franchise",
                wealth: 1e9 * CAD_TO_USD,
                color: "brown",
                fill: "none"
            },
            {
                name: "Average Canadian Home",
                wealth: 800000 * CAD_TO_USD,
                color: "blue",
                fill: "none"
            },
            {
                name: "Vacation Cottage",
                wealth: 1.5e6 * CAD_TO_USD,
                color: "cadetblue",
                fill: "none"
            },
            {
                name: "Average Canadian Yearly Income",
                wealth: 57700 * CAD_TO_USD,
                color: "silver",
                fill: "none"
            },
            {
                name: "Luxury Canadian Car",
                wealth: 100000 * CAD_TO_USD,
                color: "teal",
                fill: "none"
            },
            {
                name: "Average Car",
                wealth: 30000 * CAD_TO_USD,
                color: "teal",
                fill: "none"
            },
            {
                name: "Median Canadian Household Net Worth",
                wealth: 329900 * CAD_TO_USD,
                color: "darkred",
                fill: "none"
            },
            {
                name: "Average Canadian University Tuition",
                wealth: 6500 * CAD_TO_USD,
                color: "magenta",
                fill: "none"
            },
            {
                name: "Your Wealth",
                wealth: userWealth,
                color: "navy",
                fill: "navy",
                opacity: 0.5
            },
            {
                name: "CN Tower Construction Cost (1976)",
                wealth: 63e6 * CAD_TO_USD,
                color: "teal",
                fill: "none"
            },
            {
                name: "The One skyscraper",
                wealth: 2e9 * CAD_TO_USD,
                color: "purple",
                fill: "none"
            }
        ];

        // Sort wealth items
        this.wealthItems.sort((a, b) => b.wealth - a.wealth);
        this.updateVis();
    }

    /**
     * Update the visualization by drawing squares for each wealth item and adding labels.
     */
    updateVis() {
        if (!this.containerGroup || !this.textGroup) return;

        // Clear previous visualization elements
        this.containerGroup.selectAll("*").remove();
        this.textGroup.selectAll("*").remove();

        // Draw each wealth item as a square
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

        // Add labels for each wealth item
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

        // Zoom in on the "Your Wealth" square
        const userItem = this.wealthItems.find(d => d.name === "Your Wealth");
        if (userItem) {
            const userSide = Math.sqrt(userItem.wealth / this.conversionFactor);
            this.zoomToUserSquare(userSide);
        }
    }

    /**
     * Zoom the view so that the "Your Wealth" square is centered and scaled appropriately.
     *
     * @param {number} userSide - The side length of the "Your Wealth" square.
     */
    zoomToUserSquare(userSide) {
        const margin = 20;
        const scale = Math.min((this.width - margin) / userSide, (this.height - margin) / userSide);
        const translateX = (this.width - userSide * scale) / 2;
        const translateY = (this.height - userSide * scale) / 2;
        this.skipAnimation = true;

        this.svg.transition()
            .duration(750)
            .call(this.zoom.transform, d3.zoomIdentity.translate(translateX, translateY).scale(scale))
            .on("end", () => {
                this.skipAnimation = false;
            });
    }

    /**
     * Update the positions and sizes of squares and labels based on the current zoom scale.
     *
     * @param {number} scale - The current zoom scale.
     */
    updateZoom(scale) {
        // Identify "Your Wealth" and the selected billionaire items
        const userItem = this.wealthItems.find(d => d.name === "Your Wealth");
        const billionaireItem = this.wealthItems.find(d => d.name === (this.selectedBillionaire?.Name || "Elon Musk"));

        // Helper function to check if two wealth values are within ±10%
        function isClose(value1, value2) {
            if (value2 === 0) return false;
            const ratio = value1 / value2;
            return ratio > 0.99 && ratio < 1.1;
        }

        // Reset any label offsets for each item
        if (userItem) {
            userItem.offsetX = 0;
            userItem.offsetY = 0;
        }
        if (billionaireItem) {
            billionaireItem.offsetX = 0;
            billionaireItem.offsetY = 0;
        }

        // Apply an offset to "Your Wealth" if its wealth is close to any other item
        if (userItem) {
            for (const item of this.wealthItems) {
                if (item !== userItem && isClose(userItem.wealth, item.wealth)) {
                    userItem.offsetX = -100;
                    userItem.offsetY = 0;
                    break;
                }
            }
        }

        // Apply an offset for the selected billionaire if needed
        if (billionaireItem) {
            for (const item of this.wealthItems) {
                if (item !== billionaireItem && isClose(billionaireItem.wealth, item.wealth)) {
                    billionaireItem.offsetX = -100;
                    billionaireItem.offsetY = 0;
                    break;
                }
            }
        }

        // Update square sizes based on the zoom scale
        this.containerGroup.selectAll(".wealth-square").each((d, i, nodes) => {
            const side = Math.sqrt(d.wealth / this.conversionFactor) * scale;
            d3.select(nodes[i])
                .attr("width", side)
                .attr("height", side);
        });

        // Update labels with new positions and font sizes, applying any offsets
        this.textGroup.selectAll("text").each((d, i, nodes) => {
            const side = Math.sqrt(d.wealth / this.conversionFactor) * scale;
            let x, y, fontSize;

            // Positioning logic based on zoom scale
            if (scale >= 10) {
                x = side;
                y = Math.max(15, side / 2);
                fontSize = 15;
            } else if (scale >= 11.44) {
                x = side;
                y = Math.max(15, side / 2);
                fontSize = Math.max(15, scale);
            } else {
                x = side + 10;
                const totalLabels = this.wealthItems.length;
                y = 15 + (totalLabels - 1 - i) * 20;
                fontSize = 15;
            }

            // Apply any calculated offsets
            const offsetX = d.offsetX || 0;
            const offsetY = d.offsetY || 0;
            x += offsetX;
            y += offsetY;

            d3.select(nodes[i])
                .attr("x", x)
                .attr("y", y)
                .style("font-size", `${fontSize}px`);
        });

        // Check zoom messages if not skipping animation
        if (!this.skipAnimation) {
            let triggeredMessage = null;
            for (let msg of this.zoomMessages) {
                let effectiveThreshold = msg.threshold;
                if (msg.threshold > 1000) {
                    effectiveThreshold = this.width * Math.sqrt(this.conversionFactor / msg.threshold);
                }
                if (scale < effectiveThreshold && !msg.triggered) {
                    triggeredMessage = msg.message;
                    msg.triggered = true;
                } else if (scale >= effectiveThreshold) {
                    msg.triggered = false;
                }
            }
            if (triggeredMessage) {
                this.animateTriviaMessage(triggeredMessage);
            }
        }

        // Update legend with current zoom scale and wealth per pixel
        const wealthPerPixel = this.conversionFactor / (scale * scale);
        this.xAxisLabel.text(
            `Zoom: ${scale.toFixed(2)} | Wealth scale: $${wealthPerPixel.toFixed(2)} per pixel`
        );
        const rectArea = 20 * 20;
        const rectValue = rectArea * wealthPerPixel;
        this.pixelSampleLabel.text(`= $${rectValue.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })}`);
    }

    /**
     * Animate the trivia display with a given message.
     *
     * @param {string} message - The trivia message to display.
     */
    animateTriviaMessage(message) {
        this.triviaDisplay
            .html(message)
            .style("visibility", "visible")
            .style("opacity", "1")
            .style("right", "-400px")
            .style("bottom", "100px")
            .transition()
            .duration(2000)
            .style("right", "0px")
            .style("bottom", "100px")
            .transition()
            .delay(3000)
            .duration(1000)
            .style("opacity", "0")
            .on("end", () => {
                this.triviaDisplay.style("visibility", "hidden");
            });
    }
};

/*********************************************
 *  Icon Definitions for Different Net Worth
 *********************************************/
let nameToMarker = {};
let billionaireNames = [];

// Global array to keep track of all markers for filtering
let allMarkers = [];

// Define different icons for rank ranges (low, mid, high, ultra)
const billionaireIcons = {
    low: L.icon({
        iconUrl: 'css/images/markerlow.svg',
        shadowUrl: 'css/images/marker-shadow.png',
        iconSize: [35, 35],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [40, 35],
        shadowAnchor: [8, 41]
    }),
    mid: L.icon({
        iconUrl: 'css/images/markermid.svg',
        shadowUrl: 'css/images/marker-shadow.png',
        iconSize: [35, 35],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [40, 35],
        shadowAnchor: [8, 41]
    }),
    high: L.icon({
        iconUrl: 'css/images/markerhigh.svg',
        shadowUrl: 'css/images/marker-shadow.png',
        iconSize: [35, 35],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [40, 35],
        shadowAnchor: [8, 41]
    }),
    ultra: L.icon({
        iconUrl: 'css/images/markerultra.svg',
        shadowUrl: 'css/images/marker-shadow.png',
        iconSize: [35, 35],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [40, 35],
        shadowAnchor: [8, 41]
    })
};

/*********************************************
 *  Global Filter State
 *********************************************/
const activeFilters = {
    low: true,
    mid: true,
    high: true,
    ultra: true
};

/*********************************************
 *  Function: updateMarkerVisibility
 *  ---------------------------------
 *  Clears and re-adds markers based on activeFilters.
 *********************************************/
function updateMarkerVisibility() {
    // Clear all markers from the cluster group
    markers.clearLayers();
    // Add markers back only if their category is active
    allMarkers.forEach(marker => {
        if (activeFilters[marker.category]) {
            markers.addLayer(marker);
        }
    });
}

/*********************************************
 *  Class: SearchControl (extends L.Control)
 *  ----------------------------------------
 *  A custom Leaflet control for searching
 *  billionaires by name.
 *********************************************/
const SearchControl = L.Control.extend({
    onAdd: function (map) {
        // Create container for the control
        const container = L.DomUtil.create("div", "leaflet-bar leaflet-control leaflet-control-custom");
        container.style.background = "white";
        container.style.padding = "8px";
        container.style.cursor = "auto";
        container.style.minWidth = "220px";

        // Prevent map interactions when clicking inside the control
        L.DomEvent.disableClickPropagation(container);
        L.DomEvent.disableScrollPropagation(container);

        // Build UI elements using D3
        const d3Container = d3.select(container);

        // Search input element
        const input = d3Container
            .append("input")
            .attr("type", "text")
            .attr("placeholder", "Search Billionaire...")
            .style("width", "100%")
            .style("margin-bottom", "5px")
            .style("padding", "5px");

        // Random Button element
        const randomButton = d3Container
            .append("button")
            .attr("id", "randomButton")
            .text("Random")
            .style("width", "100%")
            .style("padding", "5px")
            .style("margin-bottom", "5px")
            .on("click", function() {
                if (billionaireNames.length === 0) return;
                const randomName = billionaireNames[Math.floor(Math.random() * billionaireNames.length)];
                input.property("value", randomName);
                suggestions.html("").style("display", "none");
                goToBillionaire(randomName);
            });

        // Suggestions container element
        const suggestions = d3Container
            .append("div")
            .style("border", "1px solid #ccc")
            .style("background", "white")
            .style("display", "none")
            .style("max-height", "120px")
            .style("overflow-y", "auto");

        // Handle user typing to filter suggestions
        input.on("input", function(event) {
            const query = this.value.trim().toLowerCase();
            suggestions.html(""); // Clear previous suggestions

            if (!query) {
                suggestions.style("display", "none");
                return;
            }

            // Filter billionaireNames and sort
            const filtered = billionaireNames
                .filter(name => name.toLowerCase().includes(query))
                .sort((a, b) => a.localeCompare(b));

            if (filtered.length === 0) {
                suggestions.style("display", "none");
                return;
            }

            suggestions.style("display", "block");

            // Bind data to suggestion items
            const items = suggestions
                .selectAll("div.suggestion-item")
                .data(filtered, d => d);

            // ENTER selection for new suggestion items
            const itemsEnter = items.enter()
                .append("div")
                .attr("class", "suggestion-item")
                .style("padding", "5px")
                .style("cursor", "pointer")
                .on("mouseover", function() {
                    d3.select(this).style("background", "#eee");
                })
                .on("mouseout", function() {
                    d3.select(this).style("background", "#fff");
                })
                .on("click", (event, name) => {
                    input.property("value", name);
                    suggestions.style("display", "none").html("");
                    goToBillionaire(name);
                })
                .text(d => d);

            // Remove any old suggestion items
            items.exit().remove();
        });

        // Handle ENTER key for search input
        input.on("keydown", function(event) {
            if (event.key === "Enter") {
                event.preventDefault();
                const firstSuggestion = suggestions.select("div.suggestion-item");
                if (!firstSuggestion.empty()) {
                    const name = firstSuggestion.text();
                    input.property("value", name);
                    suggestions.style("display", "none").html("");
                    goToBillionaire(name);
                }
            }
        });

        return container;
    },
    onRemove: function (map) {
        // Cleanup code if needed when removing the control
    }
});

// Create an instance of the custom search control
const searchControl = new SearchControl({ position: 'topleft' });

/*********************************************
 *  Initialize the Leaflet map
 *********************************************/
const map = L.map("map", {
    center: [20, 0],
    zoom: 2,
    minZoom: 2,
    maxZoom: 10,
    worldCopyJump: false,
    maxBoundsViscosity: 1.0
});

/*********************************************
 *  Clippy Initialization
 *********************************************/
const clippy = new Clippy({
    defaultImage: 'css/images/clippy.gif',
    defaultText: "Hey there! Ready to explore? Click an icon on the map to pick a billionaire, you might need to zoom in a bit because there are so many of them! You can also filter them by net worth, search for your favorite, or hit the random button and I'll pick one for you!",
    bubblePosition: 'top'
});

const nextButton = document.querySelector('.scroll-button');

/*********************************************
 *  Tile Layer (OpenStreetMap)
 *********************************************/
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a>"
}).addTo(map);

/*********************************************
 *  Add the Search Control to the Map
 *********************************************/
map.addControl(searchControl);

/*********************************************
 *  Marker Cluster Group
 *********************************************/
const markers = L.markerClusterGroup();
map.addLayer(markers);

/*********************************************
 *  Tooltip for Hover Info (Using D3)
 *********************************************/
const tooltip = d3.select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("position", "absolute")
    .style("background", "white")
    .style("padding", "5px")
    .style("border", "1px solid black")
    .style("border-radius", "5px")
    .style("box-shadow", "2px 2px 10px rgba(0,0,0,0.2)")
    .style("pointer-events", "none")
    .style("z-index", "1000")
    .style("visibility", "hidden");

/*********************************************
 *  Load CSV Data and Create Markers
 *********************************************/
d3.csv("data/cleaned_forbes_billionaires.csv").then(data => {
    // Parse geometry for lat/lon and format net worth
    data.forEach(d => {
        const match = d.geometry.match(/POINT \(([-\d.]+) ([-\d.]+)\)/);
        if (match) {
            d.lon = +match[1];
            d.lat = +match[2];
        }
        d.NetWorth = parseFloat(d.NetWorth);
    });

    // Create markers with appropriate icons and assign a category based on net worth
    data.forEach(d => {
        billionaireNames.push(d.Name);

        let icon, category;
        if (d.NetWorth >= 1 && d.NetWorth < 5) {
            icon = billionaireIcons.low;
            category = "low";
        } else if (d.NetWorth >= 5 && d.NetWorth < 10) {
            icon = billionaireIcons.mid;
            category = "mid";
        } else if (d.NetWorth >= 10 && d.NetWorth < 50) {
            icon = billionaireIcons.high;
            category = "high";
        } else {
            icon = billionaireIcons.ultra;
            category = "ultra";
        }

        const marker = L.marker([d.lat, d.lon], { icon: icon });
        marker.category = category; // assign custom property for filtering
        nameToMarker[d.Name] = marker;
        allMarkers.push(marker); // add marker to global array for filtering

        // Marker click event to fetch profile and update Clippy
        marker.on("click", () => {
            eventDispatcher.call("billionaireSelected", this, d);
            fetchBillionaireProfile(d, marker);
            clippy.setImage('css/images/clippy2.gif');
            clippy.setText("You selected a billionaire! When you are ready, press Next to see more info.");
            if (nextButton) {
                clippy.showRelativeToElement(nextButton, { offsetX: -10, offsetY: 120 });
            }
        });

        markers.addLayer(marker);
    });
});

/*********************************************
 *  Class: Legend (L.control)
 *  -------------------------
 *  A Leaflet control that displays a clickable legend
 *  for filtering markers by net worth range, plus a reset button.
 *********************************************/
const legend = L.control({ position: 'bottomleft' });

legend.onAdd = function (map) {
    // Create container for the legend
    const div = L.DomUtil.create('div', 'info legend');
    div.style.background = 'white';
    div.style.padding = '10px';
    div.style.border = '1px solid #ccc';
    div.style.borderRadius = '5px';
    div.style.cursor = 'pointer';

    // Title for the legend
    div.innerHTML += '<strong>Net Worth Filter</strong><br><br>';

    // Store icon elements for later update
    const legendIcons = {};

    // Define legend items with key, label, and icon URL
    const legendItems = [
        { key: "low", label: "$1B - $5B", icon: "css/images/markerlow.svg" },
        { key: "mid", label: "$5B - $10B", icon: "css/images/markermid.svg" },
        { key: "high", label: "$10B - $50B", icon: "css/images/markerhigh.svg" },
        { key: "ultra", label: "$50B+", icon: "css/images/markerultra.svg" }
    ];

    // Create a container for each legend item
    legendItems.forEach(item => {
        const itemDiv = document.createElement("div");
        itemDiv.style.display = "flex";
        itemDiv.style.alignItems = "center";
        itemDiv.style.marginBottom = "5px";
        itemDiv.style.userSelect = "none";

        // Create the icon element
        const iconEl = document.createElement("i");
        iconEl.style.background = `url(${item.icon}) no-repeat center center`;
        iconEl.style.backgroundSize = "contain";
        iconEl.style.width = "35px";
        iconEl.style.height = "35px";
        iconEl.style.display = "inline-block";
        iconEl.style.transition = "opacity 0.3s";
        legendIcons[item.key] = iconEl;

        // Create the label element
        const labelEl = document.createElement("span");
        labelEl.style.marginLeft = "8px";
        labelEl.textContent = item.label;

        // Append icon and label to the item container
        itemDiv.appendChild(iconEl);
        itemDiv.appendChild(labelEl);

        // Add click event to toggle filter state for this category
        itemDiv.addEventListener("click", function() {
            activeFilters[item.key] = !activeFilters[item.key];
            // Update opacity to indicate active (1) vs inactive (0.3)
            iconEl.style.opacity = activeFilters[item.key] ? "1" : "0.2";
            updateMarkerVisibility();
        });

        // Append the legend item to the legend container
        div.appendChild(itemDiv);
    });

    // Create a Reset Filters button
    const resetButton = document.createElement("button");
    resetButton.textContent = "Reset Filters";
    resetButton.style.width = "100%";
    resetButton.style.padding = "5px";
    resetButton.style.marginTop = "10px";
    resetButton.style.cursor = "pointer";
    resetButton.addEventListener("click", function() {
        // Reset all filters to true
        Object.keys(activeFilters).forEach(key => {
            activeFilters[key] = true;
            // Reset icon opacity for each category
            if (legendIcons[key]) {
                legendIcons[key].style.opacity = "1";
            }
        });
        updateMarkerVisibility();
    });
    div.appendChild(resetButton);

    return div;
};

// Add the legend to the map
legend.addTo(map);

/*********************************************
 *  Position Clippy near the Random button
 *********************************************/
const randomBtn = document.querySelector('#randomButton');
if (randomBtn) {
    clippy.showRelativeToElement(randomBtn, { offsetX: -10, offsetY: -450 });
}

/*********************************************
 *  goToBillionaire (helper function)
 *  ---------------------------------
 *  Zooms to the marker for a given name.
 *********************************************/
function goToBillionaire(name) {
    const marker = nameToMarker[name];
    if (!marker) {
        console.warn("No marker found for:", name);
        return;
    }
    markers.zoomToShowLayer(marker, () => {
        marker.fire("click");
    });
}

/*********************************************
 *  fetchBillionaireProfile
 *  -----------------------
 *  Fetch the billionaire's profile data,
 *  then bind a popup with the image/info.
 *********************************************/
function fetchBillionaireProfile(d, marker) {
    let cleanedName = cleanName(d.Name);
    let profileUrl = `https://forbes-api.vercel.app/profile/${cleanedName}`;
    let proxyUrl = 'https://corsproxy.io/?url='; // Bypass CORS restrictions

    fetch(proxyUrl + encodeURIComponent(profileUrl))
        .then(response => response.json())
        .then(apiData => {
            let photoUrl = (apiData && apiData.name) ? apiData.photo : null;
            const popupHtml = `
                <h3>${d.Name}</h3>
                ${photoUrl
                ? `<img src="${photoUrl}" alt="Billionaire Image" style="width:150px; height:150px;
                           border-radius:10px; display:block; margin-bottom:10px;">`
                : "<p><em>No Image Available</em></p>"
            }
                <p><strong>Net Worth:</strong> $${d.NetWorth}B</p>
                <p><strong>Country:</strong> ${d.Country}</p>
                <p><strong>Industry:</strong> ${d.Source}</p>
                <p><strong>Rank:</strong> #${d.Rank}</p>
                <p><strong>Age:</strong> ${d.Age}</p>
                <p><strong>Citizenship:</strong> ${d.Citizenship}</p>
            `;
            marker.bindPopup(popupHtml, {
                maxWidth: 300,
                autoPan: true,
                keepInView: true,
                autoPanPadding: L.point(50, 50)
            }).openPopup();
        })
        .catch(error => {
            console.error("Error fetching profile:", error);
            const fallbackHtml = `
                <h3>${d.Name}</h3>
                <p><em>Failed to load image.</em></p>
                <p><strong>Net Worth:</strong> $${d.NetWorth}B</p>
                <p><strong>Country:</strong> ${d.Country}</p>
                <p><strong>Industry:</strong> ${d.Source}</p>
                <p><strong>Rank:</strong> #${d.Rank}</p>
                <p><strong>Age:</strong> ${d.Age}</p>
                <p><strong>Citizenship:</strong> ${d.Citizenship}</p>
            `;
            marker.bindPopup(fallbackHtml, {
                maxWidth: 300,
                autoPan: true,
                keepInView: true,
                autoPanPadding: L.point(50, 50)
            }).openPopup();
        });
}

/*********************************************
 *  cleanName (utility function)
 *  ----------------------------
 *  Prepares a name for use with the Forbes API.
 *********************************************/
function cleanName(name) {
    return name
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Remove accents
        .replace(/&.*$/, "") // Remove "& family" or similar
        .replace(/[^a-zA-Z0-9\s-]/g, "") // Remove special characters
        .trim() // Remove extra spaces
        .toLowerCase() // Convert to lowercase
        .replace(/\s+/g, "-"); // Replace spaces with hyphens
}

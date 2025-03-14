let nameToMarker = {};
let billionaireNames = [];

// Create a searchbox for billionaires
const SearchControl = L.Control.extend({
    onAdd: function (map) {
        // Create an empty container for the control
        const container = L.DomUtil.create("div", "leaflet-bar leaflet-control leaflet-control-custom");
        container.style.background = "white";
        container.style.padding = "8px";
        container.style.cursor = "auto";
        container.style.minWidth = "220px";

        L.DomEvent.disableClickPropagation(container);
        L.DomEvent.disableScrollPropagation(container);

        const d3Container = d3.select(container);

        // Search Input
        const input = d3Container
            .append("input")
            .attr("type", "text")
            .attr("placeholder", "Search Billionaire...")
            .style("width", "100%")
            .style("margin-bottom", "5px")
            .style("padding", "5px");

        // Random Button
        const randomButton = d3Container
            .append("button")
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

        // Suggestions container
        const suggestions = d3Container
            .append("div")
            .style("border", "1px solid #ccc")
            .style("background", "white")
            .style("display", "none")
            .style("max-height", "120px")
            .style("overflow-y", "auto");

        // Handle user typing
        input.on("input", function(event) {
            const query = this.value.trim().toLowerCase();
            suggestions.html(""); // clear previous suggestions

            if (!query) {
                suggestions.style("display", "none");
                return;
            }

            // Filter billionaireNames for matches
            const filtered = billionaireNames.filter(name =>
                name.toLowerCase().includes(query)
            );

            if (filtered.length === 0) {
                suggestions.style("display", "none");
                return;
            }

            suggestions.style("display", "block");

            const items = suggestions
                .selectAll("div.suggestion-item")
                .data(filtered, d => d);

            // ENTER selection
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
                    // On suggestion click
                    input.property("value", name);
                    suggestions.style("display", "none").html("");
                    goToBillionaire(name);
                })
                .text(d => d);

            // EXIT selection
            items.exit().remove();
        });

        // Handle ENTER key
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
    }
});

// Add the custom search control to the top-left corner
const searchControl = new SearchControl({ position: 'topleft' });

// Initialize the Leaflet map
const map = L.map("map", {
    center: [20, 0],
    zoom: 2,
    minZoom: 2,
    maxZoom: 10,
    worldCopyJump: false,
    maxBoundsViscosity: 1.0
});

// Add OpenStreetMap tile layer
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    noWrap: true,
    attribution:
        "&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors"
}).addTo(map);

// Add search control
map.addControl(searchControl);

// Create a marker cluster group
const markers = L.markerClusterGroup({
});
    map.addLayer(markers);

// Create a tooltip for displaying billionaire name and net worth on hover
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

// Load billionaire data from CSV
d3.csv("data/cleaned_forbes_billionaires.csv").then(data => {
    // Parse latitude and longitude
    data.forEach(d => {
        const match = d.geometry.match(/POINT \(([-\d.]+) ([-\d.]+)\)/);
        if (match) {
            d.lon = +match[1];
            d.lat = +match[2];
        }
    });

    // Create a marker for each billionaire and add it to the cluster group
    data.forEach(d => {
        billionaireNames.push(d.Name);

        const marker = L.marker([d.lat, d.lon]);
        nameToMarker[d.Name] = marker;

        marker.on("click", () => {
            eventDispatcher.call("billionaireSelected", this, d);
            fetchBillionaireProfile(d, marker);
        });

        // Hover tooltip
        marker.on("mouseover", function(e) {
            tooltip.style("visibility", "visible")
                .html(`<strong>${d.Name}</strong><br>Net Worth: $${d.NetWorth}B`);
        });
        marker.on("mouseout", function() {
            tooltip.style("visibility", "hidden");
        });
        marker.on("mousemove", function(e) {
            const tooltipWidth = 150;
            const xPos = e.originalEvent.pageX + 15;
            const yPos = e.originalEvent.pageY - 20;
            const adjustedX = (xPos + tooltipWidth > window.innerWidth)
                ? (e.originalEvent.pageX - tooltipWidth - 15)
                : xPos;
            tooltip.style("left", adjustedX + "px")
                .style("top", yPos + "px");
        });

        markers.addLayer(marker);
    });
});

/**
 * Called when the user selects a suggestion from the search box.
 * Zooms and opens that marker's popup.
 */
function goToBillionaire(name) {
    const marker = nameToMarker[name];
    if (!marker) {
        console.warn("No marker found for:", name);
        return;
    }

    // Expand the cluster and open the popup once the marker is visible
    markers.zoomToShowLayer(marker, () => {
        marker.fire("click");
    });
}

/**
 * Fetch the billionaire's profile, then show a Leaflet popup with the image.
 */
function fetchBillionaireProfile(d, marker) {
    let cleanedName = cleanName(d.Name);
    let profileUrl = `https://forbes-api.vercel.app/profile/${cleanedName}`;
    let proxyUrl = 'https://corsproxy.io/?url='; // Bypass CORS restrictions

    fetch(proxyUrl + encodeURIComponent(profileUrl))
        .then(response => response.json())
        .then(apiData => {
            let photoUrl = apiData && apiData.name ? apiData.photo : null;
            const popupHtml = `
                <h3>${d.Name}</h3>
                ${
                photoUrl
                    ? `<img src="${photoUrl}" alt="Billionaire Image" style="width:150px; height:150px; border-radius:10px; display:block; margin-bottom:10px;">`
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
            const popupHtml = `
                <h3>${d.Name}</h3>
                <p><em>Failed to load image.</em></p>
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
        });
}

// A utility function to clean names for the forbes-api
function cleanName(name) {
    return name
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Remove accents
        .replace(/&.*$/, "") // Remove "& family"
        .replace(/[^a-zA-Z0-9\s-]/g, "") // Remove special characters
        .trim() // Remove extra spaces
        .toLowerCase() // Convert to lowercase
        .replace(/\s+/g, "-"); // Replace spaces with hyphens
}

// Initialize the Leaflet map
const map = L.map("map", {
    center: [20, 0],
    zoom: 2,
    minZoom: 2,
    maxZoom: 8,
    worldCopyJump: false,
    maxBounds: [
        [-85, -180],
        [85, 180]
    ],
    maxBoundsViscosity: 1.0
});

// Add OpenStreetMap
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors"
}).addTo(map);

// Create an SVG overlay for D3 elements
L.svg().addTo(map);
const overlay = d3.select(map.getPanes().overlayPane).select("svg");
const g = overlay.append("g").attr("class", "leaflet-zoom-hide");

// Create a tooltip for displaying billionaire name and net worth
const tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("position", "absolute")
    .style("background", "white")
    .style("padding", "5px")
    .style("border", "1px solid black")
    .style("border-radius", "5px")
    .style("box-shadow", "2px 2px 10px rgba(0,0,0,0.2)")
    .style("pointer-events", "none")
    .style("z-index", "1000") // Ensure tooltip stays above the map
    .style("visibility", "hidden");

// Load billionaire data from CSV
d3.csv("data/cleaned_forbes_billionaires.csv").then(data => {
    // Parse latitude and longitude from the 'geometry' column
    data.forEach(d => {
        const match = d.geometry.match(/POINT \(([-\d.]+) ([-\d.]+)\)/);
        if (match) {
            d.lon = +match[1]; // Longitude
            d.lat = +match[2]; // Latitude
        }
    });

    // convert latitude and longitude to Leaflet map coordinates
    function projectPoint(lon, lat) {
        const point = map.latLngToLayerPoint(new L.LatLng(lat, lon));
        return [point.x, point.y];
    }

    // Add circles for each billionaire location
    const points = g.selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("fill", "red")
        .attr("opacity", 0.7)
        .attr("stroke", "black")
        .attr("stroke-width", 0.5)
        .style("pointer-events", "auto")
        .on("mouseover", function (event, d) {
            d3.select(this).transition().duration(200).attr("fill", "orange");

            // Display tooltip with billionaire's name and net worth
            tooltip.style("visibility", "visible")
                .html(`<strong>${d.Name}</strong><br>Net Worth: $${d.NetWorth}B`);
        })
        .on("mousemove", function (event) {
            moveTooltip(event);
        })
        .on("mouseout", function () {
            d3.select(this).transition().duration(200).attr("fill", "red");
            tooltip.style("visibility", "hidden");
        })
        .on("click", (event, d) => {
            fetchBillionaireProfile(d);
        });

    // Update positions of circles when the map is zoomed or moved
    function updatePositions() {
        points.attr("cx", d => projectPoint(d.lon, d.lat)[0])
            .attr("cy", d => projectPoint(d.lon, d.lat)[1])
            .attr("r", d => Math.max(5, 1 * map.getZoom()));
    }

    // Update circle positions when the map view changes
    map.on("zoomend moveend", updatePositions);
    updatePositions();
});

// Function to reposition the tooltip with mouse
function moveTooltip(event) {
    const tooltipWidth = 150;
    const xPos = event.pageX + 15;
    const yPos = event.pageY - 20;

    const adjustedX = (xPos + tooltipWidth > window.innerWidth)
        ? (event.pageX - tooltipWidth - 15)
        : xPos;

    tooltip.style("left", `${adjustedX}px`)
        .style("top", `${yPos}px`);
}

// Fetch billionaire profile from API and display in a popup
function fetchBillionaireProfile(d) {
    let cleanedName = cleanName(d.Name);
    let profileUrl = `https://forbes-api.vercel.app/profile/${cleanedName}`;
    let proxyUrl = 'https://corsproxy.io/?url='; // Bypass CORS restrictions

    fetch(proxyUrl + encodeURIComponent(profileUrl))
        .then(response => response.json())
        .then(data => {
            if (data.name) {
                showPopup(d, data.photo);
            } else {
                showPopup(d, null); // No image available
            }
        })
        .catch(error => {
            console.error("Error fetching profile:", error);
            showPopup(d, null);
        });
}

// Function to clean billionaire names for API search
function cleanName(name) {
    return name
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Remove accents
        .replace(/&.*$/, "") // Remove "& family"
        .replace(/[^a-zA-Z0-9\s-]/g, "") // Remove special characters
        .trim() // Remove extra spaces
        .toLowerCase() // Convert to lowercase
        .replace(/\s+/g, "-"); // Replace spaces with hyphens
}

// display billionaire profile in a popup
function showPopup(d, photoUrl) {
    // Remove existing popup if it exists
    const existingPopup = document.getElementById("popup-container");
    if (existingPopup) {
        existingPopup.remove();
    }

    // Create popup container
    const popup = document.createElement("div");
    popup.id = "popup-container";
    popup.style.position = "fixed";
    popup.style.left = "50%";
    popup.style.top = "50%";
    popup.style.transform = "translate(-50%, -50%)";
    popup.style.background = "white";
    popup.style.padding = "20px";
    popup.style.border = "1px solid black";
    popup.style.boxShadow = "0px 4px 6px rgba(0,0,0,0.1)";
    popup.style.zIndex = "1000";
    popup.style.borderRadius = "8px";
    popup.style.textAlign = "center";

    // Display billionaire's details along with the photo (if available)
    popup.innerHTML = `
        <h3>${d.Name}</h3>
        ${photoUrl ? `<img src="${photoUrl}" alt="Billionaire Image" style="width:150px; height:150px; border-radius:10px;">` : "<p><em>No Image Available</em></p>"}
        <p><strong>Net Worth:</strong> $${d.NetWorth}B</p>
        <p><strong>Country:</strong> ${d.Country}</p>
        <p><strong>Industry:</strong> ${d.Source}</p>
        <p><strong>Rank:</strong> #${d.Rank}</p>
        <p><strong>Age:</strong> ${d.Age}</p>
        <p><strong>Residence:</strong> ${d.Residence}</p>
        <p><strong>Citizenship:</strong> ${d.Citizenship}</p>
        <p><strong>Marital Status:</strong> ${d.Status}</p>
        <p><strong>Children:</strong> ${d.Children}</p>
        <p><strong>Education:</strong> ${d.Education}</p>
        <p><strong>Self-Made:</strong> ${d.Self_made}</p>
        <button id="close-popup" style="display: block; margin-top: 10px; padding: 5px 10px; background: red; color: white; border: none; cursor: pointer;">Close</button>
    `;

    document.body.appendChild(popup);

    // Close popup when clicking outside
    setTimeout(() => {
        document.addEventListener("click", closePopupOutside);
    }, 50);

    document.getElementById("close-popup").addEventListener("click", () => {
        popup.remove();
        document.removeEventListener("click", closePopupOutside);
    });

    function closePopupOutside(event) {
        if (!popup.contains(event.target)) {
            popup.remove();
            document.removeEventListener("click", closePopupOutside);
        }
    }
}

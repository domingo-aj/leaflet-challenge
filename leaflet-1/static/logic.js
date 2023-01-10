var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

function colorAssign(dep) {
    return dep > 90 ? '#4a5bfa':
        dep > 70 ? '#a1aaf8':
            dep > 50 ? '#afb6f9':
                dep > 30 ? '#bcc2fa':
                     dep > 10 ? '#d7dbfc':
                        '#e4e7fd';    
};

function createFeatures(earthquakeData) {
    function onEachFeature(feature, layer) {
        layer.bindPopup(`<h3> ${feature.properties.place} </h3><hr>
        <p>Date: ${new Date(feature.properties.time)}</p>
        <p>Mag: ${feature.properties.mag}</p>
        <p>Depth: ${feature.geometry.coordinates[2]}`);
    };

    function circleLayer(feature, latlng) {
        var e_markers = {
            radius: feature.properties.mag * 40000,
            fillOpacity: 0.75,
            color: 'grey',
            fillColor: colorAssign(feature.geometry.coordinates[2]),
            weight: 1
        }

        return L.circle(latlng, e_markers)

    };

    var earthquakes = L.geoJSON(earthquakeData, {
        onEachFeature: onEachFeature,
        pointToLayer: circleLayer
    });

    createMap(earthquakes);
};


function createMap(earthquakes) {

    // Create the base layers.
    var street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    })

    var topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
    });

    // Create a baseMaps object.
    var baseMaps = {
        "Street Map": street,
        "Topographic Map": topo
    };

    // Create an overlay object to hold our overlay.
    var overlayMaps = {
        Earthquakes: earthquakes
    };

    // Create our map, giving it the streetmap and earthquakes layers to display on load.
    var myMap = L.map("map", {
        center: [
            37.09, -95.71
        ],
        zoom: 3,
        layers: [street, earthquakes]
    });

    L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
    }).addTo(myMap);

    var info = L.control({ position: "bottomright" });
    info.onAdd = function (map) {
        var div = L.DomUtil.create("div", "legend"),
            depth = [-10, 10, 30, 50, 70, 90];
        for (var i = 0; i < depth.length; i++){
            div.innerHTML +=
                '<i style="background:' + colorAssign(depth[i] + 1) + '"></i> ' +
                depth[i] + (depth[i + 1] ? '&ndash;' + depth[i + 1] + '<br>' : '+');
        }
        return div;
    };
    // Add the info legend to the map.
    info.addTo(myMap);
};

d3.json(queryUrl).then(function (data) {
    // Once we get a response, send the data.features object to the createFeatures function.
    createFeatures(data.features);
});


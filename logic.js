// weekly usgs earthquake data & tectonic plates url link


sismos = "data/all_week_quakes.json";  //too slow, changed to .json file

placas = "data/PB2002_boundaries.json"  //not much of a change, but better.

// Perform a GET request to the query URL
d3.json(sismos, function(data) {
    d3.json(placas, function(platedata) {
        var layers={
            earthquake:get_quakes(data),
            faultline:get_faults(platedata)
        };
    });
  // Once we get a response, send the data.features object to the createFeatures function
  createFeatures(data.features);
});


function createFeatures(earthquakeData) {
    // radius increment, depending on magnitud.
    function radiusSize(magnitude){
        return magnitude *33000
    }
    // color of circle depnding on mag (mtd)  "Thank you BTroolin, i forgot about this"
    function circleColor(magnitude) {
        if (magnitude < 1) {
          return "#ccff33"
        }
        else if (magnitude < 2) {
          return "#ffff33"
        }
        else if (magnitude < 3) {
          return "#ffcc33"
        }
        else if (magnitude < 4) {
          return "#ff9933"
        }
        else if (magnitude < 5) {
          return "#ff6633"
        }
        else {
          return "#ff3333"
        }
      }

  // Define a function we want to run once for each feature in the features array
  // Give each feature a popup describing the place and time of the earthquake
  function onEachFeature(feature, layer) {
    layer.bindPopup("<h3>" + feature.properties.place +"<br>Magnitud:" +  feature.properties.mag
     + "<br>Depth:" +  feature.geometry.coordinates[2] +
      "</h3><hr><p>" + new Date(feature.properties.time) + "</p>");
  }

  // Create a GeoJSON layer containing the features array on the earthquakeData object
  // Run the onEachFeature function once for each piece of data in the array
  var earthquakes = L.geoJSON(earthquakeData, {
    pointToLayer: function(earthquakeData, latlng) {
      return L.circle(latlng, {
        radius: radiusSize(earthquakeData.properties.mag),
        color: circleColor(earthquakeData.properties.mag),
        fillOpacity: 1
      });
    },
    onEachFeature: onEachFeature
  });
  // Sending our earthquakes layer to the createMap function
  createMap(earthquakes);
}

function createMap(earthquakes) {
 
  // Define streetmap and darkmap layers
  var grayscalemap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.navigation-guidance-night-v4",
    accessToken: API_KEY
  });

  var darkmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "light-v9",
    accessToken: API_KEY
  });

  // Create the faultline layer
  var faultline = new L.LayerGroup();

  // Query to retrieve the faultline data
  var faultlinequery = "data/PB2002_boundaries.json";

  // Create the faultlines and add them to the faultline layer
  d3.json(faultlinequery, function(data) {
    L.geoJSON(data, {
      style: function() {
        return {color: "orange", fillOpacity: 2}
      }
    }).addTo(faultline)
  })
  // Define a baseMaps object to hold our base layers
  var baseMaps = {
    //"Grayscale map": grayscalemap,
    "Map": darkmap
  };

  // Create overlay object to hold our overlay layer
  var overlayMaps = {
    Earthquakes: earthquakes,
    Faultlines: faultline
  };

  // Create our map, giving it the streetmap and earthquakes layers to display on load
  var myMap = L.map("map", {
    center: [
      -33.011995, -71.553980
    ],
    zoom: 2,
    layers: [grayscalemap,darkmap, earthquakes,faultline]
  });
  

  // Create a layer control
  // Pass in our baseMaps and overlayMaps
  // Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);
   
}

// endpoint
var earthquakeURL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

var tectonicPlatesURL = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json";

// query URL
d3.json(earthquakeURL, function(data) {
  createFeatures(data.features);
});

function createFeatures(earthquakeData) {

  var earthquake = L.geoJSON(earthquakeData, {
    onEachFeature: function(feature, layer) {
      layer.bindPopup("<h3>Earthquake Magnitude: " + feature.properties.mag +"</h3><h1>Location: "+ feature.properties.place +
        "</h1><hr><p>" + new Date(feature.properties.time) + "</p>");
    },
    
    pointToLayer: function (feature, latlong) {
      return new L.circle(latlong,
        {radius: getRadius(feature.properties.mag),
        fillColor: getColor(feature.properties.mag),
        fillOpacity: .6,
        color: "#000",
        stroke: true,
        weight: .8
    })
  }
  });

  createMap(earthquake);
}
// used public access token for API
function createMap(earthquake) {
    var outdoors = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/outdoors-v10/tiles/256/{z}/{x}/{y}?" +
      "access_token=pk.eyJ1IjoiZGJhZG9uZyIsImEiOiJjazQyMnA4djkwN3JuM21vMGJsYjQ1amo4In0.tNcyiDISLOR3k6wihGdA2w");
  
    var satellite = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/satellite-v9/tiles/256/{z}/{x}/{y}?" +
      "access_token=pk.eyJ1IjoiZGJhZG9uZyIsImEiOiJjazQyMnA4djkwN3JuM21vMGJsYjQ1amo4In0.tNcyiDISLOR3k6wihGdA2w");

    var darkmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/dark-v9/tiles/256/{z}/{x}/{y}?" +
      "access_token=pk.eyJ1IjoiZGJhZG9uZyIsImEiOiJjazQyMnA4djkwN3JuM21vMGJsYjQ1amo4In0.tNcyiDISLOR3k6wihGdA2w");
  
    var baseMaps = {
      "Outdoor": outdoors,
      "Satellite": satellite,
      "Dark Mode": darkmap
    };

    var tectonicPlates = new L.LayerGroup();

    var overlayMaps = {
      "Earthquakes": earthquake,
      "Tectonic Plates": tectonicPlates
    };

    var myMap = L.map("map", {
      center: [
        37.09, -95.71],
      zoom: 3.25,
      layers: [outdoors, earthquake, tectonicPlates]
    }); 

    d3.json(tectonicPlatesURL, function(plateData) {
      L.geoJson(plateData, {
        color: "yellow",
        weight: 2
      })
      .addTo(tectonicPlates);
  });

    L.control.layers(baseMaps, overlayMaps, {
      collapsed: false
    }).addTo(myMap);


  var legend = L.control({position: 'bottomleft'});

    legend.onAdd = function(myMap){
      var div = L.DomUtil.create('div', 'info legend'),
        grades = [0, 1, 2, 3, 4, 5],
        labels = [];
    for (var i = 0; i < grades.length; i++) {
        div.innerHTML +=
            '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
            grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
    }
    return div;
  };

  legend.addTo(myMap);
}
     function getColor(d){
    return d > 5 ? "#f3e8ee":
    d  > 4 ? "#bacdb0":
    d > 3 ? "#729b79":
    d > 2 ? "#475b63":
    d > 1 ? "#2e2c2f":
             "ffcca5";
  }
  function getRadius(value){
    return value*25000
  }
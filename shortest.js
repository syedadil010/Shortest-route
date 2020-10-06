//api global variable
var geocoder;
var directionsRendererObject;
var markers = [];
var totalDistance;
var directionsService;
var map;
var origin = "2661 Rue Allard, Montreal, Quebec";
var points = ["Concordia University, Montreal, Quebec", "2250 Rue Guy, Montreal, Quebec", "2150 Rue St Marc, Montreal, Quebec", "1439 B St Mathieu St, Montreal, Quebec"];

function calculateDistance() {
    for (let i = 0; i < markers.length; i++) {
        markers[i].setMap(null);
    }
    var distancematrixService = new google.maps.DistanceMatrixService();
    distancematrixService.getDistanceMatrix({
        origins: [origin],
        destinations: points,
        travelMode: google.maps.TravelMode.DRIVING,
        avoidHighways: false,
        avoidTolls: false
    }, callback);

}

function callback(response, status) {
    if (status != google.maps.DistanceMatrixStatus.OK) {
        alert("Sorry, it was an error: " + status);
    } else {
        var routes = response.rows[0];
        var sortable = [];
        for (let i = routes.elements.length - 1; i >= 0; i--) {
            var routeLength = routes.elements[i].distance.value;
            sortable.push([points[i], routeLength]);
        }

        sortable.sort(function(a, b) {
            return a[1] - b[1];
        });

        var waypoints = new Array();

        for (var j = 0; j < sortable.length - 1; j++) {
            console.log(sortable[j][0]);
            waypoints.push({
                location: sortable[j][0],
                stopover: true
            });
        }
        var start = origin;
        var end = sortable[sortable.length - 1][0];
        calcRoute(start, end, waypoints);
    }
}

function initMap() {
    directionsService = new google.maps.DirectionsService();
    directionsRendererObject = new google.maps.DirectionsRenderer();
    geocoder = new google.maps.Geocoder();
    var mapOptions = {
        center: new google.maps.LatLng(45.450780, -73.596254),
        zoom: 12,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        draggableCursor: "crosshair"
    };
    map = new google.maps.Map(document.getElementById("map"),
        mapOptions);
    directionsRendererObject.setMap(map);
    codeAddress(origin, "Origin");
    for (let f = 0; f < points.length; f++) {
        codeAddress(points[f], f + 1);
    }
}

function codeAddress(address, title) {
    //  var address = document.getElementById('address').value;
    geocoder.geocode({
        'address': address
    }, function(results, status) {
        if (status == 'OK') {
            map.setCenter(results[0].geometry.location);
            var marker = new google.maps.Marker({
                map: map,
                position: results[0].geometry.location,
                label: String(title)
            });
            markers.push(marker);
        } else {
            alert('Error : ' + status);
        }
    });
}

function calcRoute(start, end, waypoints) { 
    var request = {
        origin: start,
        destination: end,
        waypoints: waypoints,
        optimizeWaypoints: true,
        travelMode: google.maps.TravelMode.DRIVING
    };
    directionsService.route(request, function(response, status) {
        if (status == google.maps.DirectionsStatus.OK) {
            directionsRendererObject.setDirections(response);
            var route = response.routes[0];
            totalDistance = 0;
            for (let i = 0; i < route.legs.length; i++) {
                totalDistance += route.legs[i].distance.value;
            }
            alert("Shortest Route Distance: " + totalDistance / 1000 + "km")
        }
    });
}
google.maps.event.addDomListener(window, 'load', initMap); 
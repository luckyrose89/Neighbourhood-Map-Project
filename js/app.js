// Create global variables accessible throught app
var map;
var largeInfowindow;

// Create error message for maps API
var errorMessage = function errorAlert() {
    alert("Unable to load Google Maps API. Inconvenience is regretted!!");
};

var viewModel = function() {
    var self = this;
    this.markers = [];
    this.searchBar = ko.observable("");


    // Function to populate infowindow
    this.populateInfoWindow = function(marker, infowindow) {
        if (infowindow.marker != marker) {
            infowindow.marker = marker;
            // Create an API call to Foursquare
            // Create reference to marker titles for wikipedia URLs
            self.markerName = marker.title;
            infowindow.setContent('');
            var clientId = "KJH15443VNKN2Q2X1X2UZAUXW0IBUMYNHLRCHSO2FBFCOSY1";
            var client_secret = "Z1HMJKPCTLJEJPDO5MXXMD1JYWWD21NZPKURBHPV5T2TAIYM";
            var api_url = 'https://api.foursquare.com/v2/venues/search?ll=' +
                marker.lat + ',' + marker.lng + '&client_id=' + clientId +
                '&client_secret=' + client_secret + '&query=' + marker.title +
                '&v=20180305' + '&m=foursquare';

            $.getJSON(api_url).done(function(marker) {
                var data = marker.response.venues[0];
                self.category = data.categories[0].name;
                self.name = data.name;
                self.address = data.location.formattedAddress[0];
                self.infourl = 'https://en.wikipedia.org/wiki/' + self.markerName;
                self.infoContent = '<div>' +
                    '<h5>' + self.name + '</h5>' +
                    '</div>' +
                    '<div class="category">' + self.category + '</div>' +
                    '<div>' + self.address + '</div>' +
                    '<div><a href="' + self.infourl + '">Know More</a></div>';

                infowindow.setContent(self.infoContent);

            }).fail(function() {
                alert("An error occurred while loading the Foursquare API. Try reloading the page.");
            });

            infowindow.open(map, marker);
            // Make sure the marker property is cleared if the infowindow is closed.
            infowindow.addListener('closeclick', function() {
                infowindow.setMarker = null;
            });
        }
    };

    // Render infowindows on click
    this.renderInfo = function() {
        self.populateInfoWindow(this, largeInfowindow);
        this.setAnimation(google.maps.Animation.BOUNCE);
        setTimeout((function() {
            this.setAnimation(null);
        }).bind(this), 1500);
    };

    /* Initialize the map */
    this.initMap = function() {
        var mapArea = document.getElementById('map');
        var mapInput = {
            center: new google.maps.LatLng(24.571270, 73.691544),
            styles: mapStyle,
            zoom: 13
        };
        // Constructor creates a new map - only center and zoom are required.
        map = new google.maps.Map(mapArea, mapInput);

        // Create info Window
        largeInfowindow = new google.maps.InfoWindow();
        var bounds = new google.maps.LatLngBounds();

        //Functionality to create a marker on the map
        // Import locations from dataModel.js
        var dataArray = mapMarkers;
        var marker;
        for (var i = 0; i < dataArray.length; i++) {
            marker = new google.maps.Marker({
                position: dataArray[i].location,
                map: map,
                title: dataArray[i].name,
                lat: dataArray[i].location.lat,
                lng: dataArray[i].location.lng,
                animation: google.maps.Animation.DROP
            });
            marker.setMap(map);
            self.markers.push(marker);
            marker.addListener('click', self.renderInfo);
            bounds.extend(marker.position);
        }
        map.fitBounds(bounds);
    };
    this.initMap();

    //Function to filter and display search list
    this.searchFilterList = ko.computed(function() {
        var searchLocations = [];
        for (var i = 0; i < this.markers.length; i++) {
            var currentLoc = this.markers[i];
            var input = currentLoc.title.toLowerCase();
            if (input.includes(this.searchBar().toLowerCase())) {
                searchLocations.push(currentLoc);
                this.markers[i].setVisible(true);
            } else {
                this.markers[i].setVisible(false);
            }
        }
        return searchLocations;
    }, this);

};

function launchApp() {
    ko.applyBindings(new viewModel());
}

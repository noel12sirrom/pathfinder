// Contributors:
// Shavon Scale - 2008093
// Hueland Hunter - 2006702
// Brandon Bent - 2106015
// Leon Morris - 2111686

let placeNames = [];
let totalDistance;
let totalDuration;
let selectedRoadOptions = [];
let selectedRouteOption = "";


function initMap() {
    directionsService = new google.maps.DirectionsService();
    directionsRenderer = new google.maps.DirectionsRenderer();
    const trafficLayer = new google.maps.TrafficLayer();
    // The map, centered at Kingston
    const kingston = { lat: 17.9714, lng: -76.7936 };
    const map = new google.maps.Map(document.getElementById("map"), {
        zoom: 8,
        center: kingston,
        styles: []
    });

    directionsRenderer.setMap(map);
    trafficLayer.setMap(map);

    const onChangeHandler = function () {
        calculateAndDisplayRoute(directionsService, directionsRenderer);
        const costMap = document.getElementById('costMap');
        const prefer = document.querySelector('.route-option .gradient-btn').textContent;
        console.log(prefer);
        if (prefer === 'Shortest Time' && costMap) {
            costMap.textContent = totalDuration;
        }
        else if (prefer === 'Shortest Distance' && costMap) {
            costMap.textContent = totalDistance;
          }
      };

    // Observe text changes in dropdowns since they are spans, we have to use mutations to check for changes
    
    function observeTextChange(selector) {
        const targetNode = document.querySelector(selector);
        if (!targetNode) return; // Exit if element is not found
    
        const observer = new MutationObserver(() => {
            console.log(`Text changed: ${targetNode.textContent}`);
            onChangeHandler(); // Call your function when the text changes
        });
    
        observer.observe(targetNode, { childList: true, subtree: true });
    }
    
    // Observe text changes in both dropdown spans
    observeTextChange('.dropdown:first-child .dropdown-btn span');
    observeTextChange('.dropdown:last-child .dropdown-btn span');

    document.addEventListener("roadOptionsUpdated", (event) => {
        selectedRoadOptions = event.detail;
        onChangeHandler();
    });
    document.addEventListener("routeOptionUpdated", (event) => {
        selectedRouteOption = event.detail;
        onChangeHandler();
    });

    
}

function calculateAndDisplayRoute(directionsService, directionsRenderer) {
    const startcoords = document.querySelector('.dropdown:first-child .dropdown-btn span').getAttribute('data-value').trim();
    const endcoords= document.querySelector('.dropdown:last-child .dropdown-btn span').getAttribute('data-value').trim();
    const start = startcoords.split(',');
    const end = endcoords.split(',');

    const org = { lat: parseFloat(start[0]), lng: parseFloat(start[1]) };
    const dest = { lat: parseFloat(end[0]), lng: parseFloat(end[1])};
    
    const avoidHighways = selectedRoadOptions.includes('Highway');
    const avoidTolls = false;

    directionsService
        .route({
            origin: org,
            destination: dest,
            travelMode: google.maps.TravelMode.DRIVING,
            avoidHighways: false,  
            avoidTolls: false,
        })
        .then((response) => {
            directionsRenderer.setDirections(response);

            const route = response.routes[0];
            totalDistance = route.legs[0].distance.text; 
            totalDuration = route.legs[0].duration.text;

        // Dispatch the event with all required data
            const routeDataEvent = new CustomEvent("routeDataUpdated", {
                detail: {
                    totalDistance,
                    totalDuration
                }
            });
            document.dispatchEvent(routeDataEvent);
            
        })
        .catch((e) => {
            console.error("Directions request failed:", e);
            alert("Could not calculate route. Please try again.");
        });
}


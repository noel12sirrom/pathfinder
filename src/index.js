// Contributors:
// Shavon Scale - 2008093
// Hueland Hunter - 2006702
// Brandon Bent - 2106015
// Leon Morris - 2111686

tailwind.config = {
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#1a1a1f',
          surface: '#252530',
          input: '#32323e',
          border: '#3f3f4e'
        },
        accent: {
          primary: '#6366f1', // Indigo
          secondary: '#8b5cf6', // Violet
          success: '#10b981', // Emerald
          danger: '#ef4444'  // Red
        }
      },
      boxShadow: {
        'inner-glow': 'inset 0 1px 2px 0 rgba(255, 255, 255, 0.05)',
        'outer-glow': '0 4px 20px 0 rgba(99, 102, 241, 0.15)'
      }
    }
  }
};

export let selectedRoadOptions = [];
let totalDistance = null;
let totalDuration = null;
let routePath = null;
let steps = null;

function renderRoutes(path, cost, leg, algorithm = 'Unknown') {
  const resultContainer = document.getElementById('results');
  const amount = document.getElementById('cost');
  
  if (!resultContainer) {
    console.error('Results container not found!');
    return;
  }
  
  // Update cost header with algorithm info
  if (amount) {
    amount.innerHTML = `${cost} Total <span class="text-xs font-normal opacity-75">(${algorithm})</span>`;
  }
  
  // Clear previous results
  resultContainer.innerHTML = '';
  
  // Validate data
  if (!path || !Array.isArray(path) || path.length === 0) {
    resultContainer.innerHTML = '<p class="text-red-400">Invalid path data</p>';
    return;
  }
  
  if (!leg || !Array.isArray(leg) || leg.length === 0) {
    resultContainer.innerHTML = '<p class="text-red-400">Invalid leg data</p>';
    return;
  }
  
  // Create journey container
  const journeyContainer = document.createElement('div');
  journeyContainer.classList.add('space-y-4', 'p-2');
  
  // Create route segments
  for (let i = 0; i < path.length - 1; i++) {
    if (!leg[i]) {
      console.warn(`Missing leg data for segment ${i}`);
      continue;
    }
    
    const start = path[i];
    const end = path[i + 1];
    
    const item = document.createElement('div');
    item.classList.add('route-item', 'relative', 'mb-4');
    
    // Item content
    item.innerHTML = `
      <div class="bg-dark-surface p-4 rounded-xl shadow-inner-glow border border-dark-border/50 hover:border-accent-primary/30 transition-colors duration-300">
        <div class="flex justify-between items-center gap-2 mb-2">
          <div class="flex items-center gap-2">
            <div class="w-6 h-6 rounded-full bg-accent-primary/10 flex items-center justify-center flex-shrink-0">
              <span class="text-accent-primary text-sm font-semibold">${i + 1}</span>
            </div>
            <h3 class="text-white font-medium text-sm break-words">${start}</h3>
          </div>
          <div class="bg-dark-input/50 px-3 py-1 rounded-full text-gray-300 text-xs font-medium whitespace-nowrap">
            ${leg[i].distance_km} km
          </div>
        </div>
        
        <div class="flex items-center text-gray-400 text-xs mt-3 justify-center flex-wrap gap-2">
          <div class="flex items-center gap-2 bg-dark-input/30 px-2 py-1 rounded-full">
            <svg class="w-3 h-3 text-accent-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <span>${leg[i].time_min} min</span>
          </div>
          <div class="flex items-center gap-2 bg-dark-input/30 px-2 py-1 rounded-full">
            <span>Status: ${leg[i].status || 'N/A'}</span>
          </div>
        </div>
        
        <div class="mt-3 pt-3 border-t border-dark-border/30">
          <div class="flex items-center gap-2 mb-2">
            <svg class="w-4 h-4 text-accent-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"></path>
            </svg>
            <span class="text-gray-400 text-xs font-medium">Road Types:</span>
          </div>
          <div class="flex flex-wrap gap-2">
            ${(() => {
              const roadTypes = Array.isArray(leg[i].road_type) ? leg[i].road_type : (leg[i].road_type ? [leg[i].road_type] : []);
              const typeColors = {
                'paved': 'bg-green-500/20 text-green-400 border-green-500/30',
                'unpaved': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
                'broken_cisterns': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
                'deep_potholes': 'bg-red-500/20 text-red-400 border-red-500/30'
              };
              const typeLabels = {
                'paved': 'Paved',
                'unpaved': 'Unpaved',
                'broken_cisterns': 'Broken Cisterns',
                'deep_potholes': 'Deep Potholes'
              };
              return roadTypes.map(type => {
                const colorClass = typeColors[type] || 'bg-gray-500/20 text-gray-400 border-gray-500/30';
                const label = typeLabels[type] || type;
                return `<span class="px-2 py-1 rounded-full text-xs font-medium border ${colorClass}">${label}</span>`;
              }).join('');
            })()}
            ${Array.isArray(leg[i].road_type) && leg[i].road_type.length === 0 ? '<span class="text-gray-500 text-xs">N/A</span>' : ''}
          </div>
        </div>
        
        <div class="flex items-center gap-2 mt-3">
          <div class="w-6 h-6 rounded-full bg-accent-secondary/10 flex items-center justify-center flex-shrink-0">
            <span class="text-accent-secondary text-sm font-semibold">${i + 2}</span>
          </div>
          <h3 class="text-white font-medium text-sm break-words">${end}</h3>
        </div>
      </div>
      
      ${i < path.length - 2 ? `
        <div class="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-0.5 h-4 bg-gradient-to-b from-accent-primary/20 via-accent-secondary/20 to-accent-primary/20 rounded-full"></div>
      ` : ''}
    `;
    
    journeyContainer.appendChild(item);
  }
  
  // Final destination
  if (path.length > 0) {
    const finalItem = document.createElement('div');
    finalItem.classList.add('final-destination', 'flex', 'items-center', 'gap-3', 'mt-4', 'p-3', 'bg-dark-surface/50', 'rounded-lg');
    
    finalItem.innerHTML = `
      <svg class="w-5 h-5 text-accent-success flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
      </svg>
      <div>
        <div class="text-gray-400 text-xs">Final Destination</div>
        <h3 class="text-white font-bold text-base">${path[path.length - 1]}</h3>
      </div>
    `;
    
    journeyContainer.appendChild(finalItem);
  }
  
  resultContainer.appendChild(journeyContainer);
}

// Test server connection
async function testServerConnection() {
  try {
    const response = await fetch('http://127.0.0.1:5000/health', {
      method: 'GET',
      mode: 'cors'
    });
    if (response.ok) {
      const data = await response.json();
      console.log('Server connection OK:', data);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Server connection test failed:', error);
    return false;
  }
}

async function update()  {
  const startLocation = document.querySelector('.dropdown:first-child .dropdown-btn span').textContent.trim();
  const endLocation = document.querySelector('.dropdown:last-child .dropdown-btn span').textContent.trim();

  if (startLocation === 'Start' || endLocation === 'End') {
    console.log('Please select both start and end locations');
    // Clear results if locations not selected
    const resultContainer = document.getElementById('results');
    if (resultContainer) {
      resultContainer.innerHTML = '<p class="text-gray-400">Please select both start and end locations</p>';
    }
    return;
  }

  // Test server connection first
  const serverOnline = await testServerConnection();
  if (!serverOnline) {
    const resultContainer = document.getElementById('results');
    if (resultContainer) {
      resultContainer.innerHTML = `
        <p class="text-red-400">Service temporarily unavailable. Please try again later.</p>
      `;
    }
    return;
  }

  // Get selected route option (default to "Shortest Time" if none selected)
  const routeOptionBtn = document.querySelector('.route-option.gradient-btn');
  const routeType = routeOptionBtn ? routeOptionBtn.textContent.trim() : 'Shortest Time';
  
  // If no route option is selected, default to first option
  if (!routeOptionBtn) {
    const firstRouteOption = document.querySelector('.route-option');
    if (firstRouteOption) {
      firstRouteOption.classList.add('gradient-btn', 'from-accent-primary', 'to-accent-secondary', 'text-white', 'border-transparent', 'shadow-md');
      firstRouteOption.classList.remove('bg-dark-surface', 'text-gray-300', 'border-dark-border');
    }
  }
  
  // Get selected road options
  let selectedRoadOptions = [];
  document.querySelectorAll('.road-option.gradient-btn').forEach(option => {
    selectedRoadOptions.push(option.textContent.trim());
  });
  
  // Try to get Google Maps data if available (non-blocking)
  try {
    const routeDataEvent = new Promise((resolve) => {
      const handler = (event) => {
        totalDistance = event.detail.totalDistance;
        totalDuration = event.detail.totalDuration;
        resolve();
      };
      document.addEventListener("routeDataUpdated", handler, { once: true });
      // Timeout after 2 seconds if event doesn't fire
      setTimeout(() => resolve(), 2000);
    });
    await routeDataEvent;
  } catch (e) {
    console.log('Google Maps data not available, proceeding without it');
  }
  
  const jsonData = {
    startLocation,
    endLocation,
    routeType,
    selectedRoadOptions,
    totalDistance: totalDistance || null,
    totalDuration: totalDuration || null,
  };
  
  console.log('Fetching route with data:', jsonData);
  
  // Show loading state
  const resultContainer = document.getElementById('results');
  if (resultContainer) {
    resultContainer.innerHTML = '<p class="text-gray-400">Calculating route...</p>';
  }
  
  const serverUrl = 'http://127.0.0.1:5000/route';
  console.log('Fetching from:', serverUrl);
  
  fetch(serverUrl, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify(jsonData),
    mode: 'cors'
  })
  .then(response => {
    console.log('Response status:', response.status, response.statusText);
    console.log('Response headers:', response.headers);
    
    if (!response.ok) {
      // Try to get error message from response
      return response.text().then(text => {
        console.error('Error response:', text);
        let errorData;
        try {
          errorData = JSON.parse(text);
        } catch (e) {
          errorData = { error: text || `Server error: ${response.status} ${response.statusText}` };
        }
        return Promise.reject(errorData);
      });
    }
    return response.json();
  })
  .then(data => { 
    console.log('Route data received:', data);
    
    if (data.error) {
      const resultContainer = document.getElementById('results');
      if (resultContainer) {
        // Check if it's a "no path found" error
        if (data.error.toLowerCase().includes('no path') || data.error.toLowerCase().includes('no route')) {
          resultContainer.innerHTML = `<p class="text-gray-400 text-center">No route found with the given constraints.</p>`;
        } else {
        resultContainer.innerHTML = `<p class="text-red-400">Error: ${data.error}</p>`;
        }
      }
    } else if (data.path && data.leg) {
      console.log('Path:', data.path);
      console.log('Cost:', data.cost);
      console.log('Legs:', data.leg);
      console.log('Algorithm:', data.algorithm);
      renderRoutes(data.path, data.cost, data.leg, data.algorithm);
    } else {
      const resultContainer = document.getElementById('results');
      if (resultContainer) {
        resultContainer.innerHTML = '<p class="text-gray-400">No route data received.</p>';
      }
    }
  })
  .catch(error => {
    console.error('Error fetching route:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    
    const resultContainer = document.getElementById('results');
    if (resultContainer) {
      let errorMsg = 'Unable to calculate route. ';
      
      if (error.error) {
        // Check if it's a "no path found" error
        if (error.error.toLowerCase().includes('no path') || error.error.toLowerCase().includes('no route')) {
          errorMsg = 'No route found with the given constraints.';
        } else {
        errorMsg += error.error;
        }
      } else if (error.message && error.message.includes('Failed to fetch')) {
        errorMsg = 'Service temporarily unavailable. Please try again later.';
      } else if (error.message) {
        errorMsg += error.message;
      } else {
        errorMsg = 'An error occurred. Please try again.';
      }
      
      resultContainer.innerHTML = `<p class="text-gray-400 text-center">${errorMsg}</p>`;
    }
  });
};



  // Load locations from backend and populate dropdowns
  async function loadLocations() {
    try {
      const response = await fetch('http://127.0.0.1:5000/locations', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        mode: 'cors'
      });

      if (!response.ok) {
        throw new Error('Failed to load locations');
      }

      const data = await response.json();
      
      if (data.locations && data.locations.length > 0) {
        populateLocationDropdowns(data.locations);
        attachLocationEventListeners();
      } else {
        // Show error message if no locations found
        const startContainer = document.getElementById('startLocationOptions');
        const endContainer = document.getElementById('endLocationOptions');
        if (startContainer) startContainer.innerHTML = '<p class="text-red-400 text-center py-4">No locations found</p>';
        if (endContainer) endContainer.innerHTML = '<p class="text-red-400 text-center py-4">No locations found</p>';
      }
    } catch (error) {
      console.error('Error loading locations:', error);
      const startContainer = document.getElementById('startLocationOptions');
      const endContainer = document.getElementById('endLocationOptions');
      if (startContainer) startContainer.innerHTML = '<p class="text-red-400 text-center py-4">Error loading locations</p>';
      if (endContainer) endContainer.innerHTML = '<p class="text-red-400 text-center py-4">Error loading locations</p>';
    }
  }

  // Expose loadLocations globally so admin panel can trigger refresh
  window.refreshLocations = loadLocations;

  // Listen for route updates from admin panel via localStorage
  window.addEventListener('storage', function(e) {
    if (e.key === 'routesUpdated') {
      console.log('Routes updated, refreshing locations...');
      loadLocations();
    }
  });

  // Also listen for custom events (for same-tab updates)
  document.addEventListener('routesUpdated', function() {
    console.log('Routes updated, refreshing locations...');
    loadLocations();
  });

  // Populate location dropdowns
  function populateLocationDropdowns(locations) {
    const startContainer = document.getElementById('startLocationOptions');
    const endContainer = document.getElementById('endLocationOptions');
    
    if (!startContainer || !endContainer) {
      console.error('Location containers not found');
      return;
    }

    // Clear existing content
    startContainer.innerHTML = '';
    endContainer.innerHTML = '';

    // Sort locations alphabetically
    const sortedLocations = [...locations].sort((a, b) => a.name.localeCompare(b.name));

    // Populate both dropdowns with the same locations
    sortedLocations.forEach(location => {
      // Only add if coordinates are available
      if (location.coords) {
        const option = document.createElement('div');
        option.className = 'dropdown-option hover:text-accent-primary';
        option.textContent = location.name;
        option.setAttribute('data-value', location.coords);
        
        // Clone for end location dropdown
        const endOption = option.cloneNode(true);
        
        startContainer.appendChild(option);
        endContainer.appendChild(endOption);
      }
    });

    // If no locations with coordinates, show message
    if (startContainer.children.length === 0) {
      startContainer.innerHTML = '<p class="text-gray-400 text-center py-4">No locations available</p>';
      endContainer.innerHTML = '<p class="text-gray-400 text-center py-4">No locations available</p>';
    }
  }

  // Attach event listeners to location options
  function attachLocationEventListeners() {
    const locationOptions = document.querySelectorAll('.dropdown-option');
    locationOptions.forEach(option => {
      // Remove existing listeners by cloning and replacing
      const newOption = option.cloneNode(true);
      option.parentNode.replaceChild(newOption, option);
      
      // Add new listener
      newOption.addEventListener('click', function() {
        const selectedValue = this.textContent.trim();
        const selectedCoords = this.getAttribute('data-value');
        const dropdownBtn = this.closest('.dropdown').querySelector('.dropdown-btn span');
        
        if (dropdownBtn && selectedCoords) {
          // Update button text with selected location
          dropdownBtn.textContent = selectedValue;
          dropdownBtn.setAttribute('data-value', selectedCoords);
          
          // Hide dropdown after selection
          this.closest('.dropdown-content').classList.remove('show');
          this.closest('.dropdown').querySelector('.dropdown-btn').classList.remove('active');
          update();
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function() {
    // Load locations first, then set up dropdowns
    loadLocations();
    
    // Dropdown functionality
    const dropdownBtns = document.querySelectorAll('.dropdown-btn');

    
    dropdownBtns.forEach(btn => {
      btn.addEventListener('click', function(e) {
        e.stopPropagation();
        const dropdownContent = this.nextElementSibling;
        
        // Toggle dropdown visibility
        if (dropdownContent.classList.contains('show')) {
          dropdownContent.classList.remove('show');
          this.classList.remove('active');
        } else {
          // Close all other dropdowns first
          document.querySelectorAll('.dropdown-content').forEach(content => {
            content.classList.remove('show');
          });
          document.querySelectorAll('.dropdown-btn').forEach(button => {
            button.classList.remove('active');
          });
          
          dropdownContent.classList.add('show');
          this.classList.add('active');
        }
      });
    });
    
    // Route option selection (Shortest Distance/Time)
    const routeOptions = document.querySelectorAll('.route-option');
    routeOptions.forEach(button => {
      button.addEventListener('click', function() {
        routeOptions.forEach(btn => {
          btn.classList.remove('gradient-btn', 'from-accent-primary', 'to-accent-secondary', 'text-white', 'border-transparent', 'shadow-md');
          btn.classList.add('bg-dark-surface', 'text-gray-300', 'border-dark-border');
        });
        
        this.classList.remove('bg-dark-surface', 'text-gray-300', 'border-dark-border');
        this.classList.add('gradient-btn', 'from-accent-primary', 'to-accent-secondary', 'text-white', 'border-transparent', 'shadow-md');

        let selectedRouteOption = document.querySelector('.route-option.gradient-btn');
    
        document.dispatchEvent(new CustomEvent("routeOptionUpdated", { detail: selectedRouteOption }));
        update();
      });
    });
    
    // Road option selection (toggle)
    const roadOptions = document.querySelectorAll('.road-option');
    roadOptions.forEach(button => {
      button.addEventListener('click', function() {
        if (this.classList.contains('bg-dark-surface')) {
          this.classList.remove('bg-dark-surface', 'text-gray-300', 'border-dark-border');
          this.classList.add('gradient-btn', 'from-accent-primary', 'to-accent-secondary', 'text-white', 'border-transparent', 'shadow-md');
        } else {
          this.classList.remove('gradient-btn', 'from-accent-primary', 'to-accent-secondary', 'text-white', 'border-transparent', 'shadow-md');
          this.classList.add('bg-dark-surface', 'text-gray-300', 'border-dark-border');
        }

        // Get selected road options and add them to a list to be sent to maps.js
        selectedRoadOptions = [];
        document.querySelectorAll('.road-option.gradient-btn').forEach(option => {
          selectedRoadOptions.push(option.textContent.trim());
        });
        document.dispatchEvent(new CustomEvent("roadOptionsUpdated", { detail: selectedRoadOptions }));
        //console.log(selectedRoadOptions);


        update();
      });
    });
    
    
    // Close dropdowns when clicking outside
    document.addEventListener('click', function() {
      document.querySelectorAll('.dropdown-content').forEach(content => {
        content.classList.remove('show');
      });
      document.querySelectorAll('.dropdown-btn').forEach(button => {
        button.classList.remove('active');
      });
   });

  });




  


  
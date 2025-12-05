// Admin Panel JavaScript
// Password: 1234
//
// Contributors:
// Shavon Scale - 2008093
// Hueland Hunter - 2006702
// Brandon Bent - 2106015
// Leon Morris - 2111686

const ADMIN_PASSWORD = '1234';
let currentEditingRoute = null;
let currentDeletingRoute = null;

// Check if user is authenticated
function checkAuth() {
  return sessionStorage.getItem('adminAuthenticated') === 'true';
}

// Password protection
document.addEventListener('DOMContentLoaded', function() {
  const passwordModal = document.getElementById('passwordModal');
  const adminContent = document.getElementById('adminContent');
  const passwordInput = document.getElementById('passwordInput');
  const passwordSubmit = document.getElementById('passwordSubmit');
  const passwordError = document.getElementById('passwordError');
  const logoutBtn = document.getElementById('logoutBtn');

  // Check if already authenticated
  if (checkAuth()) {
    passwordModal.classList.add('hidden');
    adminContent.classList.remove('hidden');
    loadRoutes();
  } else {
    passwordModal.classList.remove('hidden');
    adminContent.classList.add('hidden');
  }

  // Password submission
  passwordSubmit.addEventListener('click', function() {
    if (passwordInput.value === ADMIN_PASSWORD) {
      sessionStorage.setItem('adminAuthenticated', 'true');
      passwordModal.classList.add('hidden');
      adminContent.classList.remove('hidden');
      loadRoutes();
    } else {
      passwordError.classList.remove('hidden');
      passwordInput.value = '';
      passwordInput.focus();
    }
  });

  // Enter key on password input
  passwordInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      passwordSubmit.click();
    }
  });

  // Logout
  logoutBtn.addEventListener('click', function() {
    sessionStorage.removeItem('adminAuthenticated');
    passwordModal.classList.remove('hidden');
    adminContent.classList.add('hidden');
    passwordInput.value = '';
    passwordError.classList.add('hidden');
  });

  // Add route button
  document.getElementById('addRouteBtn').addEventListener('click', addRoute);
  
  // Refresh routes button
  document.getElementById('refreshRoutesBtn').addEventListener('click', loadRoutes);
  
  // Edit modal buttons
  document.getElementById('saveEditBtn').addEventListener('click', saveEdit);
  document.getElementById('cancelEditBtn').addEventListener('click', closeEditModal);
  
  // Delete modal buttons
  document.getElementById('confirmDeleteBtn').addEventListener('click', confirmDelete);
  document.getElementById('cancelDeleteBtn').addEventListener('click', closeDeleteModal);
});

// Load all routes
async function loadRoutes() {
  const routesList = document.getElementById('routesList');
  routesList.innerHTML = '<p class="text-gray-400 text-center py-8">Loading routes...</p>';

  try {
    const response = await fetch('http://127.0.0.1:5000/admin/routes', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      mode: 'cors'
    });

    if (!response.ok) {
      throw new Error('Failed to load routes');
    }

    const data = await response.json();
    
    if (data.routes && data.routes.length > 0) {
      displayRoutes(data.routes);
    } else {
      routesList.innerHTML = '<p class="text-gray-400 text-center py-8">No routes found.</p>';
    }
  } catch (error) {
    console.error('Error loading routes:', error);
    routesList.innerHTML = `<p class="text-red-400 text-center py-8">Error loading routes: ${error.message}</p>`;
  }
}

// Display routes
function displayRoutes(routes) {
  const routesList = document.getElementById('routesList');
  routesList.innerHTML = '';

  routes.forEach((route, index) => {
    const routeCard = document.createElement('div');
    routeCard.className = 'bg-dark-surface p-4 rounded-lg border border-dark-border hover:border-accent-primary/30 transition-colors';
    
    // Format condition display
    const conditionDisplay = Array.isArray(route.condition) 
      ? route.condition.map(c => c.replace('_', ' ')).join(', ')
      : (route.condition || 'N/A').replace('_', ' ');
    
    routeCard.innerHTML = `
      <div class="flex justify-between items-start mb-3">
        <div class="flex-1">
          <h3 class="text-white font-semibold text-lg mb-2">
            ${route.from} → ${route.to}
          </h3>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <div>
              <span class="text-gray-400">Distance:</span>
              <span class="text-white ml-2">${route.distance} km</span>
            </div>
            <div>
              <span class="text-gray-400">Time:</span>
              <span class="text-white ml-2">${route.time} min</span>
            </div>
            <div>
              <span class="text-gray-400">Condition:</span>
              <span class="text-white ml-2 capitalize">${conditionDisplay}</span>
            </div>
            <div>
              <span class="text-gray-400">Status:</span>
              <span class="text-white ml-2 capitalize ${route.status === 'open' ? 'text-accent-success' : 'text-accent-danger'}">${route.status}</span>
            </div>
          </div>
        </div>
        <div class="flex gap-2 ml-4">
          <button 
            class="edit-route-btn bg-accent-primary text-white px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
            data-index="${index}"
          >
            Edit
          </button>
          <button 
            class="delete-route-btn bg-accent-danger text-white px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
            data-index="${index}"
          >
            Delete
          </button>
        </div>
      </div>
    `;

    routeCard.querySelector('.edit-route-btn').addEventListener('click', function() {
      openEditModal(route, index);
    });

    routeCard.querySelector('.delete-route-btn').addEventListener('click', function() {
      openDeleteModal(route);
    });

    routesList.appendChild(routeCard);
  });
}

// Add new route
async function addRoute() {
  const fromLocation = document.getElementById('newFromLocation').value.trim();
  const toLocation = document.getElementById('newToLocation').value.trim();
  const distance = parseFloat(document.getElementById('newDistance').value);
  const time = parseFloat(document.getElementById('newTime').value);
  const condition = document.getElementById('newCondition').value;
  const status = document.getElementById('newStatus').value;
  const messageEl = document.getElementById('addRouteMessage');

  // Validation
  if (!fromLocation || !toLocation) {
    messageEl.textContent = 'Please enter both from and to locations.';
    messageEl.className = 'mt-4 text-sm text-red-400';
    return;
  }

  if (isNaN(distance) || distance <= 0) {
    messageEl.textContent = 'Please enter a valid distance.';
    messageEl.className = 'mt-4 text-sm text-red-400';
    return;
  }

  if (isNaN(time) || time <= 0) {
    messageEl.textContent = 'Please enter a valid time.';
    messageEl.className = 'mt-4 text-sm text-red-400';
    return;
  }

  try {
    const response = await fetch('http://127.0.0.1:5000/admin/routes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: fromLocation,
        to: toLocation,
        distance: distance,
        time: time,
        condition: condition,
        status: status
      }),
      mode: 'cors'
    });

    const data = await response.json();

    if (response.ok) {
      messageEl.textContent = 'Route added successfully!';
      messageEl.className = 'mt-4 text-sm text-accent-success';
      
      // Clear form
      document.getElementById('newFromLocation').value = '';
      document.getElementById('newToLocation').value = '';
      document.getElementById('newDistance').value = '';
      document.getElementById('newTime').value = '';
      document.getElementById('newCondition').value = 'paved';
      document.getElementById('newStatus').value = 'open';
      
      // Reload routes
      setTimeout(() => {
        loadRoutes();
        messageEl.textContent = '';
        // Notify main page to refresh locations via localStorage
        localStorage.setItem('routesUpdated', Date.now().toString());
        localStorage.removeItem('routesUpdated'); // Trigger storage event
        // Also dispatch for same window (if admin is in same tab)
        document.dispatchEvent(new CustomEvent('routesUpdated'));
      }, 1500);
    } else {
      messageEl.textContent = `Error: ${data.error || 'Failed to add route'}`;
      messageEl.className = 'mt-4 text-sm text-red-400';
    }
  } catch (error) {
    console.error('Error adding route:', error);
    messageEl.textContent = `Error: ${error.message}`;
    messageEl.className = 'mt-4 text-sm text-red-400';
  }
}

// Open edit modal
function openEditModal(route, index) {
  currentEditingRoute = { ...route, index };
  
  // Handle condition - if it's an array, take the first one (or default to paved)
  let conditionValue = 'paved';
  if (Array.isArray(route.condition) && route.condition.length > 0) {
    conditionValue = route.condition[0];
  } else if (typeof route.condition === 'string') {
    conditionValue = route.condition;
  }
  
  document.getElementById('editFromLocation').value = route.from;
  document.getElementById('editToLocation').value = route.to;
  document.getElementById('editDistance').value = route.distance;
  document.getElementById('editTime').value = route.time;
  document.getElementById('editCondition').value = conditionValue;
  document.getElementById('editStatus').value = route.status;
  
  document.getElementById('editRouteMessage').textContent = '';
  document.getElementById('editModal').classList.remove('hidden');
}

// Close edit modal
function closeEditModal() {
  document.getElementById('editModal').classList.add('hidden');
  currentEditingRoute = null;
}

// Save edited route
async function saveEdit() {
  if (!currentEditingRoute) return;

  const fromLocation = document.getElementById('editFromLocation').value.trim();
  const toLocation = document.getElementById('editToLocation').value.trim();
  const distance = parseFloat(document.getElementById('editDistance').value);
  const time = parseFloat(document.getElementById('editTime').value);
  const condition = document.getElementById('editCondition').value;
  const status = document.getElementById('editStatus').value;
  const messageEl = document.getElementById('editRouteMessage');

  // Validation
  if (!fromLocation || !toLocation) {
    messageEl.textContent = 'Please enter both from and to locations.';
    messageEl.className = 'mb-4 text-sm text-red-400';
    return;
  }

  if (isNaN(distance) || distance <= 0) {
    messageEl.textContent = 'Please enter a valid distance.';
    messageEl.className = 'mb-4 text-sm text-red-400';
    return;
  }

  if (isNaN(time) || time <= 0) {
    messageEl.textContent = 'Please enter a valid time.';
    messageEl.className = 'mb-4 text-sm text-red-400';
    return;
  }

  try {
    const response = await fetch('http://127.0.0.1:5000/admin/routes', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        oldFrom: currentEditingRoute.from,
        oldTo: currentEditingRoute.to,
        from: fromLocation,
        to: toLocation,
        distance: distance,
        time: time,
        condition: condition,
        status: status
      }),
      mode: 'cors'
    });

    const data = await response.json();

    if (response.ok) {
      messageEl.textContent = 'Route updated successfully!';
      messageEl.className = 'mb-4 text-sm text-accent-success';
      
      // Reload routes and close modal
      setTimeout(() => {
        loadRoutes();
        closeEditModal();
        // Notify main page to refresh locations via localStorage
        localStorage.setItem('routesUpdated', Date.now().toString());
        localStorage.removeItem('routesUpdated'); // Trigger storage event
        // Also dispatch for same window (if admin is in same tab)
        document.dispatchEvent(new CustomEvent('routesUpdated'));
      }, 1500);
    } else {
      messageEl.textContent = `Error: ${data.error || 'Failed to update route'}`;
      messageEl.className = 'mb-4 text-sm text-red-400';
    }
  } catch (error) {
    console.error('Error updating route:', error);
    messageEl.textContent = `Error: ${error.message}`;
    messageEl.className = 'mb-4 text-sm text-red-400';
  }
}

// Open delete modal
function openDeleteModal(route) {
  currentDeletingRoute = route;
  const deleteConfirmText = document.getElementById('deleteConfirmText');
  deleteConfirmText.textContent = `Are you sure you want to delete the route from "${route.from}" to "${route.to}"? This action cannot be undone.`;
  document.getElementById('deleteModal').classList.remove('hidden');
}

// Close delete modal
function closeDeleteModal() {
  document.getElementById('deleteModal').classList.add('hidden');
  currentDeletingRoute = null;
}

// Confirm delete
async function confirmDelete() {
  if (!currentDeletingRoute) return;

  try {
    const response = await fetch('http://127.0.0.1:5000/admin/routes', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: currentDeletingRoute.from,
        to: currentDeletingRoute.to
      }),
      mode: 'cors'
    });

    const data = await response.json();

    if (response.ok) {
      closeDeleteModal();
      // Show success message temporarily
      const routesList = document.getElementById('routesList');
      routesList.innerHTML = '<p class="text-accent-success text-center py-8">Route deleted successfully! Reloading...</p>';
      
      // Reload routes
      setTimeout(() => {
        loadRoutes();
        // Notify main page to refresh locations via localStorage
        localStorage.setItem('routesUpdated', Date.now().toString());
        localStorage.removeItem('routesUpdated'); // Trigger storage event
        // Also dispatch for same window (if admin is in same tab)
        document.dispatchEvent(new CustomEvent('routesUpdated'));
      }, 1000);
    } else {
      alert(`Error: ${data.error || 'Failed to delete route'}`);
    }
  } catch (error) {
    console.error('Error deleting route:', error);
    alert(`Error: ${error.message}`);
  }
}


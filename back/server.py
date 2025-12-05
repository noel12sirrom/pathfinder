"""
Contributors:
Shavon Scale - 2008093
Hueland Hunter - 2006702
Brandon Bent - 2106015
Leon Morris - 2111686
"""
from flask import Flask, request, jsonify, send_from_directory
import os
import sys
from flask_cors import CORS

# Set SWI_HOME_DIR if not already set
if not os.environ.get("SWI_HOME_DIR"):
    # Check common installation paths
    common_paths = [
        r"C:\Program Files\swipl",
        r"C:\Program Files (x86)\swipl",
        r"C:\swipl",
    ]
    for path in common_paths:
        if os.path.exists(path):
            os.environ["SWI_HOME_DIR"] = path
            break

# Import Janus
import janus_swi as janus

app = Flask(__name__)
CORS(app)  # Allow frontend requests

# Initialize Prolog and consult the graph file
graph_path = os.path.join(os.path.dirname(__file__), "graph.pl")
if not os.path.exists(graph_path):
    print(f"ERROR: graph.pl not found at {graph_path}")
    sys.exit(1)

# Initialize Prolog and consult the graph file
try:
    with janus.Query(f"consult('{graph_path.replace(chr(92), '/')}')") as query:
        query.next()
except Exception as e:
    print(f"ERROR: Failed to initialize Prolog: {e}")
    sys.exit(1)

def _pl_atom(value: str) -> str:
    """Escape single quotes for Prolog"""
    return value.replace("'", "''") if isinstance(value, str) else value

# Serve static files from src directory
@app.route('/')
def home():
    src_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'src')
    return send_from_directory(src_path, 'index.html')

@app.route('/<path:filename>')
def serve_static(filename):
    """Serve static files (JS, CSS, etc.) from src directory"""
    src_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'src')
    # Security: only allow certain file types
    allowed_extensions = ['.js', '.css', '.html', '.json', '.png', '.jpg', '.svg']
    if any(filename.endswith(ext) for ext in allowed_extensions):
        return send_from_directory(src_path, filename)
    return jsonify({"error": "File not found"}), 404

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({"status": "ok", "message": "Server is running"})

@app.route('/locations', methods=['GET'])
def get_locations():
    """Get all unique locations from routes with their coordinates"""
    try:
        # Get all routes to extract unique locations
        roads = parse_prolog_file()
        
        # Extract unique location names
        locations_set = set()
        for road in roads:
            locations_set.add(road['from'])
            locations_set.add(road['to'])
        
        # Query Prolog for coordinates of each location
        locations = []
        for loc_name in sorted(locations_set):
            try:
                query_str = f"location_coords('{_pl_atom(loc_name)}', Lat, Lon)"
                with janus.Query(query_str) as query:
                    for solution in query:
                        locations.append({
                            'name': loc_name,
                            'lat': float(solution["Lat"]),
                            'lon': float(solution["Lon"]),
                            'coords': f"{solution['Lat']},{solution['Lon']}"
                        })
                        break
            except Exception as e:
                # If coordinates not found, still include location but without coords
                print(f"Warning: No coordinates found for {loc_name}: {e}")
                locations.append({
                    'name': loc_name,
                    'lat': None,
                    'lon': None,
                    'coords': None
                })
        
        return jsonify({"locations": locations})
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

@app.route('/route', methods=['POST'])
def find_path():
    data = request.json
    start_location = data.get("startLocation")
    end_location = data.get("endLocation")
    route_type = data.get("routeType")
    selected_road_options = data.get("selectedRoadOptions", [])
    
    # Map route type to Prolog metric
    if route_type == "Shortest Time":
        metric = "time"
        unit = "minutes"  
    elif route_type == "Shortest Distance":
        metric = "distance"
        unit = "Km"
    else:  # No Optimization
        metric = "none"
        unit = "steps"  # BFS doesn't optimize, just finds a path
        
    # Map UI options to Prolog atoms
    option_map = {
        "Unpaved": "unpaved",
        "Broken cisterns": "broken_cisterns",
        "Deep potholes": "deep_potholes",
    }
    avoid_atoms = [option_map[o] for o in selected_road_options if o in option_map]
    avoid_list = "[" + ",".join(avoid_atoms) + "]"

    # Build and execute Prolog query using Janus
    s_loc = _pl_atom(start_location)
    e_loc = _pl_atom(end_location)
    query_str = f"route('{s_loc}', '{e_loc}', {metric}, {avoid_list}, Path, Distance, Time, Algorithm)"
    
    try:
        results = []
        with janus.Query(query_str) as query:
            for solution in query:
                results.append({
                    "Path": solution["Path"],
                    "Distance": solution["Distance"],
                    "Time": solution["Time"],
                    "Algorithm": str(solution["Algorithm"])
                })
                # Only get first result (best path)
                break
        
        if not results:
            return jsonify({"error": "No path found with given constraints."}), 404

        best = results[0]
        path = list(best["Path"])
        total_distance = float(best["Distance"])
        total_time = float(best["Time"])
        algorithm = best.get("Algorithm", "Unknown")
        
        # Build leg details by querying edge_info/6
        leg_details = []
        for i in range(len(path) - 1):
            a = path[i]
            b = path[i + 1]
            ei_query_str = f"edge_info('{_pl_atom(a)}', '{_pl_atom(b)}', D, T, C, S)"
            ei_results = []
            with janus.Query(ei_query_str) as ei_query:
                for solution in ei_query:
                    ei_results.append(solution)
                    break
            
            if ei_results:
                info = ei_results[0]
                # Handle conditions as list (convert Prolog list to Python list)
                conditions = info["C"]
                if isinstance(conditions, (list, tuple)):
                    conditions_list = [str(c) for c in conditions]
                else:
                    # Single condition (backward compatibility)
                    conditions_list = [str(conditions)]
                
                leg_details.append({
                    "from": a,
                    "to": b,
                    "distance_km": float(info["D"]),
                    "time_min": float(info["T"]),
                    "road_type": conditions_list,  # Now a list
                    "status": str(info["S"]),
                })

        # Calculate cost based on metric
        if metric == "time":
            cost_value = total_time
        elif metric == "distance":
            cost_value = total_distance
        else:  # No optimization - show both distance and time
            cost_value = f"{round(total_distance, 2)} km, {round(total_time, 2)} min"
        
        return jsonify({
            "path": path, 
            "cost": f"{cost_value} {unit}" if metric != "none" else str(cost_value), 
            "leg": leg_details,
            "algorithm": algorithm
        })
    except Exception as e:
        print(f"Error executing Prolog query: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": f"Error processing route: {str(e)}"}), 500

# Admin Panel Routes
def parse_prolog_file():
    """Parse the graph.pl file and extract all road facts"""
    import re
    roads = []
    try:
        with open(graph_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Use regex to match road facts: road('From', 'To', Distance, Time, Conditions, Status).
        # Pattern matches: road('...', '...', number, number, [condition1, condition2, ...], atom).
        # Handle both single conditions [paved] and multiple conditions [paved, unpaved]
        pattern = r"road\('([^']*(?:''[^']*)*)',\s*'([^']*(?:''[^']*)*)',\s*([\d.]+),\s*([\d.]+),\s*\[([^\]]+)\],\s*(\w+)\)\."
        
        matches = re.finditer(pattern, content)
        
        for match in matches:
            try:
                from_loc = match.group(1).replace("''", "'")  # Unescape single quotes
                to_loc = match.group(2).replace("''", "'")
                distance = float(match.group(3))
                time = float(match.group(4))
                conditions_str = match.group(5).strip()
                status = match.group(6)
                
                # Parse conditions list: split by comma and strip whitespace
                conditions = [c.strip() for c in conditions_str.split(',')] if conditions_str else []
                
                roads.append({
                    'from': from_loc,
                    'to': to_loc,
                    'distance': distance,
                    'time': time,
                    'condition': conditions,  # Now a list
                    'status': status
                })
            except (ValueError, IndexError) as e:
                print(f"Error parsing road fact: {e}")
                continue
    except Exception as e:
        print(f"Error parsing Prolog file: {e}")
        import traceback
        traceback.print_exc()
    
    return roads

def write_prolog_file(roads):
    """Write roads back to the graph.pl file"""
    import re
    try:
        with open(graph_path, 'r', encoding='utf-8') as f:
            lines = f.readlines()
        
        # Find where road definitions start and end
        road_start_idx = None
        road_end_idx = None
        
        # Look for comment markers or first road() line
        for i, line in enumerate(lines):
            if line.strip().startswith('road('):
                if road_start_idx is None:
                    road_start_idx = i
                road_end_idx = i + 1
            elif road_start_idx is not None and not line.strip().startswith('road(') and not line.strip().startswith('%') and line.strip():
                # Found non-road, non-comment, non-empty line after roads
                if i > road_start_idx + 5:  # Give some room
                    break
        
        # If markers not found, find first and last road() line
        if road_start_idx is None:
            for i, line in enumerate(lines):
                if line.strip().startswith('road('):
                    road_start_idx = i
                    break
        
        if road_end_idx is None:
            # Find last road() line
            for i in range(len(lines) - 1, -1, -1):
                if lines[i].strip().startswith('road('):
                    road_end_idx = i + 1
                    break
                elif lines[i].strip().startswith('%') and ('edge_info' in lines[i] or 'Bidirectional' in lines[i]):
                    road_end_idx = i
                    break
        
        if road_start_idx is None:
            road_start_idx = 0
        if road_end_idx is None:
            road_end_idx = len(lines)
        
        # Build new content
        new_lines = []
        
        # Add everything before roads
        new_lines.extend(lines[:road_start_idx])
        
        # Add all road facts
        for road in roads:
            from_loc = road['from'].replace("'", "''")  # Escape single quotes for Prolog
            to_loc = road['to'].replace("'", "''")
            # Handle condition as list (can be string for backward compatibility or list)
            condition = road['condition']
            if isinstance(condition, list):
                condition_str = '[' + ','.join(condition) + ']'
            else:
                # Backward compatibility: single condition becomes list
                condition_str = '[' + str(condition) + ']'
            road_line = f"road('{from_loc}', '{to_loc}', {road['distance']}, {road['time']}, {condition_str}, {road['status']}).\n"
            new_lines.append(road_line)
        
        # Add everything after roads
        new_lines.extend(lines[road_end_idx:])
        
        # Write back to file
        with open(graph_path, 'w', encoding='utf-8') as f:
            f.writelines(new_lines)
        
        # Reload Prolog file
        try:
            with janus.Query(f"consult('{graph_path.replace(chr(92), '/')}')") as query:
                query.next()
        except Exception as e:
            print(f"Warning: Could not reload Prolog file: {e}")
        
        return True
    except Exception as e:
        print(f"Error writing Prolog file: {e}")
        import traceback
        traceback.print_exc()
        return False

@app.route('/admin/routes', methods=['GET'])
def get_routes():
    """Get all routes"""
    try:
        roads = parse_prolog_file()
        return jsonify({"routes": roads})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/admin/routes', methods=['POST'])
def add_route():
    """Add a new route"""
    try:
        data = request.json
        from_loc = data.get('from')
        to_loc = data.get('to')
        distance = data.get('distance')
        time = data.get('time')
        condition = data.get('condition')
        status = data.get('status')
        
        if not all([from_loc, to_loc, distance, time, condition, status]):
            return jsonify({"error": "Missing required fields"}), 400
        
        # Ensure condition is a list
        if isinstance(condition, str):
            condition = [condition]
        
        # Get existing routes
        roads = parse_prolog_file()
        
        # Check if route already exists
        for road in roads:
            if road['from'] == from_loc and road['to'] == to_loc:
                return jsonify({"error": "Route already exists"}), 400
        
        # Add new route
        roads.append({
            'from': from_loc,
            'to': to_loc,
            'distance': float(distance),
            'time': float(time),
            'condition': condition,
            'status': status
        })
        
        # Write back to file
        if write_prolog_file(roads):
            return jsonify({"message": "Route added successfully"})
        else:
            return jsonify({"error": "Failed to write route to file"}), 500
            
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

@app.route('/admin/routes', methods=['PUT'])
def update_route():
    """Update an existing route"""
    try:
        data = request.json
        old_from = data.get('oldFrom')
        old_to = data.get('oldTo')
        new_from = data.get('from')
        new_to = data.get('to')
        distance = data.get('distance')
        time = data.get('time')
        condition = data.get('condition')
        status = data.get('status')
        
        if not all([old_from, old_to, new_from, new_to, distance, time, condition, status]):
            return jsonify({"error": "Missing required fields"}), 400
        
        # Ensure condition is a list
        if isinstance(condition, str):
            condition = [condition]
        
        # Get existing routes
        roads = parse_prolog_file()
        
        # Find and update route
        found = False
        for road in roads:
            if road['from'] == old_from and road['to'] == old_to:
                # Check if new route conflicts with existing route (different from old one)
                if (new_from != old_from or new_to != old_to):
                    for other_road in roads:
                        if other_road['from'] == new_from and other_road['to'] == new_to:
                            if road != other_road:  # Not the same route
                                return jsonify({"error": "Route with new locations already exists"}), 400
                
                road['from'] = new_from
                road['to'] = new_to
                road['distance'] = float(distance)
                road['time'] = float(time)
                road['condition'] = condition
                road['status'] = status
                found = True
                break
        
        if not found:
            return jsonify({"error": "Route not found"}), 404
        
        # Write back to file
        if write_prolog_file(roads):
            return jsonify({"message": "Route updated successfully"})
        else:
            return jsonify({"error": "Failed to write route to file"}), 500
            
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

@app.route('/admin/routes', methods=['DELETE'])
def delete_route():
    """Delete an existing route"""
    try:
        data = request.json
        from_loc = data.get('from')
        to_loc = data.get('to')
        
        if not all([from_loc, to_loc]):
            return jsonify({"error": "Missing required fields"}), 400
        
        # Get existing routes
        roads = parse_prolog_file()
        
        # Find and remove route
        found = False
        roads_filtered = []
        for road in roads:
            if road['from'] == from_loc and road['to'] == to_loc:
                found = True
            else:
                roads_filtered.append(road)
        
        if not found:
            return jsonify({"error": "Route not found"}), 404
        
        # Write back to file
        if write_prolog_file(roads_filtered):
            return jsonify({"message": "Route deleted successfully"})
        else:
            return jsonify({"error": "Failed to write route to file"}), 500
            
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500
        
if __name__ == '__main__':
    app.run(debug=True)

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

        
if __name__ == '__main__':
    app.run(debug=True)

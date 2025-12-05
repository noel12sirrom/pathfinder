import heapq
from typing import Dict, Tuple, List

graph = {
    "Kingston": {"Morant Point": (105, 87.4, ""), "Port Antonio": (124, 92.2, "Hilly"), "Annoto Bay": (73, 46.82, "Hilly"), "Spanish Town": (28, 20.4, "Inner-City"), "Port Royal": (32, 26.3, "Inner-City")},
    "Morant Point": {"Kingston": (105, 87.4, ""), "Port Antonio": (83, 67.7, "")},
    "Port Antonio": {"Kingston": (124, 92.2, "Hilly"), "Morant Point": (83, 67.7, ""), "Annoto Bay": (52, 45.5, "")},
    "Annoto Bay": {"Kingston": (73, 46.82, "Hilly"), "Port Antonio": (52, 45.5, ""), "Port Maria": (27, 25.2, "Hilly")},
    "Port Maria": {"Annoto Bay": (27, 25.2, "Hilly"), "Ocho Rios": (32, 31.4, "")},
    "Ocho Rios": {"Port Maria": (32, 31.4, ""), "Ewarton": (48, 46.8, "Toll"), "St. Ann's Bay": (14, 12.1, "Inner-City")},
    "St. Ann's Bay": {"Ocho Rios": (14, 12.1, "Inner-City"), "Falmouth": (57, 57.1, "Highway"), "Kellits": (71, 42.8, "Hilly")},
    "Falmouth": {"St. Ann's Bay": (57, 57.1, "Highway"), "Montego Bay": (36, 34.9, "Highway"), "Christianna": (93, 70.2, "Hilly")},
    "Montego Bay": {"Falmouth": (36, 34.9, "Highway"), "Lucea": (37, 36.5, "Highway"), "Savanna La Mar": (59, 49.5, "Hilly"), "Montpelier": (29, 18.1, "Hilly")},
    "Lucea": {"Montego Bay": (37, 36.5, "Highway"), "Negril": (37, 39.6, "Highway"), "Grange Hill": (40, 21.8, "Hilly")},
    "Negril": {"Lucea": (37, 39.6, "Highway"), "Savanna La Mar": (29, 28.1, "Highway"), "Grange Hill": (32, 25.6, "Hilly")},
    "Spanish Town": {"Kingston": (28, 20.4, "Inner-City"), "Alley": (68, 54.7, ""), "Ewarton": (43, 30.5, "Hilly"), "May Pen": (37, 34.6, "Toll")},
    "Alley": {"Spanish Town": (68, 54.7, ""), "Santa Cruz": (106, 93.1, "Hilly"), "May Pen": (45, 24.5, ""), "Junction": (109, 60.9, "")},
    "Santa Cruz": {"Alley": (106, 93.1, "Hilly"), "Black River": (28, 28.9, "Highway"), "Christianna": (54, 51.2, "Hilly"), "Montpelier": (88, 61.9, "Hilly"), "Junction": (38, 23, "")},
    "Black River": {"Santa Cruz": (28, 28.9, "Highway"), "Savanna La Mar": (47, 47.3, "Highway"), "Junction": (59, 42.7, "")},
    "Savanna La Mar": {"Black River": (47, 47.3, "Highway"), "Negril": (29, 28.1, "Highway"), "Montego Bay": (59, 49.5, "Hilly"), "Grange Hill": (21, 13.6, "Hilly"), "Montpelier": (43, 35, "Hilly")},
    "Ewarton": {"Spanish Town": (43, 30.5, "Hilly"), "Ocho Rios": (48, 46.8, "Toll"), "Christianna": (117, 77.6, "Hilly"), "Kellits": (57, 32.3, "Hilly")},
    "Christianna": {"Ewarton": (117, 77.6, "Hilly"), "Mandeville": (32, 20.9, "Hilly"), "Falmouth": (93, 70.2, "Hilly"), "Santa Cruz": (54, 51.2, "Hilly"), "Kellits": (90, 44.2, "Hilly")},
    "May Pen": {"Spanish Town": (37, 34.6, "Toll"), "Alley": (45, 24.5, ""), "Mandeville": (44, 39.4, ""), "Kellits": (71, 42.1, "Hilly")},
    "Mandeville": {"May Pen": (44, 39.4, ""), "Christianna": (32, 20.9, "Hilly"), "Junction": (38, 30.2, "Hilly")},
    "Port Royal": {"Kingston": (32, 26.3, "Inner-City")},
    "Grange Hill": {"Lucea": (40, 21.8, "Hilly"), "Negril": (32, 25.6, "Hilly"), "Savanna La Mar": (21, 13.6, "Hilly")},
    "Montpelier": {"Savanna La Mar": (43, 35, "Hilly"), "Santa Cruz": (88, 61.9, "Hilly"), "Montego Bay": (29, 18.1, "Hilly")},
    "Junction": {"Mandeville": (38, 30.2, "Hilly"), "Santa Cruz": (38, 23, ""), "Black River": (59, 42.7, ""), "Alley": (109, 60.9, "")},
    "Kellits": {"Christianna": (90, 44.2, "Hilly"), "Ewarton": (57, 32.3, "Hilly"), "St. Ann's Bay": (71, 42.8, "Hilly"), "May Pen": (71, 42.1, "Hilly")}
}


def algo(start, end, metric, avoid_types: List[str] = []):
    def dijkstra(start: str, metric: int = 0) -> Tuple[Dict[str, float], Dict[str, str]]:
        # Initialize distances and previous node tracking
        distances = {node: float('infinity') for node in graph}
        times = {node: float('infinity') for node in graph}  # To store time information
        distances[start] = 0
        times[start] = 0
        previous = {node: None for node in graph}
        
        # Priority queue to store (cost, node)
        pq = [(0, start)]
        visited = set()

        while pq:
            current_cost, current_node = heapq.heappop(pq)
            
            if current_node in visited:
                continue
            
            visited.add(current_node)
            
            # Explore neighbors
            for neighbor, (time, distance, road_type) in graph[current_node].items():
                # Skip the edge if the road type is in the avoid_types list
                if road_type in avoid_types:
                    continue
                
                cost = time if metric == 0 else distance
                new_cost = distances[current_node] + cost
                
                # Update distance and time
                new_time = times[current_node] + time
                new_distance = distances[current_node] + distance
                
                if new_cost < distances[neighbor]:
                    distances[neighbor] = new_cost
                    times[neighbor] = new_time
                    previous[neighbor] = current_node
                    heapq.heappush(pq, (new_cost, neighbor))
        
        return distances, times, previous

    def reconstruct_path(previous: Dict[str, str], start: str, end: str) -> List[str]:
        """
        Reconstructs the path from start to end using the previous dictionary.
        """
        path = []
        current_node = end
        
        while current_node is not None:
            path.append(current_node)
            current_node = previous[current_node]
        
        return path[::-1] if path[-1] == start else []

    distances, times, previous = dijkstra(start, metric)  
    path = reconstruct_path(previous, start, end)
    
    # Create a list to store the details of each leg of the journey
    leg_details = []
    
    # Calculate distances and times for each leg of the journey
    for i in range(len(path) - 1):
        from_place = path[i]
        to_place = path[i+1]
        (time, distance, road_type) = graph[from_place][to_place]
        leg_details.append({
            "from": from_place,
            "to": to_place,
            "distance_km": distance,
            "time_min": time,
            "road_type": road_type  # Include road type in the leg details
        })
    
    if metric == 0:
        return path, distances[end], leg_details
    else:
        return path, round(distances[end], 2), leg_details
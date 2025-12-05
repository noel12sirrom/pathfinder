% Graph and routing logic for PathFinder
% Nodes are towns/villages. Edges are roads with attributes:
% road(Source, Target, DistanceKm, TimeMin, Conditions, Status).
% Conditions: a list of conditions [paved, unpaved, broken_cisterns, deep_potholes]
% Status: open | closed
%
% Contributors:
% Shavon Scale - 2008093
% Hueland Hunter - 2006702
% Brandon Bent - 2106015
% Leon Morris - 2111686

road('Kingston', 'Port Antonio', 124.0, 92.2, [paved], open).
road('Kingston', 'Annoto Bay', 73.0, 46.82, [paved], open).
road('Kingston', 'Spanish Town', 28.0, 20.4, [paved], open).
road('Kingston', 'Port Royal', 32.0, 26.3, [paved], open).
road('Morant Point', 'Port Antonio', 83.0, 67.7, [unpaved,broken_cisterns], open).
road('Port Antonio', 'Annoto Bay', 52.0, 45.5, [paved,broken_cisterns], open).
road('Annoto Bay', 'Port Maria', 27.0, 25.2, [unpaved,deep_potholes], open).
road('Port Maria', 'Ocho Rios', 32.0, 31.4, [paved], open).
road('Ocho Rios', 'Ewarton', 48.0, 46.8, [paved], open).
road('Falmouth', 'Montego Bay', 36.0, 34.9, [paved], open).
road('Falmouth', 'Christianna', 93.0, 70.2, [paved,deep_potholes], open).
road('Montego Bay', 'Lucea', 37.0, 36.5, [paved], open).
road('Montego Bay', 'Savanna La Mar', 59.0, 49.5, [paved,broken_cisterns], open).
road('Montego Bay', 'Montpelier', 29.0, 18.1, [paved], open).
road('Lucea', 'Negril', 37.0, 39.6, [paved], open).
road('Lucea', 'Grange Hill', 40.0, 21.8, [unpaved,broken_cisterns], open).
road('Negril', 'Savanna La Mar', 29.0, 28.1, [paved], open).
road('Negril', 'Grange Hill', 32.0, 25.6, [paved,deep_potholes], open).
road('Spanish Town', 'Alley', 68.0, 54.7, [paved,broken_cisterns], open).
road('Spanish Town', 'Ewarton', 43.0, 30.5, [deep_potholes,unpaved], open).
road('Spanish Town', 'May Pen', 37.0, 34.6, [paved], open).
road('Alley', 'Santa Cruz', 106.0, 93.1, [paved,deep_potholes], open).
road('Alley', 'May Pen', 45.0, 24.5, [paved], open).
road('Alley', 'Junction', 109.0, 60.9, [paved,broken_cisterns], open).
road('Santa Cruz', 'Black River', 28.0, 28.9, [paved], open).
road('Santa Cruz', 'Christianna', 54.0, 51.2, [unpaved,deep_potholes], open).
road('Santa Cruz', 'Montpelier', 88.0, 61.9, [paved,broken_cisterns], open).
road('Santa Cruz', 'Junction', 38.0, 23.0, [paved], open).
road('Santa Cruz', 'Mandeville', 45.0, 38.5, [paved,broken_cisterns], open).
road('Black River', 'Savanna La Mar', 47.0, 47.3, [paved,deep_potholes], open).
road('Black River', 'Junction', 59.0, 42.7, [paved,broken_cisterns], open).
road('Savanna La Mar', 'Grange Hill', 21.0, 13.6, [broken_cisterns,unpaved], open).
road('Savanna La Mar', 'Montpelier', 43.0, 35.0, [paved], open).
road('Ewarton', 'Christianna', 117.0, 77.6, [unpaved,broken_cisterns], open).
road('Ewarton', 'Kellits', 57.0, 32.3, [paved,deep_potholes], open).
road('Christianna', 'Mandeville', 32.0, 20.9, [paved], open).
road('Christianna', 'Kellits', 90.0, 44.2, [deep_potholes,broken_cisterns], open).
road('Christiana', 'Spaldings', 22.0, 19.5, [paved,deep_potholes], open).
road('May Pen', 'Mandeville', 44.0, 39.4, [paved,broken_cisterns], open).
road('May Pen', 'Kellits', 71.0, 42.1, [paved,deep_potholes], open).
road('Mandeville', 'Junction', 38.0, 30.2, [paved], open).
road('Mandeville', 'Christiana', 28.0, 24.5, [paved], open).
road('Port Royal', 'Kingston', 32.0, 26.3, [paved], open).
road('Kingston', 'May Pen', 58.0, 52.1, [paved], open).
road('Port Royal', 'Spanish Town', 45.0, 38.7, [paved], open).
road('Morant Point', 'Port Royal', 98.0, 85.2, [unpaved,deep_potholes], open).
road('Port Antonio', 'Port Maria', 78.0, 68.5, [paved,broken_cisterns], open).
road('Falmouth', 'Ocho Rios', 40.0, 37.2, [paved,deep_potholes], open).
road('Negril', 'Montego Bay', 52.0, 48.6, [paved], open).
road('Junction', 'Savanna La Mar', 62.0, 55.3, [paved,broken_cisterns], open).
road('Kellits', 'Mandeville', 48.0, 41.2, [paved,deep_potholes], open).
road('Ewarton', 'May Pen', 65.0, 58.3, [unpaved,broken_cisterns], open).
road('Spanish Town', 'Kellits', 85.0, 72.3, [deep_potholes,unpaved], open).
road('Kingston', 'Ewarton', 68.0, 58.5, [paved,broken_cisterns], open).
road('Montego Bay', 'Maroon Town', 15.0, 12.5, [paved], open).
road('Maroon Town', 'Adelphi', 22.0, 18.3, [unpaved,broken_cisterns], open).
road('Falmouth', 'Duncans', 12.0, 10.5, [paved], open).
road('Duncans', 'Discovery Bay', 18.0, 15.2, [paved,deep_potholes], open).
road('Duncans', 'Clarks Town', 25.0, 22.1, [unpaved], open).
road('Clarks Town', 'Stewart Town', 20.0, 18.5, [paved,broken_cisterns], open).
road('Lucea', 'Green Island', 8.0, 7.2, [paved], open).
road('Green Island', 'Negril', 15.0, 13.8, [paved,deep_potholes], open).
road('Santa Cruz', 'Balaclava', 28.0, 24.5, [unpaved,broken_cisterns], open).
road('Balaclava', 'Christiana', 18.0, 15.8, [paved], open).
road('Balaclava', 'Christianna', 18.0, 15.8, [paved], open).
road('Mandeville', 'Spaldings', 35.0, 28.5, [paved,broken_cisterns], open).
road('May Pen', 'Old Harbour', 22.0, 19.5, [paved], open).
road('May Pen', 'Chapelton', 18.0, 16.2, [paved,deep_potholes], open).
road('Chapelton', 'Spaldings', 15.0, 13.5, [unpaved], open).
road('Spanish Town', 'Linstead', 32.0, 28.5, [paved], open).
road('Spanish Town', 'Old Harbour', 28.0, 24.8, [paved,broken_cisterns], open).
road('Linstead', 'Moneague', 42.0, 38.5, [paved,deep_potholes], open).
road('Linstead', 'Bog Walk', 12.0, 10.5, [paved], open).
road('Bog Walk', 'Port Maria', 38.0, 35.2, [unpaved,broken_cisterns], open).
road('Ocho Rios', 'Oracabessa', 15.0, 13.2, [paved], open).
road('Ocho Rios', 'Moneague', 25.0, 22.5, [paved,broken_cisterns], open).
road('Runaway Bay', 'Discovery Bay', 8.0, 7.5, [paved,deep_potholes], open).
road('Port Maria', 'Oracabessa', 20.0, 18.2, [paved], open).
road('Annoto Bay', 'Buff Bay', 18.0, 16.5, [unpaved], open).
road('Port Antonio', 'Buff Bay', 22.0, 19.8, [paved,broken_cisterns], open).
road('Port Antonio', 'Morant Bay', 35.0, 32.5, [paved], open).
road('Morant Bay', 'Yallahs', 15.0, 13.5, [paved,deep_potholes], open).
road('Yallahs', 'Kingston', 28.0, 25.2, [paved], open).
road('Kingston', 'Half-Way Tree', 8.0, 7.2, [paved], open).
road('Half-Way Tree', 'Constant Spring', 6.0, 5.5, [paved,broken_cisterns], open).
road('Constant Spring', 'Stony Hill', 5.0, 4.8, [paved], open).
road('Stony Hill', 'Golden Spring', 4.0, 3.8, [paved,deep_potholes], open).
road('Kingston', 'bob', 20.0, 20.0, [unpaved], open).
road('bob', 'Montego Bay', 78.0, 78.0, [paved], open).
% ----------------------
% Location coordinates for A* heuristic (lat, lon)
location_coords('Kingston', 18.0179, -76.8099).  % Updated: more accurate
location_coords('Morant Point', 17.9132, -76.2293).
location_coords('Port Antonio', 18.1769, -76.4500).  % Updated: more accurate
location_coords('Annoto Bay', 18.2750, -76.7700).  % Updated: more accurate
location_coords('Port Maria', 18.3700, -76.8900).  % Updated: more accurate
location_coords('Ocho Rios', 18.4025, -77.1048).  % Updated: more accurate
location_coords('St. Ann\'s Bay', 18.4300, -77.2000).  % Updated: more accurate
location_coords('Falmouth', 18.4931, -77.6550).  % Updated: more accurate
location_coords('Montego Bay', 18.4667, -77.9167).  % Updated: more accurate
location_coords('Lucea', 18.4500, -78.1736).  % Updated: more accurate
location_coords('Montpelier', 18.3623, -77.9235).
location_coords('Negril', 18.2681, -78.3472).  % Updated: more accurate
location_coords('Spanish Town', 17.9911, -76.9577).  % Updated: more accurate
location_coords('Alley', 17.7891, -77.2692).
location_coords('Santa Cruz', 18.0501, -77.7049).
location_coords('Junction', 17.9243, -77.6177).
location_coords('Black River', 18.0264, -77.8487).  % Updated: more accurate
location_coords('Savanna La Mar', 18.2196, -77.9620).  % Updated: more accurate
location_coords('Ewarton', 18.1767, -77.0866).
location_coords('Christianna', 18.1736, -77.4903).
location_coords('Christiana', 18.1736, -77.4903).  % Same location, different spelling
location_coords('May Pen', 17.9645, -77.2434).  % Updated: more accurate
location_coords('Kellits', 18.1831, -77.2174).
location_coords('Mandeville', 18.0410, -77.5071).  % Updated: more accurate
location_coords('Port Royal', 17.9371, -76.8410).
location_coords('Grange Hill', 18.2000, -78.0000).  % Approximate coordinates - small community
location_coords('Maroon Town', 18.4200, -77.9500).
location_coords('Adelphi', 18.4000, -77.9800).
location_coords('Duncans', 18.4700, -77.6000).
location_coords('Discovery Bay', 18.4667, -77.4000).  % Updated: more accurate
location_coords('Clarks Town', 18.4200, -77.5500).
location_coords('Stewart Town', 18.4000, -77.5000).
location_coords('Green Island', 18.4300, -78.2000).
location_coords('Balaclava', 18.1500, -77.6500).  % Updated: more accurate
location_coords('Spaldings', 18.1500, -77.5000).  % Updated: more accurate
location_coords('Old Harbour', 17.9420, -77.1080).  % Updated: more accurate
location_coords('Chapelton', 18.0500, -77.3000).
location_coords('Linstead', 18.1360, -77.0310).  % Updated: more accurate
location_coords('Moneague', 18.2500, -77.0500).
location_coords('Bog Walk', 18.1200, -77.0500).
location_coords('Oracabessa', 18.4000, -76.9500).
location_coords('Runaway Bay', 18.4500, -77.3500).  % Updated: more accurate
location_coords('Buff Bay', 18.2300, -76.6700).  % Updated: more accurate
location_coords('Morant Bay', 17.8815, -76.4090).  % Updated: more accurate
location_coords('Yallahs', 17.8800, -76.6000).  % Updated: more accurate
location_coords('Half-Way Tree', 18.0120, -76.7990).  % Updated: more accurate
location_coords('Constant Spring', 18.0333, -76.8000).  % Updated: more accurate
location_coords('Stony Hill', 18.0667, -76.8000).  % Updated: more accurate
location_coords('Golden Spring', 18.1000, -76.7200).

% ----------------------
% Bidirectional access
edge_info(A, B, D, T, C, S) :- road(A, B, D, T, C, S).
edge_info(A, B, D, T, C, S) :- road(B, A, D, T, C, S).

% ----------------------
% Predicate to check if an edge is allowed given Avoid list
% Conditions is a list of conditions: [paved, unpaved, broken_cisterns, deep_potholes]
% Avoid is a list of atoms to avoid: [unpaved, closed, broken_cisterns, deep_potholes]
% An edge is allowed if NONE of its conditions are in the Avoid list
allowed_edge(Conditions, Status, Avoid) :-
    % Check that no condition in Conditions list is in Avoid list
    \+ (member(Cond, Conditions), memberchk(Cond, Avoid)),
    ( Status = open
    ; ( Status = closed, \+ memberchk(closed, Avoid) )
    ).

% ----------------------
% Main route predicate - selects algorithm based on criteria
% Algorithm selection:
%   - Dijkstra: shortest distance/time WITHOUT conditions to avoid
%   - A*: shortest distance/time WITH conditions to avoid
%   - BFS: no optimization selected (neither shortest time nor distance)
route(From, To, Metric, Avoid, Path, TotalDistance, TotalTime, Algorithm) :-
    ( Metric = none ->
        % BFS when no optimization selected
        bfs([[From]], To, Avoid, RevPath),
        reverse(RevPath, Path),
        calculate_path_costs(Path, TotalDistance, TotalTime),
        Algorithm = 'BFS'
    ; (Avoid = [] ; \+ member(_, Avoid)) ->
        % Dijkstra when no conditions to avoid
        dijkstra([[0,0,[From]]], To, Metric, RevPath, TotalDistance, TotalTime),
        reverse(RevPath, Path),
        Algorithm = 'Dijkstra'
    ; 
        % A* when conditions to avoid
        heuristic(From, To, Metric, H0),
        F0 is 0 + H0,
        astar([[F0,0,0,[From]]], To, Metric, Avoid, RevPath, TotalDistance, TotalTime),
        reverse(RevPath, Path),
        Algorithm = 'A*'
    ).

% ----------------------
% Dijkstra's Algorithm - for shortest path without constraints
% Frontier: [[Cost, Time, Path], ...]
dijkstra(Frontier, Goal, Metric, Path, Dist, Time) :-
    sort_frontier(Metric, Frontier, Sorted),
    Sorted = [[D,T,[Node|Visited]] | Rest],
    ( Node = Goal ->
        Path = [Node|Visited],
        Dist = D,
        Time = T
    ; findall(
          [ND, NT, [Next,Node|Visited]],
          ( edge_info(Node, Next, ED, ET, _, _),
            \+ memberchk(Next, [Node|Visited]),
            calc_new_costs(Metric, D, T, ED, ET, ND, NT)
          ),
          Expansions
      ),
      append(Rest, Expansions, NewFrontier),
      dijkstra(NewFrontier, Goal, Metric, Path, Dist, Time)
    ).

% ----------------------
% A* Algorithm - for shortest path with constraints (uses heuristic)
% Frontier: [[F, G, Time, Path], ...] where F = G + H
% Simply skips edges with avoided conditions and continues searching
astar(Frontier, Goal, Metric, Avoid, Path, Dist, Time) :-
    sort_frontier_astar(Frontier, Sorted),
    Sorted = [[F,G,T,[Node|Visited]] | Rest],
    ( Node = Goal ->
        Path = [Node|Visited],
        Dist = G,
        Time = T
    ; findall(
          [NF, NG, NT, [Next,Node|Visited]],
          ( edge_info(Node, Next, ED, ET, Cond, Stat),
            \+ memberchk(Next, [Node|Visited]),
            allowed_edge(Cond, Stat, Avoid),  % Skip edges with avoided conditions
            calc_new_costs(Metric, G, T, ED, ET, NG, NT),
            heuristic(Next, Goal, Metric, H),
            NF is NG + H
          ),
          Expansions
      ),
      append(Rest, Expansions, NewFrontier),
      astar(NewFrontier, Goal, Metric, Avoid, Path, Dist, Time)
    ).

% ----------------------
% BFS Algorithm - for finding any path (no optimization)
% Uses queue: first in, first out
bfs(Frontier, Goal, Avoid, Path) :-
    Frontier = [[Node|Visited] | Rest],
    ( Node = Goal ->
        Path = [Node|Visited]
    ; findall(
          [Next,Node|Visited],
          ( edge_info(Node, Next, _, _, Cond, Stat),
            \+ memberchk(Next, [Node|Visited]),
            allowed_edge(Cond, Stat, Avoid)
          ),
          Expansions
      ),
      % BFS: append new nodes to end of queue (FIFO)
      append(Rest, Expansions, NewFrontier),
      bfs(NewFrontier, Goal, Avoid, Path)
    ).

% ----------------------
% Heuristic function for A* (Euclidean distance based on coordinates)
% Returns 0 if coordinates not found (admissible heuristic - ensures optimality)
heuristic(Node, Goal, Metric, H) :-
    ( location_coords(Node, Lat1, Lon1),
      location_coords(Goal, Lat2, Lon2) ->
        ( Metric = distance ->
            % Haversine distance approximation (simplified)
            DLat is Lat2 - Lat1,
            DLon is Lon2 - Lon1,
            H is sqrt(DLat * DLat + DLon * DLon) * 111.0  % Rough km conversion
        ; Metric = time ->
            % Estimate time based on distance (assuming avg speed)
            DLat is Lat2 - Lat1,
            DLon is Lon2 - Lon1,
            DistEst is sqrt(DLat * DLat + DLon * DLon) * 111.0,
            H is DistEst * 0.8  % Rough time estimate (minutes)
        ; H = 0
        )
    ; H = 0  % If coordinates not found, return 0 (admissible - ensures optimality)
    ).

% Calculate total distance and time for a path (used by BFS)
calculate_path_costs([_], 0, 0).
calculate_path_costs([A,B|Rest], TotalDist, TotalTime) :-
    edge_info(A, B, D, T, _, _),
    calculate_path_costs([B|Rest], RestDist, RestTime),
    TotalDist is D + RestDist,
    TotalTime is T + RestTime.

calc_new_costs(distance, D, T, ED, ET, ND, NT) :- ND is D + ED, NT is T + ET.
calc_new_costs(time,     D, T, ED, ET, ND, NT) :- ND is T + ET, NT is T + ET.

% Sort frontier by first element (cost) for Dijkstra
sort_frontier(_Metric, Frontier, Sorted) :-
    keysort_list(Frontier, Sorted).

% Sort frontier by F value for A* (first element)
sort_frontier_astar(Frontier, Sorted) :-
    keysort_list(Frontier, Sorted).

% Helper: sort list of [Key,...] by Key
keysort_list(List, Sorted) :-
    pair_up(List, Pairs),
    keysort(Pairs, SortedPairs),
    depair(SortedPairs, Sorted).

pair_up([], []).
pair_up([[K,V2,V3]|T], [K-[K,V2,V3]|PT]) :- pair_up(T, PT).
pair_up([[K,V2,V3,V4]|T], [K-[K,V2,V3,V4]|PT]) :- pair_up(T, PT).  % For A* with 4 elements

depair([], []).
depair([_-V|T], [V|DT]) :- depair(T, DT).



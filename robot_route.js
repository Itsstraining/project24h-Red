const roads = [
  "Dubai's house-Sky's shop",  "Dubai's house-Potion shop",
  "Dubai's house-Torung's house","Potion shop-Kiet's house",
  "Potion shop-Gym House", "Hospital-Kiet's house",
  "Hospital-Bao's house", "Torung's house-Bao's house"

];

const mailRoute =[
  "Potion shop" , "Gym House" , "Potion shop",
  "Dubai's house", "Sky's shop", "Dubai's house",
  "Torung's house", "Bao's house", "Kiet's house"
];


function buildGraph(edges) {
    let graph = Object.create(null);
    function addEdge(from, to) {
      if (graph[from] == null) {
        graph[from] = [to];
      } else {
        graph[from].push(to);
      }
    }
    for (let [from, to] of edges.map(r => r.split("-"))) {
      addEdge(from, to);
      addEdge(to, from);
    }
    return graph;
  }
  
  const roadGraph = buildGraph(roads);
  console.log(roadGraph);

  class VillageState {
    constructor(place, parcels) {
      this.place = place;
      this.parcels = parcels;
    }
  
    move(destination) {
      if (!roadGraph[this.place].includes(destination)) {
        return this;
      } else {
        let parcels = this.parcels.map(p => {
          if (p.place != this.place) return p;
          return {place: destination, address: p.address};
        }).filter(p => p.place != p.address);
        return new VillageState(destination, parcels);
      }
    }
  }
  

  let object = Object.freeze({value: 5});
  object.value = 10;
  console.log(object.value);

  function runRobot(state, robot, memory) {
    for (let turn = 0;; turn++) {
      if (state.parcels.length == 0) {
        console.log(`Done in ${turn} turns`);
        break;
      }
      let action = robot(state, memory);
      state = state.move(action.direction);
      memory = action.memory;
      console.log(`Moved to ${action.direction}`);
    }
  }

  function randomPick(array) {
    let choice = Math.floor(Math.random() * array.length);
    return array[choice];
  }
  
  function randomRobot(state) {
    return {direction: randomPick(roadGraph[state.place])};
  }

  VillageState.random = function(parcelCount = 15) {
    let parcels = [];
    for (let i = 0; i < parcelCount; i++) {
      let address = randomPick(Object.keys(roadGraph));
      let place;
      do {
        place = randomPick(Object.keys(roadGraph));
      } while (place == address);
      parcels.push({place, address});
    }
    return new VillageState("Gym House", parcels);
  };

  function routeRobot(state, memory) {
      if (memory.length == 0) {
        memory = mailRoute;
      }
      return {direction: memory[0], memory: memory.slice(1)};
    }

  function findRoute(graph, from, to) {
      let work = [{at: from, route: []}];
      for (let i = 0; i < work.length; i++) {
        let {at, route} = work[i];
        for (let place of graph[at]) {
          if (place == to) return route.concat(place);
          if (!work.some(w => w.at == place)) {
            work.push({at: place, route: route.concat(place)});
          }
        }
      }
  }
  function goalOrientedRobot({place, parcels}, route) {
      if (route.length == 0) {
        let parcel = parcels[0];
        if (parcel.place != place) {
          route = findRoute(roadGraph, place, parcel.place);
        } else {
          route = findRoute(roadGraph, place, parcel.address);
        }
      }
      return {direction: route[0], memory: route.slice(1)};
  }
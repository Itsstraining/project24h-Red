// test: no

(function() {
    "use strict"
  
    let active = null
  
    const places = {
      "Gym House": {x: 60, y: 240},
      "Potion shop": {x: 185, y: 240},
      "Kiet's house": {x: 320, y: 209},
      "Hospital": {x: 455, y: 200},
      "Bao's house": {x: 414, y: 334},
      "Torung's house": {x: 316, y: 372},
      "Dubai's house": {x: 165, y: 370},
      "Sky's shop": {x: 59, y: 372},
    //   "Marketplace": {x: 162, y: 110},
    //   "Post Office": {x: 205, y: 57},
    //   "Shop": {x: 137, y: 212},
    //   "Town Hall": {x: 202, y: 213}
    }
    const placeKeys = Object.keys(places)
  
    const speed = 2
  
    class Animation {
      constructor(worldState, robot, robotState) {
        this.worldState = worldState
        this.robot = robot
        this.robotState = robotState
        this.turn = 0
  
        let outer = (window.__sandbox ? window.__sandbox.output.div : document.body), doc = outer.ownerDocument
        this.node = outer.appendChild(doc.createElement("div"))
        this.node.style.cssText = "position: relative; line-height: 0.1; margin-left: 10px"
        this.map = this.node.appendChild(doc.createElement("img"))
        this.map.src = "img/village2x.png"
        this.map.style.cssText = "vertical-align: -8px"
        this.robotElt = this.node.appendChild(doc.createElement("div"))
        this.robotElt.style.cssText = `position: absolute; transition: left ${0.8 / speed}s, top ${0.8 / speed}s;`
        let robotPic = this.robotElt.appendChild(doc.createElement("img"))
        robotPic.src = "img/robot_moving2x.gif"
        this.parcels = []
  
        this.text = this.node.appendChild(doc.createElement("span"))
        this.button = this.node.appendChild(doc.createElement("button"))
        this.button.style.cssText = "color: white; background: #28b; border: none; border-radius: 2px; padding: 2px 5px; line-height: 1.1; font-family: sans-serif; font-size: 80%"
        this.button.textContent = "Stop"
  
        this.button.addEventListener("click", () => this.clicked())
        this.schedule()
  
        this.updateView()
        this.updateParcels()
  
        this.robotElt.addEventListener("transitionend", () => this.updateParcels())
      }
  
  
      updateView() {
        let pos = places[this.worldState.place]
        this.robotElt.style.top = (pos.y - 38) + "px"
        this.robotElt.style.left = (pos.x - 16) + "px"
  
        this.text.textContent = ` Turn ${this.turn} `
      }
  
      updateParcels() {
        while (this.parcels.length) this.parcels.pop().remove()
        let heights = {}
        for (let {place, address} of this.worldState.parcels) {
          let height = heights[place] || (heights[place] = 0)
          heights[place] += 14
          let node = document.createElement("div")
          let offset = placeKeys.indexOf(address) * 16
          node.style.cssText = "position: absolute; height: 16px; width: 16px; background-image: url(img/parcel2x.png); background-position: 0 -" + offset + "px";
          if (place == this.worldState.place) {
            node.style.left = "25px"
            node.style.bottom = (20 + height) + "px"
            this.robotElt.appendChild(node)
          } else {
            let pos = places[place]
            node.style.left = (pos.x - 5) + "px"
            node.style.top = (pos.y - 10 - height) + "px"
            this.node.appendChild(node)
          }
          this.parcels.push(node)
        }
      }
  
      tick() {
        let {direction, memory} = this.robot(this.worldState, this.robotState)
        this.worldState = this.worldState.move(direction)
        this.robotState = memory
        this.turn++
        this.updateView()
        if (this.worldState.parcels.length == 0) {
          this.button.remove()
          this.text.textContent = ` Finished after ${this.turn} turns`
          this.robotElt.firstChild.src = "img/robot_idle2x.png"
        } else {
          this.schedule()
        }
      }
  
      schedule() {
        this.timeout = setTimeout(() => this.tick(), 1000 / speed)
      }
  
      clicked() {
        if (this.timeout == null) {
          this.schedule()
          this.button.textContent = "Stop"
          this.robotElt.firstChild.src = "img/robot_moving2x.gif"
        } else {
          clearTimeout(this.timeout)
          this.timeout = null
          this.button.textContent = "Start"
          this.robotElt.firstChild.src = "img/robot_idle2x.png"
        }
      }
    }
  
    window.runRobotAnimation = function(worldState, robot, robotState) {
      if (active && active.timeout != null)
        clearTimeout(active.timeout)
      active = new Animation(worldState, robot, robotState)
    }
  })()







  const roads = [
    "Dubai's house-Sky's shop",  "Dubai's house-Potion shop",
    "Dubai's house-Torung's house","Potion shop-Kiet's house",
    "Potion shop-Gym House", "Hospital-Kiet's house",
    "Hospital-Bao's house", "Torung's house-Bao's house"

  ];
//   const mailRoute = [
//     "Alice's House", "Cabin", "Alice's House", "Bob's House",
//     "Town Hall", "Daria's House", "Ernie's House",
//     "Grete's House", "Shop", "Grete's House", "Farm",
//     "Marketplace", "Post Office"
//   ];
  
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
  
    runRobotAnimation(VillageState.random(),goalOrientedRobot,[]);
  
  
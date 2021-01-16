// test: no

let character =[
    {
        name: "mario",
        url_stand: "./img/mario_idle.gif",
        url_moving: "./img/mario_moving.gif",
    },
    {
        name: "luigi",
        url_stand: "./img/luigi_idle.gif",
        url_moving: "./img/luigi_moving.gif"
    }
]

let map_list =[
    
]

let status = false, tempUrl_stand,tempUrl_moving;

let character_content = document.getElementById("character");
for(let i of character){
    let charDiv = document.createElement("div");
    let charImg = document.createElement("img");
    let charBtn = document.createElement("button");

    charDiv.appendChild(charImg);
    charDiv.appendChild(charBtn);

    charImg.src = i.url_stand;
    charBtn.innerText = i.name;
    character_content.appendChild(charDiv);

    charBtn.onclick = () => {
        tempUrl_stand = i.url_stand;
        tempUrl_moving = i.url_moving;
        if (status == true) {
            document.getElementById("game").remove();
            status = true;
            runRobotAnimation(VillageState.random(),goalOrientedRobot,[]);
        
        }else{
            runRobotAnimation(VillageState.random(),goalOrientedRobot,[]);
            status = true;
        }

    }
}
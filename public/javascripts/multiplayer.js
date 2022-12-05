window.onload = () => {
    webSocketInit();
}

let socket;

function webSocketInit() {
    socket = new WebSocket("ws://127.0.0.1:9000/ws/"+ getCookie("game"));
    socket.onopen = () => heartBeat();
    socket.onclose = () => console.log("Connection closed")
    socket.onmessage = function (event) {
        if(event.data !== "") {
            console.log("MULT ACTION");
            console.log(JSON.parse(event.data));
            createCardsMult(JSON.parse(event.data));
        } else {
            console.log("no valid json data");
            socket.send("refresh");
        }
    }
    socket.onerror = () => console.log("that was a problem")
}

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

async function clickCardMult(ind) {
    let url = "/game_mult/place/" + ind + "/" + getCookie("game");
    await gameChanges(url)
}

async function nextPlayerMult() {
    let url = "/game_mult/next/" + getCookie("game");
    await gameChanges(url)
}

async function takeCardMult() {
    let url = "/game_mult/take/" + getCookie("game");
    await gameChanges(url)
}


async function createCardsMult(json) {
    document.getElementById("next_player_button_mult").innerHTML = "next";
    document.getElementById("next_player_button_mult").disabled = false;
    document.getElementById("player_cards").innerHTML = "";
    document.getElementById("midCard").src = "/assets/images/" + json["game"].midCard["png_ind"][0]["card_png"]
    let outer_all = document.createElement("div");
    outer_all.classList.add("col-6", "offset-3")
    let row = document.createElement("div");
    row.classList.add("row","row-cols-3", "g-0", "center-align", "top-5")
    //-----------------------------------------
    const currentstate = json["game"].currentstate;
    let player_cards = []
    let clickable = false;
    if (currentstate === getCookie("player")) {
        if (json["game"].ERROR !== 0) {
            alert("This card cannot be placed");
        }
        clickable = true;
        if(getCookie("pn") === "player1") {
            player_cards = json["game"].player1["png_ind"];
        } else {
            player_cards = json["game"].player2["png_ind"];
        }
    } else if (currentstate === "winState") {

    } else {
        if (getCookie("pn") === "player1") {
            player_cards = json["game"].player1["png_ind"];
            document.getElementById("enemy").innerHTML = "playing against: " + json["game"].player2["name"] + " with " + json["game"].player2["kartenzahl"] + " cards left";
        } else {
            player_cards = json["game"].player2["png_ind"];
            document.getElementById("enemy").innerHTML = "playing against: " + json["game"].player1["name"] + " with " + json["game"].player1["kartenzahl"] + " cards left";
        }


    }
    player_cards.forEach(element => row.appendChild(get_player_card_mult(element["index"], element["card_png"], clickable)));
    outer_all.appendChild(row);

    document.getElementById("player_cards").appendChild(outer_all);
}

function get_player_card_mult(ind, card_ess, clickable) {
    let wrapperd_card = document.createElement("div")
    wrapperd_card.classList.add("col-sm-4", "col-md-4", "col-lg-3", "col-xl-2", "center-align")
    let card = document.createElement("img")
    card.alt = "X"
    card.classList.add("cards", "img-fluid")
    card.id = ind
    card.src = "/assets/images/" + card_ess
    if(clickable === true){
        card.addEventListener('click', function handleClick() {
        clickCardMult(ind);
    });
    } else {
        card.addEventListener('click', function handleClick() {
           alert("It's not your turn");
        });
    }


    wrapperd_card.appendChild(card)
    return wrapperd_card
}

function heartBeat() {
    socket.send("heartBeat");
}

$("document").ready(function () {
    $("#next_player_button_mult").click(function () {
        nextPlayerMult();
    })
})

async function gameChanges(url) {
    const res = await fetch(url, {
        method: 'POST',
        headers: {
            'Accept': 'application/json */*',
            'Content-Type': 'application/json'},
        body: ""
    })
    if (await res.ok) {
        await res.text();
        socket.send("refresh");
    } else {
        console.log("page failed loading");
    }
}
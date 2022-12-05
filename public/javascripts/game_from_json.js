window.onload = () => {
    webSocketInit();
}

let socket;

function webSocketInit() {
    socket = new WebSocket("ws://127.0.0.1:9000/ws");
    socket.onopen = () => console.log("Connection is there")
    socket.onclose = () => console.log("Connection closed")
    socket.onmessage = function (event) {
        console.log(JSON.parse(event.data));
        createCards(JSON.parse(event.data));
 }
}
async function clickCard(ind) {
    const req = `/game/place/` + ind;
    await getJSON(req);
}

async function nextPlayer() {
    await getJSON('/game/next');
}

async function takeCard() {
    await getJSON('/game/take');
}

async function startGame() {
    await getJSON('/game/json');
}

async function getJSON(url) {
    const res = await fetch(url, {
        method: 'POST',
        headers: {
            'Accept': 'application/json */*',
            'Content-Type': 'application/json'
        },
        body: ""
    })
    if (await res.ok) {
        //await createCards(await res.json());
        socket.send(`Action done: baguette -> Response: ${await res.json()}`);
    } else {
        console.log("page failed loading");
    }
}

// Jquery to check the onlick of a card
$("document").ready(function () {
    $("#next_player_button").click(function () {
        nextPlayer();
    })
    $(".card_stack").click(function () {
        takeCard();
    })

})
;


async function createCards(json) {
    document.getElementById("player_cards").innerHTML = "";
    document.getElementById("midCard").src = "/assets/images/" + json["game"].midCard["png_ind"][0]["card_png"]
    let outer_all = document.createElement("div");
    outer_all.classList.add("col-6", "offset-3")
    let row = document.createElement("div");
    row.classList.add("row","row-cols-3", "g-0", "center-align", "top-5")
    //-----------------------------------------
    const currentstate = json["game"].currentstate;
    let player_cards = []
    if (currentstate === "player1State") {
        if (json["game"].ERROR !== 0) {
            alert("This card cannot be placed");
        }
        player_cards = json["game"].player1["png_ind"];
    } else if (currentstate === "player2State") {
        if (json["game"].ERROR !== 0) {
            alert("This card cannot be placed");
        }
        player_cards = json["game"].player2["png_ind"];
    } else if (currentstate === "between12State") {
        if (json["game"].ERROR !== 0) {
            alert("not possible in this state");
        }
    } else if (currentstate === "between21State") {
        if (json["game"].ERROR !== 0) {
            alert("not possible in this state");
        }
    } else if (currentstate === "winState") {

    }

    player_cards.forEach(element => row.appendChild(get_player_card(element["index"], element["card_png"])));
    outer_all.appendChild(row);


    document.getElementById("player_cards").appendChild(outer_all);
}


function get_player_card(ind, card_ess) {
    let wrapperd_card = document.createElement("div")
    wrapperd_card.classList.add("col-sm-4", "col-md-4", "col-lg-3", "col-xl-2", "center-align")
    let card = document.createElement("img")
    card.alt = "X"
    card.classList.add("cards", "img-fluid")
    card.id = ind
    card.src = "/assets/images/" + card_ess
    card.addEventListener('click', function handleClick() {
        clickCard(ind);
    });
    wrapperd_card.appendChild(card)
    return wrapperd_card
}



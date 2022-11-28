

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
    if (await res.ok)
        await createCards(await res.json());
    else
        console.log("page failed loading");
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
    document.getElementById("midCard").src = "/assets/images/" + json["game"].midCard["png_ind"][0]["card_png"]

    const div_player = document.createElement('div');
    div_player.classList.add("player_cards")
    const cols = document.createElement("div");
    cols.classList.add("col-4", "offset-4")
    const center = document.createElement("div");
    center.classList.add("row", "center-align")
    const pictures = document.createElement("div");
    pictures.classList.add("col-6", "g-0")
    //-----------------------------------------
    const currentstate = json["game"].currentstate;
    var player_cards = []
    if (currentstate === "player1State") {
        if(json["game"].ERROR !== 0) {
            alert("This card cannot be placed");
        }
        player_cards = json["game"].player1["png_ind"];
    } else if (currentstate === "player2State") {
        if(json["game"].ERROR !== 0) {
            alert("This card cannot be placed");
        }
        player_cards = json["game"].player2["png_ind"];
    } else if (currentstate === "between12State") {
        if(json["game"].ERROR !== 0) {
            alert("not possible in this state");
        }
    } else if (currentstate === "between21State") {
        if(json["game"].ERROR !== 0) {
            alert("not possible in this state");
        }
    } else if (currentstate === "winState") {

    }

    player_cards.forEach(element => pictures.appendChild(get_player_card(element["index"], element["card_png"])));
    center.appendChild(pictures);
    cols.appendChild(center.toString());
    div_player.appendChild(cols);

    document.getElementById("player_cards").innerHTML = div_player.toString();
}


function get_player_card(ind, card_ess) {
    const wrapperd_card = document.createElement("div")
    wrapperd_card.classList.add("col-sm-4", "col-md-4", "col-lg-3", "col-xl-2", "center-align")
    var card = document.createElement("img")
    card.alt = "X"
    card.classList.add("cards", "img-fluid")
    card.id = ind
    card.src = "/assets/images/" + card_ess
    card.on("click", async function () {
        const req = `/game/place/` + $(this).attr('id');
        await getJSON(req);
    });
    wrapperd_card.appendChild(card)
    return wrapperd_card
}

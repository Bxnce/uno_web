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

    const div_player = document.createElement('div_player');
    //-----------------------------------------
    const currentstate = json["game"].currentstate;
    var player_html = "";
    if (currentstate === "player1State") {
        if(json["game"].ERROR !== 0) {
            alert("This card cannot be placed");
        }
        const player_cards = json["game"].player1["png_ind"];
        player_html = '                        ' +
            '                        <div class="row"><div class="col-6 offset-3">\n' +
            '                                <div class="row row-cols-3 g-0 center-align top-5">\n';
        player_cards.forEach(element => player_html += get_player_card(element["index"], element["card_png"]));
        player_html += '</div></div>';
        div_player.innerHTML = player_html;
    } else if (currentstate === "player2State") {
        if(json["game"].ERROR !== 0) {
            alert("This card cannot be placed");
        }
        const player_cards = json["game"].player2["png_ind"];
        player_html = '                        ' +
            '                        <div class="row"><div class="col-6 offset-3">\n' +
            '                                <div class="row row-cols-3 g-0 center-align top-5">\n';
        player_cards.forEach(element => player_html += get_player_card(element["index"], element["card_png"]));
        player_html += '</div></div>';
        div_player.innerHTML = player_html;
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
    document.getElementById("player_cards").innerHTML = player_html;
}


function get_player_card(ind, card) {
    return '<div class="col-sm-4 col-md-4 col-lg-3 col-xl-2 center-align">' +
        '<img alt="X" cardindex="' + ind + '" onclick="clickCard(' + ind + ')" class="cards img-fluid" src="/assets/images/' + card + '">' +
        '</div>';
}

function return_midCard(json){
    const js = JSON.parse(json);
    return js["game"].midCard["png_ind"][0]["card_png"];
}
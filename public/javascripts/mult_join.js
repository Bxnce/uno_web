$("document").ready(function () {
    $("#join_multiplayer_game").click(function () {
        // TODO check that the game exists in the controller map
        setCookies("player2State", document.getElementById("game_hash").value);
        window.location.href = "/game_mult/join/" + getCookie("game") + "/" + getCookie("name");
    })
})

function createHash() {
    let result = '';
    let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let charactersLength = characters.length;
    for (let i = 0; i < 5; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

function setCookies(state, hash, player) {
    if (hash === "") {
        document.cookie = "game=" + createHash();
    } else {
        document.cookie = "game=" + hash;
    }
    document.cookie = "pn=" + player;
    document.cookie = "player=" + state;
    document.cookie = "name=" + document.getElementById("player").value;
}

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

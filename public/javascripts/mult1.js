$("document").ready(function () {
    $("#join_multiplayer").click(function () {
        window.location.href = "/game_mult/prejoin";
    })
    $("#get_to_mult").click(function () {
        window.location.href = "/game_mult/setup_multiplayer";
    })
})

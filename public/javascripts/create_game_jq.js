$("document").ready(function () {
    $("#create_game_bt").click(function () {
            let player1 = $("#player1").val();
            let player2 = $("#player2").val();
            if (player1 == "" || player2 == "") {
                alert("Please enter player names");
            } else {
                window.location.href = "/game/start/" + player1 + "/" + player2;
            }
        }
    )
    $("#create_multiplayer").click(function () {
        window.location.href = "/game_mult/setup_multiplayer";
    })
})


;
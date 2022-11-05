//Function to create a game, called when the user clicks the start the game button
function createGame(){
    player1 = document.getElementById("player1").value;
    player2 = document.getElementById("player2").value;

    if (player1 == "" || player2 == ""){
        alert("Please enter player names");
    } else {
        window.location.href = "/game/start/" + player1 + "/" + player2;
    }
    
}
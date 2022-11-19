//Function to create a game, called when the user clicks the start the game button
function placeCard_click(card_i) {
    if (isNaN(card_i)) {
        alert("Please enter a card index");
    } else {
        window.location.href = "/game/place/" + card_i;
    }

}


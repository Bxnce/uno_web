const app = Vue.createApp({})


app.component('game', {
    data() {
        return {
            req : '',
            res : '',
            currentstate : '',
            player_cards : [],
            cards: [],
            midCard : 'uno_back.png',
        }
    },
    methods: {
        async clickCard(ind) {
            this.req = `/game/place/` + ind;
            await this.getJSON(this.req);
        },
        async nextPlayer() {
            await this.getJSON('/game/next');
        },
        async takeCard() {
            await this.getJSON('/game/take');
        },
        async startGame() {
            await this.getJSON('/game/json');
        },
        async getJSON(url) {
            this.res = await fetch(url, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json */*',
                    'Content-Type': 'application/json'
                },
                body: ""
            })
            if (this.res.ok) {
                await this.createCards(await this.res.json())
            } else {
                console.log("page failed loading");
            }
        },
        async createCards(json) {
            this.cards = []
            this.midCard = json["game"].midCard["png_ind"][0]["card_png"];
            this.currentstate = json["game"].currentstate;
            this.player_cards = []
            if (this.currentstate === "player1State") {
                if (json["game"].ERROR !== 0) {
                    alert("This card cannot be placed");
                }
                this.player_cards = json["game"].player1["png_ind"];
            } else if (this.currentstate === "player2State") {
                if (json["game"].ERROR !== 0) {
                    alert("This card cannot be placed");
                }
                this.player_cards = json["game"].player2["png_ind"];
            }

            this.player_cards.forEach(element => this.cards.push(element["card_png"]));
        },
    },
    template: `
        <div id = "top_cards">
            <div class="row row-col-2">
                <div class="col-4 offset-4">
                    <div class="row center-align">
                        <div class="col-6 g-0">
                            <img id="midCard" :src="'/assets/images/'+ midCard" alt="X" class="card_no_hover img-fluid">
                        </div>
                        <div class="col-6 g-0">
                            <img src="/assets/images/uno_back.png" alt="X" @click="takeCard()" class="card_stack img-fluid" id="take_card">
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="row">
            <div class="col-6 offset-3" v-if="currentstate === 'player1State' || currentstate === 'player2State'">
                <div class="row row-cols-3 g-0 center-align top-5">
                        <div class="col-sm-4 col-md-4 col-lg-3 col-xl-2 center-align" v-for="(card, index) in cards">
                            <img alt="X" @click='clickCard(index)' class="cards img-fluid" :src="'/assets/images/'+ card">
                        </div>
                </div>    
            </div>
        </div>
        <div class="row center-align top-5">
            <div class="col">
                <button id="next_player_button" type="button" @click="nextPlayer()" class="glow-on-hover">next player</button>
            </div>
        </div>


    `,
})
app.component('footer_play', {
    template: `
            <footer id="footer-play" class="fixed-bottom">
            <p>Created by: <a class="link" href="https://github.com/haasentimo">Timo Haas</a>
            and <a class="link" href="https://github.com/Bxnce">Bence Stuhlmann</a>
            - <a class="link" href=@routes.HomeController.about()>about</a></p>
            </footer>`
})
app.component('game_multiplayer', {
    data() {
        return {
            socket : undefined,
            value : '',
            parts : '',
            url : '',
            clickable : false,
            waiting: true,
            play_against : '',
            game_code : '',
            req : '',
            res : '',
            outer_all : '',
            row : '',
            currentstate : '',
            player_cards : [],
            wrapperd_cards : '',
            card : '',
            cards: [],
            midCard : 'uno_back.png',
        }
    },
    created() {
        this.webSocketInit()
        this.setGameCode()
    },
    methods: {
        webSocketInit() {
            let _this = this;
            this.socket = new WebSocket("ws://uno-web.herokuapp.com/ws/"+ this.getCookie("game"))
            this.socket.onopen = () => this.heartBeat();
            this.socket.onclose = () => console.log("Connection closed")
            this.socket.onmessage = function (event) {
                if(event.data !== "") {
                    if(event.data === "Keep alive"){
                        console.log("ping")
                    }else{
                        console.log("json reloaded");
                        console.log(JSON.parse(event.data));
                        _this.createCardsMultiplayer(JSON.parse(event.data));
                    }
                } else {
                    _this.socket.send("refresh");
                }
            }
            this.socket.onerror = () => console.log("that was a problem")

            setInterval(() => this.socket.send("Keep alive"), 20000); // ping every 20 seconds
        },
        getCookie(name) {
            this.value = `; ${document.cookie}`;
            this.parts = this.value.split(`; ${name}=`);
            if (this.parts.length === 2) return this.parts.pop().split(';').shift();
        },
        async clickCardMult(ind) {
            this.url = "/game_mult/place/" + ind + "/" + this.getCookie("game");
            await this.gameChanges(this.url)
        },
        async nextPlayerMult() {
            this.url = "/game_mult/next/" + this.getCookie("game");
            await this.gameChanges(this.url)
        },
        async takeCardMult() {
            this.url = "/game_mult/take/" + this.getCookie("game");
            await this.gameChanges(this.url)
        },
        setGameCode() {
            this.game_code = this.getCookie("game");
        },
        async createCardsMultiplayer(json) {
            this.waiting = false;
            this.midCard = json["game"].midCard["png_ind"][0]["card_png"];
            //-----------------------------------------
            this.currentstate = json["game"].currentstate;
            this.player_cards = [];
            this.clickable = false;
            if (this.currentstate === this.getCookie("player")) {
                if (json["game"].ERROR !== 0) {
                    alert("This card cannot be placed");
                }
                this.clickable = true;
                if(this.getCookie("pn") === "player1") {
                    this.player_cards = json["game"].player1["png_ind"];
                } else {
                    this.player_cards = json["game"].player2["png_ind"];
                }
            } else if (this.currentstate === "winState") {

            } else {
                if (this.getCookie("pn") === "player1") {
                    this.player_cards = json["game"].player1["png_ind"];
                    this.play_against = "playing against: " + json["game"].player2["name"] + " with " + json["game"].player2["kartenzahl"] + " cards left";
                } else {
                    this.player_cards = json["game"].player2["png_ind"];
                    this.play_against = "playing against: " + json["game"].player1["name"] + " with " + json["game"].player1["kartenzahl"] + " cards left";
                }


            }
            this.cards = [];
            this.player_cards.forEach(element => this.cards.push(element["card_png"]));
        },
        heartBeat() {
            this.socket.send("heartBeat");
        },
        async gameChanges(url) {
            this.res = await fetch(url, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json */*',
                    'Content-Type': 'application/json'},
                body: ""
            })
            if (this.res.ok) {
                await this.res.text();
                this.socket.send("refresh");
            } else {
                console.log("page failed loading");
            }
        }
    },
    template: `
        <div id = "top_cards">
            <div class="row row-col-2">
                <div class="col-4 offset-4">
                    <div class="row center-align">
                        <div class="col-6 g-0">
                            <img id="midCard" :src="'/assets/images/'+ midCard" alt="X" class="card_no_hover img-fluid">
                        </div>
                        <div class="col-6 g-0">
                            <img v-if="clickable === true" src="/assets/images/uno_back.png" alt="X" @click="takeCardMult()" class="card_stack img-fluid" id="take_card">
                            <img v-else src="/assets/images/uno_back.png" alt="X" class="card_stack img-fluid" id="take_card">
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="row">
            <div class="col-6 offset-3">
                <div class="row row-cols-3 g-0 center-align top-5">
                        <div class="col-sm-4 col-md-4 col-lg-3 col-xl-2 center-align" v-for="(card, index) in cards">
                            <img v-if="clickable === true" alt="X" @click='clickCardMult(index)' class="cards img-fluid" :src="'/assets/images/'+ card">
                            <img v-else alt="X" class="cards img-fluid" :src="'/assets/images/'+ card">
                        </div>
                </div>    
            </div>
        </div>
        <div class="row center-align top-5">
            <div class="col">
                <button v-if="waiting === true" id="next_player_button_mult" type="button" class="glow-on-hover" disabled>waiting for enemy.</button>
                <button v-else id="next_player_button_mult" type="button" @click="nextPlayerMult()" class="glow-on-hover">next player</button>
                <div v-if="waiting === true" style="font-size: 32px; color: white">Your game code is: {{ game_code }}</div>
            </div>
        </div>

    `,

})
app.component('home', {
    methods : {
      route(){
            window.location.href = "/game/setup";
      }
    },
    template: `
          <div class="row center-align">
          <div class="col">
              <div class="main_header">
                  The ultimative
              </div>
          </div>        
      </div>
      <div class="row center-align">
          <div class="col">
              <div class="main_header">
                UNO experience!
              </div>
          </div>    
      </div>
      <div class="row center-align">
            <div class="col">
                <button type="button" class="glow-on-hover" @click='route()'>
                    Start a Game!
                </button>
            </div>
      </div>`
})

app.component('about', {
    methods : {
        route(){
            window.location.href = "/game/setup";
        }
    },
    template: `<main class="about">
        <div class="div">
          <p>
            Uno is a highly popular card game played by millions around the globe. The game is for 2-10 players, ages 7 and over.
          </p>
          <p>
            <h1>Setup</h1>
            Every player starts with seven cards, and they are dealt face down. The rest of the cards are placed in a Draw Pile face down. Next to the pile a space should be designated for a Discard Pile. The top card should be placed in the Discard Pile, and the game
          </p>
          <button type="button" class="glow-on-hover" @click='route()'>
            Start a Game!
          </button>
        </div>
        <div class="div">
          <h1>Game Rules</h1>
            <table>
              <tr>
                <td>
                  1. The first player to play a card of the same color or number as the top card of the Discard Pile starts the game.
                </td>    
              </tr>
              <tr>
                <td>
                  2. The next player must play a card of the same color or number as the top card of the Discard Pile.
                </td>  
              </tr>  
              <tr>
                <td>
                  3. If a player does not have a card that matches the color or number of the top card of the Discard Pile, they must draw a card from the Draw Pile. If the card drawn matches the color or number of the top card of the Discard Pile, the player may play it.
                </td>
              </tr>
              <tr>
                <td>
                  4. If a player plays a Wild card, they may declare any color and play continues as normal.
                </td>
              </tr>
              <tr>
                <td>
                  5. If a player plays a Wild Draw Four card, the next player must draw 4 cards and their turn is skipped. The player who played the Wild Draw Four card may then declare any color and play continues as normal.
                </td>
              </tr>
              <tr>
                <td>
                  6. If a player plays a Draw Two card, the next player must draw 2 cards and their turn is skipped. Play then continues as normal.
                </td>  
              </tr>
              <tr>
                <td>
                  7. If a player plays a Skip card, the next player's turn is skipped. Play then continues as normal.
                </td>  
              </tr>
              <tr>
                <td>
                  8. If a player plays a Reverse card, the direction of play is reversed. Play then continues as normal.
                </td>  
              </tr>
              <tr>
                <td>
                  9. The game ends when one player has one card left. The player must shout "UNO!" If they forget and another player catches them, they must draw two cards. The player with one card left must match the color or number of the top card of the Discard Pile
                </td>  
              </tr>
            <table>   
        </div>
        <div class="div">
          <h3>UNO-Web is based on the project <a class="link" href="https://github.com/Bxnce/uno">"UNO"</a> of the Software Engineering lecture</h3>
          <p>
            Examples of the GUI of the SE game, and how it is used.
          </p>
          <details><summary>Create a game!</summary>
            <p>
                <img src="https://camo.githubusercontent.com/d81d592955eac7e66be5e119c412a892133ab51bd5003e401f796b9842d754da/68747470733a2f2f6d656469612e67697068792e636f6d2f6d656469612f42756f6d564e53646f4e537a4f34493030652f67697068792e676966" alt>
            </p>
            <p>
              To create a game, you need to enter the names of two players and press the "create game" button.
            </p>
        </details>
        <details><summary>Play the game!</summary>
            <p>
               <img src="https://camo.githubusercontent.com/6f9e307dc88ae9f1162ba2797d78286fabf73bc7deba3ef266964bc07f21713f/68747470733a2f2f6d656469612e67697068792e636f6d2f6d656469612f57484169456832474f534c3335535a41456f2f67697068792e676966" alt>
            </p>
            <p>
              After creating a game, you can press on the cards to place them or take a card with clicking on the card pile. 
              If a card can't be placed, there will be a popup message. The first one with no cards left wins.
            </p> 
      </details>
      </div>`
})
app.component('nav_bar', {
    methods : {
        route(ref){
            window.location.href = ref;
        }
    },
    template: `<nav class="navbar navbar-expand-lg navbar-dark set-colors">
                <div class="container-fluid">
                  <a class="navbar-brand" @click='route("/")'>UNO</a>
                  <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                    <span class="navbar-toggler-icon"></span>
                  </button>
                  <div class="collapse navbar-collapse" id="navbarNav">
                    <ul class="navbar-nav">
                      <li class="nav-item">
                        <a class="nav-link" aria-current="page" @click='route("/")'>Home</a>
                      </li>
                      <li class="nav-item">
                        <a class="nav-link" @click='route("/game/setup")'>StartGame</a>
                      </li>
                      <li class="nav-item">
                        <a class="nav-link" @click='route("/about")'>About</a>
                      </li>
                    </ul>
                  </div>
                </div>
              </nav>`
})
app.component('animation_load', {
    template: ` <div class="row left-align">
                    <div class="col">
                        <canvas id="loading"></canvas>
                    </div>
               </div>
               `
})
app.component('join_mp', {
    methods: {
        clicker() {
                let player2 = $("#player").val();
                let hash = $("#game_hash").val();
                if (player2 == "" || hash == "") {
                    alert("Please enter name and hash");
                } else {
                    this.setCookies("player2State", document.getElementById("game_hash").value);
                    window.location.href = "/game_mult/join/" + this.getCookie("game") + "/" + this.getCookie("name");
                }
        },
        createHash() {
            let result = '';
            let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
            let charactersLength = characters.length;
            for (let i = 0; i < 5; i++) {
                result += characters.charAt(Math.floor(Math.random() * charactersLength));
            }
            return result;
        },
        setCookies(state, hash, player) {
            if (hash === "") {
                document.cookie = "game=" + this.createHash();
            } else {
                document.cookie = "game=" + hash;
            }
            document.cookie = "pn=" + player;
            document.cookie = "player=" + state;
            document.cookie = "name=" + document.getElementById("player").value;
        },
        getCookie(name) {
            const value = `; ${document.cookie}`;
            const parts = value.split(`; ${name}=`);
            if (parts.length === 2) return parts.pop().split(';').shift();
        },
    },
    template: `
        <div class="row mt-3">
            <div class="col">
                <div class="d-flex justify-content-center">
                    <div class="input-field">
                        <input type="text" id="player" required />
                        <label for="player1">Name:</label>
                    </div>
                </div>
            </div>
        </div>
        <div class="row mt-3">
            <div class="col">
                <div class="d-flex justify-content-center">
                    <div class="input-field">
                        <input type="text" id="game_hash" required />
                        <label for="player1">Game Code:</label>
                    </div>
                </div>
            </div>
        </div>

        <div class="row mt-3">
            <div class="col">
                <div class="d-flex justify-content-center">
                    <button type="button" class="glow-on-hover" id="join_multiplayer_game" @click='clicker()'>
                        Join
                    </button>
                </div>
            </div>
        </div>`
})
app.component('prestart_state', {
    methods: {
        clicker(){
            let player1 = $("#player1").val();
            let player2 = $("#player2").val();
            if (player1 === "" || player2 === "") {
                alert("Please enter player names");
            } else {
                this.route("/game/start/" + player1 + "/" + player2);
            }
        },
        route(ref){
            window.location.href = ref;
        }
    },
    template: `
        <div class="row mt-3">
            <div class="col">
                <div class="d-flex justify-content-center">
                    <div class="input-field">
                        <input type="text" id="player1" content="test1" required />
                        <label for="player1">Player 1:</label>
                    </div>
                </div>
            </div>
        </div>
        <div class="row mt-3">
            <div class="col">
                <div class="d-flex justify-content-center">
                    <div class="input-field">
                        <input type="text" id="player2" content="test2" required />
                        <label for="player2">Player 2:</label>
                    </div>
                </div>
            </div>
        </div>
        <div class="row mt-3">
            <div class="col">
                <div class="d-flex justify-content-center">
                    <button type="button" class="glow-on-hover" id="create_game_bt" @click='clicker()'>
                        Start the Game!
                    </button>
                </div>
            </div>
        </div>
        <div class="row mt-3">
            <div class="col">
                <div class="d-flex justify-content-center">
                    <button type="button" class="glow-on-hover" id="get_to_mult" @click='route("/game_mult/setup_multiplayer")'>
                        Multiplayer
                    </button>
                </div>
            </div>
        </div>
    `
})
app.component('prestart_state_mult', {
    methods: {
        route(ref) {
            window.location.href = ref;
        },
        clicker() {
            this.setCookies("player1State", "", "player1");
            document.getElementById("player1_label").innerHTML = "Game code: " + this.getCookie("game");
            this.route("/game_mult/cc/" + this.getCookie("game")+"/"+this.getCookie("name"));
        },
        createHash() {
            let result = '';
            let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
            let charactersLength = characters.length;
            for (let i = 0; i < 5; i++) {
                result += characters.charAt(Math.floor(Math.random() * charactersLength));
            }
            return result;
        },
        setCookies(state, hash, player) {
            if (hash === "") {
                document.cookie = "game=" + this.createHash();
            } else {
                document.cookie = "game=" + hash;
            }
            document.cookie = "pn=" + player;
            document.cookie = "player=" + state;
            document.cookie = "name=" + document.getElementById("player").value;
        },
        getCookie(name) {
            const value = `; ${document.cookie}`;
            const parts = value.split(`; ${name}=`);
            if (parts.length === 2) return parts.pop().split(';').shift();
        },
    },
    template: `<div class="row mt-3">
            <div class="col">
                <div class="d-flex justify-content-center">
                    <div class="input-field">
                        <input type="text" id="player" required />
                        <label for="player" id="player1_label">Name:</label>
                    </div>
                </div>
            </div>
        </div>

        <div class="row mt-3">
            <div class="col">
                <div class="d-flex justify-content-center">
                    <button type="button" class="glow-on-hover" id="create_multiplayer_button" @click='clicker()'>
                        Create a Game
                    </button>
                </div>
            </div>
        </div>

        <div class="row mt-3">
            <div class="col">
                <div class="d-flex justify-content-center">
                    <button type="button" class="glow-on-hover" id="join_multiplayer" @click='route("/game_mult/prejoin")'>
                        Join a Game
                    </button>
                </div>
            </div>
        </div>`
})
app.mount('#container_all')
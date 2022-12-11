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
                            <img alt="X" @click=clickCard(index) class="cards img-fluid" :src="'/assets/images/'+ card"></img>
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
            <footer id="footer-play">
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
            this.socket = new WebSocket("ws://127.0.0.1:9000/ws/"+ this.getCookie("game"))
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
                            <img v-if="clickable === true" alt="X" @click=clickCardMult(index) class="cards img-fluid" :src="'/assets/images/'+ card">
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

app.mount('#container_game')
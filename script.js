

const valueBoard = $("#valueGrid");
const caseBoard = $("#caseGrid");
const playerBoard = $("#playerContainer");
const modifiers = $("#modifiers");
const gameSetupForm = $("#gameSetupForm");
const playerSetupList = $("#playerSetupList");
const newPlayerName = $("#newPlayerName");
const MAXPLAYERCOUNT = 10;
const ROUNDS = 8;

let playerCount = 0;
let modifierCount = 0;
let totalCases = 0;

let penaltyList = [];

let game;

$("#testButton").on("click", () => {
    $("#gameSetupBackdrop").fadeOut();
})

$("#addPlayer").on("click", () => {
    addPlayerToList();
})

$("#newPlayerName").on("keypress", (event) => {
    if(event.key === "Enter"){
        event.preventDefault();
        addPlayerToList();
    }
})

function GameState(playerCount, modifierNumber, playerList){
    this.rounds = 8;
    this.playerCount = playerCount;
    this.modifierNumber = modifierNumber;
    this.players = playerList;
    this.penaltyList = [];
    this.modifierList = [];
}

function Player(name){
    this.name = name;
    this.score = 0;
    this.selectedCase = null;
}

gameSetupForm.on("submit", (event) => {
    event.preventDefault();
    if(playerSetupList[0].children.length <= 1){
        alert("Must have at least 2 players to start!");
    }
    else {
        const modifierSetting = gameSetupForm[0].modifierSetting.value
        playerCount = playerSetupList[0].children.length;
        modifierCount = modifierSetting === 'low' ? 2 : modifierSetting === 'medium' ? (playerCount * (ROUNDS / 4)) : (playerCount * (ROUNDS / 2));
        $("#gameSetupBackdrop").fadeOut()
        initializeGame();
    }
})


function addPlayerToList() {
    if(playerSetupList[0].children.length > MAXPLAYERCOUNT){
        alert("Cannot add any more players!");
    }
    else if(newPlayerName[0].value !== ""){
        const newName = newPlayerName[0].value;
        const newPlayerElement = document.createElement("li");
        $(newPlayerElement).text(newName).addClass("setupPlayer");
        playerSetupList.append(newPlayerElement);
        newPlayerName[0].value = "";
    }
}

function shuffle(arr) {
    let currentIndex = arr.length;
    while(currentIndex != 0){
        let randIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [arr[currentIndex], arr[randIndex]] = [arr[randIndex], arr[currentIndex]];
    }
}

function initializeGame() {
    const genPlayers = () => {
        let pList = [];
        playerSetupList.children().each((_, p) => {
            const playerObject = new Player(p.innerText);
            pList = [...pList, playerObject];
        });
        return pList;
    }
    game = new GameState(playerCount, modifierCount, genPlayers());
    totalCases = ROUNDS * playerCount;
    $(valueBoard).css("grid-template-columns", "repeat(" + ROUNDS + ", 50px)").css("grid-template-rows", "repeat(" + playerCount + ", 50px)");
    $(caseBoard).css("grid-template-columns", "repeat(" + ROUNDS + ", 50px)").css(("grid-template-rows", "repeat(" + playerCount + ", 50px)"));
    shuffle(game.players);


    loadPenalties();
    loadModifiers();
    loadCases();
    loadPlayers();
}

function generatePenaltyList(cases) {
    let penList = [];
    penList = [...penList, [].fill(1, 0, (cases/(ROUNDS/2))-1)];
    penList = [...penList, [].fill(2, 0, (cases/(ROUNDS/4)))];
    penList = [...penList, [].fill(3, 0, (cases/(ROUNDS/8)))];
    penList = [...penList, [].fill(4, 0, (cases/(ROUNDS/8)))];
    penList = [...penList, 5];
}

function loadPenalties() {
    for(let i = 0; i < (totalCases/(ROUNDS/4))-1; i++){
        const newVal = document.createElement("div");
        $(newVal).addClass("value onePenalty").text("1");
        $(valueBoard).append(newVal);
    }
    for(let i = 0; i < (totalCases/(ROUNDS/2)); i++){
        const newVal = document.createElement("div");
        $(newVal).addClass("value twoPenalties").text("2");
        $(valueBoard).append(newVal);
    }
    for(let i = 0; i < (totalCases/ROUNDS); i++){
        const newVal = document.createElement("div");
        $(newVal).addClass("value threePenalties").text("3");
        $(valueBoard).append(newVal);
    }
    for(let i = 0; i < (totalCases/ROUNDS); i++){
        const newVal = document.createElement("div");
        $(newVal).addClass("value fourPenalties ").text("4");
        $(valueBoard).append(newVal);
    }
    const newVal = document.createElement("div");
    $(newVal).addClass("value maxPenalty").text("Max");
    $(valueBoard).append(newVal);

}
function loadModifiers() {

}
function loadPlayers() {
    $(game.players).each((_, p) => {
        const playerElement = document.createElement("div");
        $(playerElement).addClass("player").text(p.name);
        $(playerBoard).append(playerElement);
    })
}

function loadCases() {
    for(let i = 0; i < totalCases; i++){
        const newCase = document.createElement("button");
        $(newCase).addClass("case").text(i+1);
        $(caseBoard).append(newCase);
    }
}

function shuffleValues() {

}

// Animation Functions
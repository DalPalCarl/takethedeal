

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

$(valueBoard).css("grid-template-columns", "repeat(" + ROUNDS + ", 1fr)");
$(caseBoard).css("grid-template-columns", "repeat(" + (ROUNDS-2) + ", 1fr)");
$(modifiers).css("grid-template-columns", "repeat(" + ROUNDS + ", 1fr");

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

function removePlayerFromList() {

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
    const modifierSetting = gameSetupForm[0].modifierSetting.value
    playerCount = playerSetupList[0].children.length;
    totalCases = ROUNDS * playerCount;
    modifierCount = modifierSetting === 'low' ? 1 
        : modifierSetting === 'medium' ? (totalCases/8) 
        : (totalCases/4);
    
    game = new GameState(playerCount, modifierCount, generatePlayers());
    
    shuffle(game.players);

    game.penaltyList = generatePenaltyList(totalCases);
    loadPenalties(totalCases, game.penaltyList);
    shuffle(game.penaltyList);
    game.modifierList = generateModifierList(totalCases, modifierCount)
    const modifierData = game.modifierList.slice(0, modifierCount*2);
    loadModifiers(modifierData);
    shuffle(game.modifierList);
    loadCases();
    loadPlayers();
}

function generatePlayers() {
    let pList = [];
    playerSetupList.children().each((_, p) => {
        const playerObject = new Player(p.innerText);
        pList = [...pList, playerObject];
    });
    return pList;
}

function generatePenaltyList(cases) {
    let penList = [];
    penList.push(...Array((cases/(ROUNDS/4))-1).fill(1));
    penList.push(...Array(cases/(ROUNDS/2)).fill(2));
    penList.push(...Array(cases/ROUNDS).fill(3));
    penList.push(...Array(cases/ROUNDS).fill(4));
    penList.push(5);
    return penList;
}

function generateModifierList(cases, setting) {
    let modList = [];
    for(let i = 0; i < setting; i++){
        modList.push(2);
        modList.push(3);
    }
    modList.push(...Array(cases-(setting*2)).fill(null));
    return modList;
}

function loadPenalties(totalCases, pList) {
    for(let i = 0; i < totalCases; i++){
        const newVal = document.createElement("div");
        switch (pList[i]){
            case 1:
                $(newVal).addClass("value onePenalty").text("1");
                break;
            case 2:
                $(newVal).addClass("value twoPenalties").text("2");
                break;
            case 3:
                $(newVal).addClass("value threePenalties").text("3");
                break;
            case 4:
                $(newVal).addClass("value fourPenalties").text("4");
                break;
            case 5:
                $(newVal).addClass("value maxPenalty").text("Max");
            }
        $(valueBoard).append(newVal);
    }
}
function loadModifiers(modifierData) {
    modifierData.forEach((mod) => {
        const modElement = document.createElement("div");
        $(modElement).addClass("modifier").text(mod + "X");
        $(modifiers).append(modElement);
    })
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

// Animation Functions


const valueBoard = $("#valueGrid");
const caseBoard = $("#caseGrid");
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
        //console.log("Players: ", playerCount, " : Modifiers: ", modifierCount);

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

function shuffle() {

}

function initializeGame() {
    totalCases = ROUNDS * playerCount;
    $(valueBoard).css("grid-template-columns", "repeat(" + ROUNDS + ", 50px)").css("grid-template-rows", "repeat(" + playerCount + ", 50px)");
    $(caseBoard).css("grid-template-rows", playerCount);
    loadValues();
    loadModifiers();
    loadCases();
    loadPlayers();
}

function generateValues() {
    
}

function loadValues() {
    let caseIndex = 1;
    for(let i = 0; i < (totalCases/(ROUNDS/4))-1; i++){
        const newVal = document.createElement("div");
        $(newVal).addClass("value onePenalty").text("1");
        $(valueBoard).append(newVal);
        caseIndex++;
    }
    for(let i = 0; i < (totalCases/(ROUNDS/2)); i++){
        const newVal = document.createElement("div");
        $(newVal).addClass("value twoPenalties").text("2");
        $(valueBoard).append(newVal);
        caseIndex++;
    }
    for(let i = 0; i < (totalCases/ROUNDS); i++){
        const newVal = document.createElement("div");
        $(newVal).addClass("value threePenalties").text("3");
        $(valueBoard).append(newVal);
        caseIndex++;
    }
    for(let i = 0; i < (totalCases/ROUNDS); i++){
        const newVal = document.createElement("div");
        $(newVal).addClass("value fourPenalties ").text("4");
        $(valueBoard).append(newVal);
        caseIndex++;
    }
    const newVal = document.createElement("div");
    $(newVal).addClass("value maxPenalty").text("Max");
    $(valueBoard).append(newVal);

}
function loadModifiers() {

}
function loadPlayers() {

}
function loadCases() {

}

function shuffleValues() {

}

// Animation Functions
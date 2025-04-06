

const valueBoard = $("#values");
const caseBoard = $("#caseContainer");
const modifiers = $("#modifiers");
const gameSetupForm = $("#gameSetupForm");
const playerSetupList = $("#playerSetupList");
const newPlayerName = $("#newPlayerName");
const MAXPLAYERCOUNT = 10;
const ROUNDS = 8;

let playerCount = 0;
let modifierCount = 0;

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

function initializeGame() {
    loadValues();
    loadModifiers();
    loadCases();
    loadPlayers();
}

function loadValues() {

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
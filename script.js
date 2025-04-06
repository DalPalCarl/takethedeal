

const valueBoard = $("#values");
const caseBoard = $("#caseContainer");
const modifiers = $("#modifiers");
const gameSetupForm = $("#gameSetupForm");
const playerSetupList = $("#playerSetupList");
const newPlayerName = $("#newPlayerName");

$("#addPlayer").on("click", () => {
    if(newPlayerName[0].value !== ""){
        const newName = newPlayerName[0].value;
        const newPlayerElement = document.createElement("li");
        $(newPlayerElement).text(newName).addClass("setupPlayer");
        playerSetupList.append(newPlayerElement);
        newPlayerName[0].value = "";
    }
})

gameSetupForm.on("submit", (event) => {
    event.preventDefault();
    $("#gameSetupBackdrop").fadeOut()
    // console.log(gameSetupForm[0].playerCount.value);
    // console.log(gameSetupForm[0].modifierSetting.value);
})



function initializeGame() {

}

function shuffleValues() {

}

// Animation Functions
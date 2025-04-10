

const valueBoard = $("#valueGrid");
const caseBoard = $("#caseGrid");
const playerBoard = $("#playerContainer");
const modifiers = $("#modifiers");
const gameSetupForm = $("#gameSetupForm");
const playerSetupList = $("#playerSetupList");
const newPlayerName = $("#newPlayerName");
const revealCaseElement = $("#caseRevealCaseFront");
const MAXPLAYERCOUNT = 10;
const ROUNDS = 8;

let playerCount = 0;
let modifierCount = 0;
let totalCases = 0;

let penaltyList = [];

let game;

$("#caseRevealContainer").hide();
$("#closeCaseRevealModalButton").hide();

$("#addPlayer").on("click", () => {
    addPlayerToList();
})

$("#newPlayerName").on("keypress", (event) => {
    if(event.key === "Enter"){
        event.preventDefault();
        addPlayerToList();
    }
})

$(valueBoard).css("grid-template-columns", "repeat(" + (ROUNDS+2) + ", 1fr)");
$(caseBoard).css("grid-template-columns", "repeat(" + (ROUNDS) + ", 1fr)");
$(modifiers).css("grid-template-columns", "repeat(" + (ROUNDS+2) + ", 1fr");

function GameState(playerCount, modifierNumber, playerList){
    this.round = 0;
    this.roundStep = 0;
    this.playerCount = playerCount;
    this.modifierNumber = modifierNumber;
    this.players = playerList;
    this.penaltyList = [];
    this.modifierList = [];
}

function Player(name){
    this.name = name;
    this.score = 0;
    this.maxPenalty = false;
    this.selectedCase = null;
}

gameSetupForm.on("submit", (event) => {
    event.preventDefault();
    if(playerSetupList[0].children.length <= 1){
        alert("Must have at least 2 players to start!");
    }
    else {
        $("#backdrop").fadeOut();
        $("#gameSetup").fadeOut();
        initializeGame();
        startFirstRound();
    }
})


function addPlayerToList() {
    if(playerSetupList[0].children.length >= MAXPLAYERCOUNT){
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
    }
    for(let i = 0; i < setting; i++){
        modList.push(3);
    }
    modList.push(...Array(cases-(setting*2)).fill(null));
    return modList;
}

function loadPenalties(totalCases, pList) {
    for(let i = 0; i < totalCases; i++){
        const newVal = document.createElement("div");
        $(newVal).css("transform", "scale(0)");
        switch (pList[i]){
            case 1:
                $(newVal).addClass("value onePenalty teko text-thicc").text("1").css("animation", "popIn 1000ms " + (20 * i) + "ms forwards");
                break;
            case 2:
                $(newVal).addClass("value twoPenalties teko text-thicc").text("2").css("animation", "popIn 1000ms " + (20 * i) + "ms forwards");
                break;
            case 3:
                $(newVal).addClass("value threePenalties teko text-thicc").text("3").css("animation", "popIn 1000ms " + (20 * i) + "ms forwards");
                break;
            case 4:
                $(newVal).addClass("value fourPenalties teko text-thicc").text("4").css("animation", "popIn 1000ms " + (20 * i) + "ms forwards");
                break;
            case 5:
                $(newVal).addClass("value maxPenalty teko text-thicc").html("<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'><!--!Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.--><path d='M416 398.9c58.5-41.1 96-104.1 96-174.9C512 100.3 397.4 0 256 0S0 100.3 0 224c0 70.7 37.5 133.8 96 174.9c0 .4 0 .7 0 1.1l0 64c0 26.5 21.5 48 48 48l48 0 0-48c0-8.8 7.2-16 16-16s16 7.2 16 16l0 48 64 0 0-48c0-8.8 7.2-16 16-16s16 7.2 16 16l0 48 48 0c26.5 0 48-21.5 48-48l0-64c0-.4 0-.7 0-1.1zM96 256a64 64 0 1 1 128 0A64 64 0 1 1 96 256zm256-64a64 64 0 1 1 0 128 64 64 0 1 1 0-128z'/></svg>")
                .css("animation", "popIn 1000ms " + (20 * i) + "ms forwards");
            }
        $(valueBoard).append(newVal);
    }
}
function loadModifiers(modifierData) {
    modifierData.forEach((mod, i) => {
        const modElement = document.createElement("div");
        $(modElement).css("transform", "scale(0)");
        $(modElement).addClass("modifier teko text-thicc").text(mod + "X").css("animation", "popIn 1000ms " + (30 * i) + "ms forwards");
        $(modifiers).append(modElement);
    })
}

function loadPlayers() {
    $(game.players).each((i, p) => {
        const playerElement = document.createElement("div");
        const playerName = document.createElement("p");
        $(playerName).text(p.name).addClass("playerName");
        $(playerElement).css("transform", "scale(0)");
        $(playerElement).addClass("player teko")
            .append(playerName)
            .css("animation", "popIn 1000ms " + (200 * i) + "ms forwards");
        $(playerBoard).append(playerElement);
    })
}

function loadCases() {
    for(let i = 0; i < totalCases; i++){
        const newCase = document.createElement("button");
        $(newCase).css("transform", "scale(0)");
        $(newCase).addClass("case teko").text(i+1)
            .prop("--anim-delay", `${(20 * i)}ms`)
            .addClass("popIn");
        newCase.addEventListener("click", () => handleCaseClicked(newCase, i));
        $(caseBoard).append(newCase);
    }
}

function initializeGame() {
    const modifierSetting = gameSetupForm[0].modifierSetting.value
    playerCount = playerSetupList[0].children.length;
    totalCases = ROUNDS * playerCount;
    modifierCount = modifierSetting === 'low' ? 1 
        : modifierSetting === 'medium' ? (totalCases/ROUNDS) 
        : (totalCases/(ROUNDS/2));
    
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

function startFirstRound() {
    $(playerBoard).children().first().addClass("playerTurn");
    // $(playerBoard.children()).each((_, player) => {
    //     console.log(player);
    // })
}

function handleCaseClicked(clickedCase, index) {
    $(clickedCase).addClass("caseSelected")
        .css("animation", "pressDown 1000ms forwards")
        .prop("disabled", true);
    if(game.round === 0){
        const activePlayer = game.players[game.roundStep];
        const selectedCaseElem = document.createElement("div");
        activePlayer.selectedCase = index;
        $(selectedCaseElem).addClass("playerSelectedCase").text(index+1)
            .css("animation", "popIn 500ms ease-out forwards");
        $(".playerTurn").append(selectedCaseElem);
        progressGameStep();
    }
    else{
        revealCase(clickedCase, index);
    }
    // console.log(clickedCase, game.penaltyList[index]);
}

function revealCase(clickedCase, index) {
    $("#backdrop").fadeIn();
    revealCaseElement.addClass("caseStyle").text(index+1);
    updatePlayerScore(game.players[game.roundStep], game.penaltyList[index], game.modifierList[index]);
    $("#caseRevealContainer").fadeIn(1000, () => {
        $("#caseRevealCase").css("animation", "caseRevealDown 1500ms ease-in").delay(1000 + (Math.random() * 5000))
            .one("animationend", () => {
                const penaltyClass = findPenaltyClass(index);
                const penaltyElement = $("#valueGrid").find($("."+ penaltyClass + "")).first();
                revealCaseElement.removeClass("caseStyle").addClass(penaltyClass).text(penaltyElement.text());
                $("#caseRevealCase").css("animation", "caseRevealUp 1000ms cubic-bezier(0.17, 0.2, 0, 1.3)")
                .one("animationend", () => {
                    $("#closeCaseRevealModalButton").delay(2000).fadeIn("slow")
                        .one("click", () => {
                            handleContinueButton(penaltyElement, penaltyClass);
                            $("#caseRevealCase").css("animation", "none");
                    });
                })
            })
    });
}

function handleContinueButton(penaltyElem, penaltyClass) {
    $("#backdrop").hide();
    $("#closeCaseRevealModalButton").hide();
    $("#caseRevealContainer").hide();
    penaltyElem.css("animation", "pressDownPenalty 1000ms forwards")
        .one("animationend", () => {
            penaltyElem.removeClass(penaltyClass);
            revealCaseElement.removeClass(penaltyClass);
        });
    progressGameStep();
}

function updatePlayerScore(player, score, mod){
    console.log(player.name, " | ", score, " | ", mod);
}

function findPenaltyClass(i) {
    switch(game.penaltyList[i]){
        case 1:
            return "onePenalty";
        case 2:
            return "twoPenalties";
        case 3:
            return "threePenalties";
        case 4:
            return "fourPenalties";
        case 5:
            return "maxPenalty";
    }
}

function progressGameStep() {
    // 1) Query active cases, check if equals 1
    // 2) Else, we check the current round. If it is less than ROUNDS,
    //    we keep playing as normal
    // 3) If the round is equal to ROUNDS, then we initiate the DoND round
    const casesLeft = $(".case").length - $(".caseRevealed").length;
    if(casesLeft > 1){
        if(game.round === ROUNDS){
            console.log("LAST ROUND");
        }
        else if(game.round > ROUNDS){
            console.log("Players left to pick cases!");
        }
        else{
            // do regular selection process
            const prevPlayer = playerBoard.children()[game.roundStep];
            $(prevPlayer).removeClass("playerTurn");

            game.roundStep++;
            if(game.roundStep === playerCount){
                game.roundStep = 0;
                game.round++;
            }

            const nextPlayer = playerBoard.children()[game.roundStep];
            $(nextPlayer).addClass("playerTurn");
        }
    }
}

// Animation Functions

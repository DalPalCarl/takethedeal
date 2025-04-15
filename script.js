

const valueBoard = $("#valueGrid");
const caseBoard = $("#caseGrid");
const playerBoard = $("#playerContainer");
const modifiers = $("#modifiers");
const gameSetupForm = $("#gameSetupForm");
const playerSetupList = $("#playerSetupList");
const newPlayerName = $("#newPlayerName");
const revealCaseElement = $("#caseRevealCaseFront");
const MAXPLAYERCOUNT = 10;
const ROUNDS = 2;

let playerCount = 0;
let modifierCount = 0;
let totalCases = 0;

let penaltyList = [];

let game;

// $("#gameSetup").hide();

$("#caseRevealContainer").hide();
$("#closeCaseRevealModalButton").hide();
$("#dondChoiceContainer").hide();
$("#endGameContainer").hide();

$("#addPlayer").on("click", () => {
    addPlayerToList();
});

$("#newPlayerName").on("keypress", (event) => {
    if(event.key === "Enter"){
        event.preventDefault();
        addPlayerToList();
    }
});

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
    this.scoreHigh = 0;
    this.scoreLow = Number.MAX_VALUE;
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
                $(newVal).addClass("value maxPenalty teko").html("<span>&#128369;</span>")
                .css("animation", "popIn 1000ms " + (20 * i) + "ms forwards");
            }
        $(valueBoard).append(newVal);
    }
}

function loadModifiers(modifierData) {
    modifierData.forEach((mod, i) => {
        const modElement = document.createElement("div");
        $(modElement).addClass("modifier modifierShown teko text-thicc").text("X").css("animation", "popIn 1000ms " + (30 * i) + "ms forwards");
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
        revealCase(index);
        $(clickedCase).addClass("caseRevealed");
        if(game.round > ROUNDS){
            $(game.players[game.roundStep]).addClass("playerFinished");
        }
    }
    // console.log(clickedCase, game.penaltyList[index]);
}

function revealCase(index) {
    $("#backdrop").fadeIn();
    revealCaseElement.addClass("caseStyle").text(index+1);
    $("#caseRevealText").text(game.players[game.roundStep].name);
    updatePlayerScore(game.players[game.roundStep], game.penaltyList[index], null);
    $("#caseRevealContainer").fadeIn(1000, () => {
        $("#caseRevealCase").css("animation", "caseRevealDown 1500ms ease-in forwards")
            .one("animationend", () => {
                const penaltyClass = findPenaltyClass(index);
                const penaltyElement = $("#valueGrid").find($("." + penaltyClass)).last();
                revealCaseElement.removeClass("caseStyle").addClass(penaltyClass).text(penaltyElement.text());
                $("#caseRevealCase").css("animation", "caseRevealUp 1000ms cubic-bezier(0.17, 0.2, 0, 1.3)")
                .one("animationend", () => {
                    if (game.modifierList[index]){
                        const modifierElem = $("#modifiers").find($(".modifierShown")).last();
                        $("#caseRevealModifier").addClass("modifierAppear").one("animationend", () => {
                            $("#closeCaseRevealModalButton").delay(2000).fadeIn("slow")
                                .one("click", () => {
                                    handleContinueButton(penaltyElement, penaltyClass, modifierElem);
                                    $("#caseRevealCase").css("animation", "none");
                                    $("#caseRevealModifier").removeClass("modifierAppear");
                            });
                        })
                    }
                    else {
                        $("#closeCaseRevealModalButton").delay(2000).fadeIn("slow")
                            .one("click", () => {
                                handleContinueButton(penaltyElement, penaltyClass, null);
                                $("#caseRevealCase").css("animation", "none");
                        });
                    }
                })
            })
    });
}

function handleContinueButton(penaltyElem, penaltyClass, modElem) {
    $("#backdrop").hide();
    $("#closeCaseRevealModalButton").hide();
    $("#caseRevealContainer").hide();
    penaltyElem.css("animation", "pressDownPenalty 1000ms forwards")
        .one("animationend", () => {
            penaltyElem.removeClass(penaltyClass);
            revealCaseElement.removeClass(penaltyClass);
        });
    if(modElem){
        modElem.removeClass("modifierShown")
            .css("animation", "pressDownPenalty 1000ms forwards");
    }
    progressGameStep();
}

function updatePlayerScore(player, score, mod){
    player.score += score;
    game.scoreHigh = Math.max(player.score, game.scoreHigh);
    game.scoreLow = Math.min(player.score, game.scoreLow);
}


//Takes penalty number as input, returns associated penalty class style name
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

    $(playerBoard.children()[game.roundStep]).removeClass("playerTurn");

    if(casesLeft === 0){
        endGame();
        return;
    }

    if(game.round > ROUNDS){
        console.log("Players left to pick cases!");
    }
    // do regular selection process
    
    
    game.roundStep++;
    if(game.roundStep === playerCount){
        game.round++;
        game.roundStep = 0;
    }
    console.log(game.roundStep);
    
    const nextPlayer = playerBoard.children()[game.roundStep];
    if(nextPlayer.classList.contains("playerFinished")){
        progressGameStep();
        return;
    }
    $(nextPlayer).addClass("playerTurn");
    if(casesLeft === 1){
        const i = findLastCase();
        $(nextPlayer).addClass("playerFinished");
        revealCase(i);
        return;
    }
    if(game.round === ROUNDS){
        offerChoice(game.players[game.roundStep]);
    }
}

function findLastCase(){
    let index = 0;
    caseBoard.children().toArray().forEach((c, i) => {
        if(!c.classList.contains("caseRevealed")){
            $(c).addClass("caseRevealed");
            index = i;
        }
    });
    return index;
}

function offerChoice(player) {
    $("#dondChoiceText").text(player.name);
    $("#dondChoiceCase").text(player.selectedCase+1);
    $("#backdrop").fadeIn();
    $("#dondChoiceContainer").fadeIn();
    const drinkButton = document.getElementById("dondDrink");
    const noDrinkButton = document.getElementById("dondNoDrink");
    drinkButton.onclick = () => {
        handleDrink(player);
    }
    noDrinkButton.onclick = () => {
        handleNoDrink(player);
        progressGameStep();
    }
}

function handleDrink(player){
    $("#dondChoiceContainer").hide();
    revealCase(player.selectedCase);
    $(caseBoard.children()[player.selectedCase]).addClass("caseRevealed");
    $(playerBoard.children()[game.roundStep]).addClass("playerFinished");
}

function handleNoDrink(player){
    $("#backdrop").fadeOut();
    $("#dondChoiceContainer").fadeOut();
    $($(playerBoard.children().get(game.roundStep)).children().get(1)).hide();
    $(caseBoard.children()[player.selectedCase]).removeClass("caseSelected").prop("disabled", false)
        .css("animation", "pressDown 1000ms ease-in-out forwards reverse");
}

function endGame(){
    console.log("End Game");
    $("#backdrop").fadeIn();
    $("#endGameContainer").fadeIn();
    game.players.forEach((p, i) => {
        const playerItem = document.createElement('div');
        const playerScore = document.createElement('div');
        const playerName = document.createElement('p');
        
        $(playerScore).addClass("playerScore").text(p.score);
        if(p.score === game.scoreHigh){$(playerScore).addClass("highest");}
        else if(p.score === game.scoreLow){$(playerScore).addClass("lowest");}
        if(p.maxPenalty){$(playerScore).addClass("max");}

        $(playerName).addClass("playerName").text(p.name);
        $(playerItem).addClass("text-thicc playerStat").append(playerScore, playerName).prop("animation-delay", (i * 500) + "ms")
            .css("animation", "popIn 1000ms ease-in-out forwards");;

        $("#endGamePlayerStats").append(playerItem);
    });

    $("#backToGameSetup").onclick = () => {
        $("#endGameContainer").hide();
        $("#gameSetup").fadeIn();
    }

}


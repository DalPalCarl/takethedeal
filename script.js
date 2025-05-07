const valueBoard = $("#valueGrid");
const caseBoard = $("#caseGrid");
const playerBoard = $("#playerContent");
const modifiers = $("#modifiers");
const gameSetupForm = $("#gameSetupForm");
const playerSetupList = $("#playerSetupList");
const playerSelectList = $("#modifierPlayerSelection")
const newPlayerName = $("#newPlayerName");
const revealCaseElement = $("#caseRevealCaseFront");
const modifierPlayerSelection = $("#modifierPlayerSelection");
const MAXPLAYERCOUNT = 20;
const ROUNDS = 8;



const audioContext = new AudioContext();
const gainNode = new GainNode(audioContext);
gainNode.connect(audioContext.destination);
const volumeSlider = document.getElementById("volumeSlider");

const audio = new Audio("./sound/caseRevealDown.wav");
const source = audioContext.createMediaElementSource(audio);
source.connect(gainNode);




let playerCount = 0;
let modifierCount = 0;
let totalCases = 0;

let penaltyList = [];

let game;

const triviaCall = async function() {
    return await fetch("https://opentdb.com/api.php?amount=1&type=multiple")
        .then(res => {
            return res.json();
        })
        .then(data => {
            return data;
        })
};

let triviaQuestion;
async function getTriviaQuestion() {
    triviaQuestion = await triviaCall();
}

let audioElem;

// $("#gameSetup").hide();
$(document).ready(() => {
    $("#caseRevealContainer").hide();
    $("#closeCaseRevealModalButton").hide();
    $("#dondChoiceContainer").hide();

    $("#endGameContainer").hide();
    $("#modifierContainer").hide();

    $("#triviaQuestionText").hide();
    $("#triviaAnswerList").hide();
    $("#triviaQuestionResultText").hide();

    $("#dareText").hide();
    $("#dareCompleted").hide();
    $("#dareNotCompleted").hide();

    
    $("#addPlayerButton").on("click", () => {
        addPlayerToList();
    });
    
    $("#newPlayerName").on("keypress", (event) => {
        if(event.key === "Enter"){
            event.preventDefault();
            addPlayerToList();
        }
    });

    function getBoard(board) {
        const oldBoard = board === "values" ? $("#valueContainer") : board === "cases" ? $("#caseContainer") : $("#playerContainer");
        return oldBoard;
    }

    function removeActiveClass() {
        const oldBoardNav = $("#gameBoardNav").children(".active").get(0);
        $(oldBoardNav).removeClass("active")
        const oldBoardComponent = getBoard(oldBoardNav.dataset.component);
        $(oldBoardComponent).removeClass("active");
    }

    function addActiveClass(board, navButton) {
        navButton.addClass("active");
        const boardComponent = getBoard(board);
        boardComponent.addClass("active");
        if(game.round === ROUNDS){
            if(board === "cases"){
                $("#dondChoiceContainer").show();
            }
            else{
                $("#dondChoiceContainer").hide();
            }
        }
    }

    $("#navValueButton").on("click", () => {
        removeActiveClass("values");
        addActiveClass("values", $("#navValueButton"));
    });

    $("#navCaseButton").on("click", () => {
        removeActiveClass("cases");
        addActiveClass("cases", $("#navCaseButton"));
    })

    $("#navPlayerButton").on("click", () => {
        removeActiveClass("players");
        addActiveClass("players", $("#navPlayerButton"));
    })
    
    volumeSlider.addEventListener("input", () => {
        gainNode.gain.value = volumeSlider.value;
    });

    assignModifierJSON();
    
})

async function getModifierJSON() {
    return await fetch("./modifierTypes.json")
        .then(res => res.json())
        .then(data => {return data})
        .catch(err => console.error("Error loading JSON:", err));
};

let modifierTypes;
async function assignModifierJSON() {
    modifierTypes = await getModifierJSON();
}


function GameState(playerCount, modifierNumber, playerList){
    this.round = 0;
    this.roundStep = 0;
    this.playerCount = playerCount;
    this.modifierNumber = modifierNumber;
    this.players = playerList;
    this.penaltyList = [];
    this.modifierList = [];
    this.modifierTypes = modifierTypes;
    this.scoreHigh = 0;
    this.scoreLow = 0;
}

function Player(name){
    this.name = name;
    this.score = 0;
    this.maxPenalty = false;
    this.selectedCase = null;
}

gameSetupForm.on("submit", (event) => {
    event.preventDefault();
    if(playerSetupList[0].children.length <= 2){
        alert("Must have at least 3 players to start!");
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
        newPlayerElement.onclick = () => {
            newPlayerElement.remove();
        }
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

//Our GENERATE functions build the data for our game object

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
    penList.push(...Array((cases/(ROUNDS/2))-1).fill(0));
    penList.push(...Array((cases/(ROUNDS/2))).fill(1));
    penList.push(...Array(cases/(ROUNDS/2)).fill(2));
    penList.push(...Array(cases/ROUNDS).fill(3));
    penList.push(...Array(cases/ROUNDS).fill(4));
    penList.push(5);
    return penList;
}

function generateModifierList(cases, setting) {
    let modList = [];
    for(let i = 0; i < setting; i++){
        const randIndex = Math.floor(Math.random() * game.modifierTypes.length);
        modList.push(game.modifierTypes[randIndex]);
    }
    modList.sort((a, b) => a.mod.localeCompare(b.mod, "en"));
    modList.push(...Array(cases-setting).fill(null));
    return modList;
}

//Our LOAD functions build the UI components from the data we previously built

function loadPenalties(totalCases, pList) {
    for(let i = 0; i < totalCases; i++){
        const newVal = document.createElement("div");
        $(newVal).css("transform", "scale(0)");
        switch (pList[i]){
            case 0:
                $(newVal).addClass("value zeroPenalty teko text-thicc").text("0").css("animation", "popIn 1000ms " + (20 * i) + "ms forwards");
                break;
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
                $(newVal).addClass("value maxPenalty bokor text-thicc").text("M")
                .css("animation", "popIn 1000ms " + (20 * i) + "ms forwards");
            }
        $(valueBoard).append(newVal);
    }
}

function loadModifiers(modifierData) {
    modifierData.forEach((mod, i) => {
        const modElement = document.createElement("div");
        $(modElement).addClass("modifier modifierShown bokor text-thicc").text(mod.mod).css("animation", "popIn 1000ms " + (30 * i) + "ms forwards");
        $(modifiers).append(modElement);
    })
}

function loadPlayers() {
    $(game.players).each((i, p) => {
        const playerElement = document.createElement("div");
        const playerName = document.createElement("p");
        const scoreContainer = document.createElement("div");
        $(playerName).text(p.name).addClass("playerName");
        $(playerElement).css("transform", "scale(0)");
        $(scoreContainer)
            .html("<p style='font-size: 1rem;' class='playerScoreInfo'>Score</p><p style='font-size: 2rem;' class='playerScoreInfo playerScoreValue'>0</p>")
            .addClass("playerScoreContainer");
        $(playerElement).addClass("player teko")
            .append(playerName)
            .append(scoreContainer)
            .css("animation", "popIn 1000ms " + (200 * i) + "ms forwards");
        $(playerBoard).append(playerElement);
    })
}

function loadPlayerSelection() {
    $(game.players).each((_, p) => {
        const player = document.createElement('li');
        $(player).text(p.name).addClass("selectPlayer");
        playerSelectList.append(player);
    });
    playerSelectList.hide();
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
    modifierCount = modifierSetting === 'low' ? 3 
        : modifierSetting === 'medium' ? (totalCases/(ROUNDS/2)) 
        : (totalCases/(ROUNDS/4));
    
    game = new GameState(playerCount, modifierCount, generatePlayers());
    
    shuffle(game.players);

    game.penaltyList = generatePenaltyList(totalCases);
    loadPenalties(totalCases, game.penaltyList);
    shuffle(game.penaltyList);
    game.modifierList = generateModifierList(totalCases, modifierCount)
    const modifierData = game.modifierList.slice(0, modifierCount);
    loadModifiers(modifierData);
    shuffle(game.modifierList);
    loadCases();
    loadPlayers();
    loadPlayerSelection();
}

function startFirstRound() {
    $(playerBoard).children().first().addClass("playerTurn");
    $("#currentPlayerName").text(game.players[game.roundStep].name);
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
            $(playerBoard.children()[game.roundStep]).addClass("playerFinished");
        }
    }
}

function revealCase(index) {
    const currentPlayer = game.players[game.roundStep];
    window.location.href = "#gameLogo";
    $("#backdrop").fadeIn();
    revealCaseElement.removeClass().addClass("caseStyle").text(index+1);
    $("#caseRevealText").text(currentPlayer.name);
    $("#caseRevealInstruction").css("opacity", "0");
    $("#caseRevealContainer").fadeIn(1000, () => {
        // AUDIO: CASE DOWN 
        $("#caseRevealCase").css("animation", "caseRevealDown 1500ms ease-in forwards")
            .one("animationend", () => {
                let playerIndexList = [];
                const [penaltyClass, penaltyInstruction] = findPenaltyClass(index);
                const penaltyElement = $("#valueGrid").find($("." + penaltyClass)).last();
                const penaltyValue = game.penaltyList[index];
                revealCaseElement.removeClass("caseStyle").addClass(penaltyClass).text(penaltyElement.text());
                $("#caseRevealInstruction").text(penaltyInstruction);
                // AUDIO: CASE UP
                $("#caseRevealCase").css("animation", "caseRevealUp 1000ms cubic-bezier(0.17, 0.2, 0, 1.3)")
                .one("animationend", () => {
                    // AUDIO: CASE TYPE FEEDBACK
                    if (game.modifierList[index] && penaltyValue !== 0){
                        handleModifierCase(index, playerIndexList, penaltyClass, penaltyElement, penaltyValue);
                    }
                    else {
                        $("#caseRevealInstruction").delay(700).css("opacity", "100%");
                        playerIndexList.push(game.roundStep);
                        document.getElementById("closeCaseRevealModalButton").onclick = () => {
                            let modifierElem = null;
                            if(game.modifierList[index]){
                                modifierElem = $("#modifiers").find($(".modifierShown:contains(" + game.modifierList[index].mod + ")")).last();
                            }
                            handleContinueButton(penaltyElement, penaltyClass, modifierElem, playerIndexList, penaltyValue);
                            $("#caseRevealCase").css("animation", "none");
                            $("#playerContainer").css("z-index", "1");
                            $("#gameBoardNav").css("z-index", "1");
                        }
                        $("#closeCaseRevealModalButton").delay(3000).fadeIn("slow");
                    }
                })
            })
    });
}

function handleModifierCase(index, playerIndexList, penaltyClass, penaltyElement, penaltyValue) {
    const modifierData = game.modifierList[index];
    const modifierElem = $("#modifiers").find($(".modifierShown:contains(" + game.modifierList[index].mod + ")")).last();
    let modifierMult = modifierData.multiplier;
    // AUDIO: MODIFIER FADE IN
    $("#caseRevealModifier").text(modifierElem.text()).addClass("modifierAppear").delay(2000).one("animationend", () => {
        // AUDIO: MODIFIER IMPACT
        $("#caseRevealContent").delay(2000).fadeOut().one("animationend", () => {
            $("#modifierName").text(modifierData.name);
            $("#modifierInfo").text(modifierData.info);
            $("#modifierPenaltyValue").addClass(penaltyClass).text(penaltyElement.text());
            document.getElementById("closeCaseRevealModalButton").onclick = () => {
                if(modifierData.mod === "A"){
                    game.players.forEach((_, i) => {
                        playerIndexList.push(i);
                    });
                }
                else if(modifierData.includesSelf){playerIndexList.push(game.roundStep);}
                $("#caseRevealCase").css("animation", "none");
                $("#caseRevealModifier").removeClass("modifierAppear");
                $("#modifierContainer").hide();
                $("#caseRevealContent").show();
                $("#modifierPenaltyValue").removeClass(penaltyClass);
                if(modifierData.mod === "T"){
                    $("#triviaQuestionText").hide();
                    $("#triviaAnswerList").empty().hide();
                    $("#triviaQuestionResultText").hide();
                }
                else if(modifierData.mod === "D"){
                    $("#dareText").hide();
                    $("#dareCompleted").hide();
                    $("#dareNotCompleted").hide();
                }
                $(playerSelectList.get(0).children).each((_, p) => {
                    $(p).removeClass("selectPlayerActive").show();
                });
                $(playerSelectList).hide();
                handleContinueButton(penaltyElement, penaltyClass, modifierElem, playerIndexList, (penaltyValue * modifierMult));
            }
            $("#caseRevealCase").css("animation", "none");
            if(modifierData.isPlayerSelection){
                $("#playerContainer").css("z-index", "50");
                $("#gameBoardNav").css("z-index", "50");

                $(playerSelectList.get(0).children).each((i, p) => {
                    if(i !== game.roundStep){
                        p.onclick = () => {
                            $(p).toggleClass("selectPlayerActive");
                            if($(p).hasClass("selectPlayerActive")){
                                playerIndexList.push(i);
                            }
                            else{
                                playerIndexList.splice(playerIndexList.indexOf(i), 1);
                            }
                            
                            if(playerIndexList.length === modifierData.selectNum){
                                $("#closeCaseRevealModalButton").show();
                            }
                            else{
                                $("#closeCaseRevealModalButton").hide();
                            }
                        }
                    }
                    else{
                        $(p).hide();
                    }
                });
                playerSelectList.show();
            }
            else if(modifierData.mod === "T"){
                let questionData;
                let answers;
                getTriviaQuestion()
                    .then(() => {
                        questionData = triviaQuestion.results[0];
                        answers = [...questionData.incorrect_answers, questionData.correct_answer];
                        shuffle(answers);
                        $("#triviaQuestionText").html(questionData.question);
                        $("#triviaQuestionText").show();
                        $("#triviaAnswerList").empty().show();
                        answers.forEach((a) => {
                            const item = document.createElement("button");
                            $(item).addClass("triviaAnswer teko").html(a);
                            item.onclick = () => {
                                if(a === questionData.correct_answer){
                                    $(item).addClass("triviaCorrectAnswer");
                                }
                                else{
                                    $(item).addClass("triviaWrongAnswer");
                                }
                                answerTrivia(a);
                            }
                            $("#triviaAnswerList").append(item);
                        });

                        function answerTrivia(answer) {
                            let isCorrect = answer === questionData.correct_answer;
                            let feedback = "Wrong!!!!";
                            if(isCorrect){
                                feedback = "Correct! No penalties for you!!";
                                modifierMult = 0;
                            }
                            $("#triviaAnswerList").children().each((_, a) => {
                                if($(a).text() === questionData.correct_answer){
                                    $(a).addClass("triviaCorrectAnswer");
                                }
                                a.onclick = null;
                            });
                            $("#triviaQuestionResultText").text(feedback).show();
                            $("#closeCaseRevealModalButton").delay(1000).fadeIn();
                        }
                });
            }
            else if(modifierData.mod === "D"){
                const randomDare = modifierData.dareList[Math.floor(Math.random() * modifierData.dareList.length-1)];
                $("#dareText").text(randomDare).show();
                $("#dareCompleted").show();
                $("#dareNotCompleted").show();
                document.getElementById("dareCompleted").onclick = () => {
                    modifierMult = 0;
                    $("#closeCaseRevealModalButton").show();
                    $("#dareNotCompleted").hide();
                }
                document.getElementById("dareNotCompleted").onclick = () => {
                    modifierMult = 1;
                    $("#closeCaseRevealModalButton").show();
                    $("#dareCompleted").hide();
                }
            }
            else {
                $("#closeCaseRevealModalButton").delay(5000).fadeIn();
            }
        });
        $("#modifierContainer").delay(3000).fadeIn();
    });
}

function handleContinueButton(penaltyElem, penaltyClass, modElem, playersToUpdate, score) {
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
    updatePlayerScore(score, playersToUpdate);
    progressGameStep();

}

function updatePlayerScore(score, players){
    players.forEach((pIndex) => {
        const player = game.players[pIndex];
        if(score === 5 || score === 10 || score === 15){
            player.maxPenalty = true;
        }
        else{
            player.score += score;
        }
        const currentPlayerScore = $(playerBoard.children().get(pIndex)).find(".playerScoreValue")[0];
        $(currentPlayerScore).text(player.score);
    });
}


//Takes penalty number as input, returns associated penalty class style name
function findPenaltyClass(i) {
    switch(game.penaltyList[i]){
        case 0:
            return ["zeroPenalty", "No penalties!"];
        case 1:
            return ["onePenalty", "Take 1 penalty!"];
        case 2:
            return ["twoPenalties", "Take 2 penalties!"];
        case 3:
            return ["threePenalties", "Take 3 penalties!"];
        case 4:
            return ["fourPenalties", "Take 4 penalties!"];
        case 5:
            return ["maxPenalty", "Take a MAX PENALTY!"];
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
    // do regular selection process
    
    
    game.roundStep++;
    if(game.roundStep === playerCount){
        game.round++;
        game.roundStep = 0;
    }
    
    const nextPlayer = playerBoard.children()[game.roundStep];
    if(nextPlayer.classList.contains("playerFinished")){
        progressGameStep();
        return;
    }
    $(nextPlayer).addClass("playerTurn");

    $("#currentPlayerName").text(game.players[game.roundStep].name)
        .css("animation", "playerChange 500ms ease-out")
        .one("animationend", () => {
            $("#currentPlayerName").css("animation", "none");
        });

    if(casesLeft === 1){
        const i = findLastCase();
        $(nextPlayer).addClass("playerFinished");
        revealCase(i);
        $("#valueContainer").css("z-index", "1");
        return;
    }
    if(game.round === ROUNDS){
        $("#valueContainer").css("z-index", "50");
        $("#playerContainer").css("z-index", "50");
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

    $("#gameBoardNav").css("z-index", "50");
    

    const takeButton = document.getElementById("dondTake");
    const leaveButton = document.getElementById("dondLeave");
    takeButton.onclick = () => {
        $("#gameBoardNav").css("z-index", "1");
        $("#playerContainer").css("z-index", "1");
        $("#valueContainer").css("z-index", "1");

        handleTake(player);
    }
    leaveButton.onclick = () => {
        handleLeave(player);
        progressGameStep();
    }
}

function handleTake(player){
    $("#dondChoiceContainer").hide();
    revealCase(player.selectedCase);
    $(caseBoard.children()[player.selectedCase]).addClass("caseRevealed");
    $(playerBoard.children()[game.roundStep]).addClass("playerFinished");
}

function handleLeave(player){
    $("#backdrop").fadeOut();
    $("#dondChoiceContainer").hide();
    $($(playerBoard.children().get(game.roundStep)).children().get(2)).hide();
    $(caseBoard.children()[player.selectedCase]).removeClass("caseSelected").prop("disabled", false)
        .css("animation", "pressDown 1000ms ease-in-out forwards reverse");
}

async function endGame(){
    await calculateHighestAndLowest();
    $("#backdrop").fadeIn();
    $("#endGameContainer").fadeIn();
    game.players.forEach((p, i) => {
        const playerItem = document.createElement('div');
        const playerScore = document.createElement('div');
        const playerName = document.createElement('p');
        
        $(playerScore).addClass("playerScore").text(p.score);
        if(p.score === game.scoreHigh){$(playerScore).addClass("highest");}
        else if(p.score === game.scoreLow){$(playerScore).addClass("lowest");}
        if(p.maxPenalty){$(playerScore).addClass("maxim");}

        $(playerName).addClass("playerName").text(p.name);
        $(playerItem).addClass("text-thicc playerStat").append(playerScore, playerName).prop("animation-delay", (i * 500) + "ms")
            .css("animation", "popIn 1000ms ease-in-out forwards");;

        $("#endGamePlayerStats").append(playerItem);
    });

    document.getElementById("backToGameSetup").onclick = () => {
        clearOldGameElements();
        $("#endGameContainer").hide();
        $("#gameSetup").fadeIn();
    }
}

function clearOldGameElements(){
    //cases
    caseBoard.children().remove();

    //values
    valueBoard.children().remove();

    //players
    playerBoard.children().remove();
    playerSelectList.children().remove();

    //modifiers
    modifiers.children().remove();

    //reset styles
    $("#valueContainer").css("z-index", "");
    $("#playerContainer").css("z-index", "");
}

async function calculateHighestAndLowest() {
    let h = 0;
    let l = Number.MAX_VALUE;
    game.players.forEach((p) => {
        h = Math.max(h, p.score);
        l = Math.min(l, p.score);
    });
    game.scoreHigh = h;
    game.scoreLow = l;
}

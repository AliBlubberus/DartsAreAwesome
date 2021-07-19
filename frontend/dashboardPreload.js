const { ipcRenderer, Debugger, ipcMain } = require("electron");

const diagramSVG = document.getElementById("gameSummaryDiagram");
const ns = "http://www.w3.org/2000/svg";

const latestGame = ipcRenderer.sendSync("loadLatestGame");

window.onload = generateGraph();

const playerData = ipcRenderer.sendSync("loadPlayerData");

const playerSelectList = document.getElementById("playerSelectList");
const totalScoreListContainer = document.getElementById("totalScoreList");
const averageScoreListContainer = document.getElementById("averageScoreList");

var gameRunning = false;

playerData.forEach(element => {
    generatePlayerListing(element);
    generateAverageScoreListing(element);
    generateTotalScoreListing(element);
});

function generatePlayerListing(object) {
    let scrollItem = document.createElement("div");
    scrollItem.setAttribute("class", "playerScrollItem");
    playerSelectList.appendChild(scrollItem);

    let playerItem = document.createElement("div");
    playerItem.setAttribute("class", "playerSelectItem");
    scrollItem.appendChild(playerItem);

    let pictureContainer = document.createElement("div");
    pictureContainer.setAttribute("class", "playerSelectPicContainer");
    playerItem.appendChild(pictureContainer);

    let picture = document.createElement("img");
    picture.setAttribute("class", "playerSelectPic");
    picture.setAttribute("src", "svg/user-solid.svg");  //TODO: Replace this with the corresponding profile picture//
    pictureContainer.appendChild(picture);

    let nameContainer = document.createElement("div");
    nameContainer.setAttribute("class", "playerSelectNameContainer");
    playerItem.appendChild(nameContainer);

    let nameText = document.createElement("h3");
    nameContainer.appendChild(nameText);
    nameText.textContent = object.name;
}

function generateTotalScoreListing(object) {
    let entry = document.createElement("div");
    entry.setAttribute("class", "averageScoreEntry");
    totalScoreListContainer.appendChild(entry);

    let nameContainer = document.createElement("div");
    nameContainer.setAttribute("class", "averageScoreName");
    entry.appendChild(nameContainer);

    let playerName = document.createElement("h3");
    playerName.textContent = object.name;
    nameContainer.appendChild(playerName);


    let scoreContainer = document.createElement("div");
    scoreContainer.setAttribute("class", "averageScoreValue");
    entry.appendChild(scoreContainer);

    let scoreText = document.createElement("h3");
    scoreText.textContent = object.totalScore;
    scoreContainer.appendChild(scoreText);
}

function generateAverageScoreListing(object) {
    let entry = document.createElement("div");
    entry.setAttribute("class", "averageScoreEntry");
    averageScoreListContainer.appendChild(entry);

    let nameContainer = document.createElement("div");
    nameContainer.setAttribute("class", "averageScoreName");
    entry.appendChild(nameContainer);

    let playerName = document.createElement("h3");
    playerName.textContent = object.name;
    nameContainer.appendChild(playerName);


    let scoreContainer = document.createElement("div");
    scoreContainer.setAttribute("class", "averageScoreValue");
    entry.appendChild(scoreContainer);

    let scoreText = document.createElement("h3");
    scoreText.textContent = roundNumber(object.averageScorePerGame);
    scoreContainer.appendChild(scoreText);
}

// player listing logic //

var playerListings = playerSelectList.children;
var playerListingReferences = [];
for (let i = 0; i < playerListings.length; i++) {
    playerListingReferences[i] = new playerListing(playerListings[i], false);
    playerListings[i].setAttribute("onclick", "togglePlayerListing(" + i + ")");
}

console.log(playerListingReferences);

function togglePlayerListing(index) {
    playerListingReferences[index].toggle();
    exportSelectedPlayers();
}

function exportSelectedPlayers() {
    var output = [];
    for (let i = 0; i < playerListingReferences.length; i++) {
        if (playerListingReferences[i].active) output[output.length] = i;
    }
    console.log("Selected Players Exported: " + output);
    return output;
}


// new game logic //

// start game button //

const startGameButton = document.getElementById("startGameButton");
var startGameButtonInteractable = false;

function startGame() {
    if (startGameButtonInteractable && !gameRunning && exportSelectedPlayers().length > 0) {
        settingsObject = {};
        settingsObject.gameLength = gameLengthIntervals[gameLength];
        settingsObject.gameEntry = gameEntry;
        settingsObject.gameEnding = gameEnding;
        
        settingsObject.selectedPlayers = exportSelectedPlayers();

        ipcRenderer.send("startNewGame", settingsObject);
    }
}

function updateStartGameButtonVisual() {
    if (startGameButtonInteractable === true) {
        startGameButton.style.boxShadow = "inset 0 -20px 20px -21px var(--light-blue)";
        startGameButton.style.borderBottomColor = "var(--light-blue)";
    }
    else {
        startGameButton.style.boxShadow = "inset 0 -20px 20px -21px var(--black)";
        startGameButton.style.borderBottomColor = "var(--black)";
    }
}

function checkIfGameStartable() {
    if (gameLength != null && gameEntry != null && gameEnding != null) startGameButtonInteractable = true;
    else startGameButtonInteractable = false;

    updateStartGameButtonVisual();
}

updateStartGameButtonVisual();

// game length buttons //

const gameLengthButtons = document.getElementById("gameLengthButtonContainer").children;
var gameLength = null;

for (let i = 0; i < gameLengthButtons.length; i++) {
    gameLengthButtons[i].setAttribute("onclick", "setGameLength(" + i + ")");
}


const gameLengthIntervals = [101, 201, 301, 401, 501, 601, 701, 801, 901];

function setGameLength(index) {
    gameLength = index;

    updateGameLengthButtons(index);

    checkIfGameStartable();

    console.log("Game length set to " + gameLengthIntervals[index] + ".");
}

function updateGameLengthButtons(index) {
    for (let i = 0; i < gameLengthButtons.length; i++) {
        if (i == index) {
            gameLengthButtons[i].style.boxShadow = "inset 0 -20px 20px -21px var(--white)";
            gameLengthButtons[i].style.borderBottomColor = "var(--white)";
        }
        else {
            gameLengthButtons[i].style.boxShadow = "inset 0 -20px 20px -21px var(--black)";
            gameLengthButtons[i].style.borderBottomColor = "var(--black)";
        }
    }
}

updateGameLengthButtons();


// game entry //

const gameEntryButtons = document.getElementById("gameEntryButtonContainer").children;
var gameEntry = null;

for (let i = 0; i < gameEntryButtons.length; i++) {
    gameEntryButtons[i].setAttribute("onclick", "setGameEntry(" + i + ")");
}

function setGameEntry(index) {
    gameEntry = index;

    updateGameEntryButtons(index);

    checkIfGameStartable();

    console.log("Game entry set to " + index);
}

function updateGameEntryButtons(index) {
    for (let i = 0; i < gameEntryButtons.length; i++) {
        if (i == index) {
            gameEntryButtons[i].style.boxShadow = "inset 0 -20px 20px -21px var(--white)";
            gameEntryButtons[i].style.borderBottomColor = "var(--white)";
        }
        else {
            gameEntryButtons[i].style.boxShadow = "inset 0 -20px 20px -21px var(--black)";
            gameEntryButtons[i].style.borderBottomColor = "var(--black)";
        }
    }
}

updateGameEntryButtons();


// game ending //

const gameEndingButtons = document.getElementById("gameEndingButtonContainer").children;
var gameEnding = null;

for (let i = 0; i < gameEndingButtons.length; i++) {
    gameEndingButtons[i].setAttribute("onclick", "setGameEnding(" + i + ")");
}

function setGameEnding(index) {
    gameEnding = index;

    updateGameEndingButtons(index);

    checkIfGameStartable();

    console.log("Game ending set to " + index);
}

function updateGameEndingButtons(index) {
    for (let i = 0; i < gameEndingButtons.length; i++) {
        if (i == index) {
            gameEndingButtons[i].style.boxShadow = "inset 0 -20px 20px -21px var(--white)";
            gameEndingButtons[i].style.borderBottomColor = "var(--white)";
        }
        else {
            gameEndingButtons[i].style.boxShadow = "inset 0 -20px 20px -21px var(--black)";
            gameEndingButtons[i].style.borderBottomColor = "var(--black)";
        }
    }
}

updateGameEndingButtons();

// Game Summary Diagram

function generateGraph() {
    console.log("Generating Graph...");

    /*
    let layer1 = document.createElementNS(ns, "polyline");
    layer1.setAttribute("class", "diagramLayer1");
    layer1.setAttribute("style", "stroke:#FF4631;stroke-width:2");
    layer1.setAttribute("points", generatePointDefinition(0));
    */
    let newLayers = [];
    for (let player = 0; player < clamp(latestGame.playerData.length, 0, 4); player++) {
        newLayers[player] = document.createElementNS(ns, "polyline");

        newLayers[player].setAttribute("class", "diagramLayer" + (player + 1));
        newLayers[player].setAttribute("style", "stroke-width:2");
        newLayers[player].setAttribute("points", generatePointDefinition(player));

        diagramSVG.appendChild(newLayers[player]);
    }

    //diagramSVG.appendChild(layer1);
}

function generatePointDefinition(layer) {
    let string = "";
    let yValues = generateProcedualRecordingArray(layer);

    for (let i = 0 ; i <= latestGame.recording.length ; i++) {
        let x = 500 / latestGame.recording.length * i;
        let y = 200 - (yValues[i] * 200 / latestGame.gameSettings.gameLength);

        string += " " + x.toString() + "," + roundNumber(y).toString();
    }

    return string;
}

function generateProcedualRecordingArray(player) {
    let array = [];
    array[0] = latestGame.gameSettings.gameLength;
    for (let i = 1; i <= latestGame.recording.length; i++) {
        array[i] = array[i - 1] - generateDartSum(latestGame.recording[i - 1][player]);
    }
    return array;
}

function generateDartSum(obj) {
    let score = 0;
    obj.darts.forEach(element => {
        score += element.score;
    });
    return score;
}

function roundNumber(num) {
    return Math.round((num + Number.EPSILON) * 100) / 100;
}

function clamp(val, min, max) {
    return Math.min(Math.max(val, min), max);
}


function getTop4() {
    let top4 = [];

    for (let i = 0; i < 4; i++) {
        let match = {"remainingScore": latestGame.gameSettings.gameLength + 1};
        latestGame.playerData.forEach((player) => {
            if (player.remainingScore < match.remainingScore && !matchAgainstBlacklist(player, top4)) {
                match = player;
            }
        });
        top4[top4.length] = match;
    }

    return top4;
}

function matchAgainstBlacklist(item, list) {
    let out = false;

    list.forEach((element) => {
        if (element == item) out = true;
    });

    return out;
}
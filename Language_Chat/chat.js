let players = []

function sendMessage() {
    let messageText = document.getElementById("chat-input").value;
    if (messageText.length == 0) {
        //if there is no message, don't send it
        return;
    }
    let randomizedText = "";
    let chars = "abcdefghijklmnopqrstuvwxyz";
    let symbols = ".,!?";
    for (let i = 0; i < messageText.length; i++) {
        if (messageText[i] == " ") {
            randomizedText += " ";
        }
        else if (symbols.includes(messageText[i])) {
            randomizedText += symbols[Math.floor(Math.random() * symbols.length)];
        }
        else {
            randomizedText += chars[Math.floor(Math.random() * chars.length)];
        }
    }

    let language = document.getElementById("send-language").value;

    TS.localStorage.campaign.getBlob().then((storedData) => {
        let data = JSON.parse(storedData || "{}");
        for (let player of players) {
            let finalMessage = "";
            TS.players.isMe(player.id).then((isMe) => {
                if (isMe) {
                    //if the player is us, send a special message with some more info
                    //we could instead also send to "gms" as target so all GMs see this special message. this would however also
                    //require us to filter out all GMs from the other message, otherwise they'd get two messages
                    TS.chat.send("\"" + language + "\": " + messageText, player.id).catch(console.error);
                    //this call can fail if the combined length of the message text + language name exceeds 400 characters. This should be handled and shown in UI, but for simplicity's sake we won't be doing that in this example. It can only fail here as the other messages are all limited to the message text length, which is capped to 370
                }
                else {
                    //if the player is not us, send the appropriate message
                    //this send logic is not optimal, we could first compile a list of all players who get randomized text and another
                    //list of all who get the "right" message and then use TS.chat.multiSend on those lists instead.
                    if (data[player.id] != undefined && data[player.id].includes(language)) {
                        finalMessage = messageText;
                    }
                    else {
                        finalMessage = randomizedText;
                    }
                    TS.chat.send(finalMessage, player.id).catch((response) => {
                        //We only care about errors here, so no .then needed
                        console.error("error on sending chat message", response);
                    });
                }
            })
        }
    });
}

async function addPlayer(player) {
    for (let i = 0; i < players.length; i++) {
        if (players[i].id == player.id) //player already exists
        {
            return;
        }
    }
    players.push({ id: player.id, name: player.name });

    TS.players.isMe(player.id).then((isMe) => {
        if (!isMe) {
            //only add player to UI if the player is not ourselves
            document.getElementById("no-players-label").classList.add("hidden");
            let playerElement = document.getElementById("player-template").content.firstElementChild.cloneNode(true);
            playerElement.id = player.id;
            playerElement.querySelector("label").textContent = player.name;

            document.getElementById("players-container").appendChild(playerElement);

            TS.localStorage.campaign.getBlob().then((storedData) => {
                let data = JSON.parse(storedData || "{}");
                updatePlayerLanguageUI(player, data.languages || [], data[player.id]);
            });
        }
    });
}

function handlePlayerEvents(event) {
    if (event.kind == "playerJoinedBoard") {
        addPlayer(event.payload.player);
    }
    else if (event.kind == "playerLeftBoard") {
        for (let i = 0; i < players.length; i++) {
            if (players[i].id == event.payload.player.id) {
                players.splice(i, 1);
            }
        }
        document.getElementById(event.payload.player.id).remove();
        if (players.length <= 1) {
            document.getElementById("no-players-label").classList.remove("hidden");
        }
    }
}

function updateSelectList(id, languages) {
    let select = document.getElementById(id);
    //clear previous options
    select.replaceChildren();

    for (let language of languages) {
        let option = document.createElement("option");
        option.value = language;
        option.textContent = language;
        select.appendChild(option);
    }
}

function updatePlayerLanguageUI(player, languages, playerLanguages) {
    TS.players.isMe(player.id).then((isMe) => {
        if (!isMe) {
            //only update player language UI if the player is not yourself, as the own player is excluded from the UI anyways
            let container = document.getElementById(player.id).querySelector("span.player-languages-container");
            let languageElements = [];
            for (let language of languages) {
                let languageSelectElement = document.getElementById("player-language-template").content.firstElementChild.cloneNode(true);
                let inputs = languageSelectElement.querySelectorAll("input");
                let labels = languageSelectElement.querySelectorAll("label");
                inputs[0].id = `${player.id}_${language}_unknown`;
                inputs[0].name = `${player.id}-${language}-radio`;
                labels[0].setAttribute("for", `${player.id}_${language}_unknown`);
                inputs[1].id = `${player.id}_${language}_known`;
                inputs[1].name = `${player.id}-${language}-radio`;
                labels[1].setAttribute("for", `${player.id}_${language}_known`);
                if ((playerLanguages || []).indexOf(language) == -1) {
                    inputs[0].setAttribute("checked", "checked");
                } else {
                    inputs[1].setAttribute("checked", "checked");
                }
                languageSelectElement.querySelector("p").textContent = language;
                languageElements.push(languageSelectElement);
            }
            container.replaceChildren(...languageElements)
        }
    }).catch(console.error);
}

function addLanguageFromUI() {
    let language = document.getElementById("new-language-input").value;
    document.getElementById("new-language-input").value = "";
    addLanguage(language);
}

function addLanguageToUI(language) {
    let languageElement = document.getElementById("language-template").content.firstElementChild.cloneNode(true);
    languageElement.querySelector("p").textContent = language;
    languageElement.querySelector("p").id = "language-" + language;
    languageElement.querySelector("button").dataset.language = language;

    document.getElementById("no-languages-label").classList.add("hidden");
    document.getElementById("languages-container").appendChild(languageElement);
}

function addLanguage(language) {
    if (language != undefined && language != "") {
        addLanguageToUI(language);
        TS.localStorage.campaign.getBlob().then((storedData) => {
            let data = JSON.parse(storedData || "{}");
            if (data.languages == undefined) {
                data.languages = [language];
            } else {
                data.languages.push(language); //this does not check for duplicates
            }
            TS.localStorage.campaign.setBlob(JSON.stringify(data)).then(() => {
                updateSelectList("send-language", data.languages);
                for (let player of players) {
                    updatePlayerLanguageUI(player, data.languages, data[player.id]);
                }
            }).catch(console.error);
        });
    }
}

function removeLanguage(event) {
    document.getElementById("language-" + event.target.dataset.language).parentNode.remove();
    TS.localStorage.campaign.getBlob().then((storedData) => {
        let data = JSON.parse(storedData || "{}");
        data.languages.splice(data.languages.indexOf(event.target.dataset.language), 1);
        if (data.languages.length == 0) {
            document.getElementById("no-languages-label").classList.remove("hidden");
        }

        TS.localStorage.campaign.setBlob(JSON.stringify(data)).catch(console.error);

        updateSelectList("send-language", data.languages);
        for (let player of players) {
            updatePlayerLanguageUI(player, data.languages, data[player.id]);
        }
    });
}

function updatePlayerLanguages(event) {
    let [playerId, newLanguage, status] = event.target.id.split("_");
    TS.localStorage.campaign.getBlob().then((storedData) => {
        //parse stored blob as json, but also handle if it's empty by
        //defaulting to an empty json document "{}" if stored data is false
        let data = JSON.parse(storedData || "{}");
        let languages = data[playerId] || [];
        let index = languages.indexOf(newLanguage);
        if (status == "known") {
            if (index == -1) {
                languages.push(newLanguage);
            }
            data[playerId] = languages;
        } else if (status == "unknown") {
            if (index != -1) {
                languages.splice(index, 1);
            }
            data[playerId] = languages;
        }
        TS.localStorage.campaign.setBlob(JSON.stringify(data)).catch(console.error);
        //store the new changed back into local storage. just using console.error in the .catch doesn't change much
        //in how errors are displayed in the console, but it does give a better report of where the error occurred as it will
        //show this line number as opposed to the line number in the anonymous injected functions of the API itself
    });
    return;
}

async function loadStoredData() {
    let storedData = await TS.localStorage.campaign.getBlob();
    //localstorage blobs are just unstructured text.
    //this means we can store whatever we like, but we also need to parse it to use it.
    let data = JSON.parse(storedData || "{}");

    for (let [key, value] of Object.entries(data)) {
        if (key == "languages") {
            updateSelectList("send-language", value);
            for (let language of value) {
                addLanguageToUI(language);
            }
        }
    }
}

async function onStateChangeEvent(msg) {
    if (msg.kind === "hasInitialized") {
        //the TS Symbiote API has initialized and we can begin the setup. think of this as "init".

        let playersInBoard = await TS.players.getPlayersInThisBoard();
        if (!playersInBoard.cause) {
            //if "cause" is undefined this means our call succeeded
            for (let player of playersInBoard) {
                addPlayer(player);
            }
        } else {
            TS.debug.log("Failed to get players in this board: " + playersInBoard.cause);
        }
        loadStoredData();
    }
}

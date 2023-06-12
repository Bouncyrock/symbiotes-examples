var clients = [];

function updatePreview() {
    let previewContainer = document.getElementById("note");
    let imageContainer = document.getElementById("img-handout");
    try {
        let imgURL = new URL(document.getElementById("note-input").value);
        //if the text content is a valid URL, try to load it as an image
        imageContainer.src = imgURL;
        imageContainer.classList.remove("hidden");
        previewContainer.classList.add("hidden");
    }
    catch (e) {
        previewContainer.innerText = document.getElementById("note-input").value;
        imageContainer.src = "";
        imageContainer.classList.add("hidden");
        previewContainer.classList.remove("hidden");
    }
}

function selectStyle() {
    let previewContainer = document.getElementById("note");
    let styleSelect = document.getElementById("style-select");
    previewContainer.className = styleSelect.value;
}

function sendNote() {
    let message = {
        note: document.getElementById("note-input").value,
        style: document.getElementById("style-select").value
    };

    let recipientSelect = document.getElementById("recipient-select");
    if (recipientSelect.value == "All") {
        let clientIds = [];
        for (let client of clients) {
            clientIds.push(client.id);
        }
        //instead of using sync.multiSend this could also be sync.send using the "board"
        //target as that sends to all on the board. here multiSend was used for illustrative
        //purposes to show how multiSend works.
        TS.sync.multiSend(JSON.stringify(message), clientIds).catch(console.error);
    }
    else {
        TS.sync.send(JSON.stringify(message), recipientSelect.value).catch(console.error);
    }
    document.getElementById("sent-indicator").classList.add("show-sent");
    setTimeout(function() {
        document.getElementById("sent-indicator").classList.remove("show-sent")
    }, 3000);
}

async function handlePlayerPermissionEvents(event) {
    //todo: is that even needed anymore? that should be covered by client mode, right?
    if (await TS.clients.isMe(event.id)) {
        //if the permission changed for me
        if (event.newPermission == "gm") {
            //and I'm a GM now, update UI to show GM interface
            document.getElementById("draft-note-container").classList.remove("hidden");
        }
        else {
            //else, remove it
            document.getElementById("draft-note-container").classList.add("hidden");
        }
    }
}

async function handleSyncEvents(event) {
    //broadcasted sync events go to all clients, also the sender. for this example it's mostly irrelevant,
    //but for others it might be necessary to filter out your own messages (or have different behavior)
    //by checking if the sender is the own client.
    let fromClient = event.payload.fromClient.id;
    TS.clients.isMe(fromClient).then((isMe) => {
        if (!isMe) {
            //only apply the incoming message if it was not sent by us. if we would it wouldn't change anything
            //besides doing useless work as the note is already shown and we'd just re-render the same stuff
            let syncMessage = JSON.parse(event.payload.str);
            let noteContainer = document.getElementById("note");
            let imageContainer = document.getElementById("img-handout");
            noteContainer.className = syncMessage.style;
            noteContainer.innerText = syncMessage.note;
            try {
                let imgURL = new URL(syncMessage.note);
                //if the text content is a valid URL, try to load it as an image
                imageContainer.src = imgURL;
                imageContainer.classList.remove("hidden");
                noteContainer.classList.add("hidden");
            } catch (e) {
                noteContainer.innerText = syncMessage.note;
                imageContainer.src = "";
                imageContainer.classList.add("hidden");
                noteContainer.classList.remove("hidden");
            }
            if (event.payload.str.length > 0) {
                //only notify that a new note was received if the note isn't empty.
                TS.symbiote.getIfThisSymbioteIsVisible().then(async (isVisible) => {
                    if (!isVisible) {
                        //if the symbiote isn't visible, show a notification that a new note has been received
                        let fromClientName = "someone";
                        let fromClientInfo = await TS.clients.getMoreInfo([fromClient]);
                        if (!fromClientName.cause) {
                            //only set name of client to show in notification if get more info didn't fail. keep generic "someone" otherwise.
                            fromClientName = fromClientInfo[0].player.name;
                        }
                        TS.symbiote.sendNotification("New note", `New note received from ${fromClientName}. Click to show`);
                    }
                }).catch(console.error);
            }
        } else {
            console.log("sync message arrived but was from us");
            //message originates from own client, no need to re-render the note, already done because of the preview
        }
    }).catch((response) => {
        console.error("error on trying to see whether client is own client", response);
    });
}

function handleClientsResponse(clientsResponse) {
    clients = clientsResponse;
    let recipientsDropdown = document.getElementById("recipient-select");
    let option = document.createElement("option");
    option.value = "All"
    option.textContent = "All";
    recipientsDropdown.replaceChildren(option);

    for (let client of clients) {
        option = document.createElement("option");
        option.value = client.clientId;
        option.textContent = client.name;
        recipientsDropdown.appendChild(option);
    }
}

function handleClientEvents(eventResponse) {
    let client = eventResponse.payload.client;
    let name = eventResponse.payload.client.player.name;
    TS.clients.isMe(client.id).then((isMe) => {
        switch (eventResponse.kind) {
            case "clientJoinedBoard":
                if (!isMe) {
                    addClient(client);
                }
                break;
            case "clientLeftBoard":
                if (!isMe) {
                    clients.splice(clients.indexOf({ id: client.id, name: name }), 1);
                    document.getElementById("recipient-select").querySelector(`option[value="${client.id}"]`).remove();
                }
                break;
            case "clientModeChanged":
                if (isMe) {
                    if (eventResponse.payload.clientMode == "gm") {
                        document.getElementById("draft-note-container").classList.remove("hidden");
                    } else {
                        document.getElementById("draft-note-container").classList.add("hidden");
                    }
                } else {
                    addClient(client);
                }
                break;
            default:
                break;
        }
    }).catch((response) => {
        console.error("error on trying to see whether client is own client", response);
    });
}

function addClient(client) {
    TS.clients.isMe(client.id).then((isMe) => {
        if (!isMe) {
            let newPlayerSelect = document.createElement("option");
            newPlayerSelect.value = client.id;
            newPlayerSelect.innerText = client.player.name;
            document.getElementById("recipient-select").appendChild(newPlayerSelect);

            clients.push({ id: client.id, name: client.name });
        }
    });
}

async function onStateChangeEvent(msg) {
    if (msg.kind === "hasInitialized") {
        //the TS Symbiote API has initialized and we can begin the setup. think of this as "init".

        let clients = await TS.clients.getClientsInThisBoard();
        if (!clients.cause) {
            //if "cause" is undefined this means our call succeeded
            for (let client of clients) {
                TS.clients.isMe(client.id).then((isMe) => {
                    if (isMe) {
                        TS.clients.getMoreInfo([client.id]).then((response) => {
                            if (response[0].clientMode == "gm") {
                                document.getElementById("draft-note-container").classList.remove("hidden");
                            }
                        }).catch((response) => {
                            console.error("error on trying to get info", response);
                        });
                    } else {
                        addClient(client);
                    }
                }).catch((response) => {
                    console.error("error on trying to see whether client is own client", response);
                });
            }
        }
    }
}

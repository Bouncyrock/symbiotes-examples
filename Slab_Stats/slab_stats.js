async function handleNewSlab(slabEvent) {
    if (slabEvent.kind !== "slabCopied") {
        //exit early if it's an event we don't care about
        return;
    }
    let slabString = slabEvent.payload.slab;
    let slabSize = slabEvent.payload.dataSize;
    if (slabEvent.payload.status === "oversized") {
        clearUi();
        document.getElementById("slab-size").textContent = "Slab too large";
        document.getElementById("nr-unique").textContent = "-";
        document.getElementById("nr-assets").textContent = "-";
        return;
    }
    //clear old copied slab data
    clearUi();

    document.getElementById("slab-size").textContent = slabSize;

    let slabBinary = await TS.slabs.unpack(slabString);
    let slabDataView = new DataView(slabBinary);

    //extract data from slab binary
    let nrUnique = slabDataView.getUint16(6, true);
    document.getElementById("nr-unique").textContent = nrUnique;

    let nrAssets = 0;
    let assets = [];
    //start at the layouts list (= skip the header) and iterate through the 20 byte long layouts
    for (i = 0; i < nrUnique; i++) {
        let layout = parseLayout(slabDataView, i);
        nrAssets += layout[1];
        assets.push(layout);
    }
    document.getElementById("nr-assets").textContent = nrAssets;


    //order the assets by number of occurrence
    assets.sort(function(first, second) {
        return second[1] - first[1];
    })
    //pre-load loaded content packs
    let contentPacksFragments = await TS.contentPacks.getContentPacks();
    if (contentPacksFragments.cause !== undefined) {
        console.error("error in getting asset packs", contentPacksFragments);
        return;
    }
    let contentPacks = await TS.contentPacks.getMoreInfo(contentPacksFragments);
    if (contentPacks.cause !== undefined) {
        console.error("error in getting more info on asset data", contentPacks);
        return;
    }

    //iterate through assets and display list
    for (const [id, count] of assets) {
        let assetElement = document.getElementById("asset-template").content.firstElementChild.cloneNode(true);
        assetElement.setAttribute("id", id);
        assetElement.querySelector("p.asset-count").textContent = count;
        assetElement.querySelector("p.asset-id").textContent = id;

        TS.contentPacks.findBoardObjectInPacks(id, contentPacks).then((foundContent) => {
            let boardObject = foundContent.boardObject;

            if (boardObject === undefined) {
                console.error("couldn't find asset with id", id);
            } else {
                assetElement.querySelector("p.asset-name").textContent = boardObject.name;
                TS.contentPacks.createThumbnailElementForBoardObject(boardObject).then((thumbnail) => {
                    assetElement.prepend(thumbnail);
                });
            }
        });

        document.getElementById("asset-list-container").appendChild(assetElement);
    }
}

function parseLayout(slabDataView, layoutIndex) {
    let offset = 10 + (20 * layoutIndex);
    let uuid =
        slabDataView.getUint32(offset, true).toString(16).padStart(8, "0") + "-" +
        slabDataView.getUint16(offset + 4, true).toString(16).padStart(4, "0") + "-" +
        slabDataView.getUint16(offset + 6, true).toString(16).padStart(4, "0") + "-" +
        slabDataView.getUint16(offset + 8, false).toString(16).padStart(4, "0") + "-" +
        slabDataView.getUint32(offset + 10, false).toString(16).padStart(8, "0") +
        slabDataView.getUint16(offset + 14, false).toString(16).padStart(4, "0");
    let count = slabDataView.getUint16(offset + 16, true);
    return [uuid, count];
}

function clickCard(element) {
    TS.urls.submit(`talespire://asset/${element.querySelector("p.asset-id").innerText}`);
}

function clearUi() {
    document.getElementById("slab-size").textContent = "0";
    document.getElementById("nr-unique").textContent = "0";
    document.getElementById("nr-assets").textContent = "0";
    document.getElementById("asset-list-container").replaceChildren();
}

function handleClientEvent(clientEvent) {
    TS.clients.isMe(clientEvent.payload.client.id).then((isMe) => {
        if (isMe) {
            //only listen for client events that are about our own client
            if (clientEvent.kind == "clientLeftBoard") {
                //if our own client left the board, clean up UI
                clearUi();
            } else if (clientEvent.kind == "clientJoinedBoard") {
                //if our own client joined a board we could do some extra stuff here like
                //unlocking UI elements that make no sense during switch or loading info about
                //the new board. in this example we don't need this though
            }
        }
    }).catch(console.error);
}

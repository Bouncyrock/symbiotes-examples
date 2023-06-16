let contentPacks = undefined;

async function getSelection() {
    let selectedCreatures = await TS.creatures.getSelectedCreatures();
    if (selectedCreatures.cause == undefined) {
        let summedCurHp = 0;
        let summedMaxHp = 0;
        if (selectedCreatures.length > 0) {
            document.getElementById("selection-empty-note").classList.add("hidden");
            document.getElementById("nr-creatures").textContent = selectedCreatures.length;
            document.getElementById("summary-section").classList.remove("hidden");
            document.getElementById("individuals-section").classList.remove("hidden");
            document.getElementById("individuals-container").replaceChildren();
        }
        TS.creatures.getMoreInfo(selectedCreatures).then((creatureInfos) => {
            let positions = {};

            for (let creatureInfo of creatureInfos) {
                summedCurHp += creatureInfo.hp.value;
                summedMaxHp += creatureInfo.hp.max;
                positions[creatureInfo.id] = creatureInfo.position;
                let creatureCard = document.getElementById("creature-template").content.firstElementChild.cloneNode(true);
                creatureCard.dataset.creatureId = creatureInfo.id;
                creatureCard.querySelector(".creature-name").textContent = creatureInfo.name;
                creatureCard.querySelector(".creature-hp").textContent = creatureInfo.hp.value + " / " + creatureInfo.hp.max;
                document.getElementById("individuals-container").appendChild(creatureCard);
                document.getElementById("group-hp").textContent = summedCurHp + " / " + summedMaxHp;

                TS.contentPacks.findBoardObjectInPacks(creatureInfo.morphs[creatureInfo.activeMorphIndex].boardAssetId, contentPacks).then((foundContent) => {
                    let boardObject = foundContent.boardObject;

                    TS.contentPacks.createThumbnailElementForBoardObject(boardObject, 128).then((thumbnail) => {
                        creatureCard.prepend(thumbnail);
                    });
                });
            }
            if (selectedCreatures.length > 1) {
                displayDistance(positions);
            } else {
                document.getElementById("distance").parentNode.classList.add("hidden");
                document.getElementById("distance").textContent = "";
            }
        });
    }
}

function displayDistance(positions) {
    let maxDistance = 0;
    let locationId = undefined
    for (let i = 0; i < Object.entries(positions).length; i++) {
        if (locationId == undefined) {
            locationId = Object.entries(positions)[i].locId;
        } else if (locationId != Object.entries(positions)[i].locId) {
            //creatures are on different sub boards so their location offsets cannot be compared directly
            return;
        }
        for (let n = i + 1; n < Object.entries(positions).length; n++) {
            let creatureA = Object.entries(positions)[i][1];
            let creatureB = Object.entries(positions)[n][1];
            let deltas = [creatureA.x - creatureB.x, creatureA.y - creatureB.y, creatureA.z - creatureB.z];
            let distance = Math.sqrt(deltas[0] * deltas[0] + deltas[1] * deltas[1] + deltas[2] * deltas[2]);
            if (distance > maxDistance) {
                maxDistance = distance;
            }
        }
    }
    let furthestDistanceText = "";
    TS.units.getDistanceUnitsForThisCampaign().then((unit) => {
        ;
        furthestDistanceText = (maxDistance * unit.numberPerTile).toFixed(1) + " " + unit.name;
    }).catch((response) => {
        furthestDistanceText = maxDistance.toFixed(1) + " Tiles";
        console.warn("error in getting ruler distance units, defaulting to tiles", response);
    }).finally(() => {
        document.getElementById("distance").textContent = furthestDistanceText;
    });
    document.getElementById("distance").parentNode.classList.remove("hidden");
}

function clickCard(element) {
    TS.creatures.getMoreInfo([element.dataset.creatureId]).then((info) => {
        TS.creatures.createBlueprint(info[0]).then(TS.urls.submit);
    }).catch(console.error);
}

function onStateChangeEvent(msg) {
    if (msg.kind === "hasInitialized") {
        onInit();
    }
}

async function onInit() {
    //pre-load loaded content packs
    let contentPacksFragments = await TS.contentPacks.getContentPacks();
    if (contentPacksFragments.cause != undefined) {
        console.error("error in getting asset packs", contentPacksFragments);
        return;
    }
    contentPacks = await TS.contentPacks.getMoreInfo(contentPacksFragments);
    if (contentPacks.cause !== undefined) {
        console.error("error in getting more info on asset data", contentPacks);
        return;
    }

    //this is needed as an async function cannot be directly set as onclick callback in HTML
    //another way of fixing this is by using ...getSelectedCreatures().then(...) instead of await
    //as this removes the need for getSelection() to be async
    document.getElementById("get-selection-button").onclick = async () => {
        getSelection();
    }
}

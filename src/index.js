import iziToast from "izitoast";

var apiKey, apiSecret, message;
var from = "RoamResearch";

export default {
    onload: ({ extensionAPI }) => {
        const config = {
            tabTitle: "Nexmo / Vonage",
            settings: [
                {
                    id: "nv-sid",
                    name: "API Key",
                    description: "Retrieve this from https://dashboard.nexmo.com/settings",
                    action: { type: "input", placeholder: "" },
                },
                {
                    id: "nv-token",
                    name: "Account secret",
                    description: "Retrieve this from https://dashboard.nexmo.com/settings",
                    action: { type: "input", placeholder: "" },
                },
                {
                    id: "nv-name",
                    name: "Display Name",
                    description: "Name for whom you want the message to appear to be sent by",
                    action: { type: "input", placeholder: "" },
                },
            ]
        };
        extensionAPI.settings.panel.create(config);

        extensionAPI.ui.commandPalette.addCommand({
            label: "Send block as message via Nexmo / Vonage",
            callback: () => {
                const uid = window.roamAlphaAPI.ui.getFocusedBlock()?.["block-uid"];
                if (uid == undefined) {
                    alert("Please make sure to focus a block before sending to Nexmo / Vonage");
                    return;
                } else {
                    sendNexmo(uid)
                }
            }
        });
        extensionAPI.ui.commandPalette.addCommand({
            label: "Create a New Contact in Nexmo / Vonage",
            callback: () => {
                createNewContact()
            }
        });
        window.roamAlphaAPI.ui.blockContextMenu.addCommand({
            label: "Send block as message via Nexmo / Vonage",
            callback: (e) => {
                const uid = e["block-uid"];
                sendNexmo(uid);
            }
        });

        checkFirstRun();

        async function sendNexmo(uid) {
            if (extensionAPI.settings.get("nv-sid")) {
                apiKey = extensionAPI.settings.get("nv-sid");
            } else {
                sendConfigAlert("Key")
            }
            if (extensionAPI.settings.get("nv-token")) {
                apiSecret = extensionAPI.settings.get("nv-token");
            } else {
                sendConfigAlert("Secret")
            }
            if (extensionAPI.settings.get("nv-name") != "") {
                from = extensionAPI.settings.get("nv-name");
            }

            if (uid != undefined) {
                message = window.roamAlphaAPI.pull("[:block/string]", [":block/uid", uid])?.[":block/string"].toString();
            }

            var page, phoneNumber;
            var contactsArray = [];
            var requestOptions = {};
            requestOptions["mode"] = "no-cors";

            page = await window.roamAlphaAPI.q(`[:find (pull ?page [:block/string :block/uid :block/order {:block/children ...}]) :where [?page :node/title "Nexmo / Vonage configuration"]  ]`);
            
            if (page != undefined && page[0][0].hasOwnProperty("children")) {
                for (var i = 0; i < page[0][0].children.length; i++) {
                    if (page[0][0].children[i].string == "Contacts:") {
                        if (page[0][0].children[i].hasOwnProperty("children")) {
                            contactsArray = page[0][0].children[i].children;
                        }
                    }
                }

                if (contactsArray.length > 0) {
                    var selectString = "<select><option value=\"\">Select</option>";
                    for (var j = 0; j < contactsArray.length; j++) {
                        selectString += "<option value=\"" + contactsArray[j].children[0].string + "\">" + contactsArray[j].string + "</option>";
                    }

                    selectString += "</select>";
                    phoneNumber = await prompt("Send message to which contact?", 2, selectString, message);
                } else {
                    await createNewContact(message).then((details) => phoneNumber = details[1]);
                }
                
                if (apiKey != undefined && apiSecret != undefined && phoneNumber != undefined) {
                    await fetch(`https://rest.nexmo.com/sms/json?api_key=${apiKey}&api_secret=${apiSecret}&to=${phoneNumber}&from=${from}&text=${message}`, requestOptions)
                        .then(prompt("Message sent!", 3, null, null))
                        .catch(error => console.error(error));

                }
            }
        }
    },
    onunload: () => {
        window.roamAlphaAPI.ui.blockContextMenu.removeCommand({
            label: "Send block as message via Nexmo / Vonage",
        });
    }
}

async function checkFirstRun() {
    var page = await window.roamAlphaAPI.q(`[:find (pull ?page [:block/string :block/uid {:block/children ...}]) :where [?page :node/title "Nexmo / Vonage configuration"]  ]`);
    if (page.length > 0) { // the page already exists
        if (page[0][0].hasOwnProperty("children")) {
            for (var i = 0; i < page[0][0].children.length; i++) {
                if (page[0][0].children[i].string == "Contacts:") {
                    var pullBlock = page[0][0].children[i].uid;
                }
            }
        }
    } else { // no page exists, so create one
        let newUid = roamAlphaAPI.util.generateUID();
        await window.roamAlphaAPI.createPage({ page: { title: "Nexmo / Vonage configuration", uid: newUid } });
        let string1 = "Thank you for installing the Nexmo / Vonage extension for Roam Research. This page has been automatically generated to allow definition of your contacts.";
        await createBlock(string1, newUid, 0);
        let string2 = "Below the horizontal line is where you can define your contacts. Two dummy contacts are provided for reference. Please delete and replace with real people!";
        await createBlock(string2, newUid, 1);
        let string3 = "Phone numbers should start with the country code then the number. Don't prefix with + sign.";
        await createBlock(string3, newUid, 2);
        await createBlock("---", newUid, 3);
        let ws_1 = "Contacts:";
        let headerUID = await createBlock(ws_1, newUid, 4);
        let ws_2 = "__Contact Name here__";
        let secHeaderUID = await createBlock(ws_2, headerUID, 0);
        let ws_3 = "__Contact Number here__";
        await createBlock(ws_3, secHeaderUID, 0);
        let ws_2a = "__Another Contact Name here__";
        let secHeaderUIDa = await createBlock(ws_2a, headerUID, 1);
        let ws_3a = "__Another Contact Number here__";
        await createBlock(ws_3a, secHeaderUIDa, 0);
    }
}

async function createNewContact(message) {
    var page, contactHeader, secHeaderUID;
    var contactsArray = [];
    page = await window.roamAlphaAPI.q(`[:find (pull ?page [:block/string :block/uid :block/order {:block/children ...}]) :where [?page :node/title "Nexmo / Vonage configuration"]  ]`);
    if (page != undefined && page[0][0].hasOwnProperty("children")) {
        for (var i = 0; i < page[0][0].children.length; i++) {
            if (page[0][0].children[i].string == "Contacts:") {
                contactHeader = page[0][0].children[i].uid;
                if (page[0][0].children[i].hasOwnProperty("children")) {
                    contactsArray = page[0][0].children[i].children;
                }
            }
        }

        let details = await prompt("What is your contact's name and number", 1, null);
        if (contactsArray != undefined) {
            secHeaderUID = await createBlock(details[0], contactHeader, contactsArray.length);
        } else {
            secHeaderUID = await createBlock(details[0], contactHeader, 0);
        }
        await createBlock(details[1], secHeaderUID, 0);
        if (message) {
            return details;
        }
    }
}

// helper functions

function sendConfigAlert(key) {
    if (key == "Key") {
        alert("Please set your Nexmo / Vonage API Key in the configuration settings via the Roam Depot tab.");
    } else if (key == "Secret") {
        alert("Please set your Nexmo / Vonage Account secret in the configuration settings via the Roam Depot tab.");
    }
}

async function createBlock(string, uid, order) {
    let newUid = roamAlphaAPI.util.generateUID();
    await window.roamAlphaAPI.createBlock(
        {
            location: { "parent-uid": uid, order: order },
            block: { string: string.toString(), uid: newUid }
        });
    return newUid;
}

async function prompt(string, type, selectString, message) {
    if (type == 1) {
        return new Promise((resolve) => {
            iziToast.question({
                theme: 'light',
                color: 'black',
                layout: 2,
                drag: false,
                timeout: false,
                close: false,
                overlay: true,
                displayMode: 2,
                id: "question",
                title: "Add a new contact",
                message: string,
                position: "center",
                inputs: [
                    [
                        '<input type="text" placeholder="">', null, null, true,
                    ],
                    [
                        '<input type="text" placeholder="">',
                        false,
                    ],
                ],
                buttons: [
                    [
                        "<button><b>Confirm</b></button>",
                        async function (instance, toast, button, e, inputs) {
                            instance.hide({ transitionOut: "fadeOut" }, toast, "button");
                            resolve([inputs[0].value, inputs[1].value]);
                        },
                        false,
                    ],
                    [
                        "<button>Cancel</button>",
                        async function (instance, toast, button, e) {
                            instance.hide({ transitionOut: "fadeOut" }, toast, "button");
                        },
                    ],
                ],
                onClosing: function (instance, toast, closedBy) { },
                onClosed: function (instance, toast, closedBy) { },
            });
        })
    } else if (type == 2) {
        return new Promise((resolve) => {
            iziToast.question({
                theme: 'light',
                color: 'black',
                layout: 2,
                drag: false,
                timeout: false,
                close: false,
                overlay: true,
                title: "Send a Message",
                message: string,
                position: 'center',
                inputs: [
                    [selectString, 'change', function (instance, toast, select, e) { }]
                ],
                buttons: [
                    ['<button><b>Confirm</b></button>', function (instance, toast, button, e, inputs) {
                        instance.hide({ transitionOut: 'fadeOut' }, toast, 'button');
                        resolve(inputs[0].options[inputs[0].selectedIndex].value);
                    }, false], // true to focus
                    [
                        "<button>Cancel</button>",
                        function (instance, toast, button, e) {
                            instance.hide({ transitionOut: "fadeOut" }, toast, "button");
                        },
                    ],
                    [
                        "<button>Create New Contact</button>",
                        async function (instance, toast, button, e) {
                            instance.hide({ transitionOut: "fadeOut" }, toast, "button");
                            await createNewContact(message).then((details) => resolve(details[1]));
                        },
                    ],
                ]
            });
        })
    } else if (type == 3) {
        return new Promise((resolve) => {
            iziToast.show({
                id: null,
                class: '',
                title: '',
                titleColor: '',
                titleSize: '',
                titleLineHeight: '',
                message: string,
                messageColor: '',
                messageSize: '',
                messageLineHeight: '',
                backgroundColor: '',
                theme: 'dark', // dark
                color: '', // blue, red, green, yellow
                icon: '',
                iconText: '',
                iconColor: '',
                iconUrl: null,
                image: '',
                imageWidth: 50,
                maxWidth: null,
                zindex: null,
                layout: 1,
                balloon: false,
                close: true,
                closeOnEscape: true,
                closeOnClick: true,
                displayMode: 0, // once, replace
                position: 'center', // bottomRight, bottomLeft, topRight, topLeft, topCenter, bottomCenter, center
                target: '',
                targetFirst: true,
                timeout: 3000,
                rtl: false,
                animateInside: true,
                drag: true,
                pauseOnHover: true,
                resetOnHover: false,
                progressBar: true,
                progressBarColor: '',
                progressBarEasing: 'linear',
                overlay: false,
                overlayClose: false,
                overlayColor: 'rgba(0, 0, 0, 0.6)',
                transitionIn: 'fadeInUp',
                transitionOut: 'fadeOut',
                transitionInMobile: 'fadeInUp',
                transitionOutMobile: 'fadeOutDown',
                buttons: {},
                inputs: {},
                onOpening: function () { },
                onOpened: function () { },
                onClosing: function () { },
                onClosed: function () { }
            });
        })
    }
}
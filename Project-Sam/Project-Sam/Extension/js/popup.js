window.browser = window.browser || window.chrome;

// Gets random number in range, inclusive both ends.
var getRandomInt = function(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Music and videos to randomize for user
var cuteVideos = ["https://www.youtube.com/watch?v=mRf3-JkwqfU", "https://www.youtube.com/watch?v=R0Te9mA7baA", "https://www.youtube.com/watch?v=FBFYV7y_D-E", "https://www.youtube.com/watch?v=UTsBJWgxwQA"];
var happyMusic = ["https://www.youtube.com/watch?v=Gs069dndIYk", "https://www.youtube.com/watch?v=ZbZSe6N_BXs", "https://www.youtube.com/watch?v=3GwjfUFyY6M", "https://www.youtube.com/watch?v=n6RTF4OPzf8", "https://www.youtube.com/watch?v=d-diB65scQU", "https://www.youtube.com/watch?v=Tvu3xiFmfDU"];

var MyWebChat = function(params) {

    // Webchat client args
    var user = {
        id: 'userid',
        name: 'username'
    };

    var bot = {
        id: params['botid'] || 'botid',
        name: params["botname"] || 'botname'
    };

    // Create Directline connection and application
    var botConnection = new BotChat.DirectLine({
        secret: params['s'],
        webSocket: params['webSocket'] && params['webSocket'] === "true" // defaults to true
    });

    BotChat.App({
        botConnection: botConnection,
        user: user,
        bot: bot
    }, document.getElementById(params['targetElement']));

    function openTab(url)
    {
        browser.runtime.sendMessage({ openTab: url });
    }

    // Local functions that can be triggered from event from bot
    const changeBackgroundColor = (newColor) => {
        console.log(newColor);
        document.body.style.backgroundColor = newColor;
    };

    const startMeditation = (param) => {
        console.log(param);
        openTab("http://marc.ucla.edu/mpeg/01_Breathing_Meditation.mp3");
    };

    const playMusic = (song) => {
        console.log(song);
        openTab(happyMusic[getRandomInt(0, happyMusic.length-1)]);

    };

    const playVideo = (video) => {
        console.log(video);
        openTab(cuteVideos[getRandomInt(0, cuteVideos.length-1)]);
    };

    const updateName = (name) => {
        console.log(name);
        user.username = name;
        localStorage.setItem("username", name);
    };

    // Subscribe to event from bot
    // activity.name matches name passed to createEvent() in bot code
    botConnection.activity$
      .filter(activity => activity.type === "event" && activity.name === "changeBackground")
      .subscribe(activity => changeBackgroundColor(activity.value));

    // Launch meditation web activity
    botConnection.activity$
      .filter(activity => activity.type === "event" && activity.name === "startMeditation")
      .subscribe(activity => startMeditation(activity.value));

    // Launch Groove with music (or youtube video)
    botConnection.activity$
      .filter(activity => activity.type === "event" && activity.name === "playMusic")
      .subscribe(activity => playMusic(activity.value));

    // Launch Groove with music (or youtube video)
    botConnection.activity$
      .filter(activity => activity.type === "event" && activity.name === "playVideo")
      .subscribe(activity => playVideo(activity.value));

    // Update username in localStorage and user property
    botConnection.activity$
      .filter(activity => activity.type === "event" && activity.name === "updateName")
      .subscribe(activity => updateName(activity.value));

    // Send web sentiment value to bot
    const postWebSentiment = function(avgWebSentiment){
        botConnection
            .postActivity({type: "event", value: avgWebSentiment, from: {id: params['userid'] }, name: "webSentiment"})
            .subscribe(id => console.log("webSentiment success"));
    };

    // Send start state to bot
    const postStartState = function(state){
        botConnection
            .postActivity({type: "event", value: state, from: {id: params['userid'] }, name: "startState"})
            .subscribe(id => console.log("start state success"));
    };

    this.loadApplication = function() {

        // Trigger webSentiment
        if (params['webSentiment'] < 1.0)
        {
            postWebSentiment(params['webSentiment']);
        }
    
        /**
         * When window unloads send endOfConversation
         * This event is catched by the bot that can freeup server resources
         **/
        window.onbeforeunload = function() {
            botConnection
                .postActivity({
                    type: "endOfConversation",
                    from: { id: params['userid'] }
                })
                .subscribe(id => console.log("endOfConversation"));
        };
    };

    return this;
};

function initWebChat(sentiment)
{
    var webchatParams = {
        userid: "me",
        botid: "ac8a245e-afd9-482e-a2c0-fcf1e6108e44",
        botname:"project-sam",
        targetElement: "botChat", // html element where the webchat gets rendered
        s: "7hMseSmbGwY.cwA.2PQ.2aP3gksa4lF1wuanXBkMfsMl5kETQd7c94_QRC8eLNc", // directline
        //s: "KMSunlzj7GA.cwA.IY0.Of3wNsBhf9bWYtWVBO3TaZBV2MiCxyYbCzUkBCPdtqM", // original from iframe
        webSentiment: sentiment
    };

    new MyWebChat(webchatParams).loadApplication();

    // Change chat title
    document.querySelector(".wc-header").querySelector("span").innerHTML = "Sam Chat";
}

function startChatWithWebSentiment(initChatFunction)
{
    browser.storage.local.get("avgSentiment", function(items) {
        var sentiment = 1.0;
        if (items && items.avgSentiment)
        {
            // Reset counts after user started chat after negative web sentiment
            sentiment = items.avgSentiment;
            browser.storage.local.remove("avgSentiment");
            browser.browserAction.setBadgeText({text: ''});
        }

        initChatFunction(sentiment);
    });
}

function startChat(initChatFunction)
{
    startChatWithWebSentiment(initChatFunction);
}

function previousButtonClick(currentPage) {
	switch(currentPage) {
		case "oobePets":
            var newPage = "oobeStart";
			browser.storage.local.set({"oobeFlow": newPage});
			createOOBE(newPage);
			break;
        case "oobeMusic":
            var newPage = "oobePets";
			browser.storage.local.set({"oobeFlow": newPage});
			createOOBE(newPage);
			break;
        case "oobeTV":
            var newPage = "oobeMusic";
			browser.storage.local.set({"oobeFlow": newPage});
			createOOBE(newPage);
			break;
        case "oobeHobbies":
            var newPage = "oobeTV";
			browser.storage.local.set({"oobeFlow": newPage});
			createOOBE(newPage);
			break;
        case "oobeFood":
            var newPage = "oobeHobbies";
			browser.storage.local.set({"oobeFlow": newPage});
			createOOBE(newPage);
			break;
        case "oobeFeelings":
            var newPage = "oobeFood";
			browser.storage.local.set({"oobeFlow": newPage});
			createOOBE(newPage);
			break;
        case "oobeContacts":
            var newPage = "oobeFeelings";
			browser.storage.local.set({"oobeFlow": newPage});
			createOOBE(newPage);
			break;
        case "oobeFinish":
            var newPage = "oobeContacts";
			browser.storage.local.set({"oobeFlow": newPage});
			createOOBE(newPage);
			break;
	}
}

function nextButtonClick(currentPage) {
	switch(currentPage) {
		case "oobeStart":
            var newPage = "oobePets";
			browser.storage.local.set({"oobeFlow": newPage});
			createOOBE(newPage);
			break;
        case "oobePets":
            var newPage = "oobeMusic";
			browser.storage.local.set({"oobeFlow": newPage});
			createOOBE(newPage);
			break;
        case "oobeMusic":
            var newPage = "oobeTV";
			browser.storage.local.set({"oobeFlow": newPage});
			createOOBE(newPage);
			break;
        case "oobeTV":
            var newPage = "oobeHobbies";
			browser.storage.local.set({"oobeFlow": newPage});
			createOOBE(newPage);
			break;
        case "oobeHobbies":
            var newPage = "oobeFood";
			browser.storage.local.set({"oobeFlow": newPage});
			createOOBE(newPage);
			break;
        case "oobeFood":
            var newPage = "oobeFeelings";
			browser.storage.local.set({"oobeFlow": newPage});
			createOOBE(newPage);
			break;
        case "oobeFeelings":
            var newPage = "oobeContacts";
			browser.storage.local.set({"oobeFlow": newPage});
			createOOBE(newPage);
			break;
        case "oobeContacts":
            var newPage = "oobeFinish";
			browser.storage.local.set({"oobeFlow": newPage});
			createOOBE(newPage);
			break;
        case "oobeFinish":
            document.body.style.backgroundColor = "white";
            browser.storage.local.set({"oobeFlow": "main"});
            startChat(initWebChat);
			break;
	}
}

function createOOBE(oobePage) {
    var contentDiv = document.getElementById("botChat");
    document.body.style.backgroundColor = "rgb(136, 184, 196)";
    console.log("Creating OOBE page " + oobePage);
    switch (oobePage) {
        case "oobeStart": // Page 1 of OOBE, greet the user and get their name
            contentDiv.innerHTML = `
                                    Hello! What's your name?<br />
                                    <br />
                                    <input type="text"></input><br />
                                    <input type="button" id="nextButton">next</input>
                                    `;
            document.getElementById("nextButton").addEventListener("click", function () {nextButtonClick(oobePage);});
            break;
        case "oobePets": // Page 2 of OOBE, get their gender and their favorite type of animal
            contentDiv.innerHTML = `
                                    Are you a cat person or a dog person?<br />
                                    <br />
                                    <input type="text"></input><br />
                                    <input type="button" id="previousButton">previous</input>
                                    <input type="button" id="nextButton">next</input>
                                    `;
            document.getElementById("previousButton").addEventListener("click", function () {previousButtonClick(oobePage);});
            document.getElementById("nextButton").addEventListener("click", function () {nextButtonClick(oobePage);});
            break;
        case "oobeMusic": // Page 3 of OOBE, get their favorite music genre and artists
            contentDiv.innerHTML = `
                                    What do you like to listen to?<br />
                                    <br />
                                    <input type="text"></input><br />
                                    <input type="button" id="previousButton">previous</input>
                                    <input type="button" id="nextButton">next</input>
                                    `;
            document.getElementById("previousButton").addEventListener("click", function () {previousButtonClick(oobePage);});
            document.getElementById("nextButton").addEventListener("click", function () {nextButtonClick(oobePage);});
            break;
        case "oobeTV": // Page 4 of OOBE, get their favorite TV shows and movies
            contentDiv.innerHTML = `
                                    What do you like to watch?<br />
                                    <br />
                                    <input type="text"></input><br />
                                    <input type="button" id="previousButton">previous</input>
                                    <input type="button" id="nextButton">next</input>
                                    `;
            document.getElementById("previousButton").addEventListener("click", function () {previousButtonClick(oobePage);});
            document.getElementById("nextButton").addEventListener("click", function () {nextButtonClick(oobePage);});
            break;
        case "oobeHobbies": // Page 5 of OOBE, get their hobbies and their job
            contentDiv.innerHTML = `
                                    What do you do for a living?<br />
                                    <br />
                                    <input type="text"></input><br />
                                    <input type="button" id="previousButton">previous</input>
                                    <input type="button" id="nextButton">next</input>
                                    `;
            document.getElementById("previousButton").addEventListener("click", function () {previousButtonClick(oobePage);});
            document.getElementById("nextButton").addEventListener("click", function () {nextButtonClick(oobePage);});
            break;
        case "oobeFood": // Page 6 of OOBE, get their favorite food and sports
            contentDiv.innerHTML = `
                                    What do you like to eat?<br />
                                    <br />
                                    <input type="text"></input><br />
                                    <input type="button" id="previousButton">previous</input>
                                    <input type="button" id="nextButton">next</input>
                                    `;
            document.getElementById("previousButton").addEventListener("click", function () {previousButtonClick(oobePage);});
            document.getElementById("nextButton").addEventListener("click", function () {nextButtonClick(oobePage);});
            break;
        case "oobeFeelings": // Page 7 of OOBE, get some general likes and dislikes
            contentDiv.innerHTML = `
                                    What makes you happy or sad?<br />
                                    <br />
                                    <input type="text"></input><br />
                                    <input type="button" id="previousButton">previous</input>
                                    <input type="button" id="nextButton">next</input>
                                    `;
            document.getElementById("previousButton").addEventListener("click", function () {previousButtonClick(oobePage);});
            document.getElementById("nextButton").addEventListener("click", function () {nextButtonClick(oobePage);});
            break;
        case "oobeContacts": // Page 8 of OOBE, set up contacts
            contentDiv.innerHTML = `
                                    Do you want me to contact anybody?<br />
                                    <br />
                                    <input type="text"></input><br />
                                    <input type="button" id="previousButton">previous</input>
                                    <input type="button" id="nextButton">next</input>
                                    `;
            document.getElementById("previousButton").addEventListener("click", function () {previousButtonClick(oobePage);});
            document.getElementById("nextButton").addEventListener("click", function () {nextButtonClick(oobePage);});
            break;
        case "oobeFinish": // Page 9 of OOBE, final greeting
            contentDiv.innerHTML = `
                                    Click here to chat!<br />
                                    <br />
                                    <input type="text"></input><br />
                                    <input type="button" id="previousButton">previous</input>
                                    <input type="button" id="nextButton">next</input>
                                    `;
            document.getElementById("previousButton").addEventListener("click", function () {previousButtonClick(oobePage);});
            document.getElementById("nextButton").addEventListener("click", function () {nextButtonClick(oobePage);});
            break;
        default: // If we don't know which OOBE page to show, just show the main chat box
            document.body.style.backgroundColor = "white";
            browser.storage.local.set({"oobeFlow": "main"});
            startChat(initWebChat);
            break;
    }
}

window.onload = function()
{
    browser.storage.local.get("oobeFlow", function(items) {
        if (items && items.oobeFlow && items.oobeFlow == "main") {
            startChat(initWebChat);
        }
        else {
            createOOBE(items.oobeFlow);
        }
    })
};

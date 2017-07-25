var browser = (chrome == undefined) ? browser : chrome;

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
        openTab("https://www.youtube.com/watch?v=Gs069dndIYk");
        // happy pharell
        // celebrate
        // one more time?
        // don't worry be happy
        // happy together

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

    // Local function that sends event to bot
    // Captured in bot.on("event") method in bot code and codepath triggered is based on event.name
    const postButtonMessage = function(){
        botConnection
            .postActivity({type: "event", value: "", from: {id: params['userid'] }, name: "buttonClicked"})
            .subscribe(id => console.log("buttonClicked success"));
    };

    // Send web sentiment value to bot
    const postWebSentiment = function(avgWebSentiment){
        botConnection
            .postActivity({type: "event", value: avgWebSentiment, from: {id: params['userid'] }, name: "webSentiment"})
            .subscribe(id => console.log("webSentiment success"));
    };

    // Hook up extension code to call local function that triggers bot code
    document.querySelector("#sendmessage").addEventListener('click', postButtonMessage);

    this.loadApplication = function() {

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

window.onload = function()
{
    startChat(initWebChat);
};
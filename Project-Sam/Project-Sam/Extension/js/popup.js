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

    // Local function that can be triggered from event from bot
    const changeBackgroundColor = (newColor) => {
        console.log(newColor);
        document.body.style.backgroundColor = newColor;
    };

    // Subscribe to event from bot
    // activity.name matches name passed to createEvent() in bot code
    botConnection.activity$
      .filter(activity => activity.type === "event" && activity.name === "changeBackground")
      .subscribe(activity => changeBackgroundColor(activity.value));

    // Local function that sends event to bot
    // Captured in bot.on("event") method in bot code and codepath triggered is based on event.name
    const postButtonMessage = function(){
        botConnection
            .postActivity({type: "event", value: "", from: {id: "me" }, name: "buttonClicked"})
            .subscribe(id => console.log("success"));
    };

    // Hook up extension code to call local function that triggers bot code
    document.querySelector("#sendmessage").addEventListener('click', postButtonMessage);

    this.loadApplication = function() {
        /**
         * Sends Web Sentiment parameter to the chatbot
         **/
        var sendWebSentiment = function() {
            console.log('post message');
            botConnection
                .postActivity({
                    type: "event",
                    value: params['webSentiment'],
                    // from: {
                    //     id: params['userid']
                    // },
                    name: "webSentimentName"
                })
                .subscribe(id => console.log("WEB SENTIMENT HAS BEEN SENT"));
        }

        sendWebSentiment();

        /**
         * When window unloads send endOfConversation
         * This event is catched by the bot that can freeup server resources
         **/
        window.onbeforeunload = function() {
            botConnection
                .postActivity({
                    type: "endOfConversation"
                    // from: {
                    //     id: params['userid']
                    // }
                })
                .subscribe(id => console.log("endOfConversation ack"));
        };
    };

    return this;
};

var webchatParams = {
  botid: "ac8a245e-afd9-482e-a2c0-fcf1e6108e44",
  botname:"project-sam",
  targetElement: "botChat", // html element where the webchat gets rendered
  s: "7hMseSmbGwY.cwA.2PQ.2aP3gksa4lF1wuanXBkMfsMl5kETQd7c94_QRC8eLNc", // directline
  //s: "KMSunlzj7GA.cwA.IY0.Of3wNsBhf9bWYtWVBO3TaZBV2MiCxyYbCzUkBCPdtqM", // original from iframe
  webSentiment: 0.5
};
new MyWebChat(webchatParams).loadApplication();

// Change chat title
document.querySelector(".wc-header").querySelector("span").innerHTML = "Sam Chat";

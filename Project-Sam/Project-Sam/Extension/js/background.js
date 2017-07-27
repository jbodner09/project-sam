var DEBUG = false;
var MIN_SENTIMENT_COUNT = 5

window.browser = window.browser || window.chrome;

function handleMessage(request, sender, sendResponse) {
    if (request.sentiment)
    {
        browser.storage.local.get("sentiment", function(items) {
            var sentimentList = [];
            if (items && items.sentiment)
            {
                // already set sentiment
                sentimentList = items.sentiment;
            }

            // Update last 5 in storage
            sentimentList.push(parseFloat(request.sentiment));
            if (DEBUG || sentimentList.length > MIN_SENTIMENT_COUNT)
            {
                sentimentList = sentimentList.slice(-MIN_SENTIMENT_COUNT); // get last 5 added
                browser.storage.local.set({sentiment: sentimentList});

                // Calculate average
                var sum = sentimentList.reduce((previous, current) => current += previous);
                var avg = sum / sentimentList.length;

                // Alert if dip in average
                if (avg < .28 || (DEBUG && avg < .51)) // September isn't that sad...
                {
                    browser.storage.local.set({avgSentiment: avg});
                    browser.browserAction.setBadgeText({text: "!"});
                    browser.browserAction.setBadgeBackgroundColor({color: "red"});
                }
            }
        });
    }
    else if (request.openTab)
    {
        browser.tabs.create({ url: request.openTab });
    }
}

browser.runtime.onMessage.addListener(handleMessage);

function initializeOOBE(details) {
    if (details.reason == "install") {
        browser.storage.local.set({ "oobeFlow": "oobeStart" });
    }
}

browser.runtime.onInstalled.addListener(initializeOOBE);

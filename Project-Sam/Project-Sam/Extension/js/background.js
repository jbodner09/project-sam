var DEBUG = true;
var MIN_SENTIMENT_COUNT = 5

var browser = (chrome == undefined) ? browser : chrome;

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
                if (avg < .45)
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
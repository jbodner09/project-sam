var browser = (chrome == undefined) ? browser : chrome;

function handleMessage(request, sender, sendResponse) {    
    browser.storage.local.get(function(items) {
        var sentimentList = [];
        if (items && items.sentiment)
        {
            // already set sentiment
            sentimentList = items.sentiment;
        }

        // Update last 5 in storage
        sentimentList.push(parseFloat(request.sentiment));
        sentimentList = sentimentList.slice(-5); // get last 5 added
        browser.storage.local.set({sentiment: sentimentList});

        // Calculate average
        var sum = sentimentList.reduce((previous, current) => current += previous);
        var avg = sum / sentimentList.length;

        // Alert if dip in average
        if (avg < .9)
        {
            browser.browserAction.setBadgeText({text: "!"});
            browser.browserAction.setBadgeBackgroundColor({color: "red"});
        }

    });
}

browser.runtime.onMessage.addListener(handleMessage);
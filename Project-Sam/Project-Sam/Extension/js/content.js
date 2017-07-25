var ENABLE_SENTIMENT = false;

var browser = (chrome == undefined) ? browser : chrome;

function handleResponse(message)
{
    console.log("Message from the background script: " + message.response);
}

function SendSentimentUpdate(sentiment)
{
    browser.runtime.sendMessage(
    { sentiment: sentiment },
        handleResponse
    );
}

function UpdateSentiment(cogObj)
{
    var messageId = cogObj.documents[0].id;
    var sentiment = cogObj.documents[0].score;
    console.log(messageId + " sentiment: " + sentiment);
    SendSentimentUpdate(sentiment);
}

function AnalyzeSentiment(contentId, text)
{
    console.log(contentId + ": " + text);
    if (ENABLE_SENTIMENT)
    {
        var xhr = new XMLHttpRequest();
        xhr.open("POST", "https://westus.api.cognitive.microsoft.com/text/analytics/v2.0/sentiment", true);
        xhr.setRequestHeader("Content-Type","application/json");
        xhr.setRequestHeader("Ocp-Apim-Subscription-Key","ASK_RYAN_FOR_THE_KEY_:)");
        xhr.onreadystatechange = function() {
            if (xhr.readyState == 4) {
                console.log(xhr.responseText);
                UpdateSentiment(JSON.parse(xhr.responseText))
            } else {
                console.log(xhr.responseText);
            }
        }
        xhr.send(JSON.stringify({
          "documents": [
            {
              "language": "en",
              "id": contentId,
              "text": text
            }
          ]
        }));
    }
    else
    {
        // Mock sentiment update

        SendSentimentUpdate(Math.random().toFixed(4));
    }
}

function AnalyzeHeadlineSentiment()
{
    var headline;
    var h1 = document.getElementsByTagName("h1")[0];
    if (h1 && h1.innerText)
    {
        headline = h1.innerText;
    }
    else
    {
        headline = document.title;
    }
    AnalyzeSentiment("title", headline);
}

// function AnalyzeBodyTextSentiment()
// {
//     var body = document.body;
//     var textContent = body.textContent || body.innerText;
//     textContent = textContent.replace(/(\r\n|\n|\r)/gm,"");
//     AnalyzeSentiment("body", textContent);
// }

function AnalyzeSiteSentiment()
{
    AnalyzeHeadlineSentiment();
    //AnalyzeBodyTextSentiment();
}

function OnWindowLoaded()
{
    AnalyzeSiteSentiment();
}
  
window.onload = OnWindowLoaded; 
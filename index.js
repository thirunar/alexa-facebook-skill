var Alexa = require('alexa-sdk');
var FB = require('facebook-node');
var util = require('util');

var repeatWelcomeMessage = "you should be able to read your feed, and make a post using this skill.";

var welcomeMessage = "Welcome, ";

var stopSkillMessage = "Ok, see you next time!";

var helpText = "You can say things like read my feed, or make a post, what would you like to do?";

var tryLaterText = "Please try again later."

var noAccessToken = "There was a problem getting the correct token for this skill, " + tryLaterText;

var accessToken = "";

var Handler = {
    'NewSession': function () {
        accessToken = this.event.session.user.accessToken;
        if (accessToken) {
            FB.setAccessToken(accessToken);
            this.emit(':ask', welcomeMessage, repeatWelcomeMessage);
        }
        else {
            this.emit(':tell', noAccessToken, tryLaterText);
        }
    },

    'readFeedIntent': function () {
        var alexa = this;
        if (accessToken) {

            FB.api("/me/feed", function (response) {
                if (response && !response.error) {
                    if (response.data) {
                        var output = "";
                        var max = 3;
                        for (var i = 0; i < response.data.length; i++) {
                            if (i < max) {
                                output += "Post " + (i + 1) + " " + response.data[i].message + ". ";
                            }
                        }
                        alexa.emit(':ask', output, output);
                    } 
                } else {
                    console.log(response.error);
                }
            });
        } else {
            this.emit(':tell', noAccessToken, tryLaterText);
        }
    },

    // Write a post to Facebook feed handler.
    'writePostIntent': function () {

        var alexa = this;

        if (accessToken) {
            FB.api("/me/feed", "POST",
            {
                "message": "This is Alexa, I can now access a whole new world of information, good luck!"
            }, function (response) {
                if (response && !response.error) {
                    alexa.emit(':tell', "Post successfull");
                } else {
                    console.log(response.error);
                    alexa.emit(':ask', "There was an error posting to your feed, please try again");
                }
            });

        }else{
            this.emit(':tell', noAccessToken, tryLaterText);
        }
    },

    'AMAZON.CancelIntent': function () {
        this.emit(':tell', stopSkillMessage);
    },

    'AMAZON.StopIntent': function () {
        this.emit(':tell', stopSkillMessage);
    },

    'AMAZON.HelpIntent': function () {
        this.emit(':ask', helpText, helpText);
    },

    'Unhandled': function () {
        this.emit(':ask', helpText, helpText);
    }
};

// Add handlers.
exports.handler = function (event, context, callback) {
    var alexa = Alexa.handler(event, context);
    alexa.registerHandlers(Handler);
    alexa.execute();
};

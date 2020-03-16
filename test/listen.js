const {Autohook} = require('..');

const qs = require('querystring');
const request = require('request');
const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});
const util = require('util');
const path = require('path');
const os = require('os');
const URL = require('url').URL;

const get = util.promisify(request.get);
const post = util.promisify(request.post);
const sleep = util.promisify(setTimeout);

const chat = [];

const requestTokenURL = new URL('https://api.twitter.com/oauth/request_token');
const accessTokenURL = new URL('https://api.twitter.com/oauth/access_token');
const authorizeURL = new URL('https://api.twitter.com/oauth/authorize');

async function input(prompt) {
  return new Promise(async (resolve, reject) => {
    readline.question(prompt, (out) => {
      readline.close();
      resolve(out);
    });
  });
}

async function accessToken({oauth_token, oauth_token_secret}, verifier) {
  const oAuthConfig = {
    consumer_key: process.env.TWITTER_CONSUMER_KEY,
    consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
    token: oauth_token,
    token_secret: oauth_token_secret,
    verifier: verifier,
  };

  const req = await post({url: accessTokenURL, oauth: oAuthConfig});
  if (req.body) {
    return qs.parse(req.body);
  } else {
    throw new Error('Cannot get an OAuth access token');
  }
}

async function requestToken() {
  const oAuthConfig = {
    callback: 'oob',
    consumer_key: process.env.TWITTER_CONSUMER_KEY,
    consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  };

  const req = await post({url: requestTokenURL, oauth: oAuthConfig});
  if (req.body) {
    return qs.parse(req.body);
  } else {
    throw new Error('Cannot get an OAuth request token');
  }
}

async function markAsRead(messageId, senderId, auth) {
  const requestConfig = {
    url: 'https://api.twitter.com/1.1/direct_messages/mark_read.json',
    form: {
      last_read_event_id: messageId,
      recipient_id: senderId,
    },
    oauth: auth,
  };

  await post(requestConfig);
}

async function indicateTyping(senderId, auth) {
  const requestConfig = {
    url: 'https://api.twitter.com/1.1/direct_messages/indicate_typing.json',
    form: {
      recipient_id: senderId,
    },
    oauth: auth,
  };

  await post(requestConfig);
}

async function sayHi(event, oauth) {
  // Only react to direct messages
  // console.log(event);
  if (!event.direct_message_events) {
    return;
  }

  const message = event.direct_message_events.shift();

  // Filter out empty messages or non-message events
  if (typeof message === 'undefined' || typeof message.message_create === 'undefined') {
    return;
  }

  // Filter out messages created by the the authenticating users (to avoid sending messages to oneself)
  if (message.message_create.sender_id === message.message_create.target.recipient_id) {
    return;
  }

  const oAuthConfig = {
    token: oauth.oauth_token,
    token_secret: oauth.oauth_token_secret,
    consumer_key: oauth.consumer_key,
    consumer_secret: oauth.consumer_secret,
  };


  await markAsRead(message.message_create.id, message.message_create.sender_id, oAuthConfig);
  await indicateTyping(message.message_create.sender_id, oAuthConfig);
  const senderScreenName = event.users[message.message_create.sender_id].screen_name;
  const senderid =message.message_create.sender_id;
  const found = chat.some(el => el.senderId === senderid);
  if(found){
    var arr = chat.find(el => el.senderId === senderid);
    var step = arr.stepCompleted;
    if(step == 0){
      arr.stepCompleted = 1;
      var mess_Data = {
        text: "Enter Your Email?",
      }
    }
    if (step == 1) {
      arr.stepCompleted = 2;
      var mess_Data = {
        text: "Enter Your Location?",
      }
    }
    if (step == 2) {
      arr.stepCompleted = 3;
      var mess_Data = {
        text: "Upload Image?",
      }
    }
    if (step == 3) {
      arr.stepCompleted = 4;
      var mess_Data = {
        "text": "Choose A Category",
        "quick_reply": {
          "type": "options",
          "options": [
            {
              "label": "Abandoned Vehicle",
              "metadata": "external_id_1"
            },
            {
              "label": "Pollution",
              "metadata": "external_id_2"
            },
            {
              "label": "Public Defect",
              "metadata": "external_id_3"
            },
            {
              "label": "Other",
              "metadata": "external_id_4"
            }
          ]
        }
      }
    }
    if(step == 4){
      if (message.message_create.message_data.text == "Abandoned Vehicle" || message.message_create.message_data.text == "Pollution" || message.message_create.message_data.text == "Public Defect")
      {
        arr.stepCompleted = 0;
        var mess_Data = {
          text: "Well done🚀 Thank you for your submission.",
        }
      }else if(message.message_create.message_data.text == "Other"){
        arr.stepCompleted = 5;
        var mess_Data = {
          "text": "Choose A Category",
          "quick_reply": {
            "type": "options",
            "options": [
              {
                "label": "Burst Water Pipe",
                "metadata": "external_id_1"
              },
              {
                "label": "Dead Animal",
                "metadata": "external_id_2"
              },
              {
                "label": "Education",
                "metadata": "external_id_3"
              },
              {
                "label": "Electricity",
                "metadata": "external_id_4"
              },
              {
                "label": "flooding",
                "metadata": "external_id_5"
              },
              {
                "label": "Graffiti",
                "metadata": "external_id_6"
              },
              {
                "label": "Road Block",
                "metadata": "external_id_7"
              },{
                "label": "Noise",
                "metadata": "external_id_8"
              },
              {
                "label": "Security Issue",
                "metadata": "external_id_9"
              }
            ]
          }
        }
      }else{
        var mess_Data = {
          "text": "Please Choose Correct Category",
          "quick_reply": {
            "type": "options",
            "options": [
              {
                "label": "Abandoned Vehicle",
                "metadata": "external_id_1"
              },
              {
                "label": "Pollution",
                "metadata": "external_id_2"
              },
              {
                "label": "Public Defect",
                "metadata": "external_id_3"
              },
              {
                "label": "Other",
                "metadata": "external_id_4"
              }
            ]
          }
        }
      }
    }

    if(step == 5){
      var val = ["Burst Water Pipe","Dead Animal","Education","Electricity","flooding","Graffiti","Road Block","Noise","Security Issue"];
      if(val.some(el => el === message.message_create.message_data.text)){
       step = 0;
        var mess_Data = {
          text: "Well done🚀 Thank you for your submission.",
        }
      }else{
        var mess_Data = {
          "text": "Choose A Category",
          "quick_reply": {
            "type": "options",
            "options": [
              {
                "label": "Burst Water Pipe",
                "metadata": "external_id_1"
              },
              {
                "label": "Dead Animal",
                "metadata": "external_id_2"
              },
              {
                "label": "Education",
                "metadata": "external_id_3"
              },
              {
                "label": "Electricity",
                "metadata": "external_id_4"
              },
              {
                "label": "flooding",
                "metadata": "external_id_5"
              },
              {
                "label": "Graffiti",
                "metadata": "external_id_6"
              },
              {
                "label": "Road Block",
                "metadata": "external_id_7"
              },{
                "label": "Noise",
                "metadata": "external_id_8"
              },
              {
                "label": "Security Issue",
                "metadata": "external_id_9"
              }
            ]
          }
        }
      }
    }
  }else {
    if (message.message_create.message_data.text.search('Report') != -1 || message.message_create.message_data.text.search('Problem') != -1) {
      console.log('here');
      var data = {
        senderId: senderid,
        stepCompleted: 0
      }
      chat.push(data);
      var mess_Data = {
        text: "Enter Your Name?",
      }
    }
  }

  const requestConfig = {
    url: 'https://api.twitter.com/1.1/direct_messages/events/new.json',
    oauth: oAuthConfig,
    json: {
      event: {
        type: 'message_create',
        message_create: {
          target: {
            recipient_id: message.message_create.sender_id,
          },
          message_data: mess_Data,
        },
      },
    },
  };
  await post(requestConfig);
}

(async () => {
  try {

    // Get request token
    const oAuthRequestToken = await requestToken();

    // Get authorization
    authorizeURL.searchParams.append('oauth_token', oAuthRequestToken.oauth_token);
    console.log('Please go here and authorize:', authorizeURL.href);
    const pin = await input('Paste the PIN here: ');

    // Get the access token
    const userToMonitor = await accessToken(oAuthRequestToken, pin.trim());
    const webhook = new Autohook({
      token: process.env.TWITTER_ACCESS_TOKEN,
      token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
      consumer_key: process.env.TWITTER_CONSUMER_KEY,
      consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
      env: process.env.TWITTER_WEBHOOK_ENV});

    webhook.on('event', async (event) => {
      await sayHi(event, {
        oauth_token: userToMonitor.oauth_token,
        oauth_token_secret: userToMonitor.oauth_token_secret,
        user_id: userToMonitor.user_id,
        consumer_key: process.env.TWITTER_CONSUMER_KEY,
        consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
        reset: true,
      });
    });

    webhook.on('event', async (event) => {
      console.log('We received an event!');
      await sayHi(event, {
        oauth_token: userToMonitor.oauth_token,
        oauth_token_secret: userToMonitor.oauth_token_secret,
        user_id: userToMonitor.user_id,
        consumer_key: process.env.TWITTER_CONSUMER_KEY,
        consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
        reset: true,
      });
    });

    await webhook.removeWebhooks();
    await webhook.start();
    await webhook.subscribe(userToMonitor);

  } catch(e) {
    console.error(e);
    process.exit(-1);
  }
})();

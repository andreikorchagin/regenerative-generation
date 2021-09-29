/** @format */
/* eslint-disable require-jsdoc */

const p5 = require('node-p5');
const request = require('request');
const fs = require('fs');
const {Storage} = require('@google-cloud/storage');
const winston = require('winston');
const {LoggingWinston} = require('@google-cloud/logging-winston');
const {TwitterApi} = require('twitter-api-v2');
const loggingWinston = new LoggingWinston();

// initialize all constants
const side = 1440;
const numSlices = 3;
const slice = side / numSlices;
const circleSize = side / (numSlices + 1);
const randomLimit = 100000;
const dir = 'images/';
const canvasName = getRandomInt(randomLimit).toString();
const storage = new Storage({keyFilename: 'key.json'});
const gcsPrefix = 'https://storage.googleapis.com/';

// initialize Winston logger
const logger = winston.createLogger({
  level: 'info',
  transports: [new winston.transports.Console(), loggingWinston],
});

// helper function for random integer generation
function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

// create image
function sketch(p) {
  p.setup = () => {
    const canvas = p.createCanvas(side, side);
    p.colorMode(p.HSB);
    p.background(p.random(255), p.random(255), p.random(255));
    p.strokeWeight(0);
    p.noLoop();
    setTimeout(() => {
      p.saveCanvas(canvas, dir.concat(canvasName), 'jpg').then((filePath) => {
        logger.info(`saved the canvas as ${filePath}`);
        const destFileName = canvasName + '.jpg';
        config = parseConfig();
        createTweet(config, canvasName, filePath);
        bucketName = config.bucket_name;
        caption = createCaption(canvasName, config);
        uploadFile(bucketName, filePath, destFileName).catch(console.error);
        const gcsImagePath = gcsPrefix + bucketName + '/' + destFileName;
        createIGMedia(config, gcsImagePath, caption);
      });
    }, 100);
  };
  p.draw = () => {
    for (let i = 0; i < numSlices + 1; i++) {
      for (let j = 0; j < numSlices + 1; j++) {
        p.fill(p.random(255), p.random(255), p.random(255));
        p.stroke(0);
        p.circle(i * slice, j * slice, circleSize);
      }
    }
  };
}

p5.createSketch(sketch);

// parse config file
function parseConfig() {
  const rawdata = fs.readFileSync('config.json');
  const config = JSON.parse(rawdata);
  return config;
}

// upload file to GCS for public download
async function uploadFile(bucketName, filePath, destFileName) {
  await storage.bucket(bucketName).upload(filePath, {
    destination: destFileName,
  });
  logger.info(`${filePath} uploaded to ${bucketName}`);
}

// create media container
function createIGMedia(config, imageURL, caption) {
  const containerCreationURL =
    'https://graph.facebook.com/' + config.ig_user_id + '/media?';
  request.post(
      {
        url: containerCreationURL,
        form: {
          image_url: imageURL,
          access_token: config.access_token,
          caption: caption,
        },
      },
      function(error, response, body) {
        const bodyObj = JSON.parse(body);
        const mediaContainerID = bodyObj.id;
        logger.info(
            JSON.stringify({
              message_type: 'IG Media Container ID',
              id: mediaContainerID,
            }),
        );
        if (bodyObj.error == 'undefined') {
          logger.error(bodyObj.error);
        }
        if (mediaContainerID != null) {
          publishMediaContainer(mediaContainerID, config);
        }
      },
  );
}

// publish media container
function publishMediaContainer(mediaContainerID, config) {
  const containerPublishURL =
    'https://graph.facebook.com/' + config.ig_user_id + '/media_publish?';
  request.post(
      {
        url: containerPublishURL,
        form: {
          creation_id: mediaContainerID,
          access_token: config.access_token,
        },
      },
      function(error, response, body) {
        const bodyObj = JSON.parse(body);
        const igMediaID = bodyObj.id;
        logger.info(
            JSON.stringify({message_type: 'IG Media ID', id: igMediaID}),
        );
        if (bodyObj.error == 'undefined') {
          logger.error(bodyObj.error);
        }
        commentOnMedia(config, igMediaID);
      },
  );
}

function createCaption(canvasName, config) {
  // You can't store template literals in a JSON config, so had to split
  // the caption string as follows to introduce a dynamic value.
  const caption = config.caption.start + canvasName + config.caption.end;
  return caption;
}

function commentOnMedia(config, igMediaID) {
  const commentMediaURL =
    'https://graph.facebook.com/' + igMediaID + '/comments?';
  setTimeout(() => {
    request.post(
        {
          url: commentMediaURL,
          form: {
            message: config.hashtags,
            access_token: config.access_token,
          },
        },
        function(error, response, body) {
          const bodyObj = JSON.parse(body);
          logger.info(
              JSON.stringify({message_type: 'IG Comment ID', id: bodyObj.id}),
          );
          if (bodyObj.error == 'undefined') {
            logger.error(bodyObj.error);
          }
        },
    );
  }, 1000);
}

async function createTweet(config, canvasName, filePath) {
  const twitterClient = new TwitterApi({
    appKey: config.twitter_credentials.app_key,
    appSecret: config.twitter_credentials.app_secret,
    accessToken: config.twitter_credentials.access_token,
    accessSecret: config.twitter_credentials.access_secret,
  });
  mediaID = await twitterClient.v1.uploadMedia(filePath);
  twitterCaption =
    config.twitter_credentials.caption.start +
    canvasName +
    config.twitter_credentials.caption.end;
  logger.info(
      JSON.stringify({message_type: 'Twitter Media ID', id: mediaID}),
  );
  tweetID = await twitterClient.v1.tweet(twitterCaption, {
    media_ids: mediaID,
  });
  logger.info(JSON.stringify({message_type: 'Tweet ID', id: tweetID}));
}

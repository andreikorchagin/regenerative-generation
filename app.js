/** @format */

const p5 = require("node-p5");
const request = require("request");
const fs = require("fs");
const { Storage } = require("@google-cloud/storage");

// initialize all constants
const side = 1440;
const num_slices = 3;
const slice = side / num_slices;
const circle_size = side / (num_slices + 1);
const random_limit = 100000;
const dir = "images/";
const canvas_name = getRandomInt(random_limit).toString();
const storage = new Storage({ keyFilename: "key.json" });
const gcs_prefix = "https://storage.googleapis.com/";
const hashtags =
  "%23nft %23nftart %23nftartist %23nftcommunity %23nftcollector %23nftartwork %23nftcollection %23nftgram %23generativeart %23generativedesign %23generativegraphics %23modernart %23modernartwork %23digitalart %23digitalartist %23opensea";
let filePath;

// helper function for random integer generation
function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

// create image
function sketch(p) {
  p.setup = () => {
    let canvas = p.createCanvas(side, side);
    p.colorMode(p.HSB);
    p.background(p.random(255), p.random(255), p.random(255));
    p.strokeWeight(0);
    p.noLoop();
    setTimeout(() => {
      p.saveCanvas(canvas, dir.concat(canvas_name), "jpg").then((filename) => {
        console.log(`saved the canvas as ${filename}`);
        let destFileName = canvas_name + ".jpg";
        filePath = filename;
        config = parseConfig();
        bucketName = config.bucket_name;
        caption = createCaption(canvas_name);
        uploadFile(bucketName, filePath, destFileName).catch(console.error);
        let gcs_image_path = gcs_prefix + bucketName + "/" + destFileName;
        createIGMedia(config, gcs_image_path, caption);
      });
    }, 100);
  };
  p.draw = () => {
    for (var i = 0; i < num_slices + 1; i++) {
      for (var j = 0; j < num_slices + 1; j++) {
        p.fill(p.random(255), p.random(255), p.random(255));
        p.stroke(0);
        p.circle(i * slice, j * slice, circle_size);
      }
    }
  };
}

let p5Instance = p5.createSketch(sketch);

// parse config file
function parseConfig() {
  let rawdata = fs.readFileSync("config.json");
  let config = JSON.parse(rawdata);
  let bucketName = config.bucket_name;
  return {
    ig_user_id: config.ig_user_id,
    bucket_name: config.bucket_name,
    access_token: config.access_token,
  };
}

// upload file to GCS for public download
async function uploadFile(bucketName, filePath, destFileName) {
  await storage.bucket(bucketName).upload(filePath, {
    destination: destFileName,
  });
  console.log(`${filePath} uploaded to ${bucketName}`);
}

// create media container
function createIGMedia(config, image_url, caption) {
  let container_creation_url =
    "https://graph.facebook.com/" + config.ig_user_id + "/media?";
  console.log(caption);
  request.post(
    {
      url: container_creation_url,
      form: {
        image_url: image_url,
        access_token: config.access_token,
        caption: caption,
      },
    },
    function (error, response, body) {
      let body_obj = JSON.parse(body);
      const media_container_id = body_obj.id;
      if (media_container_id != null) {
        publishMediaContainer(media_container_id, config);
      }
    }
  );
}

// publish media container
function publishMediaContainer(media_container_id, config) {
  let container_publish_url =
    "https://graph.facebook.com/" + config.ig_user_id + "/media_publish?";
  request.post(
    {
      url: container_publish_url,
      form: {
        creation_id: media_container_id,
        access_token: config.access_token,
      },
    },
    function (error, response, body) {
      if (!error) {
        console.log("Posting success!");
      }
      let body_obj = JSON.parse(body);
      const ig_media_id = body_obj.id;
      comment = hashtags;
      commentOnMedia(config, ig_media_id, comment);
    }
  );
}

function createCaption(canvas_name) {
  /* let caption_url_encoded = "";
  let caption_url_encoded =
    "Regenerative%20Generation%20%5BSeries%20" +
    canvas_name +
    "%5D%0A%0AA%20totally%20machine-driven%20art%20project%20combining%20beauty%20and%20code.%20Daily%20pieces%20of%20unique%20generative%20art%20are%20posted%2C%20with%20the%20most%20popular%20being%20minted%20as%20NFTs.%20%0A%0ARead%20more%20in%20the%20link%20in%20bio.%0A.%0A.%0A.%0A.%0A.%0A%23nft%20%23nftart%20%23nftartist%20%23nftcommunity%20%23nftcollector%20%23nftartwork%20%23nftcollection%20%23nftgram%20%23generativeart%20%23generativedesign%20%23generativegraphics%20%23modernart%20%23modernartwork%20%23digitalart%20%23digitalartist%20%23opensea";*/
  let caption_url_encoded =
    "Regenerative Generation [Series " +
    canvas_name +
    "]. A totally machine-driven art project combining beauty and code. Daily pieces of unique generative art are posted, with the most popular being minted as NFTs. Read more in the link in bio.";
  return caption_url_encoded;
}

function commentOnMedia(config, ig_media_id, comment) {
  let comment_media_url =
    "https://graph.facebook.com/" + ig_media_id + "/comments?";
  setTimeout(() => {
    request.post(
      {
        url: comment_media_url,
        form: {
          message: comment,
          access_token: config.access_token,
        },
      },
      function (error, response, body) {
        console.log(body);
        if (!error) {
          console.log("Comment success!");
        }
      }
    );
  }, 1000);
}

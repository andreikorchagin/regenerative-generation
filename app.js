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
        uploadFile(bucketName, filePath, destFileName).catch(console.error);
        let gcs_image_path = gcs_prefix + bucketName + "/" + destFileName;
        createIGMedia(config, gcs_image_path);
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
function createIGMedia(config, image_url) {
  let container_creation_url =
    "https://graph.facebook.com/" + config.ig_user_id + "/media?";
  request.post(
    {
      url: container_creation_url,
      form: {
        image_url: image_url,
        access_token: config.access_token,
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
        console.log("Success!");
      }
    }
  );
}

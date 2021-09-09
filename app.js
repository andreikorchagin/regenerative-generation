const p5 = require('node-p5');
const request = require('request');
const fs = require('fs');

// initialize all constants

const side = 1440;
const num_slices = 3;
const slice = side / num_slices;
const circle_size = side / (num_slices + 1);
const random_limit = 100000;
const dir = 'images/';
const canvas_name = getRandomInt(random_limit).toString();

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
            p.saveCanvas(canvas, dir.concat(canvas_name), 'jpg').then(filename => {
                console.log(`saved the canvas as ${filename}`);
            });
        }, 100);
    }
    p.draw = () => {
        for (var i = 0; i < num_slices + 1; i++) {
            for (var j = 0; j < num_slices + 1; j++) {
                p.fill(p.random(255), p.random(255), p.random(255));
                p.stroke(0);
                p.circle(i * slice, j * slice, circle_size);
            }
        }

    }
}

let p5Instance = p5.createSketch(sketch);

// parse config file

let rawdata = fs.readFileSync('config.json');
let config = JSON.parse(rawdata);
let container_creation_url = 'https://graph.facebook.com/' + config.ig_user_id + '/media?';
let container_publish_url = 'https://graph.facebook.com/' + config.ig_user_id + '/media_publish?';
console.log(container_publish_url);
let image_url = 'https://storage.googleapis.com/regenerative-generation/26778.png'; // hardcoded for now to test
let media_container_id;

// create media container

request.post({
    url: container_creation_url,
    form: {
        image_url: image_url,
        access_token: config.access_token
    }
}, function (error, response, body) {
    let body_obj = JSON.parse(body);
    media_container_id = body_obj.id;
    console.log('initial request body' + body);
    console.log('media container ID' + media_container_id);
    publishMediaContainer(media_container_id);
});

// publish media container

function publishMediaContainer(media_container_id) {
    request.post({
        url: container_publish_url,
        form: {
            creation_id: media_container_id,
            access_token: config.access_token
        }
    }, function (error, response, body) {
        console.log('second request body' + body);
    });
}

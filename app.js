const p5 = require('node-p5');
const side = 1080;
const num_slices = 3;
const slice = side / num_slices;
const circle_size = side / (num_slices + 1);
const random_limit = 100000;
const dir = 'images/';

function sketch(p) {
    p.setup = () => {
        let canvas = p.createCanvas(side, side);
        let canvas_name = p.random(random_limit).toFixed().toString();
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
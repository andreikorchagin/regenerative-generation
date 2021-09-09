const p5 = require('node-p5');

function sketch(p) {
    p.setup = () => {
        let side = 400;
        let canvas = p.createCanvas(side, side);
        let canvas_name = p.random(100000).toFixed().toString();
        p.colorMode(p.HSB);
        p.background(p.random(255), p.random(255), p.random(255));
        p.strokeWeight(0);
        p.noLoop();
        setTimeout(() => {
            p.saveCanvas(canvas, canvas_name, 'png').then(filename => {
                console.log(`saved the canvas as ${filename}`);
            });
        }, 100);
    }
    p.draw = () => {
        let num_slices = 3;
        let side = 400;
        let slice = side / num_slices;
        let circle_size = 100;
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
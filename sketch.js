/** @format */
/* eslint-disable require-jsdoc */

const side = 400;
const numSlices = 3;
const slice = side / numSlices;
const circleSize = 100;

// eslint-disable-next-line no-unused-vars
function setup() {
  createCanvas(side, side);
  colorMode(HSB);
  background(random(255), random(255), random(255));
  strokeWeight(0);
  noLoop();
}

// eslint-disable-next-line no-unused-vars
function draw() {
  for (let i = 0; i < numSlices + 1; i++) {
    for (let j = 0; j < numSlices + 1; j++) {
      fill(random(255), random(255), random(255));
      stroke(0);
      circle(i * slice, j * slice, circleSize);
    }
  }
  const canvasName = round(random(100000)).toString();
  saveCanvas(canvasName, 'png');
}

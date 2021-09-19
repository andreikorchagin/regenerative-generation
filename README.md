<!-- @format -->

Welcome to Regenerative Generation! This is an open-source generative art and NFT project, whose story is told on [our site](regengen.art).

The code itself is a Node port of p5.js, a generative art library. We then upload the generated image to Google Cloud Storage (GCS) and call the Instagram API to post the media.

## GETTING STARTED

1.  Clone and checkout this repo in whatever folder you'd like.
2.  Change the name of `config_template.json` to `config.json`.
3.  Fill in `config.json` with your IG ID (this can be found in your Business Manager), the GCS bucket name (found in Google Cloud Console), and the _long-lived_ Access Token to call the Instagram API.
4.  Run the commands `npm install @google-cloud/storage`, `npm install node-p5`, and `npm install --save @google-cloud/logging-winston winston`.
5.  Try to run `node app.js` and check to see if everything was created correctly. I'd recommend to put logging in to return the API responses as you can get a variety of exceptions.

## QUESTIONS?

Reach out [here](regengen.art/contact).

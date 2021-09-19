Welcome to Regenerative Generation! This is an open-source generative art and NFT project, whose story is told on [our site](http://regengen.art).

The code itself is a Node port of p5.js, a generative art library. We then upload the generated image to Google Cloud Storage (GCS) and call the Instagram API to post the media.

## GETTING STARTED

 1. Clone and checkout this repo in whatever folder you'd like.
 2. Change the name of `config_template.json` to `config.json`.
 3. Fill in `config.json` with your IG ID (this can be found in your Business Manager), the GCS bucket name (found in Google Cloud Console), the *long-lived* Access Token to call the Instagram API, your desired hashtags (which get added as a comment to keep the caption clean), and your caption. In the config I split it into two strings, because you can't have template literals (with interpolated variables) in a JSON file. Feel free to modify that piece as you see fit for your use case.
 4. Run the command `npm install` to install all dependencies, which are listed in `package.json`.
 5. Try to run `node app.js` and check to see if everything was created correctly. I'd recommend to put logging in to return the API responses as you can get a variety of exceptions. Note that the non-console logging logic is dependent on the code bring ran on the GC VM as it doesn't otherwise remotely authenticate.

## QUESTIONS?

Reach out [here](http://regengen.art/contact).

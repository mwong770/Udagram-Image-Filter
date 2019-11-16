import express from 'express';
import bodyParser from 'body-parser';
import {filterImageFromURL, deleteLocalFiles} from './util/util';
import validUrl from 'valid-url';

(async () => {

  // Init the Express application
  const app = express();

  // Set the network port
  const port = process.env.PORT || 8082;

  // Use the body parser middleware for post requests
  app.use(bodyParser.json());

  app.get("/filteredimage/", async (req, res) => {

    let { image_url } = req.query;

    // validates the image_url query
    if (!validUrl.isUri(image_url)) {
        return res.status(400).send("Please provide a valid URL.");
    }
    if (!(image_url.includes(".png") || image_url.includes(".jpg"))) {
        return res.status(422).send("The provided URL must contain a .png or .jpg extension.");
    }

    try {
        // filters the image
        filterImageFromURL(image_url).then(filteredpath => {
            // sends filtered image in response
            res.status(200).sendFile(filteredpath, (error) => {
                if (error) {
                    console.log(error);
                } else {
                    // deletes filtered image files
                    deleteLocalFiles([filteredpath]);
                }
            });

        });
    } catch (error) {
        res.sendStatus(422).send("An error occurred while processing the provided URL.");
    }

  });

  // Root Endpoint
  // Displays a simple message to the user
  app.get( "/", async ( req, res ) => {
    res.send("try GET /filteredimage?image_url={{}}")
  } );


  // Start the Server
  app.listen( port, () => {
      console.log( `server running http://localhost:${ port }` );
      console.log( `press CTRL+C to stop server` );
  } );
})();
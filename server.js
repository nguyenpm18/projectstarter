import express from 'express';
import bodyParser from 'body-parser';
import {filterImageFromURL, deleteLocalFiles} from './util/util.js';

//https://fastly.picsum.photos/id/237/200/300.jpg?hmac=TmmQSbShHz9CdQm0NkEjx1Dyh_Y984R9LpNrpvH2D_U

// Init the Express application
const app = express();

// Set the network port
const port = process.env.PORT || 8082;

// Use the body parser middleware for post requests
app.use(bodyParser.json());

// Implement the /filteredimage endpoint
app.get('/filteredimage', async (req, res) => {
    const { image_url } = req.query;

    // 1. Validate the image_url query
    if (!image_url || !isValidURL(image_url)) {
        return res.status(400).send({ message: 'Please provide a valid image URL.' });
    }

    try {
        // 2. Call filterImageFromURL(image_url) to filter the image
        const filteredImagePath = await filterImageFromURL(image_url);
        
        // 3. Send the resulting file in the response
        res.sendFile(filteredImagePath, () => {
            // 4. Delete any files on the server on finish of the response
            deleteLocalFiles([filteredImagePath]);
        });

    } catch (error) {
        res.status(500).send({ message: 'Error processing the image.' });
    }
});

// Utility function to check if a string is a valid URL
function isValidURL(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}


// Root Endpoint
// Displays a simple message to the user
app.get("/", async (req, res) => {
    res.send("try GET /filteredimage?image_url={{YOUR_IMAGE_URL_HERE}}")
});

// Start the Server
app.listen(port, () => {
    console.log(`server running http://localhost:${port}`);
    console.log(`press CTRL+C to stop server`);
});

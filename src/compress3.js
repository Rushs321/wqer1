"use strict";
const sharp = require('sharp');
const redirect = require('./redirect');

function compress(req, res, input) {
    const format = req.params.webp ? 'webp' : 'jpeg';
    
    // Create a sharp pipeline to process the image
    const pipeline = sharp()
         // Auto-rotate using EXIF Orientation tag
         // Resize the image to a height of 200 pixels
        .toFormat(format, {
            quality: req.params.quality,
            progressive: true,
            optimizeScans: true,
        });

    // Handle errors on the pipeline
    pipeline.on('error', (err) => {
        console.error('Compression error:', err);
        redirect(req, res); // Redirect on error
    });

    // Use the input stream to pipe into the sharp pipeline
    input.body.pipe(pipeline)
        .toBuffer((err, outputBuffer, info) => {
            if (err) {
                console.error('Buffer conversion error:', err);
                return redirect(req, res); // Redirect on error
            }

            // Set headers based on output info
            res.setHeader('content-type', 'image/' + format);
            res.setHeader('content-length', outputBuffer.length);
            res.setHeader('x-original-size', req.params.originSize);
            res.setHeader('x-bytes-saved', req.params.originSize - outputBuffer.length);
            res.status(200).end(outputBuffer); // Send the processed image as the response
        });
}

module.exports = compress;

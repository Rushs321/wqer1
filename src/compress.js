"use strict";
const sharp = require('sharp');
const redirect = require('./redirect');

function compress(req, res, input) {
    const format = req.params.webp ? 'webp' : 'jpeg';

    // Process the input stream to a buffer using sharp
    input.body
        .pipe(sharp({
            animated: false,
            unlimited: true
        })
        .grayscale(req.params.grayscale)
        .toFormat(format, {
            quality: req.params.quality,
            progressive: true,
            optimizeScans: true
        }))
        .toBuffer()
        .then(output => {
            // Get metadata for response headers
            return sharp(output).metadata().then(info => {
                // Set headers and send the response
                res.setHeader('content-type', 'image/' + format);
                res.setHeader('content-length', info.size);
                res.setHeader('x-original-size', req.params.originSize);
                res.setHeader('x-bytes-saved', req.params.originSize - info.size);
                res.status(200).end(output); // End the response with the buffer
            });
        })
        .catch(err => {
            console.error('Compression error:', err);
            redirect(req, res); // Handle errors by redirecting
        });
}

module.exports = compress;

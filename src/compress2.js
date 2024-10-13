"use strict";
const sharp = require('sharp');
const redirect = require('./redirect');

function compress(req, res, input) {
    const format = req.params.webp ? 'webp' : 'jpeg';

    // Create a sharp pipeline for processing
    const pipeline = sharp({
        animated: false,
        unlimited: true
        //concurrency: 0 // Use optimal concurrency based on system
    })
        .grayscale(req.params.grayscale)
        .toFormat(format, {
            quality: req.params.quality,
            progressive: true,
            optimizeScans: true
        });

    // Handle errors in the pipeline
    pipeline.on('error', err => {
        console.error('Compression error:', err);
        redirect(req, res);
    });

    // Pipe the input stream to the sharp pipeline, then directly to the response
    input.body.pipe(pipeline).pipe(res)
        .on('finish', () => {
            console.log('Image processed and sent successfully.');
        })
        .on('error', err => {
            console.error('Error sending response:', err);
            redirect(req, res);
        });
}

module.exports = compress;

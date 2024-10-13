"use strict";
const sharp = require('sharp');
const redirect = require('./redirect');

const sharpStream = _ => sharp({ animated: !process.env.NO_ANIMATE, unlimited: true });

function compress(req, res, input) {
  const format = req.params.webp ? 'webp' : 'jpeg';

  input.body.pipe(sharpStream()
    .grayscale(req.params.grayscale)
    .toFormat(format, {
      quality: req.params.quality,
      progressive: true,
      optimizeScans: true
    })
    .on('error', err => {
      console.error('Compression error:', err);
      redirect(req, res);
    })
    .on('info', info => {
      res.setHeader('content-type', 'image/' + format);
      res.setHeader('x-original-size', req.params.originSize);
      res.setHeader('x-bytes-saved', req.params.originSize - info.size);
    })
    .pipe(res)); // Directly pipe the transformed output to the response
}

module.exports = compress;

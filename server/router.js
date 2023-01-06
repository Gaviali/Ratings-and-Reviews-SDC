const express = require('express');
const router = express.Router()
const controller = require('./controllers');

router.get('/reviews/meta/:product_id?', controller.reviews.getMeta);

router.get('/reviews/:product_id?/:count?/:page?', controller.reviews.getReview);

router.post('/reviews/:product_id?', controller.reviews.post);

router.put('/reviews/:review_id?/helpful', controller.reviews.putHelpful);

router.put('/reviews/:review_id?/report', controller.reviews.putReport);

module.exports = router;
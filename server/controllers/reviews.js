const model = require('../models');

module.exports = {
  getReview: (req, res) => {
    // console.log('parameters: ', req.params)
    model.reviews.getReview((err, modelRes) => {
      if (err) {
        console.error(err);
        res.status(404).send(err);
      } else {
        // formatting data object
        const data = {
          product_id: req.params.product_id,
          page: 0,
          count: modelRes.length,
          results: modelRes.rows.map((resObj, index) => {
            return {
              review_id: resObj.review_id,
              rating: resObj.rating,
              date: new Date(+resObj.date),
              summary: resObj.summary,
              body: resObj.body,
              recommend: resObj.recommend,
              reported: resObj.reported,
              reviewer_name: resObj.reviewer_name,
              reviewer_email: resObj.reviewer_email,
              response: resObj.response,
              // === 'null' ? JSON.parse(resObj.response) : resObj.response,
              helpfulness: resObj.helpfulness,
              photos: resObj.reviewsphotos,
            };
          }),
        };
        res.status(200).send(data);
      }
    }, req.params);
  },
  getMeta: (req, res) => {
    model.reviews.getMeta((err, metaRes) => {
      if (err) {
        console.error(err);
        res.status(404).send(err);
      } else {
        /*
          rating: { 1: val, 2: val, 3: val, 4: val, 5: val}  -from reviews
          recommend: { true: val, false: val}  -from reviews
          characteristics: {
            "name from characteristics table": {  -from characteristics
              "id": char_id,      -from charreview
              "value": AVERAGE of all values      -from charreview
            }
          }
        */
        const data = {
          product_id: req.params.product_id,
          rating: metaRes[0],
          recommend: {
            true: Number(metaRes[1].true),
            false: Number(metaRes[1].false),
          },
          characteristics: metaRes[2],
        };
        res.status(200).send(data);
      }
    }, req.params);
  },
  post: (req, res) => {
    const reviewData = {
      product_id: req.body.product_id,
      rating: req.body.rating,
      date: Date.now(),
      summary: req.body.summary || '',
      body: req.body.body,
      recommend: req.body.recommend,
      reported: false,
      reviewer_name: req.body.reviewer_name,
      reviewer_email: req.body.reviewer_email,
      response: null,
      helpfulness: 0,
      photos: req.body.photos,
      characteristics: req.body.characteristics,
    }

    // console.log('all data here: ', reviewData);

    model.reviews.post((err, postRes) => {
      if (err) {
        console.error(err);
        res.status(404).send('error posting')
      } else {
        res.status(201).send('successful post');
      }
    }, reviewData)
  },
  putHelpful: (req, res) => {
    model.reviews.setHelpful((err, putRes) => {
      if (err) {
        console.error(err);
      } else {
        res.status(204).send();
      }
    }, req.params)
  },
  putReport: (req, res) => {
    model.reviews.setReport((err, putRes) => {
      if (err) {
        console.error(err);
      } else {
        res.status(204).send();
      }
    }, req.params)
  }
}
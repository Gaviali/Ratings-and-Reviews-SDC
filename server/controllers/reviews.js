const model = require('../models');

module.exports = {
  getReview: (req, res) => {
    const query = {
      product_id: (req.params.product_id) || (req.query.product_id),
      page: Number(req.params.page) || Number(req.query.page) || 0,
      count: Number(req.params.count) || Number(req.query.count)
    }
    model.reviews.getReview((err, modelRes) => {
      if (err) {
        console.error(err);
        res.status(404).send(err);
      } else {
        // formatting data object
        const data = {
          product_id: query.product_id,
          page: query.page || 1,
          count: query.count || 5,
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
              helpfulness: resObj.helpfulness,
              photos: resObj.reviewsphotos,
            };
          }),
        };
        res.status(200).send(data);
      }
    }, query);
  },
  getMeta: (req, res) => {
    // console.time('controller');
    model.reviews.getMeta((err, metaRes) => {
      if (err) {
        console.error(err);
        res.status(404).send(err);
      } else {
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
        // console.timeEnd('controller');
      }
    }, req.params);
  },
  post: (req, res) => {
    const reviewData = {
      product_id: req.params.product_id,
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
    model.reviews.post((err, postRes) => {
      if (err) {
        console.error(err);
        res.status(404).send('error posting')
      } else {
        res.status(201).send('successful post');
      }
    }, testData)
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

const testData = {
  product_id: 25,
  rating: 5,
  date: Date.now(),
  summary: "big summary",
  body: "body ",
  recommend: true,
  reported: false,
  reviewer_name: "person name",
  reviewer_email: "person@email.com",
  response: null,
  helpfulness: 0,
  photos: [
    "only one photo"
  ],
  characteristics: {
    "Quality": 5,
    "Length": 5
  }
}
// photos being thrown in random places

// https://app-hrsei-api.herokuapp.com/api/fec2/hr-rfp/reviews/40353
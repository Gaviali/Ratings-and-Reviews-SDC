const db = require('../../databases/reviewsPg')

module.exports = {
  getReview: (cb, params) => {
    const limit = 5;
    // 'review_id', p.review_id, not needed
    // using json_agg to combine array, then build photos object
    const getQuery = `
      SELECT r.*, JSON_AGG(JSON_BUILD_OBJECT
        ('photo_id', p.photo_id, 'url', p.url)) AS reviewsphotos
      FROM reviews r
        LEFT JOIN reviewsphotos p
        ON r.review_id = p.review_id
      WHERE r.product_id = ${params.product_id} AND r.reported = false
      GROUP BY r.review_id`;
    // LIMIT ${limit}
    db.query(getQuery, (err, res) => {
      cb(err, res);
    });
  },
  getMeta: async (cb, params) => {
    // need to build objects for: ratings, recommended, characteristics, objects for each characteristic name
    const totalQuery = `SELECT count(*) FILTER (WHERE product_id = ${params.product_id}) FROM reviews`;
    const recommendedQuery = `SELECT count(*) FILTER (WHERE product_id = ${params.product_id} AND recommend) FROM reviews`;

    // object for ratings
    let ratingObj = {};
    for (let i = 1; i < 6; i++) {
      await db.query(`SELECT count(*) FROM reviews WHERE rating = ${i} AND product_id = ${params.product_id}`)
        .then((res) => {
          ratingObj[i] = Number(res.rows[0].count);
        })
    }

    // object for recommend
    let resObj = {};
    let charObj = {};
    await db.query(totalQuery)
      .then((total) => {
        let max = total.rows[0].count;
        let recCount;
        db.query(recommendedQuery)
          .then((recs) => {
            recCount = recs.rows[0].count;
            resObj['true'] = recCount;
            resObj['false'] = max - recCount;
            db.query(`SELECT char_id, name FROM characteristics WHERE product_id = ${params.product_id}`)
              .then((charRes) => {
                return Promise.all(charRes.rows.map(async (char) => {
                  await db.query(`SELECT value FROM charreviews WHERE char_id = ${char.char_id}`)
                    .then((valueRes) => {
                      let avg = valueRes.rows.reduce((acc, val) => {
                        acc += val.value;
                        return acc;
                      }, 0);
                      charObj[char.name] = {
                        id: Number(char.char_id),
                        value: avg /= valueRes.rows.length,
                      };
                    })
                    .catch((err) => console.error(err))
                  }))
              })
              .then(() => {
                let EVERYTHING = [ratingObj, resObj, charObj];
                cb(null, EVERYTHING);
              })
              .catch((err) => {
                cb(err);
              })
          })
          .catch((err) => console.log(err))
        })
      .catch((err) => console.log(err))

    // object for characteristics

  },
  post: async (cb, params) => {
    // response, helpfulness and reported should have default values
    const insertReview = `INSERT INTO Reviews (product_id, rating, date, summary, body, recommend, reported, reviewer_name, reviewer_email, response, helpfulness)
      VALUES (${params.product_id}, ${params.rating}, ${params.date}, '${params.summary.replace("'", "''")}', '${params.body.replace("'", "''")}', ${params.recommend}, ${params.reported}, '${params.reviewer_name.replace("'", "''")}', '${params.reviewer_email}', ${params.response}, ${params.helpfulness})`;

    // set sequence to be greater than max id value, avoid dup, only needs to be used once if data is out of sync
    // If anything this should be in the sql, run at the very end to correct the sequences
    // db.query("SELECT setval('public.reviews_review_id_seq', (SELECT MAX(review_id) FROM reviews)+1);")
    // db.query("SELECT setval('public.reviewsphotos_photo_id_seq', (SELECT MAX(photo_id) FROM reviewsphotos)+1);")
    // db.query("SELECT setval('public.charreviews_charreview_id_seq', (SELECT MAX(charreview_id) FROM charreviews)+1);")

    // insert our review into db
    await db.query(insertReview)
      .then(() => {
        console.log('review inserted');
      })
      .catch((err) => console.error('review error: ', err))

    // get id of the review that we just inserted
    let linkReview = 0;
    await db.query('SELECT review_id FROM reviews ORDER BY review_id DESC LIMIT 1')
      .then(({ rows }) => {
        linkReview = rows[0].review_id;
      });

    // insert all photos
    await params.photos.forEach((photo) => {
      db.query(`INSERT INTO ReviewsPhotos (review_id, url)
          VALUES (${linkReview}, '${photo}')`)
        .then(() => {
          console.log('photo inserted');
        })
        .catch((err) => console.error('photos error: ', err))
    })

    // insert all keys
    const charKeys = Object.keys(params.characteristics);
    await charKeys.forEach((key) => {
      db.query(`INSERT INTO CharReviews (char_id, review_id, value)
      VALUES ((SELECT char_id FROM characteristics WHERE product_id = ${params.product_id} AND name = '${key}'), ${linkReview}, ${params.characteristics[key]})`)
        .then(() => {
          console.log('key inserted')
        })
        .catch((err) => console.error('char error: ', err))
    })
    cb();
  },
  setHelpful: (cb, params) => {
    // console.log(params)
    const updateReview = `UPDATE Reviews SET helpfulness = helpfulness + 1 WHERE review_id = ${params.review_id}`;
    db.query(updateReview, (err, res) =>
      cb(err, res))
  },
  setReport: (cb, params) => {
    const updateReport = `UPDATE Reviews SET reported = true WHERE review_id = ${params.review_id}`;
    db.query(updateReport, (err, res) =>
      cb(err, res))
  }
};
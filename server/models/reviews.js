const db = require('../../databases/reviewsPg')

module.exports = {
  getReview: (cb, params) => {
    const limit = params.count || 5;
    // 'review_id', p.review_id, not needed
    // using json_agg to combine array, then build photos object
    const getQuery = `
      SELECT r.*, JSON_AGG(JSON_BUILD_OBJECT
        ('photo_id', p.photo_id, 'url', p.url)) AS reviewsphotos
      FROM reviews r
        LEFT JOIN reviewsphotos p
        ON r.review_id = p.review_id
      WHERE r.product_id = ${params.product_id} AND r.reported = false
      GROUP BY r.review_id
      LIMIT ${limit}`;
    // r.reported = false AND             AND r.reported = false
    db.query(getQuery, (err, res) => {
      cb(err, res);
    });
  },
  getMeta: async (cb, params) => {
    console.log(params);
    // need to build objects for: ratings, recommended, characteristics, objects for each characteristic name
    const totalQuery = `SELECT count(*) FROM reviews WHERE product_id = ${params.product_id}`;
    const recommendedQuery = `SELECT count(*) FROM reviews WHERE recommend AND product_id = ${params.product_id}`;

    // object for ratings
    // const loop = (async () => {for (let i = 1; i < 6; i++) {
    //   console.time(`rating ${i}`);
    //   await db.query(`SELECT count(*) FROM reviews WHERE product_id = ${params.product_id} AND rating = ${i}`)
    //     .then((res) => {
    //       ratingObj[i] = Number(res.rows[0].count);
    //       console.timeEnd(`rating ${i}`);
    //     })
    // }})();

    let ratingObj = {};
    for (let i = 1; i < 6; i++) {
      console.time(`rating ${i}`);
      db.query(`SELECT count(*) FROM reviews WHERE product_id = ${params.product_id} AND rating = ${i}`)
        .then((res) => {
          ratingObj[i] = Number(res.rows[0].count);
          console.timeEnd(`rating ${i}`);
        })
    }

    // object for recommend and characteristics
    let resObj = {};
    let charObj = {};
    console.time('total');
    db.query(totalQuery)
      .then((total) => {
        let max = total.rows[0].count;
        let recCount;
        console.timeEnd('total');
        console.time('recommend');
        db.query(recommendedQuery)
          .then((recs) => {
            recCount = recs.rows[0].count;
            resObj['true'] = recCount;
            resObj['false'] = max - recCount;
            console.timeEnd('recommend');
            console.time('char_id, name query');
            db.query(`SELECT char_id, name FROM characteristics WHERE product_id = ${params.product_id}`)
              .then((charRes) => {
                console.timeEnd('char_id, name query');
                return Promise.all(charRes.rows.map(async (char, i) => {
                  console.time('chars' + i);
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
                      console.timeEnd('chars' + i);
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
  },
  post: async (cb, params) => {
    // response, helpfulness and reported should have default values
    const insertReview = `INSERT INTO Reviews (product_id, rating, date, summary, body, recommend, reported, reviewer_name, reviewer_email, response, helpfulness)
      VALUES (${params.product_id}, ${params.rating}, ${params.date}, '${params.summary.replace("'", "''")}', '${params.body.replace("'", "''")}', ${params.recommend}, ${params.reported}, '${params.reviewer_name.replace("'", "''")}', '${params.reviewer_email}', ${params.response}, ${params.helpfulness})`;

    // insert our review into db
    console.time('insert review');
    await db.query(insertReview)
      .then((res) => {
        console.timeEnd('insert review');
        // console.log(res);
      })
      .catch((err) => {
        console.error('review error: ', err)
        cb(err)
      })

    // get id of the review that we just inserted
    let linkReview = 0;
    console.time('get review');
    await db.query('SELECT review_id FROM reviews ORDER BY review_id DESC LIMIT 1')
      .then(({ rows }) => {
        linkReview = rows[0].review_id;
        // console.log(linkReview)
        console.timeEnd('get review');
      });

    // insert all photos
    console.time('photo inserted');
    Promise.all(params.photos.map(async (photo) => {
      await db.query(`INSERT INTO ReviewsPhotos (review_id, url) VALUES (${linkReview}, '${photo}')`)
        .then(() => {
          console.timeEnd('photo inserted');
        })
        .catch((err) => {
          console.error('photos error: ', err)
          cb(err)
        })
    }));

    // insert all keys
    const charKeys = Object.keys(params.characteristics);
    await charKeys.forEach((key) => {
      console.time('key inserted ' + key)
      db.query(`INSERT INTO CharReviews (char_id, review_id, value)
      VALUES ((SELECT char_id FROM characteristics WHERE product_id = ${params.product_id} AND name = '${key}'), ${linkReview}, ${params.characteristics[key]})`)
        .then(() => {
          console.timeEnd('key inserted ' + key)
        })
        .catch((err) => {
          console.error('char error: ', err)
          cb(err)
        })
    })
    cb(); // gets called way too early
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
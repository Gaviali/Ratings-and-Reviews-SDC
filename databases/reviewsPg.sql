-- Table 'Reviews Results'
DROP DATABASE IF EXISTS reviews;

CREATE DATABASE reviews;

\timing
-- \c reviews;

DROP TABLE IF EXISTS  Reviews CASCADE;
DROP TABLE IF EXISTS  ReviewsPhotos CASCADE;
DROP TABLE IF EXISTS  Characteristics CASCADE;
DROP TABLE IF EXISTS  CharReviews CASCADE;

-- Table 'Reviews'

CREATE TABLE Reviews (
   review_id  SERIAL PRIMARY KEY, -- SERIAL
   product_id  INT, -- SERIAL
   rating  INT ,
   date  BIGINT , --looks like a bunch of numbers in the csv
   summary  TEXT ,
   body  TEXT ,
   recommend  BOOLEAN ,
   reported  BOOLEAN ,
   reviewer_name  TEXT ,
   reviewer_email TEXT ,
   response  TEXT ,
   helpfulness  INT
);

CREATE INDEX r_review_id_index ON Reviews(review_id);
CREATE INDEX r_product_id_index ON Reviews(product_id);


-- Table 'Reviews Photos'

CREATE TABLE  ReviewsPhotos  (
   photo_id  SERIAL PRIMARY KEY, -- SERIAL
   review_id  INT, -- SERIAL
   url  TEXT
);

CREATE INDEX rp_photo_id_index ON ReviewsPhotos(photo_id);
CREATE INDEX rp_review_id_index ON ReviewsPhotos(review_id);


-- Table 'Characteristics'

CREATE TABLE  Characteristics  (
  char_id SERIAL PRIMARY KEY, -- SERIAL
  product_id INT, -- SERIAL
  name TEXT
);

CREATE INDEX c_char_id_index ON Characteristics(char_id);
CREATE INDEX c_product_id_index ON Characteristics(product_id);


-- Table 'CharReviews'

CREATE TABLE  CharReviews (
  charReview_id SERIAL PRIMARY KEY, -- SERIAL
  char_id INT, -- SERIAL
  review_id INT, -- SERIAL
  value INT
);

CREATE INDEX cr_charReview_id_index ON CharReviews(charReview_id);
CREATE INDEX cr_char_id_index ON CharReviews(char_id);
CREATE INDEX cr_review_id_index ON CharReviews(review_id);


-- Foreign Keys

ALTER TABLE  ReviewsPhotos  ADD FOREIGN KEY (review_id) REFERENCES  Reviews  ( review_id );
ALTER TABLE  Characteristics  ADD FOREIGN KEY (product_id) REFERENCES  Reviews  ( product_id );
ALTER TABLE  CharReviews ADD FOREIGN KEY (char_id) REFERENCES Characteristics  ( char_id );
ALTER TABLE  CharReviews ADD FOREIGN KEY (review_id) REFERENCES Reviews  ( review_id );


-- COPY table
-- FROM 'path'
-- DELIMITER ','
-- CSV HEADER;

-- Copies csv file directly from file path to database

COPY Reviews(review_id, product_id, rating, date, summary, body, recommend, reported, reviewer_name, reviewer_email, response, helpfulness)
FROM '/Users/jeffreyzhang/Desktop/Hack/SDC/Ratings-and-Reviews-SDC/sdc_data/reviews.csv'
DELIMITER ','
CSV HEADER;

COPY ReviewsPhotos(photo_id, review_id, url)
FROM '/Users/jeffreyzhang/Desktop/Hack/SDC/Ratings-and-Reviews-SDC/sdc_data/reviews_photos.csv'
DELIMITER ','
CSV HEADER;

COPY Characteristics(char_id, product_id, name)
FROM '/Users/jeffreyzhang/Desktop/Hack/SDC/Ratings-and-Reviews-SDC/sdc_data/characteristics.csv'
DELIMITER ','
CSV HEADER;

COPY CharReviews(charReview_id, char_id, review_id, value)
FROM '/Users/jeffreyzhang/Desktop/Hack/SDC/Ratings-and-Reviews-SDC/sdc_data/characteristic_reviews.csv'
DELIMITER ','
CSV HEADER;

-- fix sequence to current max value

SELECT pg_catalog.setval(pg_get_serial_sequence('reviews', 'review_id'), MAX(review_id)) FROM reviews;
SELECT pg_catalog.setval(pg_get_serial_sequence('reviewsphotos', 'photo_id'), MAX(photo_id)) FROM reviewsphotos;
SELECT pg_catalog.setval(pg_get_serial_sequence('charreviews', 'charreview_id'), MAX(charreview_id)) FROM charreviews;
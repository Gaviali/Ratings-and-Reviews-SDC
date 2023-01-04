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

-- Table 'Reviews Photos'

CREATE TABLE  ReviewsPhotos  (
   photo_id  SERIAL PRIMARY KEY, -- SERIAL
   review_id  INT, -- SERIAL
   url  TEXT
);


-- Table 'Characteristics'

CREATE TABLE  Characteristics  (
  char_id SERIAL PRIMARY KEY, -- SERIAL
  product_id INT, -- SERIAL
  name TEXT
);


-- Table 'CharReviews'

CREATE TABLE  CharReviews (
  charReview_id SERIAL PRIMARY KEY, -- SERIAL
  char_id INT, -- SERIAL
  review_id INT, -- SERIAL
  value INT
);


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
FROM '/Users/jeffreyzhang/Desktop/Hack/SDC/DolchyGabbana/sdc_data/reviews.csv'
DELIMITER ','
CSV HEADER;

COPY ReviewsPhotos(photo_id, review_id, url)
FROM '/Users/jeffreyzhang/Desktop/Hack/SDC/DolchyGabbana/sdc_data/reviews_photos.csv'
DELIMITER ','
CSV HEADER;

COPY Characteristics(char_id, product_id, name)
FROM '/Users/jeffreyzhang/Desktop/Hack/SDC/DolchyGabbana/sdc_data/characteristics.csv'
DELIMITER ','
CSV HEADER;

COPY CharReviews(charReview_id, char_id, review_id, value)
FROM '/Users/jeffreyzhang/Desktop/Hack/SDC/DolchyGabbana/sdc_data/characteristic_reviews.csv'
DELIMITER ','
CSV HEADER;
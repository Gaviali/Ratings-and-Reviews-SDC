const mongoose = require('mongoose');

const connectionString = 'mongodb://localhost:5432/reviews';

mongoose.connect(connectionString);

const reviewData = new mongoose.Schema({
  review_id: Number,
  product_id : Number,
  rating: Number,
  date: Date,
  summary: String,
  body: String,
  recommended: Boolean,
  reported: Boolean,
  reviewer_name: String,
  reviewer_email: String,
  response: String,
  helpfulness: Number,
  photos: {
    id: Number,
    value: String
  }
})

const charData = new mongoose.Schema({
  char_id: Number,
  product_id: Number,
  characteristics: {
    name: {
      id: Number,
      value: String,
    }
  }

})

const reviews = new mongoose.Schema({
  product_id: Number,
  review_data: reviewData,
  char_data: charData,
});

const Reviews = mongoose.model('Reviews', reviews);

module.export = Reviews;
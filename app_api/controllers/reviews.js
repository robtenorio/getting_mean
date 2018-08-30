const mongoose = require('mongoose');
let dbURI = 'mongodb://localhost:27017/Loc8r';
if (process.env.NODE_ENV === 'production') {
  dbURI = process.env.MONGODB_URI;
}
const locationsDb = mongoose.createConnection(dbURI, {useNewUrlParser: true});
const Loc = locationsDb.model('Location');
const {sendJsonResponse} = require('./_miscFunctions/sharedFunctions');

// helper functions for reviewsCreate
const _doSetAverageRating = function(location) {
  if (location.reviews && location.reviews.length > 0) {
    const reviewCount = location.reviews.length;
    const ratingTotal = location.reviews.reduce((total, review) => {
      return total + review.rating;
    }, 0);
    let ratingAverage = parseInt(ratingTotal / reviewCount, 10);
    location.rating = ratingAverage;
    location.save((err) => {
      if (err) {
        console.log(err);
      } else {
        console.log("Average rating updated to", ratingAverage);
      }
    });
  }
};

const _updateAverageRating = function(locationid) {
  Loc
    .findById(locationid)
    .select('rating reviews')
    .exec((err, location) => {
      if (!err) {
        _doSetAverageRating(location);
      }
    });
};

const _doAddReview = function(req, res, location) {
  if (!location) {
    sendJsonResponse(res, 400, {"message" : "locationid not found"});
  } else {
    location.reviews.push({
      author: req.body.author,
      rating: req.body.rating,
      reviewText: req.body.reviewText
    });
    location.save((err, location) => {
      if (err) {
        console.log(err)
        sendJsonResponse(res, 400, err);
      } else {
        _updateAverageRating(location._id);
        let thisReview = location.reviews[location.reviews.length - 1];
        sendJsonResponse(res, 201, thisReview);
      }
    });
  }
};

const reviewsCreate = function (req, res) {
  const locationid = req.params.locationid;
  if (locationid) {
    Loc
      .findById(locationid)
      .select('reviews')
      .exec((err, location) => {
        if (err) {
          sendJsonResponse(res, 400, err);
        } else {
          _doAddReview(req, res, location);
        }
      }
    );
  } else {
    sendJsonResponse(res, 404, err);
  }
};

const reviewsReadOne = function (req, res) {
  if (req.params && req.params.locationid && req.params.reviewid) {
    Loc
      .findById(req.params.locationid)
      .select('name reviews')
      .exec((err, location) => {
        if (!location) {
          sendJsonResponse(res, 404, {"message" : "locationid not found"});
            return;
        } else if (err) {
          sendJsonResponse(res, 404, err);
          return;
        }
        if (location.reviews && location.reviews.length > 0) {
          const review = location.reviews.id(req.params.reviewid);
          if (!review) {
            sendJsonResponse(res, 404, {"message" : "reviewid not found"});
          } else {
            response = {
              location : {
                name : location.name,
                id : req.params.locationid
              },
              review : review
            };
            sendJsonResponse(res, 200, response);
          }
        } else {
          sendJsonResponse(res, 404, {"message" : "no reviews found"});
        }
      }
    );
  } else {
    sendJsonResponse(res, 404, {"message" : "not found, locationid and reviewid are both required"});
  }
  };

const reviewsUpdateOne = function (req, res) {
  if (!req.params.locationid || !req.params.reviewid) {
    sendJsonResponse(res, 404, {"message" : "Not found, locationid and reviewid are both required"});
    return;
  }
  Loc
    .findById(req.params.locationid)
    .select('reviews')
    .exec((err, location) => {
      if (!location) {
        sendJsonResponse(res, 404, {"message" : "locationid not found"});
        return;
      } else if (err) {
        sendJsonResponse(res, 400, err);
        return;
      }
      if (location.reviews && location.reviews.length > 0) {
        let thisReview = location.reviews.id(req.params.reviewid);
        if (!thisReview) {
          sendJsonResponse(res, 404, {"message" : "reviewid not found"});
        } else {
          if (req.body.author) {
            thisReview.author = req.body.author;
          }
          if (req.body.rating) {
            thisReview.rating = req.body.rating;
          }
          if (req.body.reviewText) {
            thisReview.reviewText = req.body.reviewText;
          }
          location.save((err, location) => {
            if (err) {
              sendJsonResponse(res, 404, err);
            } else {
              _updateAverageRating(location._id);
              sendJsonResponse(res, 200, thisReview);
            }
          });
        }
      } else {
        sendJsonResponse(res, 404, {"message" : "No review to update"});
      }
    });
  };
const reviewsDeleteOne = function (req, res) {
  if (!req.params.locationid || !req.params.reviewid) {
    sendJsonResponse(res, 404, {"message" : "Not found, locationid and reviewid are both required"});
    return;
  }
  Loc
    .findById(req.params.locationid)
    .select('reviews')
    .exec((err, location) => {
      if (!location) {
        sendJsonResponse(res, 404, {"message" : "locationid not found"});
        return;
      } else if (err) {
        sendJsonResponse(res, 400, err);
        return;
      }
      if (location.reviews && location.reviews.length > 0) {
        if (!location.reviews.id(req.params.reviewid)) {
          sendJsonResponse(res, 404, {"message" : "reviewid not found"});
        } else {
          location.reviews.id(req.params.reviewid).remove();
          location.save((err) => {
            if (err) {
              sendJsonResponse(res, 404, err);
            } else {
              _updateAverageRating(location._id);
              sendJsonResponse(res, 204, {"message" : "review successfully removed!"});
            }
          })
        }
      } else {
        sendJsonResponse(res, 404, {"message" : "No review to remove"});
      }
    });
  };

module.exports = {
  reviewsCreate,
  reviewsReadOne,
  reviewsUpdateOne,
  reviewsDeleteOne
};

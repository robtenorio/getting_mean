const mongoose = require('mongoose');
let dbURI = 'mongodb://localhost:27017/Loc8r';
if (process.env.NODE_ENV === 'production') {
  dbURI = process.env.MONGODB_URI;
}
const locationsDb = mongoose.createConnection(dbURI, {useNewUrlParser: true});
const Loc = locationsDb.model('Location');
const {sendJsonResponse} = require('./_miscFunctions/sharedFunctions');

// helper function to use in locationsListByDistance
const _buildLocationList = (err, req, res, results) => {
  let locations = [];
  if(err) {
    sendJsonResponse(res, 404, err);
  } else  {
    results.forEach((doc) => {
      locations.push({
        distance: doc.dist,
        name: doc.name,
        address: doc.address,
        rating: doc.rating,
        facilities: doc.facilities,
        _id: doc._id
      });
    });
    return locations;
  };
};

const locationsListByDistance = function (req, res) {
  const lng = parseFloat(req.query.lng);
  const lat = parseFloat(req.query.lat);
  const maxDist = parseFloat(req.query.max);

  const point = {
    type: "Point",
    coordinates: [lng, lat]
  };
  if((!lng && lng !== 0) || (!lat && lat !== 0) || !maxDist) {
    sendJsonResponse(res, 404, {"message" : "lng, lat, and max query parameters are required"});
    return;
  }
  Loc.aggregate( //using aggregate because geoNear is no longer supported after Mongoose 5
    [{
      '$geoNear': {
        'near': point,
        'spherical': true,
        'distanceField': 'dist',
        'num': 2,
        'maxDistance': maxDist
      }
    }],
    function(err, results) {
      const locations = _buildLocationList(err, req, res, results);
      console.log('Geo Results', results);
      sendJsonResponse(res, 200, locations);
    });
};

const locationsCreate = function (req, res) {
  Loc.create({
    name: req.body.name,
    address: req.body.address,
    facilities: req.body.facilities.split(","),
    coords: [parseFloat(req.body.lng), parseFloat(req.body.lat)],
    openingTimes: [{
      days: req.body.days1,
      opening: req.body.opening1,
      closing: req.body.closing1,
      closed: req.body.closed1
    }, {
      days: req.body.days2,
      opening: req.body.opening2,
      closing: req.body.closing2,
      closed: req.body.closed2
    }]
  }, (err, location) => {
    if (err) {
      res
        .status(400)
        .json(err);
    } else {
      res
        .status(201)
        .json(location);
    }
  });
};

const locationsReadOne = function (req, res) {
  if (req.params && req.params.locationid) {
    Loc
      .findById(req.params.locationid)
      .exec((err, location) => {
        if (!location) {
          res
            .status(404)
            .json({
              "message" : "locationid not found"
            });
          return;
        } else if (err) {
          res
            .status(404)
            .json(err);
          return;
        }
        res
          .status(200)
          .json(location);
      });
  } else {
    res
      .status(404)
      .json({
        "message" : "No locationid in request"
      });
  }
};

const locationsUpdateOne = function (req, res) {
  if (!req.params.locationid) {
    sendJsonResponse(res, 404, {"message" : "Not found, locationid is required"});
    return;
  }
  Loc
    .findById(req.params.locationid)
    .select('-reviews -rating')
    .exec((err, location) => {
      if (!location) {
        sendJsonResponse(res, 404, {"message" : "locationid not found"});
        return;
      } else if (err) {
        sendJsonResponse(res, 400, err);
        return;
      }
      if (req.body.name) {
        location.name = req.body.name;
      }
      if (req.body.address) {
        location.address = req.body.address;
      }
      if (req.body.facilities) {
        location.facilities = req.body.facilities.split(' , ');
      }
      if (req.body.lng && req.body.lat) {
        location.coords = [
          parseFloat(req.body.lng),
          parseFloat(req.body.lat)
        ];
      }
      if (req.body.days1 && req.body.opening1 && req.body.closing1 && req.body.closed1 &&
      req.body.days2 && req.body.opening2 && req.body.closing2 && req.body.closed2) {
        location.openingTimes = [{
          days: req.body.days1,
          opening: req.body.opening1,
          closing: req.body.closing1,
          closed: req.body.closed1
        }, {
          days: req.body.days2,
          opening: req.body.opening2,
          closing: req.body.closing2,
          closed: req.body.closed2
        }];
      }
      location.save((err, location) => {
        if (err) {
          sendJsonResponse(res, 404, err);
        } else {
          sendJsonResponse(res, 200, location);
        }
      });
    });
  };

const locationsDeleteOne = function (req, res) {
  const locationid = req.params.locationid;
  if (locationid) {
    Loc
      .findById(locationid)
      .exec((err, location) => {
        // do something with the document
        location.remove((err, location) => {
          if(err) {
            sendJsonResponse(res, 404, err);
          } else {
            sendJsonResponse(res, 204, console.log("Removed: ", location))
          }
        });
      });
  } else {
    sendJsonResponse(res, 404, {"message" : "No locationid"});
  }};

module.exports = {
  locationsListByDistance,
  locationsCreate,
  locationsReadOne,
  locationsUpdateOne,
  locationsDeleteOne
};

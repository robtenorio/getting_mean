const request = require('request');
const apiOptions = {
  server : 'http://localhost:3000',
};

if (process.env.NODE_ENV === 'production') {
  apiOptions.server = 'https://gorgeous-yosemite-54146.herokuapp.com/';
}

/// error handling controller
const _showError = function(req, res, status) {
  let title = '';
  let content = '';
  if (status === 404) {
    title = '404, page not found';
    content = 'Oh dear. Looks like we can\'t find this page. Sorry.';
  } else {
    title = `${status}, something's gone wrong`;
    content = 'Something, somewhere, has gone just a little bit wrong';
  }
  res.status(status);
  res.render('generic-text', {
    title : title,
    content : content
  });
};

/// locations list page
const _renderHomepage = function(req, res, responseBody) {
  let message = null;
  if (!(responseBody instanceof Array)){
    message = "API lookup error";
    responseBody =[];
  } else {
    if (!responseBody.length) {
      message = "No places found nearby";
    }
  }
  res.render('locations-list', {
    title: 'Loc8r - find a place to work with wifi',
    pageHeader: {
      title: 'Loc8r',
      strapline: 'Find places to work with wifi near you!'
    },
    sidebar: 'Looking for wifi and a seat? Loc8r helps you find places to work when out and about. Perhaps with coffee, cake, or a pint? Let Loc8r help you find the place you\'re looking for.',
    locations: responseBody,
    message: message
  });
};

const _formatDistance = function(distance) {
  let thisDistance = 0;
  let unit = 'm';
  if(!distance || isNaN(distance)) {
    console.log("No distance found");
    return;
  }
  if (distance > 1000) {
    thisDistance = parseFloat(distance / 1000).toFixed(1);
    unit = 'km';
  } else {
    thisDistance = Math.floor(distance);
  }
  return thisDistance + unit;
};

/* Get home page */
const homelist = function(req, res) {
  const path = '/api/locations';
  const requestOptions = {
    url : apiOptions.server + path,
    method: 'GET',
    json : {},
    qs : {
      lng : -0.9630870,
      lat : 51.451010,
      max : 1120
    }
  };
  request(requestOptions, (err, response, body) => {
    let data = body;
    if (response.statusCode === 200 && data.length) {
      for (let i = 0; i < data.length; i++) {
        data[i].distance = _formatDistance(data[i].distance);
      }
    }
    _renderHomepage(req, res, data);
    }
  );
};

// location info function with callback for details and add review pages
const _getLocationInfo = function(req, res, callback) {
  const path = `/api/locations/${req.params.locationid}`;
  const requestOptions = {
    url : apiOptions.server + path,
    method : 'GET',
    json : {}
  };
  request(
    requestOptions,
      (err, response, body) => {
        let data = body;
        if (response.statusCode === 200) {
          data.coords = {
            lng : body.coords[0],
            lat : body.coords[1]
          };
          callback(req, res, data);
        } else {
          _showError(req, res, response.statusCode);
        }
      }
  );
};

/// details page
const _renderDetailPage = function(req, res, locDetail) {
  res.render('location-info', {
    title : locDetail.name,
    pageHeader : {
      title : locDetail.name
    },
    sidebar : {
      context : 'is on Loc8r because it has accessible wifi and space to sit down with your laptop and get some work done.',
      callToAction : 'If you\'ve been and you like it - or if you don\'t - please leave a review to help other people just like you.'
    },
    location: locDetail
  });
};

const locationInfo = function(req, res) {
  _getLocationInfo(req, res, (req, res, responseData) => {
    _renderDetailPage(req, res, responseData);
  });
};

/// add reviews
const _renderReviewForm = function(req, res, locDetail) {
  res.render('location-review-form', {
    title: `Review ${locDetail.name} on Loc8r`,
    pageHeader: {
      title: locDetail.name
    },
    error: req.query.err
  });
};

const addReview = function(req, res) {
  _getLocationInfo(req, res, (req, res, responseData) => {
    _renderReviewForm(req, res, responseData);
  });
};

const doAddReview = function(req, res) {
  const locationid = req.params.locationid;
  const path = `/api/locations/${locationid}/reviews`;
  const postdata = {
    author: req.body.name,
    rating: parseInt(req.body.rating, 10),
    reviewText: req.body.review
  };
  const requestOptions = {
    url : apiOptions.server + path,
    method : 'POST',
    json : postdata
  };
  if (!postdata.author || !postdata.rating || !postdata.reviewText) {
    res.redirect(`/location/${locationid}/review/new?err=val`);
  } else {
    request(
      requestOptions,
        (err, response, body) => {
          if (response.statusCode === 201) {
            res.redirect(`/location/${locationid}`);
          } else if (response.statusCode === 400 && body.name && body.name === 'ValidationError'){
            res.redirect(`/location/${locationid}/review/new?err=val`);
          } else {
            _showError(req, res, response.statusCode);
          }
        }
    );
  }
};

module.exports = {
  homelist,
  locationInfo,
  addReview,
  doAddReview
};

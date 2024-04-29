const express = require('express')
const catchAsync = require('../utils/catchAsync');
const router = express.Router({ mergeParams: true });
const ExpressError = require('../utils/ExpressError')
const reviews = require('../controllers/reviews.js')
const { validateReview, checkAuthentication, isReviewAuthor } = require('../middleware.js')





router.post('/', checkAuthentication, validateReview, catchAsync(reviews.createReview))

router.delete('/:reviewid', checkAuthentication, isReviewAuthor, catchAsync(reviews.deleteReview))


module.exports = router;
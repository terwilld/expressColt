const Campground = require('../models/campground')
const Review = require('../models/review')

module.exports.createReview = async (req, res, next) => {
    const campground = await Campground.findById(req.params.id)
    const review = new Review(req.body.review);
    review.author = req.user._id
    campground.reviews.push(review)
    await review.save()
    await campground.save()
    req.flash('success', 'You have added your review!')
    res.redirect(`/campgrounds/${campground._id}`)
}

module.exports.deleteReview = async (req, res, next) => {
    await Review.findByIdAndDelete(req.params.reviewid)
    await Campground.findByIdAndUpdate(req.params.id, { $pull: { reviews: req.params.reviewid } })
    req.flash('success', 'You have deleted a review')
    res.redirect(`/campgrounds/${req.params.id}`)
}
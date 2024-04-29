const { campgroundSchema, reviewSchema } = require('./schemas.js');
const ExpressError = require('./utils/ExpressError');
const Campground = require('./models/campground');
const Review = require('./models/review');
// const multer = require('multer')
// const upload = multer({ dest: 'public/uploads/' }

if (process.env.NODE_ENV !== "production") {
    require('dotenv').config()
}

// cloudinary.config({
//     cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//     api_key: process.env.CLOUDINARY_API_KEY,
//     api_secret: process.env.CLOUDINARY_API_SECRET
// });


// const uploadLocalFile = async (file) => {
//     const result = await cloudinary.uploader.upload(file,
//         { public_id: "olympic_flag", asset_folder: "uploads", asdfsa: "asdfasd" },
//         function (error, result) {
//             console.log(result);
//             console.log(error)
//             console.log('derp')
//         });

//     return (result)
// }



module.exports.checkAuthentication = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl
        req.flash('error', 'You must be signed in first!');
        return res.redirect('/login');
    }
    next();
}

module.exports.storeReturnTo = (req, res, next) => {
    if (req.session.returnTo) {
        res.locals.returnTo = req.session.returnTo;
    }
    next();
}


// module.exports.imageMiddleware = (req, res, next) => {
//     const defaultImage = 'https://images.unsplash.com/photo-1466027575040-12134f1397fa?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=900&ixid=MnwxfDB8MXxyYW5kb218MHwxOTA3Mjd8fHx8fHx8MTcxMzM4MTE5NQ&ixlib=rb-4.0.3&q=80&utm_campaign=api-credit&utm_medium=referral&utm_source=unsplash_source&w=1600'
//     const currentImage = req.body.campground.image
//     if (req.file) {
//         console.log('there is a provided file')
//         console.log(req.file)

//         // req.body.campground.image = req.file.path
//         req.body.campground.image = `../uploads/${req.file.filename}`
//     } else {
//         console.log('this is not a provided file')
//         if ((!(currentImage.includes('https'))) && (!(currentImage.includes('uploads')))) {
//             console.log('image does not include https or uploads')
//             req.body.campground.image = defaultImage
//         }


//     }
//     next()
// }

// module.exports.imageCloudinaryMiddleware = async (req, res, next) => {
//     const defaultImage = 'https://images.unsplash.com/photo-1466027575040-12134f1397fa?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=900&ixid=MnwxfDB8MXxyYW5kb218MHwxOTA3Mjd8fHx8fHx8MTcxMzM4MTE5NQ&ixlib=rb-4.0.3&q=80&utm_campaign=api-credit&utm_medium=referral&utm_source=unsplash_source&w=1600'
//     const currentImage = req.body.campground.image
//     console.log('I am in the cloudinary image middleware')
//     if (req.file) {
//         const newFile = req.file.path
//         const uploadResult = await uploadLocalFile('./' + newFile)
//         console.log('post uploading')
//         console.log(uploadResult)
//         req.body.campground.image = uploadResult.secure_url
//         console.log('ZZZzzzZZZ pre delete')
//         //  Pause to see if file was created then deleted      await new Promise(resolve => setTimeout(resolve, 5000));
//         fs.unlink('./' + newFile, (err) => {
//             if (err) throw err;
//         });
//         console.log('post delete')
//     } else {
//         console.log('this is not a provided file')
//         if ((!(currentImage.includes('https'))) && (!(currentImage.includes('uploads')))) {
//             console.log('image does not include https or uploads')
//             req.body.campground.image = defaultImage
//         }
//     }
//     next()
// }




module.exports.validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}

module.exports.isAuthor = async (req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (!campground.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do that');
        return res.redirect(`/campgrounds/${id}`)
    }
    next();
}


module.exports.isReviewAuthor = async (req, res, next) => {
    const { reviewid } = req.params;
    const review = await Review.findById(reviewid)
    if (!review.author._id.equals(req.user._id)) {
        req.flash('error', 'you do not have permission to do that');
        console.log(req.originalUrl)
        console.log(req.params)
        return res.redirect(`/campgrounds/${req.params.id}`)
    }
    next();
}


module.exports.validateReview = (req, res, next) => {
    console.log("Test validate review")
    console.log(req.body)
    reviewSchema.validate(req.body);
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}
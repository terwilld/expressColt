const express = require('express')
const catchAsync = require('../utils/catchAsync');
const router = express.Router();
const ExpressError = require('../utils/ExpressError');
const { imageCloudinaryMiddleware, imageMiddleware, isAuthor, validateCampground, checkAuthentication } = require('../middleware.js');
const campgrounds = require('../controllers/campgrounds')
const multer = require('multer')

const { storage } = require('../cloudinary')
const upload = multer({ storage })



router.get('/', catchAsync(campgrounds.index))

router.get('/new', checkAuthentication, campgrounds.renderNewForm)

router.post('/',
    checkAuthentication,
    upload.array('backgroundImg'),
    validateCampground,
    // imageMiddleware,
    // imageCloudinaryMiddleware,

    catchAsync(campgrounds.createCampground));

// router.post('/',
//     upload.array('backgroundImg'), (req, res) => {
//         console.log(req.body);
//         console.log(req.files);
//         res.send('it worked')
//     }
// );





router.get('/:id', catchAsync(campgrounds.showCampground))

router.get('/:id/edit', checkAuthentication,
    isAuthor,
    catchAsync(campgrounds.renderEditForm))

router.patch('/:id',
    checkAuthentication,
    isAuthor,
    upload.array('backgroundImg'),
    // imageMiddleware,
    // imageCloudinaryMiddleware,
    validateCampground,
    catchAsync(campgrounds.updateCampground))

router.delete('/:id', checkAuthentication,
    isAuthor,
    catchAsync(campgrounds.deleteCampground))

module.exports = router;
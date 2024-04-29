const Campground = require('../models/campground.js')
const { cloudinary } = require("../cloudinary")
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding')
const geocoder = mbxGeocoding({ accessToken: process.env.MAPBOX_TOKEN })
// console.log('campgrounds.js process')
// console.log(process.env.MAPBOX_TOKEN)
// console.log(mbxGeocoding)
// mbxGeocoding.setAccessToken(process.env.MAPBOX_TOKEN)



// mapboxClient.forwardGeocode({
//     query: 'Paris, France',
//     limit: 1
// })
//     .send()
//     .then(response => {
//         const match = response.body
//         console.log(match)
//         console.log(match.features)
//     })

// const geoData = mapboxClient.forwardGeocode({
//     query: 'Paris, France',
//     limit: 1
// }).send()
//     .then(response => {
//         // console.log(response)
//         // console.log(response.body)
//         console.log(response.body.features[0].geometry.coordinates)
//     })

// const mbxClient = require('@mapbox/mapbox-sdk');
// const mbxStyles = require('@mapbox/mapbox-sdk/services/styles');
// const mbxTilesets = require('@mapbox/mapbox-sdk/services/tilesets');

// const baseClient = mbxClient({ accessToken: process.env.MAPBOX_TOKEN });
// const stylesService = mbxStyles(baseClient);
// const tilesetsService = mbxTilesets(baseClient);

// console.log(baseClient)
// console.log(stylesService)
// console.log(tilesetsService)
// // stylesService.forwardGeocode({
//     query: 'Paris, France',
//     limit: 2
// })
//     .send()
//     .then(response => {
//         const match = response.body;
//         console.log('derp')
//         console.log(match)
//     });



module.exports.index = async (req, res) => {
    console.log('hitting the campground index controller')
    campgrounds = await Campground.find({})
        .populate('author')

    //console.log(campgrounds)
//    console.log(campgrounds[0].images.toObject({ virtuals: true }))
    res.render('campgrounds/index.ejs', { campgrounds })
}


module.exports.renderNewForm = (req, res) => {
    console.log('hitting the campground new controller')
    res.render('campgrounds/new.ejs')
}

module.exports.createCampground = async (req, res, next) => {
    console.log(req.body.campground.location)
    const geodata = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send()
    // [ Long , Lat ]
    console.log(geodata.body.features[0].geometry)
    // res.send('derp')
    const newCampground = new Campground(req.body.campground);
    newCampground.images = req.files.map(f => ({ url: f.path, filename: f.filename }))
    newCampground.author = req.user._id
    newCampground.geometry = geodata.body.features[0].geometry
    console.log(`this is my new campground:`)
    console.log(newCampground)

    await newCampground.save();
    req.flash('success', 'Successfully Made a New Campground!')
    res.redirect(`/campgrounds/${newCampground._id}`)
}

module.exports.showCampground = async (req, res, next) => {
    console.log('I am in the show controller')
    const campground = await Campground.findById(req.params.id)
        .populate({
            path: 'reviews',
            populate: { path: 'author' }
        })
        .populate('author')
    if (!campground) {
        req.flash('error', 'Cannot Find that campground!')
        return res.redirect('/campgrounds')
    }
    // console.log(process.env.MAPBOX_TOKEN)
    res.render('campgrounds/show.ejs', { campground })
}


module.exports.renderEditForm = async (req, res, next) => {
    console.log('I am in the render edit controller')
    const campground = await Campground.findById(req.params.id)
    res.render('campgrounds/edit.ejs', { campground })
}

module.exports.updateCampground = async (req, res, next) => {
    console.log('I am in the update campground controller')
    // console.log(req.body)

    const { id } = req.params
    const campground = await Campground.findByIdAndUpdate(req.params.id, { ...req.body.campground })
    const newImages = req.files.map(f => ({ url: f.path, filename: f.filename }))
    campground.images.push(...newImages)
    //console.log(req.body.deleteImages)
    // req.body.deleteImages.forEach((img) => {
    //     console.log(img)
    // })

    const geodata = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send()
    // [ Long , Lat ]
    //console.log(geodata.body.features[0].geometry)
    campground.geometry = geodata.body.features[0].geometry
    if (req.body.deleteImages) {
        // const updatedImages = campground.images.filter((image) => {
        //     console.log(image)
        //     if (req.body.deleteImages.includes(image.filename)) {
        //         console.log(image.filename)
        //         console.log('this should be removed')
        //         return
        //     }
        //     return image
        // })
        // campground.images = updatedImages
        console.log('in the delete image section pre save')
        console.log(campground)
        await campground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })

        req.body.deleteImages.forEach((img) => {
            console.log(img)
            if (img.includes('Seedimages')) {
                console.log(`Don't delete: ${img}`)
            } else {
                console.log(`Do delete: ${img}`)
                cloudinary.uploader.destroy(img, (result) => { console.log(`My result of destroy: ${result}`) });

            }
        })


    }
    await campground.save()
    // console.log('after the save')
    // console.log(campground)
    req.flash('success', 'Successfully modified the Campground!')
    return res.redirect(`/campgrounds/${campground._id}`)
}

module.exports.deleteCampground = async (req, res, next) => {
    const result = await Campground.findByIdAndDelete(req.params.id)
    req.flash('success', 'You have deleted a Campground!')
    res.redirect('/campgrounds')
}
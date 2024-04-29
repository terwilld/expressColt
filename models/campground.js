const mongoose = require('mongoose');
// const User = require('./user.js')
const Review = require('./review.js')
const Schema = mongoose.Schema;


const ImageSchema = new Schema({
    filename: String,
    url: String
})

//   https://res.cloudinary.com/drsimw1fc/image/upload/v1713818039/Yelpcamp/Seedimages/p9qxbre68ckt0zqvlobg.jpg

ImageSchema.virtual('thumbnail').get(function () {
    return this.url.replace('/upload', '/upload/w_200,h_300');
});


const opts = { toJSON: { virtuals: true } };
const CampgroundSchema = new Schema({
    title: String,
    price: Number,
    description: String,
    location: String,
    geometry: {
        type: {
            type: String, // Don't do `{ location: { type: String } }`
            enum: ['Point'], // 'location.type' must be 'Point'
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },

    image: String,
    images: [ImageSchema],

    author: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    reviews: [{
        type: Schema.Types.ObjectId,
        ref: "Review"
    }]
},opts);

CampgroundSchema.virtual('properties.popUpMarkup').get(function () {
    // return this._id;

    return `<b>${this.title}</b><br>${this.location}<br><a href="/campgrounds/${this._id}" target="_blank">Link</a>`
});

CampgroundSchema.post('save', () => {
    // console.log("Testing Campground Middleware this should trigger for save")
})

CampgroundSchema.post('findOneAndUpdate', () => {
    // console.log('test mongoose middleware this should trigger for update')
})

CampgroundSchema.post('findOneAndDelete', async function (campground) {
    // for (let review of campground.reviews) {
    //     await Review.findByIdAndDelete(review)
    // }
    if (campground) {
        await Review.deleteMany({
            _id: {
                $in: campground.reviews
            }
        })
    }

    // const campground = await Campground.findById(this.getQuery().id)
    // console.log(campground)
    // next();

    //     console.log(farm)
    //     console.log('products')
    //     console.log(farm.products)
    //     if (farm.products.length) {
    //         const res = await Product.deleteMany({ _id: { $in: farm.products } })
    //         console.log(res)
    //     }
    // })




})


// farmSchema.post('findOneAndDelete', async function (farm) {

//     console.log(farm)
//     console.log('products')
//     console.log(farm.products)
//     if (farm.products.length) {
//         const res = await Product.deleteMany({ _id: { $in: farm.products } })
//         console.log(res)
//     }
// })






// Example of an imgage url
//https://images.unsplash.com/photo-1475296204602-08d15839e95f?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=900&ixid=MnwxfDB8MXxyYW5kb218MHwxOTA3Mjd8fHx8fHx8MTcxMTc2NTA3Ng&ixlib=rb-4.0.3&q=80&utm_campaign=api-credit&utm_medium=referral&utm_source=unsplash_source&w=1600
module.exports = mongoose.model('Campground', CampgroundSchema)



// const mongoose = require('mongoose')
// const Product = require('./product')
// const { Schema } = mongoose;

// const farmSchema = new mongoose.Schema({
//     name: {
//         type: String,
//         required: [true, 'Farm must have a name']
//     },
//     location: {
//         type: String,
//         required: true
//     },
//     city: {
//         type: String
//     },
//     email: {
//         type: String,
//         required: [true, 'Email required']
//     },
//     products: [{
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'Product'
//     }]
// })

// farmSchema.post('findOneAndDelete', async function (farm) {

//     console.log(farm)
//     console.log('products')
//     console.log(farm.products)
//     if (farm.products.length) {
//         const res = await Product.deleteMany({ _id: { $in: farm.products } })
//         console.log(res)
//     }
// })
// const Farm = mongoose.model('Farm', farmSchema);
// module.exports = Farm;

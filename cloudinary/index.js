// import { v2 as cloudinary } from 'cloudinary';
const cloudinary = require('cloudinary').v2
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const fs = require('fs')
const multer = require('multer')

if (process.env.NODE_ENV !== "production") {
    require('dotenv').config()
}

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'Yelpcamp',
        allowedFormats: ['jpeg', 'png', 'jpg']
    }
})

module.exports = { cloudinary, storage }



// const testFolder = './public/uploads'

// // const uploadLocalFile = async (file) => {
// //     const result = await cloudinary.uploader.upload(file,
// //         { public_id: "olympic_flag", asset_folder: "uploads", asdfsa: "asdfasd" },
//         function (error, result) {
//             console.log(result);
//             console.log(error)
//             console.log('derp')
//         });

//     console.log(result)
// }


// // fs.readdir(testFolder, (err, files) => {
// //     files.forEach(file => {
// //         console.log(file);
// //     });
// // });



//uploadLocalFile('./public/uploads/fb83be9902d9d79c90fc75a6d81a183e')
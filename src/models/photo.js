// models/photo.js
const mongoose = require('mongoose');

// More detail with meta data, decided best for later
// const photoSchema = new mongoose.Schema({
//     fileInfo: {
//         filename: { type: String, required: true },
//         directory: { type: String, required: true },
//         originalname: { type: String, required: true },
//         size: { type: Number, required: true },
//         format: { type: String, required: true },
//         width: { type: Number, required: true },
//         height: { type: Number, required: true },
//         orientation: { type: Number, required: true },
//     },
//     exifData: {
//         Photo: {
//             Make: { type: String},
//             Model: { type: String},
//             ExposureTime: { type: Number },
//             FNumber: { type: Number },
//             ExposureProgram: { type: Number },
//             ISOSpeedRatings: { type: Number },
//             ExifVersion: { type: String },
//             DateTimeOriginal: { type: Date },
//             ShutterSpeedValue: { type: Number },
//             ApertureValue: { type: Number },
//             BrightnessValue: { type: Number },
//             Flash: { type: Number },
//             FocalLength: { type: Number },
//             WhiteBalance: { type: Number },
//             FocalLengthIn35mmFilm: { type: Number },
//             ImageUniqueID: { type: String },
        
//         },
//         GPSInfo: {
//             GPSVersionID: { type: [Number] },
//             GPSLatitudeRef: { type: String },
//             GPSLatitude: { type: [Number] },
//             GPSLongitudeRef: { type: String },
//             GPSLongitude: { type: [Number] },
//             GPSAltitudeRef: { type: Number },
//             GPSAltitude: { type: Number },
//             GPSDateStamp: { type: String },
//             GPSTimeStamp: { type: [Number] },
//         }
//     }
// });

const simplePhotoSchema = new mongoose.Schema({
    filename: { type: String, required: true },
    directory: { type: String, required: true },
    DateTimeOriginal: { type: Date },    
    fileInfo: {
            originalname: { type: String },
            size: { type: Number},
            format: { type: String},
            width: { type: Number},
            height: { type: Number},
            orientation: { type: Number}
        }
});

const simplePhoto = mongoose.model('files', simplePhotoSchema);

module.exports = {simplePhoto};

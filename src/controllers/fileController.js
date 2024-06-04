const { extractTimeStamp, FILE_DIRECTORY } = require("../utils/fileUtilities");
const async_fs = require('fs').promises;
const sharp = require('sharp');
const path = require('path');
const exifReader = require('exif-reader'); // Ensure this is installed

const {simplePhoto} = require('../models/photo');

const single_upload = async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ 'message': 'No file uploaded.' });
    }

    const { buffer, originalname } = file;
    const metadata = await sharp(buffer).metadata();
    const fileFormat = metadata.format;
    const exifData = exifReader(metadata.exif || {});
    

    // Extracting date information from EXIF data or current date
    const dateTaken = exifData.Photo?.DateTimeOriginal || exifData.Photo?.DateTimeDigitized || new Date();
    const timestamp = extractTimeStamp(dateTaken);
    const { year, month, day, hours, minutes, seconds } = timestamp;
    const folderPath = path.join(FILE_DIRECTORY, year, month);

    // Create the folder if it doesn't exist
    await async_fs.mkdir(folderPath, { recursive: true });

    const startingFileName = `${year}${month}${day}_${hours}${minutes}${seconds}`;
    let filename = startingFileName;
    let filePath = path.join(folderPath, `${startingFileName}.${fileFormat}`);
    
    // Handling potential duplicate filenames
    let dup = 1;
    while (await async_fs.access(filePath).then(() => true).catch(() => false)) {
        filename = `${startingFileName}_${dup++}`;
        filePath = path.join(folderPath, `${filename}.${fileFormat}`);
    }

    const photoData = populatePhotoSchema(filename,folderPath,file,metadata,dateTaken)
    await photoData.save();

    // Save the file
    await async_fs.writeFile(filePath, buffer);
    console.log('File saved:', filePath);

    return res.status(200).json({ message: 'Upload successful' });
  } catch (error) {
    // Log the error and send an error response
    console.error('Error:', error);
    return res.status(500).json({ message: 'Error processing the file' });
  }
}

module.exports = {
  single_upload,
}


//Returns the model
const populatePhotoSchema = (newFilename,fileDirectory,file,meta,DateTimeOriginal) => {
    
    const {originalname,size}=file;
    const {format,width,height,orientation} = meta
    

    const photo = {
        filename: newFilename,
        directory: fileDirectory,
        DateTimeOriginal: DateTimeOriginal,    
        fileInfo: {
                originalname: originalname,
                size: size,
                format: format,
                width: width,
                height: height,
                orientation: orientation,
            }

    }

    return new simplePhoto(photo);
}
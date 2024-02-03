const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const sharp = require('sharp');
const exifReader = require('exif-reader');
const async_fs = require('fs').promises;
const path = require('path');


//App consts
const app = express();
const port = 3000;
const uploadDir = 'uploads';

app.use(bodyParser.json());

const storage = multer.memoryStorage();
const upload = multer({ storage });

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.post('/upload', upload.single('image'), async (req, res) => {
  try {
    // Check if file and buffer are present in the request
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const { buffer, originalname } = req.file;
    const metadata = await sharp(buffer).metadata();
    const fileFormat = metadata.format;
    const exifData = exifReader(metadata.exif);

    // Extracting date information from EXIF data or current date
    const dateTaken = exifData && (exifData.Photo.DateTimeOriginal || exifData.Photo.DateTimeDigitized);
    const timestamp = extractTimeStamp(dateTaken || Date.now());
    const { year, month, day, hours, minutes, seconds } = timestamp;
    const folderPath = path.join(uploadDir, year, month);

    // Create the folder if it doesn't exist
    await async_fs.mkdir(folderPath, { recursive: true });

    let filename = `${year}${month}${day}_${hours}${minutes}${seconds}.${fileFormat}`;
    let filePath = path.join(folderPath, `${filename}`);

    // Handling potential duplicate filenames
    let dup = 1;
    while (await async_fs.access(filePath).then(() => true).catch(() => false)) {
        filename = `${filename}_${dup++}.${fileFormat}`;
        filePath = path.join(folderPath,filename);
    }

    // Save the file
    await async_fs.writeFile(filePath, buffer);
    console.log('File saved:', filePath);
    res.status(200).json({ message: 'Upload successful' });
  } catch (error) {
    // Log the error and send an error response
    console.error('Error:', error);
    res.status(500).json({ message: 'Error processing the file' });
  }
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

function extractTimeStamp(dateString) {
  const date = new Date(dateString);
  const year = date.getFullYear().toString();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');
  return { year, month, day, hours, minutes, seconds };
}

const express = require('express')
const bodyParser = require('body-parser');

const multer = require('multer');

//Metadata stuff
const sharp = require('sharp');
const exifReader = require('exif-reader');

const fs = require("fs");
const path = require('path');

const app = express()
const port = 3000

app.use(bodyParser.json())

//multer RAM
const storage = multer.memoryStorage(); 
const upload = multer({ storage: storage });

app.get('/', (req, res) => {
  res.send('Hello World!')
})


app.post('/upload', upload.single('image'), async (req, res) => {
  
    if (req.file && req.file.buffer) {
        
        //getting file data
        const {buffer,originalname} = req.file;
        const metadata = await sharp(buffer).metadata();   
        const fileFormat = metadata.format;     
        const exifData = exifReader(metadata.exif);

        console.log(metadata)
        console.log(exifData)

        const dateTaken = exifData ? exifData.Photo.DateTimeOriginal || exifData.Photo.DateTimeDigitized : null;
        const timestamp = dateTaken ? formatTimestamp(dateTaken) : Date.now();
        
        let filePath = path.join(__dirname, 'uploads', `${timestamp}.${fileFormat}`);
        let dup = 1;
        while (fs.existsSync(filePath)){
            filePath = path.join(__dirname, 'uploads', `${timestamp}_${dup++}.${fileFormat}`);
            
        }

        // Save the file
        fs.writeFile(filePath, buffer, (err) => {
        if (err) {
            console.error('Error saving file:', err);
            res.status(500).json({ message: 'Error saving file' });
        } else {
            console.log('File saved:', originalname);
            res.json({ message: 'Upload successful' });
        }
        });
    } else {
        // Handle the case where no file was uploaded
        res.status(400).json({ message: 'No file uploaded' });
    }
  });



app.listen(port, () => {
  console.log(`Server listennning on port ${port}`)
})

function formatTimestamp(dateString) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    return `${year}${month}${day}_${hours}${minutes}${seconds}`;
  }
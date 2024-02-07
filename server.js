const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const sharp = require('sharp');
const exifReader = require('exif-reader');
const async_fs = require('fs').promises;
const fs = require('fs');
const path = require('path');


//App consts
const app = express();
const port = 3000;
const uploadDir = 'uploads';


const knex = require('knex')({
    client: 'pg',
    connection: {
      host: 'localhost',
      user: 'admin',
      password: 'admin',
      database: 'pss',
    },
  });
//tempDB
const db = traverseDirectory(uploadDir);
 


app.use(bodyParser.json());

const storage = multer.memoryStorage();
const upload = multer({ storage });

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.get('/files', (req,res)=>{
    const page = parseInt(req.query.p) || 1;
    const pageSize = parseInt(req.query.s) || 10;
    const startIndex = (page-1)*pageSize;
    const endIndex = page*pageSize;
    const paginatedImages = db.slice(startIndex,endIndex)
    res.json(paginatedImages)
})

app.get('/files/:year/:month/:filename', async (req, res) => {
  try {
    const {year,month,filename} = req.params;
    const filePath = path.join(uploadDir,year,month,filename);

    const fileExists = await async_fs.access(filePath).then(() => true).catch(() => false);

    if (fileExists) {
      const fileBuffer = await async_fs.readFile(filePath);
      res.writeHead(200, {
        'Content-Type': 'image/*',
        'Content-Length': fileBuffer.length,
      });
      res.end(fileBuffer);
    } else {
      res.status(404).json({ message: 'Image not found' });
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Error serving the image' });
  }
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

    const startingFileName = `${year}${month}${day}_${hours}${minutes}${seconds}`;
    let filePath = path.join(folderPath, `${startingFileName}.${fileFormat}`);

    // Handling potential duplicate filenames
    let dup = 1;
    while (await async_fs.access(filePath).then(() => true).catch(() => false)) {
        const filename = `${startingFileName}_${dup++}`;
        filePath = path.join(folderPath,`${filename}.${fileFormat}`);
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



////// Temporay DB code
function traverseDirectory(baseDir, result = []) {
    const entries =  fs.readdirSync(baseDir);
  
    for (const entry of entries) {
      const entryPath = path.join(baseDir, entry);
      const stat =  fs.statSync(entryPath);
     

      if (stat.isDirectory()) {
        // Recursively traverse subdirectories with a new result object
        const subdirResult =  traverseDirectory(entryPath, result);
      } else if (stat.isFile()) {


        // If it's a file, store its information in the result object
        const dir = path.relative(__dirname, entryPath).replace(/\\/g, '/'); // Adjust this if needed
        const ent = {}
        ent[entry] =  path.dirname(dir)
        result.push(ent);
       
      }

    }
    
    return result;
}
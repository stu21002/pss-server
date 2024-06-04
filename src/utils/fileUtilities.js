const path = require('path')
const FILE_DIRECTORY = path.join(__dirname,'../../uploads')


const extractTimeStamp = (dateString) => {
  const date = new Date(dateString);
  const year = date.getFullYear().toString();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');
  return { year, month, day, hours, minutes, seconds };
}


module.exports = {
    extractTimeStamp,
    FILE_DIRECTORY
}
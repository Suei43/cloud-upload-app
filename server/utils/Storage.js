const fs = require('fs');
const path = require('path');
const { storage } = require('./loginToStorage');

const createStorage = async (id) => {
  try{
    const folder = await storage.mkdir(id);
    await createStorageCategories(folder);
    console.log(`Created folder: ${folder.name}`);
    return true;
  }catch(err){
    console.error(err)
    return false;}
}

const createStorageCategories = async (folder) => {
  try{
    await folder.mkdir('Pictures');
    await folder.mkdir('Documents');
    await folder.mkdir('Videos');
    await folder.mkdir('Audio');
    await folder.mkdir('All Files');
  }catch(err){
    console.error("Unable to create categories")
    return false;}
}

const uploadToStorage = async () => {
    // Read the image file
const imagePath = path.join(__dirname, 'download.jpeg');

fs.readFile(imagePath, (error, imageContent) => {
  if (error) {
    console.error('Error reading image:', error);
    return;
  }

  storage.upload('image.jpg', imageContent, (err, file) => {
    if (err) {
      console.error('Error uploading image:', err);
      return;
    }
    console.log('The image was uploaded!');
  });
});
}

const shareFile = async () => {
    const file = Object.values(storage.files).find(file => file.name === 'image.jpg')
    const link = await file.link();
    file ? console.log(link) : console.log('File not found');
};

const deleteFile = async () => {
    const file = Object.values(storage.files).find(file => file.name === 'image.jpg')
    file ? file.delete() : console.log('File not found');
};


module.exports = {createStorage, uploadToStorage, shareFile, deleteFile};
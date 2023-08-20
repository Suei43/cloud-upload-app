const fs = require('fs');
const path = require('path');
const { storage } = require('./loginToStorage');
const User = require('../models/userSchema');

const createStorage = async (id) => {
  try{
    const folder = await storage.mkdir(id);
    console.log(`Created folder: ${folder.name}`);
    return true;
  }catch(err){
    console.error(err)
    return false;}
}

const getStorageFiles = async (folder) => {
  try{
    const list = [];
    const files = await folder.children;
    if(!files)
      return false;
    for(let i=0; i<files.length; i++){
      if(!files[i])
        break;
      list.push(files[i].name);
    };
    return list;
  }catch(err){
    console.error(err)
    return false;}
}

const uploadToStorage = (name, filepath, folder) => {
  const imagePath = path.join(__dirname, filepath.slice(6));

  if (!folder)
    return Promise.reject(new Error("Invalid folder"));

  return new Promise((resolve, reject) => {
    fs.readFile(imagePath, async (err, imageContent) => {
      if (err) {
        console.error('Error reading file:', err);
        return reject(err);
      }

      folder.upload(name, imageContent, (err, file) => {
        if (err) {
          console.error('Error uploading file:', err);
          return reject(err);
        }
        
        file.link()
          .then((link) => {
            console.log("LINK: ", link);
            resolve(link);
          })
          .catch((linkError) => {
            console.error('Error generating link:', linkError);
            reject(linkError);
          });
      });
    });
  });
};


const shareFile = async () => {
    const file = Object.values(storage.files).find(file => file.name === 'image.jpg')
    const link = await file.link();
    file ? console.log(link) : console.log('File not found');
};

const deleteFile = async () => {
    const file = Object.values(storage.files).find(file => file.name === 'image.jpg')
    file ? file.delete() : console.log('File not found');
};

const handleStorage = async () => {
    
};


module.exports = {createStorage, getStorageFiles, uploadToStorage, shareFile, deleteFile};
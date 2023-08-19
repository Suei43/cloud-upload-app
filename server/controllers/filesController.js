const {storage, loginToStorage} = require('../utils/loginToStorage');

const {uploadToStorage, getStorageFiles} = require('../utils/Storage');

const { formatDateLabel, getCategoryFromFileName } = require('../utils/utils');

const User = require('../models/userSchema');

const getCategoryCount = async (req, res) => {
    try {
        const user = await User.findOne({ email: req.user.email });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const categories = {
            picture: 0,
            video: 0,
            audio: 0,
            document: 0
        };

        for (const file of user.files) {
            const category = getCategoryFromFileName(file.name);
            if (category in categories) {
                categories[category]++;
            }
        }
        console.log("Hello", categories);
        return res.status(200).json({ message: 'Categories found', categories });
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

const getFilesByCategory = async (req, res) => {
    try{
        await loginToStorage();
        const folder = storage.root.children.find(folder => folder.name === req.user.email);
        const filelist = await getStorageFiles(folder);
        console.log(filelist);
        if (!filelist)
            return res.status(404).json({message: 'No files found'});
        const files = [];
        for(let i=0; i<filelist.length; i++){
            const user = await User.findOne({ email: req.user.email });
            if (user) {
                const fileItem = user.files.find(file => file.name === filelist[i] && getCategoryFromFileName(file.name) === req.params.name);
                if (fileItem) {
                    const time = fileItem.date;
                    console.log("Time:", time);
                    files.push({
                        id: i,
                        name: filelist[i],
                        time: formatDateLabel(time)
                    });
                } else {
                    console.log("File not found in user's files array.");
                }
            } else {
                console.log("User not found.");
            }
        };
        console.log(files);
        return res.status(200).json({message: 'Files found', files: files});
    }catch(err){console.error(err);}
};

const getAllFiles = async (req, res) => {
    try{
        await loginToStorage();
        const folder = storage.root.children.find(folder => folder.name === req.user.email);
        const filelist = await getStorageFiles(folder);
        console.log(filelist);
        if (!filelist)
            return res.status(404).json({message: 'No files found'});
        const files = [];
        for(let i=0; i<filelist.length; i++){
            const user = await User.findOne({ email: req.user.email });
            if (user) {
                const fileItem = user.files.find(file => file.name === filelist[i]);
                if (fileItem) {
                    const time = fileItem.date;
                    console.log("Time:", time);
                    files.push({
                        id: i,
                        name: filelist[i],
                        time: formatDateLabel(time)
                    });
                } else {
                    console.log("File not found in user's files array.");
                }
            } else {
                console.log("User not found.");
            }
        };
        console.log(files);
        return res.status(200).json({message: 'Files found', files: files});
    }catch(err){
        console.error(err);
        return res.status(404).json({message: err.message});
    }
}

const searchFiles = async (req, res) => {
    try{
        // const file = Object.values(storage.files).find(file => file.name === 'hello-world.txt');
        const user = await User.findOne({ email: req.user.email });
        console.log(user);
        if (!user){
            return res.status(404).json({message: 'User not found'});
        }
        const files = user.files.filter(file => file.name.includes(req.query.query));
        return res.status(200).json({message: 'OK', files: files});
    }catch(err){
        console.error(err);
        return res.status(500).json({message: err.message});
    }
}

const uploadFile = async (req, res, next) => {
    try {
        await loginToStorage();
        const folder = storage.root.children.find(folder => folder.name === req.user.email);
        for(const file of req.files){
            let status = uploadToStorage(file.originalname, file.path, folder);
            if(status === false)
                return res.status(400).json({message: 'Error uploading file'});
            await User.findOneAndUpdate(
                { email: req.user.email },
                {
                    $push: { files: {name:file.originalname, date:new Date(), category:getCategoryFromFileName(file.originalname), size:(file.size/1024) } },
                    $inc: { spaceUsed: file.size / 1024} 
                },
                { new: true })
            .then(updatedUser => {
                if (updatedUser) {
                    console.log('User updated successfully:', updatedUser);
                } else {
                    console.log('User not found or not updated.');
                }
            })
            .catch(error => {
                console.error('Error updating user:', error);
            });
    }
        return res.status(201).json({message:'Files uploaded successfully'});
    }catch(err){
        console.error(err);
        res.status(404).json({message: err.message});
    }
}

const getStorage = async (req, res)=>{
    const maxStorage = 5;
    const maxStorageKB = maxStorage * 1024 * 1024;
    const user = await User.findOne({ email: req.user.email });
    if(!user){
        return res.status(404).json({message: 'User not found'});
    }
    const storageUsedKB = Math.round(user.spaceUsed);
    const storageUsedMB = Math.round(storageUsedKB / 1024);
    const storageUsedGB = Math.round(storageUsedKB / (1024*1024));
    let percentage = Math.round((storageUsedKB / maxStorageKB) * 100);

    if (storageUsedKB > 0 && storageUsedKB < 52429){
        percentage = 1;
    }
    if (storageUsedKB > 1024 * 1024){
        return res.status(200).json({message:"Successful", storageUsed: storageUsedGB, unit: "GB", percentage});
    } else if (storageUsedKB > 1024){
        return res.status(200).json({message:"Successful", storageUsed: storageUsedMB, unit: "MB", percentage});
    }
    return res.status(200).json({message:"Successful", storageUsed: storageUsedKB, unit: "KB", percentage});
};

const deleteFile = async (req, res) => {
    try{
        const user = await User.findOne({ email: req.user.email });
        if(!user){
            return res.status(404).json({message: 'User not found'});
        }
        const file = user.files.find(file => file.name === req.params.name);
        if(!file){
            return res.status(404).json({message: 'File not found'});
        }
        await User.findOneAndUpdate({email: req.user.email}, {$inc: {spaceUsed: -(file.size) / 1024} });
        user.files.pull(file);
        await user.save();
        console.log("Successfully deleted!")
        return res.status(200).json({message: 'File deleted successfully'});
    }catch(err){
        console.error(err);
        return res.status(500).json({message: err.message});
    }
};

const favorites = (req,res) => {};

const sharedFiles = (req,res) => {};

module.exports = { getAllFiles, getCategoryCount, getFilesByCategory, getStorage, searchFiles, uploadFile, deleteFile, favorites, sharedFiles }
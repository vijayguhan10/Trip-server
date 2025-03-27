const upload = require('../../config/s3');

const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    res.status(200).json({
      message: 'File uploaded successfully',
      fileUrl: req.file.location
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const uploadFiles = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const fileUrls = req.files.map((file) => file.location);
    res.status(200).json({
      message: 'Files uploaded successfully',
      fileUrls: fileUrls
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  uploadFile,
  uploadFiles
};

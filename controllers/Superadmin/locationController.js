const Location = require('../../models/Location');

const createLocation = async (req, res) => {
  try {
    const { name, map_url, iframe_url } = req.body;

    if (!name || !map_url || !iframe_url) {
      return res.status(400).json({
        error: 'Name, map_url, and iframe_url are required'
      });
    }

    const location = new Location({ name, map_url, iframe_url });
    await location.save();

    return res.status(201).json({ data: location });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

const getLocation = async (req, res) => {
  try {
    const location = await Location.findById(req.params.id);

    if (!location || location.is_deleted) {
      return res.status(404).json({ error: 'Location not found' });
    }

    return res.json({ data: location });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const getAllLocations = async (req, res) => {
  try {
    const locations = await Location.find({ is_deleted: false }).sort({
      createdAt: -1
    });

    return res.json({ data: locations });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const updateLocation = async (req, res) => {
  try {
    const allowedUpdates = ['name', 'map_url', 'iframe_url'];
    const updates = Object.keys(req.body);
    const isValidOperation = updates.every((update) =>
      allowedUpdates.includes(update)
    );

    if (!isValidOperation) {
      return res.status(400).json({ error: 'Invalid updates!' });
    }

    const location = await Location.findById(req.params.id);

    if (!location || location.is_deleted) {
      return res.status(404).json({ error: 'Location not found' });
    }

    updates.forEach((update) => (location[update] = req.body[update]));
    await location.save();

    return res.json({ data: location });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

const deleteLocation = async (req, res) => {
  try {
    const location = await Location.findById(req.params.id);

    if (!location || location.is_deleted) {
      return res.status(404).json({ error: 'Location not found' });
    }

    location.is_deleted = true;
    await location.save();

    return res.json({
      message: 'Location deleted successfully'
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const getLocationDropdown = async (req, res) => {
  try {
    const locations = await Location.find({ is_deleted: false }).select(
      '_id name'
    );

    return res.json({ data: locations });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createLocation,
  getLocation,
  getAllLocations,
  updateLocation,
  deleteLocation,
  getLocationDropdown
};

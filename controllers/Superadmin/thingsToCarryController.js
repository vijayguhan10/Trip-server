const mongoose = require('mongoose');
const ThingsToCarry = require('../../models/ThingsToCarry');
const Location = require('../../models/Location');

const addThingsToCarry = async (req, res) => {
  try {
    const { name, location_id } = req.body;

    if (req.user.role !== 'SuperAdmin') {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    if (!name || !location_id) {
      return res
        .status(400)
        .json({ message: 'Name and location_id are required' });
    }

    if (!mongoose.Types.ObjectId.isValid(location_id)) {
      return res.status(400).json({ message: 'Invalid location ID' });
    }

    const location = await Location.findById(location_id);
    if (!location) {
      return res.status(404).json({ message: 'Location not found' });
    }

    const thingToCarry = new ThingsToCarry({ name, location_id });
    await thingToCarry.save();

    res.status(201).json({
      message: 'Things to carry added successfully',
      data: thingToCarry
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getThingsToCarry = async (req, res) => {
  try {
    const { location_id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(location_id)) {
      return res.status(400).json({ message: 'Invalid location ID' });
    }

    const location = await Location.findById(location_id).lean();
    if (!location) {
      return res.status(404).json({ message: 'Location not found' });
    }

    const thingsToCarry = await ThingsToCarry.find({ location_id }).lean();

    res.status(200).json({
      data: thingsToCarry.map((item) => ({
        _id: item._id,
        name: item.name,
        location_name: location.name
      }))
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateThingsToCarry = async (req, res) => {
  try {
    const { location_id, item_id } = req.params;
    const { name } = req.body;

    if (req.user.role !== 'SuperAdmin') {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    if (
      !mongoose.Types.ObjectId.isValid(location_id) ||
      !mongoose.Types.ObjectId.isValid(item_id)
    ) {
      return res.status(400).json({ message: 'Invalid ID format' });
    }

    if (!name) {
      return res.status(400).json({ message: 'Name is required' });
    }

    const updatedItem = await ThingsToCarry.findOneAndUpdate(
      { _id: item_id, location_id },
      { name },
      { new: true }
    );

    if (!updatedItem) {
      return res.status(404).json({ message: 'Item not found' });
    }

    res.status(200).json({
      message: 'Things to carry updated successfully',
      data: updatedItem
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteThingsToCarry = async (req, res) => {
  try {
    const { location_id, item_id } = req.params;

    if (req.user.role !== 'SuperAdmin') {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    if (
      !mongoose.Types.ObjectId.isValid(location_id) ||
      !mongoose.Types.ObjectId.isValid(item_id)
    ) {
      return res.status(400).json({ message: 'Invalid ID format' });
    }

    const deletedItem = await ThingsToCarry.findOneAndDelete({
      _id: item_id,
      location_id
    });

    if (!deletedItem) {
      return res.status(404).json({ message: 'Item not found' });
    }

    res.status(200).json({ message: 'Item deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  addThingsToCarry,
  getThingsToCarry,
  updateThingsToCarry,
  deleteThingsToCarry
};

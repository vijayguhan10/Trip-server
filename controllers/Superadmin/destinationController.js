const Destination = require('../../models/Destination');
const Location = require('../../models/Location');

const createDestination = async (req, res) => {
  const {
    place_name,
    location_id,
    map_link,
    iframe_url,
    near_by_attractions,
    best_time_to_visit,
    short_summary,
    image_urls,
    top_destination
  } = req.body;

  try {
    if (!place_name || !location_id || !map_link || !iframe_url) {
      return res.status(400).json({ message: 'Missing Information' });
    }

    const locationExists = await Location.findById(location_id);
    if (!locationExists || locationExists.is_deleted) {
      return res.status(404).json({ message: 'Invalid location ID' });
    }

    const newDestination = new Destination({
      place_name,
      location_id,
      map_link,
      iframe_url,
      near_by_attractions,
      best_time_to_visit,
      short_summary,
      is_deleted: false,
      image_urls,
      top_destination: top_destination || false
    });

    await newDestination.save();
    res.status(201).json({
      message: 'Destination added successfully',
      data: newDestination
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: 'Error adding destination', error: error.message });
  }
};

const getDestinationsByLocation = async (req, res) => {
  try {
    const { location_id } = req.params;
    if (!location_id) {
      return res.status(400).json({ message: 'Location ID is required' });
    }

    const destinations = await Destination.find({
      location_id,
      is_deleted: false
    }).populate({
      path: 'location_id',
      select: '_id name map_url iframe_url'
    });

    const formattedDestinations = destinations.map((destination) => ({
      ...destination.toObject(),
      location_id: destination.location_id._id,
      locationName: destination.location_id.name,
      locationMapUrl: destination.location_id.map_url,
      locationIframeUrl: destination.location_id.iframe_url
    }));

    res.status(200).json({ data: formattedDestinations });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllDestinations = async (req, res) => {
  try {
    const destinations = await Destination.find({ is_deleted: false }).populate(
      {
        path: 'location_id',
        select: '_id name map_url iframe_url'
      }
    );

    const formattedDestinations = destinations.map((destination) => ({
      ...destination.toObject(),
      location_id: destination.location_id._id,
      locationName: destination.location_id.name,
      locationMapUrl: destination.location_id.map_url,
      locationIframeUrl: destination.location_id.iframe_url
    }));

    res.status(200).json({ data: formattedDestinations });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateDestination = async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  try {
    const destination = await Destination.findOne({
      _id: id,
      is_deleted: false
    });

    if (!destination) {
      return res.status(404).json({ message: 'Destination not found' });
    }

    delete updates._id;
    delete updates.is_deleted;

    if (updates.delete === true) {
      destination.is_deleted = true;
      await destination.save();
      return res
        .status(200)
        .json({ message: 'Destination deleted successfully' });
    }
    const updatedData = {};
    if (updates.place_name) updatedData.place_name = updates.place_name;
    if (updates.location_id) {
      const locationExists = await Location.findById(updates.location_id);
      if (!locationExists || locationExists.is_deleted) {
        return res.status(404).json({ message: 'Invalid location ID' });
      }
      updatedData.location_id = updates.location_id;
    }
    if (updates.map_link) updatedData.map_link = updates.map_link;
    if (updates.iframe_url) updatedData.iframe_url = updates.iframe_url;
    if (updates.near_by_attractions)
      updatedData.near_by_attractions = updates.near_by_attractions;
    if (updates.best_time_to_visit)
      updatedData.best_time_to_visit = updates.best_time_to_visit;
    if (updates.short_summary)
      updatedData.short_summary = updates.short_summary;
    if (updates.image_urls) updatedData.image_urls = updates.image_urls;
    if (updates.hasOwnProperty('top_destination'))
      updatedData.top_destination = updates.top_destination;

    if (Object.keys(updatedData).length === 0) {
      return res
        .status(400)
        .json({ message: 'No valid fields provided for update' });
    }

    const updatedDestination = await Destination.findByIdAndUpdate(
      id,
      { $set: updatedData },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      message: 'Destination updated successfully',
      data: updatedDestination
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteDestination = async (req, res) => {
  const { id } = req.params;

  try {
    const destination = await Destination.findOne({
      _id: id,
      is_deleted: false
    });
    if (!destination) {
      return res.status(404).json({ message: 'Destination not found' });
    }

    destination.is_deleted = true;
    await destination.save();

    res.status(200).json({ message: 'Destination deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createDestination,
  getDestinationsByLocation,
  getAllDestinations,
  updateDestination,
  deleteDestination
};

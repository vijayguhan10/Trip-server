const Task = require('../../models/Partner/Task');

const createTask = async (req, res) => {
  console.log(req.body);
  try {
    const {
      name,
      description,
      whatsincluded,
      additional_info,
      price,
      slots,
      discount_percentage,
      activity_id,
      image_url = [],
      filter = []
    } = req.body;
    const newTask = new Task({
      name,
      description,
      whatsincluded,
      additional_info,
      price,
      slots,
      discount_percentage,
      user_id: req.user._id,
      activity_id,
      image_url,
      filter
    });

    const savedTask = await newTask.save();
    res.status(201).json(savedTask);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getAllTasks = async (req, res) => {
  try {
    let query = {};

    const {
      name,
      activity_id,
      minPrice,
      maxPrice,
      filter,
      is_deleted,
      status
    } = req.query;

    if (name) {
      query.name = { $regex: name, $options: 'i' };
    }
    if (activity_id) {
      query.activity_id = activity_id;
    }
    if (minPrice) {
      query.price = { $gte: parseFloat(minPrice) };
    }
    if (maxPrice) {
      query.price = { $lte: parseFloat(maxPrice) };
    }
    if (filter) {
      query.filter = { $in: filter.split(',') };
    }
    if (is_deleted !== undefined) {
      query.is_deleted = is_deleted === 'true';
    }
    if (status) {
      query.status = status;
    }

    const tasks = await Task.find(query).populate({
      path: 'activity_id',
      select: 'business_name city pincode address single_line_address'
    });

    const transformedTasks = tasks.map((task) => {
      const businessDetails = task.activity_id
        ? {
            business_name: task.activity_id.business_name,
            city: task.activity_id.city,
            pincode: task.activity_id.pincode,
            address: task.activity_id.address,
            single_line_address: task.activity_id.single_line_address
          }
        : {};

      return {
        ...task.toObject(),
        ...businessDetails,
        activity_id: undefined
      };
    });

    res.status(200).json(transformedTasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.status(200).json(task);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    if (task.user_id.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ error: 'You are not authorized to update this task' });
    }

    const { filter = [] } = req.body;

    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      { ...req.body, filter },
      { new: true }
    );
    res.status(200).json(updatedTask);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    if (task.user_id.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ error: 'You are not authorized to delete this task' });
    }

    await Task.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createTask,
  getAllTasks,
  getTaskById,
  updateTask,
  deleteTask
};

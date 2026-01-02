const Category = require('../models/Category');

// Create category
exports.createCategory = async (req, res) => {
  try {
    const { name, type, icon, color, budget } = req.body;
    
    const category = new Category({
      name,
      type: type || 'both',
      icon: icon || '💰',
      color: color || '#6B7280',
      budget: budget || 0,
      user: req.user.id
    });
    
    await category.save();
    
    res.status(201).json({
      success: true,
      data: category
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get categories
exports.getCategories = async (req, res) => {
  try {
    const { type } = req.query;
    const query = { user: req.user.id };
    
    if (type) query.type = { $in: [type, 'both'] };
    
    const categories = await Category.find(query).sort('name');
    
    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Update category
exports.updateCategory = async (req, res) => {
  try {
    const category = await Category.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!category) {
      return res.status(404).json({
        success: false,
        error: 'Category not found'
      });
    }
    
    res.json({
      success: true,
      data: category
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Delete category
exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
      isDefault: false // Prevent deleting default categories
    });
    
    if (!category) {
      return res.status(404).json({
        success: false,
        error: 'Category not found or cannot delete default category'
      });
    }
    
    res.json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
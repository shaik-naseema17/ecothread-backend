import express from "express";
import multer from "multer";
import path from "path";
import Item from "../models/Item.js";
import jwt from "jsonwebtoken";

const router = express.Router();

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, "uploads/"),
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

const authenticateUser = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ message: "Unauthorized" });
    try {
        const decoded = jwt.verify(token, process.env.KEY);
        req.userId = decoded.id;
        next();
    } catch {
        res.status(401).json({ message: "Invalid token" });
    }
};
//ADD ITEM
router.post('/create', authenticateUser, upload.single('image'), async (req, res) => {
    try {
        const { title, size, condition, preferences } = req.body;
        if (!title || !size || !condition || !preferences || !req.file) {
            return res.status(400).json({ message: 'All fields are required.' });
        }
        const newItem = new Item({
            title, size, condition, preferences,
            imageUrl: `/uploads/${req.file.filename}`,
            createdBy: req.userId
        });
        await newItem.save();
        res.status(201).json({ message: 'Item created successfully', item: newItem });
    } catch (error) {
        res.status(500).json({ message: 'Failed to create item', error: error.message });
    }
});
// Fetch items created by the logged-in user
router.get('/my-items', authenticateUser, async (req, res) => {
    try {
        const userId = req.userId;
        const myItems = await Item.find({ createdBy: userId }).populate('createdBy', 'username email');

        res.status(200).json(Array.isArray(myItems) ? myItems : []); // Ensure array response
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch your items', error: error.message });
    }
});


//FETCH IN ITEMS.JSX
// Fetch all items excluding those created by the current user
router.get('/', authenticateUser, async (req, res) => {
    try {
      const userId = req.userId; // Get the current user's ID from the authentication middleware
      const items = await Item.find({ createdBy: { $ne: userId } }).populate('createdBy', 'username email');
      res.status(200).json(items);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch items', error: error.message });
    }
  });
//VIEW ITEM DETAILS && EDIT ITEMS PAGE
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const item = await Item.findById(id).populate('createdBy', 'username email'); // Include email here

        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }

        res.status(200).json(item);
    } catch (error) {
        console.error("Error fetching item by ID:", error);
        // Fetch all items excluding those created by the current user
res.status(500).json({ message: 'Failed to fetch item', error: error.message });
    }
});
// Fetch items created by the current user

//EDIT  ROUTE IN EDIT ITEM
router.put('/:id', upload.single('image'), async (req, res) => {
    try {
        const { id } = req.params;
        const { title, size, condition, preferences } = req.body;

        const updateData = { title, size, condition, preferences };

        if (req.file) {
            updateData.imageUrl = `/uploads/${req.file.filename}`;
        }

        const updatedItem = await Item.findByIdAndUpdate(id, updateData, { new: true }).populate('createdBy', 'username email'); // Include email here

        if (!updatedItem) {
            return res.status(404).json({ message: 'Item not found' });
        }

        res.status(200).json({ message: 'Item updated successfully', item: updatedItem });
    } catch (error) {
        console.error('Error updating item:', error);
        res.status(500).json({ message: 'Failed to update item', error: error.message });
    }
});
//DELETE ROUTE IN FRONTEND ITEMS.JSX
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const deletedItem = await Item.findByIdAndDelete(id);

        if (!deletedItem) {
            return res.status(404).json({ message: 'Item not found' });
        }

        res.status(200).json({ message: 'Item deleted successfully' });
    } catch (error) {
        console.error('Error deleting item:', error);
        res.status(500).json({ message: 'Failed to delete item', error: error.message });
    }
});

export default router;
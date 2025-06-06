import mongoose from 'mongoose';

const ItemSchema = new mongoose.Schema({
    title: { type: String, required: true },
    size: { type: String, required: true },
    condition: { type: String, required: true },
    preferences: { type: String },
    imageUrl: { type: String, required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
});

const Item = mongoose.model('Item', ItemSchema);
export default Item;
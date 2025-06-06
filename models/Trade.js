import mongoose from "mongoose";

const tradeSchema = new mongoose.Schema({
  proposedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  proposedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  proposedItem: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
  requestedItem: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
  status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

const Trade = mongoose.model('Trade', tradeSchema);

export default Trade;
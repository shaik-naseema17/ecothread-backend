import express from "express";
import jwt from "jsonwebtoken";
import Trade from "../models/Trade.js";
import Item from "../models/Item.js";

const router = express.Router();

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

// Propose a trade
router.post("/propose", authenticateUser, async (req, res) => {
  try {
    const { proposedTo, proposedItem, requestedItem } = req.body;

    // Validate if items exist
    const proposedItemExists = await Item.findById(proposedItem);
    const requestedItemExists = await Item.findById(requestedItem);

    if (!proposedItemExists || !requestedItemExists) {
      return res.status(404).json({ message: "One or more items not found" });
    }

    const trade = new Trade({
      proposedBy: req.userId,
      proposedTo,
      proposedItem,
      requestedItem,
      status: "pending", // Default status
    });

    await trade.save();
    res.status(201).json({ message: "Trade proposed successfully", trade });
  } catch (error) {
    res.status(500).json({ message: "Failed to propose trade", error: error.message });
  }
});

// Get all trades for a user
router.get("/my-trades", authenticateUser, async (req, res) => {
  try {
    const trades = await Trade.find({ $or: [{ proposedBy: req.userId }, { proposedTo: req.userId }] })
      .populate("proposedBy", "username")
      .populate("proposedTo", "username")
      .populate("proposedItem")
      .populate("requestedItem");

    res.status(200).json(trades);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch trades", error: error.message });
  }
});

// Accept a trade and delete it along with the involved items
router.put("/:id/accept", authenticateUser, async (req, res) => {
  try {
    const trade = await Trade.findById(req.params.id);

    if (!trade) {
      return res.status(404).json({ message: "Trade not found" });
    }

    // Only the proposedTo user can accept the trade
    if (trade.proposedTo.toString() !== req.userId) {
      return res.status(403).json({ message: "Unauthorized to accept this trade" });
    }

    // Delete both items involved in the trade
    await Item.findByIdAndDelete(trade.proposedItem);
    await Item.findByIdAndDelete(trade.requestedItem);

    // Delete the trade itself
    await Trade.findByIdAndDelete(trade._id);

    res.status(200).json({ message: "Trade accepted and deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to accept trade", error: error.message });
  }
});

// Reject a trade
router.put("/:id/reject", authenticateUser, async (req, res) => {
  try {
    const trade = await Trade.findById(req.params.id);

    if (!trade) {
      return res.status(404).json({ message: "Trade not found" });
    }

    // Only the proposedTo user can reject the trade
    if (trade.proposedTo.toString() !== req.userId) {
      return res.status(403).json({ message: "Unauthorized to reject this trade" });
    }

    trade.status = "rejected";
    await trade.save();

    res.status(200).json({ message: "Trade rejected successfully", trade });
  } catch (error) {
    res.status(500).json({ message: "Failed to reject trade", error: error.message });
  }
});

export default router;
import Announcement from '../models/Announcement.js';

// GET all announcements (students + admin) — pinned first, then newest
export const getAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find()
      .populate('createdBy', 'name')
      .sort({ pinned: -1, createdAt: -1 });
    res.json(announcements);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch announcements' });
  }
};

// POST create announcement (admin only)
export const createAnnouncement = async (req, res) => {
  try {
    const { title, content, type, pinned } = req.body;
    const announcement = await Announcement.create({
      title, content,
      type:      type    || 'info',
      pinned:    pinned  || false,
      createdBy: req.user._id,
    });
    res.status(201).json({ message: 'Announcement posted!', announcement });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create announcement' });
  }
};

// PUT update announcement (admin only)
export const updateAnnouncement = async (req, res) => {
  try {
    const { title, content, type, pinned } = req.body;
    const updated = await Announcement.findByIdAndUpdate(
      req.params.id,
      { title, content, type, pinned },
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Updated!', announcement: updated });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update' });
  }
};

// DELETE announcement (admin only)
export const deleteAnnouncement = async (req, res) => {
  try {
    await Announcement.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete' });
  }
};
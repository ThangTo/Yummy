import { Router } from 'express';
import { User } from '../models/User';

const router = Router();

// Get user passport + unlocked regions
router.get('/:id/passport', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).lean();
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({
      food_passport: user.food_passport,
      unlocked_regions: user.unlocked_regions,
      current_rank: user.current_rank,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch passport' });
  }
});

// Append check-in (simplified; expects food_id, image_url optional, region_key optional)
router.post('/:id/checkin', async (req, res) => {
  try {
    const { food_id, image_url, region_key } = req.body;
    if (!food_id) return res.status(400).json({ error: 'food_id required' });

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    user.food_passport.push({ food_id, checkin_date: new Date(), image_url });
    if (region_key && !user.unlocked_regions.includes(region_key)) {
      user.unlocked_regions.push(region_key);
    }
    await user.save();
    res.json({ ok: true });
  } catch (err: any) {
    console.error(err);
    res.status(400).json({ error: err.message || 'Failed to check-in' });
  }
});

export default router;


import { Router } from 'express';
import { Food } from '../models/Food';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const { region_key } = req.query;
    const filter = region_key ? { region_key } : {};
    const foods = await Food.find(filter).lean();
    res.json(foods);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch foods' });
  }
});

router.post('/', async (req, res) => {
  try {
    const food = await Food.create(req.body);
    res.status(201).json(food);
  } catch (err: any) {
    console.error(err);
    res.status(400).json({ error: err.message || 'Failed to create food' });
  }
});

export default router;


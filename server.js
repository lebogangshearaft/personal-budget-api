// server.js
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

/* =========================
   NSFAS BUDGET CALCULATOR
   ========================= */
// Defaults (tweak these to your real monthly situation)
const DEFAULT_ALLOWANCE = 1650; // example monthly cash allowance
const DEFAULT_EXPENSES = {
  accommodation: 750,
  transport: 300,
  groceries: 400,
  data: 150,
  // add more if you like:
  // toiletries: 100,
  // stationery: 80,
};

function calcBudget(allowance, expenses) {
  const totalExpenses = Object.values(expenses).reduce((s, v) => s + v, 0);
  const remaining = allowance - totalExpenses;
  return {
    nsfasAllowance: allowance,
    expenses,
    totalExpenses,
    remaining,
    message: remaining >= 0 ? 'You are within your budget.' : 'You are overspending!'
  };
}

// Show your default NSFAS budget (handy for browsers)
app.get('/', (req, res) => {
  res.json(calcBudget(DEFAULT_ALLOWANCE, DEFAULT_EXPENSES));
});

// Same at /api (for consistency)
app.get('/api', (req, res) => {
  res.json(calcBudget(DEFAULT_ALLOWANCE, DEFAULT_EXPENSES));
});

// Customize via POST (send your allowance/expenses)
app.post('/api/nsfas-budget', (req, res) => {
  let { allowance, expenses } = req.body;

  if (allowance !== undefined && (typeof allowance !== 'number' || allowance < 0)) {
    return res.status(400).json({ error: 'allowance must be a non‑negative number' });
  }
  if (expenses !== undefined && (typeof expenses !== 'object' || Array.isArray(expenses))) {
    return res.status(400).json({ error: 'expenses must be an object like { groceries: 400, data: 150 }' });
  }

  allowance = typeof allowance === 'number' ? allowance : DEFAULT_ALLOWANCE;
  expenses = expenses || DEFAULT_EXPENSES;

  res.json(calcBudget(allowance, expenses));
});

/* =========================
   ENVELOPE BUDGETING API
   (kept for full project spec)
   Base path: /api/envelopes
   ========================= */
let totalBudget = 0;
let envelopes = [];
let nextId = 1;

// Create envelope
app.post('/api/envelopes', (req, res) => {
  const { name, budget } = req.body;
  if (!name || typeof budget !== 'number' || budget < 0) {
    return res.status(400).json({ error: 'Invalid name or budget' });
  }
  const envelope = { id: nextId++, name, budget, balance: budget };
  envelopes.push(envelope);
  totalBudget += budget;
  res.status(201).json(envelope);
});

// Get all envelopes
app.get('/api/envelopes', (_req, res) => {
  res.json(envelopes);
});

// Get specific envelope
app.get('/api/envelopes/:id', (req, res) => {
  const id = Number(req.params.id);
  const envelope = envelopes.find(env => env.id === id);
  if (!envelope) return res.status(404).json({ error: 'Envelope not found' });
  res.json(envelope);
});

// Update envelope
app.put('/api/envelopes/:id', (req, res) => {
  const id = Number(req.params.id);
  const { name, budget, balance } = req.body;
  const envelope = envelopes.find(env => env.id === id);
  if (!envelope) return res.status(404).json({ error: 'Envelope not found' });

  if (budget !== undefined) {
    if (typeof budget !== 'number' || budget < 0) {
      return res.status(400).json({ error: 'Invalid budget value' });
    }
    totalBudget = totalBudget - envelope.budget + budget;
    envelope.budget = budget;
    if (envelope.balance > budget) envelope.balance = budget;
  }
  if (balance !== undefined) {
    if (typeof balance !== 'number' || balance < 0 || balance > envelope.budget) {
      return res.status(400).json({ error: 'Invalid balance value' });
    }
    envelope.balance = balance;
  }
  if (name !== undefined) envelope.name = name;

  res.json(envelope);
});

// Delete envelope
app.delete('/api/envelopes/:id', (req, res) => {
  const id = Number(req.params.id);
  const index = envelopes.findIndex(env => env.id === id);
  if (index === -1) return res.status(404).json({ error: 'Envelope not found' });
  const deleted = envelopes.splice(index, 1)[0];
  totalBudget -= deleted.budget;
  res.status(204).send();
});

// Transfer funds
app.post('/api/envelopes/transfer', (req, res) => {
  const { fromId, toId, amount } = req.body;
  if (typeof fromId !== 'number' || typeof toId !== 'number' || typeof amount !== 'number' || amount <= 0) {
    return res.status(400).json({ error: 'Invalid input data' });
  }
  const fromEnvelope = envelopes.find(env => env.id === fromId);
  const toEnvelope = envelopes.find(env => env.id === toId);
  if (!fromEnvelope || !toEnvelope) return res.status(404).json({ error: 'Envelope(s) not found' });
  if (fromEnvelope.balance < amount) return res.status(400).json({ error: 'Insufficient funds' });

  fromEnvelope.balance -= amount;
  toEnvelope.balance += amount;
  res.json({ fromEnvelope, toEnvelope });
});

// Start server
app.listen(PORT, () => console.log(`API running on port ${PORT}`));

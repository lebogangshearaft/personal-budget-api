const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;


app.use(express.json());

let totalBudget = 0;
let envelopes = [];
let nextId = 1;

app.get('/', (req, res) => {
  res.send('Hello, World');
});

// Create envelope
app.post('/envelopes', (req, res) => {
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
app.get('/envelopes', (req, res) => {
  res.json(envelopes);
});

// Get specific envelope
app.get('/envelopes/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const envelope = envelopes.find(env => env.id === id);
  if (!envelope) {
    return res.status(404).json({ error: 'Envelope not found' });
  }
  res.json(envelope);
});

// Update envelope
app.put('/envelopes/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const { name, budget, balance } = req.body;
  const envelope = envelopes.find(env => env.id === id);
  if (!envelope) {
    return res.status(404).json({ error: 'Envelope not found' });
  }
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
  if (name !== undefined) {
    envelope.name = name;
  }
  res.json(envelope);
});

// Delete envelope
app.delete('/envelopes/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = envelopes.findIndex(env => env.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Envelope not found' });
  }
  const deleted = envelopes.splice(index, 1)[0];
  totalBudget -= deleted.budget;
  res.status(204).send();
});

// Transfer funds
app.post('/envelopes/transfer', (req, res) => {
  const { fromId, toId, amount } = req.body;
  if (
    typeof fromId !== 'number' ||
    typeof toId !== 'number' ||
    typeof amount !== 'number' ||
    amount <= 0
  ) {
    return res.status(400).json({ error: 'Invalid input data' });
  }
  const fromEnvelope = envelopes.find(env => env.id === fromId);
  const toEnvelope = envelopes.find(env => env.id === toId);
  if (!fromEnvelope || !toEnvelope) {
    return res.status(404).json({ error: 'Envelope(s) not found' });
  }
  if (fromEnvelope.balance < amount) {
    return res.status(400).json({ error: 'Insufficient funds' });
  }
  fromEnvelope.balance -= amount;
  toEnvelope.balance += amount;
  res.json({ fromEnvelope, toEnvelope });
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

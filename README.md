# Personal Budget API

A simple Node.js + Express API to manage a personal budget using the **envelope budgeting** system.  
Users can create envelopes, update them, delete them, and transfer money between them.  

> **Live API:** [https://your-render-url.onrender.com](https://your-render-url.onrender.com)  
> Replace with your actual Render link after deployment.

---

## Features
- Create envelopes with a name and budget.
- Retrieve all envelopes or a single envelope by ID.
- Update envelope details (budget, name, balance).
- Delete envelopes.
- Transfer money between envelopes.
- Track the total budget.

---

## Tech Stack
- **Node.js**
- **Express.js**
- **JavaScript**
- **CORS enabled** for frontend integration

---

## Endpoints

### Root
GET /
Returns a simple greeting to confirm the API is running.

---

### Create Envelope
POST /envelopes

**Body (JSON):**
```json
{
  "name": "Groceries",
  "budget": 2000
}
Get All Envelopes

GET /envelopes
Get Single Envelope

GET /envelopes/:id
Update Envelope

PUT /envelopes/:id
Body (JSON):


{
  "name": "Groceries",
  "budget": 2500,
  "balance": 1500
}
Delete Envelope
bash
Copy code
DELETE /envelopes/:id
Transfer Funds
arduino
Copy code
POST /envelopes/transfer
Body (JSON):


{
  "fromId": 1,
  "toId": 2,
  "amount": 500
}
Installation
Clone the repository:


git clone https://github.com/lebogangshearaft/personal-budget-api.git
Navigate into the project:


cd personal-budget-api
Install dependencies:



npm install
Start the server:



node server.js
Open in browser:

arduino

http://localhost:3000
Deployment on Render
Create a new Web Service on Render.

Connect your GitHub repository.

Add Node version in package.json:



"engines": { "node": "20.x" }
Set Build Command to:

nginx

npm install
Set Start Command to:

nginx

node server.js
Deploy.

License
This project is open-source and available under the MIT License.

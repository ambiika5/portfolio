# Portfolio Backend (Express + MongoDB)

## Install
```bash
cd server
npm install
```

## Configure MongoDB
1) Create `.env` in this folder:
- Copy `./.env.example` → `./.env`
- Set `MONGODB_URI` (required)

Example:
```env
MONGODB_URI=mongodb://127.0.0.1:27017/portfolio
MONGODB_DB=portfolio
MONGODB_COLLECTION=contactMessages
PORT=3000
```

## Run
```bash
node server.js
```

## API
`POST /api/contact`
- Body: `{ name, email, message }`
- Returns: `{ ok: true }` or `{ ok: false, errors: [...] }`


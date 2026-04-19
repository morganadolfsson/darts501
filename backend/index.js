import { app, Datastore } from 'codehooks-js';
import Pusher from 'pusher';

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID,
  key: process.env.PUSHER_KEY,
  secret: process.env.PUSHER_SECRET,
  cluster: process.env.PUSHER_CLUSTER,
  useTLS: true,
});

function generateCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

// Create a new game session
app.post('/sessions', async (req, res) => {
  try {
    const { settings } = req.body;
    const db = await Datastore.open();
    const session = await db.insertOne('sessions', {
      code: generateCode(),
      settings: settings || { legsPerSet: 3, setsToWin: 1, playerCount: 2 },
      players: [],
      gameState: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    res.status(201).json(session);
  } catch (err) {
    console.error('POST /sessions', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Find session by join code
app.get('/sessions/code/:code', async (req, res) => {
  try {
    const db = await Datastore.open();
    const sessions = await db.getMany('sessions', { code: req.params.code }).toArray();
    if (!sessions.length) return res.status(404).json({ error: 'Session not found' });
    res.json(sessions[0]);
  } catch (err) {
    console.error('GET /sessions/code', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get session by ID
app.get('/sessions/:id', async (req, res) => {
  try {
    const db = await Datastore.open();
    const session = await db.getOne('sessions', req.params.id);
    if (!session) return res.status(404).json({ error: 'Session not found' });
    res.json(session);
  } catch (err) {
    console.error('GET /sessions/:id', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update session state (client-authoritative)
app.put('/sessions/:id', async (req, res) => {
  try {
    const { gameState, updatedBy } = req.body;

    if (!gameState || typeof gameState !== 'object' || !Array.isArray(gameState.players) || !Array.isArray(gameState.history)) {
      return res.status(400).json({ error: 'Invalid gameState shape' });
    }
    if (typeof updatedBy !== 'string' || updatedBy.length > 100) {
      return res.status(400).json({ error: 'Invalid updatedBy' });
    }

    const db = await Datastore.open();
    const session = await db.getOne('sessions', req.params.id);
    if (!session) return res.status(404).json({ error: 'Session not found' });
    const isMember = Array.isArray(session.players) && session.players.some(p => p.userId === updatedBy);
    if (!isMember) return res.status(403).json({ error: 'Not a session member' });

    const updated = await db.updateOne('sessions', req.params.id, {
      $set: {
        gameState,
        updatedAt: new Date().toISOString(),
      },
    });

    // Broadcast to all clients via Pusher
    await pusher.trigger(`session-${req.params.id}`, 'state-update', {
      gameState,
      updatedBy: updatedBy || 'unknown',
    });

    res.json(updated);
  } catch (err) {
    console.error('PUT /sessions/:id', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Join a session
app.post('/sessions/:id/join', async (req, res) => {
  try {
    const { playerName, userId } = req.body;
    const db = await Datastore.open();
    const session = await db.getOne('sessions', req.params.id);
    if (!session) return res.status(404).json({ error: 'Session not found' });

    const players = session.players || [];
    const existing = players.find(p => p.userId === userId);
    if (!existing) {
      players.push({ name: playerName, userId });
    }

    const updated = await db.updateOne('sessions', req.params.id, {
      $set: { players, updatedAt: new Date().toISOString() },
    });

    await pusher.trigger(`session-${req.params.id}`, 'player-joined', {
      playerName,
      userId,
    });

    res.json(updated);
  } catch (err) {
    console.error('POST /sessions/:id/join', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default app.init();

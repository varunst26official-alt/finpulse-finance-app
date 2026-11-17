import { execSync } from 'child_process';
import { createRequire } from 'module';
import fs from 'fs';
import path from 'path';

const require = createRequire(import.meta.url);
const initSqlJs = require('../server/node_modules/sql.js/dist/sql-wasm.js');

const ADB_PATH = 'C:\\Program Files\\BlueStacks_nxt\\HD-Adb.exe';
const DB_FILE = 'c:\\Users\\Admin\\Downloads\\finpulse-finance-app\\server\\data\\finpulse.sqlite';

async function checkDatabase(email) {
  const SQL = await initSqlJs();
  const fileBuffer = fs.readFileSync(DB_FILE);
  const db = new SQL.Database(fileBuffer);

  const userStmt = db.prepare('SELECT id, email, full_name, investor_type FROM users WHERE email = ?');
  userStmt.bind([email]);
  let user = null;
  if (userStmt.step()) {
    user = userStmt.getAsObject();
  }
  userStmt.free();

  let syncState = null;
  if (user) {
    const syncStmt = db.prepare('SELECT user_id, updated_at, substr(finance_state, 1, 100) as fin_sample, substr(lifeos_state, 1, 100) as life_sample FROM user_sync_states WHERE user_id = ?');
    syncStmt.bind([user.id]);
    if (syncStmt.step()) {
      syncState = syncStmt.getAsObject();
    }
    syncStmt.free();
  }

  db.close();
  return { user, syncState };
}

async function run() {
  console.log('=== Step 1: Checking BlueStacks WebView devtools socket ===');
  let socketName = null;
  try {
    const sockets = execSync(`"${ADB_PATH}" -s emulator-5554 shell cat /proc/net/unix`).toString();
    const match = sockets.match(/@(webview_devtools_remote_\d+)/);
    if (match) {
      socketName = match[1];
      console.log('Found webview socket:', socketName);
      execSync(`"${ADB_PATH}" -s emulator-5554 forward tcp:9222 localabstract:${socketName}`);
    } else {
      console.log('No webview socket found directly in /proc/net/unix');
    }
  } catch (err) {
    console.error('ADB socket error:', err.message);
  }

  // Generate unique test user
  const timestamp = Date.now();
  const testUser = {
    fullName: `Mobile User ${timestamp}`,
    email: `mobile_${timestamp}@quantra.io`,
    password: 'Password123!',
    phoneNumber: '+15551234567',
  };

  console.log(`\n=== Step 2: Testing Mobile Registration via App / API ===`);
  console.log('Test User:', testUser);

  // If webview is connected, we can test via evaluate in the live app on BlueStacks!
  let registeredViaMobile = false;
  if (socketName) {
    try {
      const res = await fetch('http://127.0.0.1:9222/json');
      const targets = await res.json();
      console.log('DevTools targets:', targets.map(t => ({ title: t.title, url: t.url, type: t.type })));
      const pageTarget = targets.find(t => t.type === 'page') || targets[0];

      if (pageTarget && pageTarget.webSocketDebuggerUrl) {
        console.log('Connecting to BlueStacks WebView CDP:', pageTarget.webSocketDebuggerUrl);
        const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);
        await new Promise((resolve, reject) => {
          ws.onopen = resolve;
          ws.onerror = reject;
          setTimeout(() => reject(new Error('WebSocket timeout')), 5000);
        });

        let msgId = 1;
        function send(method, params = {}) {
          return new Promise((resolve, reject) => {
            const id = msgId++;
            const handler = (evt) => {
              const data = JSON.parse(evt.data);
              if (data.id === id) {
                ws.removeEventListener('message', handler);
                if (data.error) reject(new Error(JSON.stringify(data.error)));
                else resolve(data.result);
              }
            };
            ws.addEventListener('message', handler);
            ws.send(JSON.stringify({ id, method, params }));
          });
        }

        async function evaluate(code) {
          const r = await send('Runtime.evaluate', {
            expression: code,
            returnByValue: true,
            awaitPromise: true
          });
          return r.result ? r.result.value : null;
        }

        console.log('Invoking useAuthStore.getState().register() inside BlueStacks WebView...');
        const mobileRegResult = await evaluate(`
          (async () => {
            try {
              // Access zustand store directly if exposed or via window
              const authStore = window.__AUTH_STORE__ || (window.useAuthStore ? window.useAuthStore.getState() : null);
              if (authStore && authStore.register) {
                return await authStore.register(${JSON.stringify(testUser)});
              }
              // Alternatively call apiClient directly inside WebView
              const apiClient = window.__API_CLIENT__;
              return { fallbackNeeded: true, hasStore: !!authStore };
            } catch (e) {
              return { error: e.message };
            }
          })()
        `);
        console.log('Mobile app evaluate result:', mobileRegResult);

        ws.close();
      }
    } catch (err) {
      console.warn('WebView CDP interaction note:', err.message);
    }
  }

  // Now perform registration via the exact client logic (HTTP POST to /api/auth/register and /api/user/sync-state)
  console.log('\n=== Step 3: Registering user through API endpoint (matching mobile apiClient) ===');
  const regResponse = await fetch('http://localhost:5001/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(testUser),
  });
  const regJson = await regResponse.json();
  console.log('Register API Response:', regJson);

  if (!regJson.success || !regJson.token) {
    throw new Error(`Registration failed: ${JSON.stringify(regJson)}`);
  }

  // Now push initial sync state just like authStore.ts register() does: await syncUserDataToCloud(res.user)
  console.log('\n=== Step 4: Pushing initial cloud sync state (user_sync_states) ===');
  const syncPayload = {
    financeState: {
      currency: 'USD',
      emergencyTargetMonths: 6,
      assets: [],
      transactions: [],
      expenses: [],
      incomes: [],
      debts: [],
      policies: [],
      goals: [{ id: 'goal_1', name: 'Emergency Fund', targetAmount: 10000, currentAmount: 0 }],
      history: [],
      bills: [],
    },
    lifeosState: {
      tasks: [{ id: 'task_welcome', title: 'Welcome to Quantra', status: 'TODO', priority: 'HIGH' }],
      habits: [],
      wellness: {},
      workoutSessions: [],
      mealLogs: [],
      focusSessions: [],
      learningItems: [],
      documents: [],
      adminChecklists: [],
    },
  };

  const syncResponse = await fetch('http://localhost:5001/api/user/sync-state', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${regJson.token}`,
    },
    body: JSON.stringify(syncPayload),
  });
  const syncJson = await syncResponse.json();
  console.log('Push Sync State Response:', syncJson);

  // Give server brief moment to persist to SQLite disk
  await new Promise(r => setTimeout(r, 1000));

  console.log('\n=== Step 5: Confirming Persistence directly in server/data/finpulse.sqlite ===');
  const dbResult = await checkDatabase(testUser.email);
  console.log('Database User Row:', dbResult.user);
  console.log('Database Sync State Row:', dbResult.syncState);

  if (!dbResult.user) {
    throw new Error('User NOT found in SQLite users table!');
  }
  if (!dbResult.syncState) {
    throw new Error('Sync state NOT found in SQLite user_sync_states table!');
  }
  console.log('SUCCESS: Account and sync state verified in SQLite tables!');

  console.log('\n=== Step 6: Verifying Web Login & State Restoration (Cross-Device Sync) ===');
  const loginResponse = await fetch('http://localhost:5001/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: testUser.email,
      password: testUser.password,
    }),
  });
  const loginJson = await loginResponse.json();
  console.log('Login API Response:', loginJson);

  if (!loginJson.success || !loginJson.token) {
    throw new Error(`Login failed: ${JSON.stringify(loginJson)}`);
  }

  // Restore state via GET /api/user/sync-state
  const pullResponse = await fetch('http://localhost:5001/api/user/sync-state', {
    headers: {
      'Authorization': `Bearer ${loginJson.token}`,
    },
  });
  const pullJson = await pullResponse.json();
  console.log('Pull Sync State Response:', {
    success: pullJson.success,
    hasFinanceState: !!pullJson.data?.financeState,
    hasLifeosState: !!pullJson.data?.lifeosState,
    tasksCount: pullJson.data?.lifeosState?.tasks?.length,
    goalsCount: pullJson.data?.financeState?.goals?.length,
    updatedAt: pullJson.data?.updatedAt,
  });

  if (!pullJson.success || !pullJson.data?.financeState || !pullJson.data?.lifeosState) {
    throw new Error('Failed to restore synced state from cloud!');
  }

  console.log('\n=== ALL CROSS-DEVICE SYNC & REGISTRATION CHECKS PASSED SUCCESSFULLY! ===\n');
}

run().catch(err => {
  console.error('Verification failed:', err);
  process.exit(1);
});

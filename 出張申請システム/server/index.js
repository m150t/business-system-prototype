const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

const PORT = process.env.PORT || 4000;
const DATA_FILE = path.join(__dirname, 'data.json');

const defaultData = {
  tripRequests: [],
  expenses: [],
};

const readData = () => {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      fs.writeFileSync(DATA_FILE, JSON.stringify(defaultData, null, 2));
    }
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (error) {
    console.error('Failed to read data file:', error);
    return { ...defaultData };
  }
};

const writeData = (data) => {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Failed to write data file:', error);
  }
};

const sendJSON = (res, statusCode, data) => {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,PATCH,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  });
  res.end(JSON.stringify(data));
};

const sendNoContent = (res) => {
  res.writeHead(204, {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,PATCH,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  });
  res.end();
};

const parseBody = async (req) => {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }
  if (chunks.length === 0) return null;
  try {
    return JSON.parse(Buffer.concat(chunks).toString());
  } catch (error) {
    return null;
  }
};

const server = http.createServer(async (req, res) => {
  // Preflight request support
  if (req.method === 'OPTIONS') {
    sendNoContent(res);
    return;
  }

  const requestUrl = new URL(req.url || '', `http://${req.headers.host}`);
  const { pathname } = requestUrl;

  try {
    if (req.method === 'GET' && pathname === '/api/health') {
      sendJSON(res, 200, { status: 'ok' });
      return;
    }

    if (req.method === 'GET' && pathname === '/api/trip-requests') {
      const data = readData();
      sendJSON(res, 200, data.tripRequests);
      return;
    }

    if (req.method === 'POST' && pathname === '/api/trip-requests') {
      const body = await parseBody(req);
      const { employeeName, department, destination, purpose, startDate, endDate, estimatedCost, selectedRoute } = body || {};

      if (!employeeName || !department || !destination || !purpose || !startDate || !endDate || estimatedCost === undefined) {
        sendJSON(res, 400, { message: 'Missing required fields' });
        return;
      }

      const data = readData();
      const newRequest = {
        id: Date.now().toString(),
        employeeName,
        department,
        destination,
        purpose,
        startDate,
        endDate,
        estimatedCost,
        status: 'pending',
        createdAt: new Date().toISOString(),
        selectedRoute,
      };

      data.tripRequests.unshift(newRequest);
      writeData(data);
      sendJSON(res, 201, newRequest);
      return;
    }

    if (req.method === 'PATCH' && pathname.startsWith('/api/trip-requests/') && pathname.endsWith('/status')) {
      const id = pathname.split('/')[3];
      const body = await parseBody(req);
      const { status } = body || {};

      if (!['approved', 'rejected', 'pending'].includes(status)) {
        sendJSON(res, 400, { message: 'Invalid status' });
        return;
      }

      const data = readData();
      const index = data.tripRequests.findIndex((reqItem) => reqItem.id === id);

      if (index === -1) {
        sendJSON(res, 404, { message: 'Request not found' });
        return;
      }

      data.tripRequests[index].status = status;
      writeData(data);
      sendJSON(res, 200, data.tripRequests[index]);
      return;
    }

    if (req.method === 'GET' && pathname === '/api/expenses') {
      const data = readData();
      sendJSON(res, 200, data.expenses);
      return;
    }

    if (req.method === 'POST' && pathname === '/api/expenses') {
      const body = await parseBody(req);
      const { tripRequestId, category, amount, date, description, receipt } = body || {};

      if (!tripRequestId || !category || amount === undefined || !date || !description) {
        sendJSON(res, 400, { message: 'Missing required fields' });
        return;
      }

      const data = readData();
      const relatedRequest = data.tripRequests.find((request) => request.id === tripRequestId);

      if (!relatedRequest) {
        sendJSON(res, 400, { message: 'Trip request not found' });
        return;
      }

      const newExpense = {
        id: Date.now().toString(),
        tripRequestId,
        category,
        amount,
        date,
        description,
        receipt,
      };

      data.expenses.unshift(newExpense);
      writeData(data);
      sendJSON(res, 201, newExpense);
      return;
    }

    if (req.method === 'DELETE' && pathname.startsWith('/api/expenses/')) {
      const id = pathname.split('/')[3];
      const data = readData();
      const initialLength = data.expenses.length;
      data.expenses = data.expenses.filter((expense) => expense.id !== id);

      if (data.expenses.length === initialLength) {
        sendJSON(res, 404, { message: 'Expense not found' });
        return;
      }

      writeData(data);
      sendNoContent(res);
      return;
    }

    sendJSON(res, 404, { message: 'Not found' });
  } catch (error) {
    console.error('Unexpected server error', error);
    sendJSON(res, 500, { message: 'Internal server error' });
  }
});

server.listen(PORT, () => {
  console.log(`Backend API server running on http://localhost:${PORT}`);
});

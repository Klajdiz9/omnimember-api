import { WebSocket, WebSocketServer } from 'ws';
import { Server } from 'http';
import jwt from 'jsonwebtoken';

let wss: WebSocketServer;

interface ClientWebSocket extends WebSocket {
  brandId?: string;
}

export const initWebSocket = (server: Server) => {
  wss = new WebSocketServer({ server, path: '/ws' });

  wss.on('connection', (ws: ClientWebSocket, request) => {
    try {
      const url = new URL(request.url || '', `http://${request.headers.host}`);
      const token = url.searchParams.get('token');

      if (!token) {
        ws.close(1008, 'Token required');
        return;
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecret_change_in_production') as any;
      ws.brandId = decoded.brandId;

      console.log(`WS Client connected for brand: ${ws.brandId}`);

      ws.on('close', () => {
        console.log('WS Client disconnected');
      });
    } catch (e) {
      ws.close(1008, 'Invalid token');
    }
  });
};

export const broadcastCheckin = (brandId: string, payload: any) => {
  if (!wss) return;

  const message = JSON.stringify({
    event: 'new_checkin',
    payload,
  });

  wss.clients.forEach((client: ClientWebSocket) => {
    if (client.readyState === WebSocket.OPEN && client.brandId === brandId) {
      client.send(message);
    }
  });
};

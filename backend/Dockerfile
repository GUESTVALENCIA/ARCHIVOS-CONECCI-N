# Dockerfile — GV Realtime Bridge
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 8787
ENV NODE_ENV=production
CMD ["node", "realtime-webrtc-bridge.js"]

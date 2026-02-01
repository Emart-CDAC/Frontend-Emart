# Frontend Dockerfile (FIXED VERSION)

FROM node:22-alpine

WORKDIR /app

# Copy only package files first (better cache)
COPY package.json package-lock.json* ./

RUN npm install

# Copy rest of source
COPY . .

# Accept build argument for API URL
ARG VITE_API_URL=http://localhost:8080
ENV VITE_API_URL=$VITE_API_URL

# Build frontend (this creates dist/)
RUN npm run build

# Expose preview port
EXPOSE 3000

# Run preview server
CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0"]

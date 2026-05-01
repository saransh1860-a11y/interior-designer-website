# use Node.js 20 or later
FROM node:20-slim

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all files
COPY . .

# Build the frontend assets
RUN npm run build

# Expose the port (Render will override this)
EXPOSE 3000

# Start the server
CMD ["npm", "start"]

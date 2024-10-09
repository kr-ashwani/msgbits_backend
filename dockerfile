# Use Node.js 20 Alpine as the base image
FROM node:20-alpine

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the application
RUN npm run build

# Expose the port 
EXPOSE 8080

# Set NODE_ENV
ENV NODE_ENV=production

# Start the application
CMD ["npm", "start"]
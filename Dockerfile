# Use an official Node.js runtime as the base image
FROM node:14

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install application dependencies
RUN npm install

# Copy the rest of the application code to the working directory
COPY . .

# Expose any necessary ports (if your application requires it)
# EXPOSE 3000

# Define the command to start your application (use "rraf" script)
CMD ["npm", "run", "rraf"]
 

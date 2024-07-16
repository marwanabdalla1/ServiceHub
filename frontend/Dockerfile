# Use an official Node.js runtime as a parent image
FROM node:20.10.0

# Set the working directory
WORKDIR /usr/src/app

# Install the same version of npm as used locally
RUN npm install -g npm@10.5.0

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Add the correct babel plugin
RUN npm install @babel/plugin-transform-private-property-in-object --save-dev

# Build the React app
RUN npm run build

# Use nginx to serve the React app
FROM nginx:1.19
COPY --from=0 /usr/src/app/build /usr/share/nginx/html

# Expose the port the app runs on
EXPOSE 80

# Command to run nginx
CMD ["nginx", "-g", "daemon off;"]

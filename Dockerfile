# Use an official Node.js runtime as a base image
FROM --platform=linux/amd64 node:16

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy all files from the local frontend directory to the working directory in the container
COPY ./ .

# Install dependencies
RUN npm install

# Build the application
RUN npm run build

# Expose the port on which the application will run
EXPOSE 3000

# Specify the command to run your application
CMD ["npm", "start"]

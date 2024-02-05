# Use an official Node.js runtime as a base image
FROM --platform=linux/amd64 node:16

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy all files from the local frontend directory to the working directory in the container
COPY ./ .

# Install dependencies
RUN npm install

RUN apt-get update && apt-get install -y nginx

RUN apt-get install -y certbot python3-certbot-nginx

COPY ./default /etc/nginx/sites-available/default

# Build the application
RUN npm run build

# Expose the port on which the application will run
EXPOSE 3000

EXPOSE 80

CMD ["nginx -g 'daemon off;' & certbot --nginx -n --agree-tos --email mesadeayuda@yesbpo.co --redirect -d appcenteryes.com"]

# Specify the command to run your application
CMD ["npm", "start"]

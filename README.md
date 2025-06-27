# Firebase Studio

This is a NextJS starter in Firebase Studio.

To get started, take a look at src/app/page.tsx.

## Hosting on a Custom Server (like FastPanel)

While this project is configured for Firebase App Hosting, it's a standard Next.js application and can be deployed on any server that supports Node.js, including those managed by panels like FastPanel.

Here is a general guide to get you started. You may need to consult your FastPanel documentation for specific steps, especially for setting up the reverse proxy.

### 1. Get Your Code on the Server

The easiest way to manage your code is with Git. Access your server via SSH and clone your repository:

```bash
git clone <your-repository-url>
cd <your-project-directory>
```

### 2. Install Dependencies & Build

Make sure you have Node.js installed on your server (FastPanel may have a tool for this). Then, install the project dependencies and build the app for production:

```bash
# Install required packages
npm install

# Build the application
npm run build
```

### 3. Set Up Environment Variables

For the AI features to work, you need to provide your Google AI API key. Create a file named `.env.local` in the root of your project directory on the server:

```bash
# Create the environment file
touch .env.local
```

Edit this file and add your API key:

```
# .env.local
GOOGLE_API_KEY=your_google_api_key_here
NEXT_PUBLIC_ADMIN_PASSWORD=your_secret_password_here
```
**Important:** Never commit this file to Git.

### 4. Run the Application with a Process Manager

To keep your application running permanently, it's best to use a process manager like `pm2`.

```bash
# Install pm2 globally
npm install pm2 -g

# Start the Next.js app with pm2
pm2 start npm --name "inspairbet" -- start
```

This command will start your app, name it "inspairbet", and ensure it restarts automatically if it crashes or the server reboots. You can check its status with `pm2 list`.

### 5. Configure a Reverse Proxy

Your Next.js app is now running, likely on port 3000. To make it accessible to the world via your domain (e.g., `https://your-domain.com`), you need to set up a reverse proxy.

In your FastPanel dashboard, look for a "Reverse Proxy", "Proxy", or "Node.js App" section. You'll need to create a rule that forwards incoming traffic from your domain to the local address where your app is running (`http://localhost:3000`).

This setup tells the main web server (like Nginx or Apache) to pass requests for your site to your running Node.js application.

### 6. Hosting with Docker (e.g., on Unraid)

This project includes a `Dockerfile` to make it easy to deploy as a Docker container, which is a great option for Unraid.

**A. Building the Docker Image:**

First, ensure you have Docker installed on a machine (it can be your local computer or directly on Unraid via SSH). Navigate to the project's root directory and run:

```bash
docker build -t inspairbet .
```

This command builds a Docker image from the `Dockerfile` and tags it with the name `inspairbet`.

**B. Running the Container:**

To run the container, you need to provide your `.env.local` file with the `GOOGLE_API_KEY` and `NEXT_PUBLIC_ADMIN_PASSWORD`. The easiest way is to use the `--env-file` flag.

```bash
docker run -p 3000:3000 --env-file .env.local --name inspairbet-app -d inspairbet
```

*   `-p 3000:3000`: Maps port 3000 from inside the container to port 3000 on your server.
*   `--env-file .env.local`: Tells Docker to load environment variables from your `.env.local` file.
*   `--name inspairbet-app`: Gives your running container a friendly name.
*   `-d`: Runs the container in detached mode (in the background).

**C. On Unraid:**

1.  Go to the **"Docker"** tab in your Unraid dashboard.
2.  Click **"Add Container"**.
3.  You'll be presented with a template to fill out.
    *   **Name:** `inspairbet-app` (or whatever you like)
    *   **Repository:** `inspairbet` (the name you used when building the image)
    *   **Network Type:** Bridge
    *   **Port Mapping:** Click "Add another Path, Port, Variable...", set "Container Port" to `3000` and "Host Port" to `3000` (or another available port on your Unraid server).
    *   **Environment Variables:** Add a variable for `GOOGLE_API_KEY` and paste your key. Add another for `NEXT_PUBLIC_ADMIN_PASSWORD` and paste your admin password. Alternatively, if you can map a file, you can map your `.env.local` file.
4.  Click **"Apply"** to start your container.

Your app should now be accessible at `http://<your-unraid-ip>:<host-port>`. You can then use a reverse proxy like Nginx Proxy Manager (available in Community Apps) to point a domain name to it.

---

That's the general process! Each hosting panel has its own interface, but the core principles of building the app, running it with a process manager, and proxying traffic to it remain the same.

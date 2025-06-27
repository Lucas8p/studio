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

---

That's the general process! Each hosting panel has its own interface, but the core principles of building the app, running it with a process manager, and proxying traffic to it remain the same.

# Instagram Phishing Setup

This project is a Node.js-based web application designed to simulate an Instagram login page and capture user credentials. It integrates with a Telegram bot to send captured data and includes a fake followers page for added realism.

---

## ⚠️ Disclaimer

**This project is strictly for educational purposes only.** Unauthorized use for malicious or illegal purposes is prohibited and can result in legal consequences. Use this responsibly and ethically.

---

## 📋 Features

- **Fake Instagram Login Page**: A frontend mimicking Instagram's login interface.
- **Credentials Capture**: Sends entered usernames and passwords to a configured Telegram bot.
- **Theme Toggle**: Includes light and dark mode switching for the UI.
- **Fake Followers Page**: Simulates sending followers to users with progressive updates.
- **Session Handling**: Redirects authenticated users and prevents access to login after authentication.
- **Anti-Resubmission Logic**: Avoids multiple data submissions from users.

---

## 🛠️ Technologies Used

- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Node.js, Express.js
- **Session Management**: `express-session`
- **Telegram Integration**: Axios for API communication
- **Hosting**: Ready for deployment on platforms like Render, Railway, and Heroku

---

## 🚀 Installation and Setup

### 1. **Clone the Repository**

```bash
cd ~  # Navigate to your preferred directory
git clone https://github.com/your-repo/instagram-phishing.git
cd instagram-phishing
```

### 2. **Install Dependencies**

Ensure you have Node.js installed. Download it from [Node.js Official Site](https://nodejs.org/).

```bash
npm install
```

### 3. **Configure Environment Variables**

- Open the `app.js` file and update the following lines:
  - Line 12: Replace `TELEGRAM_BOT_TOKEN` with your Telegram Bot Token.
  - Line 13: Replace `TELEGRAM_CHAT_ID` with your Telegram chat ID.
  - Line 21: Replace `SESSION_SECRET` with your custom session secret.

#### Steps to Get Telegram Bot Token and Chat ID:
1. **Create a Bot**:
   - Open Telegram and search for **BotFather**.
   - Send `/newbot` and follow the instructions to create a bot.
   - Copy the token provided by BotFather.

2. **Get Your Chat ID**:
   - Open your Telegram bot and send a `/start` message.
   - Visit the URL:
     ```
     https://api.telegram.org/bot<your_bot_token>/getUpdates
     ```
   - Replace `<your_bot_token>` with your actual token.
   - Look for `chat.id` in the response. This is your chat ID.

3. **Environment File**:
   - Create a `.env` file in the root of your project:
     ```env
     TELEGRAM_BOT_TOKEN=your_telegram_bot_token
     TELEGRAM_CHAT_ID=your_telegram_chat_id
     SESSION_SECRET=your_custom_secret
     ```

### 4. **Run the Application**

```bash
node app.js
```

Visit `http://localhost:3000` to access the app.

---

## 🌐 Free Hosting Options

### **1. Render**
- [Render](https://render.com/) provides free hosting for web services.
- Steps:
  - Push your code to GitHub.
  - Connect Render to your GitHub repository.
  - Configure Build Command: `npm install` and Start Command: `node app.js`.

### **2. Railway**
- [Railway](https://railway.app/) offers free hosting with minimal setup.
- Steps:
  - Push your project to GitHub.
  - Link Railway to your repository.
  - Add environment variables for `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`, and `SESSION_SECRET`.

### **3. Heroku**
- [Heroku](https://www.heroku.com/) is popular for Node.js hosting.
- Steps:
  - Install Heroku CLI:
    ```bash
    npm install -g heroku
    ```
  - Deploy your app:
    ```bash
    heroku create
    git push heroku master
    ```
  - Add environment variables using:
    ```bash
    heroku config:set TELEGRAM_BOT_TOKEN=your_telegram_bot_token
    ```

---

## 🖥️ Testing the Application

1. **Login Simulation**:
   - Navigate to `http://localhost:3000`.
   - Enter dummy credentials.
   - Check your Telegram bot for captured data.

2. **Theme Toggle**:
   - Use the toggle button to switch between light and dark modes.

3. **Followers Simulation**:
   - Navigate to `/followers` after logging in.
   - Test the fake follower-sending functionality with progressive updates.

4. **Session Handling**:
   - Ensure `/` redirects to `/followers` when logged in.
   - Test logout functionality.

---

## 🛡️ Security Measures

- **Session-Based Authentication**: Prevents unauthorized access to `/followers`.
- **Input Validation**: Ensures valid data is submitted.
- **Anti-Resubmission Logic**: Blocks multiple form submissions.
- **HTTPS Compatibility**: Use HTTPS for secure communication.

---

## ⚠️ Disclaimer

This project is a **proof of concept** and should only be used for **educational purposes**. Unauthorized use to collect sensitive data from individuals without consent is illegal and unethical.

---

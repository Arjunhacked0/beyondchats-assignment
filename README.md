# 🚀 Intelligent Content Upgrader & AI Pipeline

<div align="center">
  <img src="https://img.shields.io/badge/Status-Active-success?style=for-the-badge&logo=statuspage" alt="Status Active" />
  <img src="https://img.shields.io/badge/AI-Gemini%20Pro-blue?style=for-the-badge&logo=google" alt="AI Gemini" />
  <img src="https://img.shields.io/badge/Frontend-React%20Vite-61DAFB?style=for-the-badge&logo=react" alt="React" />
  <img src="https://img.shields.io/badge/Backend-Node.js%20%2B%20Express-339933?style=for-the-badge&logo=nodedotjs" alt="Node.js" />
</div>

<br />

Welcome to the **Intelligent Content Upgrader**, a state-of-the-art AI pipeline designed to **Scrape**, **Analyze**, and **Enhance** web content automatically. This project leverages **Google's Gemini AI** to transform basic articles into premium, insight-rich content with a futuristic glassmorphic UI.

---

## ✨ Key Features

### 🧠 **AI-Powered Analysis**
*   **Smart Scraping**: Automatically extracts clean content from any URL using a robust scraping engine.
*   **Semantic Enhancement**: Uses **Gemini 1.5 Flash** to rewrite articles, improving clarity, tone, and depth.
*   **Fact-Checking**: Cross-references content with live Google Search results (simulated/integrated) to ensure accuracy.

### 🎨 **Futuristic UI/UX**
*   **Glassmorphism Design**: A stunning dark-mode interface with blurred glass effects and animated orbs.
*   **Real-Time Progress Bar**: A dynamic, gradient-filled progress bar that visualizes every step of the AI pipeline (Fetching → Searching → Scraping → AI Processing → Publishing).
*   **Responsive & Smooth**: Built with **React + Vite** for blazing-fast performance and buttery smooth animations.

### ⚡ **Backend & Pipeline**
*   **Node.js Microservices**: A dedicated LLM pipeline that handles heavy AI tasks asynchronously.
*   **SSE (Server-Sent Events)**: Real-time communication between the backend and frontend to stream logs instantly.
*   **Robust Error Handling**: Fallback "Simulation Modes" ensure the user always gets a result, even if external APIs hiccup.

---

## 🛠️ Tech Stack

| Component | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | ![React](https://img.shields.io/badge/-React-61DAFB?logo=react&logoColor=white) ![Vite](https://img.shields.io/badge/-Vite-646CFF?logo=vite&logoColor=white) | Modern interactive UI with Hooks and CSS Animations. |
| **Backend** | ![Node.js](https://img.shields.io/badge/-Node.js-339933?logo=nodedotjs&logoColor=white) ![Express](https://img.shields.io/badge/-Express-000000?logo=express&logoColor=white) | REST API & SSE streaming server. |
| **AI Engine** | ![Gemini](https://img.shields.io/badge/-Google%20Gemini-4285F4?logo=google&logoColor=white) | The brain behind the content enhancement. |
| **Database** | ![MySQL](https://img.shields.io/badge/-MySQL-4479A1?logo=mysql&logoColor=white) | Stores articles, metadata, and version history. |

---

## 📸 Snapshots

### 1. **The Dashboard**
*A sleek grid of articles waiting to be enhanced.*

### 2. **Real-Time Enhancement**
*Watch the AI work in real-time with live logs and a 1-100% progress tracker.*
> *"Fetching Article... Searching Web... Generative AI Processing... DONE!"*

---

## 🚀 Getting Started

### Prerequisites
*   Node.js (v16+)
*   MySQL Database
*   Google Gemini API Key

### Installation

1.  **Clone the Repo**
    ```bash
    git clone https://github.com/Vinaykumarmahato/Intelligent-Content-Upgrader.git
    cd Intelligent-Content-Upgrader
    ```

2.  **Setup Backend**
    ```bash
    cd backend-laravel
    npm install
    # Setup .env file with DB creds
    node setup-db.js  # Initialize Database
    node real-server.js # Start Server
    ```

3.  **Setup Frontend**
    ```bash
    cd frontend-react
    npm install
    npm run dev
    ```

4.  **Enjoy!**
    Open `http://localhost:5174` and start enhancing content!

---

## 🤝 Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

---

<div align="center">
  <h3>Made with ❤️ by Vinay Kumar Mahato</h3>
  <p><i> Transforming the web, one article at a time.</i></p>
</div>

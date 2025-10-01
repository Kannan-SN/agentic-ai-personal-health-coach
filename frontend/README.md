# Wellness coach Frontend

The **frontend** is the user-facing web application of the Wellness coach. It provides an intuitive, responsive interface for users to explore AI-powered career insights and manage their profiles. This app is built with modern web technologies and is designed for seamless integration with the Wellness coach backend services.

***

## Features

- Clean, interactive UI for career path exploration
- Seamless API integration with CareerGen services
- Configurable via environment variables (`local.env`)
- Local development with fast refresh and debugging support

***

## Environment Variables (`local.env`)

Create a file named `local.env` in the `frontend` directory with the following contents:

```env
VITE_MODE=development
VITE_USER_URL=http://localhost:5001/api
VITE_AGENT_URL=http://localhost:5000/api
```

> **Note:**
> Set `VITE_USER_URL` and `VITE_AGENT_URL` to the URLs of your respective backend services.

***

## Running the Frontend Locally (Without Docker)

1. **Clone the repository**

```bash
git clone https://github.com/Kannan-SN/agentic-ai-personal-health-coach.git
```

2. **Navigate to the frontend directory**

```bash
cd frontend
```

3. **Create and configure the environment file**

```bash
touch local.env
# Paste the env template above and set your values.
```

4. **Ensure Node.js v22 is installed**
5. **Install dependencies**

```bash
npm i
```

6. **Start the development server**

```bash
npm run dev
```

7. The app should now be accessible, typically at [http://localhost:5173](http://localhost:5173) unless otherwise specified in your output.

***

## Project Structure

```
agentic-ai-personal-health-coach/
│
└── frontend/
    ├── src/
    ├── public/
    ├── ... (other frontend files)
    └── local.env
```


***

## Contributing

- Pull requests and feature suggestions are welcome!
- Fork the repository and open a PR.

***

\

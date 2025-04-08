# Beer Pong Tournament Admin 🏓

A modern web application for managing beer pong tournaments, built with Angular and TypeScript.

## Application Architecture

This is a fully client-side application with no backend server required. All data is stored locally in the browser's localStorage, making it simple to deploy and use without any database setup.

### Data Storage

- Tournament data is stored in the browser's localStorage
- No external database or server required
- Data persists across browser sessions
- Each tournament stores:
  - Tournament details (name, date, description)
  - Teams and their properties
  - Match results and scores
  - Group and knockout phase information
- Note: Clearing browser data will remove all tournament information

## Features

- Create and manage tournaments
- Add and organize teams
- Track match scores in real-time
- Support for group stages and knockout rounds
- Automatic progression system
- Responsive design for all devices
- German localization

## Tech Stack

- Angular 19
- TypeScript
- Angular Material
- TailwindCSS
- Docker & Nginx

## Getting Started

### Prerequisites

- Node.js 20.x or higher
- npm 10.x or higher
- Docker (for containerization)

### Development Setup

1. Clone the repository:

```bash
git clone https://github.com/yourusername/beer-pong-admin.git
cd beer-pong-admin
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm start
```

The application will be available at `http://localhost:4200`

### Docker Deployment

1. Build the Docker image:

```bash
docker build -t beer-pong-admin .
```

2. Run the container:

```bash
docker run -p 80:80 beer-pong-admin
```

The application will be available at `http://localhost`

## Features in Detail

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. Copyright (c) 2024.

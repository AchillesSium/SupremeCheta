# Supreme Cheta E-commerce Platform

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/supreme-cheta.git
cd supreme-cheta
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Set up environment variables:
```bash
cp .env.example .env
```
Then edit `.env` with your actual configuration values.

### Development

```bash
# Run in development mode
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

## Git Workflow

1. Create a new branch for your feature:
```bash
git checkout -b feature/your-feature-name
```

2. Make your changes and commit:
```bash
git add .
git commit -m "feat: your descriptive commit message"
```

3. Push your changes:
```bash
git push origin feature/your-feature-name
```

4. Create a Pull Request on GitHub

### Commit Message Guidelines

Follow [Conventional Commits](https://www.conventionalcommits.org/):
- `feat:` for new features
- `fix:` for bug fixes
- `docs:` for documentation
- `style:` for formatting changes
- `refactor:` for code refactoring
- `test:` for tests
- `chore:` for maintenance

## Project Structure

```
supreme-cheta/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   └── utils/
├── frontend/
│   ├── public/
│   ├── src/
│   └── components/
├── tests/
├── .env.example
├── .gitignore
└── package.json
```

## Environment Variables

Copy `.env.example` to `.env` and update the values:

- `PORT`: Server port (default: 3000)
- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: Secret for JWT tokens
- See `.env.example` for all required variables

## Contributing

1. Ensure you have the latest changes:
```bash
git pull origin main
```

2. Create a feature branch
3. Make your changes
4. Run tests
5. Submit a pull request

## License

[MIT License](LICENSE)
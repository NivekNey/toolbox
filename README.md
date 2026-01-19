# Developer's Toolbox

A minimalist, keyboard-first developer tools collection built with SvelteKit. Fast, reliable, and runs entirely in your browser.

## 🚀 Features

- **Base64 Encoder/Decoder** - Real-time bidirectional conversion
- **URI Encoder/Decoder** - Encode and decode URL components instantly
- **Typography Converter** - Convert between Google Docs formatting and Markdown
- **Text Diff Tool** - Character-level side-by-side comparison
- **Command Palette** - Press `⌘K` to quickly switch between tools
- **System Theme** - Automatically adapts to your light/dark mode preference
- **100% Client-Side** - No servers, no tracking, just fast tools

## 🛠️ Tech Stack

- **Framework**: [SvelteKit](https://kit.svelte.dev/) with TypeScript
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) with custom design system
- **Testing**: [Vitest](https://vitest.dev/) + [Testing Library/Svelte](https://testing-library.com/docs/svelte-testing-library/intro)
- **Build**: [Vite](https://vitejs.dev/) with static deployment
- **Deployment**: Static hosting ready (Vercel, Netlify, GitHub Pages)

## 📋 Development

### Prerequisites

- Node.js 18+
- npm or pnpm

### Getting Started

```bash
# Clone the repository
git clone https://github.com/NivekNey/toolbox.git
cd toolbox

# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm run test

# Build for production
npm run build

# Preview production build
npm run preview
```

### Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run test` - Run tests in watch mode
- `npm run test:ui` - Run tests with UI
- `npm run test:coverage` - Run tests with coverage report
- `npm run check` - Type checking with Svelte
- `npm run lint` - Lint and format code
- `npm run format` - Format code with Prettier

## 🧪 Testing

This project uses a comprehensive test-driven development approach:

- **Unit Tests** - Test utility functions and core logic
- **Component Tests** - Test Svelte components with user interactions
- **Integration Tests** - Test full user workflows
- **Coverage** - 90%+ coverage requirement for all code

Test structure:

```
tests/
├── unit/           # Pure function tests
├── components/      # Component behavior tests
├── integration/     # End-to-end workflows
└── utils/          # Test setup and utilities
```

## 🎯 Tools Overview

### Base64 Encoder/Decoder

- Real-time bidirectional conversion
- Handles Unicode characters properly
- Copy to clipboard functionality
- Error handling for invalid input

### URI Encoder/Decoder

- Encode/decode URL components safely
- Visual separation of encoded vs decoded
- Preserve special characters
- Instant feedback as you type

### Typography Converter

- Google Docs formatting ↔ Markdown
- Preserve bold, italic, links, lists
- Paste-based conversion (no external APIs)
- Format preview in real-time

### Text Diff Tool

- Character-level precision
- Side-by-side comparison view
- Syntax highlighting for code
- Copy diff results
- Performance optimized for large texts

### Command Palette

- Press `⌘K` to open
- Fuzzy search across tools
- Keyboard navigation (↑↓, Enter, Esc)
- Quick tool switching

## 🎨 Design System

The app uses a minimalist design system built on Tailwind CSS:

- **Colors**: System-aware light/dark theme
- **Typography**: System fonts with monospace for code
- **Components**: Consistent button, input, and card styles
- **Animations**: Subtle transitions and micro-interactions
- **Spacing**: Consistent 8px grid system

### Custom Components

- `.btn` - Base button class with variants
- `.input` - Consistent input styling
- `.textarea` - Textarea with monospace font
- `.card` - Content container with subtle borders

## 🚀 Deployment

This project is configured for static deployment:

### Vercel

```bash
npm run build
# Deploy to Vercel (auto-detected)
```

### Netlify

```bash
npm run build
# Deploy build/ directory to Netlify
```

### GitHub Pages

```bash
npm run build
# Deploy build/ directory to GitHub Pages
```

## 📊 Performance

- **Bundle Size**: <50KB gzipped
- **Load Time**: <1s on 3G
- **Lighthouse**: 100+ performance score
- **Keyboard First**: Full keyboard accessibility
- **No Dependencies**: All processing client-side

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-tool`)
3. Write tests for your changes
4. Ensure all tests pass (`npm run test`)
5. Check types (`npm run check`)
6. Format code (`npm run format`)
7. Commit with conventional messages
8. Push to your fork and open a PR

### Development Workflow

This project follows test-driven development:

1. **Write failing tests** first
2. **Implement minimum code** to pass tests
3. **Refactor** while keeping tests green
4. **Commit** atomic changes with descriptive messages

## 📝 License

MIT License - see [LICENSE](LICENSE) for details.

## 🙏 Acknowledgments

- [Svelte](https://svelte.dev/) - The magical UI framework
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Vitest](https://vitest.dev/) - Next-generation testing framework
- [Testing Library](https://testing-library.com/) - Testing utilities for user-centric development

## 📞 Support

Found a bug or have a feature idea?

- 🐛 [Report Bug](https://github.com/NivekNey/toolbox/issues/new?template=bug_report.md)
- 💡 [Request Feature](https://github.com/NivekNey/toolbox/issues/new?template=feature_request.md)
- 📧 [General Question](https://github.com/NivekNey/toolbox/discussions)

---

Made with ❤️ by [Kevin Yen](https://github.com/NivekNey)

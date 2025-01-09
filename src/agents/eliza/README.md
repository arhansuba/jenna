# Eliza Chatbot

A modern TypeScript implementation of the classic ELIZA chatbot, originally developed by Joseph Weizenbaum.

## Features

- Modern TypeScript implementation
- Pattern matching using regular expressions
- Contextual responses
- Command-line interface
- Easy to extend with new patterns and responses

## Installation

```bash
pnpm install
```

## Usage

### Running the CLI

```bash
pnpm start
```

### Using as a Library

```typescript
import { Eliza } from '@meme-agent/eliza';

const eliza = new Eliza();
const response = eliza.respond('Hello!');
console.log(response);
```

## Development

### Running Tests

```bash
pnpm test
```

### Building

```bash
pnpm build
```

### Type Checking

```bash
pnpm check-types
```

### Linting

```bash
pnpm lint
```

## License

MIT
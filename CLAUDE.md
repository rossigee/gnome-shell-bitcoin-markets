# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview
GNOME Shell extension for displaying cryptocurrency market prices in the top panel. Written in TypeScript with GJS bindings, supporting 30+ exchanges through a modular provider system.

## Essential Commands

### Development
```bash
make              # Build and create archive
make build        # Install deps, build dist/, create archive  
make install      # Install extension to ~/.local/share/gnome-shell/extensions/
make restart      # Restart GNOME Shell (after install)
make watch        # Watch mode for development
make prefs        # Open preferences dialog
```

### Quality Checks
```bash
make lint         # Run ESLint
make check        # TypeScript type checking
npm test          # Run Mocha tests for providers and utilities
```

### Debugging
```bash
journalctl /usr/bin/gnome-shell -f  # Monitor extension logs
```

## Architecture

### Core Components
- **`src/extension.ts`**: Main extension entry point, manages panel indicators
- **`src/prefs/prefs.ts`**: Preferences dialog for configuration
- **`src/ApiService.ts`**: Manages HTTP polling loops and subscriber notifications
- **`src/providers/`**: 30+ exchange implementations extending `BaseProvider`

### Provider Pattern
All exchanges implement `BaseProvider` with:
- `getTickers()`: Return supported trading pairs
- `getUrl()`: Build API endpoint
- `getLast()`: Extract price from API response
- `getDefaultTicker()`: Default pair for that exchange

Adding a new exchange requires creating a provider class and registering it in `ProviderLoader.ts`.

### Build System
- TypeScript compiled via Rollup to `dist/`
- Resources (schemas, translations) copied from `res/`
- Git version automatically injected into metadata
- Creates `.zip` archive for distribution

### State Management
- Uses GSettings for persistence (`org.gnome.shell.extensions.bitcoin-markets`)
- Price history maintained in memory (last 10 values)
- Per-ticker error states with rate limiting detection

## Key Development Notes
- Extension supports GNOME Shell versions 46-48
- Uses `@girs` type definitions for GNOME APIs
- i18n support with gettext (de, es, pt translations)
- "Moscow Time" feature displays price in sats format
- Test responses cached in `.cache/` to avoid API rate limits during development
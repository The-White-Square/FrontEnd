/**
 * ESLint Configuration File
 * 
 * This file configures ESLint to enforce code quality and consistency standards
 * for the Co-opy React project. It includes TypeScript support, React-specific
 * rules, and modern JavaScript standards.
 */

import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  // Ignore build output directory from linting
  globalIgnores(['dist']),
  
  {
    // Apply rules to all TypeScript and TypeScript React files
    files: ['**/*.{ts,tsx}'],
    
    // Extend from recommended configurations
    extends: [
      js.configs.recommended,           // JavaScript best practices
      tseslint.configs.recommended,    // TypeScript best practices
      reactHooks.configs['recommended-latest'], // React Hooks rules
      reactRefresh.configs.vite,       // Vite-specific React refresh rules
    ],
    
    // Language configuration
    languageOptions: {
      ecmaVersion: 2020,        // Support modern JavaScript features
      globals: globals.browser, // Browser environment globals (window, document, etc.)
    },
  },
])

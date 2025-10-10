/**
 * Vite Configuration File
 * 
 * This file configures the Vite build tool for the Co-opy React drawing game.
 * Vite is a fast build tool that provides hot module replacement during development
 * and optimized builds for production.
 */

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Vite configuration with React support and build optimizations
export default defineConfig({
  // Enable React plugin for JSX transformation and fast refresh
  plugins: [react()],
  
  // Build configuration for production
  build: {
    rollupOptions: {
      output: {
        // Manual chunk splitting for better caching and loading performance
        // This separates different libraries into their own JavaScript files
        manualChunks: {
          // Core React libraries - changes rarely, good for caching
          'react-vendor': ['react', 'react-dom'],
          
          // Konva canvas library - large but only needed on drawing page
          'konva-vendor': ['konva', 'react-konva'],
          
          // React Router for navigation - moderate size
          'router-vendor': ['react-router-dom'],
          
          // React Icons - only loads the icons we actually use
          'icons-vendor': ['react-icons/fa', 'react-icons/io']
        }
      }
    },
    
    // Allow larger chunks without warnings (1MB instead of 500KB)
    // Our game needs canvas libraries which are naturally larger
    chunkSizeWarningLimit: 1000
  }
})

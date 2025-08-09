# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a personal portfolio website for Aakash Shrestha, showcasing computational biophysics and biomedical engineering work. The site is a static HTML/CSS/JavaScript project focusing on performance, accessibility, and clean design.

## Architecture

**Tech Stack:**
- Vanilla HTML5, CSS3, JavaScript (ES6+)
- Static site with no build process or dependencies
- Form handling via Formspree integration
- Font loading: Inter, Space Grotesk, JetBrains Mono (self-hosted)

**Core Files:**
- `index.html` - Single-page application structure with semantic sections
- `styles.css` - Complete styling with CSS custom properties and responsive design
- `script.js` - Interactive functionality and animations
- `fonts.css` - Font face declarations for custom fonts

**Key Features:**
- Intersection Observer-based scroll animations
- Contact form with client-side validation
- Smooth scrolling navigation with scroll spy
- Responsive grid layouts for projects, skills, and content
- Performance optimizations (critical CSS inlined, lazy loading)

## Development Workflow

**Local Development:**
- Open `index.html` directly in browser (no build process required)
- Use browser dev tools for testing and debugging
- Test form submission using the Formspree endpoint

**Performance Considerations:**
- Critical CSS is inlined in `<head>` for faster rendering
- Non-critical CSS loaded asynchronously
- Images use lazy loading and proper sizing attributes
- Fonts are preloaded for performance

**Code Style:**
- CSS uses custom properties for consistent theming
- JavaScript uses modern ES6+ features
- Mobile-first responsive design approach
- Semantic HTML with proper ARIA labels

## Content Structure

- **Hero Section**: Introduction with animated background shapes
- **About**: Personal background with portrait image
- **Skills**: Grid of technical competencies with animated progress meters
- **Experience**: Timeline of research positions and internships
- **Projects**: Portfolio showcases with project thumbnails
- **Contact**: Form integration with Formspree and contact links

## Deployment Notes

- Static site suitable for any web server or CDN
- Currently deployed on Netlify (based on meta tags)
- No server-side processing required
- Form submissions handled by Formspree service
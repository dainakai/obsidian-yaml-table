# YAML Table for Obsidian

An Obsidian plugin that renders YAML code blocks as HTML tables for better visualization.

## Features

- Automatically transforms YAML code blocks with the language identifier (default: `yaml-table`) into HTML tables
- Real-time preview: tables update instantly as you edit the YAML code
- Supports various YAML structures:
  - Simple key-value pairs
  - Lists (both simple values and object lists)
  - Nested objects
- Customizable settings:
  - Code block language identifier
  - Option to include YAML frontmatter
  - Table style selection

## Usage

1. Create a code block in your Obsidian note like this:

````markdown
```yaml-table
title: Project Plan
tasks:
  - name: Task 1
    due: 2023-06-01
  - name: Task 2
    due: 2023-06-15
```
````

2. In Reading View or Live Preview, this code block will automatically be displayed as an HTML table.
3. Click on the table to edit the original YAML code.

## Installation

### From Community Plugins
1. Open Obsidian Settings
2. Go to "Third-party plugins" and browse Community Plugins
3. Search for "YAML Table"
4. Install and enable the plugin

### Manual Installation
1. Download the latest release `yaml-table.zip` from the releases
2. Extract it to your Obsidian vault's `.obsidian/plugins/` directory
3. Restart Obsidian and enable the plugin in settings

## Settings

The plugin settings offer the following option:

- **Code block language**: Language identifier for YAML code blocks to be rendered as tables (default: `yaml-table`)

## Examples

### Basic Key-Value

```yaml-table
title: blog_idea_parking_lot
author: dainakai
date: 2023-06-01
```

### List of Objects

```yaml-table
schedule:
  - time: Mid-May
    action: Publish blog post
  - time: Late May
    action: Host event
```

### Nested Objects

```yaml-table
project:
  name: YAML Table Plugin
  version: 1.0.0
  features:
    - table rendering
    - live preview
    - customizable styles
```

## License

This plugin is released under the MIT License.

## Development

### Prerequisites
- Node.js and npm

### Setup
1. Clone this repository
2. Run `npm install` to install dependencies
3. Run `npm run dev` to start development with hot-reload
4. Run `npm run build` to build the production version

### Testing in Obsidian
1. Build the plugin using `npm run build`
2. Copy `main.js`, `manifest.json`, and `styles/styles.css` to your Obsidian vault's plugins directory:
   `.obsidian/plugins/yaml-table/`
3. Enable the plugin in Obsidian settings
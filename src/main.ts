import {
	App,
	Plugin,
	PluginSettingTab,
	Setting,
	MarkdownPostProcessorContext,
	MarkdownView,
} from 'obsidian';
import * as yaml from 'js-yaml';

interface YAMLTableSettings {
	language: string;
	includeFrontMatter: boolean;
	tableStyle: 'default' | 'compact' | 'wide';
}

const DEFAULT_SETTINGS: YAMLTableSettings = {
	language: 'yaml-table',
	includeFrontMatter: false,
	tableStyle: 'default'
}

export default class YAMLTablePlugin extends Plugin {
	settings: YAMLTableSettings;

	async onload() {
		await this.loadSettings();

		// Register processor for real-time preview
		this.registerMarkdownCodeBlockProcessor(this.settings.language, this.yamlTableProcessor.bind(this));

		// Settings tab
		this.addSettingTab(new YAMLTableSettingTab(this.app, this));
	}

	onunload() {
		// Plugin unload actions
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	// Processor to convert YAML to HTML table
	yamlTableProcessor(source: string, el: HTMLElement, ctx: MarkdownPostProcessorContext) {
		try {
			// Parse YAML
			const data = yaml.load(source);
			
			if (data === null || typeof data !== 'object') {
				const errorDiv = document.createElement('div');
				errorDiv.textContent = 'Error: No valid YAML data found.';
				errorDiv.className = 'yaml-table-error';
				el.appendChild(errorDiv);
				return;
			}

			// Generate HTML table from data
			const table = this.createTable(data);
			
			// Apply style classes
			table.classList.add('yaml-table');
			table.classList.add(`yaml-table-style-${this.settings.tableStyle}`);
			
			// Add the generated table to DOM
			el.appendChild(table);
			
			// Add click event (click to return to source view)
			const containerEl = document.createElement('div');
			containerEl.className = 'yaml-table-container';
			el.appendChild(containerEl);
			containerEl.appendChild(table);
			
			containerEl.addEventListener('click', (event) => {
				// Switch to code block editing mode
				const view = this.app.workspace.getActiveViewOfType(MarkdownView);
				if (view) {
					// Use the context of the block being rendered
					const pos = ctx.getSectionInfo(el)?.lineStart || 0;
					if (pos) {
						view.editor.setCursor(pos);
						view.editor.focus();
					}
				}
			});
			
		} catch (e) {
			// Error handling
			const errorDiv = document.createElement('div');
			errorDiv.textContent = `YAML parsing error: ${e.message}`;
			errorDiv.className = 'yaml-table-error';
			el.appendChild(errorDiv);
		}
	}

	// Generate table according to data
	createTable(data: any): HTMLElement {
		const table = document.createElement('table');
		
		// Create table structure based on data type
		if (Array.isArray(data)) {
			// Special handling for array data
			this.createArrayTable(data, table);
		} else {
			// Create header only for object type data if needed
			const thead = document.createElement('thead');
			table.appendChild(thead);
			
			// Create table body
			const tbody = document.createElement('tbody');
			table.appendChild(tbody);
			
			// Process each key-value pair for objects
			for (const key in data) {
				const row = document.createElement('tr');
				tbody.appendChild(row);
				
				const keyCell = document.createElement('td');
				keyCell.textContent = key;
				row.appendChild(keyCell);
				
				const valueCell = document.createElement('td');
				row.appendChild(valueCell);
				this.renderValue(data[key], valueCell);
			}
		}
		
		return table;
	}

	// Table generation specifically for arrays
	createArrayTable(data: any[], table: HTMLElement) {
		if (data.length === 0) {
			return;
		}
		
		// Check if the first element is an object
		const isObjectArray = data[0] && typeof data[0] === 'object' && !Array.isArray(data[0]);
		
		if (isObjectArray) {
			// For arrays of objects, create headers from object keys
			
			// Create header if it doesn't exist
			let thead = table.querySelector('thead');
			if (!thead) {
				thead = document.createElement('thead');
				table.appendChild(thead);
			}
			
			const headerRow = document.createElement('tr');
			thead.appendChild(headerRow);
			
			// Collect unique keys from all objects
			const keys = new Set<string>();
			data.forEach(item => {
				Object.keys(item).forEach(key => keys.add(key));
			});
			
			// Add keys to header row
			keys.forEach(key => {
				const th = document.createElement('th');
				th.textContent = key;
				headerRow.appendChild(th);
			});
			
			// Create table body
			let tbody = table.querySelector('tbody');
			if (!tbody) {
				tbody = document.createElement('tbody');
				table.appendChild(tbody);
			}
			
			// Add each object's data as a row
			data.forEach(item => {
				const row = document.createElement('tr');
				tbody.appendChild(row);
				
				// Add values for each key
				keys.forEach(key => {
					const cell = document.createElement('td');
					row.appendChild(cell);
					if (key in item) {
						this.renderValue(item[key], cell);
					}
				});
			});
		} else {
			// For arrays of simple values, display as a list
			let tbody = table.querySelector('tbody');
			if (!tbody) {
				tbody = document.createElement('tbody');
				table.appendChild(tbody);
			}
			
			const row = document.createElement('tr');
			tbody.appendChild(row);
			
			const cell = document.createElement('td');
			row.appendChild(cell);
			
			const list = document.createElement('ul');
			cell.appendChild(list);
			
			data.forEach(item => {
				const li = document.createElement('li');
				list.appendChild(li);
				this.renderValue(item, li);
			});
		}
	}

	// Render based on value type
	renderValue(value: any, container: HTMLElement) {
		if (value === null || value === undefined) {
			container.textContent = '';
		} else if (typeof value === 'object' && !Array.isArray(value)) {
			// For objects, create a nested table
			const nestedTable = this.createTable(value);
			container.appendChild(nestedTable);
		} else if (Array.isArray(value)) {
			// For arrays
			if (value.length === 0) {
				container.textContent = '(empty array)';
			} else if (typeof value[0] === 'object' && !Array.isArray(value[0])) {
				// For arrays of objects, create a dedicated table
				const nestedTable = document.createElement('table');
				this.createArrayTable(value, nestedTable);
				container.appendChild(nestedTable);
			} else {
				// For arrays of simple values, create a list
				const list = document.createElement('ul');
				container.appendChild(list);
				
				// Add list items
				value.forEach(item => {
					const li = document.createElement('li');
					list.appendChild(li);
					
					// For simple values
					if (typeof item !== 'object' || item === null) {
						li.textContent = String(item);
					} else {
						this.renderValue(item, li);
					}
				});
			}
		} else {
			// For simple values, display as text
			container.textContent = String(value);
		}
	}
}

// Settings tab
class YAMLTableSettingTab extends PluginSettingTab {
	plugin: YAMLTablePlugin;

	constructor(app: App, plugin: YAMLTablePlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		containerEl.createEl('h2', {text: 'YAML Table Settings'});

		new Setting(containerEl)
			.setName('Code block language')
			.setDesc('Language identifier for YAML code blocks to be rendered as tables')
			.addText(text => text
				.setPlaceholder('yaml-table')
				.setValue(this.plugin.settings.language)
				.onChange(async (value) => {
					this.plugin.settings.language = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Include front matter')
			.setDesc('Also render YAML front matter as tables')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.includeFrontMatter)
				.onChange(async (value) => {
					this.plugin.settings.includeFrontMatter = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Table style')
			.setDesc('Visual style for rendered tables')
			.addDropdown(dropdown => dropdown
				.addOption('default', 'Default')
				.addOption('compact', 'Compact')
				.addOption('wide', 'Wide')
				.setValue(this.plugin.settings.tableStyle)
				.onChange(async (value: 'default' | 'compact' | 'wide') => {
					this.plugin.settings.tableStyle = value;
					await this.plugin.saveSettings();
				}));
	}
}
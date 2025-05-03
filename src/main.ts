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
}

const DEFAULT_SETTINGS: YAMLTableSettings = {
	language: 'yaml-table',
}

export default class YAMLTablePlugin extends Plugin {
	settings: YAMLTableSettings;

	async onload() {
		await this.loadSettings();
		this.registerMarkdownCodeBlockProcessor(this.settings.language, this.yamlTableProcessor.bind(this));
		this.addSettingTab(new YAMLTableSettingTab(this.app, this));
	}

	onunload() {}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	// Processor to convert YAML to HTML table or list
	yamlTableProcessor(source: string, el: HTMLElement, ctx: MarkdownPostProcessorContext) {
		try {
			const data = yaml.load(source);

			let renderedElement: HTMLElement | null = null;

			if (Array.isArray(data)) {
				// Handle top-level array data
				renderedElement = this.createHTMLElementForArray(data);
			} else if (data !== null && typeof data === 'object') {
				// Handle top-level object data
				renderedElement = this.createTableFromObject(data as Record<string, unknown>);
			}

			// Add .yaml-table class if the rendered element is a TABLE
			if (renderedElement instanceof HTMLTableElement) {
				renderedElement.classList.add('yaml-table');
			}

			if (renderedElement) {
				// Add the generated element to DOM within a container for click handling
				const containerEl = document.createElement('div');
				containerEl.className = 'yaml-table-container'; // Keep container for consistent styling/handling
				containerEl.appendChild(renderedElement);
				el.appendChild(containerEl);

				containerEl.addEventListener('click', (event) => {
					// Switch to code block editing mode
					const view = this.app.workspace.getActiveViewOfType(MarkdownView);
					if (view) {
						const pos = ctx.getSectionInfo(el)?.lineStart;
						if (pos !== undefined) { // Check if pos is defined
							view.editor.setCursor(pos);
							view.editor.focus();
						}
					}
				});
			} else {
				// Handle cases where data is not object/array or is empty
				const infoDiv = document.createElement('div');
				infoDiv.textContent = 'No data to display or unsupported data type.';
				infoDiv.className = 'yaml-table-info'; // Use a different class for info messages
				el.appendChild(infoDiv);
			}

		} catch (e: unknown) { // Use unknown for better type safety
			// Error handling
			const errorDiv = document.createElement('div');
			if (e instanceof Error) {
				errorDiv.textContent = `YAML parsing error: ${e.message}`;
			} else {
				errorDiv.textContent = `An unknown error occurred during YAML processing.`;
			}
			errorDiv.className = 'yaml-table-error';
			el.appendChild(errorDiv);
		}
	}

	// Creates a TABLE element specifically for JS objects (key-value pairs)
	createTableFromObject(data: Record<string, unknown>): HTMLTableElement | null {
		if (Object.keys(data).length === 0) {
			return null; // Return null for empty objects
		}

		const table = document.createElement('table');
		const tbody = table.createTBody();

		for (const key in data) {
			if (Object.prototype.hasOwnProperty.call(data, key)) {
				const row = tbody.insertRow();

				const keyCell = document.createElement('th');
				keyCell.setAttribute('scope', 'row');
				keyCell.textContent = key;
				row.appendChild(keyCell);

				const valueCell = row.insertCell();
				// Explicitly pass the object's value to renderValue
				this.renderValue(data[key], valueCell);
			}
		}
		return table;
	}

	// Creates a TABLE (for object arrays) or UL (for simple arrays)
	createHTMLElementForArray(data: unknown[]): HTMLElement | null {
		if (data.length === 0) {
			// Optionally return an element indicating emptiness, or null
			const emptyMsg = document.createElement('span');
			emptyMsg.textContent = '(empty array)';
			return emptyMsg;
			// return null; // Or return null if nothing should be displayed
		}

		const firstItem = data[0];
		const isObjectArray = firstItem !== null && typeof firstItem === 'object' && !Array.isArray(firstItem);

		if (isObjectArray) {
			// Array of objects -> create table
			const table = document.createElement('table');
			// Collect unique keys from all objects
			const keys = new Set<string>();
			data.forEach(item => {
				if (typeof item === 'object' && item !== null) {
					Object.keys(item).forEach(key => keys.add(key));
				}
			});

			if (keys.size === 0) return null; // No keys found

			// Create header
			const thead = table.createTHead();
			const headerRow = thead.insertRow();
			keys.forEach(key => {
				const th = document.createElement('th');
				th.textContent = key;
				headerRow.appendChild(th);
			});

			// Create table body
			const tbody = table.createTBody();
			data.forEach(item => {
				if (typeof item === 'object' && item !== null) { // Ensure item is an object
					const row = tbody.insertRow();
					const itemRecord = item as Record<string, unknown>; // Cast to access properties safely
					keys.forEach(key => {
						const cell = row.insertCell();
						if (Object.prototype.hasOwnProperty.call(itemRecord, key)) {
							this.renderValue(itemRecord[key], cell);
						} else {
							cell.textContent = ''; // Blank for missing keys
						}
					});
				}
				// Optionally handle non-object items in the array if needed
			});
			return table;

		} else {
			// Array of simple values -> create list
			const list = document.createElement('ul');
			data.forEach(item => {
				const li = document.createElement('li');
				this.renderValue(item, li); // Render each item
				list.appendChild(li);
			});
			return list;
		}
	}

	// Renders a value (primitive, object, or array) into a given container element
	renderValue(value: unknown, container: HTMLElement) {
		if (value === null || value === undefined) {
			container.textContent = ''; // Render null/undefined as empty
		} else if (Array.isArray(value)) {
			// Value is an array -> render as nested table or list
			const nestedElement = this.createHTMLElementForArray(value);
			if (nestedElement) {
				container.appendChild(nestedElement);
			} else {
				// Handle case where array resulted in null (e.g., empty array)
				container.textContent = '(empty array)'; // Or customize this message
			}
		} else if (typeof value === 'object' && value !== null) {
			// Value is an object -> render as nested table
			const nestedTable = this.createTableFromObject(value as Record<string, unknown>);
			if (nestedTable) {
				// No need to add 'yaml-nested-table' class anymore
				container.appendChild(nestedTable);
			} else {
				// Handle case where object resulted in null (e.g., empty object)
				container.textContent = '(empty object)'; // Or customize
			}
		} else {
			// Handle simple values (string, number, boolean)
			container.textContent = String(value);
		}
	}
}

// Settings tab (No changes needed here for now)
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
					if (value.trim()) {
						this.plugin.settings.language = value.trim();
						await this.plugin.saveSettings();
					}
				}));
	}
}
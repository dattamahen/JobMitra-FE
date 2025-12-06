const fs = require('fs');
const path = require('path');

const extensions = ['.ts', '.html', '.css', '.scss', '.json'];
const excludeDirs = ['node_modules', 'dist', '.angular', '.git'];

function convertSpacesToTabs(filePath) {
	try {
		let content = fs.readFileSync(filePath, 'utf8');
		const lines = content.split('\n');
		const converted = lines.map(line => {
			const match = line.match(/^( +)/);
			if (match) {
				const spaces = match[1].length;
				const tabs = '\t'.repeat(Math.floor(spaces / 2));
				return tabs + line.slice(spaces);
			}
			return line;
		});
		fs.writeFileSync(filePath, converted.join('\n'), 'utf8');
		console.log(`✓ Converted: ${filePath}`);
	} catch (err) {
		console.error(`✗ Error converting ${filePath}:`, err.message);
	}
}

function walkDir(dir) {
	const files = fs.readdirSync(dir);
	files.forEach(file => {
		const filePath = path.join(dir, file);
		const stat = fs.statSync(filePath);
		
		if (stat.isDirectory()) {
			if (!excludeDirs.includes(file)) {
				walkDir(filePath);
			}
		} else if (extensions.some(ext => file.endsWith(ext))) {
			convertSpacesToTabs(filePath);
		}
	});
}

console.log('Converting spaces to tabs...\n');
walkDir(path.join(__dirname, 'src'));
console.log('\n✓ Conversion complete!');

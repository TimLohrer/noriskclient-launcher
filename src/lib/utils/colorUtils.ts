export function hexToRGB(color: string): number[] {
    // Handle CSS variable
    if (color.startsWith('var(')) {
        const varName = color.slice(4, -1).trim();
        color = getComputedStyle(document.body).getPropertyValue(varName).trim();
    }

    // Remove '#' if present
    if (color.startsWith('#')) {
        color = color.slice(1);
    }

    // Expand shorthand (#abc -> #aabbcc)
    if (color.length === 3) {
        color = color.split('').map(c => c + c).join('');
    }

    let r = parseInt(color.substring(0, 2), 16);
    let g = parseInt(color.substring(2, 4), 16);
    let b = parseInt(color.substring(4), 16);

    return [r, g, b];
}
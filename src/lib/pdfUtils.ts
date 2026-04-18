/**
 * Parse a user-supplied page range string like "1-5,7,9-12"
 * into an array of 0-based page indices.
 *
 * @param range  The raw string input from the user.
 * @param total  Total number of pages in the document.
 */
export function parsePageRange(range: string, total: number): number[] {
    const pages: Set<number> = new Set();
    const parts = range.split(",").map((s) => s.trim()).filter(Boolean);

    for (const part of parts) {
        if (part.includes("-")) {
            const [startStr, endStr] = part.split("-");
            const start = parseInt(startStr.trim(), 10);
            const end = parseInt(endStr.trim(), 10);
            if (!isNaN(start) && !isNaN(end)) {
                for (let i = Math.max(1, start); i <= Math.min(total, end); i++) {
                    pages.add(i - 1); // convert to 0-based
                }
            }
        } else {
            const page = parseInt(part, 10);
            if (!isNaN(page) && page >= 1 && page <= total) {
                pages.add(page - 1); // convert to 0-based
            }
        }
    }

    return Array.from(pages).sort((a, b) => a - b);
}

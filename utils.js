
export function createSlug(text) {
    if (!text) return '';
    return text
        .toString()
        .toLowerCase()
        .replace(/\s+/g, '')       // Remove espaços
        .replace(/[^\w\-]+/g, '')   // Remove caracteres especiais
        .replace(/\-\-+/g, '-')     // Remove hífens duplicados
        .trim();
}
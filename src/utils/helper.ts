export const generateDisplayCode = (id: number, prefix: string = '#') => {
    const random = Math.floor((id * 98765) % 1000000).toString(36).toUpperCase();
    return `${prefix}-${random}`;
};
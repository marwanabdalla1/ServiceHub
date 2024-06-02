export function generateId(): string {
    const timestamp: number = new Date().getTime();
    const random: number = Math.floor(Math.random() * 10000);
    const id: string = timestamp.toString() + random.toString();

    return id;
}

export interface Event {
    id: string;
    dateTime: Date;
    description: string;
    imageUrl?: string;
    name: string;
    organizerId: string;
    position: {
        latitude: number;
        longitude: number;
    };
    volunteersNeeded: number;
    volunteersIds: string[];
}

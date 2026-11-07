export interface Equipment {
    _id: string;
    name: string;
    category: string;
    description: string;
    quantity: number;
    rentalRate: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}
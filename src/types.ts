// src/types.ts

export type UserRole = 'PLAYER' | 'ADMIN';

export interface User {
    id: string;
    email: string;
    username: string;
}

export interface AuthResponse {
    token: string;
    user: User;
}

export interface Association {
    id: string;
    name: string;
    description: string;
    userRole: UserRole;
    memberCount?: number;
}

export interface WeeklySlot {
    id: string;
    name: string;
    dayOfWeek: string; // 'MONDAY', 'TUESDAY'...
    startTime: string;
    endTime: string;
}

export interface Room {
    id: string;
    name: string;
    description: string;
    capacity: number;
    associationId: string;
    associationName?: string;
    weeklySlots?: WeeklySlot[];
}

export type SlotStatus = 'AVAILABLE' | 'PENDING' | 'BOOKED' | 'REJECTED';

export interface CalendarSlot {
    date: string;       // ISO YYYY-MM-DD
    dayOfWeek: string;  // MONDAY, TUESDAY...
    startTime: string;
    endTime: string;
    status: SlotStatus;
    reservationId?: string | null;
    slotDefinitionId: string; // Pour lier au weeklySlot
}

export interface ReservationInput {
    roomId: string;
    date: string;
    startTime: string;
    endTime: string;
    gameName: string;
    maxPlayers: number;
}

export interface ReservationDetail {
    id: string;
    roomId: string;
    roomName: string;
    associationName: string;
    date: string;
    startTime: string;
    endTime: string;
    status: SlotStatus;
    gameName: string;
    maxPlayers: number;
}
// src/services/api.mock.ts
import type { Association, Room, User, CalendarSlot, ReservationInput, ReservationDetail } from '../types';

// --- 1. DONNÉES UTILISATEURS & RÔLES ---

const MOCK_USERS: User[] = [
    { id: 'u_admin', email: 'admin@test.com', username: 'Gandalf (Admin)' },
    { id: 'u_player', email: 'player@test.com', username: 'Frodon (Joueur)' }
];

// Source de vérité des associations
const ALL_ASSOCS = [
    { id: 'a1', name: "L'Ordre du D20", description: "Association de JdR historique.", memberCount: 50 },
    { id: 'a2', name: "Les Aventuriers du Dimanche", description: "Pour les casuals.", memberCount: 12 }
];

// Configuration des rôles par utilisateur
const USER_ASSOC_ROLES: Record<string, Association[]> = {
    'u_admin': [
        { ...ALL_ASSOCS[0], userRole: 'ADMIN' },
        { ...ALL_ASSOCS[1], userRole: 'PLAYER' }
    ],
    'u_player': [
        { ...ALL_ASSOCS[0], userRole: 'PLAYER' }
    ]
};

// --- GESTION DE SESSION (Persistance au refresh) ---
const storedUserStr = localStorage.getItem('user');
const storedUser = storedUserStr ? JSON.parse(storedUserStr) : null;
let connectedUserId: string | null = storedUser ? storedUser.id : null;

// --- 2. DONNÉES SALLES & RÉSERVATIONS ---

const MOCK_ROOMS: Room[] = [
    {
        id: 'r1', name: 'La Taverne', capacity: 5, associationId: 'a1', description: 'Ambiance boisée',
        weeklySlots: [{ id: 's1', name: 'Soirée', dayOfWeek: 'FRIDAY', startTime: '19:00', endTime: '23:00' }]
    },
    { id: 'r2', name: 'Le Donjon', capacity: 8, associationId: 'a1', description: 'Grande table', weeklySlots: [] }
];

// Données initiales avec roomName dénormalisé
let MOCK_RESERVATIONS: any[] = [
    {
        id: 'res1', roomId: 'r1', roomName: 'La Taverne',
        date: '2026-01-20', startTime: '19:00', status: 'BOOKED',
        userId: 'u_player', gameName: 'D&D One Shot'
    },
    {
        id: 'res2', roomId: 'r1', roomName: 'La Taverne',
        date: '2026-01-23', startTime: '19:00', status: 'PENDING',
        userId: 'u_player', gameName: 'Cthulhu'
    }
];

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const ApiService = {

    // --- AUTHENTIFICATION ---
    login: async (email: string, password: string) => {
        await delay(800);

        const user = MOCK_USERS.find(u => u.email === email);
        if (!user) throw new Error('Identifiants incorrects (Essayez admin@test.com ou player@test.com)');

        connectedUserId = user.id;

        return { token: `fake-jwt-${user.username}`, user: user };
    },

    // --- ASSOCIATIONS ---
    getAssociations: async () => {
        await delay(600);
        // Si aucun user connecté, on renvoie admin par défaut pour éviter de casser l'UI en dev, 
        // ou un tableau vide pour être strict.
        if (!connectedUserId || !USER_ASSOC_ROLES[connectedUserId]) {
            return USER_ASSOC_ROLES['u_admin'];
        }
        return USER_ASSOC_ROLES[connectedUserId];
    },

    // --- SALLES ---
    getRooms: async (associationId: string) => {
        await delay(600);
        return MOCK_ROOMS.filter(r => r.associationId === associationId);
    },

    getRoomDetails: async (id: string) => {
        await delay(400);
        const room = MOCK_ROOMS.find(r => r.id === id);
        if (!room) throw new Error('Salle introuvable');
        return room;
    },

    // --- DISPONIBILITÉS ---
    getAvailability: async (roomId: string, startOfWeekDate: Date): Promise<CalendarSlot[]> => {
        await delay(500);
        const room = MOCK_ROOMS.find(r => r.id === roomId);
        if (!room || !room.weeklySlots) return [];

        const slots: CalendarSlot[] = [];

        for (let i = 0; i < 7; i++) {
            const currentDate = new Date(startOfWeekDate);
            currentDate.setDate(startOfWeekDate.getDate() + i);
            const dateStr = currentDate.toISOString().split('T')[0];
            const dayName = currentDate.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();

            const dailyDefs = room.weeklySlots.filter(s => s.dayOfWeek === dayName);

            dailyDefs.forEach(def => {
                const existingRes = MOCK_RESERVATIONS.find(
                    res => res.roomId === roomId && res.date === dateStr && res.startTime === def.startTime && res.status !== 'REJECTED'
                );

                let status: 'AVAILABLE' | 'PENDING' | 'BOOKED' = 'AVAILABLE';
                if (existingRes) status = existingRes.status as any;

                slots.push({
                    date: dateStr,
                    dayOfWeek: dayName,
                    startTime: def.startTime,
                    endTime: def.endTime,
                    status: status,
                    reservationId: existingRes?.id,
                    slotDefinitionId: def.id
                });
            });
        }
        return slots;
    },

    // --- CRÉATION RÉSERVATION ---
    createReservation: async (data: ReservationInput) => {
        await delay(800);

        const conflict = MOCK_RESERVATIONS.find(
            r => r.roomId === data.roomId && r.date === data.date && r.startTime === data.startTime && r.status === 'BOOKED'
        );

        if (conflict) throw new Error("Ce créneau n'est plus disponible.");

        // Récupération du nom de la salle pour stockage
        const room = MOCK_ROOMS.find(r => r.id === data.roomId);
        if (!room) throw new Error("Salle introuvable");

        const newRes = {
            id: 'res-' + Math.random().toString(36).substr(2, 9),
            roomId: data.roomId,
            roomName: room.name, // Stockage en dur
            date: data.date,
            startTime: data.startTime,
            status: 'PENDING',
            userId: connectedUserId || 'u_player',
            gameName: data.gameName,
            maxPlayers: data.maxPlayers
        };

        MOCK_RESERVATIONS.push(newRes);
        return newRes;
    },

    // --- MES PARTIES ---
    getMyReservations: async (): Promise<ReservationDetail[]> => {
        await delay(600);

        let myResas = MOCK_RESERVATIONS;
        if (connectedUserId) {
            myResas = MOCK_RESERVATIONS.filter(r => r.userId === connectedUserId);
        }

        return myResas.map(res => {
            const room = MOCK_ROOMS.find(r => r.id === res.roomId);
            const assoc = ALL_ASSOCS.find(a => a.id === room?.associationId);

            return {
                id: res.id,
                roomId: res.roomId,
                roomName: res.roomName || room?.name || 'Salle inconnue',
                associationName: assoc?.name || 'Association inconnue',
                date: res.date,
                startTime: res.startTime,
                endTime: '23:00',
                status: res.status as any,
                gameName: res.gameName || 'Partie de JdR',
                maxPlayers: 5
            };
        }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    },

    // --- ADMIN (Filtré par droits) ---
    getPendingReservations: async (): Promise<ReservationDetail[]> => {
        await delay(600);

        // 1. Récupérer les assos gérées par l'utilisateur connecté
        const userAssocs = USER_ASSOC_ROLES[connectedUserId || ''] || [];

        // 2. Extraire les IDs des assos où il est ADMIN
        const adminAssocIds = userAssocs
            .filter(a => a.userRole === 'ADMIN')
            .map(a => a.id);

        // 3. Filtrer les réservations : 
        //    - Statut PENDING
        //    - ET la salle appartient à une asso dont l'user est ADMIN
        const pending = MOCK_RESERVATIONS.filter(r => {
            if (r.status !== 'PENDING') return false;

            const room = MOCK_ROOMS.find(room => room.id === r.roomId);
            const assocId = room?.associationId;

            // Si on ne trouve pas l'asso ou si l'user n'en est pas admin, on cache
            return assocId && adminAssocIds.includes(assocId);
        });

        return pending.map(res => {
            const room = MOCK_ROOMS.find(r => r.id === res.roomId);
            const assoc = ALL_ASSOCS.find(a => a.id === room?.associationId);

            return {
                id: res.id,
                roomId: res.roomId,
                roomName: res.roomName || room?.name || 'Unknown',
                associationName: assoc?.name || 'Unknown',
                date: res.date,
                startTime: res.startTime,
                endTime: '23:00',
                status: res.status as any,
                gameName: res.gameName || 'Partie sans titre',
                maxPlayers: 5
            };
        });
    },

    // --- ACTIONS ADMIN ---
    updateReservationStatus: async (id: string, status: 'BOOKED' | 'REJECTED') => {
        await delay(500);
        const resIndex = MOCK_RESERVATIONS.findIndex(r => r.id === id);
        if (resIndex === -1) throw new Error("Réservation introuvable");

        MOCK_RESERVATIONS[resIndex].status = status;
        return MOCK_RESERVATIONS[resIndex];
    }
};
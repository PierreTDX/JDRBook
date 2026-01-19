// src/pages/RoomList.tsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ApiService } from '../services/api.mock';
import type { Room } from '../types';

export default function RoomList() {
    const { id } = useParams<{ id: string }>(); // Récupère l'ID de l'URL
    const navigate = useNavigate();
    const [rooms, setRooms] = useState<Room[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            ApiService.getRooms(id)
                .then(data => setRooms(data))
                .finally(() => setLoading(false));
        }
    }, [id]);

    return (
        <div className="container">
            <button
                onClick={() => navigate('/associations')}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', marginBottom: '15px' }}
            >
                ← Retour aux associations
            </button>

            <h1 style={{ marginBottom: '20px' }}>Salles disponibles</h1>

            {loading ? (
                <div>Chargement des salles...</div>
            ) : (
                <div className="grid">
                    {rooms.map(room => (
                        <div key={room.id} className="card">
                            <h3>{room.name}</h3>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Capacité : {room.capacity} joueurs</p>
                            <p style={{ margin: '10px 0' }}>{room.description}</p>
                            <button className="btn btn-primary" onClick={() => navigate(`/rooms/${room.id}`)}>
                                Voir le planning
                            </button>
                        </div>
                    ))}
                    {rooms.length === 0 && <p>Aucune salle dans cette association.</p>}
                </div>
            )}
        </div>
    );
}
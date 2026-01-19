import { useEffect, useState } from 'react';
import { ApiService } from '../services/api.mock';
import type { ReservationDetail } from '../types';
import { formatDateFr } from '../utils/dateUtils';

export default function PlayerDashboard() {
    const [reservations, setReservations] = useState<ReservationDetail[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadReservations();
    }, []);

    const loadReservations = () => {
        ApiService.getMyReservations()
            .then(data => setReservations(data))
            .finally(() => setLoading(false));
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'PENDING': return 'En attente';
            case 'BOOKED': return 'Confirmée';
            case 'REJECTED': return 'Refusée';
            default: return status;
        }
    };

    if (loading) return <div className="container">Chargement de vos parties...</div>;

    return (
        <div className="container">
            <h1 style={{ marginBottom: '20px' }}>Mes Parties</h1>

            {reservations.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
                    <p>Vous n'avez aucune partie prévue.</p>
                    <a href="/associations" className="btn btn-primary" style={{ marginTop: '10px', display: 'inline-block' }}>
                        Trouver une table
                    </a>
                </div>
            ) : (
                <div className="dashboard-grid">
                    {reservations.map(res => (
                        <div key={res.id} className="card">
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{res.associationName}</span>
                                <span className={`status-badge badge-${res.status}`}>
                                    {getStatusLabel(res.status)}
                                </span>
                            </div>

                            <h3>{res.gameName}</h3>
                            <p style={{ margin: '10px 0' }}>
                                📅 {formatDateFr(res.date)} <br />
                                ⏰ {res.startTime} - {res.endTime} <br />
                                📍 {res.roomName}
                            </p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
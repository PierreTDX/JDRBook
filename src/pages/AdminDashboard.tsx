import { useEffect, useState } from 'react';
import { ApiService } from '../services/api.mock';
import type { ReservationDetail } from '../types';
import { formatDateFr } from '../utils/dateUtils';

export default function AdminDashboard() {
    const [pendingList, setPendingList] = useState<ReservationDetail[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    useEffect(() => {
        loadPending();
    }, []);

    const loadPending = () => {
        ApiService.getPendingReservations()
            .then(data => setPendingList(data))
            .finally(() => setLoading(false));
    };

    const handleAction = async (id: string, status: 'BOOKED' | 'REJECTED') => {
        if (!window.confirm(status === 'BOOKED' ? "Valider cette demande ?" : "Rejeter cette demande ?")) return;

        setActionLoading(id);
        try {
            await ApiService.updateReservationStatus(id, status);
            // Retirer l'élément de la liste localement pour éviter un rechargement complet
            setPendingList(prev => prev.filter(r => r.id !== id));
        } catch (err) {
            alert("Erreur lors de l'action");
        } finally {
            setActionLoading(null);
        }
    };

    if (loading) return <div className="container">Chargement des demandes...</div>;

    return (
        <div className="container">
            <h1 style={{ marginBottom: '20px' }}>Administration : Demandes en attente</h1>

            {pendingList.length === 0 ? (
                <p>Aucune demande de réservation à traiter pour le moment.</p>
            ) : (
                <div className="dashboard-grid">
                    {pendingList.map(res => (
                        <div key={res.id} className="card" style={{ borderLeft: '4px solid #f59e0b' }}>
                            <div style={{ marginBottom: '10px' }}>
                                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{res.associationName} • {res.roomName}</span>
                            </div>

                            <h3>{res.gameName}</h3>
                            <p style={{ margin: '10px 0', fontSize: '0.95rem' }}>
                                📅 <strong>{formatDateFr(res.date)}</strong><br />
                                ⏰ {res.startTime} - {res.endTime}<br />
                                👤 Organisé par : Joueur Mock
                            </p>

                            <div className="action-row">
                                <button
                                    className="btn btn-sm btn-danger"
                                    disabled={actionLoading === res.id}
                                    onClick={() => handleAction(res.id, 'REJECTED')}
                                >
                                    Rejeter
                                </button>
                                <button
                                    className="btn btn-sm btn-success"
                                    disabled={actionLoading === res.id}
                                    onClick={() => handleAction(res.id, 'BOOKED')}
                                >
                                    {actionLoading === res.id ? '...' : 'Valider'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ApiService } from '../services/api.mock';
import type { Room, CalendarSlot, ReservationInput } from '../types';
import { getStartOfWeek, addDays, formatDateFr } from '../utils/dateUtils';

export default function RoomDetails() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [room, setRoom] = useState<Room | null>(null);
    const [slots, setSlots] = useState<CalendarSlot[]>([]);
    const [currentWeek, setCurrentWeek] = useState(getStartOfWeek());
    const [loading, setLoading] = useState(true);

    // États pour la Modal
    const [selectedSlot, setSelectedSlot] = useState<CalendarSlot | null>(null);
    const [gameName, setGameName] = useState('');
    const [nbPlayers, setNbPlayers] = useState(4);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Chargement initial
    useEffect(() => {
        if (id) {
            loadData(id, currentWeek);
        }
    }, [id, currentWeek]);

    const loadData = async (roomId: string, date: Date) => {
        setLoading(true);
        try {
            const roomData = await ApiService.getRoomDetails(roomId);
            setRoom(roomData);
            const slotsData = await ApiService.getAvailability(roomId, date);
            setSlots(slotsData);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handlePrevWeek = () => setCurrentWeek(d => addDays(d, -7));
    const handleNextWeek = () => setCurrentWeek(d => addDays(d, 7));

    // Gestion de l'ouverture du formulaire
    const handleSlotClick = (slot: CalendarSlot) => {
        if (slot.status === 'AVAILABLE') {
            setSelectedSlot(slot);
            setGameName('');
            setNbPlayers(4);
        }
    };

    // Envoi de la réservation
    const handleReserve = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedSlot || !room) return;

        setIsSubmitting(true);
        try {
            const input: ReservationInput = {
                roomId: room.id,
                date: selectedSlot.date,
                startTime: selectedSlot.startTime,
                endTime: selectedSlot.endTime,
                gameName,
                maxPlayers: nbPlayers
            };

            await ApiService.createReservation(input);
            alert('Réservation envoyée ! En attente de validation.');
            setSelectedSlot(null); // Fermer modal
            loadData(room.id, currentWeek); // Recharger calendrier
        } catch (err: any) {
            alert(err.message || "Erreur");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!room && !loading) return <div className="container">Salle introuvable</div>;

    return (
        <div className="container">
            <button
                onClick={() => navigate(-1)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', marginBottom: '15px' }}>
                ← Retour
            </button>

            {room && (
                <div style={{ marginBottom: '30px' }}>
                    <h1>{room.name}</h1>
                    <p style={{ color: 'var(--text-muted)' }}>{room.description} • Capacité max: {room.capacity}</p>
                </div>
            )}

            {/* Contrôles Calendrier */}
            <div className="calendar-controls">
                <button className="btn" onClick={handlePrevWeek}>Précédent</button>
                <h3 style={{ textTransform: 'capitalize' }}>Semaine du {formatDateFr(currentWeek.toISOString())}</h3>
                <button className="btn" onClick={handleNextWeek}>Suivant</button>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '50px' }}>Chargement du planning...</div>
            ) : (
                <div className="calendar-grid">
                    {[0, 1, 2, 3, 4, 5, 6].map(offset => {
                        const date = addDays(currentWeek, offset);
                        const dateStr = date.toISOString().split('T')[0];
                        const daySlots = slots.filter(s => s.date === dateStr);
                        const dayName = date.toLocaleDateString('fr-FR', { weekday: 'long' });

                        return (
                            <div key={dateStr} className="calendar-day">
                                <div className="day-header">
                                    <div style={{ textTransform: 'capitalize' }}>{dayName}</div>
                                    <div style={{ fontSize: '0.8em', fontWeight: 'normal' }}>{date.getDate()}</div>
                                </div>

                                {daySlots.length === 0 ? (
                                    <div style={{ fontSize: '0.8rem', color: '#555', textAlign: 'center', marginTop: '20px' }}>-</div>
                                ) : (
                                    daySlots.map(slot => (
                                        <div
                                            key={slot.startTime}
                                            className={`slot-card slot-${slot.status}`}
                                            onClick={() => handleSlotClick(slot)}
                                        >
                                            <div>{slot.startTime} - {slot.endTime}</div>
                                            <div style={{ fontWeight: 'bold', fontSize: '0.75rem', marginTop: '4px' }}>
                                                {slot.status === 'AVAILABLE' ? 'LIBRE' : slot.status === 'PENDING' ? 'EN ATTENTE' : 'COMPLET'}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* MODAL DE RÉSERVATION */}
            {selectedSlot && (
                <div className="modal-overlay" onClick={() => setSelectedSlot(null)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <h2>Réserver un créneau</h2>
                        <p style={{ marginBottom: '20px', color: 'var(--text-muted)' }}>
                            {formatDateFr(selectedSlot.date)} • {selectedSlot.startTime} à {selectedSlot.endTime}
                        </p>

                        <form onSubmit={handleReserve}>
                            <div className="form-group">
                                <label className="form-label">Nom du Jeu / Scénario</label>
                                <input
                                    autoFocus
                                    className="form-input"
                                    value={gameName}
                                    onChange={e => setGameName(e.target.value)}
                                    placeholder="Ex: D&D - La mine perdue"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Nombre de joueurs max</label>
                                <input
                                    type="number"
                                    className="form-input"
                                    value={nbPlayers}
                                    onChange={e => setNbPlayers(Number(e.target.value))}
                                    min={2}
                                    max={room?.capacity || 10}
                                />
                            </div>

                            <div className="modal-actions">
                                <button type="button" className="btn" onClick={() => setSelectedSlot(null)}>Annuler</button>
                                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                                    {isSubmitting ? 'Envoi...' : 'Valider la réservation'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
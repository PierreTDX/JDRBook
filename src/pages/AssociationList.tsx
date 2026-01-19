// src/pages/AssociationList.tsx
import { useEffect, useState } from 'react';
import { ApiService } from '../services/api.mock';
import type { Association } from '../types';
import { useNavigate } from 'react-router-dom';

export default function AssociationList() {
    const navigate = useNavigate();
    const [associations, setAssociations] = useState<Association[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        ApiService.getAssociations()
            .then(data => setAssociations(data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="container">Chargement des associations...</div>;

    return (
        <div className="container">
            <h1 style={{ marginBottom: '20px' }}>Vos Associations</h1>

            {associations.length === 0 ? (
                <p>Vous n'appartenez à aucune association.</p>
            ) : (
                <div className="grid">
                    {associations.map(assoc => (
                        <div key={assoc.id} className="card">
                            <h3>{assoc.name}</h3>
                            <p style={{ color: 'var(--text-muted)', margin: '10px 0' }}>{assoc.description}</p>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{
                                    fontSize: '0.8rem',
                                    padding: '2px 8px',
                                    borderRadius: '4px',
                                    background: assoc.userRole === 'ADMIN' ? '#b91c1c' : '#047857'
                                }}>
                                    {assoc.userRole}
                                </span>
                                <button
                                    className="btn btn-primary"
                                    onClick={() => navigate(`/associations/${assoc.id}/rooms`)}
                                >
                                    Voir les salles
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
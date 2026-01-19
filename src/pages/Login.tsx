import React, { useState } from 'react';
import { ApiService } from '../services/api.mock';
import { useNavigate } from 'react-router-dom';

export default function Login() {
    const navigate = useNavigate();
    // On pré-remplit pour faciliter le test
    const [email, setEmail] = useState('admin@test.com');
    const [password, setPassword] = useState('123456');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const response = await ApiService.login(email, password);
            localStorage.setItem('token', response.token);
            // On sauvegarde aussi l'utilisateur pour l'afficher dans la Navbar
            localStorage.setItem('user', JSON.stringify(response.user));
            navigate('/associations');
        } catch (err: any) {
            setError(err.message || "Erreur de connexion");
        } finally {
            setLoading(false);
        }
    };

    const fillCredentials = (role: 'admin' | 'player') => {
        if (role === 'admin') {
            setEmail('admin@test.com');
            setPassword('admin123');
        } else {
            setEmail('player@test.com');
            setPassword('player123');
        }
    };

    return (
        <div className="container" style={{ maxWidth: '400px', marginTop: '10vh' }}>
            <div className="card">
                <h2 style={{ marginBottom: '20px', textAlign: 'center' }}>Connexion</h2>

                {/* BOUTONS D'AIDE AU DEV */}
                <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', justifyContent: 'center' }}>
                    <button type="button" onClick={() => fillCredentials('admin')} style={{ fontSize: '0.7rem', padding: '5px', cursor: 'pointer' }}>
                        Admin (Gandalf)
                    </button>
                    <button type="button" onClick={() => fillCredentials('player')} style={{ fontSize: '0.7rem', padding: '5px', cursor: 'pointer' }}>
                        Joueur (Frodon)
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Email</label>
                        <input
                            className="form-input"
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Mot de passe</label>
                        <input
                            className="form-input"
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    {error && <div style={{ color: 'var(--error)', marginBottom: '15px' }}>{error}</div>}

                    <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
                        {loading ? 'Connexion...' : 'Se connecter'}
                    </button>
                </form>
            </div>
        </div>
    );
}
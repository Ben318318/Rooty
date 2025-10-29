/**
 * Learn Page
 * Created by Gabriel (frontend-backend connection demo)
 * 
 * Displays weekly themes from the database using Nelson's rpc_get_themes() function.
 * This page demonstrates the working frontend-backend connection.
 */

import { useEffect, useState } from 'react';
import { supabase, Theme } from '../lib/supabase';
import Card, { CardHeader, CardContent, CardFooter } from '../components/Card';
import Button from '../components/Button';

export default function Learn() {
    const [themes, setThemes] = useState<Theme[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadThemes();
    }, []);

    const loadThemes = async () => {
        try {
            setLoading(true);
            setError(null);

            // Call Nelson's RPC function
            const { data, error: rpcError } = await supabase.rpc('rpc_get_themes');

            if (rpcError) {
                throw rpcError;
            }

            setThemes(data || []);
        } catch (err) {
            console.error('Error loading themes:', err);
            setError(err instanceof Error ? err.message : 'Failed to load themes');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="container" style={{ marginTop: '2rem' }}>
                <h1 style={{ marginBottom: '2rem' }}>Learn Word Roots</h1>
                <p>Loading themes...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container" style={{ marginTop: '2rem' }}>
                <h1 style={{ marginBottom: '2rem' }}>Learn Word Roots</h1>
                <Card>
                    <CardContent>
                        <p style={{ color: 'var(--color-danger)' }}>
                            Error: {error}
                        </p>
                        <p style={{ marginTop: '1rem', fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
                            Make sure you have:
                        </p>
                        <ul style={{ marginTop: '0.5rem', marginLeft: '1.5rem', fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
                            <li>Set up your Supabase credentials in .env.local</li>
                            <li>Applied the database schema (schema.sql, policies.sql, rpc.sql)</li>
                            <li>Run the seed script (npm run db:seed)</li>
                        </ul>
                        <div style={{ marginTop: '1rem' }}>
                            <Button onClick={loadThemes} size="small">
                                Try Again
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (themes.length === 0) {
        return (
            <div className="container" style={{ marginTop: '2rem' }}>
                <h1 style={{ marginBottom: '2rem' }}>Learn Word Roots</h1>
                <Card>
                    <CardContent>
                        <p>No themes available yet.</p>
                        <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
                            Run <code>npm run db:seed</code> to load sample data.
                        </p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="container" style={{ marginTop: '2rem' }}>
            <h1 style={{ marginBottom: '0.5rem' }}>Learn Word Roots</h1>
            <p style={{ marginBottom: '2rem', color: 'var(--color-text-secondary)' }}>
                Choose a weekly theme to start learning Latin and Greek roots
            </p>

            <div className="grid grid-cols-1" style={{ gap: '1.5rem', maxWidth: '800px' }}>
                {themes.map((theme) => (
                    <Card key={theme.id} clickable>
                        <CardHeader
                            title={theme.name}
                            subtitle={`Week starting ${new Date(theme.week_start).toLocaleDateString()}`}
                        />
                        <CardContent>
                            <p style={{ fontSize: '0.875rem' }}>
                                {theme.description || 'No description available'}
                            </p>
                        </CardContent>
                        <CardFooter>
                            <Button variant="primary" size="small">
                                Start Learning
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>

            <div style={{ 
                marginTop: '3rem', 
                padding: '1.5rem', 
                backgroundColor: 'var(--color-success-light)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--color-success)'
            }}>
                <h3 style={{ color: 'var(--color-success)', marginBottom: '0.5rem' }}>
                    ✓ Frontend-Backend Connection Working!
                </h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
                    This page successfully called Nelson's <code>rpc_get_themes()</code> function 
                    and retrieved {themes.length} theme(s) from the Supabase database.
                </p>
            </div>
        </div>
    );
}


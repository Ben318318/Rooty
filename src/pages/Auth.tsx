/**
 * Auth Page
 * Created by Nick
 * 
 * Login and signup forms with error handling.
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import FormField from '../components/FormField';
import TextInput from '../components/TextInput';
import Button from '../components/Button';
import Card, { CardHeader, CardContent } from '../components/Card';

export default function Auth() {
    const navigate = useNavigate();
    const { signIn, signUp } = useAuth();
    
    const [mode, setMode] = useState<'login' | 'signup'>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            if (mode === 'login') {
                const { error: signInError } = await signIn(email, password);
                
                if (signInError) {
                    throw new Error(signInError.message);
                }
                
                navigate('/learn');
            } else {
                const { error: signUpError } = await signUp(email, password, displayName);
                
                if (signUpError) {
                    throw new Error(signUpError.message);
                }
                
                navigate('/learn');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Authentication failed');
        } finally {
            setLoading(false);
        }
    };

    const toggleMode = () => {
        setMode(mode === 'login' ? 'signup' : 'login');
        setError(null);
    };

    return (
        <div className="container" style={{ 
            marginTop: '4rem',
            maxWidth: '450px'
        }}>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🌱 Rooty</h1>
                <p style={{ color: 'var(--color-text-secondary)' }}>
                    Learn Latin and Greek word roots
                </p>
            </div>

            <Card>
                <CardHeader 
                    title={mode === 'login' ? 'Welcome Back' : 'Create Account'}
                    subtitle={mode === 'login' ? 'Sign in to continue learning' : 'Start your learning journey'}
                />
                <CardContent>
                    <form onSubmit={handleSubmit}>
                        {mode === 'signup' && (
                            <FormField
                                label="Display Name"
                                htmlFor="displayName"
                                hint="How should we call you?"
                            >
                                <TextInput
                                    id="displayName"
                                    type="text"
                                    value={displayName}
                                    onChange={(e) => setDisplayName(e.target.value)}
                                    placeholder="Enter your name"
                                />
                            </FormField>
                        )}

                        <FormField
                            label="Email"
                            htmlFor="email"
                            required
                        >
                            <TextInput
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your email"
                                required
                                error={!!error}
                            />
                        </FormField>

                        <FormField
                            label="Password"
                            htmlFor="password"
                            required
                            hint={mode === 'signup' ? 'At least 6 characters' : undefined}
                        >
                            <TextInput
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter your password"
                                required
                                minLength={6}
                                error={!!error}
                            />
                        </FormField>

                        {error && (
                            <div style={{
                                padding: '0.75rem',
                                backgroundColor: 'var(--color-danger-light)',
                                color: 'var(--color-danger)',
                                borderRadius: 'var(--radius-md)',
                                fontSize: '0.875rem',
                                marginBottom: '1rem'
                            }}>
                                {error}
                            </div>
                        )}

                        <Button
                            type="submit"
                            fullWidth
                            disabled={loading || !email || !password}
                        >
                            {loading ? 'Loading...' : mode === 'login' ? 'Sign In' : 'Sign Up'}
                        </Button>
                    </form>

                    <div style={{ 
                        marginTop: '1.5rem', 
                        textAlign: 'center',
                        fontSize: '0.875rem'
                    }}>
                        <span style={{ color: 'var(--color-text-secondary)' }}>
                            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
                        </span>
                        <button
                            type="button"
                            onClick={toggleMode}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: 'var(--color-primary)',
                                cursor: 'pointer',
                                textDecoration: 'underline',
                                padding: 0,
                                font: 'inherit'
                            }}
                        >
                            {mode === 'login' ? 'Sign up' : 'Sign in'}
                        </button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}


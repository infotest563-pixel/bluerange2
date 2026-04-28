'use client';

import React from 'react';

interface State { hasError: boolean; }

export default class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
    constructor(props: { children: React.ReactNode }) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    componentDidCatch(error: Error, info: React.ErrorInfo) {
        console.error('[ErrorBoundary]', error, info);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{ padding: '40px 20px', textAlign: 'center' }}>
                    <p>Something went wrong loading this section. Please refresh the page.</p>
                </div>
            );
        }
        return this.props.children;
    }
}

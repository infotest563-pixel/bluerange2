'use client';

import { useState } from 'react';

interface DomainResult {
    domain: string;
    available: boolean;
    price?: string;
    addToCartUrl?: string;
}

export default function DomainSearch({ buttonText = 'Search Domain' }: { buttonText?: string }) {
    const [domain, setDomain] = useState('');
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<DomainResult[]>([]);
    const [searched, setSearched] = useState(false);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        const raw = domain.trim();
        if (!raw) return;

        setLoading(true);
        setResults([]);
        setSearched(false);

        try {
            const body = new URLSearchParams({
                action: 'wdc_check_domain',
                domain: raw,
                item_id: '741',
            });

            const res = await fetch(
                'https://dev-bluerange.pantheonsite.io/wp-admin/admin-ajax.php',
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: body.toString(),
                }
            );

            const json = await res.json();

            // Parse WP domain check response
            // Response can be: { success: true/false, data: [...] } or similar
            if (json && json.data && Array.isArray(json.data)) {
                setResults(json.data.map((item: any) => ({
                    domain: item.domain || raw,
                    available: item.available === true || item.status === 'available',
                    price: item.price || item.register_price || '',
                    addToCartUrl: item.add_to_cart_url || item.cart_url || '',
                })));
            } else if (json && typeof json.success !== 'undefined') {
                // Simple success/fail response
                setResults([{
                    domain: raw,
                    available: !!json.success,
                    price: json.data?.price || '',
                    addToCartUrl: json.data?.add_to_cart_url || '',
                }]);
            } else {
                setResults([{ domain: raw, available: false }]);
            }
        } catch {
            setResults([{ domain: raw, available: false }]);
        } finally {
            setLoading(false);
            setSearched(true);
        }
    };

    return (
        <div id="wdc-style" style={{ maxWidth: 900, margin: '0 auto', width: '100%' }}>
            <form onSubmit={handleSearch}>
                <div className="input-group large" style={{ maxWidth: 900 }}>
                    <input
                        type="text"
                        className="form-control"
                        autoComplete="off"
                        id="Search"
                        name="domain"
                        placeholder=""
                        value={domain}
                        onChange={(e) => setDomain(e.target.value)}
                        disabled={loading}
                    />
                    <span className="input-group-btn">
                        <button
                            type="submit"
                            id="Submit"
                            className="btn btn-default btn-info"
                            disabled={loading}
                        >
                            {loading ? 'Searching...' : buttonText}
                        </button>
                    </span>
                </div>
            </form>

            {/* Loading dots animation */}
            {loading && (
                <div id="loading" style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: 10,
                    marginTop: 20,
                }}>
                    <span className="wdc-dot-1" style={{
                        display: 'inline-block',
                        width: 10,
                        height: 10,
                        borderRadius: '50%',
                        background: '#50c1ed',
                    }} />
                    <span className="wdc-dot-2" style={{
                        display: 'inline-block',
                        width: 10,
                        height: 10,
                        borderRadius: '50%',
                        background: '#50c1ed',
                    }} />
                    <span className="wdc-dot-3" style={{
                        display: 'inline-block',
                        width: 10,
                        height: 10,
                        borderRadius: '50%',
                        background: '#50c1ed',
                    }} />
                </div>
            )}

            {/* Results */}
            {searched && !loading && results.length > 0 && (
                <div id="results" style={{ marginTop: 20 }}>
                    {results.map((item, i) => (
                        <div key={i} style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '14px 20px',
                            marginBottom: 10,
                            borderRadius: 6,
                            background: item.available
                                ? 'rgba(80,193,237,0.12)'
                                : 'rgba(255,80,80,0.08)',
                            border: `1px solid ${item.available ? '#50c1ed' : '#ff6b6b'}`,
                            flexWrap: 'wrap',
                            gap: 10,
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <span style={{
                                    fontSize: 20,
                                    fontWeight: 700,
                                    color: item.available ? '#50c1ed' : '#ff6b6b',
                                }}>
                                    {item.available ? 'yes' : 'no'}
                                </span>
                                <span style={{
                                    fontSize: 17,
                                    fontWeight: 500,
                                    color: '#fff',
                                }}>
                                    {item.domain}
                                </span>
                                <span style={{
                                    fontSize: 14,
                                    color: item.available ? '#a0e8f8' : '#ffaaaa',
                                }}>
                                    {item.available ? 'Available' : 'Not available'}
                                </span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                {item.price && (
                                    <span style={{ color: '#fff', fontWeight: 500, fontSize: 16 }}>
                                        {item.price}
                                    </span>
                                )}
                                {item.available && item.addToCartUrl && (
                                    <a
                                        href={item.addToCartUrl}
                                        className="btn"
                                        style={{
                                            padding: '8px 20px',
                                            fontSize: 14,
                                            borderRadius: 50,
                                            background: '#50c1ed',
                                            color: '#fff',
                                            border: 'none',
                                            textDecoration: 'none',
                                            display: 'inline-block',
                                        }}
                                    >
                                        Add to Cart
                                    </a>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

'use client';

import { useState } from 'react';

const WP = 'https://dev-bluerange.pantheonsite.io';
// Form ID 948 — Colocation: Request will be answered
const FORM_ID = '948';
const UNIT_TAG = `wpcf7-f${FORM_ID}-o1`;
const ENDPOINT = `${WP}/wp-json/contact-form-7/v1/contact-forms/${FORM_ID}/feedback`;

const RACK_UNITS = ['Select Rack Units', '1U', '2U', '3U', '4U', '5U'];

type Status = 'idle' | 'loading' | 'success' | 'error';

export default function CoLocationContactForm() {
    const [status, setStatus] = useState<Status>('idle');
    const [form, setForm] = useState({
        'text-201': '',
        'text-202': '',
        'text-203': '',
        'dropdown-204': 'Select Rack Units',
        'textarea-205': '',
    });

    const set = (field: string, value: string) =>
        setForm(prev => ({ ...prev, [field]: value }));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setStatus('loading');

        const body = new FormData();
        body.append('_wpcf7', FORM_ID);
        body.append('_wpcf7_version', '6.1.3');
        body.append('_wpcf7_locale', 'en_US');
        body.append('_wpcf7_unit_tag', UNIT_TAG);
        body.append('_wpcf7_container_post', '0');
        body.append('_wpcf7_posted_data_hash', '');
        body.append('text-201', form['text-201']);
        body.append('text-202', form['text-202']);
        body.append('text-203', form['text-203']);
        body.append('dropdown-204', form['dropdown-204']);
        body.append('textarea-205', form['textarea-205']);

        try {
            const res = await fetch(ENDPOINT, { method: 'POST', body });
            const json = await res.json();

            if (json.status === 'mail_sent') {
                setForm({
                    'text-201': '',
                    'text-202': '',
                    'text-203': '',
                    'dropdown-204': 'Select Rack Units',
                    'textarea-205': '',
                });
                setStatus('success');
                setTimeout(() => setStatus('idle'), 6000);
            } else {
                setStatus('error');
                setTimeout(() => setStatus('idle'), 6000);
            }
        } catch {
            setStatus('error');
            setTimeout(() => setStatus('idle'), 6000);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="s3-contact-form" data-reactform="true">
            <input type="hidden" name="_wpcf7" value={FORM_ID} />
            <input type="hidden" name="_wpcf7_version" value="6.1.3" />
            <input type="hidden" name="_wpcf7_locale" value="en_US" />
            <input type="hidden" name="_wpcf7_unit_tag" value={UNIT_TAG} />
            <input type="hidden" name="_wpcf7_container_post" value="0" />

            <div className="main-form bkp-storege">
                <div className="one-half">
                    <p>
                        <input
                            type="text"
                            name="text-201"
                            placeholder="First Name *"
                            required
                            className="wpcf7-form-control wpcf7-text wpcf7-validates-as-required"
                            value={form['text-201']}
                            onChange={e => set('text-201', e.target.value)}
                        />
                    </p>
                </div>
                <div className="one-half padd-0">
                    <p>
                        <input
                            type="text"
                            name="text-202"
                            placeholder="Last Name *"
                            required
                            className="wpcf7-form-control wpcf7-text wpcf7-validates-as-required"
                            value={form['text-202']}
                            onChange={e => set('text-202', e.target.value)}
                        />
                    </p>
                </div>
                <div className="clearfix" />
                <p>
                    <input
                        type="email"
                        name="text-203"
                        placeholder="Email Address *"
                        required
                        className="wpcf7-form-control wpcf7-email wpcf7-validates-as-required"
                        value={form['text-203']}
                        onChange={e => set('text-203', e.target.value)}
                    />
                </p>
                <p>
                    <select
                        name="dropdown-204"
                        required
                        className="wpcf7-form-control wpcf7-select wpcf7-validates-as-required"
                        value={form['dropdown-204']}
                        onChange={e => set('dropdown-204', e.target.value)}
                    >
                        {RACK_UNITS.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                        ))}
                    </select>
                </p>
                <p className="cnt7-textarea">
                    <textarea
                        name="textarea-205"
                        placeholder="Your Message"
                        rows={6}
                        className="wpcf7-form-control wpcf7-textarea"
                        value={form['textarea-205']}
                        onChange={e => set('textarea-205', e.target.value)}
                    />
                </p>
                <div className="form-btn">
                    <p>
                        <input
                            type="submit"
                            value={status === 'loading' ? 'Sending...' : 'Submit Request'}
                            disabled={status === 'loading'}
                            className="wpcf7-form-control wpcf7-submit has-spinner"
                        />
                    </p>
                </div>
            </div>

            {status === 'success' && (
                <div role="alert" style={{
                    border: '2px solid #46b450', color: '#46b450',
                    padding: '12px 20px', borderRadius: 4, fontSize: 15,
                    textAlign: 'center', marginTop: 16,
                }}>
                    Thank you! Your request will be answered within 24 hours.
                </div>
            )}
            {status === 'error' && (
                <div role="alert" style={{
                    border: '2px solid #dc3232', color: '#dc3232',
                    padding: '12px 20px', borderRadius: 4, fontSize: 15,
                    textAlign: 'center', marginTop: 16,
                }}>
                    There was an error sending your request. Please try again.
                </div>
            )}
        </form>
    );
}

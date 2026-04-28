'use client';

import { useState } from 'react';

const WP = 'https://dev-bluerange.pantheonsite.io';
const FORM_ID = '69';
const UNIT_TAG = 'wpcf7-f69-o1';
const ENDPOINT = `${WP}/wp-json/contact-form-7/v1/contact-forms/${FORM_ID}/feedback`;

type Status = 'idle' | 'loading' | 'success' | 'error';

export default function DomainsContactForm() {
    const [status, setStatus] = useState<Status>('idle');
    const [form, setForm] = useState({
        'text-101': '',   // First Name
        'text-102': '',   // Last Name
        'text-103': '',   // Email Address
        'number-104': '', // Phone number
        'text-105': '',   // Your Subject
        'text-106': '',   // Company Name
        'text-107': '',   // Which web hosting package
        'text-108': '',   // Domain question
        'textarea-109': '', // Your Messages
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
        body.append('text-101', form['text-101']);
        body.append('text-102', form['text-102']);
        body.append('text-103', form['text-103']);
        body.append('number-104', form['number-104']);
        body.append('text-105', form['text-105']);
        body.append('text-106', form['text-106']);
        body.append('text-107', form['text-107']);
        body.append('text-108', form['text-108']);
        body.append('textarea-109', form['textarea-109']);

        try {
            const res = await fetch(ENDPOINT, { method: 'POST', body });
            const json = await res.json();

            if (json.status === 'mail_sent') {
                setForm({
                    'text-101': '', 'text-102': '', 'text-103': '',
                    'number-104': '', 'text-105': '', 'text-106': '',
                    'text-107': '', 'text-108': '', 'textarea-109': '',
                });
                setStatus('success');
                setTimeout(() => setStatus('idle'), 6000);
            } else {
                console.error('[DomainsForm] CF7 response:', json);
                setStatus('error');
                setTimeout(() => setStatus('idle'), 6000);
            }
        } catch (err) {
            console.error('[DomainsForm] Error:', err);
            setStatus('error');
            setTimeout(() => setStatus('idle'), 6000);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="cu-cform" data-reactform="true">
            <input type="hidden" name="_wpcf7" value={FORM_ID} />
            <input type="hidden" name="_wpcf7_version" value="6.1.3" />
            <input type="hidden" name="_wpcf7_locale" value="en_US" />
            <input type="hidden" name="_wpcf7_unit_tag" value={UNIT_TAG} />
            <input type="hidden" name="_wpcf7_container_post" value="0" />

            <div className="main-form cu-cform">
                <div className="one-half">
                    <p>
                        <input type="text" name="text-101" placeholder="First Name" required
                            className="wpcf7-form-control wpcf7-text wpcf7-validates-as-required"
                            value={form['text-101']} onChange={e => set('text-101', e.target.value)} />
                    </p>
                </div>
                <div className="one-half padd-0">
                    <p>
                        <input type="text" name="text-102" placeholder="Last Name" required
                            className="wpcf7-form-control wpcf7-text wpcf7-validates-as-required"
                            value={form['text-102']} onChange={e => set('text-102', e.target.value)} />
                    </p>
                </div>
                <div className="clearfix" />
                <div className="one-half">
                    <p>
                        <input type="email" name="text-103" placeholder="Email Address" required
                            className="wpcf7-form-control wpcf7-email wpcf7-validates-as-required"
                            value={form['text-103']} onChange={e => set('text-103', e.target.value)} />
                    </p>
                </div>
                <div className="one-half padd-0">
                    <p>
                        <input type="text" name="number-104" placeholder="Phone number" required
                            className="wpcf7-form-control wpcf7-text wpcf7-validates-as-required"
                            value={form['number-104']} onChange={e => set('number-104', e.target.value)} />
                    </p>
                </div>
                <div className="clearfix" />
                <p>
                    <input type="text" name="text-105" placeholder="Your Subject" required
                        className="wpcf7-form-control wpcf7-text wpcf7-validates-as-required"
                        value={form['text-105']} onChange={e => set('text-105', e.target.value)} />
                </p>
                <p>
                    <input type="text" name="text-106" placeholder="Company Name" required
                        className="wpcf7-form-control wpcf7-text wpcf7-validates-as-required"
                        value={form['text-106']} onChange={e => set('text-106', e.target.value)} />
                </p>
                <p>
                    <select name="text-107" required
                        className="wpcf7-form-control wpcf7-select wpcf7-validates-as-required"
                        value={form['text-107']} onChange={e => set('text-107', e.target.value)}>
                        <option value="">Which web hosting package you want?</option>
                        <option value="Light">Light</option>
                        <option value="Standard">Standard</option>
                        <option value="Pro">Pro</option>
                    </select>
                </p>
                <p>
                    <input type="text" name="text-108" placeholder="IF you want a domain - And what domain?"
                        className="wpcf7-form-control wpcf7-text"
                        value={form['text-108']} onChange={e => set('text-108', e.target.value)} />
                </p>
                <p className="cnt7-textarea">
                    <textarea name="textarea-109" placeholder="Your Messages" rows={10} maxLength={2000}
                        className="wpcf7-form-control wpcf7-textarea"
                        value={form['textarea-109']} onChange={e => set('textarea-109', e.target.value)} />
                </p>
                <div className="form-btn">
                    <p>
                        <input type="submit"
                            value={status === 'loading' ? 'Sending...' : 'Send'}
                            disabled={status === 'loading'}
                            className="wpcf7-form-control wpcf7-submit has-spinner" />
                    </p>
                </div>
            </div>

            {status === 'success' && (
                <div role="alert" style={{ border: '2px solid #46b450', color: '#46b450', padding: '12px 20px', borderRadius: 4, fontSize: 15, textAlign: 'center', marginTop: 16 }}>
                    Thank you for your message. It has been sent.
                </div>
            )}
            {status === 'error' && (
                <div role="alert" style={{ border: '2px solid #dc3232', color: '#dc3232', padding: '12px 20px', borderRadius: 4, fontSize: 15, textAlign: 'center', marginTop: 16 }}>
                    There was an error sending your message. Please try again.
                </div>
            )}
        </form>
    );
}

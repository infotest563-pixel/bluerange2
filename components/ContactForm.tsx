'use client';

import { useState } from 'react';

const CF7_ENDPOINT = 'https://dev-bluerange.pantheonsite.io/wp-json/contact-form-7/v1/contact-forms/70/feedback';

const SOFTWARE_OPTIONS = [
    'Software To Choose', 'Shopify', 'Dinafastigheter.se', 'WordPress',
    'Moodle', 'Magento', 'Drupal', 'Prodtime', 'Joomla', 'Visma',
    'Pyramid', 'Odoo', 'Wix',
];

type Status = 'idle' | 'loading' | 'success' | 'error';

export default function ContactForm() {
    const [status, setStatus] = useState<Status>('idle');
    const [form, setForm] = useState({
        'full-name': '',
        Email: '',
        Mobile: '',
        Business: '',
        Software: 'Software To Choose',
        Message: '',
        accepted: false,
    });

    const set = (field: string, value: string | boolean) =>
        setForm(prev => ({ ...prev, [field]: value }));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setStatus('loading');

        const body = new FormData();
        body.append('_wpcf7', '70');
        body.append('_wpcf7_version', '6.1.3');
        body.append('_wpcf7_locale', 'en_US');
        body.append('_wpcf7_unit_tag', 'wpcf7-f70-o1');
        body.append('_wpcf7_container_post', '0');
        body.append('_wpcf7_posted_data_hash', '');
        body.append('full-name', form['full-name']);
        body.append('Email', form.Email);
        body.append('Mobile', form.Mobile);
        body.append('Business', form.Business);
        body.append('Software', form.Software);
        body.append('Message', form.Message);
        if (form.accepted) {
            body.append('checkbox-108[]', 'I accept that Bluerange saves my data. This form collects your details so that we can contact you. Read our policy for more \n        information.');
        }

        try {
            const res = await fetch(CF7_ENDPOINT, { method: 'POST', body });
            const json = await res.json();
            if (json.status === 'mail_sent') {
                setForm({ 'full-name': '', Email: '', Mobile: '', Business: '', Software: 'Software To Choose', Message: '', accepted: false });
                setStatus('success');
                setTimeout(() => setStatus('idle'), 5000);
            } else {
                setStatus('error');
                setTimeout(() => setStatus('idle'), 5000);
            }
        } catch {
            setStatus('error');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="wpcf7-form" data-reactform="true">
            <div className="main-form hm-getforms">
                <p>
                    <input
                        type="text"
                        name="full-name"
                        placeholder="Full Name"
                        required
                        className="wpcf7-form-control wpcf7-text"
                        value={form['full-name']}
                        onChange={e => set('full-name', e.target.value)}
                    />
                </p>
                <div className="one-half">
                    <p>
                        <input
                            type="email"
                            name="Email"
                            placeholder="Email"
                            required
                            className="wpcf7-form-control wpcf7-email"
                            value={form.Email}
                            onChange={e => set('Email', e.target.value)}
                        />
                    </p>
                </div>
                <div className="one-half padd-0">
                    <p>
                        <input
                            type="tel"
                            name="Mobile"
                            placeholder="Mobile number"
                            required
                            className="wpcf7-form-control wpcf7-tel"
                            value={form.Mobile}
                            onChange={e => set('Mobile', e.target.value)}
                        />
                    </p>
                </div>
                <div className="clearfix" />
                <p>
                    <input
                        type="text"
                        name="Business"
                        placeholder="Business Name"
                        required
                        className="wpcf7-form-control wpcf7-text"
                        value={form.Business}
                        onChange={e => set('Business', e.target.value)}
                    />
                </p>
                <p>
                    <select
                        name="Software" 
                        className="wpcf7-form-control wpcf7-select"
                        value={form.Software}
                        onChange={e => set('Software', e.target.value)}
                    >
                        {SOFTWARE_OPTIONS.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                        ))}
                    </select>
                </p>
                <p className="cnt7-textarea">
                    <textarea
                        name="Message"
                        placeholder="Message"
                        rows={10}
                        maxLength={2000}
                        className="wpcf7-form-control wpcf7-textarea"
                        value={form.Message}
                        onChange={e => set('Message', e.target.value)}
                    />
                </p>
                <p className="cnt7-chtkbox">
                    <label >
                        <input 
                            type="checkbox"
                            checked={form.accepted}
                            onChange={e => set('accepted', e.target.checked)}
                        />
                        <span>
                            I accept that Bluerange saves my data. This form collects your details so that we can contact you. Read our policy for more information.
                        </span>
                    </label>
                </p>
                <div className="form-btn">
                    <p>
                        <input
                            type="submit"
                            value={status === 'loading' ? 'Sending...' : 'Submit'}
                            disabled={status === 'loading'}
                            className="wpcf7-form-control wpcf7-submit"
                        />
                    </p>
                </div>
            </div>

            {/* Success message shown below form */}
            {status === 'success' && (
                <div className="wpcf7-response-output" style={{
                    border: '2px solid #46b450',
                    color: '#46b450',
                    padding: '12px 20px',
                    borderRadius: 4,
                    fontSize: 15,
                    textAlign: 'center',
                    marginTop: 16,
                }}>
                    Thank you for your message. It has been sent.
                </div>
            )}

            {/* Error message shown below form */}
            {status === 'error' && (
                <div className="wpcf7-response-output" style={{
                    border: '2px solid #dc3232',
                    color: '#dc3232',
                    padding: '10px 16px',
                    borderRadius: 4,
                    fontSize: 14,
                    marginTop: 16,
                }}>
                    There was an error sending your message. Please try again.
                </div>
            )}
        </form>
    );
}

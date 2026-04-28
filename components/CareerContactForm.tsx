'use client';

import { useState, useRef } from 'react';

const WP = 'https://dev-bluerange.pantheonsite.io';

const FORM_IDS: Record<string, string> = {
    en: '957',
    sv: '2172',
};

type Status = 'idle' | 'loading' | 'success' | 'error';

const labels = {
    en: {
        name: 'Your Name *',
        email: 'Email Address *',
        phone: 'Phone Number',
        education: 'Your Education',
        experience: 'Your Experience',
        message: 'Your Message or Cover Letter',
        cv: 'Upload CV',
        submit: 'Submit Application',
        sending: 'Sending...',
        success: 'Thank you! Your application has been sent.',
        error: 'There was an error sending your application. Please try again.',
    },
    sv: {
        name: 'Ditt namn *',
        email: 'E-postadress *',
        phone: 'Telefonnummer',
        education: 'Din utbildning',
        experience: 'Din erfarenhet',
        message: 'Ditt meddelande eller personligt brev',
        cv: 'Ladda upp CV',
        submit: 'Skicka ansökan',
        sending: 'Skickar...',
        success: 'Tack! Din ansökan har skickats.',
        error: 'Det uppstod ett fel. Försök igen.',
    },
};

export default function CareerContactForm({ lang = 'en' }: { lang?: string }) {
    const t = lang === 'sv' ? labels.sv : labels.en;
    const formId = FORM_IDS[lang] || FORM_IDS.en;
    const unitTag = `wpcf7-f${formId}-o1`;
    const endpoint = `${WP}/wp-json/contact-form-7/v1/contact-forms/${formId}/feedback`;

    const [status, setStatus] = useState<Status>('idle');
    const [form, setForm] = useState({
        'text-101': '',
        'text-102': '',
        'number-103': '',
        'text-104': '',
        'text-105': '',
        'your-cv': null as File | null,
    });

    const fileRef = useRef<HTMLInputElement>(null);

    const set = (field: string, value: string) =>
        setForm(prev => ({ ...prev, [field]: value }));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setStatus('loading');

        const body = new FormData();
        body.append('_wpcf7', formId);
        body.append('_wpcf7_version', '6.1.3');
        body.append('_wpcf7_locale', lang === 'sv' ? 'sv_SE' : 'en_US');
        body.append('_wpcf7_unit_tag', unitTag);
        body.append('_wpcf7_container_post', '0');
        body.append('_wpcf7_posted_data_hash', '');
        body.append('text-101', form['text-101']);
        body.append('text-102', form['text-102']);
        body.append('number-103', form['number-103']);
        body.append('text-104', form['text-104']);
        body.append('text-105', form['text-105']);
        if (form['your-cv']) {
            body.append('your-cv', form['your-cv']);
        }

        try {
            const res = await fetch(endpoint, { method: 'POST', body });
            const json = await res.json();

            if (json.status === 'mail_sent') {
                setForm({
                    'text-101': '',
                    'text-102': '',
                    'number-103': '',
                    'text-104': '',
                    'text-105': '',
                    'your-cv': null,
                });
                if (fileRef.current) fileRef.current.value = '';
                setStatus('success');
                setTimeout(() => setStatus('idle'), 6000);
            } else {
                console.error('[CareerForm] CF7 response:', json);
                setStatus('error');
                setTimeout(() => setStatus('idle'), 6000);
            }
        } catch (err) {
            console.error('[CareerForm] Error:', err);
            setStatus('error');
            setTimeout(() => setStatus('idle'), 6000);
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="cr-crerfrm"
            data-reactform="true"
        >
            <input type="hidden" name="_wpcf7" value={formId} />
            <input type="hidden" name="_wpcf7_version" value="6.1.3" />
            <input type="hidden" name="_wpcf7_locale" value={lang === 'sv' ? 'sv_SE' : 'en_US'} />
            <input type="hidden" name="_wpcf7_unit_tag" value={unitTag} />
            <input type="hidden" name="_wpcf7_container_post" value="0" />

            <div className="main-form">
                <p>
                    <input
                        type="text"
                        name="text-101"
                        placeholder={t.name}
                        required
                        className="wpcf7-form-control wpcf7-text"
                        value={form['text-101']}
                        onChange={e => set('text-101', e.target.value)}
                    />
                </p>
                <div className="one-half">
                    <p>
                        <input
                            type="email"
                            name="text-102"
                            placeholder={t.email}
                            required
                            className="wpcf7-form-control wpcf7-email"
                            value={form['text-102']}
                            onChange={e => set('text-102', e.target.value)}
                        />
                    </p>
                </div>
                <div className="one-half padd-0">
                    <p>
                        <input
                            type="tel"
                            name="number-103"
                            placeholder={t.phone}
                            className="wpcf7-form-control wpcf7-tel"
                            value={form['number-103']}
                            onChange={e => set('number-103', e.target.value)}
                        />
                    </p>
                </div>
                <div className="clearfix" />
                <p>
                    <input
                        type="text"
                        name="text-104"
                        placeholder={t.education}
                        className="wpcf7-form-control wpcf7-text"
                        value={form['text-104']}
                        onChange={e => set('text-104', e.target.value)}
                    />
                </p>
                <p>
                    <input
                        type="text"
                        name="text-105"
                        placeholder={t.experience}
                        className="wpcf7-form-control wpcf7-text"
                        value={form['text-105']}
                        onChange={e => set('text-105', e.target.value)}
                    />
                </p>
                <p>
                    <input
                        type="file"
                        name="your-cv"
                        ref={fileRef}
                        className="wpcf7-form-control"
                        onChange={e => setForm(prev => ({ ...prev, 'your-cv': e.target.files?.[0] || null }))}
                    />
                </p>
                <div className="form-btn">
                    <p>
                        <input
                            type="submit"
                            value={status === 'loading' ? t.sending : t.submit}
                            disabled={status === 'loading'}
                            className="wpcf7-form-control wpcf7-submit"
                        />
                    </p>
                </div>
            </div>

            {status === 'success' && (
                <div role="alert" style={{
                    border: '2px solid #46b450',
                    color: '#46b450',
                    padding: '12px 20px',
                    borderRadius: 4,
                    fontSize: 15,
                    marginTop: 16,
                }}>
                    {t.success}
                </div>
            )}
            {status === 'error' && (
                <div role="alert" style={{
                    border: '2px solid #dc3232',
                    color: '#dc3232',
                    padding: '12px 20px',
                    borderRadius: 4,
                    fontSize: 15,
                    marginTop: 16,
                }}>
                    {t.error}
                </div>
            )}
        </form>
    );
}

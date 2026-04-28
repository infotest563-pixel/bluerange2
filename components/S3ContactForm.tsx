'use client';

import { useState } from 'react';

const WP = 'https://dev-bluerange.pantheonsite.io';

// Real numeric CF7 form IDs (extracted from rendered shortcode HTML)
// EN: [contact-form-7 id="1465da7"] → wpcf7-f955-o1  → ID 955
// SV: [contact-form-7 id="2a473c0"] → wpcf7-f2170-o1 → ID 2170
const FORM_IDS: Record<string, string> = {
    en: '955',
    sv: '2170',
};

const RACK_UNITS = ['Select Rack Units', '1U', '2U', '3U', '4U', '5U'];

type Status = 'idle' | 'loading' | 'success' | 'error';

interface S3ContactFormProps {
    lang?: string;
}

const labels = {
    en: {
        firstName: 'First Name',
        lastName: 'Last Name',
        email: 'Email Address',
        rackUnits: 'Select Rack Units',
        message: 'Your Message',
        submit: 'Submit Request',
        sending: 'Sending...',
        success: 'Thank you for your request. We will answer within 24 hours.',
        error: 'There was an error sending your request. Please try again.',
    },
    sv: {
        firstName: 'Förnamn',
        lastName: 'Efternamn',
        email: 'Ange e-postadress',
        rackUnits: 'Välj Rack Units',
        message: 'Ditt meddelande',
        submit: 'Skicka förfrågan',
        sending: 'Skickar...',
        success: 'Tack för din förfrågan. Vi svarar inom 24 timmar.',
        error: 'Det uppstod ett fel. Försök igen.',
    },
};

export default function S3ContactForm({ lang = 'en' }: S3ContactFormProps) {
    const t = lang === 'sv' ? labels.sv : labels.en;
    const formId = FORM_IDS[lang] || FORM_IDS.en;
    const unitTag = `wpcf7-f${formId}-o1`;
    const endpoint = `${WP}/wp-json/contact-form-7/v1/contact-forms/${formId}/feedback`;

    const [status, setStatus] = useState<Status>('idle');
    const [form, setForm] = useState({
        'text-201': '',   // First Name
        'text-202': '',   // Last Name
        'text-203': '',   // Email
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
        body.append('_wpcf7', formId);
        body.append('_wpcf7_version', '6.1.3');
        body.append('_wpcf7_locale', lang === 'sv' ? 'sv_SE' : 'en_US');
        body.append('_wpcf7_unit_tag', unitTag);
        body.append('_wpcf7_container_post', '0');
        body.append('_wpcf7_posted_data_hash', '');
        body.append('text-201', form['text-201']);
        body.append('text-202', form['text-202']);
        body.append('text-203', form['text-203']);
        body.append('dropdown-204', form['dropdown-204']);
        body.append('textarea-205', form['textarea-205']);

        try {
            const res = await fetch(endpoint, { method: 'POST', body });
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
                console.error('[S3Form] CF7 response:', json);
                setStatus('error');
                setTimeout(() => setStatus('idle'), 6000);
            }
        } catch (err) {
            console.error('[S3Form] Fetch error:', err);
            setStatus('error');
            setTimeout(() => setStatus('idle'), 6000);
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="s3-contact-form"
            data-s3form="true"
        >
            {/* Hidden CF7 fields */}
            <input type="hidden" name="_wpcf7" value={formId} />
            <input type="hidden" name="_wpcf7_version" value="6.1.3" />
            <input type="hidden" name="_wpcf7_locale" value={lang === 'sv' ? 'sv_SE' : 'en_US'} />
            <input type="hidden" name="_wpcf7_unit_tag" value={unitTag} />
            <input type="hidden" name="_wpcf7_container_post" value="0" />
            <input type="hidden" name="_wpcf7_posted_data_hash" value="" />

            <div className="main-form bkp-storege">
                <div className="one-half">
                    <p>
                        <input
                            type="text"
                            name="text-201"
                            placeholder={t.firstName}
                            required
                            maxLength={400}
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
                            placeholder={t.lastName}
                            required
                            maxLength={400}
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
                        placeholder={t.email}
                        required
                        maxLength={400}
                        className="wpcf7-form-control wpcf7-email wpcf7-validates-as-required wpcf7-validates-as-email"
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
                        placeholder={t.message}
                        rows={10}
                        maxLength={2000}
                        className="wpcf7-form-control wpcf7-textarea"
                        value={form['textarea-205']}
                        onChange={e => set('textarea-205', e.target.value)}
                    />
                </p>

                <p>
                    <input
                        type="submit"
                        value={status === 'loading' ? t.sending : t.submit}
                        disabled={status === 'loading'}
                        className="wpcf7-form-control wpcf7-submit has-spinner"
                    />
                </p>
            </div>

            {status === 'success' && (
                <div role="alert" style={{
                    border: '2px solid #46b450',
                    color: '#46b450',
                    padding: '12px 20px',
                    borderRadius: 4,
                    fontSize: 15,
                    textAlign: 'center',
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
                    textAlign: 'center',
                    marginTop: 16,
                }}>
                    {t.error}
                </div>
            )}
        </form>
    );
}

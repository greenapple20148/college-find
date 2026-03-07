import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Cookie Policy',
    description: 'CollegeMatch Cookie Policy — how we use cookies and similar technologies.',
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <section className="mb-8">
            <h2 className="text-lg font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>{title}</h2>
            <div className="space-y-3 text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                {children}
            </div>
        </section>
    )
}

export default function CookiePolicyPage() {
    return (
        <div className="max-w-3xl mx-auto px-4 py-20">
            <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--gold-primary)' }}>
                Legal
            </p>
            <h1 className="heading-serif text-3xl mb-2" style={{ color: 'var(--text-primary)' }}>
                Cookie Policy
            </h1>
            <p className="text-sm mb-10" style={{ color: 'var(--text-faint)' }}>
                Effective Date: March 7, 2026 &middot; Last Updated: March 7, 2026
            </p>

            <Section title="1. What Are Cookies?">
                <p>
                    Cookies are small text files that are placed on your device when you visit a website. They are widely
                    used to make websites work more efficiently and to provide information to website operators.
                    CollegeMatch uses cookies and similar technologies (such as localStorage) to enhance your experience.
                </p>
            </Section>

            <Section title="2. Types of Cookies We Use">
                <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'var(--border-primary)' }}>
                    <table className="w-full text-sm">
                        <thead>
                            <tr style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                                <th className="px-4 py-3 text-left font-semibold" style={{ color: 'var(--text-primary)' }}>Type</th>
                                <th className="px-4 py-3 text-left font-semibold" style={{ color: 'var(--text-primary)' }}>Purpose</th>
                                <th className="px-4 py-3 text-left font-semibold" style={{ color: 'var(--text-primary)' }}>Duration</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr style={{ borderTop: '1px solid var(--border-subtle)' }}>
                                <td className="px-4 py-3 font-medium" style={{ color: 'var(--text-primary)' }}>Essential</td>
                                <td className="px-4 py-3" style={{ color: 'var(--text-secondary)' }}>Required for the website to function (authentication, theme preferences)</td>
                                <td className="px-4 py-3" style={{ color: 'var(--text-faint)' }}>Session / Persistent</td>
                            </tr>
                            <tr style={{ borderTop: '1px solid var(--border-subtle)' }}>
                                <td className="px-4 py-3 font-medium" style={{ color: 'var(--text-primary)' }}>Functional</td>
                                <td className="px-4 py-3" style={{ color: 'var(--text-secondary)' }}>Remember your preferences and settings (saved colleges, filter choices)</td>
                                <td className="px-4 py-3" style={{ color: 'var(--text-faint)' }}>Persistent</td>
                            </tr>
                            <tr style={{ borderTop: '1px solid var(--border-subtle)' }}>
                                <td className="px-4 py-3 font-medium" style={{ color: 'var(--text-primary)' }}>Analytics</td>
                                <td className="px-4 py-3" style={{ color: 'var(--text-secondary)' }}>Help us understand how visitors use the website to improve it</td>
                                <td className="px-4 py-3" style={{ color: 'var(--text-faint)' }}>Persistent</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </Section>

            <Section title="3. Local Storage">
                <p>
                    In addition to cookies, we use browser localStorage to store certain preferences and data locally
                    on your device. This includes:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                    <li><strong>Theme preference</strong> (light or dark mode)</li>
                    <li><strong>Academic profile</strong> (GPA, test scores) for admission matching</li>
                    <li><strong>Financial profile</strong> (household income, family size) for cost estimation</li>
                    <li><strong>Filter and sort preferences</strong> on the search page</li>
                </ul>
                <p>
                    This data stays on your device and is not transmitted to our servers unless you explicitly sync it
                    with an account.
                </p>
            </Section>

            <Section title="4. Third-Party Cookies">
                <p>
                    We may use third-party services (such as analytics providers) that set their own cookies. These
                    third parties have their own privacy policies governing the use of cookies. We do not control
                    these third-party cookies.
                </p>
            </Section>

            <Section title="5. Managing Cookies">
                <p>
                    You can control and manage cookies in several ways:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                    <li><strong>Browser settings:</strong> Most browsers allow you to manage cookie preferences through their settings menu. You can block or delete cookies.</li>
                    <li><strong>localStorage:</strong> You can clear localStorage data through your browser&rsquo;s developer tools or settings.</li>
                </ul>
                <p>
                    Please note that disabling essential cookies or clearing localStorage may affect the functionality
                    of the Service and your saved preferences will be lost.
                </p>
            </Section>

            <Section title="6. Do Not Track">
                <p>
                    Some browsers include a &ldquo;Do Not Track&rdquo; (DNT) feature. We currently do not respond to
                    DNT signals. However, you can manage your cookie preferences as described above.
                </p>
            </Section>

            <Section title="7. Updates to This Policy">
                <p>
                    We may update this Cookie Policy from time to time. Any changes will be posted on this page with
                    a new effective date.
                </p>
            </Section>

            <Section title="8. Contact Us">
                <p>
                    If you have questions about our use of cookies, contact us at{' '}
                    <a href="mailto:privacy@collegematchtool.com" className="hover:underline" style={{ color: 'var(--gold-primary)' }}>
                        privacy@collegematchtool.com
                    </a>.
                </p>
            </Section>
        </div>
    )
}

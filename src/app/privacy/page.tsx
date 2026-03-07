import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Privacy Policy',
    description: 'CollegeMatch Privacy Policy — how we collect, use, and protect your personal information.',
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

export default function PrivacyPage() {
    return (
        <div className="max-w-3xl mx-auto px-4 py-20">
            <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--gold-primary)' }}>
                Legal
            </p>
            <h1 className="heading-serif text-3xl mb-2" style={{ color: 'var(--text-primary)' }}>
                Privacy Policy
            </h1>
            <p className="text-sm mb-10" style={{ color: 'var(--text-faint)' }}>
                Effective Date: March 7, 2026 &middot; Last Updated: March 7, 2026
            </p>

            <Section title="1. Introduction">
                <p>
                    CollegeMatch (&ldquo;we,&rdquo; &ldquo;our,&rdquo; or &ldquo;us&rdquo;) respects your privacy and is
                    committed to protecting your personal information. This Privacy Policy explains how we collect, use,
                    disclose, and safeguard your information when you use the CollegeMatch website and services.
                </p>
            </Section>

            <Section title="2. Information We Collect">
                <p><strong>Information You Provide Directly:</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>Account registration information (name, email address)</li>
                    <li>Academic profile information (GPA, test scores, extracurriculars)</li>
                    <li>Financial profile information for cost estimation (household income, family size)</li>
                    <li>Saved colleges, application statuses, deadlines, and notes</li>
                </ul>
                <p><strong>Information Collected Automatically:</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>Device information (browser type, operating system)</li>
                    <li>Usage data (pages visited, features used, search queries)</li>
                    <li>Log data (IP address, access times, referring URLs)</li>
                    <li>Cookies and similar tracking technologies (see our Cookie Policy)</li>
                </ul>
            </Section>

            <Section title="3. How We Use Your Information">
                <p>We use the information we collect to:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>Provide, maintain, and improve the Service</li>
                    <li>Personalize your experience (admission match estimates, cost calculations)</li>
                    <li>Save your preferences, college lists, and application tracking data</li>
                    <li>Analyze usage patterns to improve features and performance</li>
                    <li>Communicate with you about the Service, updates, or support</li>
                    <li>Detect, prevent, and address technical issues or misuse</li>
                </ul>
            </Section>

            <Section title="4. How We Share Your Information">
                <p>
                    We <strong>do not sell</strong> your personal information. We may share your information only in the following circumstances:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                    <li><strong>Service Providers:</strong> Trusted third parties that help us operate, maintain, or improve the Service (hosting, analytics)</li>
                    <li><strong>Legal Requirements:</strong> If required by law, regulation, subpoena, or legal process</li>
                    <li><strong>Safety:</strong> To protect the rights, property, or safety of CollegeMatch, our users, or the public</li>
                    <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
                </ul>
            </Section>

            <Section title="5. Data Storage and Security">
                <p>
                    We implement reasonable administrative, technical, and physical security measures to protect your
                    personal information. However, no method of transmission over the Internet or electronic storage
                    is 100% secure, and we cannot guarantee absolute security.
                </p>
                <p>
                    Some data, including your academic profile and financial profile, may be stored locally in your
                    browser using <code className="px-1 py-0.5 rounded text-xs" style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-tertiary)' }}>localStorage</code>.
                    This data does not leave your device unless you explicitly sync it with an account.
                </p>
            </Section>

            <Section title="6. Data Retention">
                <p>
                    We retain your personal information for as long as your account is active or as needed to provide
                    the Service. You can delete your account and associated data at any time by contacting us.
                    Some data may be retained as required by applicable laws or for legitimate business purposes.
                </p>
            </Section>

            <Section title="7. Children&rsquo;s Privacy">
                <p>
                    The Service is not intended for children under 13 years of age. We do not knowingly collect personal
                    information from children under 13. If we become aware that a child under 13 has provided personal
                    information, we will take steps to delete it. If you are a parent or guardian and believe your child
                    has provided us with personal information, please contact us.
                </p>
            </Section>

            <Section title="8. Your Rights">
                <p>Depending on your location, you may have the right to:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>Access, correct, or delete your personal information</li>
                    <li>Object to or restrict certain processing of your data</li>
                    <li>Withdraw consent where processing is based on consent</li>
                    <li>Request a portable copy of your data</li>
                    <li>Lodge a complaint with a supervisory authority</li>
                </ul>
                <p>
                    To exercise any of these rights, contact us at{' '}
                    <a href="mailto:privacy@collegematchtool.com" className="hover:underline" style={{ color: 'var(--gold-primary)' }}>
                        privacy@collegematchtool.com
                    </a>.
                </p>
            </Section>

            <Section title="9. California Residents (CCPA)">
                <p>
                    If you are a California resident, you have additional rights under the California Consumer Privacy Act
                    (CCPA), including the right to know what personal information we collect, the right to delete your
                    information, and the right to opt-out of the sale of your personal information. As stated above,
                    we <strong>do not sell</strong> personal information.
                </p>
            </Section>

            <Section title="10. International Users">
                <p>
                    If you access the Service from outside the United States, please be aware that your information may
                    be transferred to, stored, and processed in the United States where our servers are located. By using
                    the Service, you consent to the transfer of your information to the United States.
                </p>
            </Section>

            <Section title="11. Changes to This Policy">
                <p>
                    We may update this Privacy Policy from time to time. We will post the updated policy on this page
                    with a new effective date. We encourage you to review this Privacy Policy periodically.
                </p>
            </Section>

            <Section title="12. Contact Us">
                <p>
                    If you have questions or concerns about this Privacy Policy or our data practices, contact us at{' '}
                    <a href="mailto:privacy@collegematchtool.com" className="hover:underline" style={{ color: 'var(--gold-primary)' }}>
                        privacy@collegematchtool.com
                    </a>.
                </p>
            </Section>
        </div>
    )
}

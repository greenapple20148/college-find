import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Terms of Service',
    description: 'CollegeMatch Terms of Service — the rules and guidelines for using our free college search and admissions tool.',
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

export default function TermsPage() {
    return (
        <div className="max-w-3xl mx-auto px-4 py-20">
            <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--gold-primary)' }}>
                Legal
            </p>
            <h1 className="heading-serif text-3xl mb-2" style={{ color: 'var(--text-primary)' }}>
                Terms of Service
            </h1>
            <p className="text-sm mb-10" style={{ color: 'var(--text-faint)' }}>
                Effective Date: March 7, 2026 &middot; Last Updated: March 7, 2026
            </p>

            <Section title="1. Acceptance of Terms">
                <p>
                    Welcome to CollegeMatch (&ldquo;we,&rdquo; &ldquo;our,&rdquo; or &ldquo;us&rdquo;). By accessing or using the
                    CollegeMatch website and services (the &ldquo;Service&rdquo;), you agree to be bound by these Terms of
                    Service (&ldquo;Terms&rdquo;). If you do not agree, please do not use the Service.
                </p>
            </Section>

            <Section title="2. Description of Service">
                <p>
                    CollegeMatch is a free, educational tool that helps high school students search for U.S. colleges,
                    estimate admission chances, compare schools, estimate costs, and track application deadlines. Our data
                    is sourced from the U.S. Department of Education College Scorecard and other publicly available sources.
                </p>
            </Section>

            <Section title="3. Eligibility">
                <p>
                    The Service is intended for users who are at least 13 years of age. If you are under 13, you may not
                    use the Service. If you are between 13 and 18, you may use the Service with parental or guardian consent.
                </p>
            </Section>

            <Section title="4. User Accounts">
                <p>
                    Some features may require you to create an account. You are responsible for maintaining the
                    confidentiality of your account credentials and for all activities that occur under your account.
                    You agree to provide accurate, current, and complete information during registration.
                </p>
            </Section>

            <Section title="5. Acceptable Use">
                <p>You agree not to:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>Use the Service for any unlawful purpose or in violation of any applicable law</li>
                    <li>Attempt to gain unauthorized access to any portion of the Service</li>
                    <li>Use automated tools, bots, or scrapers to extract data from the Service</li>
                    <li>Interfere with or disrupt the integrity or performance of the Service</li>
                    <li>Impersonate any person or entity, or misrepresent your affiliation</li>
                    <li>Upload or transmit viruses, malware, or any harmful code</li>
                </ul>
            </Section>

            <Section title="6. Intellectual Property">
                <p>
                    All content, design, graphics, and software associated with the Service are owned by or licensed to
                    CollegeMatch and are protected by applicable intellectual property laws. You may not copy, modify,
                    distribute, sell, or lease any part of the Service without our prior written permission.
                </p>
            </Section>

            <Section title="7. No Guarantee of Accuracy">
                <p>
                    While we strive to provide accurate and current information, admission estimates, cost calculations,
                    scholarship data, and match predictions are <strong>statistical approximations only</strong> and
                    should not be relied upon as the sole basis for admission, financial, or academic decisions. Always
                    verify information directly with the colleges and institutions in question.
                </p>
            </Section>

            <Section title="8. Third-Party Data">
                <p>
                    The Service uses data from the U.S. Department of Education College Scorecard and other public
                    datasets. We are not affiliated with, endorsed by, or sponsored by the U.S. Department of Education
                    or any college or university listed on our platform.
                </p>
            </Section>

            <Section title="9. Limitation of Liability">
                <p>
                    To the fullest extent permitted by law, CollegeMatch shall not be liable for any indirect, incidental,
                    special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred
                    directly or indirectly, arising from your use of the Service.
                </p>
            </Section>

            <Section title="10. Disclaimer of Warranties">
                <p>
                    The Service is provided &ldquo;as is&rdquo; and &ldquo;as available&rdquo; without warranties of
                    any kind, either express or implied, including but not limited to implied warranties of merchantability,
                    fitness for a particular purpose, and non-infringement.
                </p>
            </Section>

            <Section title="11. Modifications to Terms">
                <p>
                    We reserve the right to modify these Terms at any time. We will post the updated Terms on this page
                    with a new &ldquo;Last Updated&rdquo; date. Your continued use of the Service after changes
                    constitutes acceptance of the revised Terms.
                </p>
            </Section>

            <Section title="12. Termination">
                <p>
                    We may suspend or terminate your access to the Service at any time, with or without cause and with
                    or without notice. Upon termination, your right to use the Service will cease immediately.
                </p>
            </Section>

            <Section title="13. Governing Law">
                <p>
                    These Terms shall be governed by and construed in accordance with the laws of the State of California,
                    United States, without regard to its conflict of law provisions.
                </p>
            </Section>

            <Section title="14. Contact Us">
                <p>
                    If you have any questions about these Terms, please contact us at{' '}
                    <a href="mailto:legal@collegematchtool.com" className="hover:underline" style={{ color: 'var(--gold-primary)' }}>
                        legal@collegematchtool.com
                    </a>.
                </p>
            </Section>
        </div>
    )
}

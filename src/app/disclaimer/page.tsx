import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Disclaimer',
    description: 'CollegeFind Disclaimer — important disclosures about data accuracy, limitations, and third-party affiliations.',
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

export default function DisclaimerPage() {
    return (
        <div className="max-w-3xl mx-auto px-4 py-20">
            <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--gold-primary)' }}>
                Legal
            </p>
            <h1 className="heading-serif text-3xl mb-2" style={{ color: 'var(--text-primary)' }}>
                Disclaimer &amp; Disclosures
            </h1>
            <p className="text-sm mb-10" style={{ color: 'var(--text-faint)' }}>
                Effective Date: March 7, 2026 &middot; Last Updated: March 7, 2026
            </p>

            {/* Important callout */}
            <div
                className="rounded-xl p-5 mb-10"
                style={{ backgroundColor: 'rgba(201, 146, 60, 0.08)', border: '1px solid rgba(201, 146, 60, 0.2)' }}
            >
                <p className="text-sm font-semibold mb-2" style={{ color: 'var(--gold-primary)' }}>
                    ⚠️ Important Notice
                </p>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                    CollegeFind, operated by RZeal Solutions, USA, is an informational tool only. All admission estimates, cost calculations, match
                    predictions, and scholarship information are <strong>approximations</strong> and should not be
                    treated as guarantees or professional advice. Always verify information directly with colleges
                    and qualified advisors.
                </p>
            </div>

            <Section title="1. General Disclaimer">
                <p>
                    The information provided on CollegeFind is for general informational and educational purposes only.
                    It is not intended to be and does not constitute professional academic advising, financial counseling,
                    or legal advice. You should not act or refrain from acting based solely on information provided
                    by this Service.
                </p>
            </Section>

            <Section title="2. Data Accuracy">
                <p>
                    CollegeFind sources data from the U.S. Department of Education College Scorecard and other publicly
                    available datasets. While we make every effort to ensure accuracy:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>College data may be outdated, incomplete, or subject to change without notice</li>
                    <li>Tuition, fees, and financial aid figures are estimates and may differ from actual costs</li>
                    <li>Admission rates and requirements change annually and may not reflect current standards</li>
                    <li>Scholarship amounts and eligibility criteria are approximate</li>
                    <li>Enrollment, graduation, and earnings data are based on historical reporting periods</li>
                </ul>
                <p>
                    We recommend verifying all data directly with the institution before making any decisions.
                </p>
            </Section>

            <Section title="3. Admission Match Estimates">
                <p>
                    Our admission match tool uses statistical models based on historical admission data (acceptance rates,
                    average GPA, test score ranges) to classify colleges as &ldquo;Safety,&rdquo; &ldquo;Match,&rdquo;
                    or &ldquo;Reach&rdquo; schools. These classifications:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>Are <strong>not</strong> predictions of your individual admission outcome</li>
                    <li>Do not account for all factors colleges consider (essays, recommendations, legacy, etc.)</li>
                    <li>Are based on aggregate data and may not reflect recent policy changes</li>
                    <li>Should be used as one input among many in your college planning</li>
                </ul>
            </Section>

            <Section title="4. Cost Calculator">
                <p>
                    The cost calculator provides <strong>rough estimates</strong> of net price based on a simplified
                    version of federal financial aid methodology. Actual costs will depend on your complete financial
                    profile, institutional aid policies, merit scholarships, work-study availability, and other factors
                    not fully captured by this tool.
                </p>
                <p>
                    We strongly recommend completing the FAFSA (Free Application for Federal Student Aid) and using
                    each college&rsquo;s official Net Price Calculator for more accurate estimates.
                </p>
            </Section>

            <Section title="5. Scholarship Information">
                <p>
                    Scholarship listings are compiled from publicly available sources. CollegeFind does not guarantee
                    the availability, accuracy, or eligibility of any scholarship listed. We are not responsible for
                    any decisions made based on scholarship information displayed on this Service.
                </p>
            </Section>

            <Section title="6. No Affiliation">
                <p>
                    CollegeFind is <strong>not affiliated with, endorsed by, or sponsored by</strong>:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>The U.S. Department of Education</li>
                    <li>Any college, university, or educational institution listed on our platform</li>
                    <li>The College Board, ACT, Inc., or the Common Application</li>
                    <li>Any federal, state, or local government agency</li>
                </ul>
                <p>
                    College names, logos, and trademarks belong to their respective owners and are used for
                    identification purposes only.
                </p>
            </Section>

            <Section title="7. External Links">
                <p>
                    The Service may contain links to third-party websites or services. We do not control and are not
                    responsible for the content, privacy policies, or practices of any third-party sites. Visiting
                    external links is at your own risk.
                </p>
            </Section>

            <Section title="8. No Professional Advice">
                <p>
                    Nothing on this website constitutes professional academic, financial, or legal advice. For
                    personalized guidance, we recommend consulting with:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>Your high school guidance counselor or college advisor</li>
                    <li>A qualified financial aid advisor</li>
                    <li>The admissions office of the colleges you are considering</li>
                </ul>
            </Section>

            <Section title="9. Indemnification">
                <p>
                    By using the Service, you agree to indemnify and hold harmless CollegeFind, its officers,
                    directors, employees, and agents from any claims, damages, losses, or expenses arising out of
                    your use of the Service or violation of these terms.
                </p>
            </Section>

            <Section title="10. Contact Us">
                <p>
                    If you have questions about this Disclaimer, please contact us at{' '}
                    <a href="mailto:legal@collegefindtool.com" className="hover:underline" style={{ color: 'var(--gold-primary)' }}>
                        legal@collegefindtool.com
                    </a>.
                </p>
            </Section>
        </div>
    )
}

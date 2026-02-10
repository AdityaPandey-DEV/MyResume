import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function PrivacyPolicy() {
    return (
        <main className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                <div className="mb-8">
                    <Link
                        href="/"
                        className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 transition-colors mb-6"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Home
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
                    <p className="text-gray-500">Last updated: {new Date().toLocaleDateString()}</p>
                </div>

                <div className="prose prose-gray max-w-none space-y-6 text-gray-600">
                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Introduction</h2>
                        <p>
                            Aditya Pandey (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) operates the MyResume LinkedIn Sync Chrome Extension within the MyResume portfolio application.
                            We respect your privacy and are committed to protecting it through our compliance with this policy.
                            This policy describes the types of information we may collect from you or that you may provide when you use the MyResume LinkedIn Sync extension
                            and our practices for collecting, using, maintaining, protected, and disclosing that information.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Information We Collect</h2>
                        <p className="mb-2">We collect the following types of information when you explicitly use the &quot;Sync Profile&quot; feature on your LinkedIn profile page:</p>
                        <ul className="list-disc pl-5 space-y-1">
                            <li><strong>Public Profile Information:</strong> Name, headline, about section, experience, education, skills, and certifications visible on your public LinkedIn profile.</li>
                            <li><strong>Usage Data:</strong> Information about how you use the extension, such as timestamps of sync actions.</li>
                        </ul>
                        <p className="mt-2 text-sm italic">Note: We do NOT collect your LinkedIn login credentials, passwords, or private messages.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 mb-3">3. How We Use Your Information</h2>
                        <p>We use the information we collect strictly for the following purposes:</p>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>To populate and update your personal portfolio resume on the MyResume application.</li>
                            <li>To generate improved content descriptions using AI services (processed anonymously where possible).</li>
                            <li>To maintain and improve the functionality of the MyResume application.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Data Processing and Sharing</h2>
                        <p>
                            We do not sell your personal data. However, portions of your profile text (e.g., &quot;About&quot; section, &quot;Experience&quot; descriptions)
                            may be processed by third-party AI providers to generate enhanced content:
                        </p>
                        <ul className="list-disc pl-5 space-y-1 mt-2">
                            <li><strong>Google Gemini (Google AI):</strong> Used for text summarization and enhancement.</li>
                            <li><strong>Groq:</strong> Used for fast inference and content formatting.</li>
                        </ul>
                        <p className="mt-2">
                            These providers process data according to their respective privacy policies. We do not share your identifiable personal information
                            with any other third parties for marketing purposes.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Data Storage</h2>
                        <p>
                            The data synced from LinkedIn is stored in your personal database instance connected to your deployment of the MyResume application.
                            You retain full ownership and control over this data. You can delete or modify this data at any time via the MyResume Admin Dashboard.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Changes to Our Privacy Policy</h2>
                        <p>
                            It is our policy to post any changes we make to our privacy policy on this page.
                            The date the privacy policy was last revised is identified at the top of the page.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Contact Information</h2>
                        <p>
                            To ask questions or comment about this privacy policy and our privacy practices, contact us via the MyResume portfolio contact form
                            or at the developer email associated with this application.
                        </p>
                    </section>
                </div>

                <div className="mt-12 pt-8 border-t border-gray-100 text-center text-sm text-gray-400">
                    &copy; {new Date().getFullYear()} MyResume. All Rights Reserved.
                </div>
            </div>
        </main>
    );
}

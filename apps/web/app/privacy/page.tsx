import Link from 'next/link';
import type { Metadata } from 'next';

/**
 * Privacy Policy.
 *
 * PLACEHOLDER — Lorem ipsum scaffold. Bridget will replace the body
 * sections below with a real, lawyer-reviewed privacy policy before
 * launch.
 *
 * Apple App Store and Google Play Store both REQUIRE a publicly
 * accessible Privacy Policy URL during submission, so this route
 * needs to exist (even as a stub) before LAUNCH.md Step 105 can run.
 * Public route (no auth required), rendered as a plain server
 * component.
 */

export const metadata: Metadata = {
  title: 'Privacy Policy · Orvo',
  description:
    'How Orvo collects, uses, and safeguards your personal information.',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <header className="border-b border-zinc-200">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="text-xl font-semibold tracking-tight text-brand-primary"
          >
            Orvo
          </Link>
        </div>
      </header>

      <main className="flex-1">
        <article className="max-w-3xl mx-auto px-6 py-16">
          <h1 className="text-4xl font-semibold tracking-tight text-brand-primary mb-2">
            Privacy Policy
          </h1>
          <p className="text-sm text-zinc-500 mb-10">
            Last updated: PLACEHOLDER — replace before launch.
          </p>

          <div className="prose prose-zinc max-w-none">
            <p className="text-sm uppercase tracking-wide text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-3 py-2 mb-8">
              Placeholder content. Replace this entire document with a
              real privacy policy reviewed by counsel before launch.
            </p>

            <h2 className="text-2xl font-semibold text-brand-primary mt-10 mb-3">
              1. Information We Collect
            </h2>
            <p className="text-zinc-700 leading-relaxed mb-4">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed
              do eiusmod tempor incididunt ut labore et dolore magna aliqua.
              Account information, booking history, and payment details are
              examples of data we may handle.
            </p>
            <p className="text-zinc-700 leading-relaxed mb-4">
              Ut enim ad minim veniam, quis nostrud exercitation ullamco
              laboris nisi ut aliquip ex ea commodo consequat. Device
              identifiers, approximate location, and usage analytics may
              also be collected.
            </p>

            <h2 className="text-2xl font-semibold text-brand-primary mt-10 mb-3">
              2. How We Use Your Information
            </h2>
            <p className="text-zinc-700 leading-relaxed mb-4">
              Duis aute irure dolor in reprehenderit in voluptate velit
              esse cillum dolore eu fugiat nulla pariatur. We may use the
              data to provide booking services, prevent fraud, and improve
              the product experience.
            </p>

            <h2 className="text-2xl font-semibold text-brand-primary mt-10 mb-3">
              3. Information Sharing and Disclosure
            </h2>
            <p className="text-zinc-700 leading-relaxed mb-4">
              Excepteur sint occaecat cupidatat non proident, sunt in
              culpa qui officia deserunt mollit anim id est laborum. We
              share data with service providers (Stripe, Twilio, Resend,
              Supabase) strictly to deliver the service.
            </p>

            <h2 className="text-2xl font-semibold text-brand-primary mt-10 mb-3">
              4. Data Retention
            </h2>
            <p className="text-zinc-700 leading-relaxed mb-4">
              Curabitur eu nisi quis lectus tincidunt vehicula. Sed
              imperdiet, lectus ac sodales rutrum, sapien lacus dictum
              odio, in malesuada ipsum nibh ac sapien.
            </p>

            <h2 className="text-2xl font-semibold text-brand-primary mt-10 mb-3">
              5. Your Rights and Choices
            </h2>
            <p className="text-zinc-700 leading-relaxed mb-4">
              Pellentesque habitant morbi tristique senectus et netus et
              malesuada fames ac turpis egestas. Depending on your
              jurisdiction, you may have rights to access, correct, delete,
              or export your personal data.
            </p>

            <h2 className="text-2xl font-semibold text-brand-primary mt-10 mb-3">
              6. Children&apos;s Privacy
            </h2>
            <p className="text-zinc-700 leading-relaxed mb-4">
              Donec eu libero sit amet quam egestas semper. Orvo is not
              directed to children under 13. We do not knowingly collect
              personal information from children.
            </p>

            <h2 className="text-2xl font-semibold text-brand-primary mt-10 mb-3">
              7. International Data Transfers
            </h2>
            <p className="text-zinc-700 leading-relaxed mb-4">
              Aenean ultricies mi vitae est. Mauris placerat eleifend leo.
              Quisque sit amet est et sapien ullamcorper pharetra.
            </p>

            <h2 className="text-2xl font-semibold text-brand-primary mt-10 mb-3">
              8. Security
            </h2>
            <p className="text-zinc-700 leading-relaxed mb-4">
              Vestibulum erat wisi, condimentum sed, commodo vitae,
              ornare sit amet, wisi. Aenean fermentum, elit eget tincidunt
              condimentum, eros ipsum rutrum orci.
            </p>

            <h2 className="text-2xl font-semibold text-brand-primary mt-10 mb-3">
              9. Cookies and Similar Technologies
            </h2>
            <p className="text-zinc-700 leading-relaxed mb-4">
              Sed et urna. Suspendisse potenti. Sed condimentum odio vitae
              dolor. Nulla rhoncus aliquam metus. Etiam egestas wisi a
              erat.
            </p>

            <h2 className="text-2xl font-semibold text-brand-primary mt-10 mb-3">
              10. Third-Party Services
            </h2>
            <p className="text-zinc-700 leading-relaxed mb-4">
              Maecenas faucibus mollis interdum. Cras justo odio, dapibus
              ac facilisis in, egestas eget quam. Bookings are processed
              by third-party payment, messaging, and infrastructure
              providers, each with their own privacy practices.
            </p>

            <h2 className="text-2xl font-semibold text-brand-primary mt-10 mb-3">
              11. Changes to This Privacy Policy
            </h2>
            <p className="text-zinc-700 leading-relaxed mb-4">
              Cras mattis consectetur purus sit amet fermentum. We may
              update this policy from time to time. Material changes will
              be communicated via the app or by email.
            </p>

            <h2 className="text-2xl font-semibold text-brand-primary mt-10 mb-3">
              12. Contact Us
            </h2>
            <p className="text-zinc-700 leading-relaxed mb-4">
              Questions, requests, or complaints about your privacy?
              Reach us at{' '}
              <a
                href="mailto:hello@orvo.app"
                className="text-brand-primary underline"
              >
                hello@orvo.app
              </a>
              .
            </p>
          </div>
        </article>
      </main>

      <footer className="border-t border-zinc-200 bg-zinc-50">
        <div className="max-w-6xl mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-zinc-500">
          <span>© {new Date().getFullYear()} Orvo · Universal Booking Marketplace</span>
          <nav className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-brand-primary">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-brand-primary">
              Terms
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}

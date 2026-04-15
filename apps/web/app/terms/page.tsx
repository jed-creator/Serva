import Link from 'next/link';
import type { Metadata } from 'next';

/**
 * Terms of Service.
 *
 * PLACEHOLDER — Lorem ipsum scaffold. Bridget will replace the body
 * sections below with real, lawyer-reviewed terms before launch.
 *
 * The page exists at `/terms` so App Store Connect and Google Play
 * Console can be given a stable Privacy/Terms URL during store
 * submission, and so the homepage footer can link to it. Public route
 * (no auth required), rendered as a plain server component.
 */

export const metadata: Metadata = {
  title: 'Terms of Service · Orvo',
  description:
    'The Terms of Service governing use of Orvo, the universal booking marketplace.',
};

export default function TermsPage() {
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
            Terms of Service
          </h1>
          <p className="text-sm text-zinc-500 mb-10">
            Last updated: PLACEHOLDER — replace before launch.
          </p>

          <div className="prose prose-zinc max-w-none">
            <p className="text-sm uppercase tracking-wide text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-3 py-2 mb-8">
              Placeholder content. Replace this entire document with real
              terms reviewed by counsel before launch.
            </p>

            <h2 className="text-2xl font-semibold text-brand-primary mt-10 mb-3">
              1. Acceptance of Terms
            </h2>
            <p className="text-zinc-700 leading-relaxed mb-4">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed
              do eiusmod tempor incididunt ut labore et dolore magna aliqua.
              Ut enim ad minim veniam, quis nostrud exercitation ullamco
              laboris nisi ut aliquip ex ea commodo consequat.
            </p>
            <p className="text-zinc-700 leading-relaxed mb-4">
              Duis aute irure dolor in reprehenderit in voluptate velit
              esse cillum dolore eu fugiat nulla pariatur. Excepteur sint
              occaecat cupidatat non proident, sunt in culpa qui officia
              deserunt mollit anim id est laborum.
            </p>

            <h2 className="text-2xl font-semibold text-brand-primary mt-10 mb-3">
              2. Eligibility
            </h2>
            <p className="text-zinc-700 leading-relaxed mb-4">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit.
              Curabitur eu nisi quis lectus tincidunt vehicula. Sed
              imperdiet, lectus ac sodales rutrum, sapien lacus dictum
              odio, in malesuada ipsum nibh ac sapien.
            </p>

            <h2 className="text-2xl font-semibold text-brand-primary mt-10 mb-3">
              3. Account Registration
            </h2>
            <p className="text-zinc-700 leading-relaxed mb-4">
              Pellentesque habitant morbi tristique senectus et netus et
              malesuada fames ac turpis egestas. Vestibulum tortor quam,
              feugiat vitae, ultricies eget, tempor sit amet, ante.
            </p>

            <h2 className="text-2xl font-semibold text-brand-primary mt-10 mb-3">
              4. Bookings, Cancellations, and Refunds
            </h2>
            <p className="text-zinc-700 leading-relaxed mb-4">
              Donec eu libero sit amet quam egestas semper. Aenean
              ultricies mi vitae est. Mauris placerat eleifend leo.
              Quisque sit amet est et sapien ullamcorper pharetra.
            </p>
            <p className="text-zinc-700 leading-relaxed mb-4">
              Vestibulum erat wisi, condimentum sed, commodo vitae,
              ornare sit amet, wisi. Aenean fermentum, elit eget tincidunt
              condimentum, eros ipsum rutrum orci.
            </p>

            <h2 className="text-2xl font-semibold text-brand-primary mt-10 mb-3">
              5. Provider Responsibilities
            </h2>
            <p className="text-zinc-700 leading-relaxed mb-4">
              Sed et urna. Suspendisse potenti. Sed condimentum odio vitae
              dolor. Nulla rhoncus aliquam metus. Etiam egestas wisi a
              erat.
            </p>

            <h2 className="text-2xl font-semibold text-brand-primary mt-10 mb-3">
              6. Payments and Fees
            </h2>
            <p className="text-zinc-700 leading-relaxed mb-4">
              Maecenas faucibus mollis interdum. Cras justo odio, dapibus
              ac facilisis in, egestas eget quam. Nullam quis risus eget
              urna mollis ornare vel eu leo.
            </p>

            <h2 className="text-2xl font-semibold text-brand-primary mt-10 mb-3">
              7. User Conduct
            </h2>
            <p className="text-zinc-700 leading-relaxed mb-4">
              Integer posuere erat a ante venenatis dapibus posuere velit
              aliquet. Donec id elit non mi porta gravida at eget metus.
            </p>

            <h2 className="text-2xl font-semibold text-brand-primary mt-10 mb-3">
              8. Intellectual Property
            </h2>
            <p className="text-zinc-700 leading-relaxed mb-4">
              Cum sociis natoque penatibus et magnis dis parturient montes,
              nascetur ridiculus mus. Donec sed odio dui.
            </p>

            <h2 className="text-2xl font-semibold text-brand-primary mt-10 mb-3">
              9. Disclaimers and Limitation of Liability
            </h2>
            <p className="text-zinc-700 leading-relaxed mb-4">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit.
              Donec ullamcorper nulla non metus auctor fringilla. Nullam
              quis risus eget urna mollis ornare vel eu leo.
            </p>

            <h2 className="text-2xl font-semibold text-brand-primary mt-10 mb-3">
              10. Termination
            </h2>
            <p className="text-zinc-700 leading-relaxed mb-4">
              Aenean lacinia bibendum nulla sed consectetur. Vestibulum id
              ligula porta felis euismod semper.
            </p>

            <h2 className="text-2xl font-semibold text-brand-primary mt-10 mb-3">
              11. Changes to These Terms
            </h2>
            <p className="text-zinc-700 leading-relaxed mb-4">
              Cras mattis consectetur purus sit amet fermentum. Nullam
              quis risus eget urna mollis ornare vel eu leo.
            </p>

            <h2 className="text-2xl font-semibold text-brand-primary mt-10 mb-3">
              12. Contact
            </h2>
            <p className="text-zinc-700 leading-relaxed mb-4">
              Questions about these terms? Reach us at{' '}
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

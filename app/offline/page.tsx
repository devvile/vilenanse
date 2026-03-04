import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
    title: 'Offline - Holi App',
    description: 'You are currently offline.',
}

export default function OfflinePage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
            <div className="w-20 h-20 mb-6 rounded-full bg-card-border/10 flex items-center justify-center">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="40"
                    height="40"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-text-muted"
                >
                    <path d="M1 1l22 22" />
                    <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55" />
                    <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39" />
                    <path d="M10.71 5.05A16 16 0 0 1 22.58 9" />
                    <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88" />
                    <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
                    <path d="M12 20h.01" />
                </svg>
            </div>
            <h1 className="text-3xl font-bold mb-2">You're Offline</h1>
            <p className="text-text-secondary mb-8 max-w-md">
                It looks like you've lost your internet connection.
                Don't worry, you can still access some features of the app once they are cached.
            </p>
            <Link href="/" className="btn btn-primary px-8">
                Try Again
            </Link>
        </div>
    )
}

import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'User Registration | Next.js & NestJS & Prisma',
  description: 'A modern, full-stack user registration application powered by Next.js, NestJS, Prisma ORM, and PostgreSQL.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className="bg-orb bg-orb-1"></div>
        <div className="bg-orb bg-orb-2"></div>
        {children}
      </body>
    </html>
  );
}

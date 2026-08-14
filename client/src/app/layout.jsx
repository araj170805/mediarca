import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BookingModal from '@/components/BookingModal';
import AuthModal from '@/components/AuthModal';

export const metadata = {
  title: 'MediArca - Find the Right Doctor, Book with Confidence',
  description: 'Discover trusted doctors near you and book appointments easily with MediArca healthcare platform.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
        <AuthProvider>
          <Navbar />
          <main className="flex-grow">{children}</main>
          <Footer />
          <BookingModal />
          <AuthModal />
        </AuthProvider>
      </body>
    </html>
  );
}

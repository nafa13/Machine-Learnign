import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "../components/layout/Navbar";
import Sidebar from "../components/layout/Sidebar";
import Footer from "../components/layout/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "NEXUS",
  description: "Advanced Machine Learning Prediction Platform",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        <div className="dashboard-layout">
          <Sidebar />
          <div className="dashboard-main">
            <Navbar />
            <main className="dashboard-content">
              {children}
            </main>
            <Footer />
          </div>
        </div>
      </body>
    </html>
  );
}

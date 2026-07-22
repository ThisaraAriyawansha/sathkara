import { Poppins, Noto_Sans_Sinhala } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/context/LanguageContext";
import { AuthProvider } from "@/context/AuthContext";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
});

const notoSinhala = Noto_Sans_Sinhala({
  subsets: ["sinhala"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-noto-sinhala",
});

export const metadata = {
  title: "සත්කාර | Sathkara",
  description: "ඔබගේ සත්කාර සදා මතකයේ තබාගන්න",
  icons: {
    icon: "/img/logo-icon.png",
    shortcut: "/img/logo-icon.png",
    apple: "/img/logo-icon.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="si">
      <body className={`${poppins.variable} ${notoSinhala.variable} font-sans bg-background text-charcoal`}>
        <AuthProvider>
          <LanguageProvider>{children}</LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

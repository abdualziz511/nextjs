import './globals.css';

export const metadata = {
  title: 'استوديو النبلاء للصوتيات | شيلات، زفات، أناشيد',
  description: 'الموقع الرسمي لاستوديو النبلاء للصوتيات - شيلات حماسية بالأسماء، زفات أفراح فخمة، تسجيل وتوزيع صوتي احترافي.',
  manifest: '/manifest.json',
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl">
      <body>
        {children}
      </body>
    </html>
  );
}

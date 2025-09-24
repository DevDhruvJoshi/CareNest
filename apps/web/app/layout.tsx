export const metadata = {
  title: 'CareNest',
  description: 'CareNest web app'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="gu">
      <body style={{ margin: 0, fontFamily: 'system-ui', background: '#000', color: '#fff' }}>{children}</body>
    </html>
  );
}



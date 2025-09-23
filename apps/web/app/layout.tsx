export const metadata = {
  title: 'CareNest',
  description: 'CareNest web app'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: 'system-ui' }}>{children}</body>
    </html>
  );
}



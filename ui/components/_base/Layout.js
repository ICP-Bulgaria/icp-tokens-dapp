import React from 'react';
import Header from './header/Header';
import Footer from './Footer';
import ThemeRegistry from '../../../utils/ThemeRegistry';

const Layout = ({ children }) => {
  return (
    <div>
      <ThemeRegistry options={{ key: 'mui-theme' }}>
        <Header />
          <main className="pt-[84px] mx-auto container px-4 md:px-8">
            {children}
          </main>
        <Footer />
      </ThemeRegistry>
    </div>
  );
};

export default Layout;

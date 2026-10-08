import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Hero from '../components/Hero.jsx';
import NailGrid from '../components/NailGrid.jsx';
import PriceList from '../components/PriceList.jsx';

export default function Home() {
  const { hash, key } = useLocation();

  useEffect(() => {
    if (hash) document.querySelector(hash)?.scrollIntoView({ behavior: 'smooth' });
    else window.scrollTo({ top: 0, behavior: 'smooth' }); // "Home" / logo → top of the page
  }, [hash, key]);

  return (
    <>
      <Hero />
      <main>
        <NailGrid />
        <PriceList />
      </main>
    </>
  );
}

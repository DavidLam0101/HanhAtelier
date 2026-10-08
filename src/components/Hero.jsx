import { useSite } from '../context/SiteContext.jsx';
import { usePhotoPicker } from '../hooks/usePhotoPicker.jsx';

export default function Hero() {
  const { hero, setHero, isAdmin } = useSite();
  // 2:1 crop to match the hero's shape, exported at 1800px wide for sharp desktop display
  const { pick, picker } = usePhotoPicker({ aspect: '2 / 1', outWidth: 1800 });

  return (
    <header className="hero" id="home" style={hero ? { backgroundImage: `url(${hero})` } : undefined}>
      {/* Sized in CSS to span ~30% of the photo width (.hero h1 in index.css) */}
      <h1>Just Nail It</h1>
      {isAdmin && (
        <button className="chip hero-photo-btn" onClick={() => pick(setHero)}>Change photo</button>
      )}
      {picker}
    </header>
  );
}

import { useSite } from '../context/SiteContext.jsx';

/* Fixed on top of everything. Opens the booking link once the owner sets one. */
export default function BookButton() {
  const { bookUrl } = useSite();
  return bookUrl ? (
    <a className="book" href={bookUrl} target="_blank" rel="noopener noreferrer">Book</a>
  ) : (
    <a className="book" href="/#prices">Book</a>
  );
}

import EditableText from './EditableText.jsx';
import { useSite } from '../context/SiteContext.jsx';

/* Three editable columns. The admin can rename headings, edit any line,
   and add or remove lines; visitors see plain text. */
export default function Footer() {
  const { footer, setFooter, isAdmin } = useSite();

  const setTitle = (key) => (text) =>
    setFooter((f) => ({ ...f, titles: { ...f.titles, [key]: text } }));
  const setItem = (key, i, item) =>
    setFooter((f) => ({ ...f, [key]: f[key].map((old, j) => (j === i ? item : old)) }));
  const addItem = (key, item) => setFooter((f) => ({ ...f, [key]: [...f[key], item] }));
  const removeItem = (key, i) => setFooter((f) => ({ ...f, [key]: f[key].filter((_, j) => j !== i) }));

  const title = (key) => (
    <h3>
      <EditableText editing={isAdmin} value={footer.titles[key]} onSave={setTitle(key)} label="Column heading" />
    </h3>
  );

  const removeBtn = (key, i, what) =>
    isAdmin && (
      <button type="button" className="footer-remove" aria-label={`Remove ${what}`} onClick={() => removeItem(key, i)}>
        ×
      </button>
    );

  const addBtn = (key, item, text) =>
    isAdmin && (
      <button type="button" className="chip footer-add" onClick={() => addItem(key, item)}>
        {text}
      </button>
    );

  const lines = (key, label) => (
    <>
      <ul className="footer-lines">
        {footer[key].map((line, i) => (
          <li key={i}>
            <EditableText editing={isAdmin} value={line} onSave={(t) => setItem(key, i, t)} label={`${label} line ${i + 1}`} />
            {removeBtn(key, i, `${label.toLowerCase()} line ${i + 1}`)}
          </li>
        ))}
      </ul>
      {addBtn(key, 'New line', '+ Add line')}
    </>
  );

  return (
    <footer className="footer" id="contact">
      <div className="wrap footer-grid">
        <section>
          {title('address')}
          {lines('address', 'Address')}
        </section>

        <section>
          {title('hours')}
          <ul className="footer-hours">
            {footer.hours.map(([day, time], i) => (
              <li key={i}>
                <span className="day">
                  <EditableText editing={isAdmin} value={day} onSave={(d) => setItem('hours', i, [d, time])} label={`Day ${i + 1}`} />:
                </span>
                <EditableText editing={isAdmin} value={time} onSave={(t) => setItem('hours', i, [day, t])} label={`${day} hours`} />
                {removeBtn('hours', i, day)}
              </li>
            ))}
          </ul>
          {addBtn('hours', ['Day', '9:00 am – 5:00 pm'], '+ Add day')}
        </section>

        <section>
          {title('contact')}
          {lines('contact', 'Contact')}
        </section>
      </div>
    </footer>
  );
}

import EditableTextArea from '../components/EditableTextArea.jsx';
import { useSite } from '../context/SiteContext.jsx';
import { usePhotoPicker } from '../hooks/usePhotoPicker.jsx';

/* Round photo on the left, description on the right.
   The admin can change the photo and edit the description in place. */
export default function Profile() {
  const { profile, setProfile, isAdmin } = useSite();
  const { pick, picker } = usePhotoPicker({ aspect: '1 / 1', outWidth: 600, round: true });

  return (
    <main className="wrap profile-page">
      <section className="profile-card">
        <div className="profile-photo-col">
          <div
            className="profile-photo"
            style={profile.photo ? { backgroundImage: `url(${profile.photo})` } : undefined}
            role="img"
            aria-label="Profile photo"
          />
          {isAdmin && (
            <button className="chip" type="button" onClick={() => pick((photo) => setProfile((p) => ({ ...p, photo })))}>
              Change photo
            </button>
          )}
        </div>

        <EditableTextArea
          className="profile-desc"
          editing={isAdmin}
          value={profile.description}
          label="Profile description"
          rows={8}
          onSave={(description) => setProfile((p) => ({ ...p, description }))}
        />
      </section>
      {picker}
    </main>
  );
}

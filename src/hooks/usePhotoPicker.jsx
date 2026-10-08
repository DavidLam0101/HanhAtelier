import { useRef, useState } from 'react';
import CropModal from '../components/CropModal.jsx';

/**
 * Opens the file chooser, then the crop modal.
 * Usage:
 *   const { pick, picker } = usePhotoPicker({ aspect: '1 / 1', outWidth: 800, arch: true });
 *   pick(url => save(url));   // and render {picker} somewhere in the component
 */
export function usePhotoPicker({ aspect, outWidth, arch = false, round = false }) {
  const inputRef = useRef(null);
  const callback = useRef(null);
  const [file, setFile] = useState(null);

  const pick = (onDone) => {
    callback.current = onDone;
    inputRef.current.value = '';
    inputRef.current.click();
  };

  const picker = (
    <>
      <input ref={inputRef} type="file" accept="image/*" hidden
             onChange={(e) => e.target.files[0] && setFile(e.target.files[0])} />
      {file && (
        <CropModal
          file={file} aspect={aspect} outWidth={outWidth} arch={arch} round={round}
          onCancel={() => setFile(null)}
          onDone={(url) => { setFile(null); callback.current?.(url); }}
        />
      )}
    </>
  );

  return { pick, picker };
}

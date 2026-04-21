interface ImageUploaderProps {
  onChange?: (files: FileList | null) => void;
}

export default function ImageUploader({ onChange }: ImageUploaderProps) {
  return (
    <label className="field">
      <span>Referencia de imagen</span>
      <input type="file" accept="image/*" onChange={(event) => onChange?.(event.target.files)} />
    </label>
  );
}

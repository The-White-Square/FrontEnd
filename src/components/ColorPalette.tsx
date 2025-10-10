interface ColorPaletteProps {
  colors: string[];
  selectedColor: string;
  onColorSelect: (color: string) => void;
}

const ColorPalette = ({ 
  colors, 
  selectedColor, 
  onColorSelect 
}: ColorPaletteProps) => {
  return (
    <div className="color-palette">
      {colors.map((color, index) => (
        <button
          key={index}
          className={`color-button ${selectedColor === color ? 'selected' : ''}`}
          style={{ backgroundColor: color }}
          onClick={() => onColorSelect(color)}
        />
      ))}
    </div>
  );
};

export default ColorPalette;
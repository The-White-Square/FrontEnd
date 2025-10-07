import { useState } from "react";
import { IoIosSettings } from "react-icons/io";
import { FaVolumeDown, FaVolumeMute } from "react-icons/fa";
import FloatingIconButton from './FloatingIconButton';

function FloatingControls() {
  const [muted, setMuted] = useState(false);

  return (
    <div
      className="floating-icons"
      style={{
        position: "absolute",
        top: "2.5%",
        left: "2.5%",
        display: "flex",
        flexDirection: "column",
        gap: "1.5vw",
        zIndex: 3,
      }}
    >
      <FloatingIconButton
        onClick={() => setMuted((m) => !m)}
        ariaLabel={muted ? "Unmute sound" : "Mute sound"}
      >
        {muted ? (
          <FaVolumeMute
            size="2vw"
            style={{
              minWidth: 22,
              minHeight: 22,
              maxWidth: 32,
              maxHeight: 32,
            }}
            color="#fff"
          />
        ) : (
          <FaVolumeDown
            size="2vw"
            style={{
              minWidth: 22,
              minHeight: 22,
              maxWidth: 32,
              maxHeight: 32,
            }}
            color="#fff"
          />
        )}
      </FloatingIconButton>
      <FloatingIconButton ariaLabel="Settings">
        <IoIosSettings
          size="2vw"
          style={{
            minWidth: 22,
            minHeight: 22,
            maxWidth: 32,
            maxHeight: 32,
          }}
          color="#fff"
        />
      </FloatingIconButton>
    </div>
  );
}

export default FloatingControls;
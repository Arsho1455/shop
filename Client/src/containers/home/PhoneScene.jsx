import './phone-scene.css';

function CameraLens({ number }) {
  return (
    <span className={`ps-camera-lens ps-camera-lens--${number}`}>
      <span className="ps-camera-glass"><span /></span>
    </span>
  );
}

/** Decorative product study. Inherited scene coordinates are numbers from -1 to 1. */
export default function PhoneScene({ compact = false }) {
  return (
    <div className={`phone-scene${compact ? ' phone-scene--compact' : ''}`} aria-hidden="true">
      <div className="ps-atmosphere" />
      <div className="ps-orbit ps-orbit--one" />
      <div className="ps-orbit ps-orbit--two" />
      <div className="ps-floor" />

      <div className="ps-assembly">
        <div className="ps-device ps-device--rear">
          <div className="ps-rear-surface">
            <div className="ps-camera-platform">
              <CameraLens number={1} />
              <CameraLens number={2} />
              <CameraLens number={3} />
              <span className="ps-camera-flash" />
              <span className="ps-camera-sensor" />
              <span className="ps-camera-mic" />
            </div>
            <svg className="ps-device-mark" viewBox="0 0 24 28" fill="currentColor">
              <path d="M16.7 4.5c1-1.2 1.7-2.8 1.5-4.5-1.5.1-3.3 1-4.3 2.2-.9 1-1.7 2.6-1.5 4.2 1.7.1 3.3-.8 4.3-1.9ZM20.4 14.8c0-3.4 2.8-5 2.9-5.1-1.6-2.3-4.1-2.6-5-2.6-2.1-.2-4.1 1.3-5.2 1.3-1 0-2.7-1.3-4.5-1.2-2.3 0-4.5 1.3-5.7 3.3C.5 14.5 2.3 20.5 4.6 23.9c1.2 1.7 2.5 3.6 4.3 3.5 1.7-.1 2.4-1.1 4.5-1.1 2.1 0 2.7 1.1 4.5 1 1.9 0 3.1-1.7 4.2-3.4 1.3-1.9 1.9-3.7 1.9-3.8-.1 0-3.6-1.4-3.6-5.3Z" />
            </svg>
            <span className="ps-rear-engraving">DESIGNED FOR POSSIBILITY</span>
          </div>
          <span className="ps-hardware ps-hardware--action" />
          <span className="ps-hardware ps-hardware--volume-one" />
          <span className="ps-hardware ps-hardware--volume-two" />
          <span className="ps-antenna ps-antenna--top" />
          <span className="ps-antenna ps-antenna--bottom" />
        </div>

        <div className="ps-device ps-device--front">
          <div className="ps-front-rim">
            <div className="ps-screen">
              <div className="ps-wallpaper">
                <span className="ps-wallpaper-glow" />
                <span className="ps-wallpaper-fold ps-wallpaper-fold--one" />
                <span className="ps-wallpaper-fold ps-wallpaper-fold--two" />
                <span className="ps-wallpaper-fold ps-wallpaper-fold--three" />
              </div>
              <div className="ps-status-bar">
                <span>9:41</span>
                <span className="ps-status-icons">
                  <span className="ps-signal"><i /><i /><i /><i /></span>
                  <span className="ps-wifi" />
                  <span className="ps-battery" />
                </span>
              </div>
              <div className="ps-dynamic-island"><span /></div>
              <div className="ps-screen-reflection" />
              <span className="ps-home-indicator" />
            </div>
          </div>
          <span className="ps-hardware ps-hardware--power" />
          <span className="ps-antenna ps-antenna--top" />
          <span className="ps-antenna ps-antenna--bottom" />
        </div>
      </div>

      <div className="ps-detail ps-detail--top"><span className="ps-detail-dot" /> PURE PRECISION</div>
      <div className="ps-detail ps-detail--bottom"><span className="ps-detail-rule" /> MADE TO STAND OUT</div>
      <div className="ps-coordinate">01 — 03</div>
    </div>
  );
}

import { useState, useEffect, useRef } from 'react';
import '../styles/ShareModal.css';

const ShareModal = ({ service, onClose }) => {
  const [showCopySuccess, setShowCopySuccess] = useState(false);
  const modalRef = useRef(null);

  const getShareUrl = () => window.location.href;

  const getShareText = () =>
    `Check out this amazing service: ${service?.title} by ${service?.provider_name} - Only ₹${service?.base_price}!`;

  const handleShareOption = (platform) => {
    const url = getShareUrl();
    const text = getShareText();

    switch (platform) {
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`, '_blank');
        break;
      case 'linkedin':
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'gmail':
        window.open(`https://mail.google.com/mail/?view=cm&fs=1&su=${encodeURIComponent("Check this out!")}&body=${encodeURIComponent(text + '\n\n' + url)}`, '_blank');
        break;
      case 'copy':
        navigator.clipboard.writeText(url).then(() => {
          setShowCopySuccess(true);
          setTimeout(() => setShowCopySuccess(false), 3000);
        });
        break;
      default:
        break;
    }
    onClose();
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const shareOptions = [
    {
      platform: 'whatsapp',
      label: 'WhatsApp',
      color: '#25d366',
      bgClass: 'whatsapp',
      icon: (
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zm-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884zm8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.525 3.488z" />
      ),
    },
    {
      platform: 'linkedin',
      label: 'LinkedIn',
      color: '#0077b5',
      bgClass: 'linkedin',
      icon: (
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      ),
    },
    {
      platform: 'gmail',
      label: 'Gmail',
      color: '#ea4335',
      bgClass: 'gmail',
      icon: (
        <path d="M12 13.065L2 6.545v10.91c0 .8.645 1.455 1.445 1.545h17.11c.8-.09 1.445-.745 1.445-1.545V6.545L12 13.065zM12 11.36l10-6.545H2l10 6.545z" />
      ),
    },
    {
      platform: 'copy',
      label: 'Copy Link',
      color: '#8b5cf6',
      bgClass: 'copy',
      icon: (
        <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" />
      ),
    },
  ];

  return (
    <>
      <div className="share-modal-overlay" role="dialog" aria-modal="true">
        <div className="share-modal" ref={modalRef}>
          <div className="share-modal-header">
            <h3>Share this service</h3>
            <button className="close-modal" onClick={onClose} aria-label="Close share modal">
              &times;
            </button>
          </div>

          <div className="share-options-grid">
            {shareOptions.map(({ platform, label, color, bgClass, icon }) => (
              <button
                key={platform}
                className={`share-option ${bgClass}`}
                onClick={() => handleShareOption(platform)}
                aria-label={`Share on ${label}`}
              >
                <div className="share-option-icon-container">
                  <svg className="share-option-icon" viewBox="0 0 24 24" fill={color}>
                    {icon}
                  </svg>
                </div>
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {showCopySuccess && (
        <div className="copy-success show">
          <svg className="success-icon" viewBox="0 0 24 24" fill="none">
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" fill="currentColor" />
          </svg>
          Link copied to clipboard!
        </div>
      )}
    </>
  );
};

export default ShareModal;
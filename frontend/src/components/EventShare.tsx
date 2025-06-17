import React from "react";
import {
  FacebookShareButton,
  TwitterShareButton,
  LinkedinShareButton,
  FacebookIcon,
  TwitterIcon,
  LinkedinIcon,
} from "react-share";

const EventShare: React.FC<{ eventUrl: string }> = ({ eventUrl }) => {
  const handleCopyLink = () => {
    navigator.clipboard.writeText(eventUrl).then(() => {
      alert("Link copied to clipboard!");
    });
  };

  return (
    <div className="share-buttons">
      <FacebookShareButton url={eventUrl}>
        <FacebookIcon size={32} round />
      </FacebookShareButton>
      <TwitterShareButton url={eventUrl}>
        <TwitterIcon size={32} round />
      </TwitterShareButton>
      <LinkedinShareButton url={eventUrl}>
        <LinkedinIcon size={32} round />
      </LinkedinShareButton>

      <button onClick={handleCopyLink} className="copy-link-button">
        Copy Link
      </button>
    </div>
  );
};

export default EventShare;

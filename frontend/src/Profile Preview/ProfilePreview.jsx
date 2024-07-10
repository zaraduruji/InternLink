import React, { useContext } from 'react';
import { UserContext } from '../UserContext';
import './ProfilePreview.css'; // Create and style this CSS file

const ProfilePreview = () => {
  const { user } = useContext(UserContext);

  if (!user) {
    return null;
  }

  return (
    <div className="profile-preview">
      <div className="profile-preview-avatar">
        {/* Add avatar image if you have one, otherwise a default avatar */}
        <img src={user.avatar || '/default-avatar.png'} alt="Avatar" />
      </div>
      <div className="profile-preview-info">
        <div className="profile-preview-name">{user.firstName} {user.lastName}</div>
        <div className="profile-preview-role">{user.jobTitle || '--'}</div>
        <button className="profile-preview-button" onClick={() => window.location.href = '/profile'}>View Profile</button>
      </div>
    </div>
  );
};

export default ProfilePreview;

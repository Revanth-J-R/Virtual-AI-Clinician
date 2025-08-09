"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './Profile.module.css';

const Profile = () => {
  const [profiles, setProfiles] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingProfile, setEditingProfile] = useState(null);
  const router = useRouter();

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    role: '',
    avatar: ''
  });

  const familyRoles = [
    'Father', 'Mother', 'Son', 'Daughter', 
    'Grandfather', 'Grandmother', 'Uncle', 'Aunt', 'Other'
  ];

  const defaultAvatars = {
    'Father': '👨‍⚕️',
    'Mother': '👩‍⚕️', 
    'Son': '👦',
    'Daughter': '👧',
    'Grandfather': '👴',
    'Grandmother': '👵',
    'Uncle': '👨',
    'Aunt': '👩',
    'Other': '👤'
  };

  // Sample initial profiles (for demo)
  const sampleProfiles = [
    {
      id: '1',
      name: 'John Smith',
      age: 45,
      role: 'Father',
      avatar: '👨‍⚕️',
      createdAt: new Date().toISOString()
    },
    {
      id: '2',
      name: 'Mary Smith',
      age: 42,
      role: 'Mother',
      avatar: '👩‍⚕️',
      createdAt: new Date().toISOString()
    }
  ];

  // Load profiles from localStorage on component mount
  useEffect(() => {
    const savedProfiles = localStorage.getItem('familyProfiles');
    if (savedProfiles) {
      setProfiles(JSON.parse(savedProfiles));
    } else {
      // Set sample profiles if none exist
      setProfiles(sampleProfiles);
      localStorage.setItem('familyProfiles', JSON.stringify(sampleProfiles));
    }
  }, []);

  // Save profiles to localStorage whenever profiles change
  useEffect(() => {
    if (profiles.length > 0) {
      localStorage.setItem('familyProfiles', JSON.stringify(profiles));
    }
  }, [profiles]);

  const handleCreateProfile = (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.age || !formData.role) {
      alert('Please fill in all required fields');
      return;
    }

    const profileData = {
      id: editingProfile ? editingProfile.id : Date.now().toString(),
      name: formData.name,
      age: parseInt(formData.age),
      role: formData.role,
      avatar: formData.avatar || defaultAvatars[formData.role] || '👤',
      createdAt: editingProfile ? editingProfile.createdAt : new Date().toISOString()
    };

    if (editingProfile) {
      // Update existing profile
      setProfiles(profiles.map(profile => 
        profile.id === editingProfile.id ? profileData : profile
      ));
    } else {
      // Add new profile
      setProfiles([...profiles, profileData]);
    }

    setShowModal(false);
    setEditingProfile(null);
    setFormData({ name: '', age: '', role: '', avatar: '' });
  };

  const handleDeleteProfile = (profileId) => {
    if (window.confirm('Are you sure you want to delete this profile? All chat history will be lost.')) {
      setProfiles(profiles.filter(profile => profile.id !== profileId));
    }
  };

  const handleEditProfile = (profile) => {
    setEditingProfile(profile);
    setFormData({
      name: profile.name,
      age: profile.age.toString(),
      role: profile.role,
      avatar: profile.avatar
    });
    setShowModal(true);
  };

  const handleSelectProfile = (profile) => {
    localStorage.setItem('selectedProfile', JSON.stringify(profile));
    console.log('Profile selected:', profile);
    // Change this to your chatbot route
    router.push('/GS'); 
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingProfile(null);
    setFormData({ name: '', age: '', role: '', avatar: '' });
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Who's seeking health support today?</h1>
        <p className={styles.subtitle}>Choose your profile to continue with personalized care</p>
      </div>

      <div className={styles.profilesWrapper}>
        <div className={styles.profilesGrid}>
          {profiles.map((profile) => (
            <div key={profile.id} className={styles.profileCard}>
              <div className={styles.profileImageContainer}>
                <div 
                  className={styles.profileImage}
                  onClick={() => handleSelectProfile(profile)}
                >
                  <span className={styles.avatar}>{profile.avatar}</span>
                </div>
                <div className={styles.profileActions}>
                  <button 
                    className={styles.editBtn}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditProfile(profile);
                    }}
                    title="Edit Profile"
                  >
                    ✏️
                  </button>
                  <button 
                    className={styles.deleteBtn}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteProfile(profile.id);
                    }}
                    title="Delete Profile"
                  >
                    🗑️
                  </button>
                </div>
              </div>
              <div className={styles.profileInfo}>
                <h3 className={styles.profileName}>{profile.name}</h3>
                <p className={styles.profileDetails}>{profile.role} • Age {profile.age}</p>
              </div>
            </div>
          ))}

          {/* Add Profile Card */}
          <div className={styles.profileCard}>
            <div className={styles.profileImageContainer}>
              <div 
                className={`${styles.profileImage} ${styles.addProfileImage}`}
                onClick={() => setShowModal(true)}
              >
                <span className={styles.addIcon}>+</span>
              </div>
            </div>
            <div className={styles.profileInfo}>
              <h3 className={styles.profileName}>Add Profile</h3>
              <p className={styles.profileDetails}>Create new family member</p>
            </div>
          </div>
        </div>
      </div>

      {/* Modal for Create/Edit Profile */}
      {showModal && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>{editingProfile ? 'Edit Profile' : 'Add New Family Member'}</h2>
              <button 
                className={styles.closeBtn}
                onClick={closeModal}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleCreateProfile} className={styles.form}>
              <div className={styles.inputGroup}>
                <label htmlFor="name">Full Name *</label>
                <input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Enter full name"
                  required
                />
              </div>

              <div className={styles.inputRow}>
                <div className={styles.inputGroup}>
                  <label htmlFor="age">Age *</label>
                  <input
                    id="age"
                    type="number"
                    min="0"
                    max="120"
                    value={formData.age}
                    onChange={(e) => setFormData({...formData, age: e.target.value})}
                    placeholder="Age"
                    required
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label htmlFor="role">Family Role *</label>
                  <select
                    id="role"
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                    required
                  >
                    <option value="">Select role</option>
                    {familyRoles.map(role => (
                      <option key={role} value={role}>{role}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="avatar">Avatar (Optional)</label>
                <input
                  id="avatar"
                  type="text"
                  value={formData.avatar}
                  onChange={(e) => setFormData({...formData, avatar: e.target.value})}
                  placeholder="Enter emoji or leave blank for default"
                />
                <small className={styles.helpText}>
                  Leave empty to use default avatar for the selected role
                </small>
              </div>

              <div className={styles.buttonGroup}>
                <button type="button" onClick={closeModal} className={styles.cancelBtn}>
                  Cancel
                </button>
                <button type="submit" className={styles.saveBtn}>
                  {editingProfile ? 'Update Profile' : 'Create Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
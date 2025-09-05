import React, { useState, useEffect } from 'react';
import { Plus, Trash2, User, Loader2, ArrowLeft } from 'lucide-react';
import axios from 'axios';

export default function Edit() {
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    education: '',
    skills: [''],
    projects: [{ title: '', description: '', link: '' }],
    work: [{ title: '', description: '' }],
    links: { github: '', linkedin: '', portfolio: '' }
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [userEmail, setUserEmail] = useState('');

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

  // Get email from URL query params
  const getEmailFromQuery = () => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('email');
  };

  // Get user email from various sources
  const getUserEmail = () => {
    // First try URL params
    const emailFromUrl = getEmailFromQuery();
    if (emailFromUrl) {
      return emailFromUrl;
    }

    // Fallback to localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        return user.email;
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }

    return null;
  };

  // Fetch existing profile data
  const fetchProfile = async (email) => {
    setIsLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      console.log('Fetching profile for email:', email);
      const response = await axios.get(`${apiUrl}/profiles/${email}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('Profile data received:', response.data);
      
      // Set the profile data, ensuring arrays have at least one item
      setProfile({
        name: response.data.name || '',
        email: response.data.email || email,
        education: response.data.education || '',
        skills: response.data.skills && response.data.skills.length > 0 ? response.data.skills : [''],
        projects: response.data.projects && response.data.projects.length > 0 ? response.data.projects : [{ title: '', description: '', link: '' }],
        work: response.data.work && response.data.work.length > 0 ? response.data.work : [{ title: '', description: '' }],
        links: response.data.links || { github: '', linkedin: '', portfolio: '' }
      });

    } catch (error) {
      console.error('Error fetching profile:', error);
      
      if (error.response?.status === 401) {
        setError('Session expired. Please login again.');
        setTimeout(() => {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/auth';
        }, 2000);
      } else if (error.response?.status === 404) {
        setError('Profile not found. Please create your profile first.');
      } else {
        setError(`Failed to load profile: ${error.response?.data?.message || error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize component
  useEffect(() => {
    const email = getUserEmail();
    
    if (!email) {
      setError('No email found. Please ensure you accessed this page correctly.');
      return;
    }

    console.log('User email found:', email);
    setUserEmail(email);
    fetchProfile(email);

    // Check for authentication
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Please login first');
      setTimeout(() => {
        window.location.href = '/auth';
      }, 2000);
    }
  }, []);

  const updateField = (field, value) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const updateArrayField = (field, index, key, value) => {
    const newArray = [...profile[field]];
    if (key) newArray[index] = { ...newArray[index], [key]: value };
    else newArray[index] = value;
    setProfile(prev => ({ ...prev, [field]: newArray }));
  };

  const addArrayItem = (field, defaultItem) => {
    setProfile(prev => ({ ...prev, [field]: [...prev[field], defaultItem] }));
  };

  const removeArrayItem = (field, index) => {
    if (profile[field].length > 1) {
      setProfile(prev => ({ ...prev, [field]: prev[field].filter((_, i) => i !== index) }));
    }
  };

  const handleSubmit = async () => {
    // Validation
    if (!profile.name || !profile.email || !profile.education) {
      setError('Please fill all required fields (Name, Email, Education)');
      return;
    }

    setIsSaving(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Filter out empty values
      const filteredProfile = {
        ...profile,
        skills: profile.skills.filter(skill => skill.trim()),
        projects: profile.projects.filter(project => project.title.trim() || project.description.trim()),
        work: profile.work.filter(work => work.title.trim() || work.description.trim())
      };

      console.log('Updating profile:', JSON.stringify(filteredProfile, null, 2));
      console.log('PUT URL:', `${apiUrl}/profiles/${userEmail}`);

      const response = await axios.put(`${apiUrl}/profiles/${userEmail}`, filteredProfile, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Profile update response:', response.data);
      setSuccess('Profile updated successfully!');
      
      // Redirect to dashboard after successful update
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 2000);

    } catch (error) {
      console.error('Error updating profile:', error);
      
      if (error.response?.status === 401) {
        setError('Session expired. Please login again.');
        setTimeout(() => {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/auth';
        }, 2000);
      } else {
        setError(`Failed to update profile: ${error.response?.data?.message || error.message}`);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleBackToDashboard = () => {
    window.location.href = '/dashboard';
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-lg text-gray-600">Loading profile data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <User className="w-6 h-6 text-blue-600" />
            <h1 className="text-2xl font-bold">Edit Profile</h1>
            {userEmail && <span className="text-sm text-gray-500">({userEmail})</span>}
          </div>
          <button
            onClick={handleBackToDashboard}
            className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Success Display */}
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {success}
          </div>
        )}

        <div className="space-y-6">
          {/* Basic Info */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block font-medium mb-2">Name *</label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => updateField('name', e.target.value)}
                className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Full name"
                disabled={isSaving}
              />
            </div>
            <div>
              <label className="block font-medium mb-2">Email *</label>
              <input
                type="email"
                value={profile.email}
                onChange={(e) => updateField('email', e.target.value)}
                className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                placeholder="Email address"
                disabled={true} // Email should not be editable
              />
              <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
            </div>
          </div>

          {/* Education */}
          <div>
            <label className="block font-medium mb-2">Education *</label>
            <input
              type="text"
              value={profile.education}
              onChange={(e) => updateField('education', e.target.value)}
              className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="B.Tech CSE - IIIT Kottayam"
              disabled={isSaving}
            />
          </div>

          {/* Skills */}
          <div>
            <label className="block font-medium mb-2">Skills *</label>
            {profile.skills.map((skill, i) => (
              <div key={i} className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={skill}
                  onChange={(e) => updateArrayField('skills', i, null, e.target.value)}
                  className="flex-1 p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., React, Node.js"
                  disabled={isSaving}
                />
                {profile.skills.length > 1 && (
                  <button
                    onClick={() => removeArrayItem('skills', i)}
                    className="p-3 text-red-500 hover:bg-red-50 rounded"
                    disabled={isSaving}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
            <button
              onClick={() => addArrayItem('skills', '')}
              className="flex items-center gap-2 px-3 py-2 text-blue-600 hover:bg-blue-50 rounded"
              disabled={isSaving}
            >
              <Plus className="w-4 h-4" /> Add Skill
            </button>
          </div>

          {/* Projects */}
          <div>
            <label className="block font-medium mb-2">Projects</label>
            {profile.projects.map((project, i) => (
              <div key={i} className="p-4 border rounded mb-4 bg-gray-50">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-medium">Project {i + 1}</h4>
                  {profile.projects.length > 1 && (
                    <button
                      onClick={() => removeArrayItem('projects', i)}
                      className="text-red-500 hover:bg-red-100 p-1 rounded"
                      disabled={isSaving}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <div className="space-y-3">
                  <input
                    type="text"
                    value={project.title}
                    onChange={(e) => updateArrayField('projects', i, 'title', e.target.value)}
                    className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Project title"
                    disabled={isSaving}
                  />
                  <textarea
                    value={project.description}
                    onChange={(e) => updateArrayField('projects', i, 'description', e.target.value)}
                    className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    rows="2"
                    placeholder="Project description"
                    disabled={isSaving}
                  />
                  <input
                    type="url"
                    value={project.link}
                    onChange={(e) => updateArrayField('projects', i, 'link', e.target.value)}
                    className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Project link (optional)"
                    disabled={isSaving}
                  />
                </div>
              </div>
            ))}
            <button
              onClick={() => addArrayItem('projects', { title: '', description: '', link: '' })}
              className="flex items-center gap-2 px-3 py-2 text-blue-600 hover:bg-blue-50 rounded"
              disabled={isSaving}
            >
              <Plus className="w-4 h-4" /> Add Project
            </button>
          </div>

          {/* Work Experience */}
          <div>
            <label className="block font-medium mb-2">Work Experience</label>
            {profile.work.map((work, i) => (
              <div key={i} className="p-4 border rounded mb-4 bg-gray-50">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-medium">Position {i + 1}</h4>
                  {profile.work.length > 1 && (
                    <button
                      onClick={() => removeArrayItem('work', i)}
                      className="text-red-500 hover:bg-red-100 p-1 rounded"
                      disabled={isSaving}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <div className="space-y-3">
                  <input
                    type="text"
                    value={work.title}
                    onChange={(e) => updateArrayField('work', i, 'title', e.target.value)}
                    className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Job title"
                    disabled={isSaving}
                  />
                  <textarea
                    value={work.description}
                    onChange={(e) => updateArrayField('work', i, 'description', e.target.value)}
                    className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    rows="2"
                    placeholder="Job description"
                    disabled={isSaving}
                  />
                </div>
              </div>
            ))}
            <button
              onClick={() => addArrayItem('work', { title: '', description: '' })}
              className="flex items-center gap-2 px-3 py-2 text-blue-600 hover:bg-blue-50 rounded"
              disabled={isSaving}
            >
              <Plus className="w-4 h-4" /> Add Work Experience
            </button>
          </div>

          {/* Social Links */}
          <div>
            <label className="block font-medium mb-2">Social Links</label>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">GitHub</label>
                <input
                  type="url"
                  value={profile.links.github}
                  onChange={(e) => setProfile(prev => ({...prev, links: {...prev.links, github: e.target.value}}))}
                  className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="GitHub URL"
                  disabled={isSaving}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">LinkedIn</label>
                <input
                  type="url"
                  value={profile.links.linkedin}
                  onChange={(e) => setProfile(prev => ({...prev, links: {...prev.links, linkedin: e.target.value}}))}
                  className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="LinkedIn URL"
                  disabled={isSaving}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Portfolio</label>
                <input
                  type="url"
                  value={profile.links.portfolio}
                  onChange={(e) => setProfile(prev => ({...prev, links: {...prev.links, portfolio: e.target.value}}))}
                  className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Portfolio URL"
                  disabled={isSaving}
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-center pt-4">
            <button
              onClick={handleSubmit}
              disabled={isSaving}
              className={`px-8 py-3 font-medium rounded focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center gap-2 ${
                isSaving 
                  ? 'bg-gray-400 text-white cursor-not-allowed' 
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
              {isSaving ? 'Updating Profile...' : 'Update Profile'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
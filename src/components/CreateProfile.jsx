import React, { useState, useEffect } from 'react';
import { Plus, Trash2, User } from 'lucide-react';
import axios from 'axios';

export default function CreateProfile() {
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
  const [error, setError] = useState('');

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  // Check if user is authenticated on component mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please login first');
      window.location.href = '/auth';
      return;
    }

    // Optionally, pre-fill email from stored user data
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        if (user.email) {
          setProfile(prev => ({ ...prev, email: user.email }));
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, []);

  const updateField = (field, value) => {
    setProfile(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const updateArrayField = (field, index, key, value) => {
    const newArray = [...profile[field]];
    if (key) newArray[index] = { ...newArray[index], [key]: value };
    else newArray[index] = value;
    setProfile(prev => ({ ...prev, [field]: newArray }));
    if (error) setError('');
  };

  const addArrayItem = (field, defaultItem) => {
    setProfile(prev => ({ ...prev, [field]: [...prev[field], defaultItem] }));
  };

  const removeArrayItem = (field, index) => {
    if (profile[field].length > 1) {
      setProfile(prev => ({ ...prev, [field]: prev[field].filter((_, i) => i !== index) }));
    }
  };

  const validateProfile = () => {
    if (!profile.name || !profile.email || !profile.education) {
      setError('Please fill all required fields (Name, Email, Education)');
      return false;
    }

    // Validate that at least one skill is provided
    const validSkills = profile.skills.filter(skill => skill.trim());
    if (validSkills.length === 0) {
      setError('Please add at least one skill');
      return false;
    }

    // Validate that at least one project is provided with title and description
    const validProjects = profile.projects.filter(project => 
      project.title.trim() && project.description.trim()
    );
    if (validProjects.length === 0) {
      setError('Please add at least one project with title and description');
      return false;
    }

    // Validate that at least one work experience is provided with title and description
    const validWork = profile.work.filter(work => 
      work.title.trim() && work.description.trim()
    );
    if (validWork.length === 0) {
      setError('Please add at least one work experience with title and description');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateProfile()) {
      return;
    }

    setIsLoading(true);
    setError('');

    // Get token from localStorage
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Authentication required. Please login again.');
      setIsLoading(false);
      return;
    }

    try {
      // Filter out empty skills and prepare the data
      const profileData = {
        ...profile,
        skills: profile.skills.filter(skill => skill.trim()),
        projects: profile.projects.filter(project => 
          project.title.trim() || project.description.trim()
        ),
        work: profile.work.filter(work => 
          work.title.trim() || work.description.trim()
        )
      };

      // Make API call with Bearer token
      const response = await axios.post(
        `${apiUrl}/profiles/`, 
        profileData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Profile created:', response.data);
      alert('Profile created successfully!');
      
      // Redirect to dashboard or profile view
      window.location.href = '/dashboard';

    } catch (error) {
      console.error('Profile creation error:', error);
      
      // Handle different types of errors
      if (error.response) {
        if (error.response.status === 401) {
          setError('Session expired. Please login again.');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setTimeout(() => {
            window.location.href = '/auth';
          }, 2000);
        } else if (error.response.status === 400) {
          const errorMessage = error.response.data?.message || 
                             error.response.data?.error || 
                             'Invalid data provided';
          setError(errorMessage);
        } else {
          const errorMessage = error.response.data?.message || 
                             error.response.data?.error || 
                             `Server error: ${error.response.status}`;
          setError(errorMessage);
        }
      } else if (error.request) {
        setError('Network error. Please check your connection.');
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow p-6">
        <div className="flex items-center gap-2 mb-6">
          <User className="w-6 h-6 text-blue-600" />
          <h1 className="text-2xl font-bold">Create Profile</h1>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
            {error}
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
                required
              />
            </div>
            <div>
              <label className="block font-medium mb-2">Email *</label>
              <input
                type="email"
                value={profile.email}
                onChange={(e) => updateField('email', e.target.value)}
                className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Email address"
                required
              />
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
              required
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
                />
                {profile.skills.length > 1 && (
                  <button
                    onClick={() => removeArrayItem('skills', i)}
                    className="p-3 text-red-500 hover:bg-red-50 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
            <button
              onClick={() => addArrayItem('skills', '')}
              className="flex items-center gap-2 px-3 py-2 text-blue-600 hover:bg-blue-50 rounded"
            >
              <Plus className="w-4 h-4" /> Add Skill
            </button>
          </div>

          {/* Projects */}
          <div>
            <label className="block font-medium mb-2">Projects *</label>
            {profile.projects.map((project, i) => (
              <div key={i} className="p-4 border rounded mb-4 bg-gray-50">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-medium">Project {i + 1}</h4>
                  {profile.projects.length > 1 && (
                    <button
                      onClick={() => removeArrayItem('projects', i)}
                      className="text-red-500 hover:bg-red-100 p-1 rounded"
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
                  />
                  <textarea
                    value={project.description}
                    onChange={(e) => updateArrayField('projects', i, 'description', e.target.value)}
                    className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    rows="2"
                    placeholder="Project description"
                  />
                  <input
                    type="url"
                    value={project.link}
                    onChange={(e) => updateArrayField('projects', i, 'link', e.target.value)}
                    className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Project link (optional)"
                  />
                </div>
              </div>
            ))}
            <button
              onClick={() => addArrayItem('projects', { title: '', description: '', link: '' })}
              className="flex items-center gap-2 px-3 py-2 text-blue-600 hover:bg-blue-50 rounded"
            >
              <Plus className="w-4 h-4" /> Add Project
            </button>
          </div>

          {/* Work Experience */}
          <div>
            <label className="block font-medium mb-2">Work Experience *</label>
            {profile.work.map((work, i) => (
              <div key={i} className="p-4 border rounded mb-4 bg-gray-50">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-medium">Position {i + 1}</h4>
                  {profile.work.length > 1 && (
                    <button
                      onClick={() => removeArrayItem('work', i)}
                      className="text-red-500 hover:bg-red-100 p-1 rounded"
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
                  />
                  <textarea
                    value={work.description}
                    onChange={(e) => updateArrayField('work', i, 'description', e.target.value)}
                    className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    rows="2"
                    placeholder="Job description"
                  />
                </div>
              </div>
            ))}
            <button
              onClick={() => addArrayItem('work', { title: '', description: '' })}
              className="flex items-center gap-2 px-3 py-2 text-blue-600 hover:bg-blue-50 rounded"
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
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-center pt-4">
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="px-8 py-3 bg-blue-600 text-white font-medium rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
            >
              {isLoading ? 'Creating Profile...' : 'Create Profile'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
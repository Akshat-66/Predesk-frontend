import React, { useState } from 'react';
import { Plus, Trash2, User } from 'lucide-react';

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

  const handleSubmit = () => {
    if (!profile.name || !profile.email || !profile.education) {
      alert('Please fill required fields');
      return;
    }
    const filteredProfile = {
      ...profile,
      skills: profile.skills.filter(skill => skill.trim())
    };
    console.log('Profile:', JSON.stringify(filteredProfile, null, 2));
    alert('Profile created successfully!');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow p-6">
        <div className="flex items-center gap-2 mb-6">
          <User className="w-6 h-6 text-blue-600" />
          <h1 className="text-2xl font-bold">Create Profile</h1>
        </div>

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
              className="px-8 py-3 bg-blue-600 text-white font-medium rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Create Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
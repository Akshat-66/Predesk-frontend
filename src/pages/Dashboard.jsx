import React, { useState } from 'react';
import { Search, Edit, User, TrendingUp, ExternalLink, Github, Linkedin, Globe, Briefcase } from 'lucide-react';

const Dashboard = () => {
  // Sample data
  const profiles = [
    {
      id: 1,
      name: "Akshat Tripathi",
      email: "akshat122@example.com",
      education: "B.Tech CSE - IIIT Kottayam",
      skills: ["Node.js", "React", "MongoDB"],
      projects: [{ title: "Smart Parking System", description: "IoT and ML based parking solution", link: "https://github.com/akshat/smart-parking" }],
      work: [{ title: "Software Intern", description: "Worked on full-stack applications" }],
      links: { github: "https://github.com/akshat", linkedin: "https://linkedin.com/in/akshat", portfolio: "https://akshat.dev" }
    },
    {
      id: 2,
      name: "Priya Sharma",
      email: "priya@example.com",
      education: "M.Tech AI - IIT Delhi",
      skills: ["Python", "Machine Learning", "React", "Node.js"],
      projects: [{ title: "ML Image Classifier", description: "Deep learning based image classification", link: "https://github.com/priya/ml-classifier" }],
      work: [{ title: "ML Engineer", description: "Developed ML models" }],
      links: { github: "https://github.com/priya", linkedin: "https://linkedin.com/in/priya", portfolio: "https://priya.dev" }
    }
  ];

  const [currentUser] = useState(profiles[0]);
  const [skillSearch, setSkillSearch] = useState('');
  const [activeTab, setActiveTab] = useState('profiles');

  // Get top skills
  const getTopSkills = () => {
    const skillCount = {};
    profiles.forEach(p => p.skills.forEach(s => skillCount[s] = (skillCount[s] || 0) + 1));
    return Object.entries(skillCount).map(([skill, count]) => ({ _id: skill, count })).sort((a, b) => b.count - a.count);
  };

  // Search projects by skill
  const getProjectsBySkill = () => {
    if (!skillSearch.trim()) return [];
    return profiles
      .filter(p => p.skills.some(s => s.toLowerCase().includes(skillSearch.toLowerCase())))
      .map(p => ({
        name: p.name,
        email: p.email,
        projects: p.projects,
        work: p.work,
        matchingSkills: p.skills.filter(s => s.toLowerCase().includes(skillSearch.toLowerCase()))
      }));
  };

  const handleEdit = () => {
    window.location.href = '/edit';
  };

  const ProfileCard = ({ profile, isOwn = false }) => (
    <div className="bg-white rounded-lg shadow p-4 mb-4">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-semibold text-lg">{profile.name}</h3>
          <p className="text-sm text-gray-600">{profile.email}</p>
          <p className="text-sm text-gray-500">{profile.education}</p>
        </div>
        {isOwn && (
          <button onClick={handleEdit} className="p-2 text-blue-600 hover:bg-blue-50 rounded">
            <Edit className="w-4 h-4" />
          </button>
        )}
      </div>
      
      <div className="mb-3">
        <div className="flex flex-wrap gap-1">
          {profile.skills.map((skill, i) => (
            <span key={i} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">{skill}</span>
          ))}
        </div>
      </div>

      {/* Work Experience Section */}
      {profile.work && profile.work.length > 0 && (
        <div className="mb-3">
          <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
            <Briefcase className="w-4 h-4 mr-1" />
            Work Experience
          </h4>
          {profile.work.map((job, i) => (
            <div key={i} className="mb-2 pl-5 border-l-2 border-gray-200">
              <h5 className="text-sm font-medium text-gray-800">{job.title}</h5>
              <p className="text-xs text-gray-600">{job.description}</p>
            </div>
          ))}
        </div>
      )}

      {/* Projects Section */}
      <div className="mb-3">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Projects</h4>
        {profile.projects.map((project, i) => (
          <div key={i} className="mb-2 pl-5 border-l-2 border-blue-200">
            <h5 className="text-sm font-medium">{project.title}</h5>
            <p className="text-xs text-gray-600">{project.description}</p>
            <a href={project.link} className="text-xs text-blue-600 hover:underline flex items-center">
              <ExternalLink className="w-3 h-3 mr-1" /> View
            </a>
          </div>
        ))}
      </div>

      <div className="flex space-x-2">
        <a href={profile.links.github} className="text-gray-600"><Github className="w-4 h-4" /></a>
        <a href={profile.links.linkedin} className="text-gray-600"><Linkedin className="w-4 h-4" /></a>
        <a href={profile.links.portfolio} className="text-gray-600"><Globe className="w-4 h-4" /></a>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm p-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">Developer Dashboard</h1>
          <div className="flex space-x-2">
            {['profiles', 'my-profile', 'search', 'skills'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-2 rounded text-sm ${
                  activeTab === tab ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {tab === 'profiles' ? 'All Profiles' : 
                 tab === 'my-profile' ? 'My Profile' : 
                 tab === 'search' ? 'Search Projects' : 'Top Skills'}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4">
        {/* All Profiles Tab */}
        {activeTab === 'profiles' && (
          <div>
            <h2 className="text-lg font-semibold mb-4">All Profiles</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {profiles.map(profile => (
                <ProfileCard key={profile.id} profile={profile} />
              ))}
            </div>
          </div>
        )}

        {/* My Profile Tab */}
        {activeTab === 'my-profile' && (
          <div>
            <h2 className="text-lg font-semibold mb-4">My Profile</h2>
            <div className="max-w-md">
              <ProfileCard profile={currentUser} isOwn={true} />
            </div>
          </div>
        )}

        {/* Search Projects Tab */}
        {activeTab === 'search' && (
          <div>
            <h2 className="text-lg font-semibold mb-4">Search Projects by Skill</h2>
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search by skill..."
                  value={skillSearch}
                  onChange={(e) => setSkillSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            {getProjectsBySkill().map((result, i) => (
              <div key={i} className="bg-white rounded-lg shadow p-4 mb-4">
                <div className="flex items-center mb-3">
                  <User className="w-8 h-8 text-gray-600 mr-3" />
                  <div>
                    <h3 className="font-semibold">{result.name}</h3>
                    <p className="text-sm text-gray-600">{result.email}</p>
                  </div>
                </div>
                
                {/* Show matching skills */}
                <div className="mb-3">
                  <span className="text-sm text-gray-500 mr-2">Matching skills:</span>
                  <div className="flex flex-wrap gap-1">
                    {result.matchingSkills.map((skill, k) => (
                      <span key={k} className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Work Experience in Search Results */}
                {result.work && result.work.length > 0 && (
                  <div className="mb-3">
                    <h4 className="font-medium mb-2 flex items-center">
                      <Briefcase className="w-4 h-4 mr-1" />
                      Work Experience
                    </h4>
                    {result.work.map((job, j) => (
                      <div key={j} className="border-l-4 border-green-500 pl-3 mb-2">
                        <h5 className="font-medium text-sm">{job.title}</h5>
                        <p className="text-sm text-gray-600">{job.description}</p>
                      </div>
                    ))}
                  </div>
                )}

                <div>
                  <h4 className="font-medium mb-2">Projects</h4>
                  {result.projects.map((project, j) => (
                    <div key={j} className="border-l-4 border-blue-500 pl-3 mb-2">
                      <h5 className="font-medium">{project.title}</h5>
                      <p className="text-sm text-gray-600">{project.description}</p>
                      <a href={project.link} className="text-sm text-blue-600 hover:underline">
                        View Project
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Top Skills Tab */}
        {activeTab === 'skills' && (
          <div>
            <h2 className="text-lg font-semibold mb-4">Top Skills</h2>
            <div className="bg-white rounded-lg shadow p-4">
              {getTopSkills().map((skill, i) => (
                <div key={i} className="flex justify-between items-center py-2 border-b last:border-b-0">
                  <div className="flex items-center">
                    <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm mr-3">
                      {i + 1}
                    </span>
                    <span className="font-medium">{skill._id}</span>
                  </div>
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">{skill.count}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
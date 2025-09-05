import React, { useState, useEffect } from 'react';
import { Search, Edit, User, TrendingUp, ExternalLink, Github, Linkedin, Globe, Briefcase, Loader2, LogOut } from 'lucide-react';

const Dashboard = () => {
  const [profiles, setProfiles] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [skillSearch, setSkillSearch] = useState('');
  const [activeTab, setActiveTab] = useState('profiles');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

  // Function to get user email from URL params or localStorage
  const getUserEmail = () => {
    // First try to get from URL query params
    const urlParams = new URLSearchParams(window.location.search);
    const emailFromUrl = urlParams.get('email');
    
    if (emailFromUrl) {
      return emailFromUrl;
    }
    
    // If not in URL, get from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        return user.email;
      } catch (e) {
        console.error('Error parsing user data:', e);
        return null;
      }
    }
    
    return null;
  };

  // Logout function
  const handleLogout = () => {
    // Clear authentication data from localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Redirect to home page
    window.location.href = '/';
  };

  // Check authentication and get user email
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    console.log('Token from localStorage:', token);
    console.log('User data from localStorage:', userData);
    
    if (!token) {
      alert('Please login first');
      window.location.href = '/auth';
      return;
    }

    if (userData) {
      try {
        const user = JSON.parse(userData);
        console.log('Parsed user data:', user);
        console.log('User email:', user.email);
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }
  }, []);

  // Fetch all profiles
  const fetchAllProfiles = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      console.log('Making request to:', `${apiUrl}/profiles`);
      
      const response = await fetch(`${apiUrl}/profiles`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      console.log('All profiles response:', data);
      setProfiles(data);
    } catch (error) {
      console.error('Error fetching profiles:', error);
      if (error.message.includes('401')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/auth';
      } else {
        setError('Failed to load profiles');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch current user's profile
  const fetchCurrentUserProfile = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');
      
      console.log('Fetching current user profile...');
      console.log('Token:', token);
      console.log('User data from localStorage:', userData);
      
      if (!userData) {
        setError('User data not found. Please login again.');
        console.error('No user data in localStorage');
        return;
      }

      const user = JSON.parse(userData);
      console.log('Parsed user:', user);
      console.log('User email:', user.email);
      
      const profileUrl = `${apiUrl}/profiles/${user.email}`;
      console.log('Making request to:', profileUrl);
      
      const response = await fetch(profileUrl, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      console.log('Current user profile response:', data);
      setCurrentUser(data);
    } catch (error) {
      console.error('Error fetching current user profile:', error);
      
      if (error.message.includes('401')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/auth';
      } else if (error.message.includes('404')) {
        setError('Profile not found. Please create your profile first.');
      } else {
        setError('Failed to load your profile');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Load data based on active tab
  useEffect(() => {
    if (activeTab === 'profiles' || activeTab === 'search' || activeTab === 'skills') {
      fetchAllProfiles();
    } else if (activeTab === 'my-profile') {
      fetchCurrentUserProfile();
    }
  }, [activeTab]);

  // Get top skills from fetched profiles
  const getTopSkills = () => {
    const skillCount = {};
    profiles.forEach(p => {
      if (p.skills) {
        p.skills.forEach(s => skillCount[s] = (skillCount[s] || 0) + 1);
      }
    });
    return Object.entries(skillCount)
      .map(([skill, count]) => ({ _id: skill, count }))
      .sort((a, b) => b.count - a.count);
  };

  // Search projects by skill from fetched profiles
  const getProjectsBySkill = () => {
    if (!skillSearch.trim()) return [];
    return profiles
      .filter(p => p.skills && p.skills.some(s => 
        s.toLowerCase().includes(skillSearch.toLowerCase())
      ))
      .map(p => ({
        name: p.name,
        email: p.email,
        projects: p.projects || [],
        work: p.work || [],
        matchingSkills: p.skills.filter(s => 
          s.toLowerCase().includes(skillSearch.toLowerCase())
        )
      }));
  };

  const handleEdit = () => {
    const userEmail = getUserEmail();
    
    if (userEmail) {
      // Add email as query parameter to the edit URL
      console.log('Redirecting to edit page with email:', userEmail);
      window.location.href = `/edit?email=${encodeURIComponent(userEmail)}`;
    } else {
      console.error('Could not get user email for edit redirect');
      
      // Try to show more specific error messages
      const hasToken = localStorage.getItem('token');
      const hasUserData = localStorage.getItem('user');
      
      if (!hasToken) {
        alert('No authentication token found. Please login again.');
        window.location.href = '/auth';
      } else if (!hasUserData) {
        alert('User data not found. Please login again.');
        window.location.href = '/auth';
      } else {
        // If we have token and user data but no email, try to redirect to edit anyway
        // The edit page might handle the email extraction itself
        console.warn('Redirecting to edit page without email parameter');
        window.location.href = '/edit';
      }
    }
  };

  const handleCreateProfile = () => {
    const userEmail = getUserEmail();
    
    if (userEmail) {
      // Also add email to create URL if needed
      window.location.href = `/create?email=${encodeURIComponent(userEmail)}`;
    } else {
      window.location.href = '/create';
    }
  };

  // Get current user name for display
  const getCurrentUserName = () => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        return user.name || user.email;
      } catch (e) {
        console.error('Error parsing user data:', e);
        return null;
      }
    }
    return null;
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
          {profile.skills && profile.skills.map((skill, i) => (
            <span key={i} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
              {skill}
            </span>
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
            <div key={job._id || i} className="mb-2 pl-5 border-l-2 border-gray-200">
              <h5 className="text-sm font-medium text-gray-800">{job.title}</h5>
              <p className="text-xs text-gray-600">{job.description}</p>
            </div>
          ))}
        </div>
      )}

      {/* Projects Section */}
      {profile.projects && profile.projects.length > 0 && (
        <div className="mb-3">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Projects</h4>
          {profile.projects.map((project, i) => (
            <div key={project._id || i} className="mb-2 pl-5 border-l-2 border-blue-200">
              <h5 className="text-sm font-medium">{project.title}</h5>
              <p className="text-xs text-gray-600">{project.description}</p>
              {project.link && (
                <a 
                  href={project.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:underline flex items-center"
                >
                  <ExternalLink className="w-3 h-3 mr-1" /> View
                </a>
              )}
            </div>
          ))}
        </div>
      )}

      {profile.links && (
        <div className="flex space-x-2">
          {profile.links.github && (
            <a 
              href={profile.links.github} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-gray-800"
            >
              <Github className="w-4 h-4" />
            </a>
          )}
          {profile.links.linkedin && (
            <a 
              href={profile.links.linkedin} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-gray-800"
            >
              <Linkedin className="w-4 h-4" />
            </a>
          )}
          {profile.links.portfolio && (
            <a 
              href={profile.links.portfolio} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-gray-800"
            >
              <Globe className="w-4 h-4" />
            </a>
          )}
        </div>
      )}
    </div>
  );

  const LoadingSpinner = () => (
    <div className="flex justify-center items-center py-8">
      <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      <span className="ml-2 text-gray-600">Loading...</span>
    </div>
  );

  const ErrorMessage = ({ message, showCreateButton = false }) => (
    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
      <p>{message}</p>
      {showCreateButton && (
        <button
          onClick={handleCreateProfile}
          className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Create Profile
        </button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm p-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">Developer Dashboard</h1>
          
          {/* Navigation and Logout */}
          <div className="flex items-center space-x-2">
            {/* Navigation tabs */}
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
            
            {/* User info and logout */}
            <div className="flex items-center space-x-2 ml-4 pl-4 border-l border-gray-200">
              {getCurrentUserName() && (
                <span className="text-sm text-gray-600 hidden sm:inline">
                  Welcome, {getCurrentUserName()}
                </span>
              )}
              <button
                onClick={handleLogout}
                className="flex items-center space-x-1 px-3 py-2 text-sm text-red-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4">
        {/* Error Display */}
        {error && (
          <ErrorMessage 
            message={error} 
            showCreateButton={activeTab === 'my-profile' && error.includes('not found')}
          />
        )}

        {/* All Profiles Tab */}
        {activeTab === 'profiles' && (
          <div>
            <h2 className="text-lg font-semibold mb-4">All Profiles</h2>
            {isLoading ? (
              <LoadingSpinner />
            ) : profiles.length === 0 ? (
              <p className="text-gray-600">No profiles found.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {profiles.map(profile => (
                  <ProfileCard key={profile._id} profile={profile} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* My Profile Tab */}
        {activeTab === 'my-profile' && (
          <div>
            <h2 className="text-lg font-semibold mb-4">My Profile</h2>
            {isLoading ? (
              <LoadingSpinner />
            ) : currentUser ? (
              <div className="max-w-md">
                <ProfileCard profile={currentUser} isOwn={true} />
              </div>
            ) : !error && (
              <p className="text-gray-600">Profile not found.</p>
            )}
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
            
            {isLoading ? (
              <LoadingSpinner />
            ) : skillSearch.trim() ? (
              getProjectsBySkill().length === 0 ? (
                <p className="text-gray-600">No profiles found with skill "{skillSearch}".</p>
              ) : (
                getProjectsBySkill().map((result, i) => (
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
                          <div key={job._id || j} className="border-l-4 border-green-500 pl-3 mb-2">
                            <h5 className="font-medium text-sm">{job.title}</h5>
                            <p className="text-sm text-gray-600">{job.description}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {result.projects && result.projects.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">Projects</h4>
                        {result.projects.map((project, j) => (
                          <div key={project._id || j} className="border-l-4 border-blue-500 pl-3 mb-2">
                            <h5 className="font-medium">{project.title}</h5>
                            <p className="text-sm text-gray-600">{project.description}</p>
                            {project.link && (
                              <a 
                                href={project.link} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-sm text-blue-600 hover:underline"
                              >
                                View Project
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )
            ) : (
              <p className="text-gray-600">Enter a skill to search for projects.</p>
            )}
          </div>
        )}

        {/* Top Skills Tab */}
        {activeTab === 'skills' && (
          <div>
            <h2 className="text-lg font-semibold mb-4">Top Skills</h2>
            {isLoading ? (
              <LoadingSpinner />
            ) : (
              <div className="bg-white rounded-lg shadow p-4">
                {getTopSkills().length === 0 ? (
                  <div className="text-center py-8">
                    <TrendingUp className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600 text-lg">No skills data available</p>
                    <p className="text-gray-500 text-sm">Skills will appear here once developers create profiles</p>
                  </div>
                ) : (
                  getTopSkills().map((skill, i) => (
                    <div key={i} className="flex justify-between items-center py-2 border-b last:border-b-0">
                      <div className="flex items-center">
                        <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm mr-3">
                          {i + 1}
                        </span>
                        <span className="font-medium">{skill._id}</span>
                      </div>
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">{skill.count}</span>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useGetProfileQuery, useUpdateProfileMutation } from "@/features/career/careerApi";
import { useUpdateUserProfileMutation } from "@/features/auth/authApi";
import { Button } from "@/shared/ui/button";
import { toast } from "sonner";
import { Skeleton } from "@/shared/ui/skeleton";
import { User, Briefcase, Brain, Clock, Settings2, Save, Mail, UserCircle } from "lucide-react";

function Settings() {
  const { user } = useSelector((state) => state.auth);
  const { data: profileRes, isLoading, refetch } = useGetProfileQuery();
  
  const [updateCareerProfile, { isLoading: isUpdatingCareer }] = useUpdateProfileMutation();
  const [updateUserProfile, { isLoading: isUpdatingUser }] = useUpdateUserProfileMutation();
  
  const profile = profileRes?.data?.profile;
  const baseRole = user?.primaryType?.toLowerCase() || user?.role?.toLowerCase();
  const isInstructor = baseRole === "instructor" || (baseRole === "user" && user?.capabilities?.canTeach);
  const showCareerTab = !isInstructor && baseRole !== "admin";

  const [activeTab, setActiveTab] = useState("general");

  const [generalData, setGeneralData] = useState({
    name: "",
  });
  
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);

  const [careerData, setCareerData] = useState({
    dreamRole: "",
    currentLevel: "beginner",
    preferredLearningStyle: "mixed",
    targetTimelineMonths: 6,
  });

  useEffect(() => {
    if (user) {
      setGeneralData({
        name: user.name || "",
      });
    }
  }, [user]);

  useEffect(() => {
    if (profile) {
      setCareerData({
        dreamRole: profile.dreamRole || "",
        currentLevel: profile.currentLevel || "beginner",
        preferredLearningStyle: profile.preferredLearningStyle || "mixed",
        targetTimelineMonths: profile.targetTimelineMonths || 6,
      });
    }
  }, [profile]);

  const handleGeneralChange = (e) => {
    const { name, value } = e.target;
    setGeneralData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCareerChange = (e) => {
    const { name, value, type } = e.target;
    setCareerData((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
    }));
  };

  const handleGeneralSubmit = async (e) => {
    e.preventDefault();
    try {
      let payload = generalData;

      if (avatarFile) {
        payload = new FormData();
        payload.append("name", generalData.name);
        payload.append("avatar", avatarFile);
      }

      await updateUserProfile(payload).unwrap();
      toast.success("Account details updated successfully!");
      setAvatarFile(null); // Reset after successful upload
    } catch (error) {
      toast.error(error?.data?.message || "Failed to update account details");
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCareerSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateCareerProfile(careerData).unwrap();
      toast.success("Career preferences updated successfully!");
      refetch();
    } catch (error) {
      toast.error(error?.data?.message || "Failed to update career preferences");
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 md:p-10 space-y-6 max-w-4xl mx-auto">
        <Skeleton className="h-12 w-1/3 bg-muted/50 rounded-2xl mb-10" />
        <Skeleton className="h-96 w-full rounded-[2.5rem] bg-muted/50" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 lg:p-12 pb-24 max-w-4xl mx-auto space-y-10">
      
      {/* Header section */}
      <div className="flex items-center gap-4 border-b border-border/50 pb-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary box-glow">
          <Settings2 className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-4xl font-semibold tracking-tight text-foreground">Settings</h1>
          <p className="text-muted-foreground font-light mt-1">Manage your account and career objectives</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-6 border-b border-border/50 pb-px overflow-x-auto no-scrollbar">
        <button 
          onClick={() => setActiveTab("general")}
          className={`pb-4 px-2 text-sm font-semibold tracking-wide whitespace-nowrap transition-all border-b-2 ${activeTab === "general" ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}
        >
          Account Details
        </button>
        {showCareerTab && (
          <button 
            onClick={() => setActiveTab("career")}
            className={`pb-4 px-2 text-sm font-semibold tracking-wide whitespace-nowrap transition-all border-b-2 ${activeTab === "career" ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}
          >
            Career Preferences
          </button>
        )}
      </div>

      {/* Settings Form Container */}
      <div className="rounded-[2rem] bg-card/60 backdrop-blur-xl p-8 md:p-10 shadow-lg border border-border/50 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none transition-opacity">
          {activeTab === "general" ? (
             <UserCircle size={200} strokeWidth={0.5} className="text-primary rotate-12 -translate-y-8 translate-x-8" />
          ) : (
             <Briefcase size={200} strokeWidth={0.5} className="text-primary rotate-12 -translate-y-8 translate-x-8" />
          )}
        </div>

        {activeTab === "general" ? (
          <form onSubmit={handleGeneralSubmit} className="relative z-10 space-y-8">
            <div className="space-y-8">
              
              <div className="flex items-center gap-6 pb-8 border-b border-border/50">
                <div className="relative group/avatar cursor-pointer h-24 w-24 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-4xl font-bold text-primary overflow-hidden shadow-sm">
                  {avatarPreview || user?.avatar ? (
                    <img src={avatarPreview || user.avatar} alt="Avatar" className="h-full w-full object-cover" />
                  ) : (
                    user?.name?.charAt(0).toUpperCase() || "U"
                  )}
                  
                  {/* Upload Overlay */}
                  <label htmlFor="avatar-upload" className="absolute inset-0 bg-background/60 backdrop-blur-sm opacity-0 group-hover/avatar:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                    <span className="text-xs font-medium text-foreground">Change</span>
                  </label>
                  <input 
                    id="avatar-upload" 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={handleAvatarChange} 
                  />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-foreground">Profile Picture</h3>
                  <p className="text-sm text-muted-foreground mt-1">Click the avatar to upload a new profile picture.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Full Name */}
                <div className="space-y-3">
                  <label htmlFor="name" className="flex items-center text-sm font-medium text-foreground">
                    <User className="w-4 h-4 mr-2 text-primary" />
                    Full Name
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={generalData.name}
                    onChange={handleGeneralChange}
                    placeholder="Enter your full name"
                    className="w-full rounded-2xl border border-border bg-background px-4 py-3.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all shadow-sm"
                    required
                  />
                </div>

                {/* Email Address */}
                <div className="space-y-3">
                  <label htmlFor="email" className="flex items-center text-sm font-medium text-foreground">
                    <Mail className="w-4 h-4 mr-2 text-primary" />
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={user?.email || ""}
                    disabled
                    className="w-full rounded-2xl border border-border/50 bg-muted/50 text-muted-foreground px-4 py-3.5 text-sm cursor-not-allowed"
                  />
                  <p className="text-xs text-muted-foreground">Email addresses cannot be changed currently.</p>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-border/50 flex justify-end">
              <Button
                type="submit"
                disabled={isUpdatingUser}
                className="rounded-full px-8 h-12 font-medium bg-primary text-primary-foreground hover:bg-primary/90 shadow-md box-glow transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {isUpdatingUser ? "Saving..." : (
                  <>
                    <Save className="w-4 h-4" /> Save Account
                  </>
                )}
              </Button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleCareerSubmit} className="relative z-10 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Dream Role */}
              <div className="space-y-3">
                <label htmlFor="dreamRole" className="flex items-center text-sm font-medium text-foreground">
                  <Briefcase className="w-4 h-4 mr-2 text-primary" />
                  Dream Role
                </label>
                <input
                  id="dreamRole"
                  name="dreamRole"
                  type="text"
                  value={careerData.dreamRole}
                  onChange={handleCareerChange}
                  placeholder="e.g. Senior Frontend Developer"
                  className="w-full rounded-2xl border border-border bg-background px-4 py-3.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all shadow-sm"
                  required
                />
                <p className="text-xs text-muted-foreground">What specific role are you aiming for?</p>
              </div>

              {/* Current Level */}
              <div className="space-y-3">
                <label htmlFor="currentLevel" className="flex items-center text-sm font-medium text-foreground">
                  <Brain className="w-4 h-4 mr-2 text-primary" />
                  Current Level
                </label>
                <select
                  id="currentLevel"
                  name="currentLevel"
                  value={careerData.currentLevel}
                  onChange={handleCareerChange}
                  className="w-full rounded-2xl border border-border bg-background px-4 py-3.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all shadow-sm appearance-none"
                >
                  <option value="beginner">Beginner (0-1 years)</option>
                  <option value="intermediate">Intermediate (1-3 years)</option>
                  <option value="advanced">Advanced (3+ years)</option>
                </select>
              </div>

              {/* Learning Style */}
              <div className="space-y-3">
                <label htmlFor="preferredLearningStyle" className="flex items-center text-sm font-medium text-foreground">
                  <User className="w-4 h-4 mr-2 text-primary" />
                  Preferred Learning Style
                </label>
                <select
                  id="preferredLearningStyle"
                  name="preferredLearningStyle"
                  value={careerData.preferredLearningStyle}
                  onChange={handleCareerChange}
                  className="w-full rounded-2xl border border-border bg-background px-4 py-3.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all shadow-sm appearance-none"
                >
                  <option value="mixed">Mixed (All types)</option>
                  <option value="visual">Visual (Video-heavy)</option>
                  <option value="hands-on">Hands-on (Interactive)</option>
                  <option value="reading">Reading (Documentation)</option>
                </select>
              </div>

              {/* Target Timeline */}
              <div className="space-y-3">
                <label htmlFor="targetTimelineMonths" className="flex items-center text-sm font-medium text-foreground">
                  <Clock className="w-4 h-4 mr-2 text-primary" />
                  Target Timeline (Months)
                </label>
                <input
                  id="targetTimelineMonths"
                  name="targetTimelineMonths"
                  type="number"
                  min="1"
                  max="60"
                  value={careerData.targetTimelineMonths}
                  onChange={handleCareerChange}
                  className="w-full rounded-2xl border border-border bg-background px-4 py-3.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all shadow-sm"
                  required
                />
                <p className="text-xs text-muted-foreground">How long do you have to prepare?</p>
              </div>

            </div>

            <div className="pt-6 border-t border-border/50 flex justify-end">
              <Button
                type="submit"
                disabled={isUpdatingCareer}
                className="rounded-full px-8 h-12 font-medium bg-primary text-primary-foreground hover:bg-primary/90 shadow-md box-glow transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {isUpdatingCareer ? "Saving..." : (
                  <>
                    <Save className="w-4 h-4" /> Save Career Data
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default Settings;

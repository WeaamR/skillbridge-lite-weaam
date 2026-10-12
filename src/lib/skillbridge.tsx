import { createContext, useContext, useState, type ReactNode } from "react";

export type Profile = {
  name: string;
  headline: string;
  about: string;
  skills: string;
  projects: string;
  experience: string;
};

export type Opportunity = {
  id: string;
  title: string;
  company: string;
  description: string;
  skills: string[];
  responsibilities: string[];
};

export const OPPORTUNITIES: Opportunity[] = [
  {
    id: "ai-automation-intern",
    title: "AI Automation Intern",
    company: "TechFlow",
    description:
      "Support development of AI-powered workflows and automation solutions for business processes.",
    skills: ["Python", "AI", "Automation", "APIs"],
    responsibilities: [
      "Help design and test automated workflows",
      "Integrate AI services through APIs",
      "Document processes and automation results",
    ],
  },
  {
    id: "junior-frontend-developer",
    title: "Junior Frontend Developer",
    company: "PixelWorks",
    description: "Help build responsive web interfaces and interactive user experiences.",
    skills: ["HTML", "CSS", "JavaScript", "React"],
    responsibilities: [
      "Build responsive UI components",
      "Collaborate with designers on interactions",
      "Fix layout and accessibility issues",
    ],
  },
  {
    id: "iot-solutions-engineer",
    title: "IoT Solutions Engineer",
    company: "Connected Systems Lab",
    description:
      "Support development of connected systems using sensors, microcontrollers, and software.",
    skills: ["IoT", "Python", "ESP32", "APIs"],
    responsibilities: [
      "Prototype sensor-based devices with ESP32",
      "Write software to collect and send device data",
      "Test and troubleshoot connected systems",
    ],
  },
];

export const SAMPLE_PROFILE: Profile = {
  name: "Sample Student",
  headline: "Computer science student interested in software and automation",
  about: "This is a sample profile for demonstration. Replace it with your own information.",
  skills: "Python, HTML, CSS, Git",
  projects: "Sample project: a small weather dashboard built with Python and a public API.",
  experience: "Sample experience: university coursework and a group software project.",
};

type Ctx = {
  profile: Profile;
  isSample: boolean;
  saveProfile: (p: Profile) => void;
};

const ProfileContext = createContext<Ctx | null>(null);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  return (
    <ProfileContext.Provider
      value={{
        profile: profile ?? SAMPLE_PROFILE,
        isSample: profile === null,
        saveProfile: setProfile,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const c = useContext(ProfileContext);
  if (!c) throw new Error("useProfile must be inside ProfileProvider");
  return c;
}

/** Real AI is only "available" when a service has been configured. None is configured. */
export const AI_SERVICE_CONFIGURED = false;

export function hasEnoughData(p: Profile) {
  return p.skills.trim().length > 0 && (p.projects.trim() || p.experience.trim()).length > 0;
}

/** Simple keyword overlap used ONLY for the clearly labeled demonstration preview. */
export function demoPreview(p: Profile, o: Opportunity) {
  const text = `${p.skills} ${p.projects} ${p.experience}`.toLowerCase();
  const relevant = o.skills.filter((s) => text.includes(s.toLowerCase()));
  const gaps = o.skills.filter((s) => !relevant.includes(s));
  const steps = gaps.map((g) => `Build a small project that uses ${g} and add it to your profile.`);
  return { relevant, gaps, steps };
}

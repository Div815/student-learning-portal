import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, BookOpen, ExternalLink } from "lucide-react";
import { toast } from "sonner";

type Course = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
};

type Resource = {
  title: string;
  url: string;
  description: string;
};

const courseResources: Record<string, Resource[]> = {
  python: [
    { title: "Python.org Official Tutorial", url: "https://docs.python.org/3/tutorial/", description: "The official Python tutorial from python.org" },
    { title: "Real Python", url: "https://realpython.com/", description: "Comprehensive Python tutorials and articles" },
    { title: "Python for Everybody (Coursera)", url: "https://www.coursera.org/specializations/python", description: "Free course by Dr. Charles Severance" },
  ],
  c: [
    { title: "Learn-C.org", url: "https://www.learn-c.org/", description: "Interactive C programming tutorial" },
    { title: "C Programming - GeeksforGeeks", url: "https://www.geeksforgeeks.org/c-programming-language/", description: "Comprehensive C tutorials and examples" },
    { title: "CS50 - Harvard", url: "https://cs50.harvard.edu/x/", description: "Harvard's introduction to computer science" },
  ],
  java: [
    { title: "Oracle Java Tutorials", url: "https://docs.oracle.com/javase/tutorial/", description: "Official Java documentation and tutorials" },
    { title: "Java Programming - MOOC.fi", url: "https://java-programming.mooc.fi/", description: "Free Java course from University of Helsinki" },
    { title: "Java - W3Schools", url: "https://www.w3schools.com/java/", description: "Interactive Java tutorial with examples" },
  ],
  html: [
    { title: "MDN Web Docs - HTML", url: "https://developer.mozilla.org/en-US/docs/Web/HTML", description: "Comprehensive HTML documentation" },
    { title: "W3Schools HTML Tutorial", url: "https://www.w3schools.com/html/", description: "Beginner-friendly HTML tutorial" },
    { title: "FreeCodeCamp", url: "https://www.freecodecamp.org/", description: "Free interactive HTML & web dev course" },
  ],
  css: [
    { title: "MDN Web Docs - CSS", url: "https://developer.mozilla.org/en-US/docs/Web/CSS", description: "Complete CSS reference and tutorials" },
    { title: "CSS-Tricks", url: "https://css-tricks.com/", description: "Tips, tricks, and techniques on CSS" },
    { title: "Flexbox Froggy", url: "https://flexboxfroggy.com/", description: "Learn CSS Flexbox through a game" },
  ],
  javascript: [
    { title: "MDN JavaScript Guide", url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide", description: "Comprehensive JavaScript documentation" },
    { title: "JavaScript.info", url: "https://javascript.info/", description: "Modern JavaScript tutorial" },
    { title: "Eloquent JavaScript", url: "https://eloquentjavascript.net/", description: "Free online book about JavaScript" },
  ],
  dsa: [
    { title: "GeeksforGeeks DSA", url: "https://www.geeksforgeeks.org/data-structures/", description: "Complete DSA tutorial and practice" },
    { title: "LeetCode", url: "https://leetcode.com/", description: "Practice coding problems and algorithms" },
    { title: "Algorithms - Princeton", url: "https://www.coursera.org/learn/algorithms-part1", description: "Free algorithms course on Coursera" },
  ],
  cpp: [
    { title: "LearnCpp.com", url: "https://www.learncpp.com/", description: "Free comprehensive C++ tutorial" },
    { title: "C++ Reference", url: "https://en.cppreference.com/", description: "Complete C++ language reference" },
    { title: "C++ - GeeksforGeeks", url: "https://www.geeksforgeeks.org/c-plus-plus/", description: "C++ tutorials and practice problems" },
  ],
  react: [
    { title: "React Official Docs", url: "https://react.dev/", description: "Official React documentation and tutorial" },
    { title: "React Tutorial - Scrimba", url: "https://scrimba.com/learn/learnreact", description: "Interactive React course" },
    { title: "Full Stack Open", url: "https://fullstackopen.com/", description: "Deep dive into modern web development" },
  ],
};

export default function CoursePage() {
  const { slug } = useParams<{ slug: string }>();
  const [course, setCourse] = useState<Course | null>(null);
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }
      setUser(user);
    };

    getUser();
  }, [navigate]);

  useEffect(() => {
    const fetchCourse = async () => {
      if (!slug) return;

      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .eq("slug", slug)
        .single();

      if (error) {
        toast.error("Course not found");
        navigate("/home");
      } else {
        setCourse(data);
      }
    };

    fetchCourse();
  }, [slug, navigate]);

  const handleEnroll = async (resourceTitle: string) => {
    if (!user || !course) return;

    try {
      const { error } = await supabase
        .from("enrollments")
        .insert({ user_id: user.id, course_id: course.id });

      if (error) {
        if (error.code === "23505") {
          toast.info("You're already enrolled in this course!");
        } else {
          throw error;
        }
      } else {
        toast.success(`Enrolled in ${course.name}!`);
      }
    } catch (error: any) {
      toast.error("Failed to enroll in course");
    }
  };

  if (!course) return null;

  const resources = courseResources[slug || ""] || [];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/home")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold text-foreground">{course.name}</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12 animate-fade-in">
            <h2 className="text-4xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
              {course.name} Resources
            </h2>
            <p className="text-muted-foreground text-lg">
              {course.description || "Curated learning resources to master this course"}
            </p>
          </div>

          <div className="space-y-4">
            {resources.map((resource, index) => (
              <Card
                key={index}
                className="hover:shadow-medium transition-all duration-300 hover:-translate-y-1 animate-slide-up border-0 shadow-soft"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{resource.title}</span>
                    <ExternalLink className="h-5 w-5 text-muted-foreground" />
                  </CardTitle>
                  <CardDescription>{resource.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Button
                      asChild
                      variant="outline"
                      className="flex-1 border-primary text-primary hover:bg-primary/10"
                    >
                      <a href={resource.url} target="_blank" rel="noopener noreferrer">
                        Visit Resource
                      </a>
                    </Button>
                    <Button
                      onClick={() => handleEnroll(resource.title)}
                      className="flex-1 bg-gradient-primary hover:opacity-90 transition-opacity"
                    >
                      Enroll
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-8 text-center">
            <Button
              variant="outline"
              onClick={() => navigate("/dashboard")}
              className="border-primary text-primary hover:bg-primary/10"
            >
              View Your Dashboard
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}

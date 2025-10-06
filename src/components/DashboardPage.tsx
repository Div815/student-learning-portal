import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ArrowLeft, BookOpen, User, Mail, Calendar, GraduationCap } from "lucide-react";
import * as LucideIcons from "lucide-react";

type EnrolledCourse = {
  id: string;
  enrolled_at: string;
  courses: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    icon: string | null;
    color: string | null;
  };
};

export default function DashboardPage() {
  const [profile, setProfile] = useState<any>(null);
  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const getProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      setProfile(profileData);

      const { data: enrollments } = await supabase
        .from("enrollments")
        .select(`
          id,
          enrolled_at,
          courses (
            id,
            name,
            slug,
            description,
            icon,
            color
          )
        `)
        .eq("user_id", user.id)
        .order("enrolled_at", { ascending: false });

      setEnrolledCourses(enrollments || []);
    };

    getProfile();
  }, [navigate]);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const getIcon = (iconName: string | null) => {
    if (!iconName) return BookOpen;
    const Icon = (LucideIcons as any)[iconName];
    return Icon || BookOpen;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (!profile) return null;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/home")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold text-foreground">My Dashboard</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <Card className="mb-8 shadow-medium border-0 animate-fade-in">
            <CardHeader>
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarFallback className="bg-gradient-primary text-white text-2xl">
                    {profile.full_name ? getInitials(profile.full_name) : <User className="h-10 w-10" />}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-3xl mb-2">
                    {profile.full_name || "Student"}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    {profile.email}
                  </CardDescription>
                  <CardDescription className="flex items-center gap-2 mt-1">
                    <Calendar className="h-4 w-4" />
                    Member since {formatDate(profile.created_at)}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>

          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-4">
              Enrolled Courses ({enrolledCourses.length})
            </h2>
          </div>

          {enrolledCourses.length === 0 ? (
            <Card className="p-12 text-center shadow-soft border-0">
              <BookOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">No courses enrolled yet</h3>
              <p className="text-muted-foreground mb-6">
                Start your learning journey by enrolling in a course
              </p>
              <Button
                onClick={() => navigate("/home")}
                className="bg-gradient-primary hover:opacity-90 transition-opacity"
              >
                Browse Courses
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {enrolledCourses.map((enrollment, index) => {
                const Icon = getIcon(enrollment.courses.icon);
                return (
                  <Card
                    key={enrollment.id}
                    className="hover:shadow-medium transition-all duration-300 hover:-translate-y-1 animate-slide-up border-0 shadow-soft bg-gradient-card cursor-pointer"
                    style={{ animationDelay: `${index * 50}ms` }}
                    onClick={() => navigate(`/course/${enrollment.courses.slug}`)}
                  >
                    <CardHeader>
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${enrollment.courses.color || 'from-primary to-primary-dark'} flex items-center justify-center mb-3`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <CardTitle className="text-xl">{enrollment.courses.name}</CardTitle>
                      <CardDescription className="line-clamp-2">
                        {enrollment.courses.description || "Continue your learning journey"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Enrolled on {formatDate(enrollment.enrolled_at)}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

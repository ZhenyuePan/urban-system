import Image from 'next/image'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Github, Linkedin, Mail } from 'lucide-react'
import Navbar from '@/components/navbar'
export default function About() {
  return (
    <div className="container mx-auto px-4 py-8 ">
      <Navbar />
    
      <Card className="max-w-2xl mx-auto">
        <CardContent className="p-6">
          <div className="flex flex-col items-center mb-6">
            <Image
              src="/profile.jpg?height=150&width=150"
              alt="my profile"
              width={150}
              height={150}
              className="rounded-full border-4 border-primary"
              priority
            />
            <h1 className="text-3xl font-bold mt-4">Kafka</h1>
            <p className="text-xl text-muted-foreground">Master / Harbin Institute of Technology</p>
          </div>
          
          <div className="space-y-4">
            <p className="text-lg">
              Welcome to my about page! I&apos;m a passionate [your profession/interest] with [X] years of experience in [your field]. 
              I specialize in [your key skills or areas of expertise].
            </p>
            
            <p className="text-lg">
              When I&apos;m not [working/studying], you can find me [your hobbies or interests]. 
              I&apos;m always eager to learn new things and take on challenging projects.
            </p>
            
            <h2 className="text-2xl font-semibold mt-6 mb-2">Skills</h2>
            <ul className="list-disc list-inside space-y-1">
              <li>Skill 1</li>
              <li>Skill 2</li>
              <li>Skill 3</li>
              <li>Skill 4</li>
            </ul>
            
            <h2 className="text-2xl font-semibold mt-6 mb-2">Contact Me</h2>
            <div className="flex space-x-4">
              <Button variant="outline" size="icon">
                <a href="https://github.com/yourusername" target="_blank" rel="noopener noreferrer" aria-label="GitHub Profile">
                  <Github className="h-5 w-5" />
                </a>
              </Button>
              <Button variant="outline" size="icon">
                <a href="https://linkedin.com/in/yourusername" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn Profile">
                  <Linkedin className="h-5 w-5" />
                </a>
              </Button>
              <Button variant="outline" size="icon">
                <a href="mailto:your.email@example.com" aria-label="Email Me">
                  <Mail className="h-5 w-5" />
                </a>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
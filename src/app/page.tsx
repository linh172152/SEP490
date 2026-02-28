import { Header } from '@/components/landing/Header';
import { Hero } from '@/components/landing/Hero';
import { Features } from '@/components/landing/Features';
import { RoleShowcase } from '@/components/landing/RoleShowcase';
import { RobotVisualization } from '@/components/landing/RobotVisualization';
import { Footer } from '@/components/landing/Footer';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1">
        <Hero />
        <Features />
        <RoleShowcase />
        <RobotVisualization />
      </main>
      <Footer />
    </div>
  );
}

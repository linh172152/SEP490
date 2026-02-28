import { Hero } from '@/components/landing/Hero';
import { Features } from '@/components/landing/Features';
import { RoleShowcase } from '@/components/landing/RoleShowcase';
import { RobotVisualization } from '@/components/landing/RobotVisualization';

export default function Home() {
  return (
    <>
      <Hero />
      <Features />
      <RoleShowcase />
      <RobotVisualization />
    </>
  );
}

